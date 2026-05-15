<?php

namespace App\Middleware;

use App\Helper\ResponseHelper;

class RateLimitMiddleware
{
    private static array $attempts = [];
    private static int $maxAttempts = 60;
    private static int $windowSeconds = 60;

    public static function handle(): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = $ip;
        $now = time();

        if (!isset(self::$attempts[$key])) {
            self::$attempts[$key] = ['count' => 0, 'reset_at' => $now + self::$windowSeconds];
        }

        if ($now > self::$attempts[$key]['reset_at']) {
            self::$attempts[$key] = ['count' => 0, 'reset_at' => $now + self::$windowSeconds];
        }

        self::$attempts[$key]['count']++;

        $remaining = self::$maxAttempts - self::$attempts[$key]['count'];
        header("X-RateLimit-Limit: " . self::$maxAttempts);
        header("X-RateLimit-Remaining: " . max(0, $remaining));

        if (self::$attempts[$key]['count'] > self::$maxAttempts) {
            ResponseHelper::error('Demasiadas solicitudes. Intente nuevamente mas tarde.', 429);
        }
    }
}
