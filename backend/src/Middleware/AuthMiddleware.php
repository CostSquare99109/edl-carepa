<?php

namespace App\Middleware;

use App\Helper\JwtHelper;
use App\Helper\ResponseHelper;
use App\Repository\SesionRepository;
use App\Config\Database;

class AuthMiddleware
{
    public static array $user = [];

    public static function handle(): void
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!$header || !preg_match('/^Bearer\s+(.+)$/', $header, $matches)) {
            ResponseHelper::error('Token de autenticacion requerido', 401);
        }

        $token = $matches[1];

        try {
            $payload = JwtHelper::validate($token);
        } catch (\Exception $e) {
            ResponseHelper::error('Token invalido o expirado', 401);
        }

        $pdo = Database::getInstance();
        $repo = new SesionRepository($pdo);
        $tokenHash = hash('sha256', $token);

        $sesion = $repo->buscarPorTokenHash($tokenHash);
        if (!$sesion || ($sesion['revocada'] ?? 0) == 1) {
            ResponseHelper::error('Sesion revocada o invalida', 401);
        }

        if (strtotime($sesion['fecha_expiracion']) < time()) {
            ResponseHelper::error('Sesion expirada', 401);
        }

 self::$user = [
 'id' => $payload['sub'],
 'documento' => $payload['documento'] ?? '',
 'roles' => $payload['roles'] ?? [],
 'entidad_id' => $payload['entidad_id'] ?? null,
 'rol_activo' => $payload['rol_activo'] ?? ($payload['roles'][0] ?? null),
 ];

 $GLOBALS['auth_user'] = self::$user;
 }

 public static function user(): array
 {
 return $GLOBALS['auth_user'] ?? self::$user;
 }

 /**
 * Devuelve el rol activo del token actual
 */
 public static function rolActivo(): string
 {
 $userData = $GLOBALS['auth_user'] ?? self::$user;
 return $userData['rol_activo'] ?? '';
 }
}
