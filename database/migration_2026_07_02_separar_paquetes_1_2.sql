-- ============================================================================
-- Migración: Separación de Paquetes 1 (Funcionales) y 2 (Comportamentales)
-- ============================================================================
-- Fecha: 2026-07-02
-- Propósito:
--   - Paquete 1 (Compromisos Funcionales): sigue en tabla `compromisos`
--     con tipo ENUM('funcional') únicamente.
--   - Paquete 2 (Compromisos Comportamentales): nueva tabla
--     `compromisos_comportamentales`, completamente independiente,
--     con su propia lógica, validaciones y registros.
--
-- Esta migración:
--   1. Crea la nueva tabla `compromisos_comportamentales` con todos los
--      campos específicos de comportamientos.
--   2. Migra todos los registros existentes con tipo='comportamental'.
--   3. Elimina los registros migrados de la tabla original (mantiene
--      Paquete 1 puro = solo funcionales).
--   4. Restringe el ENUM tipo a 'funcional' solamente.
--   5. Crea los índices y foreign keys apropiados.
-- ============================================================================

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
START TRANSACTION;

-- ----------------------------------------------------------------------------
-- 1. Crear nueva tabla `compromisos_comportamentales`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `compromisos_comportamentales`;

CREATE TABLE `compromisos_comportamentales` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `concertacion_id` bigint(20) unsigned NOT NULL,
  `competencia_codigo` varchar(60) NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `peso` decimal(5,2) NOT NULL DEFAULT 0.00,
  `nivel_comportamental` enum('bajo','aceptable','alto','muy_alto') DEFAULT NULL,
  `puntaje_comportamental` decimal(5,2) DEFAULT NULL,
  `calificacion` decimal(5,2) DEFAULT NULL,
  `frecuencia` enum('nunca','algunas_veces','frecuentemente','siempre') DEFAULT NULL,
  `impacto_aporta_compromisos` enum('si','moderadamente','no') DEFAULT NULL,
  `impacto_excede_estipulado` enum('si','no') DEFAULT NULL,
  `justificacion_excede` text DEFAULT NULL,
  `observaciones_evaluador` text DEFAULT NULL,
  `observaciones_evaluado` text DEFAULT NULL,
  `conductas_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`conductas_json`)),
  `propuesto_por_jefe_entidad` tinyint(1) NOT NULL DEFAULT 0,
  `propuesto_por_secretario_educacion` tinyint(1) NOT NULL DEFAULT 0,
  `es_propuesto_evaluado` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('propuesto','pendiente_aprobacion','aprobado','devuelto','rechazado','en_progreso','cumplido','incumplido') NOT NULL DEFAULT 'propuesto',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_concertacion` (`concertacion_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_competencia` (`competencia_codigo`),
  CONSTRAINT `fk_compcomp_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_compcomp_competencia` FOREIGN KEY (`competencia_codigo`) REFERENCES `competencias` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Migrar registros existentes de comportamientos
-- ----------------------------------------------------------------------------
INSERT INTO `compromisos_comportamentales` (
  `id`,
  `concertacion_id`,
  `competencia_codigo`,
  `descripcion`,
  `peso`,
  `nivel_comportamental`,
  `puntaje_comportamental`,
  `calificacion`,
  `frecuencia`,
  `impacto_aporta_compromisos`,
  `impacto_excede_estipulado`,
  `justificacion_excede`,
  `observaciones_evaluador`,
  `observaciones_evaluado`,
  `conductas_json`,
  `propuesto_por_jefe_entidad`,
  `propuesto_por_secretario_educacion`,
  `es_propuesto_evaluado`,
  `estado`,
  `creado_en`,
  `actualizado_en`,
  `eliminado_en`
)
SELECT
  `id`,
  `concertacion_id`,
  `competencia_codigo`,
  `descripcion`,
  `peso`,
  `nivel_comportamental`,
  `puntaje_comportamental`,
  `calificacion`,
  `frecuencia`,
  `impacto_aporta_compromisos`,
  `impacto_excede_estipulado`,
  `justificacion_excede`,
  `observaciones_evaluador`,
  `observaciones_evaluado`,
  `conductas_json`,
  `propuesto_por_jefe_entidad`,
  `propuesto_por_secretario_educacion`,
  `es_propuesto_evaluado`,
  `estado`,
  `creado_en`,
  `actualizado_en`,
  `eliminado_en`
FROM `compromisos`
WHERE `tipo` = 'comportamental';

-- ----------------------------------------------------------------------------
-- 3. Eliminar los registros migrados de la tabla original
--    (Paquete 1 = solo funcionales)
-- ----------------------------------------------------------------------------
DELETE FROM `compromisos` WHERE `tipo` = 'comportamental';

-- ----------------------------------------------------------------------------
-- 4. Restringir el ENUM `tipo` a solo 'funcional'
--    (defensa en profundidad: garantiza que nunca más se mezclen)
-- ----------------------------------------------------------------------------
ALTER TABLE `compromisos`
  MODIFY COLUMN `tipo` enum('funcional') NOT NULL DEFAULT 'funcional';

COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

-- ============================================================================
-- Verificación post-migración
-- ============================================================================
-- Esperado:
--   SELECT COUNT(*) FROM compromisos WHERE tipo='funcional' > 0
--   SELECT COUNT(*) FROM compromisos_comportamentales = antiguas comportamentales
--   SELECT COUNT(*) FROM compromisos WHERE tipo='comportamental' = 0
-- ============================================================================