-- Migracion: 2026-06-29_fase_auditoria_cnsc
--
-- Origen: Auditoria tecnica exhaustiva sobre las 27 transcripciones CNSC en
--   `transcripciones_cnsc/` y verificacion contra el codigo real del proyecto.
--
-- Cambios:
--
-- A) Compromisos de Mejoramiento (gap C2 documentado en AGENTS.md):
--    1. Agrega periodo_id (cada CM debe estar vinculado al periodo evaluado)
--    2. Agrega plazo_cumplimiento (date) para fijar la fecha limite
--    3. Agrega estado_aprobacion y seguimiento_actual (avance %)
--    4. Cambia estado ENUM para incluir 'vencido' cuando se pasa del plazo
--    5. Crea tabla compromiso_mejoramiento_seguimientos (historial)
--
-- B) Evidencias (per requerimiento explicito del usuario: soportar foto,
--    PDF, Word, Excel y demas formatos permitidos por el negocio):
--    1. Agrega columnas archivo_nombre, archivo_mime, archivo_path,
--       archivo_tamano a la tabla evidencias (soporte de adjuntos)
--    2. Hace ubicacion opcional (NULL permitido) cuando hay archivo adjunto
--
-- C) Evaluaciones (extendidas para registrar 2da pregunta CNSC
--    "excede lo estipulado" como campo propio, antes iba en justificacion
--    genérica):
--    1. Cambia aporte_adicional ENUM para permitir 'moderadamente' como
--       válido (la respuesta C del frontend)
--    2. Agrega 'evidencias' cuenta directa en evaluaciones para reportes

ALTER TABLE `compromisos_mejoramiento`
  ADD COLUMN `periodo_id` bigint(20) unsigned NULL AFTER `compromiso_id`,
  ADD COLUMN `plazo_cumplimiento` date NULL AFTER `acciones_mejoramiento`,
  ADD COLUMN `estado_aprobacion` enum('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente' AFTER `estado`,
  ADD COLUMN `avance_porcentaje` int(3) NOT NULL DEFAULT 0 AFTER `estado_aprobacion`,
  ADD KEY `idx_cm_periodo` (`periodo_id`),
  ADD KEY `idx_cm_conc` (`concertacion_id`),
  ADD CONSTRAINT `fk_compromisos_mejoramiento_periodo`
    FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS `compromiso_mejoramiento_seguimientos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `compromiso_mejoramiento_id` bigint(20) unsigned NOT NULL,
  `registrado_por` bigint(20) unsigned NOT NULL,
  `avance` int(3) NOT NULL DEFAULT 0,
  `observacion` text NULL,
  `evidencia_descripcion` text NULL,
  `evidencia_archivo` varchar(500) NULL,
  `evidencia_tipo` varchar(80) NULL,
  `evidencia_tamano` int(11) NULL,
  `fecha_seguimiento` datetime NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_cms_cm` (`compromiso_mejoramiento_id`),
  KEY `idx_cms_user` (`registrado_por`),
  CONSTRAINT `fk_cms_cm` FOREIGN KEY (`compromiso_mejoramiento_id`) REFERENCES `compromisos_mejoramiento` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cms_user` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrar tabla existente mejoramiento_seguimientos si existe (compatibilidad)
INSERT IGNORE INTO `compromiso_mejoramiento_seguimientos`
  (id, compromiso_mejoramiento_id, registrado_por, avance, observacion, fecha_seguimiento, creado_en)
SELECT id, compromiso_mejoramiento_id, registrado_por, avance, observacion, fecha_seguimiento, creado_en
FROM `mejoramiento_seguimientos`
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'mejoramiento_seguimientos');

ALTER TABLE `evidencias`
  MODIFY COLUMN `ubicacion` text NULL,
  ADD COLUMN `archivo_nombre` varchar(255) NULL AFTER `ubicacion`,
  ADD COLUMN `archivo_mime` varchar(120) NULL AFTER `archivo_nombre`,
  ADD COLUMN `archivo_path` varchar(500) NULL AFTER `archivo_mime`,
  ADD COLUMN `archivo_tamano` int(11) NULL AFTER `archivo_path`;

ALTER TABLE `evaluaciones`
  MODIFY COLUMN `aporte_adicional` enum('si','moderadamente','no') NULL;
