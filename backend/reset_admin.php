<?php
/**
 * Resetear/crear usuario administrador
 * Uso: php reset_admin.php [documento] [password]
 *   php reset_admin.php                     # admin / Admin2026!
 *   php reset_admin.php admin MiPass123!
 */

require __DIR__ . '/vendor/autoload.php';
\App\Config\Env::load(__DIR__ . '/.env');

$documento = $argv[1] ?? 'admin';
$password  = $argv[2] ?? 'Admin2026!';

try {
    $pdo = \App\Config\Database::getInstance();
    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE documento = ?");
    $stmt->execute([$documento]);
    $existe = $stmt->fetchColumn();

    // Buscar rol jefe_personal dinámicamente
    $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = 'jefe_personal' LIMIT 1");
    $stmt->execute();
    $adminRolId = $stmt->fetchColumn();
    if (!$adminRolId) {
        // Fallback: buscar cualquier rol con 'admin' en el nombre
        $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo LIKE '%admin%' LIMIT 1");
        $stmt->execute();
        $adminRolId = $stmt->fetchColumn() ?: 1;
    }

    if ($existe) {
        $pdo->prepare("UPDATE usuarios SET password_hash = ?, estado = 'activo', intentos_fallidos = 0 WHERE documento = ?")
            ->execute([$hash, $documento]);
        // Asegurar que tenga el rol jefe_personal
        $uid = $existe;
        $pdo->prepare("INSERT IGNORE INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)")
            ->execute([$uid, $adminRolId]);
        echo "Usuario '{$documento}' actualizado. Password: {$password}\n";
    } else {
        $pdo->prepare("INSERT INTO usuarios (documento, tipo_documento, primer_nombre, primer_apellido, email, password_hash, estado, entidad_id, dependencia_id, denominacion_empleo, grado_empleo, tipo_nombramiento) VALUES (?, 'CC', 'Admin', 'Principal', ?, ?, 'activo', 1, 1, 'Administrador', '25', 'hecho_en_carrera')")
            ->execute([$documento, "{$documento}@carepa.gov.co", $hash]);
        $uid = $pdo->lastInsertId();
        $pdo->prepare("INSERT IGNORE INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)")
            ->execute([$uid, $adminRolId]);
        echo "Usuario '{$documento}' creado (ID:{$uid}). Password: {$password}\n";
    }

    $ver = $pdo->prepare("SELECT id, documento, estado, password_hash FROM usuarios WHERE documento = ?");
    $ver->execute([$documento]);
    $u = $ver->fetch();
    echo "Estado: {$u['estado']} | password_verify: " . (password_verify($password, $u['password_hash']) ? 'OK' : 'FAIL') . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
