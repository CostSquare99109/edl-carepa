<?php

namespace App\Controller;

use App\Service\EvidenciaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;

class EvidenciaController
{
 private EvidenciaService $service;

 public function __construct()
 {
 $this->service = new EvidenciaService();
 }

 public function listar(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $pagina = (int) ($_GET['pagina'] ?? 1);
 $porPagina = (int) ($_GET['por_pagina'] ?? 20);
 $resultado = $this->service->listar($filtros, $pagina, $porPagina);
 ResponseHelper::success($resultado);
 }

 public function registrar(): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);

 $requeridos = ['concertacion_id', 'descripcion'];
 foreach ($requeridos as $campo) {
 if (empty($input[$campo])) {
 ResponseHelper::error("El campo {$campo} es requerido", 422);
 }
 }

 $id = $this->service->registrar($input);
 ResponseHelper::success(['id' => $id], 'Evidencia registrada', 201);
 }

 public function subir(): void
 {
 $this->registrar();
 }

 public function ver(int $id): void
 {
 $resultado = $this->service->ver($id);
 ResponseHelper::success($resultado);
 }

 public function actualizar(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->actualizar($id, $input);
 ResponseHelper::success(null, 'Evidencia actualizada');
 }

 public function verificar(int $id): void
 {
 $this->actualizar($id);
 }
}
