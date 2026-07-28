<?php

declare(strict_types=1);

use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use to
| assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you reduce the number of lines of code in your test files.
|
*/

/**
 * Create a test user and return the user ID
 */
function createTestUser(array $overrides = []): int
{
    return pest()->createTestUser($overrides);
}

/**
 * Get a valid JWT token for a test user
 */
function getTestToken(int $userId, string $rolActivo = 'evaluador'): string
{
    return pest()->generateToken($userId, $rolActivo);
}

/**
 * Make an authenticated request to the API (for integration tests)
 */
function apiRequest(string $method, string $uri, ?array $data = null, ?string $token = null): array
{
    // This is a simplified version - in real tests you'd use the Router directly
    // or make HTTP requests to a test server
    return ['method' => $method, 'uri' => $uri, 'data' => $data];
}

/**
 * Assert that response has success code
 */
function assertSuccess(array $response, string $message = ''): void
{
    expect($response['code'])->toBe('01');
    if ($message) {
        expect($response['message'])->toContain($message);
    }
}

/**
 * Assert that response has error code
 */
function assertError(array $response, string $code = '02'): void
{
    expect($response['code'])->toBe($code);
}

/**
 * Helper to create concertación with commitments for testing
 */
function createTestConcertacion(int $evaluadoId, int $evaluadorId, int $periodoId = 1): int
{
    $pdo = TestCase::$pdo;
    if (!$pdo) throw new \Exception('DB not initialized');
    
    $stmt = $pdo->prepare("
        INSERT INTO concertaciones (periodo_id, evaluado_id, evaluador_id, estado, creado_en)
        VALUES (?, ?, ?, 'aprobada_evaluado', NOW())
    ");
    $stmt->execute([$periodoId, $evaluadoId, $evaluadorId]);
    
    return (int) $pdo->lastInsertId();
}

/**
 * Helper to create functional commitment
 */
function createTestCompromisoFuncional(int $concertacionId, array $data = []): int
{
    $pdo = TestCase::$pdo;
    if (!$pdo) throw new \Exception('DB not initialized');
    
    $defaults = [
        'concertacion_id' => $concertacionId,
        'tipo' => 'funcional',
        'descripcion' => 'Compromiso de prueba ' . random_int(1, 9999),
        'peso' => 50.00,
        'estado' => 'aprobado',
        'resultado_esperado' => 'Resultado esperado',
        'medio_verificacion' => 'Medio de verificación',
    ];
    $data = array_merge($defaults, $data);
    
    $columns = implode(', ', array_keys($data));
    $placeholders = ':' . implode(', :', array_keys($data));
    $stmt = $pdo->prepare("INSERT INTO compromisos ($columns) VALUES ($placeholders)");
    $stmt->execute($data);
    
    return (int) $pdo->lastInsertId();
}

/**
 * Helper to create behavioral commitment
 */
function createTestCompromisoComportamental(int $concertacionId, array $data = []): int
{
    $pdo = TestCase::$pdo;
    if (!$pdo) throw new \Exception('DB not initialized');
    
    $defaults = [
        'concertacion_id' => $concertacionId,
        'tipo' => 'comportamental',
        'descripcion' => 'Compromiso comportamental ' . random_int(1, 9999),
        'peso' => 20.00,
        'estado' => 'aprobado',
        'competencia_codigo' => 'C1',
        'frecuencia' => 'frecuentemente',
        'nivel_comportamental' => 'alto',
        'puntaje_comportamental' => 10.00,
    ];
    $data = array_merge($defaults, $data);
    
    $columns = implode(', ', array_keys($data));
    $placeholders = ':' . implode(', :', array_keys($data));
    $stmt = $pdo->prepare("INSERT INTO compromisos ($columns) VALUES ($placeholders)");
    $stmt->execute($data);
    
    return (int) $pdo->lastInsertId();
}

/**
 * Create evaluation linked to concertacion
 */
function createTestEvaluacion(int $concertacionId, int $evaluadoId, int $evaluadorId, int $periodoId = 1, string $tipo = 'parcial_primer_semestre'): int
{
    $pdo = TestCase::$pdo;
    if (!$pdo) throw new \Exception('DB not initialized');
    
    $stmt = $pdo->prepare("
        INSERT INTO evaluaciones (periodo_id, evaluado_id, evaluador_id, concertacion_id, tipo, estado, creado_en)
        VALUES (?, ?, ?, ?, ?, 'pendiente', NOW())
    ");
    $stmt->execute([$periodoId, $evaluadoId, $evaluadorId, $concertacionId, $tipo]);
    
    return (int) $pdo->lastInsertId();
}