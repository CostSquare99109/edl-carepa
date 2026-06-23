<?php
$base = 'http://localhost:8001';
$pass = 0;
$fail = 0;

function api(string $method, string $path, array $data = [], ?string $token = null): array
{
    global $base;
    $opts = [
        'http' => [
            'method' => $method,
            'header' => 'Content-Type: application/json',
            'timeout' => 10,
        ]
    ];
    if ($data) {
        $opts['http']['content'] = json_encode($data);
    }
    if ($token) {
        $opts['http']['header'] .= "\r\nAuthorization: Bearer $token";
    }
    $ctx = stream_context_create($opts);
    $body = @file_get_contents($base . $path, false, $ctx);
    if ($body === false) return ['code' => 'NET_ERR', 'message' => error_get_last()['message'] ?? 'Network error'];
    return json_decode($body, true) ?: ['code' => 'PARSE_ERR', 'message' => 'Invalid JSON'];
}

function test(string $label, string $method, string $path, array $data = [], ?string $token = null, string $expectedCode = '01'): void
{
    global $pass, $fail;
    $resp = api($method, $path, $data, $token);
    $code = $resp['code'] ?? '???';
    $msg = $resp['message'] ?? '';
    if ($code === $expectedCode) {
        echo "  [OK] $label\n";
        $pass++;
    } else {
        echo "  [FAIL] $label: got $code - $msg\n";
        $fail++;
    }
}

echo "=== EDL-CAREPA API Tests ===\n\n";

// 1. Login
echo "--- Auth ---\n";
$resp = api('POST', '/api/v1/auth/login', ['documento' => 'admin', 'password' => 'Admin2026!']);
$token = $resp['data']['token'] ?? '';
if ($resp['code'] === '01' && $token) {
    echo "  [OK] Login\n";
    $pass++;
} else {
    echo "  [FAIL] Login: " . ($resp['message'] ?? 'unknown error') . "\n";
    $fail++;
    exit(1);
}

// 2. Perfil
test('Perfil', 'GET', '/api/v1/auth/perfil', [], $token);
test('Menu', 'GET', '/api/v1/menu', [], $token);
test('Notificaciones', 'GET', '/api/v1/notificaciones?por_pagina=5', [], $token);
test('CSRF Token', 'GET', '/api/v1/auth/csrf', [], $token);
test('Dashboard resumen', 'GET', '/api/v1/dashboard/resumen', [], $token);
test('Dashboard periodo-activo', 'GET', '/api/v1/dashboard/periodo-activo', [], $token);

echo "\n--- CRUD Modules ---\n";
test('Usuarios listar', 'GET', '/api/v1/usuarios?por_pagina=5', [], $token);
test('Usuario ver (id=1)', 'GET', '/api/v1/usuarios/1', [], $token);
test('Dependencias listar', 'GET', '/api/v1/dependencias', [], $token);
test('Periodos listar', 'GET', '/api/v1/periodos', [], $token);
test('Entidades listar', 'GET', '/api/v1/entidades', [], $token);
test('Metas listar', 'GET', '/api/v1/metas', [], $token);
test('Competencias listar', 'GET', '/api/v1/competencias', [], $token);
test('Parametros listar', 'GET', '/api/v1/parametros', [], $token);
test('Evaluaciones listar', 'GET', '/api/v1/evaluaciones?por_pagina=5', [], $token);
test('Compromisos listar', 'GET', '/api/v1/compromisos?por_pagina=5', [], $token);
test('Concertaciones listar', 'GET', '/api/v1/concertaciones?por_pagina=5', [], $token);
test('Evidencias listar', 'GET', '/api/v1/evidencias?por_pagina=5', [], $token);
test('Ausentismos listar', 'GET', '/api/v1/ausentismos?por_pagina=5', [], $token);
test('Movilidades listar', 'GET', '/api/v1/movilidades?por_pagina=5', [], $token);

echo "\n--- Reportes ---\n";
test('Reportes resumen', 'GET', '/api/v1/reportes/resumen', [], $token);
test('Reportes funcionario (id=6)', 'GET', '/api/v1/reportes/funcionario/6', [], $token);

echo "\n--- Dashboard ---\n";
test('Admin stats', 'GET', '/api/v1/dashboard/admin-stats', [], $token);
test('Actividad', 'GET', '/api/v1/dashboard/actividad?por_pagina=5', [], $token);
test('Buscar funcionario global', 'GET', '/api/v1/usuarios/buscar-global?q=Juan', [], $token);

echo "\n--- Consulta funcionario ---\n";
test('Consulta por cedula', 'GET', '/api/v1/consulta-funcionario?cedula=52987634', [], $token);

echo "\n--- Compromisos flows ---\n";
test('Compromisos pendientes', 'GET', '/api/v1/compromisos/pendientes', [], $token);
test('Propuestos por evaluado', 'GET', '/api/v1/compromisos/propuestos-evaluado', [], $token);
test('Buscar evaluado', 'GET', '/api/v1/compromisos/buscar-evaluado?q=Juan', [], $token);
test('Competencias comportamentales', 'GET', '/api/v1/compromisos/competencias-comportamentales', [], $token);
test('Evaluaciones pendientes calificar', 'GET', '/api/v1/evaluaciones/pendientes-calificar', [], $token);
test('Compromisos mejoramiento listar', 'GET', '/api/v1/compromisos-mejoramiento', [], $token);

echo "\n--- Logout ---\n";
test('Logout', 'POST', '/api/v1/auth/logout', [], $token);

echo "\n=== RESUMEN: $pass OK, $fail FAIL ===\n";
exit($fail > 0 ? 1 : 0);
