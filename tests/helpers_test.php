<?php
declare(strict_types=1);
/**
 * Tests unitarios para helpers (ValidatorHelper, SanitizerHelper, MensajesCNSC).
 * Standalone, sin PHPUnit. No depende de vendor autoloader.
 *
 * Uso: php tests/helpers_test.php
 */

// Carga directa de archivos fuente (sin autoloader de composer)
require_once __DIR__ . '/../backend/src/Helper/ValidatorHelper.php';
require_once __DIR__ . '/../backend/src/Helper/SanitizerHelper.php';
require_once __DIR__ . '/../backend/src/Helper/MensajesCNSC.php';
require_once __DIR__ . '/../backend/src/Helper/ResponseHelper.php';

use App\Helper\ValidatorHelper;
use App\Helper\SanitizerHelper;
use App\Helper\MensajesCNSC;

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
        echo "  FAIL [{$idx}] {$name}\n    expected=" . var_export($expected, true) . "\n    actual  =" . var_export($actual, true) . "\n";
    }
}

function checkErrors(string $name, array $expectedErrors, array $actualErrors): void
{
    global $pass, $fail, $idx;
    $idx++;
    if ($expectedErrors === $actualErrors) {
        $pass++;
        echo "  OK   [{$idx}] {$name}\n";
    } else {
        $fail++;
        echo "  FAIL [{$idx}] {$name}\n    expected=" . json_encode($expectedErrors, JSON_UNESCAPED_UNICODE) . "\n    actual  =" . json_encode($actualErrors, JSON_UNESCAPED_UNICODE) . "\n";
    }
}

echo "=== EDL-CAREPA Helper Tests ===\n\n";

// ===================================================================
// VALIDATOR HELPER
// ===================================================================
echo "--- ValidatorHelper: required ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['nombre' => 'Juan'], ['nombre' => 'required']);
check('required campo presente', true, $ok);
check('required sin errores', [], $v->getErrors());

$v = new ValidatorHelper();
$ok = $v->validate(['nombre' => ''], ['nombre' => 'required']);
check('required campo vacio', false, $ok);
checkErrors('required campo vacio error', ['nombre' => 'Nombre es obligatorio'], $v->getErrors());

$v = new ValidatorHelper();
$ok = $v->validate([], ['nombre' => 'required']);
check('required campo ausente', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['nombre' => null], ['nombre' => 'required']);
check('required campo null', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['items' => []], ['items' => 'required']);
check('required array vacio', false, $ok);

echo "\n--- ValidatorHelper: email ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['email' => 'user@example.com'], ['email' => 'email']);
check('email valido', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['email' => 'invalido'], ['email' => 'email']);
check('email invalido', false, $ok);
checkErrors('email invalido error', ['email' => 'Email debe ser un email valido'], $v->getErrors());

$v = new ValidatorHelper();
$ok = $v->validate(['email' => ''], ['email' => 'email']);
check('email vacio (opcional)', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['email' => 'user@.com'], ['email' => 'email']);
check('email mal formado 1', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['email' => 'user@'], ['email' => 'email']);
check('email sin dominio', false, $ok);

echo "\n--- ValidatorHelper: min/max ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['pass' => '12345678'], ['pass' => 'min:8']);
check('min:8 exacto', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['pass' => '1234567'], ['pass' => 'min:8']);
check('min:8 menor', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['pass' => ''], ['pass' => 'min:8']);
check('min:8 vacio (opcional)', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['nombre' => 'ABCDE'], ['nombre' => 'max:5']);
check('max:5 exacto', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['nombre' => 'ABCDEF'], ['nombre' => 'max:5']);
check('max:5 excede', false, $ok);

echo "\n--- ValidatorHelper: integer/numeric ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['edad' => 25], ['edad' => 'integer']);
check('integer 25', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['edad' => '25'], ['edad' => 'integer']);
check('integer string "25"', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['edad' => 3.14], ['edad' => 'integer']);
check('integer float 3.14', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['edad' => 'abc'], ['edad' => 'integer']);
check('integer string "abc"', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['sueldo' => 2500000.50], ['sueldo' => 'numeric']);
check('numeric float', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['sueldo' => '2500000.50'], ['sueldo' => 'numeric']);
check('numeric string float', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['sueldo' => 'abc'], ['sueldo' => 'numeric']);
check('numeric string no numerica', false, $ok);

echo "\n--- ValidatorHelper: alpha/alpha_num ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['nombre' => 'Juan'], ['nombre' => 'alpha']);
check('alpha solo letras', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['nombre' => 'Juan Pérez'], ['nombre' => 'alpha']);
check('alpha con acentos y espacios', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['nombre' => 'Juan123'], ['nombre' => 'alpha']);
check('alpha con numeros', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['usuario' => 'juan123'], ['usuario' => 'alpha_num']);
check('alpha_num alfanumerico', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['usuario' => 'juan_123'], ['usuario' => 'alpha_num']);
check('alpha_num con guion bajo', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['usuario' => 'juan@123'], ['usuario' => 'alpha_num']);
check('alpha_num con simbolo', false, $ok);

echo "\n--- ValidatorHelper: in ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['estado' => 'activo'], ['estado' => 'in:activo,inactivo']);
check('in valor valido', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['estado' => 'pendiente'], ['estado' => 'in:activo,inactivo']);
check('in valor invalido', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['estado' => ''], ['estado' => 'in:activo,inactivo']);
check('in vacio (opcional)', true, $ok);

echo "\n--- ValidatorHelper: date ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['fecha' => '2026-07-19'], ['fecha' => 'date']);
check('date formato ISO', true, $ok);

// Nota: el validador normaliza a Y-m-d y compara con substr($value,0,10).
// Formatos alternativos como DD-MM-YYYY o con slash son rechazados aunque
// date_create() los interprete. Esto es por diseno.
$v = new ValidatorHelper();
$ok = $v->validate(['fecha' => '19-07-2026'], ['fecha' => 'date']);
check('date DD-MM-YYYY (rechazado por normalizacion)', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['fecha' => '2026/07/19'], ['fecha' => 'date']);
check('date formato slash (rechazado por normalizacion)', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['fecha' => 'no-es-fecha'], ['fecha' => 'date']);
check('date string invalido', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['fecha' => ''], ['fecha' => 'date']);
check('date vacio (opcional)', true, $ok);

echo "\n--- ValidatorHelper: documento ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['doc' => '12345678'], ['doc' => 'documento']);
check('documento 8 digitos', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['doc' => '12345'], ['doc' => 'documento']);
check('documento 5 digitos (muy corto)', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['doc' => '123456789012345678901'], ['doc' => 'documento']);
check('documento 21 digitos (muy largo)', false, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['doc' => 'AB123456'], ['doc' => 'documento']);
check('documento con letras', false, $ok);

echo "\n--- ValidatorHelper: telefono ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['tel' => '3001234567'], ['tel' => 'telefono']);
check('telefono 10 digitos', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['tel' => '+57 300 123 4567'], ['tel' => 'telefono']);
check('telefono con prefijo y espacios', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['tel' => '123'], ['tel' => 'telefono']);
check('telefono muy corto', false, $ok);

echo "\n--- ValidatorHelper: multi-regla ---\n";

// Nota: min/max usan mb_strlen, no comparacion numerica.
// "min:18" en edad=30 falla porque "30" length=2 < 18.
// Esto es una limitacion del validador actual.
$v = new ValidatorHelper();
$rules = [
    'nombre' => 'required|alpha|min:3|max:50',
    'email' => 'email',
];
$ok = $v->validate(['nombre' => 'Juan Pérez', 'email' => 'juan@mail.com'], $rules);
check('multi-regla todas validas', true, $ok);

$v = new ValidatorHelper();
$rulesFull = [
    'nombre' => 'required|alpha|min:3|max:50',
    'email' => 'email',
    'edad' => 'integer',
];
$ok = $v->validate(['nombre' => '', 'email' => 'no-email', 'edad' => 'abc'], $rulesFull);
check('multi-regla todas invalidas', false, $ok);
checkErrors('multi-regla errores', [
    'nombre' => 'Nombre es obligatorio',
    'email' => 'Email debe ser un email valido',
    'edad' => 'Edad debe ser un numero entero',
], $v->getErrors());

echo "\n--- ValidatorHelper: edge cases ---\n";

$v = new ValidatorHelper();
$ok = $v->validate(['valor' => '0'], ['valor' => 'integer']);
check('integer string "0"', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['valor' => 0], ['valor' => 'integer']);
check('integer 0', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['valor' => '-5'], ['valor' => 'integer']);
check('integer negativo "-5"', true, $ok);

$v = new ValidatorHelper();
$ok = $v->validate(['valor' => '1.5'], ['valor' => 'integer']);
check('integer string float', false, $ok);

// ===================================================================
// SANITIZER HELPER
// ===================================================================
echo "\n--- SanitizerHelper ---\n";

check('sanitize string simple', 'hola', SanitizerHelper::sanitize('  hola  '));
check('sanitize string con slashes', "it's a test", SanitizerHelper::sanitize("it\\'s a test"));
check('sanitize int passthru', 42, SanitizerHelper::sanitize(42));
check('sanitize null passthru', null, SanitizerHelper::sanitize(null));
check('sanitize array recursivo', ['a' => 'x', 'b' => 'y'], SanitizerHelper::sanitize(['a' => '  x  ', 'b' => '  y  ']));

check('cleanInt string', 42, SanitizerHelper::cleanInt('42abc'));
// FILTER_SANITIZE_NUMBER_INT conserva todos los digitos, "42.5" -> 425
check('cleanInt float string (quita punto)', 425, SanitizerHelper::cleanInt('42.5'));
check('cleanInt negativo', -5, SanitizerHelper::cleanInt('-5'));
check('cleanInt cero', 0, SanitizerHelper::cleanInt('0'));

check('cleanEmail simple', 'user@example.com', SanitizerHelper::cleanEmail('  user@example.com  '));

// strip_tags remueve etiquetas pero conserva el contenido interno
check('cleanString sin etiquetas (strip_tags conserva contenido)', 'alert("xss")Hola Mundo', SanitizerHelper::cleanString('  <script>alert("xss")</script>Hola Mundo  '));
check('cleanString con HTML', 'Texto', SanitizerHelper::cleanString('<p><b>Texto</b></p>'));
check('cleanString null', '', SanitizerHelper::cleanString(null));
check('cleanString array', '', SanitizerHelper::cleanString(['a']));

check('escapeOutput simple', '&lt;script&gt;', SanitizerHelper::escapeOutput('<script>'));
check('escapeOutput con quotes', '&quot;hola&quot;', SanitizerHelper::escapeOutput('"hola"'));
check('escapeOutput ampersand', '&amp;', SanitizerHelper::escapeOutput('&'));
check('escapeOutput null', '', SanitizerHelper::escapeOutput(null));

echo "\n--- SanitizerHelper: XSS payloads (strip_tags) ---\n";

$payload = '<script>alert(1)</script>';
$clean = SanitizerHelper::cleanString($payload);
check('strip_tags remueve <script> tag', false, str_contains($clean, '<script>'));
check('strip_tags conserva contenido textual', true, str_contains($clean, 'alert(1)'));

$payload = '<img src=x onerror=alert(1)>';
$clean = SanitizerHelper::cleanString($payload);
check('strip_tags remueve <img> tag', false, str_contains($clean, '<img'));

$payload = '<svg onload=alert(1)>';
$clean = SanitizerHelper::cleanString($payload);
check('strip_tags remueve <svg> tag', false, str_contains($clean, '<svg'));

$payload = 'javascript:alert(1)';
$clean = SanitizerHelper::cleanString($payload);
check('cleanString texto plano sin HTML pasa igual', 'javascript:alert(1)', $clean);

// IMPORTANTE: cleanString solo hace strip_tags, NO es proteccion XSS completa.
// La proteccion XSS real esta en escapeOutput() con htmlspecialchars.

// ===================================================================
// MENSAJES CNSC
// ===================================================================
echo "\n--- MensajesCNSC ---\n";

$msg = MensajesCNSC::concertacion('creada', ['nombre' => 'JUAN GOMEZ']);
check('concertacion creada contiene resolucion', true, str_contains($msg, 'Resolución 1760 de 2010'));
check('concertacion creada contiene nombre', true, str_contains($msg, 'JUAN GOMEZ'));

$msg = MensajesCNSC::concertacion('aprobada', ['nombre' => 'MARIA LOPEZ']);
check('concertacion aprobada 3 dias', true, str_contains($msg, 'tres (3) días'));

$msg = MensajesCNSC::concertacion('rechazada', ['nombre' => 'TEST']);
check('concertacion rechazada fijacion unilateral', true, str_contains($msg, 'fijación unilateral'));

$msg = MensajesCNSC::concertacion('no_conformidad', ['nombre' => 'TEST']);
check('concertacion no conformidad 5 dias', true, str_contains($msg, 'cinco (5) días'));

$msg = MensajesCNSC::concertacion('fijacion_unilateral', ['nombre' => 'TEST']);
check('concertacion fijacion unilateral art 33', true, str_contains($msg, 'artículo 33'));

$msg = MensajesCNSC::concertacion('inexistente');
check('concertacion evento inexistente', '', $msg);

$msg = MensajesCNSC::evaluacion('calificada', ['nombre' => 'ANA', 'calificacion' => '85', 'nivel' => 'Sobresaliente']);
check('evaluacion calificada contiene %', true, str_contains($msg, '85%'));
check('evaluacion calificada contiene nivel', true, str_contains($msg, 'Sobresaliente'));

$msg = MensajesCNSC::evaluacion('aprobada_comision', ['nombre' => 'ANA', 'calificacion' => '90', 'nivel' => 'Sobresaliente']);
check('evaluacion aprobada comision', true, str_contains($msg, 'Comisión de Evaluación'));

$msg = MensajesCNSC::evaluacion('rechazada_comision', ['nombre' => 'ANA']);
check('evaluacion rechazada art 51', true, str_contains($msg, 'artículo 51'));

$msg = MensajesCNSC::evaluacion('recurso', ['nombre' => 'ANA']);
check('evaluacion recurso art 52', true, str_contains($msg, 'Art. 52'));

$msg = MensajesCNSC::evaluacion('inexistente');
check('evaluacion evento inexistente', '', $msg);

$msg = MensajesCNSC::compromiso('mejoramiento', ['nombre' => 'CARLOS', 'motivo' => 'Bajo rendimiento']);
check('compromiso mejoramiento art 62', true, str_contains($msg, 'artículo 62'));

$msg = MensajesCNSC::compromiso('incumplimiento', ['nombre' => 'CARLOS']);
check('compromiso incumplimiento art 64', true, str_contains($msg, 'artículo 64'));

$msg = MensajesCNSC::periodo('apertura', ['periodo' => '2026-2027']);
check('periodo apertura', true, str_contains($msg, '2026-2027'));

$msg = MensajesCNSC::periodo('cierre', ['periodo' => '2026-2027']);
check('periodo cierre', true, str_contains($msg, '2026-2027'));

// ===================================================================
// SUMMARY
// ===================================================================
echo "\n=== RESUMEN: {$pass} OK, {$fail} FAIL ===\n";
exit($fail > 0 ? 1 : 0);
