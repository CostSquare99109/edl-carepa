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

 $this->validarLimitesCompromisos((int) $evaluacionId, $tipo);

 $crearDatos = [
 'evaluacion_id' => $evaluacionId,
 'tipo' => $tipo,
 'meta_id' => $datos['meta_id'] ?? null,
 'descripcion' => $datos['descripcion'],
 'peso' => $datos['peso'] ?? 0,
 'evaluador_id' => $user['id'],
 'responsable_id' => $datos['responsable_id'] ?? $user['id'],
 'es_propuesto_jefe' => in_array($rolActivo, ['admin', 'jefe_personal', 'evaluador']) ? 1 : 0,
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

 $this->validarLimitesCompromisos((int) $evaluacionId, $tipo);

 $crearDatos = [
 'evaluacion_id' => $evaluacionId,
 'tipo' => $tipo,
 'descripcion' => $datos['descripcion'],
 'peso' => $datos['peso'] ?? 0,
 'evaluador_id' => $user['id'],
 'responsable_id' => $datos['responsable_id'] ?? $user['id'],
 'es_propuesto_jefe' => 0,
 'estado' => 'propuesto',
 'observaciones_evaluado' => $datos['observaciones_evaluado'] ?? null,
 ];

 $id = $this->compromisoRepo->crear($crearDatos);
 AuditoriaService::registrar('enviar_compromiso', 'compromisos', $id);

 return $id;
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

 $evaluacionId = (int) $compromiso['evaluacion_id'];
 $tipo = $compromiso['tipo'];

 $sumaActual = $this->compromisoRepo->sumPesosPorEvaluacionYTipo($evaluacionId, $tipo);
 $pesoActual = (float) $compromiso['peso'];
 $nuevaSuma = $sumaActual - $pesoActual + $peso;

 $maxPesos = $tipo === 'funcional' ? 85 : 15;
 if ($nuevaSuma > $maxPesos) {
 ResponseHelper::error("La suma de pesos {$tipo} excederia {$maxPesos}%. Actual: {$sumaActual}%, nuevo: {$nuevaSuma}%", 422);
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

 public function calificar(int $id, float $puntaje, string $observaciones, array $user): void
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 ResponseHelper::notFound('Compromiso no encontrado');
 }

 if ($compromiso['estado'] !== 'aprobado' && $compromiso['estado'] !== 'en_progreso') {
 ResponseHelper::error('Solo se pueden calificar compromisos aprobados o en progreso', 400);
 }

 $actualizar = [
 'calificacion' => $puntaje,
 'estado' => $puntaje >= 65 ? 'cumplido' : 'incumplido',
 'observaciones_evaluador' => $observaciones ?: null,
 ];

 $this->compromisoRepo->actualizar($id, $actualizar);
 AuditoriaService::registrar('calificar_compromiso', 'compromisos', $id);
 }

 public function resumenPesos(int $id, array $user): array
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 ResponseHelper::notFound('Compromiso no encontrado');
 }

 $evaluacionId = (int) $compromiso['evaluacion_id'];
 return $this->resumenPesosEvaluacion($evaluacionId);
 }

 private function resumenPesosEvaluacion(int $evaluacionId): array
 {
 $sumaFunc = $this->compromisoRepo->sumPesosPorEvaluacionYTipo($evaluacionId, 'funcional');
 $sumaComp = $this->compromisoRepo->sumPesosPorEvaluacionYTipo($evaluacionId, 'comportamental');
 $countFunc = $this->compromisoRepo->contarPorEvaluacionYTipo($evaluacionId, 'funcional');
 $countComp = $this->compromisoRepo->contarPorEvaluacionYTipo($evaluacionId, 'comportamental');

 return [
 'evaluacion_id' => $evaluacionId,
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

 $permitidos = ['descripcion', 'peso', 'meta_id', 'resultado_esperado', 'medio_verificacion', 'plazo', 'observaciones_evaluador', 'observaciones_evaluado'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 if (!empty($datosFiltrados)) {
 $this->compromisoRepo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar_compromiso', 'compromisos', $id);
 }
 }

 private function validarLimitesCompromisos(int $evaluacionId, string $tipo): void
 {
 $count = $this->compromisoRepo->contarPorEvaluacionYTipo($evaluacionId, $tipo);
 $maxKey = $tipo === 'funcional' ? 'MAX_COMPROMISOS_FUNCIONALES' : 'MAX_COMPROMISOS_COMPORTAMENTALES';
 $max = (int) Env::get($maxKey, $tipo === 'funcional' ? 5 : 5);

 if ($count >= $max) {
 ResponseHelper::error("No se pueden agregar mas compromisos {$tipo}. Maximo permitido: {$max}", 422);
 }
 }

 public function validarCompromisosAntesDeFirmar(int $evaluacionId, int $evaluadoId): array
 {
 $usuario = (new \App\Repository\UsuarioRepository(Database::getInstance()))->buscarPorId($evaluadoId);
 $esPrueba = !empty($usuario['periodo_prueba']) && (bool) $usuario['periodo_prueba'];

 $countFunc = $this->compromisoRepo->contarPorEvaluacionYTipo($evaluacionId, 'funcional');
 $countComp = $this->compromisoRepo->contarPorEvaluacionYTipo($evaluacionId, 'comportamental');

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
}
