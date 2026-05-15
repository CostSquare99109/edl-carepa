<?php

namespace App\Middleware;

use App\Helper\ResponseHelper;
use App\Config\Database;

class PermissionMiddleware
{
  public static function check(string $permisoCodigo): void
  {
    $user = AuthMiddleware::user();

    // Asegurar que roles sea un array plano de strings
    $rolCodigos = [];
    foreach (($user['roles'] ?? []) as $r) {
      if (is_array($r) && isset($r['codigo'])) {
        $rolCodigos[] = $r['codigo'];
      } elseif (is_string($r)) {
        $rolCodigos[] = $r;
      }
    }

    if (empty($rolCodigos)) {
      ResponseHelper::error('Sin roles asignados', 403);
    }

    $pdo = Database::getInstance();
    $placeholders = implode(',', array_fill(0, count($rolCodigos), '?'));
    $params = $rolCodigos;

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
