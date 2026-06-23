-- ============================================================================
-- Migration: Agregar columna evaluacion_id a tabla notificaciones
-- ============================================================================
-- Fecha: 2026-06-23
-- Motivo: Las notificaciones deben poder enlazarse a evaluaciones especificas
--         para que el frontend pueda redirigir al recurso correcto
-- ============================================================================

ALTER TABLE `notificaciones`
  ADD COLUMN `evaluacion_id` bigint(20) unsigned DEFAULT NULL AFTER `tipo`,
  ADD KEY `idx_evaluacion` (`evaluacion_id`),
  ADD CONSTRAINT `fk_not_evaluacion` FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluaciones` (`id`) ON DELETE SET NULL;
