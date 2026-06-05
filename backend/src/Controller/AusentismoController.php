<?php

namespace App\Controller;

use App\Service\AusentismoService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class AusentismoController
{
 private AusentismoService $service;

 public function __construct()
 {
 $this->service = new AusentismoService();
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
 ResponseHelper::success(['id' => $id], 'Ausentismo registrado', 201);
 }

 public function actualizar(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->actualizar($id, $input);
 ResponseHelper::success(null, 'Ausentismo actualizado');
 }

 public function eliminar(int $id): void
 {
 $this->service->eliminar($id);
 ResponseHelper::success(null, 'Ausentismo eliminado');
 }
}
