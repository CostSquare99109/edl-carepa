<?php

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
 $input['concertacion_id'] = $input['concertacion_id'] ?? $id;
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
}
