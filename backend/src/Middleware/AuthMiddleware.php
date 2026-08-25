<?php
declare(strict_types=1);

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
		$uri = $_SERVER['REQUEST_URI'] ?? '';
		$method = $_SERVER['REQUEST_METHOD'] ?? '';

		$token = '';

		if ($header && preg_match('/^Bearer\s+(.+)$/', $header, $matches)) {
			$token = $matches[1];
		} elseif (!empty($_GET['token'])) {
			$token = $_GET['token'];
		}

		if (!$token) {
			error_log("[AUTH 401] {$method} {$uri} — Sin token Bearer ni token en query");
			ResponseHelper::error('Token de autenticacion requerido', 401);
		}

		try {
			$payload = JwtHelper::validate($token);
		} catch (\Exception $e) {
			error_log("[AUTH 401] {$method} {$uri} — JWT invalido: " . $e->getMessage());
			ResponseHelper::error('Token invalido o expirado', 401);
		}

		$pdo = Database::getInstance();
		$repo = new SesionRepository($pdo);
		$tokenHash = hash('sha256', $token);

		$sesion = $repo->buscarPorTokenHash($tokenHash);
		if (!$sesion || ($sesion['revocada'] ?? 0) == 1) {
			$reason = !$sesion ? 'NO ENCONTRADA' : 'REVOCADA';
			error_log("[AUTH 401] {$method} {$uri} — Sesion {$reason} (hash=" . substr($tokenHash,0,12) . ")");
			ResponseHelper::error('Sesion revocada o invalida', 401);
		}

		if (strtotime($sesion['fecha_expiracion']) < time()) {
			error_log("[AUTH 401] {$method} {$uri} — Sesion expirada (expira={$sesion['fecha_expiracion']})");
			ResponseHelper::error('Sesion expirada', 401);
		}

		error_log("[AUTH OK] {$method} {$uri} — user={$payload['sub']} rol={$payload['rol_activo']} dep={$payload['dependencia_id']}");

 self::$user = [
 'id' => $payload['sub'],
 'documento' => $payload['documento'] ?? '',
 'roles' => $payload['roles'] ?? [],
 'entidad_id' => $payload['entidad_id'] ?? null,
 'dependencia_id' => $payload['dependencia_id'] ?? null,
 'rol_activo' => $payload['rol_activo'] ?? null,
 ];
 }

 public static function user(): array
 {
 return self::$user;
 }

 public static function rolActivo(): string
 {
 return self::$user['rol_activo'] ?? '';
 }
}