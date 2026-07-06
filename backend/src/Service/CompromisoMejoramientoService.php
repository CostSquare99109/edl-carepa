<?php

namespace App\Service;

use App\Repository\CompromisoMejoramientoRepository;
use App\Repository\ConcertacionRepository;
use App\Helper\ResponseHelper;
use App\Helper\ValidatorHelper;
use App\Config\Database;
use App\Middleware\AuthMiddleware;

class CompromisoMejoramientoService
{
 private CompromisoMejoramientoRepository $repo;
 private ConcertacionRepository $concertacionRepo;

 public function __construct()
 {
 $pdo = Database::getInstance();
 $this->repo = new CompromisoMejoramientoRepository($pdo);
 $this->concertacionRepo = new ConcertacionRepository($pdo);
 }

  public function crear(array $datos): int
  {
  $concertacion = $this->concertacionRepo->buscarPorId((int) $datos['concertacion_id']);
  if (!$concertacion) {
  ResponseHelper::notFound('Concertacion no encontrada');
  }

  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();

if (!in_array($rolActivo, ['evaluador', 'evaluado'])) {
   ResponseHelper::forbidden();
  }

  if ($rolActivo === 'evaluado' && $datos['motivo'] !== 'solicitud_evaluado') {
  ResponseHelper::error('El evaluado solo puede registrar compromisos por solicitud propia', 403);
  }

  $motivosValidos = ['nivel_no_satisfactorio', 'nivel_satisfactorio', 'solicitud_evaluado'];
  if (!in_array($datos['motivo'], $motivosValidos)) {
  ResponseHelper::error('Motivo invalido', 422);
  }

  $v = new ValidatorHelper();
  $v->validate($datos, [
  'motivo' => 'required',
  'aspecto_corregir' => 'required',
  'acciones_mejoramiento' => 'required'
  ]);

  $datos['registrado_por'] = $user['id'];
  $datos['estado_aprobacion'] = 'pendiente';

  if (!empty($datos['plazo_cumplimiento'])) {
   $hoy = date('Y-m-d');
   if ($datos['plazo_cumplimiento'] < $hoy) {
    ResponseHelper::error('El plazo de cumplimiento no puede ser anterior a la fecha actual.', 422);
   }
  }

  $datos['periodo_id'] = !empty($datos['periodo_id'])
   ? (int) $datos['periodo_id']
   : (int) ($concertacion['periodo_id'] ?? null);

  $id = $this->repo->crear($datos);
  AuditoriaService::registrar('crear', 'compromisos_mejoramiento', $id, null, $datos);
  return $id;
  }

 public function ver(int $id): array
 {
 $cm = $this->repo->buscarPorId($id);
 if (!$cm) {
 ResponseHelper::notFound('Compromiso de mejoramiento no encontrado');
 }
 return $cm;
 }

 public function listar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

  public function actualizar(int $id, array $datos): void
  {
  $cm = $this->repo->buscarPorId($id);
  if (!$cm) {
  ResponseHelper::notFound('Compromiso de mejoramiento no encontrado');
  }

  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();
if ($rolActivo !== 'evaluador') {
   ResponseHelper::forbidden();
  }

  if (!empty($datos['plazo_cumplimiento'])) {
   $hoy = date('Y-m-d');
   if ($datos['plazo_cumplimiento'] < $hoy) {
    ResponseHelper::error('El plazo de cumplimiento no puede ser anterior a la fecha actual.', 422);
   }
  }

  $permitidos = ['aspecto_corregir', 'acciones_mejoramiento', 'observacion', 'plazo_cumplimiento', 'periodo_id', 'estado_aprobacion'];
  $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
  $this->repo->actualizar($id, $datosFiltrados);
  AuditoriaService::registrar('actualizar', 'compromisos_mejoramiento', $id, $cm, $datosFiltrados);
  }

  public function seguimiento(int $id, array $datos): void
  {
  $cm = $this->repo->buscarPorId($id);
  if (!$cm) {
  ResponseHelper::notFound('Compromiso de mejoramiento no encontrado');
  }

  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();
if ($rolActivo !== 'evaluador') {
   ResponseHelper::forbidden();
  }

  if (($cm['estado'] ?? '') === 'completado') {
  ResponseHelper::error('El compromiso ya fue completado', 422);
  }

  $v = new ValidatorHelper();
  $v->validate($datos, [
  'avance' => 'required',
  'observacion' => 'required'
  ]);

  $pdo = Database::getInstance();
  $stmt = $pdo->prepare(
   "INSERT INTO compromiso_mejoramiento_seguimientos
    (compromiso_mejoramiento_id, registrado_por, avance, observacion,
     evidencia_descripcion, evidencia_archivo, evidencia_tipo, evidencia_tamano,
     fecha_seguimiento, creado_en)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())"
  );
  $stmt->execute([
   $id,
   $user['id'],
   $datos['avance'],
   $datos['observacion'],
   $datos['evidencia_descripcion'] ?? null,
   $datos['evidencia_archivo'] ?? null,
   $datos['evidencia_tipo'] ?? null,
   isset($datos['evidencia_tamano']) ? (int) $datos['evidencia_tamano'] : null,
  ]);

  $this->repo->actualizar($id, [
   'avance_porcentaje' => max(0, min(100, (int) $datos['avance']))
  ]);

  if ((int) $datos['avance'] >= 100) {
  $this->completar($id);
  }

  AuditoriaService::registrar('seguimiento', 'compromisos_mejoramiento', $id, $cm, [
   'avance' => $datos['avance'],
   'observacion' => $datos['observacion'],
  ]);
  }

 public function completar(int $id): void
 {
 $cm = $this->repo->buscarPorId($id);
 if (!$cm) {
 ResponseHelper::notFound('Compromiso de mejoramiento no encontrado');
 }

 if (($cm['estado'] ?? '') === 'completado') {
 ResponseHelper::error('El compromiso ya fue completado', 422);
 }

 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();
if ($rolActivo !== 'evaluador') {
   ResponseHelper::forbidden();
  }

  $this->repo->actualizar($id, [
   'estado' => 'completado',
 'fecha_completado' => date('Y-m-d H:i:s')
 ]);

 AuditoriaService::registrar('completar', 'compromisos_mejoramiento', $id, $cm, ['estado' => 'completado']);
 }
}
