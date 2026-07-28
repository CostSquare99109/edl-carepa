<?php
declare(strict_types=1);

/**
 * Tests unitarios extendidos para SanitizerHelper.
 * Complementa los tests existentes en helpers_test.php.
 * Ejecutar: php tests/unit_sanitizer_test.php
 */

require_once __DIR__ . '/../backend/vendor/autoload.php';

use App\Helper\SanitizerHelper;

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

function checkContains(string $name, string $needle, string $haystack): void
{
    check($name, true, str_contains($haystack, $needle));
}

function checkNotContains(string $name, string $needle, string $haystack): void
{
    check($name, false, str_contains($haystack, $needle));
}

echo "=== Unit Tests: SanitizerHelper (extended) ===\n\n";

// ─── sanitize() - trim + stripslashes ───
echo "--- sanitize() ---\n";
check('sanitize trim simple', 'hola', SanitizerHelper::sanitize('  hola  '));
check('sanitize stripslashes', "it's", SanitizerHelper::sanitize("it\\'s"));
check('sanitize no toca int', 42, SanitizerHelper::sanitize(42));
check('sanitize no toca float', 3.14, SanitizerHelper::sanitize(3.14));
check('sanitize no toca null', null, SanitizerHelper::sanitize(null));
check('sanitize no toca bool true', true, SanitizerHelper::sanitize(true));
check('sanitize no toca bool false', false, SanitizerHelper::sanitize(false));
check('sanitize string vacio', '', SanitizerHelper::sanitize(''));
check('sanitize string solo espacios', '', SanitizerHelper::sanitize('   '));

// Sanitize recursivo en arrays
$dirty = ['a' => '  x  ', 'b' => "it\\'s", 'c' => 42, 'd' => null];
$clean = SanitizerHelper::sanitize($dirty);
check('sanitize array key a', 'x', $clean['a']);
check('sanitize array key b', "it's", $clean['b']);
check('sanitize array key c', 42, $clean['c']);
check('sanitize array key d', null, $clean['d']);

// Array anidado
$nested = ['outer' => ['inner' => '  value  ']];
$cleanNested = SanitizerHelper::sanitize($nested);
check('sanitize array anidado', 'value', $cleanNested['outer']['inner']);

// ─── sanitizeArray() ───
echo "\n--- sanitizeArray() ---\n";
$result = SanitizerHelper::sanitizeArray(['name' => '  Juan  ', 'email' => 'test@test.com']);
check('sanitizeArray nombre', 'Juan', $result['name']);
check('sanitizeArray email intacto', 'test@test.com', $result['email']);

$result2 = SanitizerHelper::sanitizeArray([]);
check('sanitizeArray vacio', [], $result2);

// ─── cleanInt() ───
echo "\n--- cleanInt() ---\n";
check('cleanInt entero', 42, SanitizerHelper::cleanInt('42'));
check('cleanInt con letras', 42, SanitizerHelper::cleanInt('42abc'));
check('cleanInt negativo', -5, SanitizerHelper::cleanInt('-5'));
check('cleanInt cero', 0, SanitizerHelper::cleanInt('0'));
// FILTER_SANITIZE_NUMBER_INT removes non-numeric chars including dot
check('cleanInt float string removes dot', 429, SanitizerHelper::cleanInt('42.9'));
check('cleanInt sin numeros', 0, SanitizerHelper::cleanInt('abc'));
check('cleanInt entero grande', 999999, SanitizerHelper::cleanInt('999999'));
check('cleanInt espacios', 42, SanitizerHelper::cleanInt(' 42 '));

// ─── cleanEmail() ───
echo "\n--- cleanEmail() ---\n";
check('cleanEmail simple', 'user@example.com', SanitizerHelper::cleanEmail('user@example.com'));
check('cleanEmail con espacios', 'user@example.com', SanitizerHelper::cleanEmail('  user@example.com  '));
check('cleanEmail con guiones', 'user-name@domain.co', SanitizerHelper::cleanEmail('user-name@domain.co'));
check('cleanEmail con punto', 'user.name@domain.com', SanitizerHelper::cleanEmail('user.name@domain.com'));

// ─── cleanString() ───
echo "\n--- cleanString() ---\n";
check('cleanString simple', 'hola', SanitizerHelper::cleanString('hola'));
check('cleanString trim', 'hola', SanitizerHelper::cleanString('  hola  '));
check('cleanString strip tags', 'texto', SanitizerHelper::cleanString('<p>texto</p>'));
check('cleanString null -> empty', '', SanitizerHelper::cleanString(null));
check('cleanString int -> empty', '', SanitizerHelper::cleanString(42));
check('cleanString array -> empty', '', SanitizerHelper::cleanString(['a']));
check('cleanString bool -> empty', '', SanitizerHelper::cleanString(true));
check('cleanString empty string', '', SanitizerHelper::cleanString(''));

// ─── escapeOutput() ───
echo "\n--- escapeOutput() ---\n";
check('escapeOutput <', '&lt;', SanitizerHelper::escapeOutput('<'));
check('escapeOutput >', '&gt;', SanitizerHelper::escapeOutput('>'));
check('escapeOutput &', '&amp;', SanitizerHelper::escapeOutput('&'));
check('escapeOutput double quote', '&quot;', SanitizerHelper::escapeOutput('"'));
// PHP 8.5 uses &apos; instead of &#039;
check('escapeOutput single quote', '&apos;', SanitizerHelper::escapeOutput("'"));
check('escapeOutput null', '', SanitizerHelper::escapeOutput(null));
check('escapeOutput int', '', SanitizerHelper::escapeOutput(42));

// ─── XSS payloads ───
echo "\n--- XSS payloads (cleanString) ---\n";
$xssPayloads = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    "'-alert(1)-'",
    '<svg onload=alert(1)>',
    '<iframe src="evil.com">',
    '<body onload=alert(1)>',
    '<input onfocus=alert(1) autofocus>',
    '<marquee onstart=alert(1)>',
    '<details open ontoggle=alert(1)>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<math><mtext><table><mglyph><style><!--</style><img src=x onerror=alert(1)>',
];
foreach ($xssPayloads as $i => $payload) {
    $clean = SanitizerHelper::cleanString($payload);
    check("XSS cleanString #{$i}", false, stripos($clean, '<script>') !== false);
}

// XSS payloads via escapeOutput
// escapeOutput escapes HTML chars (< > & etc) preventing tag execution
// but does NOT strip attribute names like onerror — that's expected behavior
echo "\n--- XSS payloads (escapeOutput) ---\n";
foreach ($xssPayloads as $i => $payload) {
    $escaped = SanitizerHelper::escapeOutput($payload);
    // The key check: < and > are escaped so tags can't execute
    check("XSS escapeOutput #{$i} tags escaped", true, !str_contains($escaped, '<'));
}

// ─── SQL injection patterns ───
echo "\n--- SQL injection patterns ---\n";
$sqlPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' UNION SELECT * FROM usuarios --",
    "admin'--",
    "' OR 1=1 #",
    "1; UPDATE users SET password='hacked'",
    "' UNION SELECT password_hash FROM usuarios WHERE id=1 --",
];
foreach ($sqlPayloads as $i => $payload) {
    // cleanString strips tags but doesn't prevent SQL injection
    // The important thing is that the application uses prepared statements
    $clean = SanitizerHelper::cleanString($payload);
    check("SQLi cleanString #{$i} no rompe", true, is_string($clean));
}

// sanitize() should pass through SQL strings (the defense is at query level)
foreach ($sqlPayloads as $i => $payload) {
    $sanitized = SanitizerHelper::sanitize($payload);
    check("SQLi sanitize #{$i} no rompe", true, is_string($sanitized));
}

// ─── Unicode handling ───
echo "\n--- Unicode handling ---\n";
check('sanitize unicode', 'áéíóú', SanitizerHelper::sanitize('  áéíóú  '));
check('sanitize ñ', 'niño', SanitizerHelper::sanitize('niño'));
check('sanitize emoji', '👍 test', SanitizerHelper::sanitize('  👍 test  '));
check('sanitize chinese', '你好世界', SanitizerHelper::sanitize('  你好世界  '));
check('escapeOutput unicode', 'áéíóú', SanitizerHelper::escapeOutput('áéíóú'));
check('escapeOutput ñ', 'niño', SanitizerHelper::escapeOutput('niño'));

// ─── Long strings ───
echo "\n--- Long strings ---\n";
$longString = str_repeat('a', 10000);
$clean = SanitizerHelper::cleanString($longString);
check('cleanString largo 10k chars', 10000, strlen($clean));

$escaped = SanitizerHelper::escapeOutput($longString);
check('escapeOutput largo 10k chars', 10000, strlen($escaped));

// sanitize() only does trim+stripslashes, preserves newlines/tabs/null bytes
echo "\n--- Special characters ---\n";
check('sanitize preserves newline', "hola\nmundo", SanitizerHelper::sanitize("hola\nmundo"));
check('sanitize preserves tab', "hola\tmundo", SanitizerHelper::sanitize("hola\tmundo"));
check('sanitize preserves null byte', "hola\0mundo", SanitizerHelper::sanitize("hola\0mundo"));
check('escapeOutput newline', "hola\nmundo", SanitizerHelper::escapeOutput("hola\nmundo"));
check('escapeOutput null byte', "hola\0mundo", SanitizerHelper::escapeOutput("hola\0mundo"));

// ─── Summary ───
echo "\n=== RESUMEN: {$pass} OK, {$fail} FAIL ===\n";
exit($fail > 0 ? 1 : 0);
