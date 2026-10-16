-- ============================================================================
-- EXPLAIN check post-migración (ejecutar manualmente en MySQL/MariaDB)
-- Compara el plan de ejecución ANTES y DESPUÉS de aplicar los índices.
-- ============================================================================

-- 1. Listado de evaluaciones con filtros (caso más frecuente)
EXPLAIN
SELECT ev.*, ed.documento
FROM evaluaciones ev
INNER JOIN usuarios ed ON ed.id = ev.evaluado_id
WHERE ev.eliminado_en IS NULL
  AND ev.periodo_id = 1
  AND ev.estado = 'pendiente'
ORDER BY ev.id DESC
LIMIT 20;

-- 2. Compromisos de una evaluación (UNION ALL)
EXPLAIN
SELECT c.*, m.descripcion AS meta_descripcion
FROM compromisos c
INNER JOIN concertaciones con ON con.id = c.concertacion_id
INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id
LEFT JOIN metas m ON m.id = c.meta_id
WHERE ev.id = 1 AND c.tipo = 'funcional' AND c.eliminado_en IS NULL;

-- 3. Evaluados por dependencia y periodo
EXPLAIN
SELECT u.id, u.documento, u.primer_nombre, u.primer_apellido
FROM usuarios u
INNER JOIN evaluaciones e ON e.evaluado_id = u.id
WHERE u.eliminado_en IS NULL
  AND e.eliminado_en IS NULL
  AND u.dependencia_id = 1
  AND e.periodo_id = 1
  AND e.tipo = 'anual'
ORDER BY u.primer_apellido, u.primer_nombre;
