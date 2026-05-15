<?php
// Script para resetear el usuario admin - EJECUTAR CON: php reset_admin.php
// O desde el navegador: http://localhost:8000/reset_admin.php

$host = 'localhost';
$dbname = 'edl_cnsc';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Generar hash correcto para la contraseña Admin2026!
    $hash = password_hash('Admin2026!', PASSWORD_BCRYPT);
    echo "Nuevo hash: $hash\n";

    // Resetear password, estado y intentos fallidos del admin
    $stmt = $pdo->prepare("UPDATE usuarios SET password_hash = ?, estado = 'activo', intentos_fallidos = 0 WHERE documento = '12345678' AND tipo_documento = 'CC'");
    $stmt->execute([$hash]);
    $filas = $stmt->rowCount();
    echo "Filas actualizadas: $filas\n";

    // Verificar que funciona
    $stmt2 = $pdo->prepare("SELECT password_hash, estado, intentos_fallidos FROM usuarios WHERE documento = '12345678' AND tipo_documento = 'CC'");
    $stmt2->execute();
    $row = $stmt2->fetch();

    if ($row) {
        echo "Estado: {$row['estado']}\n";
        echo "Intentos fallidos: {$row['intentos_fallidos']}\n";
        $verificado = password_verify('Admin2026!', $row['password_hash']) ? 'SI' : 'NO';
        echo "password_verify funciona: $verificado\n";
    } else {
        echo "ERROR: No se encontro el usuario admin\n";
        
        // Listar usuarios existentes
        $stmt3 = $pdo->query("SELECT id, documento, tipo_documento, nombres, apellidos, estado FROM usuarios LIMIT 10");
        echo "\nUsuarios en la BD:\n";
        foreach ($stmt3->fetchAll() as $u) {
            echo "  ID:{$u['id']} Doc:{$u['documento']} Tipo:{$u['tipo_documento']} Nombre:{$u['nombres']} {$u['apellidos']} Estado:{$u['estado']}\n";
        }
    }

} catch (PDOException $e) {
    echo "Error de BD: " . $e->getMessage() . "\n";
}
