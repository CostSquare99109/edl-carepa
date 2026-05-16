<?php

namespace App\Controller;

use App\Service\CompromisoService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;

class CompromisoController
{
  private CompromisoService $service;

  public function __construct()
  {
    $this->service = new CompromisoService();
  }

  /** Listar compromisos (con filtros: estado, evaluador_id, responsable_id) */
  public function listar(): void
  {
    $filtros = SanitizerHelper::sanitizeArray($_GET);
    $pagina = (int) ($_GET['pagina'] ?? 1);
    $porPagina = (int) ($_GET['por_pagina'] ?? 20);
    $resultado = $this->service->listar($filtros, $pagina, $porPagina);
    ResponseHelper::success($resultado);
  }

 /** Funcionario envía un compromiso para aprobación del evaluador */
 public function enviar(): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $user = AuthMiddleware::user();

 $requeridos = ['evaluacion_id', 'tipo', 'descripcion', 'evaluador_id'];
 foreach ($requeridos as $campo) {
 if (empty($input[$campo])) {
 ResponseHelper::error("El campo {$campo} es requerido", 400);
 }
 }

 // Validar tipo de compromiso CNSC: 'funcional' o 'comportamental'
 $tiposValidos = ['funcional', 'comportamental'];
 if (!in_array($input['tipo'], $tiposValidos)) {
 ResponseHelper::error('Tipo de compromiso invalido. Debe ser: funcional o comportamental', 422);
 }

 $datos = [
 'evaluacion_id' => (int) $input['evaluacion_id'],
 'tipo' => $input['tipo'],
 'descripcion' => $input['descripcion'],
 'resultado_esperado' => $input['resultado_esperado'] ?? null,
 'medio_verificacion' => $input['medio_verificacion'] ?? null,
 'observaciones_evaluado' => $input['observaciones_evaluado'] ?? null,
 'plazo' => $input['plazo'] ?? null,
 'responsable_id' => $user['id'],
 'evaluador_id' => (int) $input['evaluador_id'],
 'estado' => 'propuesto',
 ];

 $id = $this->service->enviar($datos, $user);
 ResponseHelper::success(['id' => $id], 'Compromiso propuesto para aprobacion');
 }

  /** Evaluador aprueba un compromiso asignando peso */
  public function aprobar(int $id): void
  {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $input = SanitizerHelper::sanitizeArray($input);
    $user = AuthMiddleware::user();

    $peso = isset($input['peso']) ? (float) $input['peso'] : null;
    if ($peso === null) {
      ResponseHelper::error('El peso es requerido', 400);
    }
    if ($peso < 0 || $peso > 100) {
      ResponseHelper::error('El peso debe estar entre 0 y 100', 400);
    }

    $observaciones = $input['observaciones_evaluador'] ?? '';

    $this->service->aprobar($id, $peso, $observaciones, $user);
    ResponseHelper::success(null, 'Compromiso aprobado');
  }

  /** Evaluador rechaza un compromiso */
  public function rechazar(int $id): void
  {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $input = SanitizerHelper::sanitizeArray($input);
    $user = AuthMiddleware::user();

    $observaciones = $input['observaciones_evaluador'] ?? '';
    $this->service->rechazar($id, $observaciones, $user);
    ResponseHelper::success(null, 'Compromiso rechazado');
  }

  /** Obtener resumen de pesos de compromisos de una evaluación (para validar que sumen 100%) */
  public function resumenPesos(int $evaluacionId): void
  {
    $user = AuthMiddleware::user();
    $resultado = $this->service->resumenPesos($evaluacionId, $user);
    ResponseHelper::success($resultado);
  }

  /** Obtener compromisos pendientes de aprobación para el evaluador */
  public function pendientesAprobacion(): void
  {
    $user = AuthMiddleware::user();
    $pagina = (int) ($_GET['pagina'] ?? 1);
    $porPagina = (int) ($_GET['por_pagina'] ?? 20);
    $resultado = $this->service->pendientesAprobacion($user, $pagina, $porPagina);
    ResponseHelper::success($resultado);
  }

 public function actualizar(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->actualizar($id, $input);
 ResponseHelper::success(null, 'Compromiso actualizado');
 }

 /** Evaluador califica un compromiso (asigna puntaje 0-100) */
 public function calificar(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $user = AuthMiddleware::user();

 $puntaje = isset($input['puntaje']) ? (float) $input['puntaje'] : null;
 if ($puntaje === null) {
 ResponseHelper::error('El puntaje es requerido', 400);
 }
 if ($puntaje < 0 || $puntaje > 100) {
 ResponseHelper::error('El puntaje debe estar entre 0 y 100', 400);
 }

 $observaciones = $input['observaciones'] ?? '';
 $this->service->calificar($id, $puntaje, $observaciones, $user);
 ResponseHelper::success(null, 'Compromiso calificado');
 }

 /** Evaluador devuelve un compromiso al evaluado para ajustes */
 public function devolver(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $user = AuthMiddleware::user();

 $observaciones = $input['observaciones_evaluador'] ?? '';
 if (empty($observaciones)) {
 ResponseHelper::error('Las observaciones son requeridas al devolver un compromiso', 422);
 }

 $this->service->devolver($id, $observaciones, $user);
 ResponseHelper::success(null, 'Compromiso devuelto al evaluado');
 }
}
