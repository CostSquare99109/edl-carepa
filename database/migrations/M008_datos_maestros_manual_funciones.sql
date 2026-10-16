-- ============================================================================
-- M008_datos_maestros_manual_funciones.sql
-- Bloques A+B aprobados: renombres con respaldo de ficha, num_cargos,
-- fichas ausentes del Manual Global Marzo 2025 (Anexo 01 Decreto 159/2024).
--
-- FECHA: 2026-08-25
-- APROBACION (usuario): Bloque A completo (12 renombres + 2 num_cargos +
--   3 INSERT Tramites/Asistente Transito) y Bloque B (Secretario SAMA,
--   dependencia_id=12, INSERT + num_cargos id 6). proposito_principal literal.
-- FUENTE NORMATIVA: docs/auditoria/extra/modelo_planta_global.md
--   FICHAS 21,26,28,31,32,35,38,58,59,80,83,93 (renombres)
--   FICHAS 41 (@2187), 42 (@2239), 43 (@2290), 78 (@4102) (INSERT)
--   FICHA 88 (@4613) (num_cargos id 76); tabla agregada 020=9 (num_cargos id 6)
-- GUARDIAS: cada UPDATE exige id + valor_viejo exacto; 0 filas = alarma.
-- CONTADORES esperados al final: renombres=12 · num_cargos=2 · insertadas=4.
--
-- PENDIENTES DE DECISION HUMANA (Talento Humano) — NO tratados aqui:
--  * id 6 queda con DOS asignaciones vigentes en usuario_cargo_manual tras
--    num_cargos=1. Es hallazgo organizacional pendiente (quien ocupa la plaza
--    SAMA), NO un bug de datos ni queda "resuelto" con esta migracion.
--  * Filas AA sin respaldo en el manual, INTACTAS por decision aprobada
--    (estructura real no descrita, mismo tratamiento que V-09):
--      147 Fotocopias (SG) · 148 Archivo (Planeacion) · 149 Recaudo (Hacienda)
--      150 Admisiones (Salud) · 151 Biblioteca (Educacion)
--  * Detectado post-aprobacion, fuera de alcance: id 76 denominacion truncada
--    ('...Gestion de la Cultura' vs FICHA 88 '...Gestion de la Cultura -
--    Biblioteca'). Requiere aprobacion propia antes de corregir.
--  * Erratas conservadas LITERAL del manual: 'Trasparente' (FICHA 26),
--    'Tramites' sin tilde (FICHAS 41/43).
--
-- POST-EJECUCION OBLIGATORIA: regenerar database/full_dump.sql (AGENTS.md).
-- CHARSET: aplicar con --default-character-set=utf8mb4.
-- NOTA OPERATIVA: la sentencia USE de abajo fuerza edl_carepa AUNQUE el cliente
--   reciba otra base como argumento (leccion de la ejecucion 2026-08-25: el
--   "ensayo en clon" aplico sobre la viva por esta linea). Para ensayar en otra
--   base, extraer la linea USE primero. La re-ejecucion es IDEMPOTENTE: las
--   guardias no encuentran valores previos y los contadores marcan 0 sin
--   alterar datos (comportamiento verificado).
-- ============================================================================

USE edl_carepa;

START TRANSACTION;

SET @renombres := 0;
SET @numcargos := 0;
SET @insertadas := 0;

-- ----------------------------------------------------------------------------
-- BLOQUE A1: RENOMBRES (guardia: id + denominacion previa + vivo)
-- ----------------------------------------------------------------------------

-- FICHA 21: Profesional Universitario – Procesos y Gestión de Calidad
UPDATE cargos_manual SET denominacion='Profesional Universitario – Procesos y Gestión de Calidad'
 WHERE id=18 AND eliminado_en IS NULL AND denominacion='Profesional Universitario – Procesos y';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 26: Técnico Administrativo – Gestión Trasparente y Contratación (errata literal del manual)
UPDATE cargos_manual SET denominacion='Técnico Administrativo – Gestión Trasparente y Contratación'
 WHERE id=23 AND eliminado_en IS NULL AND denominacion='Técnico Administrativo – Gestión Trasparente y';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 28: Auxiliar Administrativo – Oficina Jurídica (EAV id 25 coincide literalmente)
UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Oficina Jurídica'
 WHERE id=25 AND eliminado_en IS NULL AND denominacion='Auxiliar Administrativo -';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 31: Auxiliar Administrativo – Mensajero y Apoyo Administrativo (Secretaría General)
UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Mensajero y Apoyo Administrativo'
 WHERE id=28 AND eliminado_en IS NULL AND dependencia_id=14 AND denominacion='Auxiliar Administrativo – Mensajero y';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 32: Auxiliar Administrativo – Asistente Plataforma SECOP (EAV id 29 coincide literalmente)
UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Asistente Plataforma SECOP'
 WHERE id=29 AND eliminado_en IS NULL AND denominacion='Auxiliar Administrativo – Asistente';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 35: Secretario de Despacho – Tránsito y Transporte
UPDATE cargos_manual SET denominacion='Secretario de Despacho – Tránsito y Transporte'
 WHERE id=32 AND eliminado_en IS NULL AND denominacion='Secretario de Despacho – Transito y';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 38: Técnico Administrativo – Gestión Documental (EAV id 35 coincide literalmente;
--           NO es la FICHA 41, que se inserta aparte)
UPDATE cargos_manual SET denominacion='Técnico Administrativo – Gestión Documental'
 WHERE id=35 AND eliminado_en IS NULL AND dependencia_id=20 AND denominacion='Técnico Administrativo – Gestión';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 58: Auxiliar Administrativo – Impuestos y Cobro Coactivo (Hacienda)
UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Impuestos y Cobro Coactivo'
 WHERE id=50 AND eliminado_en IS NULL AND dependencia_id=21 AND denominacion='Auxiliar Administrativo – Impuestos y';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 59: Auxiliar Administrativo – Mensajero y Apoyo Administrativo (Hacienda)
UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Mensajero y Apoyo Administrativo'
 WHERE id=51 AND eliminado_en IS NULL AND dependencia_id=21 AND denominacion='Auxiliar Administrativo – Mensajero y';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 80: Profesional Universitario – Programas y Proyectos (SAMA)
UPDATE cargos_manual SET denominacion='Profesional Universitario – Programas y Proyectos'
 WHERE id=68 AND eliminado_en IS NULL AND denominacion='Profesional Universitario – Programas y';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 83: Secretario(a) de Despacho – Educación y Cultura
UPDATE cargos_manual SET denominacion='Secretario(a) de Despacho – Educación y Cultura'
 WHERE id=71 AND eliminado_en IS NULL AND denominacion='Secretario(a) de Despacho – Educación y';
SET @renombres := @renombres + ROW_COUNT();

-- FICHA 93: Profesional Universitario – Promoción y Bienestar Social (Salud)
UPDATE cargos_manual SET denominacion='Profesional Universitario – Promoción y Bienestar Social'
 WHERE id=81 AND eliminado_en IS NULL AND denominacion='Profesional Universitario - Promoción y';
SET @renombres := @renombres + ROW_COUNT();

-- ----------------------------------------------------------------------------
-- BLOQUE A2 + B: NUM_CARGOS (guardia: id + valor previo)
-- ----------------------------------------------------------------------------

-- FICHA 88 dice No. de Cargos = 01
UPDATE cargos_manual SET num_cargos=1
 WHERE id=76 AND eliminado_en IS NULL AND num_cargos=2;
SET @numcargos := @numcargos + ROW_COUNT();

-- Tabla agregada 020 = 9 empleos en 9 secretarías: cada secretario ×1.
-- El x2 de id 6 compensaba al Secretario SAMA ausente (se inserta en Bloque B).
-- PENDIENTE TH: id 6 conserva 2 asignaciones vigentes (ver verificacion V6).
UPDATE cargos_manual SET num_cargos=1
 WHERE id=6 AND eliminado_en IS NULL AND num_cargos=2;
SET @numcargos := @numcargos + ROW_COUNT();

-- ----------------------------------------------------------------------------
-- BLOQUE A3: INSERTS FICHAS AUSENTES (guardia anti-duplicado NOT EXISTS)
-- proposito_principal = literal del DOCX (transcripcion modelo_planta_global)
-- ----------------------------------------------------------------------------

-- FICHA 41: TA – Gestión de Tramites (Tránsito, x2)
INSERT INTO cargos_manual (planta,dependencia_id,nivel,codigo,grado,denominacion,num_cargos,naturaleza,jefe_inmediato,proposito_principal,fuente)
SELECT 'global',20,'tecnico','367','02','Técnico Administrativo – Gestión de Tramites',2,'carrera_administrativa',
       'Secretario de Tránsito y Transporte',
       'Apoyar la gestión de la Secretaría de tránsito y transporte, velando por que los diferentes tramites que se realicen, se ajusten a los procedimientos técnicos y normatividad legal vigente.',
       'decreto_159_2024'
FROM (SELECT 1 AS one) AS d
WHERE NOT EXISTS (SELECT 1 FROM cargos_manual
                  WHERE planta='global' AND codigo='367' AND grado='02'
                    AND denominacion='Técnico Administrativo – Gestión de Tramites' AND eliminado_en IS NULL);
SET @insertadas := @insertadas + ROW_COUNT();

-- FICHA 42: AA – Asistente (Tránsito, x1)
INSERT INTO cargos_manual (planta,dependencia_id,nivel,codigo,grado,denominacion,num_cargos,naturaleza,jefe_inmediato,proposito_principal,fuente)
SELECT 'global',20,'asistencial','407','02','Auxiliar Administrativo – Asistente',1,'carrera_administrativa',
       'Secretario de Tránsito y Transporte',
       'Administrar la información de la secretaria para personal interno y externo de conformidad con los procesos establecidos.',
       'decreto_159_2024'
FROM (SELECT 1 AS one) AS d
WHERE NOT EXISTS (SELECT 1 FROM cargos_manual
                  WHERE planta='global' AND dependencia_id=20 AND codigo='407' AND grado='02'
                    AND denominacion='Auxiliar Administrativo – Asistente' AND eliminado_en IS NULL);
SET @insertadas := @insertadas + ROW_COUNT();

-- FICHA 43: AA – Gestión de Tramites (Tránsito, x1)
INSERT INTO cargos_manual (planta,dependencia_id,nivel,codigo,grado,denominacion,num_cargos,naturaleza,jefe_inmediato,proposito_principal,fuente)
SELECT 'global',20,'asistencial','407','02','Auxiliar Administrativo – Gestión de Tramites',1,'carrera_administrativa',
       'Secretario de Tránsito y Transporte',
       'Apoyar la gestión de la Secretaría de tránsito y transporte. Administrar, la información de la Secretaría para personal interno y externo de conformidad con los procesos establecidos.',
       'decreto_159_2024'
FROM (SELECT 1 AS one) AS d
WHERE NOT EXISTS (SELECT 1 FROM cargos_manual
                  WHERE planta='global' AND codigo='407' AND grado='02'
                    AND denominacion='Auxiliar Administrativo – Gestión de Tramites' AND eliminado_en IS NULL);
SET @insertadas := @insertadas + ROW_COUNT();

-- ----------------------------------------------------------------------------
-- BLOQUE B: SECRETARIO SAMA (FICHA 78) — dependencia_id=12 según aprobación
-- ----------------------------------------------------------------------------

INSERT INTO cargos_manual (planta,dependencia_id,nivel,codigo,grado,denominacion,num_cargos,naturaleza,jefe_inmediato,proposito_principal,fuente)
SELECT 'global',12,'directivo','020','02','Secretario de Despacho – SAMA',1,'libre_nombramiento_remocion',
       'Alcalde Municipal',
       'Diseñar políticas de recuperación del sector agropecuario y medio ambiente, para la ejecución de los compromisos adquiridos en el Plan de Desarrollo Municipal.',
       'decreto_159_2024'
FROM (SELECT 1 AS one) AS d
WHERE NOT EXISTS (SELECT 1 FROM cargos_manual
                  WHERE planta='global' AND codigo='020'
                    AND denominacion='Secretario de Despacho – SAMA' AND eliminado_en IS NULL);
SET @insertadas := @insertadas + ROW_COUNT();

-- ----------------------------------------------------------------------------
-- VERIFICACION (antes de COMMIT; 0 filas o valores distintos = ROLLBACK manual)
-- ----------------------------------------------------------------------------

-- C1: contadores (esperado: 12 / 2 / 4)
SELECT @renombres AS renombres_esperado_12,
       @numcargos AS numcargos_esperado_2,
       @insertadas AS insertadas_esperada_4;

-- C2: filas tocadas (esperado: nuevos textos en los 12 ids)
SELECT id, num_cargos, denominacion FROM cargos_manual
 WHERE id IN (6,18,23,25,28,29,32,35,50,51,68,71,76) ORDER BY id;

-- C3: matriz codigo/grado global (esperado: 020/02=9x9 · 367/02=33x34 · 407/02=27x27)
--     Nota aritmetica: los 4 INSERT aportan 5 empleos (FICHA 41 lleva x2);
--     el x2 previo de id 76 ya estaba incluido en los 33 empleos de 367/02.
SELECT codigo, grado, COUNT(*) AS filas, SUM(num_cargos) AS empleos
 FROM cargos_manual WHERE eliminado_en IS NULL AND planta='global'
   AND ((codigo='020' AND grado='02') OR (codigo='367' AND grado='02') OR (codigo='407' AND grado='02'))
 GROUP BY codigo, grado ORDER BY codigo;

-- C4: totales globales (esperado: filas 120 · empleos 128; con temporal: 131/170)
--     Brecha vs tabla agregada del manual (125) = sobreconteo preexistente
--     asociado a las filas AA sin respaldo (147-151) — decision TH pendiente.
SELECT SUM(planta='global') AS filas_global, SUM(CASE WHEN planta='global' THEN num_cargos END) AS empleos_global,
       COUNT(*) AS filas_total, SUM(num_cargos) AS empleos_total
 FROM cargos_manual WHERE eliminado_en IS NULL;

-- C5: PENDIENTE TH id 6 (esperado 2 — se deja documentado, NO se corrige aqui)
SELECT COUNT(*) AS asignaciones_vigentes_id6_PENDIENTE_TH
 FROM usuario_cargo_manual WHERE vigente=1 AND cargo_manual_id=6;

-- C6: AA sin respaldo intactas (esperado: 5 filas con nombres originales)
SELECT id, denominacion FROM cargos_manual
 WHERE id IN (147,148,149,150,151) AND eliminado_en IS NULL ORDER BY id;

COMMIT;

-- ============================================================================
-- ROLLBACK (solo si se detecta anomalia POST-COMMIT; dentro de la transaccion
-- basta con emitir ROLLBACK en lugar de COMMIT):
--
--   -- Revertir renombres (valores previos registrados arriba):
--   UPDATE cargos_manual SET denominacion='Profesional Universitario – Procesos y'            WHERE id=18;
--   UPDATE cargos_manual SET denominacion='Técnico Administrativo – Gestión Trasparente y'    WHERE id=23;
--   UPDATE cargos_manual SET denominacion='Auxiliar Administrativo -'                         WHERE id=25;
--   UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Mensajero y'             WHERE id=28;
--   UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Asistente'               WHERE id=29;
--   UPDATE cargos_manual SET denominacion='Secretario de Despacho – Transito y'               WHERE id=32;
--   UPDATE cargos_manual SET denominacion='Técnico Administrativo – Gestión'                  WHERE id=35;
--   UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Impuestos y'             WHERE id=50;
--   UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Mensajero y'             WHERE id=51;
--   UPDATE cargos_manual SET denominacion='Profesional Universitario – Programas y'           WHERE id=68;
--   UPDATE cargos_manual SET denominacion='Secretario(a) de Despacho – Educación y'           WHERE id=71;
--   UPDATE cargos_manual SET denominacion='Profesional Universitario - Promoción y'           WHERE id=81;
--   -- Revertir num_cargos:
--   UPDATE cargos_manual SET num_cargos=2 WHERE id=76;
--   UPDATE cargos_manual SET num_cargos=2 WHERE id=6;
--   -- Retirar fichas nuevas (soft-delete; 0 FKs las referencian al ser nuevas):
--   UPDATE cargos_manual SET eliminado_en=NOW()
--    WHERE fuente='decreto_159_2024' AND creado_en>=CURDATE()
--      AND ((codigo='367' AND denominacion LIKE '%Gestión de Tramites')
--        OR (codigo='407' AND dependencia_id=20)
--        OR (codigo='020' AND denominacion='Secretario de Despacho – SAMA'));
-- ============================================================================
