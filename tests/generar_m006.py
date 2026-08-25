#!/usr/bin/env python3
"""Genera el artefacto SQL de M006 desde la BD viva (solo lectura).

NO ejecuta la migracion. Emite:
  database/migrations/M006_p0_1_residuo_niveles.sql
Los IDs NUNCA se escriben a mano: provienen de la consulta canonica sobre la
BD y se validan contra la misma poblacion antes de emitir el SQL.
"""
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / 'database' / 'migrations' / 'M006_p0_1_residuo_niveles.sql'
ESPERADO = 'tecnico'
POBLACION = ("eliminado_en IS NULL AND nivel='asistencial' "
             "AND ((codigo='367' AND grado IN ('02','04')) "
             "OR (codigo='314' AND grado='02'))")


def mysql(sql):
    out = subprocess.run(['mariadb', '-u', 'root', '-N', '-B', 'edl_carepa',
                          '-e', sql], capture_output=True, text=True,
                         check=True).stdout
    return [tuple(line.split('\t')) for line in out.splitlines() if line]


def canonica():
    filas = mysql("SELECT id, planta, codigo, grado, nivel, num_cargos "
                  f"FROM cargos_manual WHERE {POBLACION} ORDER BY codigo, grado, id")
    return [{'id': int(r[0]), 'planta': r[1], 'codigo': r[2], 'grado': r[3],
             'nivel_actual': r[4], 'num_cargos': int(r[5])} for r in filas]


def validar(filas):
    assert len(filas) == 23, f'poblacion canonica != 23 filas ({len(filas)})'
    assert sum(f['num_cargos'] for f in filas) == 24, 'empleos != 24'
    ids = [f['id'] for f in filas]
    assert len(set(ids)) == 23, 'ids duplicados'
    for f in filas:
        assert f['nivel_actual'] == 'asistencial', f"id {f['id']} nivel inesperado"
        g_ok = f['grado'] in ('02', '04') if f['codigo'] == '367' else f['grado'] == '02'
        assert g_ok, f"id {f['id']} grado inesperado"
        # num_cargos vs ficha: SOLO informativo (hallazgo R2 separado), no bloquea.


def updates_sql(filas):
    bloques = []
    for f in filas:
        bloques.append(
            "  UPDATE cargos_manual SET nivel='%s'\n"
            "       WHERE id=%d AND codigo='%s' AND grado='%s'\n"
            "         AND planta='%s' AND nivel='asistencial'\n"
            "         AND eliminado_en IS NULL;\n"
            "  SET v_afectadas = v_afectadas + ROW_COUNT();"
            % (ESPERADO, f['id'], f['codigo'], f['grado'], f['planta']))
    return '\n'.join(bloques)


def main():
    filas = canonica()
    validar(filas)

    print('id | planta | codigo | grado | nivel_actual | nivel_esperado | num_cargos')
    for f in filas:
        print(f"{f['id']} | {f['planta']} | {f['codigo']} | {f['grado']} | "
              f"{f['nivel_actual']} | {ESPERADO} | {f['num_cargos']}")

    sql = PLANTILLA.format(poblacion=POBLACION, esperado=ESPERADO,
                           updates=updates_sql(filas))
    DESTINO.write_text(sql, encoding='utf-8')
    print(f'\n[OK] escrito {DESTINO.relative_to(RAIZ)} '
          f'({len(filas)} UPDATEs, NO ejecutado)', file=sys.stderr)


PLANTILLA = """-- M006_p0_1_residuo_niveles.sql
-- GENERADO por tests/generar_m006.py desde la BD viva. NO editar IDs a mano;
-- regenerar con: python3 tests/generar_m006.py
-- Scope ESTRICTO: cargos_manual.nivel de 23 filas vivas / 24 empleos
--   367/02: 17 filas / 18 empleos (id 76 tiene num_cargos=2)
--   367/04: 3 filas / 3 empleos
--   314/02: 3 filas / 3 empleos
-- Fuente normativa: manual-funciones-marzo-2025.md:51 (Tecnico N=3),
-- tabla agregada SS1 + discriminada SS1.1 + 23/23 fichas dicen Tecnico.
-- NO modifica: usuarios, num_cargos, grado, denominaciones ni planta
-- (hallazgos R1-R7 se tramitan por separado).
-- Rollback: los valores previos son nivel='asistencial'; ver ROLLBACK.md al pie.

DELIMITER $$

DROP PROCEDURE IF EXISTS m006_residuo_niveles $$
CREATE PROCEDURE m006_residuo_niveles()
BEGIN
  DECLARE v_afectadas INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- P1: poblacion canonica exacta
  IF (SELECT COUNT(*) FROM cargos_manual WHERE {poblacion}) <> 23 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 P1: poblacion canonica != 23 filas';
  END IF;
  -- P2: empleos esperados
  IF (SELECT COALESCE(SUM(num_cargos),0) FROM cargos_manual WHERE {poblacion}) <> 24 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 P2: empleos de la poblacion != 24';
  END IF;
  -- P3: ningun asistencial fuera del alcance conocido
  IF EXISTS (SELECT 1 FROM cargos_manual WHERE eliminado_en IS NULL
             AND nivel='asistencial'
             AND codigo NOT IN ('367','314','407','438','470','477')) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 P3: asistencial fuera del alcance';
  END IF;

{updates}

  -- V1: afecto exactamente las 23 filas
  IF v_afectadas <> 23 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 V1: filas afectadas != 23';
  END IF;
  -- V2: grupos objetivo quedan homogeneos en tecnico
  IF EXISTS (SELECT 1 FROM cargos_manual WHERE eliminado_en IS NULL
             AND codigo IN ('367','314') AND nivel <> '{esperado}') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 V2: queda nivel != tecnico en 367/314';
  END IF;
  -- V3/V4: nada mas cambia (totales globales intactos)
  IF (SELECT COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL) <> 127 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'M006 V3: total filas vivas != 127';
  END IF;
  IF (SELECT COALESCE(SUM(num_cargos),0) FROM cargos_manual
      WHERE eliminado_en IS NULL) <> 167 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'M006 V4: total empleos != 167';
  END IF;

  COMMIT;
END $$
-- Ejecucion inmediata dentro del mismo script:
CALL m006_residuo_niveles() $$
DROP PROCEDURE IF EXISTS m006_residuo_niveles $$
DELIMITER ;

-- Verificacion post-migracion (fuera de la transaccion):
-- SELECT codigo, grado, GROUP_CONCAT(DISTINCT nivel) FROM cargos_manual
--   WHERE eliminado_en IS NULL AND codigo IN ('367','314')
--   GROUP BY codigo, grado;                       -> todo 'tecnico'
-- POSTERIOR OBLIGATORIO: regenerar database/full_dump.sql para evitar
-- divergencia entre BD y artefacto versionado (un reload del dump antiguo
-- REINTRODUCIRIA los niveles asistenciales).

-- ROLLBACK manual (si se hubiera hecho COMMIT y se desea revertir):
--   UPDATE cargos_manual SET nivel='asistencial'
--   WHERE id IN (/* los mismos 23 ids */)
--     AND codigo IN ('367','314') AND nivel='tecnico'
--     AND eliminado_en IS NULL;
"""

if __name__ == '__main__':
    main()
