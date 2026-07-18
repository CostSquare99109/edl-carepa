-- ============================================================================
-- Migracion: Catalogos auxiliares para Manual de Funciones (Decreto 159/2024)
-- Fecha: 2026-07-17
-- Fase: 1 de 10 del plan de implementacion del Manual de Funciones
-- Origen: Vault Documentos-Institucionales/Analisis-Decreto-159-2024/
-- ============================================================================
--
-- Crea 4 tablas que NO estaban modeladas en BD y que el Decreto exige:
--   1. niveles_jerarquicos: 5 niveles del art. 4 Decreto 785/2005
--   2. naturalezas_cargo: 6 naturalezas posibles del cargo publico
--   3. nucleos_basicos_conocimiento: 55 NBC del SNIES (Decreto 1083/2015 art. 2.2.3.5)
--   4. cargos_manual_requisitos: estructura para Seccion VII (requisitos de estudio/experiencia)
--
-- Idempotente: CREATE TABLE IF NOT EXISTS / INSERT IGNORE.
-- Charset obligatorio del proyecto: utf8mb4_unicode_ci.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 Niveles Jerarquicos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS niveles_jerarquicos (
  codigo VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  orden TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO niveles_jerarquicos (codigo, nombre, descripcion, orden) VALUES
  ('directivo', 'Directivo', 'Empleos a los cuales corresponden funciones de Direccion General, formulacion de politicas institucionales y adopcion de planes, programas y proyectos.', 1),
  ('asesor', 'Asesor', 'Empleos cuyas funciones consisten en asistir, aconsejar y asesorar directamente a los empleados publicos de la alta direccion territorial.', 2),
  ('profesional', 'Profesional', 'Empleos cuya naturaleza demanda la ejecucion y aplicacion de los conocimientos propios de cualquier carrera profesional, diferente a la tecnica profesional y tecnologica, reconocida por la ley.', 3),
  ('tecnico', 'Tecnico', 'Empleos cuyas funciones exigen el desarrollo de procesos y procedimientos en labores tecnicas misionales y de apoyo, asi como las relacionadas con la aplicacion de la ciencia y la tecnologia.', 4),
  ('asistencial', 'Asistencial', 'Empleos cuyas funciones implican el ejercicio de actividades de apoyo y complementarias de las tareas propias de los niveles superiores o de labores que se caracterizan por el predominio de actividades manuales o tareas de simple ejecucion.', 5);

-- ----------------------------------------------------------------------------
-- 1.2 Naturalezas del Cargo
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS naturalezas_cargo (
  codigo VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion TEXT,
  requiere_periodo TINYINT(1) DEFAULT 0,
  es_carrera TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO naturalezas_cargo (codigo, nombre, descripcion, requiere_periodo, es_carrera) VALUES
  ('carrera_administrativa', 'Carrera Administrativa', 'Empleos cuyos titulares son seleccionados por meritocracia y gozan de estabilidad laboral conforme a la Ley 909/2004.', 0, 1),
  ('libre_nombramiento', 'Libre Nombramiento', 'Empleos de direccion, confianza y manejo cuyas funciones involucran la adopcion de politicas y la direccion institucional. Nombramiento y remocion discrecional.', 0, 0),
  ('libre_nombramiento_gerencia_publica', 'Libre Nombramiento y Gerencia Publica', 'Empleos de gerencia publica con caracteristicas especiales de alta direccion.', 0, 0),
  ('libre_nombramiento_remocion', 'Libre Nombramiento y Remocion', 'Variante de libre nombramiento donde la remocion se realiza conforme a normas especiales del regimen.', 0, 0),
  ('periodo_fijo', 'Periodo Fijo', 'Empleos cuyo titular es nombrado por un periodo constitucional o legal determinado (ej. Alcalde).', 1, 0),
  ('temporal', 'Temporal', 'Empleos de planta temporal conforme al estudio tecnico de la entidad, con vinculacion no de carrera.', 0, 0);

-- ----------------------------------------------------------------------------
-- 1.3 Nucleos Basicos del Conocimiento (SNIES)
-- 8 areas, 55 NBC extraidos del Decreto 159/2024 tabla principal.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nucleos_basicos_conocimiento (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  area_conocimiento VARCHAR(100) NOT NULL,
  nbc VARCHAR(150) NOT NULL,
  descripcion TEXT,
  INDEX idx_area (area_conocimiento),
  INDEX idx_nbc (nbc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO nucleos_basicos_conocimiento (area_conocimiento, nbc) VALUES
  -- AGRONOMIA, VETERINARIA Y AFINES (3)
  ('AGRONOMIA, VETERINARIA Y AFINES', 'Agronomia'),
  ('AGRONOMIA, VETERINARIA Y AFINES', 'Medicina Veterinaria'),
  ('AGRONOMIA, VETERINARIA Y AFINES', 'Zootecnia'),
  -- BELLAS ARTES (6)
  ('BELLAS ARTES', 'Artes Plasticas Visuales y afines'),
  ('BELLAS ARTES', 'Artes Representativas'),
  ('BELLAS ARTES', 'Diseno'),
  ('BELLAS ARTES', 'Musica'),
  ('BELLAS ARTES', 'Otros Programas Asociados a Bellas Artes'),
  ('BELLAS ARTES', 'Publicidad y a fines'),
  -- CIENCIAS DE LA EDUCACION (1)
  ('CIENCIAS DE LA EDUCACION', 'Educacion'),
  -- CIENCIAS DE LA SALUD (9)
  ('CIENCIAS DE LA SALUD', 'Bacteriologia'),
  ('CIENCIAS DE LA SALUD', 'Enfermeria'),
  ('CIENCIAS DE LA SALUD', 'Instrumentacion Quirurgica'),
  ('CIENCIAS DE LA SALUD', 'Medicina'),
  ('CIENCIAS DE LA SALUD', 'Nutricion y Dietetica'),
  ('CIENCIAS DE LA SALUD', 'Odontologia'),
  ('CIENCIAS DE LA SALUD', 'Optometria, Otros Programas de Ciencias de la Salud'),
  ('CIENCIAS DE LA SALUD', 'Salud Publica'),
  ('CIENCIAS DE LA SALUD', 'Terapias'),
  -- CIENCIAS SOCIALES Y HUMANAS (12)
  ('CIENCIAS SOCIALES Y HUMANAS', 'Antropologia, Artes Liberales'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Bibliotecologia, Otros de Ciencias Sociales y Humanas'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Ciencia Politica, Relaciones Internacionales'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Comunicacion Social, Periodismo y Afines'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Deportes, Educacion Fisica y Recreacion'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Derecho y Afines'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Filosofia, Teologia y Afines'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Formacion Relacionada con el Campo Militar o Policial'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Geografia, Historia'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Lenguas Modernas, Literatura, Linguistica y Afines'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Psicologia'),
  ('CIENCIAS SOCIALES Y HUMANAS', 'Sociologia, Trabajo Social y Afines'),
  -- ECONOMIA, ADMINISTRACION, CONTADURIA Y AFINES (3)
  ('ECONOMIA, ADMINISTRACION, CONTADURIA Y AFINES', 'Administracion'),
  ('ECONOMIA, ADMINISTRACION, CONTADURIA Y AFINES', 'Contaduria Publica'),
  ('ECONOMIA, ADMINISTRACION, CONTADURIA Y AFINES', 'Economia'),
  -- INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES (15)
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Arquitectura y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Administrativa y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Agricola, Forestal y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Agroindustrial, Alimentos y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Agronomica, Pecuaria y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Ambiental, Sanitaria y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Biomedica y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Civil y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria de Minas, Metalurgia y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria de Sistemas, Telematica y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Electrica y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Electrica Telecomunicaciones y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Industrial y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Mecanica y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Ingenieria Quimica y Afines'),
  ('INGENIERIA, ARQUITECTURA, URBANISMO Y AFINES', 'Otras Ingenierias'),
  -- MATEMATICAS Y CIENCIAS NATURALES (5)
  ('MATEMATICAS Y CIENCIAS NATURALES', 'Biologia, Microbiologia y Afines'),
  ('MATEMATICAS Y CIENCIAS NATURALES', 'Fisica'),
  ('MATEMATICAS Y CIENCIAS NATURALES', 'Geologia, Otros Programas de Ciencias Naturales'),
  ('MATEMATICAS Y CIENCIAS NATURALES', 'Matematicas, Estadistica y Afines'),
  ('MATEMATICAS Y CIENCIAS NATURALES', 'Quimica y Afines');

-- ----------------------------------------------------------------------------
-- 1.4 Requisitos estructurados del cargo (Seccion VII del Decreto)
-- Tabla vacia inicialmente. Se poblara en Fase 4 desde el parser de los Decretos.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cargos_manual_requisitos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cargo_manual_id BIGINT UNSIGNED NOT NULL,
  nivel_educativo ENUM('bachiller','tecnico','tecnologico','profesional','especializacion','maestria','doctorado') NOT NULL,
  nbc_id INT UNSIGNED NULL,
  titulo_requerido VARCHAR(200),
  tarjeta_profesional TINYINT(1) DEFAULT 0,
  experiencia_meses SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  experiencia_tipo ENUM('profesional','relacionada','laboral','docente') NOT NULL,
  FOREIGN KEY (cargo_manual_id) REFERENCES cargos_manual(id) ON DELETE CASCADE,
  FOREIGN KEY (nbc_id) REFERENCES nucleos_basicos_conocimiento(id),
  INDEX idx_cargo (cargo_manual_id),
  INDEX idx_nivel (nivel_educativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Verificacion automatica al final del script
-- ============================================================================
SELECT 'niveles_jerarquicos' AS tabla, COUNT(*) AS filas FROM niveles_jerarquicos
UNION ALL SELECT 'naturalezas_cargo', COUNT(*) FROM naturalezas_cargo
UNION ALL SELECT 'nucleos_basicos_conocimiento', COUNT(*) FROM nucleos_basicos_conocimiento
UNION ALL SELECT 'cargos_manual_requisitos', COUNT(*) FROM cargos_manual_requisitos;