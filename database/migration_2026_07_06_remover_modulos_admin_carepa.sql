-- Migration: 2026-07-06 - Remover acceso a modulos especificos para rol admin_carepa
-- Causa: El rol admin_carepa no debe tener acceso a los modulos de:
--   Periodos, Metas, Concertaciones, Evaluaciones, Compromisos,
--   Evidencias, Ausentismos, Movilidades, Solicitudes de cambio de evaluador
--
-- Idempotente: usa DELETE directo con subquery; si ya se ejecuto, no hace nada.

START TRANSACTION;

-- Eliminar permisos de admin_carepa para los modulos objetivo
DELETE FROM `rol_permiso`
WHERE `rol_id` = (SELECT `id` FROM `roles` WHERE `codigo` = 'admin_carepa' LIMIT 1)
AND `permiso_id` IN (
  SELECT `id` FROM `permisos`
  WHERE `modulo` IN (
    'periodos',
    'metas',
    'concertaciones',
    'evaluaciones',
    'compromisos',
    'evidencias',
    'ausentismos',
    'movilidades',
    'solicitudes'
  )
);

COMMIT;

-- Verificacion:
-- SELECT r.codigo AS rol, p.codigo AS permiso, p.modulo
-- FROM rol_permiso rp
-- INNER JOIN permisos p ON p.id = rp.permiso_id
-- INNER JOIN roles r ON r.id = rp.rol_id
-- WHERE r.codigo = 'admin_carepa'
-- ORDER BY p.modulo, p.codigo;
