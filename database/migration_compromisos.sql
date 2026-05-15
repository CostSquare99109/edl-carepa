-- Migración: Agregar peso y evaluador a compromisos, cambiar estados
-- Ejecutar en MySQL

USE edl_cnsc;

-- Agregar columna peso (porcentaje del compromiso)
ALTER TABLE compromisos ADD COLUMN peso DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Porcentaje de peso del compromiso (0-100)' AFTER plazo;

-- Agregar columna evaluador_id (quien aprueba)
ALTER TABLE compromisos ADD COLUMN evaluador_id BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Evaluador que aprueba el compromiso' AFTER responsable_id;

-- Agregar columna observaciones_evaluador 
ALTER TABLE compromisos ADD COLUMN observaciones_evaluador TEXT DEFAULT NULL AFTER evaluador_id;

-- Modificar enum de estado para incluir 'enviado', 'aprobado', 'rechazado'
ALTER TABLE compromisos MODIFY COLUMN estado ENUM('pendiente','enviado','aprobado','rechazado','en_progreso','cumplido','incumplido','vencido') NOT NULL DEFAULT 'pendiente';

-- Agregar foreign key para evaluador_id
ALTER TABLE compromisos ADD CONSTRAINT fk_compromiso_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Agregar índice para consultas de evaluador
CREATE INDEX idx_compromisos_evaluador ON compromisos(evaluador_id);
CREATE INDEX idx_compromisos_estado ON compromisos(estado);
