-- ============================================================================
-- MIGRACION: Modulo Evidencias - Solo descriptivo (sin upload de archivos)
-- Campos requeridos: compromiso_id, descripcion, ubicacion, observacion
-- Busqueda por: periodo_id + documento evaluado
-- Solo el usuario que creo el registro puede editarlo
-- ============================================================================

-- 1. Agregar columna periodo_id si no existe
ALTER TABLE evidencias
	ADD COLUMN IF NOT EXISTS periodo_id BIGINT UNSIGNED NULL AFTER compromiso_id;

-- 2. Agregar FK para periodo_id
ALTER TABLE evidencias
	ADD CONSTRAINT fk_evi_periodo
	FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL;

-- 3. Eliminar columnas de upload de archivos si existieran (legacy)
ALTER TABLE evidencias
	DROP COLUMN IF EXISTS nombre_archivo,
	DROP COLUMN IF EXISTS tipo_mime,
	DROP COLUMN IF EXISTS tamano_bytes,
	DROP COLUMN IF EXISTS ruta_archivo;

-- 4. Eliminar columnas legacy del modelo anterior
ALTER TABLE evidencias
	DROP COLUMN IF EXISTS subido_por,
	DROP COLUMN IF EXISTS estado;

-- 5. Agregar indice para busqueda por periodo
ALTER TABLE evidencias
	ADD INDEX IF NOT EXISTS idx_evi_periodo (periodo_id);

-- 6. Hacer ubicacion NOT NULL (es obligatoria segun spec)
ALTER TABLE evidencias
	MODIFY COLUMN ubicacion TEXT NOT NULL;

-- 7. Hacer compromiso_competencia nullable (se deriva del compromiso asociado)
ALTER TABLE evidencias
	MODIFY COLUMN compromiso_competencia VARCHAR(255) NULL;

-- ============================================================================
-- RESULTADO ESPERADO: Tabla evidencias con estas columnas:
--   id                  BIGINT UNSIGNED PK AUTO_INCREMENT
--   concertacion_id     BIGINT UNSIGNED NOT NULL (FK concertaciones)
--   compromiso_id       BIGINT UNSIGNED NULL (FK compromisos)
--   periodo_id          BIGINT UNSIGNED NULL (FK periodos)
--   registrado_por      BIGINT UNSIGNED NOT NULL (FK usuarios)
--   compromiso_competencia VARCHAR(255) NULL
--   descripcion         TEXT NOT NULL
--   ubicacion           TEXT NOT NULL
--   observacion         TEXT NULL
--   tipo                ENUM('compromiso','competencia','general') DEFAULT 'general'
--   creado_en           DATETIME NOT NULL DEFAULT current_timestamp()
--   actualizado_en      DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
--   eliminado_en        DATETIME NULL
-- ============================================================================
