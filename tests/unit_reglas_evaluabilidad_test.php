<?php
declare(strict_types=1);

/**
 * Tests unitarios de ReglaEvaluabilidadService: semestre de ingreso, ventanas
 * de semestre, secuencia del ano laboral y umbrales de calificacion.
 * No requiere BD (solo metodos puros).
 * Ejecutar: php tests/unit_reglas_evaluabilidad_test.php
 */

require_once __DIR__ . '/../backend/vendor/autoload.php';

use App\Config\Env;
use App\Service\ReglaEvaluabilidadService;

// Las pruebas de secuencia necesitan los periodos; si no hay .env / BD, se
// omiten en lugar de romper la suite.
$bdDisponible = false;
try {
    Env::load(__DIR__ . '/../backend/.env');
    \App\Config\Database::getInstance();
    $bdDisponible = true;
} catch (\Throwable $e) {
    echo "  (BD no disponible: se omiten las pruebas de secuencia)\n";
}

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

$reglas = new ReglaEvaluabilidadService();

echo "=== Unit Tests: Reglas de evaluabilidad ===\n\n";

// ─── Semestre derivado de la fecha de posesion ───
echo "--- Semestre de ingreso por fecha ---\n";

check('15-01 (ene) -> segundo semestre (cierra el 2do del periodo anterior)', 'segundo_semestre', $reglas->semestrePorFecha('2026-01-15'));
check('01-02 (feb) -> primer semestre', 'primer_semestre', $reglas->semestrePorFecha('2026-02-01'));
check('10-03 (mar) -> primer semestre', 'primer_semestre', $reglas->semestrePorFecha('2026-03-10'));
check('15-05 (may) -> primer semestre', 'primer_semestre', $reglas->semestrePorFecha('2026-05-15'));
check('31-07 (jul) -> primer semestre', 'primer_semestre', $reglas->semestrePorFecha('2026-07-31'));
check('01-08 (ago) -> segundo semestre', 'segundo_semestre', $reglas->semestrePorFecha('2026-08-01'));
check('15-09 (sep) -> segundo semestre', 'segundo_semestre', $reglas->semestrePorFecha('2026-09-15'));
check('01-10 (oct) -> segundo semestre', 'segundo_semestre', $reglas->semestrePorFecha('2026-10-01'));
check('31-01 (ene) -> segundo semestre', 'segundo_semestre', $reglas->semestrePorFecha('2027-01-31'));
check('fecha vacia -> null', null, $reglas->semestrePorFecha(null));
check('fecha invalida -> null', null, $reglas->semestrePorFecha('no-es-fecha'));

echo "\n--- Jerarquia de fuentes (explicito > fecha > defecto) ---\n";

$usuarioExplicito = ['semestre_ingreso' => 'segundo_semestre', 'fecha_posesion' => '2026-03-10'];
check('explicito manda sobre fecha', 'explicito', $reglas->semestreIngreso($usuarioExplicito)['fuente']);
check('explicito: segundo semestre', 'segundo_semestre', $reglas->semestreIngreso($usuarioExplicito)['semestre']);

$usuarioPorFecha = ['semestre_ingreso' => null, 'fecha_posesion' => '2026-09-15'];
check('deriva de fecha', 'fecha_posesion', $reglas->semestreIngreso($usuarioPorFecha)['fuente']);
check('derivado: segundo semestre', 'segundo_semestre', $reglas->semestreIngreso($usuarioPorFecha)['semestre']);

$usuarioSinDatos = ['semestre_ingreso' => null, 'fecha_posesion' => null];
check('sin datos -> por defecto', 'por_defecto', $reglas->semestreIngreso($usuarioSinDatos)['fuente']);
check('sin datos -> primer semestre', 'primer_semestre', $reglas->semestreIngreso($usuarioSinDatos)['semestre']);

$usuarioVacio = ['semestre_ingreso' => 'valor_invalido', 'fecha_posesion' => '2026-09-15'];
check('explicito invalido cae al defecto', 'primer_semestre', $reglas->semestreIngreso($usuarioVacio)['semestre']);

$usuarioVacioCadena = ['semestre_ingreso' => '', 'fecha_posesion' => '2026-10-01'];
check('cadena vacia se deriva', 'segundo_semestre', $reglas->semestreIngreso($usuarioVacioCadena)['semestre']);

echo "\n--- Ventanas de semestre (periodo 2026-2027) ---\n";

$periodo = ['id' => 1, 'nombre' => '2026-2027', 'fecha_inicio' => '2026-02-01', 'fecha_fin' => '2027-01-31'];

check(
    'ventana 1er semestre',
    ['inicio' => '2026-02-01', 'fin' => '2026-07-31'],
    $reglas->ventanaSemestre($periodo, 'primer_semestre')
);
check(
    'ventana 2do semestre',
    ['inicio' => '2026-08-01', 'fin' => '2027-01-31'],
    $reglas->ventanaSemestre($periodo, 'segundo_semestre')
);
check('nombre con espacios se normaliza', 2026, $reglas->anioInicioPeriodo(['nombre' => '2026 - 2027']));
check('nombre invalido usa fecha_inicio', 2026, $reglas->anioInicioPeriodo(['nombre' => 'x', 'fecha_inicio' => '2026-02-01']));
check('periodo sin anio devuelve vacio', ['inicio' => '', 'fin' => ''], $reglas->ventanaSemestre(['nombre' => 'x'], 'primer_semestre'));

echo "\n--- Anio laboral: ingreso en 1er semestre ---\n";

// Requiere periodos en BD; se omite si no hay BD o periodos.
$periodos = $bdDisponible ? $reglas->periodosOrdenados() : [];
if ($periodos === []) {
    echo "  SKIP sin periodos: se omiten pruebas de secuencia\n";
} else {
    $p1 = (int) $periodos[0]['id'];

    $ingresoPrimero = ['semestre_ingreso' => 'primer_semestre', 'fecha_posesion' => '2026-03-10'];
    $sec = $reglas->secuenciaAnioLaboral($ingresoPrimero, $p1);
    check('ingreso 1er sem: primera parcial = 1er sem', 'parcial_primer_semestre', $sec[0]['tipo'] ?? null);
    check('ingreso 1er sem: segunda parcial = 2do sem', 'parcial_segundo_semestre', $sec[1]['tipo'] ?? null);
    check('ingreso 1er sem: ambas en el mismo periodo', $p1, $sec[1]['periodo_id'] ?? null);

    $ingresoSegundo = ['semestre_ingreso' => 'segundo_semestre', 'fecha_posesion' => '2026-10-01'];
    $sec2 = $reglas->secuenciaAnioLaboral($ingresoSegundo, $p1);
    check('ingreso 2do sem: primera parcial = 2do sem', 'parcial_segundo_semestre', $sec2[0]['tipo'] ?? null);
    check('ingreso 2do sem: segunda parcial = 2do sem (periodo siguiente)', 'parcial_segundo_semestre', $sec2[1]['tipo'] ?? null);

    if (count($periodos) >= 2) {
        $p2 = (int) $periodos[1]['id'];
        check('ingreso 2do sem: la segunda parcial cae en el periodo siguiente', $p2, $sec2[1]['periodo_id'] ?? null);
        check(
            'ingreso 2do sem: ventana de la segunda parcial = 2do sem del periodo siguiente',
            $reglas->ventanaSemestre($periodos[1], 'segundo_semestre'),
            $sec2[1]['ventana'] ?? null
        );
        $cierre1 = $reglas->cierreAnioLaboral($ingresoPrimero, $p1);
        $cierre2 = $reglas->cierreAnioLaboral($ingresoSegundo, $p1);
        check('ingreso 1er sem: cierre en julio', '2026-07-31', $cierre1);
        check('ingreso 2do sem: cierre en enero del año siguiente', '2027-01-31', $cierre2);
    }

    echo "\n--- Reglas de evaluabilidad por caso ---\n";

    // Ingreso en 2do semestre: el 1er semestre no le corresponde.
    $r = $reglas->puedeIniciarEvaluacion($ingresoSegundo, $p1, 'parcial_primer_semestre');
    check('ingreso 2do sem: 1er semestre bloqueado', false, $r['permitido']);
    check('ingreso 2do sem: marcado como exento', true, $r['exento_primer_semestre']);
    check('ingreso 2do sem: motivo no vacio', true, is_string($r['motivo']) && $r['motivo'] !== '');

    // Ingreso en 2do semestre: su 2do semestre es la primera parcial, sin requisito previo.
    $r2 = $reglas->puedeIniciarEvaluacion($ingresoSegundo, $p1, 'parcial_segundo_semestre');
    check('ingreso 2do sem: 2do semestre permitido sin previa', true, $r2['permitido']);
    check('ingreso 2do sem: no exige parcial previa', false, $r2['requiere_parcial_previa']);

    // Ingreso en 1er semestre: el 2do exige la previa (evaluado_id 0 = sin parciales).
    $sinParciales = ['id' => 0, 'semestre_ingreso' => 'primer_semestre', 'fecha_posesion' => '2026-03-10'];
    $r3 = $reglas->puedeIniciarEvaluacion($sinParciales, $p1, 'parcial_segundo_semestre');
    check('ingreso 1er sem: 2do bloqueado sin la 1era parcial', false, $r3['permitido']);
    check('ingreso 1er sem: marca requisito de previa', true, $r3['requiere_parcial_previa']);

    // Tipos que no son parciales no pasan por la secuencia.
    $r4 = $reglas->puedeIniciarEvaluacion($sinParciales, $p1, 'parcial_eventual');
    check('parcial eventual: siempre permitido', true, $r4['permitido']);
}

echo "\n--- Promedio de la definitiva del ano laboral ---\n";

check('promedio de dos parciales', 85.0, $reglas->promedioDefinitivo([90.0, 80.0]));
check('promedio con decimales', 87.5, $reglas->promedioDefinitivo([90.0, 85.0]));
check('una sola parcial (ano laboral incompleto)', 80.0, $reglas->promedioDefinitivo([80.0]));
check('ignora notas en cero', 90.0, $reglas->promedioDefinitivo([90.0, 0.0]));
check('ignora nulls', 90.0, $reglas->promedioDefinitivo([90.0, null]));
check('sin notas -> null', null, $reglas->promedioDefinitivo([]));
check('todas en cero -> null', null, $reglas->promedioDefinitivo([0.0, 0.0]));

echo "\n--- Umbrales de calificacion (85 / 65) ---\n";

check('100 -> sobresaliente', 'sobresaliente', ReglaEvaluabilidadService::nivelPorUmbrales(100.0, 85.0, 65.0));
check('85.0 -> sobresaliente', 'sobresaliente', ReglaEvaluabilidadService::nivelPorUmbrales(85.0, 85.0, 65.0));
check('85.1 -> sobresaliente', 'sobresaliente', ReglaEvaluabilidadService::nivelPorUmbrales(85.1, 85.0, 65.0));
check('84.9 -> satisfactorio', 'satisfactorio', ReglaEvaluabilidadService::nivelPorUmbrales(84.9, 85.0, 65.0));
check('65.0 -> satisfactorio', 'satisfactorio', ReglaEvaluabilidadService::nivelPorUmbrales(65.0, 85.0, 65.0));
check('65.1 -> satisfactorio', 'satisfactorio', ReglaEvaluabilidadService::nivelPorUmbrales(65.1, 85.0, 65.0));
check('64.9 -> no satisfactorio', 'no_satisfactorio', ReglaEvaluabilidadService::nivelPorUmbrales(64.9, 85.0, 65.0));
check('0 -> no satisfactorio', 'no_satisfactorio', ReglaEvaluabilidadService::nivelPorUmbrales(0.0, 85.0, 65.0));

// ─── Resumen ───
echo "\n=== Resultado: {$pass} OK, {$fail} FAIL ===\n";
exit($fail > 0 ? 1 : 0);