#!/usr/bin/env python3
"""Genera el artefacto SQL de M007 desde la BD viva (solo lectura).

M007: sincronizacion usuarios.nivel := cargos_manual.nivel via vinculo
vigente (usuario_cargo_manual.vigente=1). Poblacion A canonica esperada:
25 usuarios (24 asistencial->tecnico + 1 directivo->profesional).
Poblacion B (sin vinculo vigente): FUERA de alcance por diseno.

NO ejecuta nada sobre edl_carepa. Emite:
  database/migrations/M007_sync_usuarios_nivel.sql
y valida la poblacion antes de emitir una sola linea de SQL.
"""
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / 'database' / 'migrations' / 'M007_sync_usuarios_nivel.sql'
TOTAL_ESPERADO = 25
DISTRIBUCION_ESPERADA = {('asistencial', 'tecnico'): 24,
                         ('directivo', 'profesional'): 1}

SQL_CANONICO = (
    "SELECT u.id, u.documento, u.estado, ucm.id AS vinculo_id, "
    "cm.id AS cargo_id, cm.codigo, cm.grado, cm.planta, cm.num_cargos, "
    "u.nivel AS nivel_actual, cm.nivel AS nivel_esperado, "
    "cm.eliminado_en IS NOT NULL AS cargo_muerto "
    "FROM usuarios u "
    "JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1 "
    "JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id AND cm.eliminado_en IS NULL "
    "WHERE u.eliminado_en IS NULL AND NOT(u.nivel<=>cm.nivel) "
    "ORDER BY cm.codigo, u.id")


def mysql(sql):
    out = subprocess.run(['mariadb', '-u', 'root', '-N', '-B', 'edl_carepa',
                          '-e', sql], capture_output=True, text=True,
                         check=True).stdout
    return [tuple(line.split('\t')) for line in out.splitlines() if line]


def canonica():
    filas = []
    for (uid, doc, estado, vid, cid, ccod, cgra, planta, ncar,
         nact, nespe, muerto) in mysql(SQL_CANONICO):
        filas.append({
            'usuario_id': int(uid), 'documento': doc, 'estado_usuario': estado,
            'vinculo_id': int(vid), 'vigente': True,
            'cargo_id': int(cid), 'codigo': ccod, 'grado': cgra,
            'planta': planta, 'num_cargos': int(ncar),
            'nivel_actual': None if nact == 'NULL' else nact,
            'nivel_esperado': nespe,
            'cargo_eliminado': bool(int(muerto)),
        })
    return filas


def validar_poblacion(filas):
    """Determinista: aborta ante CUALQUIER desviacion del scope aprobado.

    Retorna lista de errores (vacia = poblacion valida). Funcion pura.
    """
    errores = []
    if len(filas) != TOTAL_ESPERADO:
        errores.append(f'P-POBLACION: {len(filas)} filas != {TOTAL_ESPERADO}')
    dist = {}
    for f in filas:
        clave = (f['nivel_actual'], f['nivel_esperado'])
        dist[clave] = dist.get(clave, 0) + 1
    for clave, esperado in DISTRIBUCION_ESPERADA.items():
        if dist.get(clave, 0) != esperado:
            errores.append(f'P-DISTRIBUCION: {clave}={dist.get(clave,0)} != {esperado}')
    for extra, n in dist.items():
        if extra not in DISTRIBUCION_ESPERADA:
            errores.append(f'P-DISTRIBUCION-extra: {extra} x{n} no autorizado')
    vistos_u, vistos_v = set(), set()
    for f in filas:
        tag = f"usuario {f['usuario_id']}"
        if not f.get('vigente'):
            errores.append(f'{tag}: vinculo no vigente')
        if f['cargo_eliminado']:
            errores.append(f'{tag}: cargo eliminado en scope')
        if f['usuario_id'] in vistos_u or f['vinculo_id'] in vistos_v:
            errores.append(f'{tag}: multiples vinculos/usuarios duplicados')
        vistos_u.add(f['usuario_id']); vistos_v.add(f['vinculo_id'])
        if f['nivel_actual'] == f['nivel_esperado']:
            errores.append(f"{tag}: ya sincronizado (no requiere M007)")
    return errores


def updates_sql(filas):
    bloques = []
    for f in filas:
        bloques.append(
            "  UPDATE usuarios u\n"
            "    JOIN usuario_cargo_manual ucm\n"
            "      ON ucm.id=%d AND ucm.usuario_id=u.id AND ucm.vigente=1\n"
            "     AND ucm.cargo_manual_id=%d\n"
            "    SET u.nivel='%s'\n"
            "   WHERE u.id=%d AND u.nivel='%s'\n"
            "     AND EXISTS (SELECT 1 FROM cargos_manual c\n"
            "                  WHERE c.id=%d AND c.eliminado_en IS NULL\n"
            "                    AND c.nivel='%s');\n"
            "  SET v_afectadas = v_afectadas + ROW_COUNT();"
            % (f['vinculo_id'], f['cargo_id'], f['nivel_esperado'],
               f['usuario_id'], f['nivel_actual'], f['cargo_id'],
               f['nivel_esperado']))
    return '\n'.join(bloques)


def ids_sql(filas):
    return ','.join(str(f['usuario_id']) for f in filas)


def main():
    filas = canonica()
    errores = validar_poblacion(filas)
    if errores:
        print('ABORTADO - poblacion canonica invalida:', file=sys.stderr)
        for e in errores:
            print(' -', e, file=sys.stderr)
        return 2

    print('usuario_id | nivel_actual | nivel_esperado | cargo_id | codigo | '
          'grado | planta | num_cargos | vinculo_vigente | estado_usuario')
    for f in filas:
        print(f"{f['usuario_id']} | {f['nivel_actual']} | {f['nivel_esperado']} | "
              f"{f['cargo_id']} | {f['codigo']} | {f['grado']} | {f['planta']} | "
              f"{f['num_cargos']} | True | {f['estado_usuario']}")

    DESTINO.write_text(PLANTILLA.format(
        total=TOTAL_ESPERADO,
        updates=updates_sql(filas),
        ids=ids_sql(filas),
        distribucion='24 asistencial->tecnico + 1 directivo->profesional',
    ), encoding='utf-8')
    print(f'\n[OK] escrito {DESTINO.relative_to(RAIZ)} '
          f'({len(filas)} UPDATEs, NO ejecutado)', file=sys.stderr)
    return 0


PLANTILLA = """-- M007_sync_usuarios_nivel.sql
-- GENERADO por tests/generar_m007.py desde la BD viva. NO editar a mano;
-- regenerar con: python3 tests/generar_m007.py
-- Scope: POBLACION A = {total} usuarios con vinculo vigente cuyo
--   usuarios.nivel difiere de cargos_manual.nivel ({distribucion}).
-- Fuente de verdad: cargos_manual (catálogo normativo Decreto 159/2024);
--   usuarios.nivel es copia materializada (ver docs/auditoria/
--   investigacion-r1-usuarios-nivel.md Q1/Q10).
-- POBLACION B (sin vinculo vigente, incluidos 186 y 273 TEST): INTACTA por
--   diseño; su nivel NO es derivable automaticamente del catalogo.
-- Inmutabilidad: solo cambia usuarios.nivel (+ actualizado_en por ON UPDATE
--   CURRENT_TIMESTAMP del esquema; metadato, no dato de negocio).
-- Rollback: valores previos registrados en este archivo (guardas) y en el
--   informe; inverso: restaurar nivel_previo por usuario_id.

DELIMITER $$

DROP PROCEDURE IF EXISTS m007_sync_usuarios_nivel $$
CREATE PROCEDURE m007_sync_usuarios_nivel()
BEGIN
  DECLARE v_afectadas INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Imagen previa de la POBLACION B para demostrar inmutabilidad (V4)
  CREATE TEMPORARY TABLE m007_b AS
    SELECT u.id, u.nivel FROM usuarios u
    WHERE u.eliminado_en IS NULL
      AND NOT EXISTS (SELECT 1 FROM usuario_cargo_manual x
                       WHERE x.usuario_id=u.id AND x.vigente=1);

  -- P1: poblacion canonica exacta
  IF (SELECT COUNT(*) FROM usuarios u
      JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1
      JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
       AND cm.eliminado_en IS NULL
      WHERE u.eliminado_en IS NULL AND NOT(u.nivel<=>cm.nivel)) <> {total} THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P1: poblacion canonica != {total}';
  END IF;
  -- P2/P3: distribucion 24+1
  IF (SELECT COUNT(*) FROM usuarios u
      JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1
      JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
       AND cm.eliminado_en IS NULL
      WHERE u.eliminado_en IS NULL
        AND u.nivel='asistencial' AND cm.nivel='tecnico') <> 24 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P2: asistencial->tecnico != 24';
  END IF;
  IF (SELECT COUNT(*) FROM usuarios u
      JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1
      JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
       AND cm.eliminado_en IS NULL
      WHERE u.eliminado_en IS NULL
        AND u.nivel='directivo' AND cm.nivel='profesional') <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P3: directivo->profesional != 1';
  END IF;
  -- P4: ningun usuario con multiples vinculos vigentes
  IF EXISTS (SELECT 1 FROM usuario_cargo_manual WHERE vigente=1
             GROUP BY usuario_id HAVING COUNT(*)>1) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P4: usuario con multiples cargos vigentes';
  END IF;
  -- P5: ningun vinculo vigente hacia cargo eliminado
  IF EXISTS (SELECT 1 FROM usuario_cargo_manual ucm
             JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
              AND cm.eliminado_en IS NOT NULL
             WHERE ucm.vigente=1) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P5: vinculo vigente a cargo eliminado';
  END IF;

{updates}

  -- V1: afecto exactamente las {total} filas
  IF v_afectadas <> {total} THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 V1: filas afectadas != {total}';
  END IF;
  -- V2: poblacion A queda 100%% sincronizada
  IF EXISTS (SELECT 1 FROM usuarios u
             JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id
              AND ucm.vigente=1
             JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
              AND cm.eliminado_en IS NULL
             WHERE u.eliminado_en IS NULL AND NOT(u.nivel<=>cm.nivel)) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 V2: quedan desincronizados en poblacion A';
  END IF;
  -- V3: los ids del scope tienen exactamente el nivel de su cargo
  IF EXISTS (SELECT 1 FROM usuarios u
             JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id
              AND ucm.vigente=1
             JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
             WHERE u.id IN ({ids}) AND NOT(u.nivel<=>cm.nivel)) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 V3: id del scope con nivel incorrecto';
  END IF;
  -- V4: poblacion B INTACTA (ni un cambio)
  IF EXISTS (SELECT 1 FROM m007_b t JOIN usuarios u ON u.id=t.id
             WHERE NOT(u.nivel<=>t.nivel)) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 V4: poblacion B fue modificada';
  END IF;
  DROP TEMPORARY TABLE m007_b;

  COMMIT;
END $$
CALL m007_sync_usuarios_nivel() $$
DROP PROCEDURE IF EXISTS m007_sync_usuarios_nivel $$
DELIMITER ;

-- Verificacion post-migracion:
--   source tests/auditoria_usuarios.sql   -> Q-CANONICA debe dar 0 filas
-- POSTERIOR OBLIGATORIO: regenerar database/full_dump.sql (un reload del
-- dump antiguo reintroduciria el drift; el seed actual lo contiene).
"""

if __name__ == '__main__':
    sys.exit(main())
