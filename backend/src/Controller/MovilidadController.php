<?php

namespace App\Controller;

use App\Config\Database;
use App\Helper\ResponseHelper;
use App\Helper\ValidatorHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;
use App\Repository\MovilidadRepository;

class MovilidadController
{
 private MovilidadRepository $repo;

 public function __construct()
 {
  $pdo = Database::getInstance();
  $this->repo = new MovilidadRepository($pdo);
 }

 public function listar(): void
 {
  $user = AuthMiddleware::user();
  $input = SanitizerHelper::sanitizeArray($_GET);
  $pagina = max(1, (int) ($input['pagina'] ?? 1));
  $porPagina = min(100, max(1, (int) ($input['por_pagina'] ?? 20)));
  $busqueda = $input['busqueda'] ?? '';
  $tipo = $input['tipo'] ?? '';
  $estado = $input['estado'] ?? '';

  $filtros = array_filter([
   'busqueda' => $busqueda,
   'tipo' => $tipo,
   'estado' => $estado,
  ], fn($v) => $v !== '');

  $resultado = $this->repo->listar($filtros, $pagina, $porPagina);
  ResponseHelper::success($resultado);
 }

 public function crear(): void
 {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $input = SanitizerHelper::sanitizeArray($input);

  $v = new ValidatorHelper();
  if (!$v->validate($input, [
   'funcionario_id' => 'required',
   'tipo' => 'required',
   'fecha_movimiento' => 'required',
  ])) {
   ResponseHelper::error('Datos invalidos', 422);
  }

  $tipos = ['ascenso','traslado','encargo','comision','reintegro','retiro','otro'];
  if (!in_array($input['tipo'], $tipos)) {
   ResponseHelper::error('Tipo de movilidad invalido', 422);
  }

  $id = $this->repo->crear($input);
  ResponseHelper::success(['id' => $id], 'Movilidad registrada', 201);
 }

 public function actualizar(): void
 {
  $id = (int) ($_GET['id'] ?? 0);
  if ($id <= 0) {
   ResponseHelper::error('ID requerido', 422);
  }

  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $input = SanitizerHelper::sanitizeArray($input);

  $this->repo->actualizar($id, $input);
  ResponseHelper::success(null, 'Movilidad actualizada');
 }

 public function ejecutar(): void
 {
  $id = (int) ($_GET['id'] ?? 0);
  if ($id <= 0) {
   ResponseHelper::error('ID requerido', 422);
  }

  $mov = $this->repo->buscarPorId($id);
  if (!$mov) {
   ResponseHelper::error('Movilidad no encontrada', 404);
  }

  if ($mov['estado'] !== 'aprobado') {
   ResponseHelper::error('Solo se pueden ejecutar movilidades aprobadas', 400);
  }

  $this->repo->ejecutar($id, $mov);
  ResponseHelper::success(null, 'Movilidad ejecutada. Funcionario actualizado.');
 }
}
