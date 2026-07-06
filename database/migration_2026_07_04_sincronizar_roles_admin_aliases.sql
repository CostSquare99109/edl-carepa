-- Migration: 2026-07-04 - Sincronizar codigos de rol entre frontend y backend
-- Causa: UsuarioList.tsx permitia asignar el codigo "admin_carepa" que NO existe
-- en la tabla `roles` (donde el rol real es `admin` con prioridad). El backend
-- hacia SELECT silencioso sin match -> INSERT IGNORE sin row affected -> el
-- cambio de rol nunca se persistia aunque la UI mostraba exito.
-- Fix: registrar los codigos canonicos que usa el frontend
-- (admin_carepa, jefe_personal, jefe_dependencia, comision_evaluadora,
-- cargador) en la tabla `roles`. Las dos primeras son aliases del rol "admin"
-- ya existente (id=1); asignamos el mismo set de permisos via un SELECT directo.
-- Las demas ya existian (id 4..7) pero verificamos presencia.
--
-- Idempotente: usar INSERT IGNORE para codigos y UPDATE si descripcion vacia.

START TRANSACTION;

-- 1. Asegurar que existan los codigos que el frontend envia
INSERT IGNORE INTO `roles` (`codigo`, `nombre`, `descripcion`) VALUES
  ('jefe_personal', 'Jefe de personal', 'Superadministrador global del sistema EDL (alias historico de admin)'),
  ('admin_carepa', 'Administrador Carepa', 'Administrador del sistema para la alcaldia de Carepa (alias de admin)');

-- 2. Vincular `admin_carepa` y `jefe_personal` al MISMO set de permisos que `admin` (id=1).
--    Asi el codigo canonico del JWT (admin_carepa / jefe_personal) tiene todos los permisos.
--    EXCLUYENDO los modulos que admin_carepa no debe tener (periodos, metas, concertaciones,
--    evaluaciones, compromisos, evidencias, ausentismos, movilidades, solicitudes).
INSERT IGNORE INTO `rol_permiso` (`rol_id`, `permiso_id`)
SELECT r2.id, rp.`permiso_id`
FROM `roles` r1
INNER JOIN `rol_permiso` rp ON rp.`rol_id` = r1.`id` AND r1.`codigo` = 'admin'
INNER JOIN `roles` r2 ON r2.`codigo` IN ('admin_carepa', 'jefe_personal') AND r2.`id` <> r1.`id`
WHERE NOT EXISTS (
  SELECT 1 FROM `rol_permiso` rp2 WHERE rp2.`rol_id` = r2.`id` AND rp2.`permiso_id` = rp.`permiso_id`
)
AND (
  r2.`codigo` <> 'admin_carepa'
  OR rp.`permiso_id` NOT IN (
    SELECT `id` FROM `permisos`
    WHERE `modulo` IN ('periodos','metas','concertaciones','evaluaciones','compromisos','evidencias','ausentismos','movilidades','solicitudes')
  )
);

-- 3. Reasignar usuarios historicos que tengan usuario_rol con codigos faltantes
--    (caso: data legacy con admin_carepa). No deberia haber columnas en usuario_rol
--    que apunten a roles inexistentes por la FK fk_ur_rol, pero validamos por si.

-- 4. Para usuarios que solo tienen rol "admin" (rol_id=1), anadir tambien
--    `admin_carepa` para que el frontend pueda identificar al usuario con ambos
--    codigos. Si el usuario ya tiene ambos, el INSERT IGNORE no hace nada.
INSERT IGNORE INTO `usuario_rol` (`usuario_id`, `rol_id`)
SELECT ur.`usuario_id`, r2.`id`
FROM `usuario_rol` ur
INNER JOIN `roles` r1 ON r1.`id` = ur.`rol_id` AND r1.`codigo` = 'admin'
INNER JOIN `roles` r2 ON r2.`codigo` = 'admin_carepa'
WHERE NOT EXISTS (
  SELECT 1 FROM `usuario_rol` ur2
  WHERE ur2.`usuario_id` = ur.`usuario_id` AND ur2.`rol_id` = r2.`id`
)
AND ur.`usuario_id` IN (SELECT id FROM usuarios WHERE eliminado_en IS NULL AND estado = 'activo');

COMMIT;

-- Verificacion recomendada tras correr:
-- SELECT codigo, nombre FROM roles ORDER BY id;
-- SELECT u.id, u.documento, GROUP_CONCAT(r.codigo) AS roles
-- FROM usuarios u LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id
-- LEFT JOIN roles r ON r.id = ur.rol_id
-- WHERE u.eliminado_en IS NULL GROUP BY u.id LIMIT 5;
