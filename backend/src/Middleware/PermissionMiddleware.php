<?php

namespace App\Middleware;

use App\Helper\ResponseHelper;
use App\Config\Database;

class PermissionMiddleware
{
    public static function check(string $permisoCodigo): void
    {
        $user = AuthMiddleware::user();

        if (empty($user['roles'])) {
            ResponseHelper::error('Sin roles asignados', 403);
        }

        $pdo = Database::getInstance();
        $placeholders = implode(',', array_fill(0, count($user['roles']), '?'));
        $params = $user['roles'];

        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM rol_permiso rp
            INNER JOIN permisos p ON p.id = rp.permiso_id
            INNER JOIN roles r ON r.id = rp.rol_id
            WHERE r.codigo IN ({$placeholders})
            AND p.codigo = ?
        ");
        $params[] = $permisoCodigo;
        $stmt->execute($params);

        if ((int) $stmt->fetchColumn() === 0) {
            ResponseHelper::error('Permiso denegado: ' . $permisoCodigo, 403);
        }
    }
}
