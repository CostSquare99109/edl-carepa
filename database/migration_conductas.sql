-- ============================================================
-- MIGRACIÓN: Tabla conductas por competencia (Decretos 2539/2005 y 815/2018)
-- Cada competencia comportamental tiene conductas observables predefinidas
-- ============================================================

USE edl_carepa;

-- Crear tabla conductas
CREATE TABLE IF NOT EXISTS `conductas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `competencia_codigo` varchar(60) NOT NULL,
  `texto` text NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_competencia` (`competencia_codigo`),
  KEY `idx_orden` (`orden`),
  CONSTRAINT `fk_conducta_competencia` FOREIGN KEY (`competencia_codigo`) REFERENCES `competencias` (`codigo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar conductas para cada competencia (basado en anexo técnico CNSC)
-- COMP_01: Orientación al usuario y al ciudadano (ORI_USU)
INSERT IGNORE INTO `conductas` (`competencia_codigo`, `texto`, `orden`) VALUES
('ORI_USU', 'Atiende con respeto, cortesía y diligencia a los usuarios y ciudadanos', 1),
('ORI_USU', 'Responde oportunamente las solicitudes, peticiones, quejas y reclamos', 2),
('ORI_USU', 'Brinda información clara, precisa y completa sobre trámites y servicios', 3),
('ORI_USU', 'Identifica necesidades de los usuarios y propone mejoras en la atención', 4),
('ORI_USU', 'Mantiene canales de comunicación accesibles y efectivos', 5);

-- COMP_02: Compromiso con la organización (CMP_ORG)
INSERT IGNORE INTO `conductas` (`competencia_codigo`, `texto`, `orden`) VALUES
('CMP_ORG', 'Cumple con los objetivos, metas y valores institucionales', 1),
('CMP_ORG', 'Participa activamente en la construcción de la cultura organizacional', 2),
('CMP_ORG', 'Defiende la imagen y reputación de la entidad', 3),
('CMP_ORG', 'Alinea su desempeño individual con el plan estratégico institucional', 4),
('CMP_ORG', 'Promueve el sentido de pertenencia entre sus compañeros', 5);

-- COMP_03: Trabajo en equipo (TRB_EQP)
INSERT IGNORE INTO `conductas` (`competencia_codigo`, `texto`, `orden`) VALUES
('TRB_EQP', 'Colabora eficazmente con sus compañeros para alcanzar metas comunes', 1),
('TRB_EQP', 'Comparte información y conocimientos de forma proactiva', 2),
('TRB_EQP', 'Resuelve conflictos de manera constructiva y respetuosa', 3),
('TRB_EQP', 'Apoya a sus compañeros en situaciones de alta carga laboral', 4),
('TRB_EQP', 'Fomenta un ambiente de confianza y respeto mutuo', 5);

-- COMP_04: Orientación a resultados (ORI_RES)
INSERT IGNORE INTO `conductas` (`competencia_codigo`, `texto`, `orden`) VALUES
('ORI_RES', 'Alcanza los objetivos propuestos con calidad y en los tiempos establecidos', 1),
('ORI_RES', 'Prioriza actividades según su impacto en los resultados institucionales', 2),
('ORI_RES', 'Monitorea el avance de sus compromisos y toma acciones correctivas', 3),
('ORI_RES', 'Busca la mejora continua en los procesos de su responsabilidad', 4),
('ORI_RES', 'Entrega productos y servicios que superan las expectativas mínimas', 5);

-- COMP_05: Adaptación al cambio (ADP_CAM)
INSERT IGNORE INTO `conductas` (`competencia_codigo`, `texto`, `orden`) VALUES
('ADP_CAM', 'Se ajusta rápidamente a nuevas condiciones, normas o procedimientos', 1),
('ADP_CAM', 'Propone soluciones innovadoras ante situaciones imprevistas', 2),
('ADP_CAM', 'Mantiene la productividad durante períodos de transición organizacional', 3),
('ADP_CAM', 'Asume nuevos roles y responsabilidades con actitud positiva', 4),
('ADP_CAM', 'Aprende y aplica nuevas herramientas tecnológicas con agilidad', 5);

-- COMP_06: Aprendizaje continuo (APR_CONT)
INSERT IGNORE INTO `conductas` (`competencia_codigo`, `texto`, `orden`) VALUES
('APR_CONT', 'Actualiza permanentemente sus conocimientos técnicos y normativos', 1),
('APR_CONT', 'Aplica nuevos conocimientos para mejorar su desempeño laboral', 2),
('APR_CONT', 'Participa activamente en actividades de capacitación y formación', 3),
('APR_CONT', 'Comparte aprendizajes con el equipo de trabajo', 4),
('APR_CONT', 'Identifica sus brechas de competencias y busca cerrarlas', 5);

-- COMP_07: Aporte técnico profesional (APR_TEC)
INSERT IGNORE INTO `conductas` (`competencia_codigo`, `texto`, `orden`) VALUES
('APR_TEC', 'Aplica conocimientos especializados para resolver problemas complejos', 1),
('APR_TEC', 'Genera aportes técnicos que mejoran los procesos de la entidad', 2),
('APR_TEC', 'Asesora a sus compañeros en temas de su especialidad', 3),
('APR_TEC', 'Mantiene rigor técnico en la elaboración de documentos e informes', 4),
('APR_TEC', 'Innova en metodologías y herramientas de su área profesional', 5);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT c.codigo, c.nombre, COUNT(co.id) as total_conductas
FROM competencias c
LEFT JOIN conductas co ON co.competencia_codigo = c.codigo AND co.activo = 1
GROUP BY c.codigo, c.nombre
ORDER BY c.decreto, c.codigo;
