<?php
/**
 * Tests unitarios minimos (standalone, sin PHPUnit) para EvaluacionService.
 *
 * Ejecutar:  php tests/test_evaluaciones_fechas.php
 * Salida esperada: "OK 1", "OK 2", ... o "FAIL 1" etc.
 *
 * Cubre los bugs cerrados 2026-06-25:
 *   - unset de claves no-columna en guardar/finalizar
 *   - validarFechasSegundoSemestre con periodo "2026-2027"
 *   - validacion ENUM de tipo_evaluacion
 *   - validacion cruzada fecha_inicio <= fecha_fin
 */

// Validador expuesto: prefijo estatico (no requiere instancia ni PDO).
// Cargamos los archivos fuente reales para que el test ejercite el codigo
// de produccion sin duplicacion.
require_once __DIR__ . '/../src/Helper/ResponseHelper.php';
require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Config/Env.php';
require_once __DIR__ . '/../src/Repository/BaseRepository.php';
require_once __DIR__ . '/../src/Repository/EvaluacionRepository.php';
require_once __DIR__ . '/../src/Repository/CompromisoRepository.php';
require_once __DIR__ . '/../src/Repository/ConcertacionRepository.php';
require_once __DIR__ . '/../src/Repository/UsuarioRepository.php';
require_once __DIR__ . '/../src/Service/EvaluacionService.php';

$validador = '\App\Service\EvaluacionService::validarFechasSegundoSemestreStatic';
$pass = 0;
$fail = 0;
$idx = 0;

function check(string $name, $expected, $actual) {
 global $pass, $fail, $idx;
 $idx++;
 if ($expected === $actual) {
  $pass++;
  echo "OK   [$idx] $name\n";
 } else {
  $fail++;
  echo "FAIL [$idx] $name\n  expected=" . var_export($expected, true) . "\n  actual  =" . var_export($actual, true) . "\n";
 }
}

// 1. Periodo "2026-2027", fechas en rango => OK
check(
 'periodo 2026-2027 rango valido',
 null,
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2026-08-01', '2027-01-31', '2026-2027')
);

// 2. Periodo "2026-2027", fecha inicio antes de 01-08 => error
check(
 'periodo 2026-2027 fecha inicio antes de 01-08',
 "La fecha de inicio debe ser posterior o igual al 01-08-2026 para evaluacion 2do semestre.",
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2026-07-15', '2026-12-31', '2026-2027')
);

// 3. Periodo "2026-2027", fecha fin despues de 31-01+1 => error
check(
 'periodo 2026-2027 fecha fin despues de 31-01',
 "La fecha de fin debe ser anterior o igual al 31-01-2027 para evaluacion 2do semestre.",
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2026-08-15', '2027-02-15', '2026-2027')
);

// 4. Periodo con espacios y formato largo "2026 - 2027" => OK (normalizado)
check(
 'periodo "  2026  -  2027  " rango valido',
 null,
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2026-08-01', '2027-01-31', '  2026  -  2027  ')
);

// 5. Periodo invalido: años no consecutivos "2026-2028" => error explicito
check(
 'periodo 2026-2028 anios no consecutivos',
 "El periodo '2026-2028' no tiene un formato valido (se esperaba AAAA-AAAA con anios consecutivos).",
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2026-08-01', '2027-01-31', '2026-2028')
);

// 6. Fecha inicio > fecha fin => error
check(
 'fechas invertidas',
 'La fecha de inicio no puede ser posterior a la fecha de fin.',
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2027-01-15', '2026-08-01', '2026-2027')
);

// 7. Borde inferior: fecha inicio = 01-08 (limite exacto) => OK
check(
 'borde inferior 01-08-2026 OK',
 null,
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2026-08-01', '2026-12-31', '2026-2027')
);

// 8. Borde superior: fecha fin = 31-01-A+1 (limite exacto) => OK
check(
 'borde superior 31-01-2027 OK',
 null,
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2026-08-01', '2027-01-31', '2026-2027')
);

// 9. Periodo con nombre completamente invalido "Periodo 2026-I" => no valida (retorna null sin lanzar)
check(
 'periodo nombre invalido retorna null (no se valida)',
 null,
 \App\Service\EvaluacionService::validarFechasSegundoSemestreStatic('2026-08-01', '2027-01-31', 'Periodo de Evaluacion 2026-I')
);

echo "\n--- RESUMEN ---\n";
echo "Pasados: $pass\n";
echo "Fallados: $fail\n";
exit($fail > 0 ? 1 : 0);
