-- Migration: Tabla competencias comportamentales (Decreto 2539/2005 y 815/2018)
CREATE TABLE IF NOT EXISTS `competencias_comportamentales` (
 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
 `nombre` VARCHAR(150) NOT NULL,
 `decreto` VARCHAR(50) NOT NULL COMMENT 'Ej: 2539/2005, 815/2018',
 `descripcion` TEXT,
 `estado` ENUM('activa', 'inactiva') NOT NULL DEFAULT 'activa',
 `eliminado_en` DATETIME DEFAULT NULL,
 `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (`id`),
 KEY `idx_decreto` (`decreto`),
 KEY `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: Competencias Decreto 2539/2005
INSERT INTO `competencias_comportamentales` (`nombre`, `decreto`, `descripcion`, `estado`) VALUES
('Compromiso con el servicio', '2539/2005', 'Orientacion al cumplimiento de los objetivos organizaciónales', 'activa'),
('Iniciativa', '2539/2005', 'Capacidad para actuar proactivamente y proponer soluciones', 'activa'),
('Trabajo en equipo', '2539/2005', 'Capacidad para colaborar y coordinar con otros', 'activa'),
('Orientacion al resultado', '2539/2005', 'Enfocado en el logro de metas y objetivos', 'activa'),
('Responsabilidad', '2539/2005', 'Compromiso con las obligaciones asignadas', 'activa'),
('Comunicacion efectiva', '2539/2005', 'Capacidad para transmitir informacion clara y oportunamente', 'activa'),
('Liderazgo', '2539/2005', 'Capacidad para influir y guiar a otros hacia metas comunes', 'activa'),
('Toma de decisiones', '2539/2005', 'Habilidad para elegir la mejor alternativa en situaciones complejas', 'activa'),
('Negociacion', '2539/2005', 'Capacidad para llegar a acuerdos satisfactorios entre partes', 'activa'),
('Manejo de conflictos', '2539/2005', 'Habilidad para resolver diferencias de manera constructiva', 'activa'),
-- Competencias Decreto 815/2018
('Conocimiento del negocio', '815/2018', 'Comprension del entorno y los procesos organizaciónales', 'activa'),
('Mejora continua', '815/2018', 'Busqueda permanente de optimizacion de procesos y resultados', 'activa'),
('Gestion de la informacion', '815/2018', 'Capacidad para obtener, analizar y utilizar informacion relevante', 'activa'),
('Relaciones interpersonales', '815/2018', 'Habilidad para establecer y mantener relaciones de trabajo efectivas', 'activa'),
('Adaptabilidad', '815/2018', 'Capacidad para ajustarse a cambios y nuevas situaciones', 'activa');
