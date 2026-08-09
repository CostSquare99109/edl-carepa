-- ============================================================
-- MIGRACION: conductas para competencias creadas desde JSON
-- GES_DES, RES_CON (Directivo) y GES_PROC, INS_DEC (Profesional)
-- Fuente: JSON competencias_cargos (no define conductas; se
--         estandarizan 5 por competencia, estilo Decreto 815)
-- Idempotente: ON DUPLICATE KEY no aplica (no hay UK en texto),
--   se usa NOT EXISTS para evitar duplicados.
-- ============================================================

START TRANSACTION;

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_DES', 'Identifica las necesidades de desarrollo del talento humano a su cargo', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_DES' AND orden=1);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_DES', 'Orienta y acompaña el crecimiento profesional de los colaboradores', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_DES' AND orden=2);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_DES', 'Diseña planes de desarrollo alineados con los objetivos institucionales', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_DES' AND orden=3);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_DES', 'Retroalimenta el desempeño para potenciar las competencias del equipo', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_DES' AND orden=4);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_DES', 'Genera condiciones para el aprendizaje organizacional continuo', 5, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_DES' AND orden=5);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'RES_CON', 'Identifica las causas del conflicto y las partes involucradas', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='RES_CON' AND orden=1);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'RES_CON', 'Escucha con imparcialidad los intereses de las partes', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='RES_CON' AND orden=2);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'RES_CON', 'Propone alternativas de solución viables y oportunas', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='RES_CON' AND orden=3);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'RES_CON', 'Facilita acuerdos que preservan las relaciones laborales', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='RES_CON' AND orden=4);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'RES_CON', 'Actúa con confidencialidad y respeto en la gestión del conflicto', 5, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='RES_CON' AND orden=5);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_PROC', 'Conoce y aplica los procedimientos establecidos en la entidad', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_PROC' AND orden=1);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_PROC', 'Elabora y actualiza procedimientos con criterios de calidad', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_PROC' AND orden=2);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_PROC', 'Identifica oportunidades de mejora en los procesos a su cargo', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_PROC' AND orden=3);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_PROC', 'Documenta y socializa los cambios en los procedimientos', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_PROC' AND orden=4);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'GES_PROC', 'Vela por el cumplimiento normativo en la ejecución de los procedimientos', 5, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='GES_PROC' AND orden=5);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'INS_DEC', 'Traduce las decisiones adoptadas en acciones concretas y ejecutables', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='INS_DEC' AND orden=1);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'INS_DEC', 'Comunica claramente los alcances y responsabilidades de cada decisión', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='INS_DEC' AND orden=2);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'INS_DEC', 'Hace seguimiento a la implementación de las decisiones', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='INS_DEC' AND orden=3);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'INS_DEC', 'Evalúa los resultados obtenidos y propone los ajustes necesarios', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='INS_DEC' AND orden=4);

INSERT INTO conductas (competencia_codigo, texto, orden, activo)
SELECT 'INS_DEC', 'Documenta las decisiones y su sustento técnico y jurídico', 5, 1
WHERE NOT EXISTS (SELECT 1 FROM conductas WHERE competencia_codigo='INS_DEC' AND orden=5);

COMMIT;

SELECT competencia_codigo, COUNT(*) AS conductas FROM conductas
WHERE competencia_codigo IN ('GES_DES','RES_CON','GES_PROC','INS_DEC')
GROUP BY competencia_codigo;
