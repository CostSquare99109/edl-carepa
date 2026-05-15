-- Migración: Agregar peso y evaluador a compromisos, cambiar estados
-- Ejecutar en MySQL de XAMPP

USE edl_cnsc;

-- Agregar columna peso (porcentaje del compromiso)
ALTER TABLE compromisos ADD COLUMN peso DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER tipo;

-- Agregar columna evaluador_id (quien aprueba el compromiso)
ALTER TABLE compromisos ADD COLUMN evaluador_id BIGINT UNSIGNED DEFAULT NULL AFTER responsable_id;
ALTER TABLE compromisos ADD CONSTRAINT fk_comp_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Agregar columna observaciones_evaluador
ALTER TABLE compromisos ADD COLUMN observaciones_evaluador TEXT DEFAULT NULL AFTER observaciones;

-- Modificar estados: agregar 'enviado', 'aprobado', 'rechazado'
ALTER TABLE compromisos MODIFY COLUMN estado ENUM('pendiente','enviado','aprobado','rechazado','en_progreso','cumplido','incumplido','vencido') NOT NULL DEFAULT 'pendiente';

-- Agregar permisos nuevos para compromisos
INSERT INTO permisos (codigo, nombre, modulo, descripcion) VALUES
('compromisos.enviar', 'Enviar compromiso', 'compromisos', 'Funcionario envia compromiso para aprobacion'),
('compromisos.aprobar', 'Aprobar compromiso', 'compromisos', 'Evaluador aprueba compromiso con peso');

-- Dar permisos al evaluador
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.codigo = 'evaluador' AND p.codigo IN ('compromisos.enviar', 'compromisos.aprobar');

-- Dar permisos al funcionario
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.codigo = 'funcionario' AND p.codigo IN ('compromisos.enviar');

-- Dar permisos al jefe de entidad
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.codigo = 'jefe_entidad' AND p.codigo IN ('compromisos.enviar', 'compromisos.aprobar');

-- Dar permisos al jefe de dependencia
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.codigo = 'jefe_dependencia' AND p.codigo IN ('compromisos.enviar', 'compromisos.aprobar');
