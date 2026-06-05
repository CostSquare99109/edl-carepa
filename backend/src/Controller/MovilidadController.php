<?php

namespace App\Controller;

use App\Service\MovilidadService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class MovilidadController
{
 private MovilidadService $service;

 public function __construct()
 {
 $this->service = new MovilidadService();
 }

 public function listar(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $pagina = (int) ($_GET['pagina'] ?? 1);
 $porPagina = (int) ($_GET['por_pagina'] ?? 20);
 $resultado = $this->service->listar($filtros, $pagina, $porPagina);
 ResponseHelper::success($resultado);
 }

 public function ver(int $id): void
 {
 $resultado = $this->service->ver($id);
 ResponseHelper::success($resultado);
 }

 public function crear(): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $id = $this->service->crear($input);
 ResponseHelper::success(['id' => $id], 'Movilidad registrada', 201);
 }

 public function actualizar(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->actualizar($id, $input);
 ResponseHelper::success(null, 'Movilidad actualizada');
 }

 public function eliminar(int $id): void
 {
 $this->service->eliminar($id);
 ResponseHelper::success(null, 'Movilidad eliminada');
 }
}
