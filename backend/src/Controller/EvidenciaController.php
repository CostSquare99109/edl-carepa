<?php

namespace App\Controller;

use App\Service\EvidenciaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

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

 public function ver(int $id): void
 {
  $evidencia = $this->service->ver($id);
  ResponseHelper::success($evidencia);
 }

 public function registrar(): void
 {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $input = SanitizerHelper::sanitizeArray($input);
  $id = $this->service->registrar($input);
  ResponseHelper::success(['id' => (int) $id], 'Evidencia registrada correctamente');
 }

 public function actualizar(int $id): void
 {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $input = SanitizerHelper::sanitizeArray($input);
  $this->service->actualizar($id, $input);
  ResponseHelper::success(['id' => $id], 'Evidencia actualizada correctamente');
 }

 public function eliminar(int $id): void
 {
  $this->service->eliminar($id);
  ResponseHelper::success(null, 'Evidencia eliminada');
 }
}
