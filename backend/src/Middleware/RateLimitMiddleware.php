<?php

namespace App\Middleware;

use App\Helper\ResponseHelper;
use App\Helper\IpHelper;

class RateLimitMiddleware
{
 private static int $maxAttempts = 60;
 private static int $windowSeconds = 60;

 public static function handle(): void
 {
 $ip = IpHelper::clientIp();
 $key = 'rate_limit_' . md5($ip);

		$tempDir = sys_get_temp_dir() . '/edl_rate_limit';
		if (!is_dir($tempDir)) {
			@mkdir($tempDir, 0700, true);
		}

		$file = $tempDir . '/' . $key;
		$now = time();

		if (file_exists($file)) {
			$data = json_decode(file_get_contents($file), true);
		} else {
			$data = ['count' => 0, 'reset_at' => $now + self::$windowSeconds];
		}

		if ($now > ($data['reset_at'] ?? 0)) {
			$data = ['count' => 0, 'reset_at' => $now + self::$windowSeconds];
		}

		$data['count']++;

		file_put_contents($file, json_encode($data), LOCK_EX);

		$remaining = self::$maxAttempts - $data['count'];
		header("X-RateLimit-Limit: " . self::$maxAttempts);
		header("X-RateLimit-Remaining: " . max(0, $remaining));

		if ($data['count'] > self::$maxAttempts) {
			header('Retry-After: ' . ($data['reset_at'] - $now));
			ResponseHelper::error('Demasiadas solicitudes. Intente nuevamente mas tarde.', 429);
		}
	}
}
