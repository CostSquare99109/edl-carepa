<?php

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

 $uri = $_SERVER['REQUEST_URI'] ?? '';
 if (strpos($uri, '/api/v1/auth/login') !== false) {
 return;
 }
 if (strpos($uri, '/api/v1/auth/recuperar') !== false) {
 return;
 }
 if (strpos($uri, '/api/v1/auth/registro') !== false) {
 return;
 }
 if (strpos($uri, '/api/v1/auth/verificar') !== false) {
 return;
 }

 $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
 if (!CsrfHelper::validar($csrfToken)) {
 ResponseHelper::error('Token CSRF invalido o expirado', 419);
 }
 }
}
