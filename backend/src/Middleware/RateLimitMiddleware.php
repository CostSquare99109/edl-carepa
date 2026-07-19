<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helper\ResponseHelper;
use App\Helper\IpHelper;

/**
 * Rate limit por IDENTIDAD, no por IP.
 *
 * Razón: cuando el frontend se sirve detrás de Vite dev proxy (frontend Vite
 * :5173/5174 → backend PHP :8000), el backend ve REMOTE_ADDR = 127.0.0.1
 * para TODOS los usuarios de la LAN. Keyear por IP agrupaba a toda la
 * organización en un único bucket de 60 req/60s — un solo usuario
 * refrescando varias veces bloqueaba a todos (bug P1 reportado 2026-07-17).
 *
 * Estrategia:
 *  - Si la request trae Authorization Bearer con JWT parseable: key por
 *    `user:<id>`. Aislamiento real entre usuarios autenticados.
 *  - Si NO trae JWT (login, recuperación, refresh, OPTIONS): key por IP.
 *    Estos endpoints son públicos y la IP sigue siendo la mejor señal
 *    disponible (Vite proxy reenvía X-Forwarded-For si está seteado).
 *
 * El decode del JWT aquí NO valida firma/expiración — eso lo hace
 * AuthMiddleware después. Solo leemos el payload base64 para extraer
 * el `sub` (userId). Un JWT con firma inválida aún así ocupa un slot
 * del bucket del userId claimed; eso es aceptable porque
 * AuthMiddleware lo rechaza inmediatamente después, no llegando al
 * handler. Límite sube a 200 req/60s — un refresh de dashboard carga
 * 6-8 endpoints; 200 permite ~25 refreshes por minuto por usuario.
 */
class RateLimitMiddleware
{
 private static int $maxAttempts = 200;
 private static int $windowSeconds = 60;

 public static function handle(): void
 {
 $key = self::bucketKey();

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

 /**
 * Compone el identificador del bucket de rate limit.
 *
 * Precedencia:
 * 1. user:<id> si el JWT tiene `sub` parseable
 * 2. ip:<ip> en cualquier otro caso (login, OPTIONS, sin auth)
 *
 * Usa md5() para mantener nombres de archivo cortos y no leakear el
 * IP/userId en el filesystem.
 */
 private static function bucketKey(): string
 {
 $userId = self::extractUserIdFromJwt();
 if ($userId !== null) {
 return 'user_' . md5('user:' . $userId);
 }
 return 'ip_' . md5('ip:' . IpHelper::clientIp());
 }

 /**
 * Extrae el userId del payload del JWT sin validar firma.
 * JWT formato: header.payload.signature — el payload es base64url JSON.
 * Solo lee `sub`; AuthMiddleware se encarga de validar la firma después.
 * Devuelve null si el token no es parseable, no es JSON, o no tiene `sub`.
 */
 private static function extractUserIdFromJwt(): ?int
 {
 $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
 if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
 return null;
 }
 $token = trim($matches[1]);
 $parts = explode('.', $token);
 if (count($parts) !== 3) {
 return null;
 }
 $payload = $parts[1];
 $padded = $payload . str_repeat('=', (4 - strlen($payload) % 4) % 4);
 $json = base64_decode(strtr($padded, '-_', '+/'), true);
 if ($json === false) {
 return null;
 }
 $data = json_decode($json, true);
 if (!is_array($data) || !isset($data['sub'])) {
 return null;
 }
 $sub = $data['sub'];
 if (is_numeric($sub)) {
 return (int) $sub;
 }
 return null;
 }
}