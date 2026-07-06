-- ============================================================================
-- Migración: Independizar concertaciones por evaluación
-- ============================================================================
-- Fecha: 2026-07-03
-- Propósito:
--   Eliminar la restricción UNIQUE KEY (periodo_id, evaluado_id) que
--   impedía crear múltiples concertaciones por empleado/período.
--   Esto causaba que los compromisos se mezclaran entre distintas
--   evaluaciones del mismo empleado en el mismo período.
--
--   Ahora cada evaluación tiene su propia concertación (o puede tener una
--   nueva), y los compromisos quedan aislados dentro de cada una.
--
--   Se elimina uk_periodo_evaluado y se reemplaza por un índice no único
--   para mantener el rendimiento de las búsquedas.
-- ============================================================================

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
START TRANSACTION;

-- ----------------------------------------------------------------------------
-- 1. Eliminar la restricción UNIQUE que forzaba una sola concertación
--    por (periodo_id, evaluado_id)
-- ----------------------------------------------------------------------------
ALTER TABLE `concertaciones`
  DROP INDEX `uk_periodo_evaluado`;

-- ----------------------------------------------------------------------------
-- 2. Agregar índice no único para mantener performance en búsquedas
-- ----------------------------------------------------------------------------
ALTER TABLE `concertaciones`
  ADD INDEX `idx_periodo_evaluado` (`periodo_id`, `evaluado_id`);

COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

-- ============================================================================
-- Verificación post-migración
-- ============================================================================
-- Esperado:
--   No debe existir uk_periodo_evaluado en concertaciones
--   Debe existir idx_periodo_evaluado (no único) en concertaciones
--   SHOW INDEX FROM concertaciones;  -- uk_periodo_evaluado no aparece
-- ============================================================================
