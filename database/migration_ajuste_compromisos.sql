-- ============================================================================
-- MIGRACION: Motivo de ajuste de compromisos concertados
-- Auditoria INFORME_DE_DISCREPANCIAS.md - Hallazgo D
-- Fecha: 2026-06-23
--
-- Segun el Anexo Tecnico del Acuerdo 617/2018, cuando se presenta una
-- situacion que conlleve a realizar un ajuste de compromisos, el evaluador
-- debe registrar el motivo de la lista permitida:
--   1. Cambios en los planes institucionales o metas
--   2. Separacion temporal del cargo por un termino superior a 30 dias calendario
--   3. Asignacion de funciones
--   4. Cambio de un empleo por traslado o reubicación
--   5. Decision de la Comision de Personal frente a la reclamacion del evaluado
-- ============================================================================

ALTER TABLE `compromisos`
	ADD COLUMN IF NOT EXISTS `motivo_ajuste` ENUM(
		'cambios_planes_metas',
		'separacion_temporal_30_dias',
		'asignacion_funciones',
		'cambio_empleo_traslado_reubicacion',
		'decision_comision_personal'
	) NULL AFTER `plazo`,
	ADD COLUMN IF NOT EXISTS `fecha_ajuste` DATETIME NULL AFTER `motivo_ajuste`;

-- Indice para reportes de ajustes
CREATE INDEX IF NOT EXISTS `idx_comp_motivo_ajuste` ON `compromisos` (`motivo_ajuste`);