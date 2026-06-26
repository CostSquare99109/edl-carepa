<?php
require __DIR__ . '/vendor/autoload.php';
\App\Config\Env::load(__DIR__ . '/.env');

$pdo = \App\Config\Database::getInstance();

$sqlPath = '/storage/emulated/0/edl/funcionarios (2).sql';
$content = file_get_contents($sqlPath);

preg_match_all('/INSERT INTO `funcionarios`.*?VALUES\s*(.*?);/s', $content, $matches);

$funcionarios = [];
foreach ($matches[1] as $block) {
  preg_match_all('/\(([^)]+)\)/', $block, $rows);
  foreach ($rows[1] as $row) {
    $parts = str_getcsv($row, ',', "'");
    if (count($parts) < 8) continue;

    $cedula = trim($parts[1], " '");
    $nombre = trim($parts[2], " '");
    $telefono = trim($parts[4], " '");
    $correo = trim($parts[6], " '");
    $isActive = trim($parts[7], " '");

    if ($cedula === '0' || $cedula === '') continue;

    $key = $cedula;
    if (!isset($funcionarios[$key]) || $isActive === '1') {
      $funcionarios[$key] = [
        'cedula' => $cedula,
        'nombre' => $nombre,
        'correo' => $correo,
        'telefono' => $telefono,
      ];
    }
  }
}

echo "Total funcionarios (deduplicados, con cedula): " . count($funcionarios) . "\n";

$stmt = $pdo->query("SELECT documento FROM usuarios");
$existingDocs = $stmt->fetchAll(\PDO::FETCH_COLUMN);

$existingSet = [];
foreach ($existingDocs as $d) {
  $existingSet[trim($d)] = true;
}

$insertados = 0;
$saltados = 0;
$passwd = 'Edl2026!';
$hash = password_hash($passwd, PASSWORD_BCRYPT);

$insertUsuario = $pdo->prepare("
  INSERT INTO usuarios (documento, tipo_documento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email, telefono1, password_hash, estado, intentos_fallidos, entidad_id, dependencia_id, denominacion_empleo, grado_empleo, tipo_nombramiento)
  VALUES (?, 'CC', ?, ?, ?, ?, ?, ?, ?, 'activo', 0, 1, 1, 'Funcionario', '00', 'hecho_en_carrera')
  ON DUPLICATE KEY UPDATE email=VALUES(email), telefono1=VALUES(telefono1)
");

$insertRol = $pdo->prepare("INSERT IGNORE INTO usuario_rol (usuario_id, rol_id) VALUES (?, 3)");

function parsearNombre($nombreCompleto) {
  $parts = preg_split('/\s+/', trim($nombreCompleto));
  $count = count($parts);

  if ($count === 1) return [$parts[0], '', '', ''];
  if ($count === 2) return [$parts[0], '', $parts[1], ''];
  if ($count === 3) return [$parts[0], '', $parts[1], $parts[2]];
  if ($count >= 4) {
    $mitad = intdiv($count, 2);
    return [
      implode(' ', array_slice($parts, 0, $mitad)),
      '',
      implode(' ', array_slice($parts, $mitad)),
      '',
    ];
  }
  return ['', '', '', ''];
}

foreach ($funcionarios as $f) {
  $cedula = $f['cedula'];
  if (isset($existingSet[$cedula])) {
    $saltados++;
    continue;
  }

  [$pn, $sn, $pa, $sa] = parsearNombre($f['nombre']);
  $email = $f['correo'] ?: $cedula . '@carepa.gov.co';
  $telefono = $f['telefono'] ?: '';

  $insertUsuario->execute([$cedula, $pn, $sn, $pa, $sa, $email, $telefono, $hash]);
  $uid = $pdo->lastInsertId();
  if ($uid) {
    $insertRol->execute([$uid]);
    $insertados++;
    echo "  + {$cedula} - {$f['nombre']}\n";
  }
}

echo "\nResumen:\n";
echo "  Ya existian: {$saltados}\n";
echo "  Insertados:  {$insertados}\n";
echo "  Password:    {$passwd}\n";
