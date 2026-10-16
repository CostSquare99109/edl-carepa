<?php
declare(strict_types=1);

namespace App\Service;

use App\Config\Database;

/**
 * Motor de reglas de evaluabilidad y ano laboral (EDL Carepa).
 *
 * Un periodo administrativo cubre FEB-JUL (1er semestre) y AGO-ENE (2do
 * semestre), p.ej. 2026-2027 = 2026-02-01 .. 2027-01-31.
 *
 * El ano laboral de un funcionario son DOS parciales consecutivos segun el
 * semestre en que ingreso:
 *  - Ingreso en 1er semestre -> [1er sem N, 2do sem N]. Definitiva en enero.
 *  - Ingreso en 2do semestre -> [2do sem N, 1er sem N+1]. Definitiva en julio.
 *    El 1er semestre de N ya cerro cuando el funcionario ingreso, por lo que no
 *    le corresponde y el ciclo queda permanentemente desplazado.
 *
 * La definitiva anual es el promedio simple de las dos parciales del ano
 * laboral (cada parcial cuenta una sola vez).
 *
 * Semestre de ingreso: prioridad usuario.semestre_ingreso (explicito, elegido
 * por el administrador) > derivado de usuario.fecha_posesion > primer_semestre.
 */
class ReglaEvaluabilidadService
{
 public const SEMESTRE_PRIMERO = 'primer_semestre';
 public const SEMESTRE_SEGUNDO = 'segundo_semestre';

 /** Mapa semestre logico -> tipo de evaluacion parcial persistido. */
 public const TIPO_DE_SEMESTRE = [
  self::SEMESTRE_PRIMERO => 'parcial_primer_semestre',
  self::SEMESTRE_SEGUNDO => 'parcial_segundo_semestre',
 ];

 public const SEMESTRES = [self::SEMESTRE_PRIMERO, self::SEMESTRE_SEGUNDO];

 /** Tipos de evaluacion que inician un ano laboral. */
 public const TIPOS_PARCIALES = ['parcial_primer_semestre', 'parcial_segundo_semestre'];

 /** Mes en que arranca la ventana del 1er semestre (febrero). */
 private const MES_INICIO_PRIMER_SEMESTRE = 2;

 /** Mes en que arranca la ventana del 2do semestre (agosto). */
 private const MES_INICIO_SEGUNDO_SEMESTRE = 8;

 /** Estados en los que una parcial ya cuenta como cumplida. */
 private const ESTADOS_PARCIAL_EXISTENTE = [
  'pendiente', 'en_proceso', 'propuesta', 'calificada', 'aprobada_comision', 'cerrada',
 ];

 /** Estados en los que una parcial tiene calificacion definitiva utilizable. */
 private const ESTADOS_PARCIAL_CALIFICADA = ['calificada', 'aprobada_comision', 'cerrada'];

 private static ?array $cachePeriodos = null;

 /* ------------------------------------------------------------------ */
 /* Semestre de ingreso                                                */
 /* ------------------------------------------------------------------ */

 /**
  * Semestre de ingreso del funcionario, aplicando la jerarquia de fuentes.
  *
  * @param array|null $usuario Fila de `usuarios` (puede traer o no los campos)
  * @return array{semestre:string,fuente:string,fecha_posesion:?string}
  */
 public function semestreIngreso(?array $usuario): array
 {
  $semestre = $usuario['semestre_ingreso'] ?? null;
  $fuente = 'explicito';
  if ($semestre === null || $semestre === '') {
   $semestre = $this->semestrePorFecha($usuario['fecha_posesion'] ?? null);
   $fuente = $semestre !== null ? 'fecha_posesion' : 'por_defecto';
  }
  if ($semestre === null) {
   $semestre = self::SEMESTRE_PRIMERO;
  }
  if (!in_array($semestre, self::SEMESTRES, true)) {
   $semestre = self::SEMESTRE_PRIMERO;
   $fuente = 'por_defecto';
  }

  return [
   'semestre' => $semestre,
   'fuente' => $fuente,
   'fecha_posesion' => $usuario['fecha_posesion'] ?? null,
  ];
 }

 /**
  * Deriva el semestre a partir de la fecha de posesion.
  *
  * El 2do semestre de un periodo va del 1 de agosto al 31 de enero del año
  * siguiente, de modo que enero pertenece al segundo semestre del periodo
  * anterior. Solo febrero-julio corresponde al primer semestre.
  */
 public function semestrePorFecha(?string $fecha): ?string
 {
  if (empty($fecha)) {
   return null;
  }
  $timestamp = strtotime($fecha);
  if ($timestamp === false) {
   return null;
  }
  $mes = (int) date('n', $timestamp);
  if ($mes === 1 || $mes >= self::MES_INICIO_SEGUNDO_SEMESTRE) {
   return self::SEMESTRE_SEGUNDO;
  }
  return self::SEMESTRE_PRIMERO;
 }

 /* ------------------------------------------------------------------ */
 /* Periodos y ventanas de semestre                                    */
 /* ------------------------------------------------------------------ */

 /**
  * Periodos vigentes ordenados por anio (el periodo N+1 sigue al N).
  *
  * @return array<int,array{id:int,nombre:string,anio:?string,fecha_inicio:?string,fecha_fin:?string}>
  */
 public function periodosOrdenados(): array
 {
  if (self::$cachePeriodos !== null) {
   return self::$cachePeriodos;
  }
  $pdo = Database::getInstance();
  $stmt = $pdo->query(
   "SELECT id, nombre, anio, fecha_inicio, fecha_fin FROM periodos
    WHERE eliminado_en IS NULL ORDER BY fecha_inicio ASC, id ASC"
  );
  $periodos = [];
  foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $fila) {
   $periodos[] = [
    'id' => (int) $fila['id'],
    'nombre' => (string) ($fila['nombre'] ?? ''),
    'anio' => $fila['anio'] !== null ? (string) $fila['anio'] : null,
    'fecha_inicio' => $fila['fecha_inicio'] !== null ? (string) $fila['fecha_inicio'] : null,
    'fecha_fin' => $fila['fecha_fin'] !== null ? (string) $fila['fecha_fin'] : null,
   ];
  }
  self::$cachePeriodos = $periodos;
  return $periodos;
 }

 public function limpiarCachePeriodos(): void
 {
  self::$cachePeriodos = null;
 }

 /** Metodos estaticos equivalentes para testear sin instanciar ni tocar BD. */
 public static function limpiarCachePeriodosStatic(): void
 {
  self::$cachePeriodos = null;
 }

 /**
  * Anio de inicio de un periodo, a partir del nombre "AAAA-AAAA".
  * Deriva de `nombre` primero (mismo criterio historico) y de `fecha_inicio`
  * como respaldo.
  */
 public function anioInicioPeriodo(array $periodo): ?int
 {
  $nombre = trim(preg_replace('/\s+/', '', (string) ($periodo['nombre'] ?? '')) ?? '');
  if (preg_match('/^(\d{4})-(\d{4})$/', $nombre, $matches)) {
   $anio = (int) $matches[1];
   if ((int) $matches[2] === $anio + 1) {
    return $anio;
   }
  }
  if (!empty($periodo['fecha_inicio'])) {
   $timestamp = strtotime((string) $periodo['fecha_inicio']);
   if ($timestamp !== false) {
    return (int) date('Y', $timestamp);
   }
  }
  return null;
 }

 /**
  * Ventana [inicio, fin] de un semestre dentro de un periodo.
  *
  * @return array{inicio:string,fin:string}
  */
 public function ventanaSemestre(array $periodo, string $semestre): array
 {
  $anio = $this->anioInicioPeriodo($periodo);
  if ($anio === null) {
   return ['inicio' => '', 'fin' => ''];
  }
  if ($semestre === self::SEMESTRE_SEGUNDO) {
   return [
    'inicio' => sprintf('%04d-%02d-01', $anio, self::MES_INICIO_SEGUNDO_SEMESTRE),
    'fin' => sprintf('%04d-01-31', $anio + 1),
   ];
  }
  return [
   'inicio' => sprintf('%04d-%02d-01', $anio, self::MES_INICIO_PRIMER_SEMESTRE),
   'fin' => sprintf('%04d-07-31', $anio),
  ];
 }

 /* ------------------------------------------------------------------ */
 /* Ano laboral                                                        */
 /* ------------------------------------------------------------------ */

 /**
  * Secuencia de parciales del ano laboral del funcionario que inicia en el
  * periodo dado. Siempre son dos parciales consecutivas.
  *
  * @return array<int,array{periodo_id:int,semestre:string,tipo:string}>
  */
 public function secuenciaAnioLaboral(?array $usuario, int $periodoId): array
 {
  $periodos = $this->periodosOrdenados();
  $indice = $this->indicePeriodo($periodos, $periodoId);
  if ($indice === null) {
   return [];
  }

  $semestreIngreso = $this->semestreIngreso($usuario)['semestre'];
  $actual = ['periodo_id' => $periodoId, 'semestre' => $semestreIngreso, 'tipo' => self::TIPO_DE_SEMESTRE[$semestreIngreso]];
  $actual['ventana'] = $this->ventanaSemestre($periodos[$indice], $semestreIngreso);

  // La segunda parcial del ano laboral es siempre el 2do semestre del periodo
  // en que arranco el ano. Si el ingreso fue en 2do semestre, esa ventana cae
  // en el periodo siguiente.
  $indiceVentanaSegunda = $semestreIngreso === self::SEMESTRE_PRIMERO ? $indice : $indice + 1;
  $periodoVentanaSegunda = $periodos[$indiceVentanaSegunda] ?? null;

  $segundo = [
   'periodo_id' => $periodoVentanaSegunda !== null ? (int) $periodoVentanaSegunda['id'] : $periodoId,
   'semestre' => self::SEMESTRE_SEGUNDO,
   'tipo' => self::TIPO_DE_SEMESTRE[self::SEMESTRE_SEGUNDO],
   'ventana' => $periodoVentanaSegunda !== null
    ? $this->ventanaSemestre($periodoVentanaSegunda, self::SEMESTRE_SEGUNDO)
    : null,
  ];

  return [$actual, $segundo];
 }

 /**
  * Fecha en la que cierra el ano laboral (fin de la ventana de la 2da parcial),
  * que es cuando se puede emitir la definitiva.
  */
 public function cierreAnioLaboral(?array $usuario, int $periodoId): ?string
 {
  $secuencia = $this->secuenciaAnioLaboral($usuario, $periodoId);
  if ($secuencia === []) {
   return null;
  }
  return $secuencia[1]['ventana']['fin'] ?? null;
 }

 /** Periodos en los que el funcionario ya cumple un ano laboral completo. */
 public function periodosConAnoLaboralCompleto(?array $usuario): array
 {
  $resultado = [];
  foreach ($this->periodosOrdenados() as $periodo) {
   $cierre = $this->cierreAnioLaboral($usuario, (int) $periodo['id']);
   if ($cierre !== null) {
    $resultado[] = ['periodo_id' => (int) $periodo['id'], 'cierre' => $cierre];
   }
  }
  return $resultado;
 }

 /* ------------------------------------------------------------------ */
 /* Evaluaciones parciales del ano laboral                              */
 /* ------------------------------------------------------------------ */

 /**
  * Parciales registradas del funcionario, indexadas por "periodo_id:tipo".
  *
  * @return array<string,array<string,mixed>>
  */
 public function parcialesPorClave(int $evaluadoId): array
 {
  $pdo = Database::getInstance();
  $stmt = $pdo->prepare(
   "SELECT id, periodo_id, tipo, estado, calificacion_definitiva, fecha_inicio, fecha_fin
    FROM evaluaciones
    WHERE evaluado_id = ? AND eliminado_en IS NULL
      AND tipo IN ('parcial_primer_semestre','parcial_segundo_semestre')
    ORDER BY periodo_id ASC, id ASC"
  );
  $stmt->execute([$evaluadoId]);
  $mapa = [];
  foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $fila) {
   $mapa[$fila['periodo_id'] . ':' . $fila['tipo']] = [
    'id' => (int) $fila['id'],
    'periodo_id' => (int) $fila['periodo_id'],
    'tipo' => (string) $fila['tipo'],
    'estado' => (string) $fila['estado'],
    'calificacion_definitiva' => $fila['calificacion_definitiva'] !== null ? (float) $fila['calificacion_definitiva'] : null,
    'fecha_inicio' => $fila['fecha_inicio'],
    'fecha_fin' => $fila['fecha_fin'],
   ];
  }
  return $mapa;
 }

 /**
  * Estado de las dos parciales del ano laboral que inicia en el periodo dado.
  *
  * @return array{parciales:array<int,array<string,mixed>>,completas:int,nota_promedio:?float}
  */
 public function estadoAnioLaboral(?array $usuario, int $periodoId, ?array $parciales = null): array
 {
  $secuencia = $this->secuenciaAnioLaboral($usuario, $periodoId);
  if ($secuencia === []) {
   return ['parciales' => [], 'completas' => 0, 'nota_promedio' => null];
  }
  $parciales = $parciales ?? $this->parcialesPorClave((int) ($usuario['id'] ?? 0));

  $detalle = [];
  $completas = 0;
  $notas = [];
  foreach ($secuencia as $posicion => $parcial) {
   $clave = $parcial['periodo_id'] . ':' . $parcial['tipo'];
   $registro = $parciales[$clave] ?? null;
   $calificada = $registro !== null
    && $registro['calificacion_definitiva'] !== null
    && in_array($registro['estado'], self::ESTADOS_PARCIAL_CALIFICADA, true);
   if ($calificada) {
    $completas++;
    $notas[] = (float) $registro['calificacion_definitiva'];
   }
   $detalle[] = [
    'posicion' => $posicion + 1,
    'periodo_id' => $parcial['periodo_id'],
    'semestre' => $parcial['semestre'],
    'tipo' => $parcial['tipo'],
    'ventana' => $parcial['ventana'] ?? null,
    'existe' => $registro !== null,
    'estado' => $registro['estado'] ?? null,
    'evaluacion_id' => $registro['id'] ?? null,
    'calificacion_definitiva' => $registro['calificacion_definitiva'] ?? null,
    'calificada' => $calificada,
   ];
  }

  return [
   'parciales' => $detalle,
   'completas' => $completas,
   'nota_promedio' => $this->promedioDefinitivo($notas),
  ];
 }

 /**
  * Si el funcionario puede iniciar la evaluacion parcial del tipo indicado en
  * el periodo indicado.
  *
  * @return array{permitido:bool,motivo:?string,requiere_parcial_previa:bool,semestre_ingreso:string,exento_primer_semestre:bool}
  */
 public function puedeIniciarEvaluacion(?array $usuario, int $periodoId, string $tipo): array
 {
  $semestreIngreso = $this->semestreIngreso($usuario)['semestre'];
  $base = [
   'semestre_ingreso' => $semestreIngreso,
   'exento_primer_semestre' => $semestreIngreso === self::SEMESTRE_SEGUNDO,
   'requiere_parcial_previa' => false,
   'motivo' => null,
  ];

  if (!in_array($tipo, self::TIPOS_PARCIALES, true)) {
   $base['permitido'] = true;
   return $base;
  }

  $semestreSolicitado = $tipo === self::TIPO_DE_SEMESTRE[self::SEMESTRE_PRIMERO]
   ? self::SEMESTRE_PRIMERO
   : self::SEMESTRE_SEGUNDO;

  // El 1er semestre no corresponde a quien ingreso en el 2do semestre de ese
  // periodo (la ventana ya cerro).
  if ($semestreSolicitado === self::SEMESTRE_PRIMERO && $semestreIngreso === self::SEMESTRE_SEGUNDO) {
   $fecha = $usuario['fecha_posesion'] ?? null;
   $base['permitido'] = false;
   $base['motivo'] = 'El primer semestre no corresponde a este funcionario: ingreso en el segundo semestre'
    . ($fecha ? ' (fecha de posesion ' . $fecha . ')' : '') . '.';
   return $base;
  }

  // Segunda parcial: exige la primera parcial del ano laboral.
  if ($semestreSolicitado === self::SEMESTRE_SEGUNDO && $semestreIngreso === self::SEMESTRE_PRIMERO) {
   $parciales = $this->parcialesPorClave((int) ($usuario['id'] ?? 0));
   $primera = $parciales[$periodoId . ':' . self::TIPO_DE_SEMESTRE[self::SEMESTRE_PRIMERO]] ?? null;
   $existe = $primera !== null && in_array($primera['estado'], self::ESTADOS_PARCIAL_EXISTENTE, true);
   $base['requiere_parcial_previa'] = true;
   if (!$existe) {
    $base['permitido'] = false;
    $base['motivo'] = 'No se puede evaluar el segundo semestre sin una evaluacion previa del primer semestre.';
    return $base;
   }
  }

  // Ingreso en 2do semestre y se solicita el 2do semestre de ese periodo:
  // es la primera parcial de su ano laboral, no exige nada previo.
  $base['permitido'] = true;
  return $base;
 }

 /**
  * Si el funcionario cumple los requisitos para la calificacion definitiva de
  * su ano laboral en el periodo dado.
  *
  * @return array{puede_emitir:bool,motivo:?string,parciales:array,nota_promedio:?float,nivel:?string,cierre:?string}
  */
 public function puedeEmitirDefinitiva(?array $usuario, int $periodoId): array
 {
  $estado = $this->estadoAnioLaboral($usuario, $periodoId);
  $semestreIngreso = $this->semestreIngreso($usuario)['semestre'];
  $promedio = $estado['nota_promedio'];
  $resultado = [
   'puede_emitir' => false,
   'motivo' => null,
   'parciales' => $estado['parciales'],
   'nota_promedio' => $promedio,
   'nivel' => $promedio !== null ? $this->nivelPorPuntaje($promedio) : null,
   'cierre' => $this->cierreAnioLaboral($usuario, $periodoId),
   'semestre_ingreso' => $semestreIngreso,
  ];

  if ($estado['completas'] < 2) {
   $resultado['motivo'] = 'El ano laboral se completa cuando las dos parciales estan calificadas. Faltan '
    . (2 - $estado['completas']) . '.';
   return $resultado;
  }

  // La definitiva ya emitida no se vuelve a emitir.
  $pdo = Database::getInstance();
  $stmt = $pdo->prepare(
   "SELECT COUNT(*) AS c FROM evaluaciones
    WHERE evaluado_id = ? AND periodo_id = ? AND tipo = 'calificacion_definitiva' AND eliminado_en IS NULL"
  );
  $stmt->execute([(int) ($usuario['id'] ?? 0), $periodoId]);
  if ((int) ($stmt->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0) > 0) {
   $resultado['motivo'] = 'El funcionario ya tiene calificacion definitiva para este periodo.';
   return $resultado;
  }

  $resultado['puede_emitir'] = true;
  return $resultado;
 }

 /* ------------------------------------------------------------------ */
 /* Calculo de la nota definitiva                                       */
 /* ------------------------------------------------------------------ */

 /** Promedio simple de las parciales calificadas del ano laboral. */
 public function promedioDefinitivo(array $notas): ?float
 {
  $validas = [];
  foreach ($notas as $nota) {
   if ($nota === null || $nota === '') {
    continue;
   }
   $nota = (float) $nota;
   if ($nota <= 0) {
    continue;
   }
   $validas[] = $nota;
  }
  if ($validas === []) {
   return null;
  }
  return round(array_sum($validas) / count($validas), 2);
 }

 /**
  * Nivel de desempenho segun umbral parametrizado (85% Sobresaliente por
  * defecto, 65% Satisfactorio).
  */
 public function nivelPorPuntaje(float $puntaje): string
 {
  $umbralSobresaliente = \App\Helper\ParametroHelper::float('umbral_sobresaliente', 'UMBRAL_SOBRESALIENTE', 85);
  $umbralSatisfactorio = \App\Helper\ParametroHelper::float('umbral_satisfactorio', 'UMBRAL_SATISFACTORIO', 65);
  return self::nivelPorUmbrales($puntaje, $umbralSobresaliente, $umbralSatisfactorio);
 }

 /** Metodo estatico puro: clasificacion por umbrales, sin BD ni parametros. */
 public static function nivelPorUmbrales(float $puntaje, float $umbralSobresaliente, float $umbralSatisfactorio): string
 {
  if ($puntaje >= $umbralSobresaliente) {
   return 'sobresaliente';
  }
  if ($puntaje >= $umbralSatisfactorio) {
   return 'satisfactorio';
  }
  return 'no_satisfactorio';
 }

 /* ------------------------------------------------------------------ */
 /* Payload para el frontend                                           */
 /* ------------------------------------------------------------------ */

 /**
  * Estado completo de las reglas para el frontend:
  * GET /evaluaciones/evaluado/{id}/reglas-evaluabilidad?periodo_id=N
  */
 public function reglasParaFrontend(?array $usuario, int $periodoId): array
 {
  $periodos = $this->periodosOrdenados();
  $periodo = null;
  foreach ($periodos as $fila) {
   if ((int) $fila['id'] === $periodoId) {
    $periodo = $fila;
    break;
   }
  }

  $ingreso = $this->semestreIngreso($usuario);
  $estado = $this->estadoAnioLaboral($usuario, $periodoId);

  $semestresPermitidos = [];
  $primer = $this->puedeIniciarEvaluacion($usuario, $periodoId, self::TIPO_DE_SEMESTRE[self::SEMESTRE_PRIMERO]);
  $segundo = $this->puedeIniciarEvaluacion($usuario, $periodoId, self::TIPO_DE_SEMESTRE[self::SEMESTRE_SEGUNDO]);
  if ($primer['permitido']) {
   $semestresPermitidos[] = self::SEMESTRE_PRIMERO;
  }
  if ($segundo['permitido']) {
   $semestresPermitidos[] = self::SEMESTRE_SEGUNDO;
  }

  $definitiva = $this->puedeEmitirDefinitiva($usuario, $periodoId);

  return [
   'periodo_id' => $periodoId,
   'periodo_nombre' => $periodo['nombre'] ?? null,
   'semestre_ingreso' => $ingreso['semestre'],
   'semestre_ingreso_fuente' => $ingreso['fuente'],
   'fecha_posesion' => $ingreso['fecha_posesion'],
   'exento_primer_semestre' => $ingreso['semestre'] === self::SEMESTRE_SEGUNDO,
   'semestres_permitidos' => $semestresPermitidos,
   'puede_iniciar_primer_semestre' => $primer['permitido'],
   'puede_iniciar_segundo_semestre' => $segundo['permitido'],
   'motivo_primer_semestre' => $primer['motivo'],
   'motivo_segundo_semestre' => $segundo['motivo'],
   'anio_laboral' => $estado['parciales'],
   'anio_laboral_completas' => $estado['completas'],
   'definitiva' => $definitiva,
   'mensaje' => $this->mensajeResumen($usuario, $periodoId, $ingreso, $estado),
  ];
 }

 /** Explicacion en lenguaje natural del estado del ano laboral. */
 private function mensajeResumen(?array $usuario, int $periodoId, array $ingreso, array $estado): string
 {
  $segundoSemestre = $ingreso['semestre'] === self::SEMESTRE_SEGUNDO;
  $cierre = $this->cierreAnioLaboral($usuario, $periodoId);

  if ($segundoSemestre) {
   $fecha = $ingreso['fecha_posesion'];
   $base = 'Ingreso en el segundo semestre'
    . ($fecha ? ' (posesion ' . $fecha . ')' : '')
    . '. El primer semestre de este periodo no le corresponde. '
    . 'Su ano laboral se completa con la parcial del primer semestre del periodo siguiente';
  } else {
   $base = 'Ingreso en el primer semestre. Su ano laboral se completa con las dos parciales de este periodo';
  }

  if ($estado['completas'] >= 2) {
   return $base . ' y ya cumple los dos componentes: puede emitir la calificacion definitiva'
    . ($cierre ? ' (cierre ' . $cierre . ')' : '') . '.';
  }
  return $base . '. Parciales calificadas: ' . $estado['completas'] . ' de 2.';
 }

 /* ------------------------------------------------------------------ */

 /** @return int|null */
 private function indicePeriodo(array $periodos, int $periodoId): ?int
 {
  foreach ($periodos as $indice => $periodo) {
   if ((int) $periodo['id'] === $periodoId) {
    return $indice;
   }
  }
  return null;
 }
}