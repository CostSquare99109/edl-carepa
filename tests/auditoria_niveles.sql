-- auditoria_niveles.sql — Test de regresion SQL: niveles mixtos/incorrectos/NULL.
-- Complemento determinista del auditor Python (tests/auditor_cargos.py).
--
-- PREREQUISITO (solo si se quiere validacion en-SQL): materializar la referencia
--   database/referencia_normativa_niveles.sql (des-comentar DDL+INSERTs).
--   Sin la tabla, este script solo puede validar homogeneidad y NULLs (Q1/Q2).
--
-- Robustez frente a los defectos clasicos de GROUP_CONCAT:
--   * DISTINCT omite NULL -> aqui se cuenta aparte con SUM(nivel IS NULL).
--   * Comparar strings concatenados es fragil -> se usa COUNT(DISTINCT) + MIN.
--   * Referencia faltante -> LEFT JOIN + HAVING ref IS NULL (no se cuela).

-- Q1: grupos con niveles MEZCLADOS (el bug original: >=2 niveles por clave).
SELECT cm.planta, cm.codigo, cm.grado,
       COUNT(DISTINCT cm.nivel)            AS niveles_distintos,
       GROUP_CONCAT(DISTINCT cm.nivel ORDER BY cm.nivel SEPARATOR '+') AS mezcla,
       SUM(cm.nivel IS NULL)               AS filas_con_nivel_null,
       COUNT(*) AS filas, SUM(cm.num_cargos) AS empleos
FROM cargos_manual cm
WHERE cm.eliminado_en IS NULL
GROUP BY cm.planta, cm.codigo, cm.grado
HAVING niveles_distintos > 1 OR filas_con_nivel_null > 0;
-- ESPERADO POST-M006: 0 filas.

-- Q2: grupos homogeneos pero con nivel distinto a la referencia normativa
--     (requiere tabla referencia_normativa_niveles materializada).
-- SELECT cm.planta, cm.codigo, cm.grado, MIN(cm.nivel) AS nivel_bd, r.nivel_esperado
-- FROM cargos_manual cm
-- JOIN referencia_normativa_niveles r
--   ON r.planta=cm.planta AND r.codigo=cm.codigo AND r.grado=cm.grado
-- WHERE cm.eliminado_en IS NULL
-- GROUP BY cm.planta, cm.codigo, cm.grado, r.nivel_esperado
-- HAVING MIN(cm.nivel) <> r.nivel_esperado;
-- ESPERADO POST-M006: 0 filas.

-- Q3: claves de BD SIN respaldo normativo (filas fantasma por clave).
-- SELECT cm.planta, cm.codigo, cm.grado, COUNT(*) filas
-- FROM cargos_manual cm
-- LEFT JOIN referencia_normativa_niveles r
--   ON r.planta=cm.planta AND r.codigo=cm.codigo AND r.grado=cm.grado
-- WHERE cm.eliminado_en IS NULL AND r.planta IS NULL
-- GROUP BY cm.planta, cm.codigo, cm.grado;

-- Q4 (inverso): claves normativas sin ninguna fila viva en BD.
-- SELECT r.planta, r.codigo, r.grado, r.nivel_esperado
-- FROM referencia_normativa_niveles r
-- WHERE NOT EXISTS (SELECT 1 FROM cargos_manual cm
--                   WHERE cm.eliminado_en IS NULL
--                     AND cm.planta=r.planta AND cm.codigo=r.codigo
--                     AND cm.grado=r.grado);
-- NOTA: ('global','407','00') aparece por la errata V-04 resuelta; documentar,
-- no "corregir" grados sin acto administrativo.

-- Q5: sincronizacion usuarios <-> cargo vinculado (hallazgo R1; solo lectura).
SELECT u.id AS usuario_id, u.documento, u.estado, u.nivel AS nivel_usuario,
       cm.id AS cargo_id, cm.codigo, cm.grado, cm.nivel AS nivel_cargo
FROM usuarios u
JOIN usuario_cargo_manual ucm ON ucm.usuario_id = u.id AND ucm.vigente = 1
JOIN cargos_manual cm ON cm.id = ucm.cargo_manual_id AND cm.eliminado_en IS NULL
WHERE u.eliminado_en IS NULL AND u.nivel <> cm.nivel
ORDER BY u.id;
-- ESPERADO POST-M006 (sin M007): 23 filas (todas via cargo 33 y cargo 4 ya
-- corregido); se resuelven con M007, NO con M006.
