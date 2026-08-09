-- ============================================================================
-- SCHEMA: modelo normalizado del Manual de Funciones (Decreto 159/2024)
-- Proyecto edl-carepa (PHP 8.2 + MariaDB). Fuente: edl_carepa_normalizado.json
--
-- CONVENCIONES (consistencia con el proyecto):
--   * Motor InnoDB, charset utf8mb4, collation utf8mb4_unicode_ci
--   * FKs con CONSTRAINT nombrado (fk_<tabla>_<objeto>)
--   * Columnas de auditoria creado_en/actualizado_en como el resto del esquema
--
-- NOTA IMPORTANTE: la tabla `dependencias` YA EXISTE en la BD (modelo CNSC,
-- con entidad_id/codigo/jefe_id/estado) y esta en uso por cargos_manual y
-- usuarios. NO se recrea: el import resuelve dependencia_id por NOMBRE
-- normalizado contra la tabla existente (las 11 dependencias del JSON ya
-- existen en BD tras la sincronizacion previa).
--
-- Orden de ejecucion: schema.sql (este archivo) -> import.php
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Catalogo de naturalezas de cargo (4 registros del JSON)
-- (No confundir con naturalezas_cargo existente: modelo CNSC con otros codigos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogo_naturaleza_cargo (
  id TINYINT UNSIGNED NOT NULL,
  nombre VARCHAR(50) NOT NULL COMMENT 'codigo interno (carrera_administrativa, ...)',
  etiqueta VARCHAR(80) NOT NULL COMMENT 'etiqueta legible',
  creado_en DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uk_cat_nat_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Clases de empleo (118 registros, PK CLS-XXX)
--    requisitos_estructurados como COLUMNAS (no JSON) para filtrar/validar SQL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clases_empleo (
  id VARCHAR(10) NOT NULL COMMENT 'CLS-001 ... CLS-118',
  codigo VARCHAR(10) NOT NULL,
  grado VARCHAR(5) NOT NULL,
  denominacion VARCHAR(200) NOT NULL,
  nivel VARCHAR(20) NOT NULL COMMENT 'lowercase del JSON (tecnico con tilde, igual cargos_manual)',
  requisitos_estudio TEXT NULL,
  requisitos_experiencia TEXT NULL,
  nivel_educativo_minimo ENUM('bachiller','tecnico','tecnologico','profesional','especializacion') NULL,
  horas_curso_minimo SMALLINT UNSIGNED NULL,
  anios_experiencia DECIMAL(4,2) NULL,
  tipo_experiencia ENUM('ninguna','relacionada','profesional','docente') NULL,
  creado_en DATETIME NOT NULL DEFAULT current_timestamp(),
  actualizado_en DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_clase_codigo_grado (codigo, grado),
  KEY idx_clase_nivel (nivel),
  KEY idx_clase_denominacion (denominacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Catalogo de conocimientos basicos (213 registros CON-XXX)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogo_conocimientos_basicos (
  id VARCHAR(10) NOT NULL COMMENT 'CON-001 ... CON-213',
  nombre VARCHAR(300) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_ccb_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ----------------------------------------------------------------------------
-- 3. Puente N:N clases_empleo <-> catalogo_conocimientos_basicos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clases_empleo_conocimientos (
  clase_empleo_id VARCHAR(10) NOT NULL,
  conocimiento_id VARCHAR(10) NOT NULL COMMENT 'CON-XXX',
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (clase_empleo_id, conocimiento_id),
  KEY idx_cec_conocimiento (conocimiento_id),
  CONSTRAINT fk_cec_clase FOREIGN KEY (clase_empleo_id) REFERENCES clases_empleo (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cec_conocimiento FOREIGN KEY (conocimiento_id) REFERENCES catalogo_conocimientos_basicos (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Cargos (121 registros, PK GLO-XXX / TEM-XXX) - instancias de clase
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cargos (
  id VARCHAR(10) NOT NULL COMMENT 'GLO-001 ... TEM-021',
  clase_empleo_id VARCHAR(10) NOT NULL,
  dependencia_id BIGINT UNSIGNED NOT NULL COMMENT 'FK dependencias EXISTENTE (modelo CNSC)',
  naturaleza_cargo_id TINYINT UNSIGNED NOT NULL COMMENT 'FK catalogo_naturaleza_cargo',
  planta ENUM('global','temporal') NOT NULL,
  codigo VARCHAR(10) NOT NULL,
  grado VARCHAR(5) NOT NULL,
  denominacion VARCHAR(200) NOT NULL,
  nivel VARCHAR(20) NOT NULL,
  cargo_jefe_inmediato VARCHAR(200) NULL,
  no_cargos TINYINT UNSIGNED NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT current_timestamp(),
  actualizado_en DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_cargo_dependencia (dependencia_id),
  KEY idx_cargo_clase (clase_empleo_id),
  KEY idx_cargo_nivel (nivel),
  KEY idx_cargo_codigo_grado (codigo, grado),
  KEY idx_cargo_planta (planta),
  CONSTRAINT fk_cargo_clase FOREIGN KEY (clase_empleo_id) REFERENCES clases_empleo (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cargo_dependencia FOREIGN KEY (dependencia_id) REFERENCES dependencias (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cargo_naturaleza FOREIGN KEY (naturaleza_cargo_id) REFERENCES catalogo_naturaleza_cargo (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Funciones esenciales (1:N con cargos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cargo_funciones_esenciales (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cargo_id VARCHAR(10) NOT NULL,
  texto TEXT NOT NULL,
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cfe_cargo_orden (cargo_id, orden),
  CONSTRAINT fk_cfe_cargo FOREIGN KEY (cargo_id) REFERENCES cargos (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Contribuciones individuales (1:N con cargos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cargo_contribuciones_individuales (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cargo_id VARCHAR(10) NOT NULL,
  texto TEXT NOT NULL,
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cci_cargo_orden (cargo_id, orden),
  CONSTRAINT fk_cci_cargo FOREIGN KEY (cargo_id) REFERENCES cargos (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Competencias comunes (6 registros COM-XX)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competencias_comunes (
  id VARCHAR(10) NOT NULL COMMENT 'COM-01 ... COM-06',
  nombre VARCHAR(200) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uk_comp_comunes_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Competencias comportamentales por nivel (20 registros)
--    nivel normalizado a niveles_jerarquicos.codigo (sin tildes) por FK
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competencias_comportamentales (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nivel VARCHAR(20) NOT NULL COMMENT 'FK niveles_jerarquicos.codigo (normalizado: tecnico sin tilde)',
  nombre VARCHAR(200) NOT NULL,
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uk_cc_nivel_nombre (nivel, nombre),
  KEY idx_cc_nivel (nivel),
  CONSTRAINT fk_cc_nivel FOREIGN KEY (nivel) REFERENCES niveles_jerarquicos (codigo) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

