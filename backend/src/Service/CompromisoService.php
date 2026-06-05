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

 $concertacionId = $datos['concertacion_id'] ?? null;
 if (!$concertacionId) {
 ResponseHelper::error('concertacion_id es requerido', 422);
 }

 $concertacion = $this->concertacionRepo->buscarPorId((int) $concertacionId);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 $tipo = $datos['tipo'] ?? 'funcional';
 if (!in_array($tipo, ['funcional', 'comportamental'])) {
 ResponseHelper::error('Tipo invalido. Debe ser: funcional o comportamental', 422);
 }

 $this->validarLimitesCompromisos((int) $concertacionId, $tipo);

 $crearDatos = [
 'concertacion_id' => $concertacionId,
 'tipo' => $tipo,
 'meta_id' => $datos['meta_id'] ?? null,
 'descripcion' => $datos['descripcion'],
 'peso' => $datos['peso'] ?? 0,
 'competencia_codigo' => $datos['competencia_codigo'] ?? null,
 'propuesto_por_jefe_entidad' => in_array($rolActivo, ['admin', 'jefe_personal', 'evaluador']) ? 1 : 0,
 'estado' => 'propuesto',
 ];

 $id = $this->compromisoRepo->crear($crearDatos);
 AuditoriaService::registrar('crear_compromiso', 'compromisos', $id);

 return $id;
 }

 public function enviar(array $datos, array $user): int
 {
 $rolActivo = AuthMiddleware::rolActivo();

 $concertacionId = $datos['concertacion_id'] ?? null;
 if (!$concertacionId) {
 $concertacionId = $datos['evaluacion_id'] ?? null;
 if ($concertacionId) {
 $concertacion = $this->concertacionRepo->buscarPorId((int) $concertacionId);
 if (!$concertacion) {
 $concertacionId = null;
 }
 }
 }
 if (!$concertacionId) {
 ResponseHelper::error('concertacion_id es requerido', 422);
 }

 $tipo = $datos['tipo'] ?? 'funcional';
 if (!in_array($tipo, ['funcional', 'comportamental'])) {
 ResponseHelper::error('Tipo invalido. Debe ser: funcional o comportamental', 422);
 }

 $this->validarLimitesCompromisos((int) $concertacionId, $tipo);

 $crearDatos = [
 'concertacion_id' => $concertacionId,
 'tipo' => $tipo,
 'descripcion' => $datos['descripcion'],
 'peso' => $datos['peso'] ?? 0,
 'competencia_codigo' => $datos['competencia_codigo'] ?? null,
 'propuesto_por_jefe_entidad' => 0,
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

 $concertacionId = (int) $compromiso['concertacion_id'];
 $tipo = $compromiso['tipo'];

 $sumaActual = $this->compromisoRepo->sumPesosPorConcertacionYTipo($concertacionId, $tipo);
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

 if ($compromiso['tipo'] === 'comportamental') {
 $actualizar['puntaje_comportamental'] = $puntaje;
 $actualizar['nivel_comportamental'] = $puntaje >= 90 ? 'muy_alto' : ($puntaje >= 75 ? 'alto' : ($puntaje >= 50 ? 'aceptable' : 'bajo'));
 }

 $this->compromisoRepo->actualizar($id, $actualizar);
 AuditoriaService::registrar('calificar_compromiso', 'compromisos', $id);
 }

 public function resumenPesos(int $id, array $user): array
 {
 $compromiso = $this->compromisoRepo->buscarPorId($id);
 if (!$compromiso) {
 $concertacion = $this->concertacionRepo->buscarPorId($id);
 if ($concertacion) {
 return $this->resumenPesosConcertacion($id);
 }
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

 $permitidos = ['descripcion', 'peso', 'competencia_codigo', 'meta_id', 'frecuencia', 'nivel_comportamental', 'impacto_aporta_compromisos', 'impacto_excede_estipulado', 'justificacion_excede', 'observaciones_evaluador', 'observaciones_evaluado'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 if (!empty($datosFiltrados)) {
 $this->compromisoRepo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar_compromiso', 'compromisos', $id);
 }
 }

 private function validarLimitesCompromisos(int $concertacionId, string $tipo): void
 {
 $count = $this->compromisoRepo->contarPorConcertacionYTipo($concertacionId, $tipo);
 $minKey = $tipo === 'funcional' ? 'MIN_COMPROMISOS_FUNCIONALES' : 'MIN_COMPROMISOS_COMPORTAMENTALES';
 $maxKey = $tipo === 'funcional' ? 'MAX_COMPROMISOS_FUNCIONALES' : 'MAX_COMPROMISOS_COMPORTAMENTALES';
 $max = (int) Env::get($maxKey, $tipo === 'funcional' ? 5 : 5);

 if ($count >= $max) {
 ResponseHelper::error("No se pueden agregar mas compromisos {$tipo}. Maximo permitido: {$max}", 422);
 }
 }
}
