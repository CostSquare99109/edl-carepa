<?php
declare(strict_types=1);

/**
 * Tests unitarios para Router.
 * Crea controllers mock para probar matching, params y groups.
 * Ejecutar: php tests/unit_router_test.php
 */

require_once __DIR__ . '/../backend/vendor/autoload.php';

use App\Router\Router;

// ─── Mock controllers that record calls ───
class MockController
{
    public static array $calls = [];

    public static function reset(): void { self::$calls = []; }

    public function listar(): void { self::$calls[] = ['action' => 'listar', 'args' => []]; }
    public function ver(int $id): void { self::$calls[] = ['action' => 'ver', 'args' => ['id' => $id]]; }
    public function crear(): void { self::$calls[] = ['action' => 'crear', 'args' => []]; }
    public function actualizar(int $id): void { self::$calls[] = ['action' => 'actualizar', 'args' => ['id' => $id]]; }
    public function eliminar(int $id): void { self::$calls[] = ['action' => 'eliminar', 'args' => ['id' => $id]]; }
    public function dos_params(int $id, string $slug): void { self::$calls[] = ['action' => 'dos_params', 'args' => ['id' => $id, 'slug' => $slug]]; }
    public function sin_params(): void { self::$calls[] = ['action' => 'sin_params', 'args' => []]; }
}

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

// Dispatch helper — captures output, handles exit from ResponseHelper
function call(Router $router, string $method, string $uri): ?array
{
    MockController::reset();
    ob_start();
    try {
        @$router->dispatch($method, $uri);
    } catch (\Throwable $e) {}
    ob_end_clean();
    return MockController::$calls[0] ?? null;
}

echo "=== Unit Tests: Router ===\n\n";

// ─── Basic route matching ───
echo "--- Basic route matching ---\n";
$r = new Router();
$r->get('/usuarios', [MockController::class, 'listar']);
$r->post('/usuarios', [MockController::class, 'crear']);

$call = call($r, 'GET', '/usuarios');
check('GET /usuarios -> listar', 'listar', $call['action']);

$call = call($r, 'POST', '/usuarios');
check('POST /usuarios -> crear', 'crear', $call['action']);

// ─── Route with param ───
echo "\n--- Route with param ---\n";
$r = new Router();
$r->get('/usuarios/{id}', [MockController::class, 'ver']);

$call = call($r, 'GET', '/usuarios/42');
check('GET /usuarios/42 -> ver', 'ver', $call['action']);
check('param id=42', 42, $call['args']['id']);

$call = call($r, 'GET', '/usuarios/123');
check('param id=123', 123, $call['args']['id']);

// ─── String param ───
echo "\n--- String param ---\n";
class MockStrController {
    public static array $calls = [];
    public static function reset(): void { self::$calls = []; }
    public function ver(string $id): void { self::$calls[] = ['action' => 'ver', 'args' => ['id' => $id]]; }
}
$r3 = new Router();
$r3->get('/items/{slug}', [MockStrController::class, 'ver']);
MockStrController::reset();
ob_start(); @ $r3->dispatch('GET', '/items/hello-world'); ob_end_clean();
check('string param hello-world', 'hello-world', MockStrController::$calls[0]['args']['id']);

// ─── Multiple params ───
echo "\n--- Multiple params ---\n";
$r = new Router();
$r->get('/entities/{id}/items/{slug}', [MockController::class, 'dos_params']);

$call = call($r, 'GET', '/entities/5/items/my-item');
check('multi-param action', 'dos_params', $call['action']);
check('multi-param id=5', 5, $call['args']['id']);
check('multi-param slug=my-item', 'my-item', $call['args']['slug']);

// ─── Group with prefix ───
echo "\n--- Group with prefix ---\n";
$r = new Router();
$r->group('/api/v1', function (Router $r) {
    $r->get('/usuarios', [MockController::class, 'listar']);
    $r->get('/usuarios/{id}', [MockController::class, 'ver']);
});

$call = call($r, 'GET', '/api/v1/usuarios');
check('group prefix GET /api/v1/usuarios', 'listar', $call['action']);

$call = call($r, 'GET', '/api/v1/usuarios/7');
check('group prefix param id=7', 7, $call['args']['id']);

// ─── Nested groups ───
echo "\n--- Nested groups ---\n";
$r = new Router();
$r->group('/api', function (Router $r) {
    $r->group('/v1', function (Router $r) {
        $r->get('/items', [MockController::class, 'listar']);
    });
});

$call = call($r, 'GET', '/api/v1/items');
check('nested group /api/v1/items', 'listar', $call['action']);

// ─── Route order: fixed before parametric ───
echo "\n--- Route order: fixed before parametric ---\n";
$r = new Router();
$r->get('/evaluaciones/pendientes-calificar', [MockController::class, 'listar']);
$r->get('/evaluaciones/{id}', [MockController::class, 'ver']);

$call = call($r, 'GET', '/evaluaciones/pendientes-calificar');
check('fixed route matches first', 'listar', $call['action']);

$call = call($r, 'GET', '/evaluaciones/42');
check('parametric route matches after', 'ver', $call['action']);
check('parametric id=42', 42, $call['args']['id']);

// ─── HTTP methods ───
echo "\n--- HTTP methods ---\n";
$r = new Router();
$r->get('/items', [MockController::class, 'listar']);
$r->post('/items', [MockController::class, 'crear']);
$r->put('/items/{id}', [MockController::class, 'actualizar']);
$r->delete('/items/{id}', [MockController::class, 'eliminar']);

check('GET /items', 'listar', call($r, 'GET', '/items')['action']);
check('POST /items', 'crear', call($r, 'POST', '/items')['action']);
check('PUT /items/10', 'actualizar', call($r, 'PUT', '/items/10')['action']);
check('DELETE /items/10', 'eliminar', call($r, 'DELETE', '/items/10')['action']);

// ─── Trailing slash ───
echo "\n--- Trailing slash ---\n";
$r = new Router();
$r->get('/usuarios', [MockController::class, 'listar']);
$call = call($r, 'GET', '/usuarios/');
check('trailing slash eliminado', 'listar', $call['action']);

// ─── Query string ───
echo "\n--- Query string ---\n";
$r = new Router();
$r->get('/usuarios', [MockController::class, 'listar']);
$call = call($r, 'GET', '/usuarios?page=1&sort=name');
check('query string ignorada', 'listar', $call['action']);

// ─── Multiple routes same path different method ───
echo "\n--- Same path, different methods ---\n";
$r = new Router();
$r->get('/resource', [MockController::class, 'listar']);
$r->post('/resource', [MockController::class, 'crear']);
$r->put('/resource', [MockController::class, 'sin_params']);
$r->delete('/resource', [MockController::class, 'sin_params']);

check('GET resource', 'listar', call($r, 'GET', '/resource')['action']);
check('POST resource', 'crear', call($r, 'POST', '/resource')['action']);

// ─── Summary ───
echo "\n=== RESUMEN: {$pass} OK, {$fail} FAIL ===\n";
exit($fail > 0 ? 1 : 0);
