-- ============================================================================
-- MIGRACIÓN: Jefe de Dependencia (reemplaza Administrador Entidad)
-- ============================================================================
-- Motor: MariaDB / MySQL 8.0+
-- ============================================================================

USE edl_carepa;

-- 1. Renombrar rol admin_entidad → jefe_dependencia
UPDATE roles SET 
    codigo = 'jefe_dependencia',
    nombre = 'Jefe de Dependencia',
    descripcion = 'Jefe de una dependencia. Gestiona usuarios, metas, compromisos y reportes de su dependencia. Tiene evaluados asignados.',
    actualizado_en = NOW()
WHERE codigo = 'admin_entidad';

-- 2. Agregar dependencia_id a usuario_rol para asociar Jefe de Dependencia a su dependencia
ALTER TABLE usuario_rol 
    ADD COLUMN dependencia_id BIGINT UNSIGNED NULL AFTER entidad_id,
    ADD CONSTRAINT fk_ur_dependencia 
        FOREIGN KEY (dependencia_id) REFERENCES dependencias (id) ON DELETE SET NULL;

-- 3. Actualizar usuario_rol existente: si el usuario es jefe_dependencia (ex admin_entidad), 
--    usar la dependencia_id del usuario
UPDATE usuario_rol ur
JOIN usuarios u ON u.id = ur.usuario_id
JOIN roles r ON r.id = ur.rol_id
SET ur.dependencia_id = u.dependencia_id
WHERE r.codigo = 'jefe_dependencia' AND u.dependencia_id IS NOT NULL;

-- 4. Índice para consultas rápidas
CREATE INDEX idx_ur_dependencia ON usuario_rol (dependencia_id);

-- 5. Verificar resultado
SELECT 
    r.id, r.codigo, r.nombre, r.descripcion,
    COUNT(ur.id) AS usuarios_con_rol
FROM roles r
LEFT JOIN usuario_rol ur ON ur.rol_id = r.id AND ur.eliminado_en IS NULL
WHERE r.codigo IN ('jefe_dependencia', 'admin_carepa', 'comision_evaluadora', 'evaluador', 'evaluado')
GROUP BY r.id, r.codigo, r.nombre, r.descripcion;