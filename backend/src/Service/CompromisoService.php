<?php

namespace App\Service;

use App\Repository\CompromisoRepository;
use App\Repository\ConcertacionRepository;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

class CompromisoService
{
 private CompromisoRepository $compromisoRepo;
 private ConcertacionRepository $concertacionRepo;

 public function __construct()
 {
 $pdo = Database::getInstance();
 $this->compromisoRepo = new CompromisoRepository($pdo);
 $this->concertacionRepo = new ConcertacionRepository($pdo);
 }

 public function listar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();

  if ($rolActivo === 'evaluador') {
  $filtros['evaluador_id'] = $user['id'];
  } elseif ($rolActivo === 'evaluado') {
  $filtros['evaluado_id'] = $user['id'];
  }

  return $this->compromisoRepo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 public function crear(array $datos): int
 {
 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 $evaluacionId = $datos['evaluacion_id'] ?? null;
 if (!$evaluacionId) {
 ResponseHelper::error('evaluacion_id es requerido', 422);
 }

 $tipo = $datos['tipo'] ?? 'funcional';
 if (!in_array($tipo, ['funcional', 'comportamental'])) {
 ResponseHelper::error('Tipo invalido. Debe ser: funcional o comportamental', 422);
 }

 // Validacion CNSC: el compromiso debe seguir la estructura
 // "verbo + objeto + condicion de resultado" (Acuerdo 617 de 2018,
 // Tutorial_EDL_APP_Concertacion_de_Compromisos.md).
 self::validarEstructuraVerboObjetoCondicion($datos['descripcion'] ?? '', $tipo);

 $concertacionId = $this->compromisoRepo->resolverConcertacionId((int) $evaluacionId);
 if (!$concertacionId) {
 ResponseHelper::error('La evaluacion no tiene concertacion asociada', 422);
 }

 $this->validarLimitesCompromisos($concertacionId, $tipo);

 $crearDatos = [
 'concertacion_id' => $concertacionId,
 'tipo' => $tipo,
 'meta_id' => $datos['meta_id'] ?? null,
 'descripcion' => $datos['descripcion'],
 'peso' => $datos['peso'] ?? 0,
 'propuesto_por_jefe_entidad' => in_array($rolActivo, ['admin', 'evaluador']) ? 1 : 0,
 'estado' => 'propuesto',
 ];

 $id = $this->compromisoRepo->crear($crearDatos);
 AuditoriaService::registrar('crear_compromiso', 'compromisos', $id);

 return $id;
 }

 public function enviar(array $datos, array $user): int
 {
 $evaluacionId = $datos['evaluacion_id'] ?? null;
 if (!$evaluacionId) {
 ResponseHelper::error('evaluacion_id es requerido', 422);
 }

 $tipo = $datos['tipo'] ?? 'funcional';
 if (!in_array($tipo, ['funcional', 'comportamental'])) {
 ResponseHelper::error('Tipo invalido. Debe ser: funcional o comportamental', 422);
 }

 // Validacion CNSC: estructura verbo + objeto + condicion de resultado.
 self::validarEstructuraVerboObjetoCondicion($datos['descripcion'] ?? '', $tipo);

 $concertacionId = $this->compromisoRepo->resolverConcertacionId((int) $evaluacionId);
 if (!$concertacionId) {
 ResponseHelper::error('La evaluacion no tiene concertacion asociada', 422);
 }

 $this->validarLimitesCompromisos($concertacionId, $tipo);

 $crearDatos = [
 'concertacion_id' => $concertacionId,
 'tipo' => $tipo,
 'descripcion' => $datos['descripcion'],
 'peso' => $datos['peso'] ?? 0,
 'propuesto_por_jefe_entidad' => 0,
 'es_propuesto_evaluado' => 1,
 'estado' => 'propuesto',
 'observaciones_evaluado' => $datos['observaciones_evaluado'] ?? null,
 ];

 $id = $this->compromisoRepo->crear($crearDatos);
 AuditoriaService::registrar('enviar_compromiso', 'compromisos', $id);

 return $id;
 }

 /**
  * Valida la estructura recomendada por la CNSC para redactar un compromiso:
  * verbo en infinitivo + objeto + condicion de resultado. La comprobacion es
  * una guia amable: si la descripcion no comienza con un verbo conocido ni
  * contiene palabras tipicas de condicion, devuelve un 422 con la sugerencia.
  * Referencia: transcripcion_cnsc/Tutorial_EDL_APP_Concertacion_de_Compromisos.md
  * lineas 65-69: "verbo + objeto + condicion de resultado".
  */
 public static function validarEstructuraVerboObjetoCondicion(string $descripcion, string $tipo): void
 {
 $descripcion = trim($descripcion);
 if ($descripcion === '') {
 ResponseHelper::error('La descripcion del compromiso es obligatoria', 422);
 }

 // Solo validamos estructura en compromisos funcionales; los
 // comportamentales son nombres de competencias (Decreto 2539/2005 y
 // 815/2018) y no requieren esa forma.
 if ($tipo !== 'funcional') {
 return;
 }

 static $verbos = [
 'elaborar', 'redactar', 'realizar', 'ejecutar', 'implementar', 'gestionar',
 'administrar', 'coordinar', 'supervisar', 'monitorear', 'analizar',
 'evaluar', 'diseñar', 'planificar', 'planear', 'organizar', 'dirigir',
 'producir', 'generar', 'desarrollar', 'construir', 'formular', 'proponer',
 'presentar', 'entregar', 'tramitar', 'revisar', 'verificar', 'controlar',
 'resolver', 'atender', 'brindar', 'prestar', 'mantener', 'actualizar',
 'capacitar', 'formar', 'asesorar', 'apoyar', 'informar', 'reportar',
 'consolidar', 'archivar', 'registrar', 'documentar', 'medir', 'calcular',
 'levantar', 'inspeccionar', 'auditar', 'promover', 'difundir', 'socializar',
 'articular', 'liderar', 'representar', 'convocar', 'participar',
 ];

 $palabrasCondicion = [
 'con', 'segun', 'cumpliendo', 'cumple', 'para', 'que', 'indicadores',
 'semestral', 'mensual', 'anual', 'trimestral', 'plazo', 'meta',
 'resultado', 'evidencia', 'cronograma', 'indicador', 'estandar',
 'norma', 'procedimiento', 'protocolo', 'formato', 'reporte',
 ];

 $descLower = mb_strtolower($descripcion, 'UTF-8');
 $primeraPalabra = explode(' ', $descLower)[0] ?? '';
 $primeraLimpia = preg_replace('/[^a-záéíóúñü]/u', '', $primeraPalabra) ?? '';

 $iniciaConVerbo = in_array($primeraLimpia, $verbos, true);
 $longitudOk = mb_strlen($descripcion) >= 20;
 $contieneCondicion = false;
 foreach ($palabrasCondicion as $palabra) {
 if (mb_strpos($descLower, $palabra, 0, 'UTF-8') !== false) {
 $contieneCondicion = true;
 break;
 }
 }

 if (!$longitudOk || (!$iniciaConVerbo && !$contieneCondicion)) {
 $inicioVerbo = $iniciaConVerbo ? 'OK' : 'falta verbo';
 $cond = $contieneCondicion ? 'OK' : 'falta condicion de resultado';
 ResponseHelper::error(
 'La descripcion del compromiso no cumple la estructura CNSC: verbo + objeto + condicion de resultado. Sugerencia: redactar iniciando con un verbo en infinitivo (Elaborar, Redactar, Gestionar, ...) y agregando la condicion de resultado esperada. Estado actual -> ' . $inicioVerbo . ' | ' . $cond,
 422
 );
 }
 }

 public function aprobar(int $id, float $peso, string $observaciones, array $user): void
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 ResponseHelper::notFound('Compromiso no encontrado');
 }

 if ($compromiso['estado'] !== 'propuesto') {
 ResponseHelper::error('Solo se pueden aprobar compromisos en estado propuesto', 400);
 }

 $concertacionId = (int) $compromiso['concertacion_id'];
 $tipo = $compromiso['tipo'];

 $sumaActual = $this->compromisoRepo->sumPesosPorConcertacionYTipo($concertacionId, $tipo);
 $pesoActual = (float) $compromiso['peso'];
 $nuevaSuma = $sumaActual - $pesoActual + $peso;

 // El peso que se aprueba es el peso INTERNO del compromiso dentro de su
 // tipo (los funcionales deben sumar 100 entre si; los comportamentales
 // tambien). Ademas el peso individual no debe exceder el techo normativo
 // del tipo a nivel de la calificacion definitiva (85% funcional, 15%
 // comportamental, Acuerdo 617 de 2018).
 $maxPesoIndividual = $tipo === 'funcional' ? 85 : 15;
 if ($peso > $maxPesoIndividual) {
 ResponseHelper::error(
 "El peso del compromiso {$tipo} no puede exceder {$maxPesoIndividual}% (ponderacion definitiva). Indicado: {$peso}",
 422
 );
 }

 if (abs($nuevaSuma - 100) > 0.01) {
 ResponseHelper::error(
 "La suma de pesos {$tipo} debe ser exactamente 100. Actual: " . round($sumaActual, 2) . "%, nuevo: " . round($nuevaSuma, 2) . "%",
 422
 );
 }

 $this->compromisoRepo->actualizar($id, [
 'peso' => $peso,
 'estado' => 'aprobado',
 'observaciones_evaluador' => $observaciones ?: null,
 ]);

 AuditoriaService::registrar('aprobar_compromiso', 'compromisos', $id);
 }

 public function rechazar(int $id, string $observaciones, array $user): void
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 ResponseHelper::notFound('Compromiso no encontrado');
 }

 if ($compromiso['estado'] !== 'propuesto') {
 ResponseHelper::error('Solo se pueden rechazar compromisos en estado propuesto', 400);
 }

 $this->compromisoRepo->actualizar($id, [
 'estado' => 'rechazado',
 'observaciones_evaluador' => $observaciones ?: null,
 ]);

 AuditoriaService::registrar('rechazar_compromiso', 'compromisos', $id);
 }

 public function compromisosConConductas(int $evaluacionId): array
 {
 return $this->compromisoRepo->buscarConConductas($evaluacionId);
 }

 public function devolver(int $id, string $observaciones, array $user): void
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 ResponseHelper::notFound('Compromiso no encontrado');
 }

 if ($compromiso['estado'] !== 'propuesto') {
 ResponseHelper::error('Solo se pueden devolver compromisos en estado propuesto', 400);
 }

 $this->compromisoRepo->actualizar($id, [
 'estado' => 'devuelto',
 'observaciones_evaluador' => $observaciones,
 ]);

 AuditoriaService::registrar('devolver_compromiso', 'compromisos', $id);
 }

 public function calificar(int $id, float $puntaje, string $observaciones, ?array $conductas = null, array $user = [], ?string $impactoAporta = null, ?string $impactoExcede = null, ?string $justificacionExcede = null): void
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 ResponseHelper::notFound("Compromiso no encontrado");
 }

 if ($compromiso["estado"] !== "aprobado" && $compromiso["estado"] !== "en_progreso") {
 ResponseHelper::error("Solo se pueden calificar compromisos aprobados o en progreso", 400);
 }

 if ($puntaje < 0 || $puntaje > 100) {
 ResponseHelper::error(
 "La calificacion del compromiso debe estar entre 0 y 100 (Acuerdo 617 de 2018). Recibido: {$puntaje}",
 422
 );
 }

 $tipoCompromiso = strtolower((string) ($compromiso["tipo"] ?? ""));
 if ($tipoCompromiso === "comportamental" && ($puntaje < 4 || $puntaje > 15)) {
 ResponseHelper::error(
 "Para compromisos comportamentales la calificacion debe estar entre 4 y 15 puntos (escala CNSC: Bajo 4-6, Aceptable 7-9, Alto 10-12, Muy Alto 13-15). Recibido: {$puntaje}",
 422
 );
 }

 $estadosPermitidos = ["pendiente", "en_proceso"];
 $idEvaluacion = (int) ($compromiso["evaluacion_id"] ?? 0);
 if ($idEvaluacion > 0) {
 $stmtEstado = $this->compromisoRepo->getPdo()->prepare(
 "SELECT estado FROM evaluaciones WHERE id = :eid AND eliminado_en IS NULL"
 );
 $stmtEstado->execute(["eid" => $idEvaluacion]);
 $estadoEval = $stmtEstado->fetchColumn();
 if ($estadoEval && !in_array($estadoEval, $estadosPermitidos, true)) {
 ResponseHelper::error(
 "La evaluacion asociada no admite nuevas calificaciones (estado: {$estadoEval}). Solo se permiten calificaciones sobre evaluaciones en estado pendiente o en proceso.",
 422
 );
 }
 }

 // Validar justificacion de excede (40 caracteres minimo)
 if ($impactoExcede && in_array(strtolower($impactoExcede), ["si", "1", "true"], true)) {
 $justif = trim((string) ($justificacionExcede ?? ""));
 if (mb_strlen($justif) < 40) {
 ResponseHelper::error(
 "La justificacion de \"excede lo estipulado\" debe tener minimo 40 caracteres (Acuerdo 617 de 2018). Actual: " . mb_strlen($justif),
 422
 );
 }
 }

 if (!empty($impactoAporta) && !in_array(strtolower((string) $impactoAporta), ["si", "moderadamente", "no"], true)) {
 ResponseHelper::error(
 "El valor de \"aporta a los compromisos\" debe ser Si, Moderadamente o No.",
 422
 );
 }

 if (!empty($impactoExcede) && !in_array(strtolower((string) $impactoExcede), ["si", "no"], true)) {
 ResponseHelper::error(
 "El valor de \"excede lo estipulado\" debe ser Si o No.",
 422
 );
 }

 // Si vienen conductas (compromiso comportamental), validar cada una
 if ($conductas && is_array($conductas)) {
 foreach ($conductas as $cond) {
 $excede = strtolower((string) ($cond["impacto_excede_estipulado"] ?? ""));
 $justif = trim((string) ($cond["justificacion_excede"] ?? ""));
 if (in_array($excede, ["si", "1", "true"], true) && mb_strlen($justif) < 40) {
 ResponseHelper::error(
 "La justificacion de \"excede lo estipulado\" debe tener minimo 40 caracteres por conducta (Acuerdo 617 de 2018). Actual: " . mb_strlen($justif),
 422
 );
 }
 }
 }

 // Preparar conductas_json con todos los campos de evaluacion comportamental
 $conductasJson = null;
 if ($conductas !== null) {
 $conductasJson = json_encode($conductas, JSON_UNESCAPED_UNICODE);
 } elseif ($impactoAporta || $impactoExcede || $justificacionExcede) {
 // Si no hay conductas pero si datos de impacto, crear estructura basica
 $conductasJson = json_encode([
 "impacto_aporta_compromisos" => $impactoAporta,
 "impacto_excede_estipulado" => $impactoExcede,
 "justificacion_excede" => $justificacionExcede
 ], JSON_UNESCAPED_UNICODE);
 }

 $actualizar = [
 "calificacion" => $puntaje,
 "estado" => $puntaje >= 65 ? "cumplido" : "incumplido",
 "observaciones_evaluador" => $observaciones ?: null,
 ];

 if ($conductasJson !== null) {
 $actualizar["conductas_json"] = $conductasJson;
 }

 // Guardar campos especificos de evaluacion comportamental en la tabla compromisos
 if ($compromiso["tipo"] === "comportamental") {
 $actualizar["impacto_aporta_compromisos"] = $impactoAporta;
 $actualizar["impacto_excede_estipulado"] = $impactoExcede;
 $actualizar["justificacion_excede"] = $justificacionExcede;
 // Calcular nivel comportamental segun puntaje (4-15)
 if ($puntaje >= 13) $actualizar["nivel_comportamental"] = "muy_alto";
 elseif ($puntaje >= 10) $actualizar["nivel_comportamental"] = "alto";
 elseif ($puntaje >= 7) $actualizar["nivel_comportamental"] = "aceptable";
 else $actualizar["nivel_comportamental"] = "bajo";
 $actualizar["puntaje_comportamental"] = $puntaje;
 }

 $this->compromisoRepo->actualizar($id, $actualizar);
 AuditoriaService::registrar("calificar_compromiso", "compromisos", $id);
 }

 private function validarLimitesCompromisos(int $concertacionId, string $tipo): void
 {
 $count = $this->compromisoRepo->contarPorConcertacionYTipo($concertacionId, $tipo);

 $esPrueba = false;
 $stmtEval = $this->compromisoRepo->getPdo()->prepare(
 "SELECT u.en_periodo_prueba
 FROM concertaciones con
 INNER JOIN usuarios u ON u.id = con.evaluado_id
 WHERE con.id = :cid AND con.eliminado_en IS NULL"
 );
 $stmtEval->execute(['cid' => $concertacionId]);
 $pruebaVal = $stmtEval->fetchColumn();
 $esPrueba = !empty($pruebaVal) && (bool) $pruebaVal;

 if ($tipo === 'funcional') {
 $max = $esPrueba
 ? (int) Env::get('MAX_COMPROMISOS_FUNCIONALES_PRUEBA', 3)
 : (int) Env::get('MAX_COMPROMISOS_FUNCIONALES', 5);
 } else {
 $max = (int) Env::get('MAX_COMPROMISOS_COMPORTAMENTALES', 5);
 }

 if ($count >= $max) {
 $tipoLabel = $tipo === 'funcional' ? 'funcionales' : 'comportamentales';
 $periodoLabel = $esPrueba ? 'periodo de prueba' : 'evaluacion anual';
 ResponseHelper::error("No se pueden agregar mas compromisos {$tipoLabel}. Maximo permitido para {$periodoLabel}: {$max}", 422);
 }
 }

 public function resumenPesos(int $id, array $user): array
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 ResponseHelper::notFound('Compromiso no encontrado');
 }

 $concertacionId = (int) $compromiso['concertacion_id'];
 return $this->resumenPesosConcertacion($concertacionId);
 }

 private function resumenPesosConcertacion(int $concertacionId): array
 {
 $sumaFunc = $this->compromisoRepo->sumPesosPorConcertacionYTipo($concertacionId, 'funcional');
 $sumaComp = $this->compromisoRepo->sumPesosPorConcertacionYTipo($concertacionId, 'comportamental');
 $countFunc = $this->compromisoRepo->contarPorConcertacionYTipo($concertacionId, 'funcional');
 $countComp = $this->compromisoRepo->contarPorConcertacionYTipo($concertacionId, 'comportamental');

 return [
 'concertacion_id' => $concertacionId,
 'funcionales' => ['suma_pesos' => $sumaFunc, 'cantidad' => $countFunc, 'maximo_permitido' => 85],
 'comportamentales' => ['suma_pesos' => $sumaComp, 'cantidad' => $countComp, 'maximo_permitido' => 15],
 'total_pesos' => $sumaFunc + $sumaComp,
 'completo' => ($sumaFunc + $sumaComp) >= 100,
 ];
 }

 public function pendientesAprobacion(array $user, int $pagina = 1, int $porPagina = 20): array
 {
 return $this->compromisoRepo->pendientesPorEvaluador((int) $user['id'], $pagina, $porPagina);
 }

 public function actualizar(int $id, array $datos): void
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 ResponseHelper::notFound('Compromiso no encontrado');
 }

 $permitidos = [
 'descripcion', 'peso', 'meta_id', 'resultado_esperado',
 'medio_verificacion', 'plazo', 'observaciones_evaluador',
 'observaciones_evaluado',
 // Campos para ajuste de compromisos (Acuerdo 617/2018, Anexo Tecnico)
 'motivo_ajuste', 'fecha_ajuste'
 ];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 // Si se envia motivo_ajuste, es un ajuste formal y debe ir acompañado
 // de una fecha de ajuste (o se usa la actual).
 if (isset($datosFiltrados['motivo_ajuste'])) {
 $motivosValidos = [
 'cambios_planes_metas',
 'separacion_temporal_30_dias',
 'asignacion_funciones',
 'cambio_empleo_traslado_reubicacion',
 'decision_comision_personal',
 ];
 if (!in_array($datosFiltrados['motivo_ajuste'], $motivosValidos, true)) {
 ResponseHelper::error(
 'Motivo de ajuste invalido. Valores permitidos: ' . implode(', ', $motivosValidos),
 422
 );
 }
 $datosFiltrados['fecha_ajuste'] = $datosFiltrados['fecha_ajuste'] ?? date('Y-m-d H:i:s');
 }

 if (!empty($datosFiltrados)) {
 $this->compromisoRepo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar_compromiso', 'compromisos', $id);
 }
 }

 public function validarCompromisosAntesDeFirmar(int $concertacionId, int $evaluadoId): array
 {
 $usuario = (new \App\Repository\UsuarioRepository(Database::getInstance()))->buscarPorId($evaluadoId);
 $esPrueba = !empty($usuario['en_periodo_prueba']) && (bool) $usuario['en_periodo_prueba'];

 $countFunc = $this->compromisoRepo->contarPorConcertacionYTipo($concertacionId, 'funcional');
 $countComp = $this->compromisoRepo->contarPorConcertacionYTipo($concertacionId, 'comportamental');

 $minFunc = $esPrueba
 ? (int) Env::get('MIN_COMPROMISOS_FUNCIONALES_PRUEBA', 1)
 : (int) Env::get('MIN_COMPROMISOS_FUNCIONALES', 1);
 $maxFunc = $esPrueba
 ? (int) Env::get('MAX_COMPROMISOS_FUNCIONALES_PRUEBA', 3)
 : (int) Env::get('MAX_COMPROMISOS_FUNCIONALES', 5);
 $minComp = (int) Env::get('MIN_COMPROMISOS_COMPORTAMENTALES', 3);
 $maxComp = (int) Env::get('MAX_COMPROMISOS_COMPORTAMENTALES', 5);

 $errores = [];
 if ($countFunc < $minFunc) {
 $errores[] = "Faltan compromisos funcionales. Minimo requerido: {$minFunc}, actual: {$countFunc}";
 }
 if ($countFunc > $maxFunc) {
 $errores[] = "Exceso de compromisos funcionales. Maximo permitido: {$maxFunc}, actual: {$countFunc}";
 }
 if ($countComp < $minComp) {
 $errores[] = "Faltan compromisos comportamentales. Minimo requerido: {$minComp}, actual: {$countComp}";
 }
 if ($countComp > $maxComp) {
 $errores[] = "Exceso de compromisos comportamentales. Maximo permitido: {$maxComp}, actual: {$countComp}";
 }

 return [
 'valido' => empty($errores),
 'errores' => $errores,
 'funcionales' => ['cantidad' => $countFunc, 'minimo' => $minFunc, 'maximo' => $maxFunc],
 'comportamentales' => ['cantidad' => $countComp, 'minimo' => $minComp, 'maximo' => $maxComp],
 'periodo_prueba' => $esPrueba,
 ];
 }

 /**
  * Wrapper estatico para uso en controladores (asume tipo='funcional').
  */
 public static function validarEstructuraVerboObjetoCondicionStatic(string $descripcion): void
 {
 self::validarEstructuraVerboObjetoCondicion($descripcion, 'funcional');
 }

}