<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helper\ResponseHelper;
use App\Config\Database;

class PermissionMiddleware
{
  public static function check(string $permisoCodigo): void
  {
    $user = AuthMiddleware::user();
    $rolActivo = AuthMiddleware::rolActivo();

    if (empty($rolActivo)) {
      ResponseHelper::error('Sin rol activo', 403);
    }

    $pdo = Database::getInstance();
    $stmt = $pdo->prepare("
      SELECT COUNT(*) FROM rol_permiso rp
      INNER JOIN permisos p ON p.id = rp.permiso_id
      INNER JOIN roles r ON r.id = rp.rol_id
      WHERE r.codigo = ?
      AND p.codigo = ?
    ");
    $stmt->execute([$rolActivo, $permisoCodigo]);

    if ((int) $stmt->fetchColumn() === 0) {
      ResponseHelper::error('Permiso denegado: ' . $permisoCodigo, 403);
    }
  }
}
