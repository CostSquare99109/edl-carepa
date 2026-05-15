<?php

namespace App\Middleware;

use App\Config\Env;
use App\Helper\ResponseHelper;

class CorsMiddleware
{
    public static function handle(): void
    {
        $origin = Env::get('CORS_ORIGIN', 'http://localhost:5173');
        $allowedOrigins = [$origin];

        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($requestOrigin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: {$requestOrigin}");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
