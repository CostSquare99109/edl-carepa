<?php

namespace App\Controller;

use App\Service\EvidenciaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Config\Database;

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

 /** Obtener compromisos aprobados de un evaluado en un período para el selector de evidencias */
 public function compromisosEvaluado(): void
 {
  $evaluadoId = (int) ($_GET['evaluado_id'] ?? 0);
  $periodoId = (int) ($_GET['periodo_id'] ?? 0);

  if ($evaluadoId <= 0 || $periodoId <= 0) {
   ResponseHelper::error('evaluado_id y periodo_id son requeridos', 400);
  }

  $pdo = Database::getInstance();
  $stmt = $pdo->prepare(
   "SELECT comp.*
    FROM compromisos comp
    INNER JOIN concertaciones conc ON conc.id = comp.concertacion_id AND conc.eliminado_en IS NULL
    WHERE conc.evaluado_id = ?
      AND conc.periodo_id = ?
      AND comp.estado IN ('aprobado', 'en_progreso', 'cumplido')
      AND comp.eliminado_en IS NULL
    ORDER BY comp.tipo, comp.id"
  );
  $stmt->execute([$evaluadoId, $periodoId]);
  $compromisos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

  ResponseHelper::success(['data' => $compromisos]);
 }
}