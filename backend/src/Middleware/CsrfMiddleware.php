<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helper\CsrfHelper;
use App\Helper\ResponseHelper;

class CsrfMiddleware
{
 public static function handle(): void
 {
 $method = $_SERVER['REQUEST_METHOD'] ?? '';

 if (in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
 return;
 }

	$uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
	$uri = '/' . trim($uri, '/');
	if (in_array($uri, ['/api/v1/auth/login', '/api/v1/auth/recuperar', '/api/v1/auth/registro', '/api/v1/auth/verificar-codigo'], true)) {
	return;
	}

 $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
 if (!CsrfHelper::validar($csrfToken)) {
 ResponseHelper::error('Token CSRF invalido o expirado', 419);
 }
 }
}
