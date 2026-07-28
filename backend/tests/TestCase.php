<?php

declare(strict_types=1);

namespace Tests;

use App\Config\Database;
use App\Config\Env;
use PDO;
use PHPUnit\Framework\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected static ?PDO $pdo = null;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Load test environment
        Env::load(__DIR__ . '/../.env.testing');
        
        // Use a separate test database or transaction rollback
        self::$pdo = Database::getInstance();
        
        // Disable foreign key checks for truncation
        self::$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    }

    protected function tearDown(): void
    {
        // Clean up test data - rollback or truncate
        if (self::$pdo) {
            self::$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
        }
        parent::tearDown();
    }

    /**
     * Truncate tables for clean state (use carefully)
     */
    protected function truncateTables(array $tables): void
    {
        if (!self::$pdo) return;
        
        self::$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
        foreach ($tables as $table) {
            self::$pdo->exec("TRUNCATE TABLE `$table`");
        }
        self::$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    }

    /**
     * Create a test user and return its ID
     */
    protected function createTestUser(array $overrides = []): int
    {
        $defaults = [
            'documento' => 'TEST' . random_int(100000, 999999),
            'tipo_documento' => 'CC',
            'primer_nombre' => 'Test',
            'primer_apellido' => 'User',
            'email' => 'test' . random_int(1000, 9999) . '@example.com',
            'password_hash' => password_hash('password123', PASSWORD_BCRYPT),
            'estado' => 'activo',
            'entidad_id' => 1,
            'dependencia_id' => 1,
        ];
        $data = array_merge($defaults, $overrides);
        
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        $stmt = self::$pdo->prepare("INSERT INTO usuarios ($columns) VALUES ($placeholders)");
        $stmt->execute($data);
        
        return (int) self::$pdo->lastInsertId();
    }

    /**
     * Get a valid JWT token for a test user
     */
    protected function getTestToken(int $userId, string $rolActivo = 'evaluador'): string
    {
        $stmt = self::$pdo->prepare("SELECT documento, roles FROM usuarios u 
            LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id
            LEFT JOIN roles r ON r.id = ur.rol_id
            WHERE u.id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new \Exception("Test user not found: $userId");
        }

        // Use the app's JwtHelper to generate token
        require_once __DIR__ . '/../vendor/autoload.php';
        $jwtHelper = new \App\Helper\JwtHelper();
        return $jwtHelper::generate(
            $userId,
            $user['documento'],
            ['evaluador'],
            1,
            $rolActivo,
            1
        );
    }
}