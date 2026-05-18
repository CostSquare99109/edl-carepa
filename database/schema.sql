DROP DATABASE IF EXISTS edl_carepa;
CREATE DATABASE edl_carepa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edl_carepa;

CREATE TABLE usuarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    documento VARCHAR(30) NOT NULL,
    tipo_documento VARCHAR(5) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    estado ENUM('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
    intentos_fallidos TINYINT UNSIGNED NOT NULL DEFAULT 0,
    ultimo_acceso DATETIME DEFAULT NULL,
    entidad_id BIGINT UNSIGNED DEFAULT NULL,
    dependencia_id BIGINT UNSIGNED DEFAULT NULL,
    cargo VARCHAR(100) DEFAULT NULL,
    grado VARCHAR(20) DEFAULT NULL,
    tipo_vinculacion ENUM('planta','contrato','provisional','encargo','comision') DEFAULT NULL,
    fecha_vinculacion DATE DEFAULT NULL,
    intentos_login TINYINT UNSIGNED DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_documento (documento, tipo_documento),
    UNIQUE KEY uk_email (email),
    KEY idx_entidad (entidad_id),
    KEY idx_dependencia (dependencia_id),
    KEY idx_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE permisos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(80) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_codigo (codigo),
    KEY idx_modulo (modulo)
) ENGINE=InnoDB;

CREATE TABLE rol_permiso (
    rol_id BIGINT UNSIGNED NOT NULL,
    permiso_id BIGINT UNSIGNED NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rol_id, permiso_id),
    KEY idx_permiso (permiso_id),
    CONSTRAINT fk_rp_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permiso FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE usuario_rol (
    usuario_id BIGINT UNSIGNED NOT NULL,
    rol_id BIGINT UNSIGNED NOT NULL,
    entidad_id BIGINT UNSIGNED DEFAULT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, rol_id),
    KEY idx_rol (rol_id),
    KEY idx_entidad (entidad_id),
    CONSTRAINT fk_ur_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE entidades (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    tipo ENUM('entidad','organismo','instituto','superintendencia','agencia','otro') NOT NULL,
    nit VARCHAR(20) DEFAULT NULL,
    municipio VARCHAR(100) DEFAULT NULL,
    departamento VARCHAR(100) DEFAULT NULL,
    estado ENUM('activa','inactiva') NOT NULL DEFAULT 'activa',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_codigo (codigo),
    KEY idx_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE dependencias (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    entidad_id BIGINT UNSIGNED NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    jefe_id BIGINT UNSIGNED DEFAULT NULL,
    estado ENUM('activa','inactiva') NOT NULL DEFAULT 'activa',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_entidad_codigo (entidad_id, codigo),
    KEY idx_jefe (jefe_id),
    KEY idx_estado (estado),
    CONSTRAINT fk_dep_entidad FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_dep_jefe FOREIGN KEY (jefe_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

ALTER TABLE usuarios
    ADD CONSTRAINT fk_usu_entidad FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_usu_dependencia FOREIGN KEY (dependencia_id) REFERENCES dependencias(id) ON DELETE SET NULL;

CREATE TABLE periodos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('abierto','cerrado','en_concertacion','en_evaluacion','finalizado') NOT NULL DEFAULT 'abierto',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_estado (estado),
    KEY idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB;

CREATE TABLE metas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    periodo_id BIGINT UNSIGNED NOT NULL,
    funcionario_id BIGINT UNSIGNED NOT NULL,
    evaluador_id BIGINT UNSIGNED NOT NULL,
    descripcion TEXT NOT NULL,
    tipo ENUM('cualitativa','cuantitativa','mixta') NOT NULL DEFAULT 'cuantitativa',
    peso DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    indicador VARCHAR(255) DEFAULT NULL,
    meta_numerica DECIMAL(12,2) DEFAULT NULL,
    unidad_medida VARCHAR(50) DEFAULT NULL,
    estado ENUM('pendiente','concertada','aprobada','en_seguimiento','evaluada','cerrada') NOT NULL DEFAULT 'pendiente',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_periodo (periodo_id),
    KEY idx_funcionario (funcionario_id),
    KEY idx_evaluador (evaluador_id),
    KEY idx_estado (estado),
    CONSTRAINT fk_meta_periodo FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE,
    CONSTRAINT fk_meta_funcionario FOREIGN KEY (funcionario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_meta_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE concertaciones (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    meta_id BIGINT UNSIGNED NOT NULL,
    evaluador_id BIGINT UNSIGNED NOT NULL,
    funcionario_id BIGINT UNSIGNED NOT NULL,
    observaciones TEXT DEFAULT NULL,
    estado ENUM('pendiente','concertada','no_concertada','revisada','aprobada') NOT NULL DEFAULT 'pendiente',
    fecha_concertacion DATETIME DEFAULT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_meta (meta_id),
    KEY idx_evaluador (evaluador_id),
    KEY idx_funcionario (funcionario_id),
    KEY idx_estado (estado),
    CONSTRAINT fk_conc_meta FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE CASCADE,
    CONSTRAINT fk_conc_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_conc_funcionario FOREIGN KEY (funcionario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE evaluaciones (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    periodo_id BIGINT UNSIGNED NOT NULL,
    evaluado_id BIGINT UNSIGNED NOT NULL,
    evaluador_id BIGINT UNSIGNED NOT NULL,
    tipo ENUM('autoevaluacion','coevaluacion','heteroevaluacion') NOT NULL,
    puntaje DECIMAL(5,2) DEFAULT NULL,
    estado ENUM('pendiente','en_proceso','calificada','revisada','cerrada') NOT NULL DEFAULT 'pendiente',
    fecha_evaluacion DATETIME DEFAULT NULL,
    observaciones TEXT DEFAULT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_periodo (periodo_id),
    KEY idx_evaluado (evaluado_id),
    KEY idx_evaluador (evaluador_id),
    KEY idx_tipo_estado (tipo, estado),
    CONSTRAINT fk_eval_periodo FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_evaluado FOREIGN KEY (evaluado_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE compromisos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    evaluacion_id BIGINT UNSIGNED NOT NULL,
    tipo ENUM('competencia','mejoramiento') NOT NULL,
    descripcion TEXT NOT NULL,
    plazo DATE DEFAULT NULL,
    responsable_id BIGINT UNSIGNED NOT NULL,
    estado ENUM('pendiente','en_progreso','cumplido','incumplido','vencido') NOT NULL DEFAULT 'pendiente',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_evaluacion (evaluacion_id),
    KEY idx_tipo (tipo),
    KEY idx_responsable (responsable_id),
    KEY idx_estado (estado),
    CONSTRAINT fk_comp_evaluacion FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_comp_responsable FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE evidencias (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    meta_id BIGINT UNSIGNED DEFAULT NULL,
    compromiso_id BIGINT UNSIGNED DEFAULT NULL,
    subido_por BIGINT UNSIGNED NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100) DEFAULT NULL,
    tamano_bytes BIGINT UNSIGNED DEFAULT NULL,
    descripcion TEXT DEFAULT NULL,
    estado ENUM('pendiente','verificada','rechazada') NOT NULL DEFAULT 'pendiente',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_meta (meta_id),
    KEY idx_compromiso (compromiso_id),
    KEY idx_subido_por (subido_por),
    KEY idx_estado (estado),
    CONSTRAINT fk_evi_meta FOREIGN KEY (meta_id) REFERENCES metas(id) ON DELETE SET NULL,
    CONSTRAINT fk_evi_compromiso FOREIGN KEY (compromiso_id) REFERENCES compromisos(id) ON DELETE SET NULL,
    CONSTRAINT fk_evi_usuario FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ausentismos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    funcionario_id BIGINT UNSIGNED NOT NULL,
    tipo ENUM('licencia','permiso','incapacidad','vacacion','comision','otro') NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_habiles DECIMAL(5,1) NOT NULL DEFAULT 0.0,
    justificado TINYINT(1) NOT NULL DEFAULT 1,
    observaciones TEXT DEFAULT NULL,
    estado ENUM('vigente','finalizado','anulado') NOT NULL DEFAULT 'vigente',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_funcionario (funcionario_id),
    KEY idx_tipo (tipo),
    KEY idx_fechas (fecha_inicio, fecha_fin),
    KEY idx_estado (estado),
    CONSTRAINT fk_aus_funcionario FOREIGN KEY (funcionario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE movilidades (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    funcionario_id BIGINT UNSIGNED NOT NULL,
    tipo ENUM('ascenso','traslado','encargo','comision','reintegro','retiro','otro') NOT NULL,
    entidad_origen_id BIGINT UNSIGNED DEFAULT NULL,
    dependencia_origen_id BIGINT UNSIGNED DEFAULT NULL,
    entidad_destino_id BIGINT UNSIGNED DEFAULT NULL,
    dependencia_destino_id BIGINT UNSIGNED DEFAULT NULL,
    fecha_movimiento DATE NOT NULL,
    acto_administrativo VARCHAR(100) DEFAULT NULL,
    observaciones TEXT DEFAULT NULL,
    estado ENUM('tramite','aprobado','ejecutado','anulado') NOT NULL DEFAULT 'tramite',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_funcionario (funcionario_id),
    KEY idx_tipo (tipo),
    KEY idx_entidad_origen (entidad_origen_id),
    KEY idx_entidad_destino (entidad_destino_id),
    KEY idx_estado (estado),
    CONSTRAINT fk_mov_funcionario FOREIGN KEY (funcionario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_mov_ent_origen FOREIGN KEY (entidad_origen_id) REFERENCES entidades(id) ON DELETE SET NULL,
    CONSTRAINT fk_mov_dep_origen FOREIGN KEY (dependencia_origen_id) REFERENCES dependencias(id) ON DELETE SET NULL,
    CONSTRAINT fk_mov_ent_destino FOREIGN KEY (entidad_destino_id) REFERENCES entidades(id) ON DELETE SET NULL,
    CONSTRAINT fk_mov_dep_destino FOREIGN KEY (dependencia_destino_id) REFERENCES dependencias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE sesiones (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    fecha_expiracion DATETIME NOT NULL,
    revocada TINYINT(1) NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_usuario (usuario_id),
    KEY idx_token (token_hash(64)),
    KEY idx_expiracion (fecha_expiracion),
    CONSTRAINT fk_ses_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE recuperaciones (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    utilizado TINYINT(1) NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_usuario (usuario_id),
    KEY idx_token (token(64)),
    CONSTRAINT fk_rec_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE auditoria (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED DEFAULT NULL,
    accion VARCHAR(50) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    registro_id BIGINT UNSIGNED DEFAULT NULL,
    datos_anteriores JSON DEFAULT NULL,
    datos_nuevos JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_usuario (usuario_id),
    KEY idx_accion (accion),
    KEY idx_entidad_registro (entidad, registro_id),
    KEY idx_fecha (creado_en)
) ENGINE=InnoDB;

CREATE TABLE cargas_masivas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    tipo ENUM('usuarios','concertaciones','evaluaciones','cursos_induccion') NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    registros_total INT UNSIGNED DEFAULT 0,
    registros_exitosos INT UNSIGNED DEFAULT 0,
    registros_fallidos INT UNSIGNED DEFAULT 0,
    estado ENUM('pendiente','procesando','completado','error') NOT NULL DEFAULT 'pendiente',
    resultado_detalle JSON DEFAULT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_usuario (usuario_id),
    KEY idx_tipo (tipo),
    KEY idx_estado (estado),
    CONSTRAINT fk_carga_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cursos_induccion (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    duracion_horas INT UNSIGNED DEFAULT NULL,
    entidad_id BIGINT UNSIGNED DEFAULT NULL,
    estado ENUM('programado','en_curso','finalizado','cancelado') NOT NULL DEFAULT 'programado',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado_en DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_entidad (entidad_id),
    KEY idx_estado (estado),
    CONSTRAINT fk_curso_entidad FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE curso_participantes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    curso_id BIGINT UNSIGNED NOT NULL,
    funcionario_id BIGINT UNSIGNED NOT NULL,
    estado ENUM('inscrito','asistio','no_asistio','aprobado','reprobado') NOT NULL DEFAULT 'inscrito',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_curso_funcionario (curso_id, funcionario_id),
    KEY idx_funcionario (funcionario_id),
    CONSTRAINT fk_cp_curso FOREIGN KEY (curso_id) REFERENCES cursos_induccion(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_funcionario FOREIGN KEY (funcionario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM('info','alerta','error','exito') NOT NULL DEFAULT 'info',
    leida TINYINT(1) NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_usuario (usuario_id),
    KEY idx_leida (leida),
    CONSTRAINT fk_not_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE parametros (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    clave VARCHAR(100) NOT NULL,
    valor TEXT NOT NULL,
    tipo ENUM('texto','numero','booleano','json') NOT NULL DEFAULT 'texto',
    descripcion VARCHAR(255) DEFAULT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_clave (clave)
) ENGINE=InnoDB;

DELIMITER //
CREATE TRIGGER trg_auditoria_usuarios AFTER UPDATE ON usuarios FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, accion, entidad, registro_id, datos_anteriores, datos_nuevos)
    VALUES (NEW.id, 'actualizar', 'usuarios', NEW.id,
        JSON_OBJECT('nombres', OLD.nombres, 'apellidos', OLD.apellidos, 'estado', OLD.estado, 'email', OLD.email),
        JSON_OBJECT('nombres', NEW.nombres, 'apellidos', NEW.apellidos, 'estado', NEW.estado, 'email', NEW.email)
    );
END//
DELIMITER ;

CREATE USER IF NOT EXISTS 'edl_user'@'localhost' IDENTIFIED BY 'EdlCarepa2026!Sec';
GRANT SELECT, INSERT, UPDATE, DELETE ON edl_carepa.* TO 'edl_user'@'localhost';
FLUSH PRIVILEGES;