<?php

namespace App\Controller;

use App\Service\CompromisoMejoramientoService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;

class CompromisoMejoramientoController
{
 private CompromisoMejoramientoService $service;

 public function __construct()
 {
 $this->service = new CompromisoMejoramientoService();
 }

 public function listarGlobal(): void
 {
  $filtros = SanitizerHelper::sanitizeArray($_GET);
  $pagina = (int) ($_GET['pagina'] ?? 1);
  $porPagina = (int) ($_GET['por_pagina'] ?? 20);
  $resultado = $this->service->listar($filtros, $pagina, $porPagina);
  ResponseHelper::success($resultado);
 }

 public function crear(int $concertacionId): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $user = AuthMiddleware::user();

 $requeridos = ['motivo', 'aspecto_corregir', 'acciones_mejoramiento'];
 foreach ($requeridos as $campo) {
 if (empty($input[$campo])) {
 ResponseHelper::error("El campo {$campo} es requerido", 422);
 }
 }

 $motivosValidos = ['nivel_no_satisfactorio', 'nivel_satisfactorio', 'solicitud_evaluado'];
 if (!in_array($input['motivo'], $motivosValidos)) {
 ResponseHelper::error('Motivo invalido. Debe ser: nivel_no_satisfactorio, nivel_satisfactorio o solicitud_evaluado', 422);
 }

 $datos = [
 'concertacion_id' => $concertacionId,
 'compromiso_id' => $input['compromiso_id'] ?? null,
 'motivo' => $input['motivo'],
 'aspecto_corregir' => $input['aspecto_corregir'],
 'acciones_mejoramiento' => $input['acciones_mejoramiento'],
 'observacion' => $input['observacion'] ?? null,
 'plazo_cumplimiento' => $input['plazo_cumplimiento'] ?? null,
 ];

 $id = $this->service->crear($datos);
 ResponseHelper::success(['id' => $id], 'Compromiso de mejoramiento registrado', 201);
 }

 public function listar(int $concertacionId): void
 {
 $filtros = ['concertacion_id' => $concertacionId];
 $filtros = array_merge($filtros, SanitizerHelper::sanitizeArray($_GET));
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

 public function actualizar(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->actualizar($id, $input);
 ResponseHelper::success(null, 'Compromiso de mejoramiento actualizado');
 }

 public function seguimiento(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->seguimiento($id, $input);
 ResponseHelper::success(null, 'Seguimiento registrado');
 }

 public function completar(int $id): void
 {
 $this->service->completar($id);
 ResponseHelper::success(null, 'Compromiso de mejoramiento completado');
 }
}
