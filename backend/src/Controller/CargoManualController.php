<?php

namespace App\Controller;

use App\Service\CargoManualService;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class CargoManualController
{
 private CargoManualService $service;

 public function __construct()
 {
  $this->service = new CargoManualService();
 }

 public function listar(): void
 {
  $filtros = $_GET ?? [];
  $pagina = max(1, (int) ($filtros['pagina'] ?? 1));
  $porPagina = min(200, max(1, (int) ($filtros['por_pagina'] ?? 20)));

  $resultado = $this->service->listar($filtros, $pagina, $porPagina);
  ResponseHelper::success($resultado);
 }

 public function ver(int $id): void
 {
  $cargo = $this->service->ver($id);
  if (!$cargo) {
   ResponseHelper::notFound('Cargo no encontrado');
  }
  ResponseHelper::success($cargo);
 }

 public function conteos(): void
 {
  ResponseHelper::success($this->service->conteos());
 }

 public function catalogos(): void
 {
  ResponseHelper::success($this->service->catalogos());
 }

 public function cargoDeUsuario(int $id): void
 {
  $cargo = $this->service->cargoDeUsuario($id);
  if (!$cargo) {
   ResponseHelper::success(null);
  }
  ResponseHelper::success($cargo);
 }

 public function asignar(int $id): void
 {
  $body = json_decode(file_get_contents('php://input'), true) ?? [];
  $cargoManualId = (int) ($body['cargo_manual_id'] ?? 0);
  if (!$cargoManualId) {
   ResponseHelper::error('cargo_manual_id es requerido', 422);
  }
  $observaciones = isset($body['observaciones']) ? trim((string) $body['observaciones']) : null;

  $resultado = $this->service->asignar($id, $cargoManualId, $observaciones);
  ResponseHelper::success($resultado, 'Cargo asignado correctamente');
 }
}