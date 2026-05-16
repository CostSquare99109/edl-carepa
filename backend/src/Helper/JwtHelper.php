<?php

namespace App\Helper;

use App\Config\Env;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

class JwtHelper
{
    private static function getSecret(): string
    {
        return Env::require('JWT_SECRET');
    }

    private static function getAlgorithm(): string
    {
        return 'HS256';
    }

    private static function getExpiration(): int
    {
        return (int) Env::get('JWT_EXPIRACION_MINUTOS', 120);
    }

 public static function generate(int $userId, string $documento, array $roles = [], ?int $entidadId = null, ?string $rolActivo = null): string
 {
 $now = time();
 $payload = [
 'iat' => $now,
 'exp' => $now + (self::getExpiration() * 60),
 'sub' => $userId,
 'documento' => $documento,
 'roles' => $roles,
 'entidad_id' => $entidadId,
 'rol_activo' => $rolActivo ?? ($roles[0] ?? null),
 ];

 return JWT::encode($payload, self::getSecret(), self::getAlgorithm());
 }

 /**
 * Extrae el rol_activo del token JWT actual del header Authorization
 */
 public static function getRolActivo(): ?string
 {
 $token = self::extractFromHeader();
 if (!$token) {
 return null;
 }
 try {
 $payload = self::validate($token);
 return $payload['rol_activo'] ?? null;
 } catch (\Exception $e) {
 return null;
 }
 }

    /**
     * @return array Decoded payload as associative array
     * @throws \Exception if token is invalid or expired
     */
    public static function validate(string $token): array
    {
        $decoded = JWT::decode($token, new Key(self::getSecret(), self::getAlgorithm()));
 $payload = (array) $decoded;
 $payload['roles'] = (array) ($payload['roles'] ?? []);
 if (!isset($payload['rol_activo']) && !empty($payload['roles'])) {
 $payload['rol_activo'] = $payload['roles'][0];
 }
 return $payload;
    }

    public static function getHash(string $token): string
    {
        return hash('sha256', $token);
    }

    public static function extractFromHeader(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
