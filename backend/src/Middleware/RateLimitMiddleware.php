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

		$fp = fopen($file, 'c+');
		if (!$fp) {
			return;
		}

		flock($fp, LOCK_EX);

		$data = ['count' => 0, 'reset_at' => $now + self::$windowSeconds];
		$filesize = filesize($file);
		if ($filesize > 0) {
			$raw = fread($fp, $filesize);
			$parsed = json_decode($raw, true);
			if (is_array($parsed)) {
				$data = $parsed;
			}
		}

		if ($now > ($data['reset_at'] ?? 0)) {
			$data = ['count' => 0, 'reset_at' => $now + self::$windowSeconds];
		}

		$data['count']++;

		ftruncate($fp, 0);
		rewind($fp);
		fwrite($fp, json_encode($data));
		fflush($fp);

		flock($fp, LOCK_UN);
		fclose($fp);

		$remaining = self::$maxAttempts - $data['count'];
		header("X-RateLimit-Limit: " . self::$maxAttempts);
		header("X-RateLimit-Remaining: " . max(0, $remaining));

		if ($data['count'] > self::$maxAttempts) {
			header('Retry-After: ' . ($data['reset_at'] - $now));
			ResponseHelper::error('Demasiadas solicitudes. Intente nuevamente mas tarde.', 429);
		}
	}
}
