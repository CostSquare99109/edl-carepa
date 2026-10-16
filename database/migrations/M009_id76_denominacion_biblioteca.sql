-- ============================================================================
-- M009_id76_denominacion_biblioteca.sql
-- Renombre con respaldo literal: FICHA 88 del Manual Global Marzo 2025
-- (docs/auditoria/extra/modelo_planta_global.md @4613).
-- Aprobación pendiente→otorgada por usuario (conversación 2026-08-25, diff previo).
--
-- IMPORTANTE: este archivo NO contiene USE. Aplicar EXCLUSIVAMENTE vía:
--   database/migrations/aplicar_migracion.sh <este_archivo> <bd> [flags]
-- ============================================================================
START TRANSACTION;

-- Guardia: id + planta implícita por id + valor previo exacto (46 chars)
UPDATE cargos_manual
   SET denominacion='Técnico Administrativo – Gestión de la Cultura - Biblioteca'
 WHERE id=76 AND eliminado_en IS NULL AND num_cargos=1
   AND codigo='367' AND grado='02'
   AND denominacion='Técnico Administrativo – Gestión de la Cultura';

-- Verificación (esperado: 1 fila renombrada; texto completo FICHA 88)
SELECT ROW_COUNT() AS filas_renombradas_esperado_1;
SELECT id, CHAR_LENGTH(denominacion) AS len_59, denominacion FROM cargos_manual WHERE id=76;

COMMIT;

-- ROLLBACK:
-- UPDATE cargos_manual SET denominacion='Técnico Administrativo – Gestión de la Cultura' WHERE id=76;
