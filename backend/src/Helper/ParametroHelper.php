<?php
declare(strict_types=1);

namespace App\Helper;

use App\Config\Database;
use App\Config\Env;

/**
 * Resuelve parámetros de configuración con precedencia: tabla `parametros` (fuente
 * administrable) -> ENV -> default. No altera valores: unifica la fuente de lectura
 * (auditoría P2-2: parámetros muertos en `parametros` mientras el código leía ENV).
 */
final class ParametroHelper
{
    /** Cache por request para evitar consultas repetidas */
    private static array $cache = [];

    public static function int(string $clave, string $envClave, int $default): int
    {
        $val = self::raw($clave, $envClave);
        return is_numeric($val) ? (int) $val : $default;
    }

    public static function float(string $clave, string $envClave, float $default): float
    {
        $val = self::raw($clave, $envClave);
        return is_numeric($val) ? (float) $val : $default;
    }

    private static function raw(string $clave, string $envClave): mixed
    {
        $key = 'db:' . $clave;
        if (!array_key_exists($key, self::$cache)) {
            try {
                $stmt = Database::getInstance()->prepare("SELECT valor FROM parametros WHERE clave = ?");
                $stmt->execute([$clave]);
                $row = $stmt->fetch(\PDO::FETCH_COLUMN);
                self::$cache[$key] = $row !== false && $row !== null ? $row : null;
            } catch (\Throwable) {
                self::$cache[$key] = null;
            }
        }
        if (self::$cache[$key] !== null) {
            return self::$cache[$key];
        }
        $env = Env::get($envClave);
        return $env !== null ? $env : null;
    }
}
