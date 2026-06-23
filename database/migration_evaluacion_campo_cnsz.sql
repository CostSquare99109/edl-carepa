-- ============================================================
-- MIGRACIÓN: Columnas faltantes para el flujo de evaluación
-- Campos requeridos por el formulario CNSC en evaluaciones
-- ============================================================

USE edl_carepa;

-- cumplio_compromisos: ¿El evaluado cumplió con sus compromisos?
ALTER TABLE evaluaciones
    ADD COLUMN IF NOT EXISTS `cumplio_compromisos` ENUM('si','no','moderadamente') DEFAULT NULL
    COMMENT '¿Cumplió los compromisos funcionales y comportamentales?'
    AFTER `observaciones`;

-- aporte_adicional: ¿El evaluado aportó más allá de lo estipulado?
ALTER TABLE evaluaciones
    ADD COLUMN IF NOT EXISTS `aporte_adicional` ENUM('si','no','moderadamente') DEFAULT NULL
    COMMENT '¿Aportó más allá de lo estipulado en los compromisos?'
    AFTER `cumplio_compromisos`;

-- descripcion_aporte: Descripción del aporte adicional
ALTER TABLE evaluaciones
    ADD COLUMN IF NOT EXISTS `descripcion_aporte` TEXT DEFAULT NULL
    COMMENT 'Descripción del aporte adicional cuando aplica'
    AFTER `aporte_adicional`;

-- justificacion: Justificación del evaluador (mínimo 40 caracteres CNSC)
ALTER TABLE evaluaciones
    ADD COLUMN IF NOT EXISTS `justificacion` TEXT DEFAULT NULL
    COMMENT 'Justificación del evaluador sobre la calificación'
    AFTER `descripcion_aporte`;

-- fecha_inicio_eval / fecha_fin_eval: Rango de fechas del período evaluado
ALTER TABLE evaluaciones
    ADD COLUMN IF NOT EXISTS `fecha_inicio_eval` DATE DEFAULT NULL
    COMMENT 'Fecha inicio del período de evaluación (formulario CNSC)'
    AFTER `justificacion`;

ALTER TABLE evaluaciones
    ADD COLUMN IF NOT EXISTS `fecha_fin_eval` DATE DEFAULT NULL
    COMMENT 'Fecha fin del período de evaluación (formulario CNSC)'
    AFTER `fecha_inicio_eval`;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'MIGRACIÓN EVALUACIONES COMPLETADA' AS status;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'edl_carepa'
  AND TABLE_NAME = 'evaluaciones'
  AND COLUMN_NAME IN (
    'cumplio_compromisos', 'aporte_adicional',
    'descripcion_aporte', 'justificacion',
    'fecha_inicio_eval', 'fecha_fin_eval'
  )
ORDER BY ORDINAL_POSITION;
