-- ============================================================================
-- EDL-CAREPA - Esquema de Base de Datos
-- Sistema de Evaluacion del Desempeno Laboral
-- Alcaldia de Carepa, Antioquia
-- ============================================================================
-- Motor: MariaDB / MySQL 8.0+
-- Charset: utf8mb4_unicode_ci
-- 23 tablas con foreign keys e indices
-- ============================================================================

DROP DATABASE IF EXISTS edl_carepa;
CREATE DATABASE edl_carepa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edl_carepa;

CREATE TABLE `auditoria` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned DEFAULT NULL,
  `accion` varchar(50) NOT NULL,
  `entidad` varchar(50) NOT NULL,
  `registro_id` bigint(20) unsigned DEFAULT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_accion` (`accion`),
  KEY `idx_entidad_registro` (`entidad`,`registro_id`),
  KEY `idx_fecha` (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `ausentismos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `funcionario_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('licencia','permiso','incapacidad','vacacion','comision','otro') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dias_habiles` decimal(5,1) NOT NULL DEFAULT 0.0,
  `justificado` tinyint(1) NOT NULL DEFAULT 1,
  `observaciones` text DEFAULT NULL,
  `estado` enum('vigente','finalizado','anulado') NOT NULL DEFAULT 'vigente',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_funcionario` (`funcionario_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_aus_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `cargas_masivas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('usuarios','concertaciones','evaluaciones','cursos_induccion') NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `registros_total` int(10) unsigned DEFAULT 0,
  `registros_exitosos` int(10) unsigned DEFAULT 0,
  `registros_fallidos` int(10) unsigned DEFAULT 0,
  `estado` enum('pendiente','procesando','completado','error') NOT NULL DEFAULT 'pendiente',
  `resultado_detalle` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resultado_detalle`)),
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_carga_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `compromisos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `evaluacion_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('funcional','comportamental') NOT NULL DEFAULT 'funcional',
  `peso` decimal(5,2) NOT NULL DEFAULT 0.00,
  `descripcion` text NOT NULL,
  `plazo` date DEFAULT NULL,
  `responsable_id` bigint(20) unsigned NOT NULL,
  `evaluador_id` bigint(20) unsigned DEFAULT NULL,
  `observaciones_evaluador` text DEFAULT NULL,
  `estado` enum('propuesto','aprobado','devuelto','en_progreso','cumplido','incumplido','vencido') NOT NULL DEFAULT 'propuesto',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  `resultado_esperado` text DEFAULT NULL,
  `medio_verificacion` varchar(500) DEFAULT NULL,
  `calificacion` decimal(5,2) DEFAULT NULL,
  `observaciones_evaluado` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_evaluacion` (`evaluacion_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_responsable` (`responsable_id`),
  KEY `idx_estado` (`estado`),
  KEY `fk_comp_evaluador` (`evaluador_id`),
  KEY `idx_compromisos_estado` (`estado`),
  CONSTRAINT `fk_comp_evaluacion` FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comp_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comp_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `concertaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `meta_id` bigint(20) unsigned NOT NULL,
  `evaluador_id` bigint(20) unsigned NOT NULL,
  `funcionario_id` bigint(20) unsigned NOT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` enum('pendiente','concertada','no_concertada','revisada','aprobada') NOT NULL DEFAULT 'pendiente',
  `fecha_concertacion` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_meta` (`meta_id`),
  KEY `idx_evaluador` (`evaluador_id`),
  KEY `idx_funcionario` (`funcionario_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_conc_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conc_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conc_meta` FOREIGN KEY (`meta_id`) REFERENCES `metas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `curso_participantes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `curso_id` bigint(20) unsigned NOT NULL,
  `funcionario_id` bigint(20) unsigned NOT NULL,
  `estado` enum('inscrito','asistio','no_asistio','aprobado','reprobado') NOT NULL DEFAULT 'inscrito',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_curso_funcionario` (`curso_id`,`funcionario_id`),
  KEY `idx_funcionario` (`funcionario_id`),
  CONSTRAINT `fk_cp_curso` FOREIGN KEY (`curso_id`) REFERENCES `cursos_induccion` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `cursos_induccion` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `duracion_horas` int(10) unsigned DEFAULT NULL,
  `entidad_id` bigint(20) unsigned DEFAULT NULL,
  `estado` enum('programado','en_curso','finalizado','cancelado') NOT NULL DEFAULT 'programado',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_entidad` (`entidad_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_curso_entidad` FOREIGN KEY (`entidad_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `dependencias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `entidad_id` bigint(20) unsigned NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `jefe_id` bigint(20) unsigned DEFAULT NULL,
  `estado` enum('activa','inactiva') NOT NULL DEFAULT 'activa',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_entidad_codigo` (`entidad_id`,`codigo`),
  KEY `idx_jefe` (`jefe_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_dep_entidad` FOREIGN KEY (`entidad_id`) REFERENCES `entidades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dep_jefe` FOREIGN KEY (`jefe_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `entidades` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `tipo` enum('entidad','organismo','instituto','superintendencia','agencia','otro') NOT NULL,
  `nit` varchar(20) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `estado` enum('activa','inactiva') NOT NULL DEFAULT 'activa',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_codigo` (`codigo`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `evaluaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `periodo_id` bigint(20) unsigned NOT NULL,
  `evaluado_id` bigint(20) unsigned NOT NULL,
  `evaluador_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('parcial_semestral','parcial_eventual','definitiva') NOT NULL,
  `puntaje` decimal(5,2) DEFAULT NULL,
  `estado` enum('pendiente','concertacion','en_proceso','calificada','aprobada_comision','cerrada') NOT NULL DEFAULT 'pendiente',
  `fecha_evaluacion` datetime DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  `es_comision_evaluadora` tinyint(1) DEFAULT 0,
  `comision_evaluadora_id` bigint(20) unsigned DEFAULT NULL,
  `calificacion_definitiva` decimal(5,2) DEFAULT NULL,
  `fecha_concertacion` date DEFAULT NULL,
  `fecha_calificacion` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_evaluado` (`evaluado_id`),
  KEY `idx_evaluador` (`evaluador_id`),
  KEY `idx_tipo_estado` (`tipo`,`estado`),
  CONSTRAINT `fk_eval_evaluado` FOREIGN KEY (`evaluado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eval_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eval_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `evidencias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `meta_id` bigint(20) unsigned DEFAULT NULL,
  `compromiso_id` bigint(20) unsigned DEFAULT NULL,
  `subido_por` bigint(20) unsigned NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tipo_mime` varchar(100) DEFAULT NULL,
  `tamano_bytes` bigint(20) unsigned DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('pendiente','verificada','rechazada') NOT NULL DEFAULT 'pendiente',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  `tipo` enum('compromiso','competencia','general') DEFAULT 'general',
  PRIMARY KEY (`id`),
  KEY `idx_meta` (`meta_id`),
  KEY `idx_compromiso` (`compromiso_id`),
  KEY `idx_subido_por` (`subido_por`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_evi_compromiso` FOREIGN KEY (`compromiso_id`) REFERENCES `compromisos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_evi_meta` FOREIGN KEY (`meta_id`) REFERENCES `metas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_evi_usuario` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `metas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `periodo_id` bigint(20) unsigned NOT NULL,
  `funcionario_id` bigint(20) unsigned NOT NULL,
  `evaluador_id` bigint(20) unsigned NOT NULL,
  `descripcion` text NOT NULL,
  `tipo` enum('cualitativa','cuantitativa','mixta') NOT NULL DEFAULT 'cuantitativa',
  `peso` decimal(5,2) NOT NULL DEFAULT 0.00,
  `indicador` varchar(255) DEFAULT NULL,
  `meta_numerica` decimal(12,2) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `estado` enum('pendiente','concertada','aprobada','en_seguimiento','evaluada','cerrada') NOT NULL DEFAULT 'pendiente',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_funcionario` (`funcionario_id`),
  KEY `idx_evaluador` (`evaluador_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_meta_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meta_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meta_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `movilidades` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `funcionario_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('ascenso','traslado','encargo','comision','reintegro','retiro','otro') NOT NULL,
  `entidad_origen_id` bigint(20) unsigned DEFAULT NULL,
  `dependencia_origen_id` bigint(20) unsigned DEFAULT NULL,
  `entidad_destino_id` bigint(20) unsigned DEFAULT NULL,
  `dependencia_destino_id` bigint(20) unsigned DEFAULT NULL,
  `fecha_movimiento` date NOT NULL,
  `acto_administrativo` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` enum('tramite','aprobado','ejecutado','anulado') NOT NULL DEFAULT 'tramite',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_funcionario` (`funcionario_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_entidad_origen` (`entidad_origen_id`),
  KEY `idx_entidad_destino` (`entidad_destino_id`),
  KEY `idx_estado` (`estado`),
  KEY `fk_mov_dep_origen` (`dependencia_origen_id`),
  KEY `fk_mov_dep_destino` (`dependencia_destino_id`),
  CONSTRAINT `fk_mov_dep_destino` FOREIGN KEY (`dependencia_destino_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_dep_origen` FOREIGN KEY (`dependencia_origen_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_ent_destino` FOREIGN KEY (`entidad_destino_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_ent_origen` FOREIGN KEY (`entidad_origen_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `notificaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('info','alerta','error','exito') NOT NULL DEFAULT 'info',
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_leida` (`leida`),
  CONSTRAINT `fk_not_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `parametros` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `tipo` enum('texto','numero','booleano','json') NOT NULL DEFAULT 'texto',
  `descripcion` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `periodos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('configuracion','concertacion','seguimiento','evaluacion','calificacion','cerrado') NOT NULL DEFAULT 'configuracion',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  `fecha_inicio_concertacion` date DEFAULT NULL,
  `fecha_fin_concertacion` date DEFAULT NULL,
  `fecha_inicio_evaluacion` date DEFAULT NULL,
  `fecha_fin_evaluacion` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `permisos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(80) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_codigo` (`codigo`),
  KEY `idx_modulo` (`modulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `recuperaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `utilizado` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_token` (`token`(64)),
  CONSTRAINT `fk_rec_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `rol_permiso` (
  `rol_id` bigint(20) unsigned NOT NULL,
  `permiso_id` bigint(20) unsigned NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`rol_id`,`permiso_id`),
  KEY `idx_permiso` (`permiso_id`),
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sesiones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `revocada` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_token` (`token_hash`(64)),
  KEY `idx_expiracion` (`fecha_expiracion`),
  CONSTRAINT `fk_ses_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `usuario_rol` (
  `usuario_id` bigint(20) unsigned NOT NULL,
  `rol_id` bigint(20) unsigned NOT NULL,
  `entidad_id` bigint(20) unsigned DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`rol_id`),
  KEY `idx_rol` (`rol_id`),
  KEY `idx_entidad` (`entidad_id`),
  CONSTRAINT `fk_ur_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `usuarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `documento` varchar(30) NOT NULL,
  `tipo_documento` varchar(5) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
  `intentos_fallidos` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `ultimo_acceso` datetime DEFAULT NULL,
  `entidad_id` bigint(20) unsigned DEFAULT NULL,
  `dependencia_id` bigint(20) unsigned DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `grado` varchar(20) DEFAULT NULL,
  `tipo_vinculacion` enum('planta','contrato','provisional','encargo','comision') DEFAULT NULL,
  `fecha_vinculacion` date DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_documento` (`documento`,`tipo_documento`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_entidad` (`entidad_id`),
  KEY `idx_dependencia` (`dependencia_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_usu_dependencia` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_usu_entidad` FOREIGN KEY (`entidad_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DELIMITER ;;
CREATE TRIGGER trg_usuarios_audit AFTER UPDATE ON usuarios FOR EACH ROW
BEGIN
 INSERT INTO auditoria (usuario_id, accion, entidad, registro_id, datos_anteriores, datos_nuevos)
 VALUES (NEW.id, 'actualizar', 'usuarios', NEW.id,
 JSON_OBJECT('nombres', OLD.nombres, 'apellidos', OLD.apellidos, 'estado', OLD.estado, 'email', OLD.email),
 JSON_OBJECT('nombres', NEW.nombres, 'apellidos', NEW.apellidos, 'estado', NEW.estado, 'email', NEW.email)
 );
END;;
DELIMITER ;