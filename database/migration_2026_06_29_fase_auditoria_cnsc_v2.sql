-- Migracion: 2026-06-29_fase_auditoria_cnsc_v2
--
-- Continuacion de la migracion 2026_06_29_fase_auditoria_cnsc.sql que fallo
-- por referencias a la columna `estado` que no existe en
-- `compromisos_mejoramiento`. Aqui solo corregimos esos pasos.
--
-- Esta migracion es idempotente.

ALTER TABLE `compromisos_mejoramiento`
  ADD COLUMN `plazo_cumplimiento` date NULL AFTER `acciones_mejoramiento`,
  ADD COLUMN `estado_aprobacion` enum('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente' AFTER `observacion`,
  ADD COLUMN `avance_porcentaje` int(3) NOT NULL DEFAULT 0 AFTER `estado_aprobacion`;

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

ALTER TABLE `evidencias`
  MODIFY COLUMN `ubicacion` text NULL,
  ADD COLUMN `archivo_nombre` varchar(255) NULL AFTER `ubicacion`,
  ADD COLUMN `archivo_mime` varchar(120) NULL AFTER `archivo_nombre`,
  ADD COLUMN `archivo_path` varchar(500) NULL AFTER `archivo_mime`,
  ADD COLUMN `archivo_tamano` int(11) NULL AFTER `archivo_path`;

ALTER TABLE `evaluaciones`
  MODIFY COLUMN `aporte_adicional` enum('si','moderadamente','no') NULL;
