-- Migration: 001_solicitudes_cambio_evaluador
-- Creado: 2026-06-30 20:36:15

CREATE TABLE `solicitudes_cambio_evaluador` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `evaluado_id` bigint(20) unsigned NOT NULL,
  `evaluador_actual_id` bigint(20) unsigned NOT NULL,
  `evaluador_sugerido_id` bigint(20) unsigned DEFAULT NULL,
  `motivo` enum('retiro_empleado_responsable','impedimento','recusacion') NOT NULL,
  `descripcion` text NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  `nuevo_evaluador_id` bigint(20) unsigned DEFAULT NULL,
  `decision_comentario` text DEFAULT NULL,
  `decidido_por` bigint(20) unsigned DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_evaluado` (`evaluado_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_nuevo_evaluador` (`nuevo_evaluador_id`),
  KEY `fk_sol_eval_actual` (`evaluador_actual_id`),
  KEY `fk_sol_eval_sugerido` (`evaluador_sugerido_id`),
  KEY `fk_sol_decidido_por` (`decidido_por`),
  CONSTRAINT `fk_sol_decidido_por` FOREIGN KEY (`decidido_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sol_eval_actual` FOREIGN KEY (`evaluador_actual_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sol_eval_sugerido` FOREIGN KEY (`evaluador_sugerido_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sol_evaluado` FOREIGN KEY (`evaluado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sol_nuevo_evaluador` FOREIGN KEY (`nuevo_evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historial_evaluadores` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `concertacion_id` bigint(20) unsigned DEFAULT NULL,
  `evaluador_anterior_id` bigint(20) unsigned NOT NULL,
  `evaluador_nuevo_id` bigint(20) unsigned NOT NULL,
  `motivo` varchar(100) NOT NULL,
  `solicitud_id` bigint(20) unsigned DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_concertacion` (`concertacion_id`),
  KEY `idx_solicitud` (`solicitud_id`),
  KEY `fk_hist_anterior` (`evaluador_anterior_id`),
  KEY `fk_hist_nuevo` (`evaluador_nuevo_id`),
  CONSTRAINT `fk_hist_anterior` FOREIGN KEY (`evaluador_anterior_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hist_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hist_nuevo` FOREIGN KEY (`evaluador_nuevo_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hist_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_cambio_evaluador` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permission
INSERT INTO permisos (codigo, nombre, modulo) VALUES ("jefe_personal.solicitudes", "Gestionar solicitudes de cambio de evaluador", "solicitudes");
SET @permId = LAST_INSERT_ID();
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id) VALUES (4, @permId), (5, @permId);
