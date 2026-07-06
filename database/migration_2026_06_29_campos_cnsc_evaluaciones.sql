-- Migracion: 2026-06-29_campos_cnsc_evaluaciones
--
-- Origen: Analisis de las 27 transcripciones CNSC en `transcripciones_cnsc/`
--   (Tutorial_EDL_APP_-_Evaluar, Tutorial_para_la_realizacion_de_la_primera_evaluacion_parcial,
--    Tutorial_EDL_APP_Rol_Evaluador, Usos_escalas_y_consecuencias_de_EDL, etc.)
--
-- Cambios:
--   1. Agrega a `evaluaciones` los campos de las dos preguntas del CNSC:
--      cumplio_compromisos, aporte_adicional, descripcion_aporte, justificacion.
--      Esto completa el ciclo de la evaluacion (guardar, calificar y luego
--      consultar el detalle desde "Ver Evaluaciones").

ALTER TABLE `evaluaciones`
  ADD COLUMN `cumplio_compromisos` enum('si','moderadamente','no') DEFAULT NULL AFTER `motivo_anulacion`,
  ADD COLUMN `aporte_adicional` enum('si','no') DEFAULT NULL AFTER `cumplio_compromisos`,
  ADD COLUMN `descripcion_aporte` text DEFAULT NULL AFTER `aporte_adicional`,
  ADD COLUMN `justificacion` text DEFAULT NULL AFTER `descripcion_aporte`;