-- M001 — P0-2: Crear los 4 objetos BD inexistentes referenciados por el código
-- Auditoría: docs/auditoria/manual-funciones-marzo-2025.md §16/§19 (commit 20fde35, validación e197550)
-- Evidencia: CompetenciaRepository.php:36-59, CargoManualRepository.php:95-118
-- Reversible: ver sección REVERSIBILIDAD al final. No destruye estructuras existentes.
-- Charset/collation alineados al esquema (utf8mb4_unicode_ci).

-- 1) Mapa de competencias comunes usadas en fichas (manual §2/§3: set de 6 de las fichas)
--    Consumido por CompetenciaRepository::comunes() -> GET /competencias/comunes
CREATE TABLE IF NOT EXISTS competencias_comunes_map (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  com_json VARCHAR(200) NOT NULL COMMENT 'Clave/nombre tal como aparece en fichas del manual',
  com_bd VARCHAR(60) NOT NULL COMMENT 'FK a competencias.codigo',
  nombre VARCHAR(200) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ccm_com_json (com_json),
  CONSTRAINT fk_ccm_competencia FOREIGN KEY (com_bd) REFERENCES competencias (codigo)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO competencias_comunes_map (com_json, com_bd, nombre) VALUES
  ('Aprendizaje continuo', 'APR_CONT', 'Aprendizaje continuo'),
  ('Orientación a resultados', 'ORI_RES', 'Orientación a resultados'),
  ('Orientación al usuario y al ciudadano', 'ORI_USU', 'Orientación al usuario y al ciudadano'),
  ('Compromiso con la organización', 'CMP_ORG', 'Compromiso con la organización'),
  ('Trabajo en equipo', 'TRB_EQP', 'Trabajo en equipo'),
  ('Adaptación al cambio', 'ADP_CAM', 'Adaptación al cambio');

-- 2) Catálogo de conocimientos (estructura; sin seed: los conocimientos viven hoy como
--    texto libre en cargos_manual_detalle — no se inventan datos)
CREATE TABLE IF NOT EXISTS conocimientos_catalogo (
  con_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (con_id),
  UNIQUE KEY uq_cc_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Relación cargo <-> conocimiento (estructura; sin seed por la misma razón)
CREATE TABLE IF NOT EXISTS cargos_manual_conocimientos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cargo_manual_id BIGINT UNSIGNED NOT NULL,
  con_id INT UNSIGNED NOT NULL,
  orden TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cmc_cargo_con (cargo_manual_id, con_id),
  CONSTRAINT fk_cmc_cargo FOREIGN KEY (cargo_manual_id) REFERENCES cargos_manual (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_cmc_conocimiento FOREIGN KEY (con_id) REFERENCES conocimientos_catalogo (con_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Matriz nivel jerárquico -> competencias comportamentales (P1-3, manual Global §3)
--    Estructura creada aquí; el seed normativo se aplica en M004.
CREATE TABLE IF NOT EXISTS competencias_por_nivel (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nivel_codigo VARCHAR(20) NOT NULL,
  competencia_codigo VARCHAR(60) NOT NULL,
  nombre_json VARCHAR(200) NULL COMMENT 'Nombre literal del manual si difiere del catálogo',
  orden TINYINT UNSIGNED NOT NULL DEFAULT 1,
  fuente VARCHAR(50) NOT NULL DEFAULT 'manual_marzo_2025',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cpn_nivel_comp (nivel_codigo, competencia_codigo),
  CONSTRAINT fk_cpn_nivel FOREIGN KEY (nivel_codigo) REFERENCES niveles_jerarquicos (codigo)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_cpn_comp FOREIGN KEY (competencia_codigo) REFERENCES competencias (codigo)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) Vista consumida por CompetenciaRepository::porNivel() -> GET /competencias/por-nivel
--    Columnas esperadas por ConcertarCompromisos.tsx: nivel_codigo, competencia_codigo,
--    competencia_nombre, nombre_json, decreto, conducta_id, conducta_texto, conducta_orden
CREATE OR REPLACE VIEW v_competencias_por_nivel AS
SELECT
  cpn.nivel_codigo,
  cpn.competencia_codigo,
  c.nombre AS competencia_nombre,
  COALESCE(cpn.nombre_json, c.nombre) AS nombre_json,
  CASE c.decreto WHEN '2539' THEN '2539/2005' WHEN '815' THEN '815/2018' ELSE c.decreto END AS decreto,
  cd.id AS conducta_id,
  cd.texto AS conducta_texto,
  cd.orden AS conducta_orden
FROM competencias_por_nivel cpn
JOIN competencias c ON c.codigo = cpn.competencia_codigo
LEFT JOIN conductas cd ON cd.competencia_codigo = c.codigo AND cd.activo = 1
ORDER BY cpn.nivel_codigo, cpn.orden, cd.orden;

-- REVERSIBILIDAD (ejecutar manualmente si se requiere revertir):
-- DROP VIEW IF EXISTS v_competencias_por_nivel;
-- DROP TABLE IF EXISTS competencias_por_nivel;
-- DROP TABLE IF EXISTS cargos_manual_conocimientos;
-- DROP TABLE IF EXISTS conocimientos_catalogo;
-- DELETE FROM competencias_comunes_map; -- y DROP TABLE IF EXISTS competencias_comunes_map;
-- (los INSERT de este archivo no tocan datos preexistentes)
