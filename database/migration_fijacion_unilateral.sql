-- ============================================================================
-- MIGRACION: Fijacion unilateral de compromisos (Art. 33 Res. 1760/2010)
-- Auditoria INFORME_DE_DISCREPANCIAS.md - Hallazgos C2 y N
-- Fecha: 2026-06-23
--
-- Cambios:
--   * Agrega campos para registrar la firma de un testigo igual o superior
--     al evaluado, requisito explicito del Articulo 33 del Acuerdo 617 de 2018.
--   * Agrega campos para registrar el motivo y la fecha de la fijacion
--     unilateral, y la observacion de inicio de plazo para omision del
--     evaluador (15 dias habiles).
-- ============================================================================

ALTER TABLE `concertaciones`
	ADD COLUMN IF NOT EXISTS `testigo_id` BIGINT(20) UNSIGNED NULL AFTER `comision_evaluador_id`,
	ADD COLUMN IF NOT EXISTS `fecha_testigo` DATETIME NULL AFTER `testigo_id`,
	ADD COLUMN IF NOT EXISTS `motivo_fijacion_unilateral` ENUM(
		'no_conformidad_evaluado',
		'vencimiento_plazo_sin_firma',
		'negativa_concertar',
		'omision_evaluador',
		'otro'
	) NULL AFTER `motivo_no_jefe`,
	ADD COLUMN IF NOT EXISTS `fecha_limite_concertacion` DATE NULL AFTER `fecha_concertacion`,
	ADD CONSTRAINT `fk_conc_testigo` FOREIGN KEY (`testigo_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

-- Permite distinguir compromisos propuestos por el rector como autoridad
-- nominadora del sector educativo (Acuerdo 617 de 2018, sector educativo).
ALTER TABLE `compromisos`
	ADD COLUMN IF NOT EXISTS `propuesto_por_secretario_educacion` TINYINT(1) NOT NULL DEFAULT 0
	AFTER `propuesto_por_jefe_entidad`;

-- Indice para acelerar consultas por testigo (reportes de fijacion unilateral)
CREATE INDEX IF NOT EXISTS `idx_conc_testigo` ON `concertaciones` (`testigo_id`);