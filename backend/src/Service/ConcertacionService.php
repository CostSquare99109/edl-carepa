<?php

namespace App\Service;

use App\Repository\ConcertacionRepository;
use App\Repository\CompromisoRepository;
use App\Repository\UsuarioRepository;
use App\Helper\ResponseHelper;
use App\Helper\HttpException;
use App\Config\Database;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

class ConcertacionService
{
 private ConcertacionRepository $concertacionRepo;
 private CompromisoRepository $compromisoRepo;
 private UsuarioRepository $usuarioRepo;

 public function __construct()
 {
 $pdo = Database::getInstance();
 $this->concertacionRepo = new ConcertacionRepository($pdo);
 $this->compromisoRepo = new CompromisoRepository($pdo);
 $this->usuarioRepo = new UsuarioRepository($pdo);
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

 return $this->concertacionRepo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 public function ver(int $id): array
 {
 $concertacion = $this->concertacionRepo->buscarPorId($id);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 $concertacion['compromisos'] = $this->concertacionRepo->compromisosPorConcertacion($id);

 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();
 if (!in_array($rolActivo, ['admin', 'jefe_personal']) &&
 (int) $concertacion['evaluador_id'] !== $user['id'] &&
 (int) $concertacion['evaluado_id'] !== $user['id']
 ) {
 ResponseHelper::forbidden();
 }

 return $concertacion;
 }

 public function crear(array $datos): int
 {
 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if (!in_array($rolActivo, ['admin', 'jefe_personal', 'evaluador'])) {
 ResponseHelper::forbidden('Solo evaluadores o jefes pueden crear concertaciones');
 }

 $periodoId = $datos['periodo_id'] ?? null;
 $evaluadoId = $datos['evaluado_id'] ?? null;
 $evaluadorId = $datos['evaluador_id'] ?? $user['id'];

 if (!$periodoId || !$evaluadoId) {
 ResponseHelper::error('periodo_id y evaluado_id son requeridos', 422);
 }

 $existente = $this->concertacionRepo->buscarPorPeriodoYEvalauado((int) $periodoId, (int) $evaluadoId);
 if ($existente) {
 ResponseHelper::error('Ya existe una concertacion para este evaluado en este periodo', 409);
 }

 $tipoConcertacion = $datos['tipo_concertacion'] ?? 'concertacion_bilateral';
 $evaluadorNoJefe = $datos['evaluador_no_jefe'] ?? 0;
 $motivoNoJefe = $datos['motivo_no_jefe'] ?? null;

 if ($tipoConcertacion === 'fijados_evaluador' && !in_array($rolActivo, ['admin', 'jefe_personal', 'evaluador'])) {
 ResponseHelper::forbidden('Solo evaluadores pueden fijar compromisos unilateralmente');
 }

 $crearDatos = [
 'periodo_id' => $periodoId,
 'evaluador_id' => $evaluadorId,
 'evaluado_id' => $evaluadoId,
 'tipo_concertacion' => $tipoConcertacion,
 'conformar_comision_evaluadora' => $datos['conformar_comision_evaluadora'] ?? 0,
 'evaluador_no_jefe' => $evaluadorNoJefe,
 'motivo_no_jefe' => $motivoNoJefe,
 'estado' => $tipoConcertacion === 'fijados_evaluador' ? 'fijada' : 'pendiente',
 'observaciones' => $datos['observaciones'] ?? null,
 ];

 $id = $this->concertacionRepo->crear($crearDatos);

 AuditoriaService::registrar('crear_concertacion', 'concertaciones', $id);

 return $id;
 }

 public function actualizar(int $id, array $datos): void
 {
 $concertacion = $this->concertacionRepo->buscarPorId($id);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if (!in_array($rolActivo, ['admin', 'jefe_personal']) &&
 (int) $concertacion['evaluador_id'] !== $user['id']) {
 ResponseHelper::forbidden();
 }

 $permitidos = ['observaciones', 'tipo_concertacion', 'evaluador_no_jefe', 'motivo_no_jefe', 'conformar_comision_evaluadora'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 if (!empty($datosFiltrados)) {
 $this->concertacionRepo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar_concertacion', 'concertaciones', $id);
 }
 }

 public function fijarCompromisos(int $id): void
 {
 $concertacion = $this->concertacionRepo->buscarPorId($id);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if (!in_array($rolActivo, ['admin', 'jefe_personal', 'evaluador'])) {
 ResponseHelper::forbidden('Solo evaluadores pueden fijar compromisos');
 }

 if ($concertacion['estado'] === 'fijada') {
 ResponseHelper::error('Los compromisos ya estan fijados', 400);
 }

 $compromisos = $this->concertacionRepo->compromisosPorConcertacion($id);

 $compromisosNoAprobados = array_filter($compromisos, function ($c) {
 return $c['estado'] !== 'aprobado' && $c['estado'] !== 'cumplido' && $c['estado'] !== 'incumplido';
 });

 if (count($compromisosNoAprobados) > 0) {
 ResponseHelper::error('No se pueden fijar los compromisos. Todos deben estar aprobados bilateralmente antes de fijar la concertacion.', 422);
 }

 if (empty($compromisos)) {
 ResponseHelper::error('No hay compromisos registrados para fijar', 422);
 }

 $this->concertacionRepo->actualizar($id, [
 'estado' => 'fijada',
 'fecha_concertacion' => date('Y-m-d H:i:s'),
 ]);

 AuditoriaService::registrar('fijar_compromisos', 'concertaciones', $id);
 }

 public function compromisosPorConcertacion(int $concertacionId): array
 {
 $concertacion = $this->concertacionRepo->buscarPorId($concertacionId);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }
 return $this->concertacionRepo->compromisosPorConcertacion($concertacionId);
 }

 public function compromisos(int $concertacionId): array
 {
 return $this->compromisosPorConcertacion($concertacionId);
 }
}
