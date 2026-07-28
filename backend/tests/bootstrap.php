<?php
/**
 * PHPUnit bootstrap for EDL Carepa (non-Laravel)
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;
use App\Config\Env;

// Load test environment
Env::load(__DIR__ . '/../.env.testing');

define('EDL_ROOT', __DIR__ . '/..');

// Ensure test database exists
try {
    $pdo = Database::getInstance();
    echo "✓ Database connected for testing\n";
} catch (\Throwable $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    echo "  Run: mysql -u root -p -e 'CREATE DATABASE IF NOT EXISTS edl_carepa_test;'\n";
    exit(1);
}

// Seed minimal test data once - only truncate tables that exist
$pdo = Database::getInstance();
$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

$tables = [
    'auditoria', 'sesiones', 'recuperaciones', 'notificaciones',
    'compromisos', 'concertaciones', 'evaluaciones', 'evidencias',
    'metas', 'ausentismos', 'movilidades', 'solicitudes_cambio',
    'compromisos_mejoramiento', 'compromisos_seguimiento',
    'usuario_rol', 'roles', 'permisos', 'rol_permiso',
    'dependencias', 'entidades', 'periodos', 'competencias', 'conductas',
    'cargos_manual', 'cargos_manual_historial', 'parametros',
    'solicitudes_cambio_evaluador', 'cargos_manual_detalle', 'cargos_manual_requisitos',
    'encargos', 'ext_dependencias', 'funcionarios', 'historial_evaluadores',
    'mejoramiento_seguimientos', 'naturalezas_cargo', 'niveles_jerarquicos',
    'nucleos_basicos_conocimiento', 'tbl_cargo', 'tbl_detalle_cargo',
    'usuario_cargo_manual', 'cargas_masivas', 'rate_limits', 'responsables',
];

foreach ($tables as $table) {
    try {
        $pdo->exec("TRUNCATE TABLE `$table`");
    } catch (\Throwable $e) {
        // Table might not exist, ignore
    }
}

$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

// Re-seed minimal test data
$pdo->exec("INSERT IGNORE INTO entidades (id, codigo, nombre, estado, creado_en) VALUES (1, 'CAREPA', 'ALCALDÍA MUNICIPAL DE CAREPA', 'activo', NOW())");
$pdo->exec("INSERT IGNORE INTO dependencias (id, entidad_id, codigo, nombre, estado, creado_en) VALUES (1, 1, 'SEDUC', 'SECRETARÍA DE EDUCACIÓN Y CULTURA', 'activo', NOW())");

$roles = [
    ['codigo' => 'admin_carepa', 'nombre' => 'Administrador Carepa'],
    ['codigo' => 'jefe_personal', 'nombre' => 'Jefe de Personal'],
    ['codigo' => 'jefe_dependencia', 'nombre' => 'Jefe de Dependencia'],
    ['codigo' => 'evaluador', 'nombre' => 'Evaluador'],
    ['codigo' => 'evaluado', 'nombre' => 'Evaluado'],
    ['codigo' => 'comision_evaluadora', 'nombre' => 'Comisión Evaluadora'],
];
foreach ($roles as $r) {
    $stmt = $pdo->prepare("INSERT IGNORE INTO roles (codigo, nombre, creado_en) VALUES (?, ?, NOW())");
    $stmt->execute([$r['codigo'], $r['nombre']]);
}

$permisos = [
    'usuarios.listar', 'usuarios.crear', 'usuarios.editar', 'usuarios.restablecer',
    'entidades.listar', 'entidades.crear', 'entidades.editar', 'entidades.eliminar', 'entidades.habilitar',
    'dependencias.listar', 'dependencias.crear', 'dependencias.editar',
    'periodos.listar', 'periodos.crear', 'periodos.editar',
    'metas.listar', 'metas.crear', 'metas.editar',
    'concertaciones.listar', 'concertaciones.crear',
    'compromisos.listar', 'compromisos.crear', 'compromisos.editar', 'compromisos.aprobar', 'compromisos.devolver', 'compromisos.enviar', 'compromisos.aceptar',
    'evaluaciones.listar', 'evaluaciones.crear', 'evaluaciones.evaluar', 'evaluaciones.comision',
    'evidencias.listar', 'evidencias.crear', 'evidencias.editar',
    'reportes.generar',
    'cargos_manual.ver', 'cargos_manual.asignar', 'catalogos.nbc.ver',
    'mejoramiento.listar', 'mejoramiento.crear', 'mejoramiento.editar',
    'parametros.listar', 'parametros.editar',
    'ausentismos.listar', 'ausentismos.crear', 'ausentismos.editar',
    'movilidades.listar', 'movilidades.crear', 'movilidades.editar', 'movilidades.ejecutar',
];
foreach ($permisos as $p) {
    $stmt = $pdo->prepare("INSERT IGNORE INTO permisos (codigo, nombre, modulo, creado_en) VALUES (?, ?, 'general', NOW())");
    $stmt->execute([$p, ucfirst(str_replace('.', ' ', $p))]);
}

$stmtRole = $pdo->prepare("SELECT id FROM roles WHERE codigo = 'admin_carepa'");
$stmtRole->execute();
$adminRoleId = $stmtRole->fetchColumn();

$stmtPerm = $pdo->prepare("SELECT id FROM permisos");
$stmtPerm->execute();
$permIds = $stmtPerm->fetchAll(PDO::FETCH_COLUMN);

foreach ($permIds as $pid) {
    $pdo->prepare("INSERT IGNORE INTO rol_permiso (rol_id, permiso_id) VALUES (?, ?)")->execute([$adminRoleId, $pid]);
}

$pdo->exec("INSERT IGNORE INTO periodos (id, nombre, fecha_inicio, fecha_fin, estado, creado_en) VALUES (1, '2024-2025', '2024-02-01', '2025-01-31', 'evaluacion', NOW())");

// Competencias - match actual schema (codigo, nombre, descripcion, decreto)
$competencias = [
    ['C1', 'Orientación al logro', 'Lograr resultados', '1083'],
    ['C2', 'Trabajo en equipo', 'Colaborar con otros', '1083'],
    ['C3', 'Comunicación efectiva', 'Comunicar claramente', '1083'],
    ['C4', 'Adaptabilidad', 'Adaptarse a cambios', '160'],
    ['C5', 'Resolución de problemas', 'Resolver problemas', '1083'],
];
foreach ($competencias as $c) {
    $stmt = $pdo->prepare("INSERT IGNORE INTO competencias (codigo, nombre, descripcion, decreto) VALUES (?, ?, ?, ?)");
    $stmt->execute($c);
}

// Conductas - match actual schema (competencia_codigo, texto, orden, activo)
$conductas = [
    ['C1', 'Cumple metas y objetivos asignados', 1, 1],
    ['C1', 'Busca mejorar resultados continuamente', 2, 1],
    ['C1', 'Asume responsabilidad por resultados', 3, 1],
];
foreach ($conductas as $c) {
    $stmt = $pdo->prepare("INSERT IGNORE INTO conductas (competencia_codigo, texto, orden, activo, creado_en) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute($c);
}