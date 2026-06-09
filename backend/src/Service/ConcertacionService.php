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

 $concertacion['compromisos'] = $this->concertacionRepo->compromisosPorEvaluacion($id);

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

 $metaId = $datos['meta_id'] ?? null;
 $funcionarioId = $datos['funcionario_id'] ?? $datos['evaluado_id'] ?? null;
 $evaluadorId = $datos['evaluador_id'] ?? $user['id'];

 if (!$metaId || !$funcionarioId) {
 ResponseHelper::error('meta_id y funcionario_id son requeridos', 422);
 }

 $evaluado = $this->usuarioRepo->buscarPorId((int) $funcionarioId);
 if ($evaluado && !empty($evaluado['periodo_prueba']) && (bool) $evaluado['periodo_prueba']) {
 $fechaInicio = $evaluado['fecha_vinculacion'] ?? $evaluado['creado_en'] ?? null;
 if ($fechaInicio) {
 $dias = (int) ((time() - strtotime($fechaInicio)) / 86400);
 if ($dias <= 120) {
 ResponseHelper::error('El funcionario se encuentra en periodo de prueba (menos de 4 meses). No es sujeto de evaluacion conforme al articulo 15 de la Resolucion 1760 de 2010.', 422);
 }
 }
 }

 $estado = $datos['estado'] ?? 'pendiente';
 $estadosValidos = ['pendiente', 'concertada', 'no_concertada', 'revisada', 'aprobada'];
 if (!in_array($estado, $estadosValidos)) {
 $estado = 'pendiente';
 }

 $crearDatos = [
 'meta_id' => $metaId,
 'evaluador_id' => $evaluadorId,
 'funcionario_id' => $funcionarioId,
 'estado' => $estado,
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

 $permitidos = ['observaciones', 'estado', 'fecha_concertacion'];
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

 if ($concertacion['estado'] === 'concertada') {
 ResponseHelper::error('Los compromisos ya estan concertados', 400);
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

 $compromisoService = new CompromisoService();
 $validacion = $compromisoService->validarCompromisosAntesDeFirmar($id, (int) $concertacion['evaluado_id']);
 if (!$validacion['valido']) {
  ResponseHelper::error('No se pueden fijar los compromisos. ' . implode(' | ', $validacion['errores']), 422);
 }

 $this->concertacionRepo->actualizar($id, [
 'estado' => 'concertada',
 'fecha_concertacion' => date('Y-m-d H:i:s'),
 ]);

 AuditoriaService::registrar('fijar_compromisos', 'concertaciones', $id);
 }

 public function compromisosPorEvaluacion(int $evaluacionId): array
 {
 $concertacion = $this->concertacionRepo->buscarPorId($evaluacionId);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }
 return $this->concertacionRepo->compromisosPorEvaluacion($evaluacionId);
 }

 public function compromisos(int $evaluacionId): array
 {
 return $this->compromisosPorEvaluacion($evaluacionId);
 }
}
