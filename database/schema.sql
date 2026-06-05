-- ============================================================================
-- EDL-CAREPA - Esquema de Base de Datos
-- Sistema de Evaluacion del Desempeno Laboral
-- Alcaldia de Carepa, Antioquia
-- ============================================================================
-- Motor: MariaDB / MySQL 8.0+
-- Charset: utf8mb4_unicode_ci
-- Alineado con documentacion EDL APP CNSC Acuerdo 617 de 2018
-- ============================================================================

DROP DATABASE IF EXISTS edl_carepa;
CREATE DATABASE edl_carepa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edl_carepa;

-- ============================================================================
-- TABLAS BASE
-- ============================================================================

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

CREATE TABLE `rol_permiso` (
 `rol_id` bigint(20) unsigned NOT NULL,
 `permiso_id` bigint(20) unsigned NOT NULL,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`rol_id`,`permiso_id`),
 KEY `idx_permiso` (`permiso_id`),
 CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_rp_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
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

-- ============================================================================
-- USUARIOS (campos completos segun EDL APP CNSC)
-- ============================================================================

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

CREATE TABLE `usuarios` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `documento` varchar(30) NOT NULL,
 `tipo_documento` enum('CC','CE','PA','TI','RC','DIP','NIT') NOT NULL DEFAULT 'CC',
 `genero` enum('masculino','femenino','otro') DEFAULT NULL,
 `primer_nombre` varchar(60) NOT NULL,
 `segundo_nombre` varchar(60) DEFAULT NULL,
 `primer_apellido` varchar(60) NOT NULL,
 `segundo_apellido` varchar(60) DEFAULT NULL,
 `email` varchar(150) NOT NULL,
 `email_confirmado` tinyint(1) NOT NULL DEFAULT 0,
 `telefono1` varchar(30) DEFAULT NULL,
 `telefono2` varchar(30) DEFAULT NULL,
 `password_hash` varchar(255) NOT NULL,
 `estado` enum('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
 `intentos_fallidos` tinyint(3) unsigned NOT NULL DEFAULT 0,
 `ultimo_acceso` datetime DEFAULT NULL,
 `entidad_id` bigint(20) unsigned DEFAULT NULL,
 `dependencia_id` bigint(20) unsigned DEFAULT NULL,
 `es_contratista` tinyint(1) NOT NULL DEFAULT 0,
 `nivel` enum('directivo','asesor','profesional','tecnico','asistencial') DEFAULT NULL,
 `naturaleza` enum('carrera_administrativa','libre_nombramiento','libre_nombramiento_gerencia_publica') DEFAULT NULL,
 `tipo_nombramiento` enum('hecho_en_carrera','periodo_de_prueba','provisional','encargo_planta_global','encargo_planta_temporal','encargo_vacancia_definitiva','encargo_vacancia_temporal') DEFAULT NULL,
 `denominacion_empleo` varchar(200) DEFAULT NULL,
 `codigo_empleo` varchar(30) DEFAULT NULL,
 `grado_empleo` varchar(10) DEFAULT NULL,
 `es_evaluador_y_evaluado` tinyint(1) NOT NULL DEFAULT 0,
 `dependencia_evaluacion_id` bigint(20) unsigned DEFAULT NULL,
 `en_periodo_prueba` tinyint(1) NOT NULL DEFAULT 0,
 `fecha_posesion` date DEFAULT NULL,
 `proposito_principal_empleo` text DEFAULT NULL,
 `evaluacion_inicio_febrero` tinyint(1) NOT NULL DEFAULT 1,
 `debe_cambiar_password` tinyint(1) NOT NULL DEFAULT 0,
 `fecha_inicio_evaluacion` date DEFAULT NULL,
 `motivo_fecha_inicio_diferente` enum('terminacion_periodo_prueba','terminacion_vacancia_temporal','regreso_vacaciones','regreso_incapacidad','regreso_encargo','regreso_comision_servicios','regreso_licencia','suspension_ejercicio_cargo','otro') DEFAULT NULL,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_documento` (`documento`,`tipo_documento`),
 UNIQUE KEY `uk_email` (`email`),
 KEY `idx_entidad` (`entidad_id`),
 KEY `idx_dependencia` (`dependencia_id`),
 KEY `idx_estado` (`estado`),
 KEY `idx_naturaleza` (`naturaleza`),
 KEY `idx_dependencia_evaluacion` (`dependencia_evaluacion_id`),
 CONSTRAINT `fk_usu_dependencia` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_usu_entidad` FOREIGN KEY (`entidad_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_usu_dep_evaluacion` FOREIGN KEY (`dependencia_evaluacion_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL
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

-- ============================================================================
-- PERIODOS Y METAS
-- ============================================================================

CREATE TABLE `periodos` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `nombre` varchar(100) NOT NULL,
 `anio` varchar(9) NOT NULL,
 `fecha_inicio` date NOT NULL,
 `fecha_fin` date NOT NULL,
 `estado` enum('configuracion','concertacion','seguimiento','evaluacion','calificacion','cerrado') NOT NULL DEFAULT 'configuracion',
 `fecha_inicio_concertacion` date DEFAULT NULL,
 `fecha_fin_concertacion` date DEFAULT NULL,
 `fecha_inicio_seguimiento` date DEFAULT NULL,
 `fecha_fin_seguimiento` date DEFAULT NULL,
 `fecha_inicio_evaluacion` date DEFAULT NULL,
 `fecha_fin_evaluacion` date DEFAULT NULL,
 `fecha_inicio_calificacion` date DEFAULT NULL,
 `fecha_fin_calificacion` date DEFAULT NULL,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_estado` (`estado`),
 KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `metas` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `periodo_id` bigint(20) unsigned NOT NULL,
 `dependencia_id` bigint(20) unsigned NOT NULL,
 `descripcion` text NOT NULL,
 `estado` enum('activa','inactiva') NOT NULL DEFAULT 'activa',
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_periodo` (`periodo_id`),
 KEY `idx_dependencia` (`dependencia_id`),
 KEY `idx_estado` (`estado`),
 CONSTRAINT `fk_meta_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_meta_dependencia` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CONCERTACIONES (modulo central EDL APP)
-- ============================================================================

CREATE TABLE `concertaciones` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `periodo_id` bigint(20) unsigned NOT NULL,
 `evaluador_id` bigint(20) unsigned NOT NULL,
 `evaluado_id` bigint(20) unsigned NOT NULL,
 `tipo_concertacion` enum('concertacion_bilateral','fijados_evaluador') NOT NULL DEFAULT 'concertacion_bilateral',
 `conformar_comision_evaluadora` tinyint(1) NOT NULL DEFAULT 0,
 `comision_evaluador_id` bigint(20) unsigned DEFAULT NULL,
 `evaluador_no_jefe` tinyint(1) NOT NULL DEFAULT 0,
 `motivo_no_jefe` enum('retiro_empleado_responsable','impedimento','recusacion') DEFAULT NULL,
 `estado` enum('pendiente','concertada','propuesta_evaluado','aprobada_evaluado','rechazada_evaluado','fijada') NOT NULL DEFAULT 'pendiente',
 `observaciones` text DEFAULT NULL,
 `fecha_concertacion` datetime DEFAULT NULL,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_periodo` (`periodo_id`),
 KEY `idx_evaluador` (`evaluador_id`),
 KEY `idx_evaluado` (`evaluado_id`),
 KEY `idx_estado` (`estado`),
 UNIQUE KEY `uk_periodo_evaluado` (`periodo_id`, `evaluado_id`),
 CONSTRAINT `fk_conc_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_conc_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_conc_evaluado` FOREIGN KEY (`evaluado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_conc_comision` FOREIGN KEY (`comision_evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- COMPROMISOS (funcionales + comportamentales)
-- ============================================================================

CREATE TABLE `compromisos` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `concertacion_id` bigint(20) unsigned NOT NULL,
 `tipo` enum('funcional','comportamental') NOT NULL DEFAULT 'funcional',
 `meta_id` bigint(20) unsigned DEFAULT NULL,
 `descripcion` text NOT NULL,
 `peso` decimal(5,2) NOT NULL DEFAULT 0.00,
 `competencia_codigo` varchar(60) DEFAULT NULL,
 `propuesto_por_jefe_entidad` tinyint(1) NOT NULL DEFAULT 0,
 `estado` enum('propuesto','aprobado','devuelto','en_progreso','cumplido','incumplido') NOT NULL DEFAULT 'propuesto',
 `calificacion` decimal(5,2) DEFAULT NULL,
 `frecuencia` enum('nunca','algunas_veces','frecuentemente','siempre') DEFAULT NULL,
 `nivel_comportamental` enum('bajo','aceptable','alto','muy_alto') DEFAULT NULL,
 `puntaje_comportamental` decimal(5,2) DEFAULT NULL,
 `impacto_aporta_compromisos` enum('si','moderadamente','no') DEFAULT NULL,
 `impacto_excede_estipulado` enum('si','no') DEFAULT NULL,
 `justificacion_excede` text DEFAULT NULL,
 `observaciones_evaluador` text DEFAULT NULL,
 `observaciones_evaluado` text DEFAULT NULL,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_concertacion` (`concertacion_id`),
 KEY `idx_tipo` (`tipo`),
 KEY `idx_estado` (`estado`),
 KEY `idx_meta` (`meta_id`),
 KEY `idx_competencia` (`competencia_codigo`),
 CONSTRAINT `fk_comp_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_comp_meta` FOREIGN KEY (`meta_id`) REFERENCES `metas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EVALUACIONES (tipos segun EDL APP CNSC)
-- ============================================================================

CREATE TABLE `evaluaciones` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `periodo_id` bigint(20) unsigned NOT NULL,
 `evaluado_id` bigint(20) unsigned NOT NULL,
 `evaluador_id` bigint(20) unsigned NOT NULL,
 `concertacion_id` bigint(20) unsigned DEFAULT NULL,
 `tipo` enum('parcial_primer_semestre','parcial_segundo_semestre','parcial_eventual','calificacion_definitiva','calificacion_extraordinaria') NOT NULL,
 `motivo_parcial_eventual` enum('cambio_evaluador','lapso_ultima_evaluacion','periodo_prueba_otro_empleo','separacion_temporal_mas_30_dias','cambio_empleo_traslado') DEFAULT NULL,
 `motivo_extraordinaria` text DEFAULT NULL,
 `evaluador_no_jefe` tinyint(1) NOT NULL DEFAULT 0,
 `motivo_no_jefe` enum('retiro_empleado_responsable','impedimento','recusacion') DEFAULT NULL,
 `fecha_inicio` date DEFAULT NULL,
 `fecha_fin` date DEFAULT NULL,
 `nota_funcionales` decimal(5,2) DEFAULT NULL,
 `nota_comportamentales` decimal(5,2) DEFAULT NULL,
 `calificacion_definitiva` decimal(5,2) DEFAULT NULL,
 `nivel_resultado` enum('sobresaliente','satisfactorio','no_satisfactorio') DEFAULT NULL,
 `estado` enum('pendiente','en_proceso','calificada','aprobada_comision','rechazada_comision','cerrada') NOT NULL DEFAULT 'pendiente',
 `es_comision_evaluadora` tinyint(1) DEFAULT 0,
 `comision_evaluadora_id` bigint(20) unsigned DEFAULT NULL,
 `fecha_evaluacion` datetime DEFAULT NULL,
 `fecha_calificacion` date DEFAULT NULL,
 `observaciones` text DEFAULT NULL,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_periodo` (`periodo_id`),
 KEY `idx_evaluado` (`evaluado_id`),
 KEY `idx_evaluador` (`evaluador_id`),
 KEY `idx_concertacion` (`concertacion_id`),
 KEY `idx_tipo_estado` (`tipo`,`estado`),
 KEY `idx_comision` (`comision_evaluadora_id`),
 CONSTRAINT `fk_eval_evaluado` FOREIGN KEY (`evaluado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_eval_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_eval_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_eval_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_eval_comision` FOREIGN KEY (`comision_evaluadora_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EVIDENCIAS (solo descriptivas, SIN archivos - EDL APP CNSC)
-- ============================================================================

CREATE TABLE `evidencias` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `concertacion_id` bigint(20) unsigned NOT NULL,
 `compromiso_id` bigint(20) unsigned DEFAULT NULL,
 `registrado_por` bigint(20) unsigned NOT NULL,
 `compromiso_competencia` varchar(255) NOT NULL,
 `descripcion` text NOT NULL,
 `ubicacion` text DEFAULT NULL,
 `observacion` text DEFAULT NULL,
 `tipo` enum('compromiso','competencia','general') DEFAULT 'general',
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_concertacion` (`concertacion_id`),
 KEY `idx_compromiso` (`compromiso_id`),
 KEY `idx_registrado_por` (`registrado_por`),
 CONSTRAINT `fk_evi_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_evi_compromiso` FOREIGN KEY (`compromiso_id`) REFERENCES `compromisos` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_evi_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- COMPROMISOS DE MEJORAMIENTO
-- ============================================================================

CREATE TABLE `compromisos_mejoramiento` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `concertacion_id` bigint(20) unsigned NOT NULL,
 `compromiso_id` bigint(20) unsigned DEFAULT NULL,
 `registrado_por` bigint(20) unsigned NOT NULL,
 `motivo` enum('nivel_no_satisfactorio','nivel_satisfactorio','solicitud_evaluado') NOT NULL,
 `aspecto_corregir` text NOT NULL,
 `acciones_mejoramiento` text NOT NULL,
 `observacion` text DEFAULT NULL,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_concertacion` (`concertacion_id`),
 KEY `idx_compromiso` (`compromiso_id`),
 KEY `idx_registrado_por` (`registrado_por`),
 CONSTRAINT `fk_mej_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_mej_compromiso` FOREIGN KEY (`compromiso_id`) REFERENCES `compromisos` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_mej_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUSENTISMOS (solo >30 dias, carrera administrativa o periodo prueba)
-- ============================================================================

CREATE TABLE `ausentismos` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `funcionario_id` bigint(20) unsigned NOT NULL,
 `motivo` enum('incapacidad','comision','encargo','suspension','licencias','vacaciones','otro') NOT NULL,
 `fecha_inicio` date NOT NULL,
 `fecha_fin` date NOT NULL,
 `dias` int(10) unsigned NOT NULL DEFAULT 0,
 `observaciones` text DEFAULT NULL,
 `estado` enum('vigente','finalizado','anulado') NOT NULL DEFAULT 'vigente',
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `eliminado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_funcionario` (`funcionario_id`),
 KEY `idx_motivo` (`motivo`),
 KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
 KEY `idx_estado` (`estado`),
 CONSTRAINT `fk_aus_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MOVILIDADES, NOTIFICACIONES, CARGAS MASIVAS
-- ============================================================================

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
 KEY `idx_estado` (`estado`),
 CONSTRAINT `fk_mov_ent_origen` FOREIGN KEY (`entidad_origen_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_mov_ent_destino` FOREIGN KEY (`entidad_destino_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_mov_dep_origen` FOREIGN KEY (`dependencia_origen_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
 CONSTRAINT `fk_mov_dep_destino` FOREIGN KEY (`dependencia_destino_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
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

CREATE TABLE `cargas_masivas` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `usuario_id` bigint(20) unsigned NOT NULL,
 `tipo` enum('usuarios','concertaciones','evaluaciones') NOT NULL,
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

-- ============================================================================
-- TRIGGER AUDITORIA USUARIOS
-- ============================================================================

DELIMITER ;;
CREATE TRIGGER trg_usuarios_audit AFTER UPDATE ON usuarios FOR EACH ROW
BEGIN
 INSERT INTO auditoria (usuario_id, accion, entidad, registro_id, datos_anteriores, datos_nuevos)
 VALUES (NEW.id, 'actualizar', 'usuarios', NEW.id,
 JSON_OBJECT('primer_nombre', OLD.primer_nombre, 'primer_apellido', OLD.primer_apellido, 'estado', OLD.estado, 'email', OLD.email),
 JSON_OBJECT('primer_nombre', NEW.primer_nombre, 'primer_apellido', NEW.primer_apellido, 'estado', NEW.estado, 'email', NEW.email)
 );
END;;
DELIMITER ;

-- ============================================================================
-- TABLA CSRF TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS `csrf_tokens` (
 `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
 `token` varchar(64) NOT NULL,
 `expiracion` datetime NOT NULL,
 `utilizado` tinyint(1) NOT NULL DEFAULT 0,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 `utilizado_en` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_token` (`token`),
 KEY `idx_expiracion` (`expiracion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA MEJORAMIENTO SEGUIMIENTOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS `mejoramiento_seguimientos` (
 `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
 `compromiso_mejoramiento_id` int(10) unsigned NOT NULL,
 `registrado_por` int(10) unsigned NOT NULL,
 `avance` int(11) NOT NULL DEFAULT 0,
 `observacion` text DEFAULT NULL,
 `fecha_seguimiento` datetime NOT NULL,
 `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 KEY `idx_mejoramiento` (`compromiso_mejoramiento_id`),
 KEY `idx_registrado_por` (`registrado_por`),
 CONSTRAINT `fk_seguimiento_mejoramiento` FOREIGN KEY (`compromiso_mejoramiento_id`) REFERENCES `compromisos_mejoramiento` (`id`) ON DELETE CASCADE,
 CONSTRAINT `fk_seguimiento_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
