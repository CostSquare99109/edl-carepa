-- ============================================================
-- MIGRACIÓN EDL-CNSC: Adaptación al Acuerdo 6176 de 2018
-- Sistema Tipo de Evaluación del Desempeño Laboral
-- ============================================================

USE edl_cnsc;

-- ============================================================
-- 1. ROLES: Renombrar y agregar nuevos
-- ============================================================

UPDATE roles SET codigo = 'evaluado', nombre = 'Evaluado', descripcion = 'Servidor publico sujeto a evaluacion. Propone compromisos y registra evidencias.' WHERE codigo = 'funcionario';
UPDATE roles SET codigo = 'admin_entidad', nombre = 'Administrador Entidad', descripcion = 'Jefe de Personal. Crea y gestiona usuarios de su entidad, restablece contraseñas.' WHERE codigo = 'admin';

INSERT IGNORE INTO roles (codigo, nombre, descripcion) VALUES
('admin_cnsc', 'Administrador CNSC', 'Superadministrador global. Habilita entidades, gestiona parametros del sistema y atiende soporte.'),
('comision_evaluadora', 'Comisión Evaluadora', 'Organo evaluador colegiado. Realiza evaluaciones conjuntas y aprueba calificaciones definitivas.');

-- ============================================================
-- 2. PERMISOS NUEVOS
-- ============================================================

INSERT IGNORE INTO permisos (modulo, codigo, nombre) VALUES
('evaluaciones', 'evaluaciones.aprobar', 'Aprobar calificación definitiva'),
('compromisos', 'compromisos.devolver', 'Devolver compromiso al evaluado'),
('compromisos', 'compromisos.aprobar', 'Aprobar compromiso en concertación'),
('compromisos', 'compromisos.enviar', 'Proponer compromiso'),
('usuarios', 'usuarios.restablecer', 'Restablecer contraseña de usuario'),
('entidades', 'entidades.habilitar', 'Habilitar entidad en el sistema'),
('parametros', 'parametros.listar', 'Listar parametros del sistema'),
('parametros', 'parametros.editar', 'Editar parametros del sistema'),
('soporte', 'soporte.gestionar', 'Gestionar solicitudes de soporte');

-- ============================================================
-- 3. ASIGNAR PERMISOS A NUEVOS ROLES
-- ============================================================

-- admin_cnsc: TODOS los permisos
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p WHERE r.codigo = 'admin_cnsc';

-- comision_evaluadora
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.codigo = 'comision_evaluadora' AND p.codigo IN (
    'evaluaciones.listar', 'evaluaciones.evaluar', 'evaluaciones.aprobar',
    'compromisos.listar', 'evidencias.listar', 'reportes.ver'
);

-- admin_entidad: aprobar calificación + restablecer passwords
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.codigo = 'admin_entidad' AND p.codigo IN ('evaluaciones.aprobar', 'usuarios.restablecer');

-- evaluador: aprobar y devolver compromisos
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.codigo = 'evaluador' AND p.codigo IN ('compromisos.aprobar', 'compromisos.devolver');

-- evaluado: proponer compromisos
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.codigo = 'evaluado' AND p.codigo = 'compromisos.enviar';

-- ============================================================
-- 4. EVALUACIONES: Primero actualizar datos, luego cambiar enum
-- ============================================================

-- Actualizar datos existentes ANTES de cambiar el enum
UPDATE evaluaciones SET tipo = 'parcial_semestral' WHERE tipo = 'heteroevaluacion';
UPDATE evaluaciones SET tipo = 'parcial_semestral' WHERE tipo = 'coevaluacion';
UPDATE evaluaciones SET tipo = 'parcial_semestral' WHERE tipo = 'autoevaluacion';

-- Ahora sí cambiar el enum
ALTER TABLE evaluaciones MODIFY COLUMN tipo ENUM(
    'parcial_semestral',
    'parcial_eventual',
    'definitiva'
) NOT NULL;

-- Agregar columnas nuevas
ALTER TABLE evaluaciones
    ADD COLUMN IF NOT EXISTS es_comision_evaluadora TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS comision_evaluadora_id BIGINT UNSIGNED NULL,
    ADD COLUMN IF NOT EXISTS calificacion_definitiva DECIMAL(5,2) NULL,
    ADD COLUMN IF NOT EXISTS fecha_concertacion DATE NULL,
    ADD COLUMN IF NOT EXISTS fecha_calificacion DATE NULL;

-- Cambiar estado enum (primero actualizar existentes)
UPDATE evaluaciones SET estado = 'concertacion' WHERE estado = 'pendiente';
UPDATE evaluaciones SET estado = 'en_proceso' WHERE estado = 'en_proceso';
UPDATE evaluaciones SET estado = 'calificada' WHERE estado = 'calificada' OR estado = 'revisada';
UPDATE evaluaciones SET estado = 'cerrada' WHERE estado = 'cerrada';

ALTER TABLE evaluaciones MODIFY COLUMN estado ENUM(
    'pendiente',
    'concertacion',
    'en_proceso',
    'calificada',
    'aprobada_comision',
    'cerrada'
) NOT NULL DEFAULT 'pendiente';

-- ============================================================
-- 5. COMPROMISOS: Actualizar datos primero, luego cambiar enums
-- ============================================================

-- Actualizar datos existentes
UPDATE compromisos SET tipo = 'funcional' WHERE tipo IN ('competencia', 'mejoramiento') OR tipo NOT IN ('funcional', 'comportamental');
UPDATE compromisos SET estado = 'propuesto' WHERE estado IN ('enviado', 'pendiente');
UPDATE compromisos SET estado = 'devuelto' WHERE estado = 'rechazado';

-- Cambiar tipo enum
ALTER TABLE compromisos MODIFY COLUMN tipo ENUM(
    'funcional',
    'comportamental'
) NOT NULL DEFAULT 'funcional';

-- Cambiar estado enum
ALTER TABLE compromisos MODIFY COLUMN estado ENUM(
    'propuesto',
    'aprobado',
    'devuelto',
    'en_progreso',
    'cumplido',
    'incumplido',
    'vencido'
) NOT NULL DEFAULT 'propuesto';

-- Agregar columnas nuevas
ALTER TABLE compromisos
    ADD COLUMN IF NOT EXISTS resultado_esperado TEXT NULL,
    ADD COLUMN IF NOT EXISTS medio_verificacion VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS calificacion DECIMAL(5,2) NULL,
    ADD COLUMN IF NOT EXISTS observaciones_evaluado TEXT NULL;

-- ============================================================
-- 6. EVIDENCIAS
-- ============================================================

ALTER TABLE evidencias
    ADD COLUMN IF NOT EXISTS tipo ENUM('compromiso', 'competencia', 'general') DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS compromiso_id BIGINT UNSIGNED NULL;

-- ============================================================
-- 7. PERIODOS
-- ============================================================

ALTER TABLE periodos
    ADD COLUMN IF NOT EXISTS fecha_inicio_concertacion DATE NULL,
    ADD COLUMN IF NOT EXISTS fecha_fin_concertacion DATE NULL,
    ADD COLUMN IF NOT EXISTS fecha_inicio_evaluacion DATE NULL,
    ADD COLUMN IF NOT EXISTS fecha_fin_evaluacion DATE NULL;

-- Actualizar datos existentes antes de cambiar enum
UPDATE periodos SET estado = 'concertacion' WHERE estado = 'en_evaluacion';
UPDATE periodos SET estado = 'seguimiento' WHERE estado = 'activa';
UPDATE periodos SET estado = 'configuracion' WHERE estado = 'inactiva';

ALTER TABLE periodos MODIFY COLUMN estado ENUM(
    'configuracion',
    'concertacion',
    'seguimiento',
    'evaluacion',
    'calificacion',
    'cerrado'
) NOT NULL DEFAULT 'configuracion';

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT '--- ROLES ---' AS info;
SELECT id, codigo, nombre FROM roles ORDER BY id;

SELECT '--- PERMISOS POR ROL ---' AS info;
SELECT r.codigo as rol, COUNT(rp.permiso_id) as total_permisos
FROM roles r LEFT JOIN rol_permiso rp ON rp.rol_id = r.id
GROUP BY r.codigo ORDER BY r.codigo;
