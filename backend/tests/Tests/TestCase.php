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
        Env::load(__DIR__ . '/../../.env.testing');
        
        // Use a separate test database or transaction rollback
        self::$pdo = Database::getInstance();
        
        // Disable foreign key checks for truncation
        self::$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    }

    protected function tearDown(): void
    {
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
        $pdo = $this->getPdo();
        
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
            'nivel' => 'profesional',
            'tipo_nombramiento' => 'hecho_en_carrera',
            'denominacion_empleo' => 'Profesional',
            'grado_empleo' => '10',
            'es_evaluador_y_evaluado' => 0,
            'en_periodo_prueba' => 0,
            'evaluacion_inicio_febrero' => 1,
        ];
        $data = array_merge($defaults, $overrides);
        
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        $stmt = $pdo->prepare("INSERT INTO usuarios ($columns) VALUES ($placeholders)");
        $stmt->execute($data);
        
        return (int) $pdo->lastInsertId();
    }

    /**
     * Assign role to user
     */
    protected function assignRole(int $userId, string $roleCode, ?int $entidadId = 1): void
    {
        $pdo = $this->getPdo();
        $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = ?");
        $stmt->execute([$roleCode]);
        $roleId = $stmt->fetchColumn();
        
        if ($roleId) {
            $pdo->prepare("INSERT IGNORE INTO usuario_rol (usuario_id, rol_id, entidad_id) VALUES (?, ?, ?)")
                ->execute([$userId, $roleId, $entidadId]);
        }
    }
    
    /**
     * Generate JWT token for user
     */
    protected function generateToken(int $userId, string $rolActivo = 'evaluador'): string
    {
        $pdo = $this->getPdo();
        $stmt = $pdo->prepare("SELECT documento FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $documento = $stmt->fetchColumn() ?? 'test';
        
        $roles = [$rolActivo];
        $payload = [
            'iat' => time(),
            'exp' => time() + 7200,
            'sub' => $userId,
            'documento' => $documento,
            'roles' => $roles,
            'entidad_id' => 1,
            'dependencia_id' => 1,
            'rol_activo' => $rolActivo,
        ];
        
        return \Firebase\JWT\JWT::encode($payload, Env::require('JWT_SECRET'), 'HS256');
    }

    /**
     * Get fresh PDO instance
     */
    protected function getPdo(): PDO
    {
        return self::$pdo;
    }
}