<?php

namespace App\Helper;

class ResponseHelper
{
    public static function success(mixed $data = null, string $message = 'Operacion exitosa', int $httpCode = 200): void
    {
        http_response_code($httpCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'code' => '01',
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message = 'Error interno del servidor', int $httpCode = 500, mixed $data = null): void
    {
        http_response_code($httpCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'code' => '02',
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function validationError(array $errors): void
    {
        self::error('Datos de entrada invalidos', 422, $errors);
    }

    public static function notFound(string $message = 'Recurso no encontrado'): void
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'No autorizado'): void
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Acceso denegado'): void
    {
        self::error($message, 403);
    }

    public static function paginated(array $items, int $total, int $page, int $perPage): void
    {
        self::success([
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => (int) ceil($total / max($perPage, 1)),
        ]);
    }
}
