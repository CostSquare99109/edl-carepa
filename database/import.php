<?php
/**
 * Importador del Manual de Funciones normalizado (Decreto 159/2024).
 *
 * Lee /storage/emulated/0/Download/edl-carepa/edl_carepa_normalizado.json
 * e inserta en el modelo nuevo (schema.sql) respetando FKs:
 *   catalogo_naturaleza_cargo -> competencias_comunes -> competencias_comportamentales
 *   -> catalogo_conocimientos_basicos -> clases_empleo -> clases_empleo_conocimientos
 *   -> cargos -> cargo_funciones_esenciales / cargo_contribuciones_individuales
 *
 * IDEMPOTENTE: las tablas del modelo nuevo se vacian (DELETE) al inicio, dentro
 * de la misma transaccion. `dependencias` NO se toca (tabla CNSC existente en
 * uso): el dependencia_id se resuelve por nombre normalizado (con stopwords).
 *
 * Uso:  php database/import.php [ruta-al-json]
 * Exit: 0 OK, 1 error (rollback completo).
 */

declare(strict_types=1);

require __DIR__ . '/../backend/vendor/autoload.php';

use App\Config\Env;
use App\Config\Database;

$jsonPath = $argv[1] ?? '/storage/emulated/0/Download/edl-carepa/edl_carepa_normalizado.json';
if (!is_file($jsonPath)) {
    fwrite(STDERR, "ERROR: no existe el JSON: {$jsonPath}\n");
    exit(1);
}

Env::load(__DIR__ . '/../backend/.env');
$pdo = Database::getInstance();

/** Normaliza un nombre para comparar: minusculas, sin tildes, sin stopwords */
function normNombre(string $s): string
{
    $s = strtolower($s);
    $s = strtr($s, [
        'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
        'ü' => 'u', 'ñ' => 'n', 'ä' => 'a', 'ö' => 'o',
    ]);
    $s = preg_replace('/[^a-z0-9 ]+/', ' ', $s) ?? '';
    $s = preg_replace('/\b(de|del|la|las|los|el|al)\b/', ' ', $s) ?? '';
    return preg_replace('/\s+/', ' ', trim($s)) ?? '';
}

/** Normaliza el nivel JSON ('Técnico') a niveles_jerarquicos.codigo ('tecnico') */
function normNivel(string $s): string
{
    return normNombre($s);
}

$data = json_decode(file_get_contents($jsonPath), true);
if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
    fwrite(STDERR, 'ERROR: JSON invalido: ' . json_last_error_msg() . "\n");
    exit(1);
}

// ---------- dependencias: resolver id BD por nombre normalizado ----------
$deps = $pdo->query("SELECT id, nombre FROM dependencias WHERE eliminado_en IS NULL")->fetchAll();
$depMap = [];
foreach ($deps as $d) {
    $depMap[normNombre($d['nombre'])] = (int) $d['id'];
}
$depResuelto = [];
$sinMatch = [];
foreach ($data['dependencias'] as $dep) {
    $key = normNombre($dep['nombre']);
    if (!isset($depMap[$key])) {
        $sinMatch[] = $dep['nombre'];
        continue;
    }
    $depResuelto[$dep['id']] = $depMap[$key];
}
if ($sinMatch) {
    fwrite(STDERR, 'ERROR: dependencias sin match en BD: ' . implode('; ', $sinMatch) . "\n");
    exit(1);
}

// ---------- niveles: validar que los 6 del JSON existan en BD ----------
$niveles = $pdo->query("SELECT codigo FROM niveles_jerarquicos")->fetchAll(PDO::FETCH_COLUMN);
$niveles = array_flip($niveles);
foreach (array_keys($data['competencias_comportamentales_por_nivel']) as $nivelJson) {
    if (!isset($niveles[normNivel($nivelJson)])) {
        fwrite(STDERR, "ERROR: nivel sin match en niveles_jerarquicos: {$nivelJson}\n");
        exit(1);
    }
}

// ---------- orden de borrado (tablas del modelo nuevo, dentro de la tx) ----------
$DELETE_ORDER = [
    'cargo_contribuciones_individuales',
    'cargo_funciones_esenciales',
    'clases_empleo_conocimientos',
    'cargos',
    'clases_empleo',
    'competencias_comportamentales',
    'competencias_comunes',
    'catalogo_conocimientos_basicos',
    'catalogo_naturaleza_cargo',
];

try {
    $pdo->beginTransaction();

    foreach ($DELETE_ORDER as $tabla) {
        $pdo->exec("DELETE FROM {$tabla}");
    }

    $resumen = [];

    // ---------- 1. catalogo_naturaleza_cargo ----------
    $stmt = $pdo->prepare('INSERT INTO catalogo_naturaleza_cargo (id, nombre, etiqueta) VALUES (?, ?, ?)');
    foreach ($data['catalogo_naturaleza_cargo'] as $n) {
        $stmt->execute([$n['id'], $n['nombre'], $n['etiqueta']]);
    }
    $resumen['catalogo_naturaleza_cargo'] = count($data['catalogo_naturaleza_cargo']);

    // ---------- 2. competencias_comunes ----------
    $stmt = $pdo->prepare('INSERT INTO competencias_comunes (id, nombre) VALUES (?, ?)');
    foreach ($data['competencias_comunes'] as $c) {
        $stmt->execute([$c['id'], $c['nombre']]);
    }
    $resumen['competencias_comunes'] = count($data['competencias_comunes']);

    // ---------- 3. competencias_comportamentales ----------
    $stmt = $pdo->prepare('INSERT INTO competencias_comportamentales (nivel, nombre, orden) VALUES (?, ?, ?)');
    $nComp = 0;
    foreach ($data['competencias_comportamentales_por_nivel'] as $nivelJson => $competencias) {
        foreach ($competencias as $i => $nombre) {
            $stmt->execute([normNivel($nivelJson), $nombre, $i + 1]);
            $nComp++;
        }
    }
    $resumen['competencias_comportamentales'] = $nComp;

    // ---------- 4. catalogo_conocimientos_basicos ----------
    $stmt = $pdo->prepare('INSERT INTO catalogo_conocimientos_basicos (id, nombre) VALUES (?, ?)');
    foreach ($data['catalogo_conocimientos_basicos'] as $c) {
        $stmt->execute([$c['id'], $c['nombre']]);
    }
    $resumen['catalogo_conocimientos_basicos'] = count($data['catalogo_conocimientos_basicos']);

    // ---------- 5. clases_empleo (requisitos como columnas) ----------
    $stmt = $pdo->prepare('INSERT INTO clases_empleo
        (id, codigo, grado, denominacion, nivel, requisitos_estudio, requisitos_experiencia,
         nivel_educativo_minimo, horas_curso_minimo, anios_experiencia, tipo_experiencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($data['clases_empleo'] as $c) {
        $r = $c['requisitos_estructurados'];
        $stmt->execute([
            $c['id'],
            $c['codigo'],
            $c['grado'],
            $c['denominacion'],
            strtolower($c['nivel']),
            $c['requisitos_estudio'],
            $c['requisitos_experiencia'],
            $r['nivel_educativo_minimo'],
            $r['horas_curso_minimo'],
            $r['anios_experiencia'],
            $r['tipo_experiencia'],
        ]);
    }
    $resumen['clases_empleo'] = count($data['clases_empleo']);

    // ---------- 6. clases_empleo_conocimientos ----------
    // Dedupe intra-clase: el JSON fuente repite refs en 2 clases (GLO-074
    // tenia CON-121 duplicado); el PK (clase, conocimiento) exige unicidad.
    $stmt = $pdo->prepare('INSERT INTO clases_empleo_conocimientos (clase_empleo_id, conocimiento_id, orden) VALUES (?, ?, ?)');
    $nRefs = 0;
    $dupes = 0;
    foreach ($data['clases_empleo'] as $c) {
        $vistos = [];
        foreach ($c['conocimientos_basicos_ref'] as $i => $ref) {
            if (isset($vistos[$ref])) {
                $dupes++;
                continue;
            }
            $vistos[$ref] = true;
            $stmt->execute([$c['id'], $ref, $i + 1]);
            $nRefs++;
        }
    }
    $resumen['clases_empleo_conocimientos'] = $nRefs;

    // ---------- 7. cargos ----------
    $stmt = $pdo->prepare('INSERT INTO cargos
        (id, clase_empleo_id, dependencia_id, naturaleza_cargo_id, planta, codigo, grado,
         denominacion, nivel, cargo_jefe_inmediato, no_cargos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $sinJefe = 0;
    foreach ($data['cargos'] as $c) {
        $jefe = ($c['cargo_jefe_inmediato'] !== null && trim($c['cargo_jefe_inmediato']) !== '')
            ? $c['cargo_jefe_inmediato'] : null;
        if ($jefe === null) {
            $sinJefe++;
        }
        $stmt->execute([
            $c['id'],
            $c['clase_empleo_id'],
            $depResuelto[$c['dependencia_id']],
            $c['naturaleza_cargo_id'],
            $c['planta'],
            $c['codigo'],
            $c['grado'],
            $c['denominacion'],
            strtolower($c['nivel']),
            $jefe,
            $c['no_cargos'],
        ]);
    }
    $resumen['cargos'] = count($data['cargos']);

    // ---------- 8. cargo_funciones_esenciales ----------
    $stmt = $pdo->prepare('INSERT INTO cargo_funciones_esenciales (cargo_id, texto, orden) VALUES (?, ?, ?)');
    $nF = 0;
    foreach ($data['cargos'] as $c) {
        foreach ($c['funciones_esenciales'] as $i => $texto) {
            $stmt->execute([$c['id'], $texto, $i + 1]);
            $nF++;
        }
    }
    $resumen['cargo_funciones_esenciales'] = $nF;

    // ---------- 9. cargo_contribuciones_individuales ----------
    $stmt = $pdo->prepare('INSERT INTO cargo_contribuciones_individuales (cargo_id, texto, orden) VALUES (?, ?, ?)');
    $nC = 0;
    foreach ($data['cargos'] as $c) {
        foreach ($c['contribuciones_individuales_criterios_desempeno'] as $i => $texto) {
            $stmt->execute([$c['id'], $texto, $i + 1]);
            $nC++;
        }
    }
    $resumen['cargo_contribuciones_individuales'] = $nC;

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    fwrite(STDERR, "ROLLBACK aplicado, BD sin cambios.\n");
    exit(1);
}

// ---------- resumen ----------
$ancho = 42;
printf("+%'-{$ancho}s+\n", '');
printf("| %-{$ancho}s |\n", 'RESUMEN IMPORTACION - Manual de Funciones 2024');
printf("+%'-{$ancho}s+\n", '');
foreach ($resumen as $tabla => $n) {
    printf("| %-34s %8d |\n", $tabla, $n);
}
printf("+%'-{$ancho}s+\n", '');
echo "Dependencias resueltas por nombre (tabla CNSC existente, sin cambios): " . count($depResuelto) . "\n";
echo "Cargos con jefe_inmediato vacio (JSON): {$sinJefe}\n";
echo "OK - importacion completada.\n";
exit(0);
