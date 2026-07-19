<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\EvaluacionService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;

class EvaluacionController
{
 private EvaluacionService $service;

 public function __construct()
 {
 $this->service = new EvaluacionService();
 }

 public function listar(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $pagina = (int) ($_GET['pagina'] ?? 1);
 $porPagina = (int) ($_GET['por_pagina'] ?? 20);
 $resultado = $this->service->listar($filtros, $pagina, $porPagina);
 ResponseHelper::success($resultado);
 }

 public function crear(): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $id = $this->service->crear($input);
 ResponseHelper::success(['id' => $id], 'Evaluacion creada', 201);
 }

  public function ver(int $id): void
  {
  $eval = $this->service->ver($id);
  ResponseHelper::success($eval);
  }

  public function anular(int $id): void
  {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $input = SanitizerHelper::sanitizeArray($input);
  $user = AuthMiddleware::user();
  $this->service->anular($id, (string) ($input['motivo'] ?? ''), $user);
  ResponseHelper::success(null, 'Evaluacion anulada');
  }

 public function calificar(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->calificar($id, $input);
 ResponseHelper::success(null, 'Evaluacion actualizada');
 }

 public function compromisos(int $id): void
 {
 $compromisos = $this->service->compromisos($id);
 ResponseHelper::success($compromisos);
 }

 public function crearCompromiso(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
	$input['evaluacion_id'] = $id;
	$compId = (new \App\Service\CompromisoService())->crear($input);
 ResponseHelper::success(['id' => $compId], 'Compromiso creado', 201);
 }

 public function crearParcial(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $idNuevo = $this->service->crearParcial($id, $input);
 ResponseHelper::success(['id' => $idNuevo], 'Evaluacion parcial creada', 201);
 }

 public function calificarDefinitiva(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->calificarDefinitiva($id, $input);
 ResponseHelper::success(null, 'Evaluacion calificada definitivamente');
 }

 public function aprobarComision(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->aprobarComision($id, $input);
 ResponseHelper::success(null, 'Calificacion procesada por la Comision Evaluadora');
 }

public function pendientesCalificar(): void
  {
  $pagina = (int) ($_GET['pagina'] ?? 1);
  $porPagina = (int) ($_GET['por_pagina'] ?? 20);
  $resultado = $this->service->pendientesCalificar([], $pagina, $porPagina);
  ResponseHelper::success($resultado);
  }

 public function guardar(int $id): void
 {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $input = SanitizerHelper::sanitizeArray($input);
  // Mapear motivo_no_jefe del UI al formato esperado por el service
  if (isset($input['evaluador_no_jefe']) && (int) $input['evaluador_no_jefe'] === 1) {
   $motivosValidos = ['retiro_empleado_responsable', 'impedimento', 'recusacion'];
   $motivo = isset($input['motivo_no_jefe']) ? trim((string) $input['motivo_no_jefe']) : '';
   if (!in_array($motivo, $motivosValidos, true)) {
    ResponseHelper::error('Debe seleccionar el motivo por el cual no es el jefe inmediato del evaluado', 422);
   }
  }
  $this->service->guardar($id, $input);
  ResponseHelper::success(null, 'Evaluacion guardada correctamente');
 }

 /**
  * Verifica si existe una evaluacion de primer semestre para el evaluado.
  * GET /evaluaciones/evaluado/{evaluado_id}/primer-semestre-existe?periodo_id=N
  */
 public function existePrimerSemestre(int $evaluadoId): void
 {
  $periodoId = isset($_GET['periodo_id']) ? (int) $_GET['periodo_id'] : 0;
  if ($evaluadoId <= 0 || $periodoId <= 0) {
   ResponseHelper::error('Debe enviar evaluado_id y periodo_id', 422);
  }
  $existe = $this->service->existeEvaluacionPrimerSemestre($evaluadoId, $periodoId);
  ResponseHelper::success(['existe' => $existe]);
 }

 public function solicitarRevision(int $id): void
 {
  $this->service->solicitarRevision($id);
  ResponseHelper::success(null, 'Revision solicitada');
 }

 public function finalizar(int $id): void
 {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $input = SanitizerHelper::sanitizeArray($input);
  $this->service->finalizar($id, $input);
  ResponseHelper::success(null, 'Evaluacion finalizada. La calificacion es definitiva.');
 }

 /**
   * Buscar evaluado por documento o nombre para el evaluador
   * GET /evaluaciones/buscar-evaluado?documento=X&nombre=Y&q=Z&periodo_id=N
   * El parametro 'q' busca en documento y nombre simultaneamente
   */
  public function buscarEvaluado(): void
   {
    $q = trim($_GET['q'] ?? '');
    $documento = trim($_GET['documento'] ?? '');
    $nombre = trim($_GET['nombre'] ?? '');
    $periodoId = isset($_GET['periodo_id']) ? (int) $_GET['periodo_id'] : 0;

    $filtros = [
     'q' => $q,
     'documento' => $documento,
     'nombre' => $nombre,
     'periodo_id' => $periodoId,
    ];
    $data = $this->service->buscarEvaluadoParaEvaluador($filtros);
   if (empty($data)) {
    ResponseHelper::error('No se encontraron evaluados con esos criterios', 404);
   }
   ResponseHelper::success($data);
  }

  /**
   * Ver evaluaciones previas de un evaluado
   * GET /evaluaciones/{evaluacionId}/evaluaciones-previas
   * GET /evaluaciones/evaluado/{evaluadoId}/previas
   */
  public function verEvaluacionesPrevias(int $evaluacionId): void
  {
   $evaluadoId = isset($_GET['evaluado_id']) ? (int) $_GET['evaluado_id'] : null;
   $data = $this->service->obtenerEvaluacionesPrevias($evaluacionId, $evaluadoId);
   ResponseHelper::success($data);
  }

  /**
   * Ver evaluaciones de un evaluado (por ID directo)
   * GET /evaluaciones/evaluado/{evaluadoId}/previas
   */
  public function verEvaluacionesPorEvaluado(int $evaluadoId): void
  {
   $data = $this->service->obtenerEvaluacionesPrevias(0, $evaluadoId);
   ResponseHelper::success($data);
  }

  /**
   * Evaluaciones propias del usuario autenticado.
   *
   * Pensado para que el rol `evaluado` pueda consultar su historial de
   * evaluaciones desde el menu "Ver Evaluaciones" sin tener que pasar el
   * `evaluado_id` por URL (Acuerdo 617 de 2018, Acuerdo 137/2010).
   *
   * GET /evaluaciones/mias
   *
   * Si el rol activo NO es `evaluado` o `evaluador`, se devuelve el listado
   * del usuario autenticado (util para roles con doble condicion).
   */
  public function misEvaluaciones(): void
  {
   $user = AuthMiddleware::user();
   if (!$user || empty($user['id'])) {
    ResponseHelper::unauthorized();
   }
   $evaluadoId = (int) $user['id'];
   $data = $this->service->obtenerEvaluacionesPrevias(0, $evaluadoId);
   ResponseHelper::success($data);
  }
}
