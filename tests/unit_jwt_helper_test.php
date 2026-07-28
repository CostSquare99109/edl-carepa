<?php
declare(strict_types=1);

/**
 * Tests unitarios para JwtHelper.
 * Ejecutar: php tests/unit_jwt_helper_test.php
 */

require_once __DIR__ . '/../backend/vendor/autoload.php';

use App\Helper\JwtHelper;
use App\Config\Env;

// ─── Setup: set JWT_SECRET for testing ───
putenv('JWT_SECRET=tests-secret-key-for-unit-tests-32chars!!');
putenv('JWT_EXPIRACION_MINUTOS=120');

// ─── Test harness ───
$pass = 0;
$fail = 0;
$idx = 0;

function check(string $name, mixed $expected, mixed $actual): void
{
    global $pass, $fail, $idx;
    $idx++;
    if ($expected === $actual) {
        $pass++;
        echo "  OK   [{$idx}] {$name}\n";
    } else {
        $fail++;
        $e = is_string($expected) ? $expected : var_export($expected, true);
        $a = is_string($actual) ? $actual : var_export($actual, true);
        echo "  FAIL [{$idx}] {$name}\n    expected={$e}\n    actual  ={$a}\n";
    }
}

function checkTrue(string $name, bool $actual): void
{
    check($name, true, $actual);
}

function checkFalse(string $name, bool $actual): void
{
    check($name, false, $actual);
}

echo "=== Unit Tests: JwtHelper ===\n\n";

// ─── generate() + validate() roundtrip ───
echo "--- generate + validate roundtrip ---\n";
$token = JwtHelper::generate(
    userId: 42,
    documento: '12345678',
    roles: ['evaluador', 'jefe_dependencia'],
    entidadId: 1,
    rolActivo: 'evaluador',
    dependenciaId: 5
);

check('generate retorna string', true, is_string($token));
check('generate no vacio', true, strlen($token) > 20);

$payload = JwtHelper::validate($token);
check('validate sub = userId', 42, $payload['sub']);
check('validate documento', '12345678', $payload['documento']);
check('validate roles contiene evaluador', true, in_array('evaluador', $payload['roles']));
check('validate roles contiene jefe_dependencia', true, in_array('jefe_dependencia', $payload['roles']));
check('validate entidad_id', 1, $payload['entidad_id']);
check('validate dependencia_id', 5, $payload['dependencia_id']);
check('validate rol_activo', 'evaluador', $payload['rol_activo']);
check('validate iat es int', true, is_int($payload['iat']));
check('validate exp es int', true, is_int($payload['exp']));
check('validate exp > iat', true, $payload['exp'] > $payload['iat']);

// ─── generate con rolActivo null (deberia usar primer rol) ───
echo "\n--- generate con rolActivo null ---\n";
$token2 = JwtHelper::generate(
    userId: 99,
    documento: '99999999',
    roles: ['admin_carepa'],
    rolActivo: null
);
$payload2 = JwtHelper::validate($token2);
check('rolActivo null -> primer rol', 'admin_carepa', $payload2['rol_activo']);

// ─── generate sin roles ───
echo "\n--- generate sin roles ---\n";
$token3 = JwtHelper::generate(userId: 1, documento: '00000000', roles: []);
$payload3 = JwtHelper::validate($token3);
check('sin roles -> roles es array vacio', [], $payload3['roles']);
check('sin roles -> rol_activo null', null, $payload3['rol_activo']);

// ─── Token expirado ───
echo "\n--- Token expirado ---\n";
putenv('JWT_EXPIRACION_MINUTOS=0');
$expiredToken = JwtHelper::generate(userId: 1, documento: '00000000', roles: []);
putenv('JWT_EXPIRACION_MINUTOS=120');

try {
    JwtHelper::validate($expiredToken);
    check('token expirado lanza excepcion', true, false); // should not reach here
} catch (\Exception $e) {
    $isExpired = str_contains($e->getMessage(), 'expired') || $e instanceof \Firebase\JWT\ExpiredException;
    check('token expirado lanza ExpiredException', true, $isExpired);
}

// ─── Token con firma invalida ───
echo "\n--- Token firma invalida ---\n";
$validToken = JwtHelper::generate(userId: 1, documento: '00000000', roles: ['test']);
// Modify the signature (last part after last dot)
$parts = explode('.', $validToken);
$parts[2] = str_repeat('A', strlen($parts[2])); // tamper signature
$forgedToken = implode('.', $parts);

try {
    JwtHelper::validate($forgedToken);
    check('token firma invalida lanza excepcion', true, false);
} catch (\Exception $e) {
    $isSignatureError = str_contains($e->getMessage(), 'signature') ||
                        $e instanceof \Firebase\JWT\SignatureInvalidException;
    check('token firma invalida lanza SignatureInvalidException', true, $isSignatureError);
}

// ─── Token basura ───
echo "\n--- Token basura ---\n";
try {
    JwtHelper::validate('not-a-jwt-token');
    check('token basura lanza excepcion', true, false);
} catch (\Exception $e) {
    check('token basura lanza excepcion', true, true);
}

// ─── getHash() ───
echo "\n--- getHash() ---\n";
$hash1 = JwtHelper::getHash('test-token-123');
$hash2 = JwtHelper::getHash('test-token-123');
check('getHash es consistente', $hash1, $hash2);
check('getHash es SHA-256 (64 chars)', 64, strlen($hash1));
check('getHash formato hex', true, ctype_xdigit($hash1));

$hash3 = JwtHelper::getHash('different-token');
check('getHash diferentes inputs -> diferentes hashes', true, $hash1 !== $hash3);

// ─── extractFromHeader() ───
echo "\n--- extractFromHeader() ---\n";
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer my-jwt-token-here';
$extracted = JwtHelper::extractFromHeader();
check('extractFromHeader Bearer token', 'my-jwt-token-here', $extracted);

$_SERVER['HTTP_AUTHORIZATION'] = 'bearer uppercase-token';
$extracted2 = JwtHelper::extractFromHeader();
check('extractFromHeader bearer lowercase', 'uppercase-token', $extracted2);

$_SERVER['HTTP_AUTHORIZATION'] = 'Basic dXNlcjpwYXNz';
$extracted3 = JwtHelper::extractFromHeader();
check('extractFromHeader Basic auth -> null', null, $extracted3);

$_SERVER['HTTP_AUTHORIZATION'] = '';
$extracted4 = JwtHelper::extractFromHeader();
check('extractFromHeader header vacio -> null', null, $extracted4);

unset($_SERVER['HTTP_AUTHORIZATION']);
$extracted5 = JwtHelper::extractFromHeader();
check('extractFromHeader sin header -> null', null, $extracted5);

// ─── getRolActivo() ───
echo "\n--- getRolActivo() ---\n";
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . JwtHelper::generate(1, '00000000', ['evaluador', 'jefe'], rolActivo: 'jefe');
$rol = JwtHelper::getRolActivo();
check('getRolActivo desde header', 'jefe', $rol);

unset($_SERVER['HTTP_AUTHORIZATION']);
$rolNull = JwtHelper::getRolActivo();
check('getRolActivo sin header -> null', null, $rolNull);

// ─── getDependenciaId() ───
echo "\n--- getDependenciaId() ---\n";
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . JwtHelper::generate(1, '00000000', ['test'], dependenciaId: 42);
$depId = JwtHelper::getDependenciaId();
check('getDependenciaId desde header', 42, $depId);

unset($_SERVER['HTTP_AUTHORIZATION']);
$depNull = JwtHelper::getDependenciaId();
check('getDependenciaId sin header -> null', null, $depNull);

// ─── Cleanup ───
unset($_SERVER['HTTP_AUTHORIZATION']);

// ─── Summary ───
echo "\n=== RESUMEN: {$pass} OK, {$fail} FAIL ===\n";
exit($fail > 0 ? 1 : 0);
