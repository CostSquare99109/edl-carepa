<?php

namespace App\Controller;

use App\Service\ReporteService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class ReporteController
{
 private ReporteService $service;

 public function __construct()
 {
 $this->service = new ReporteService();
 }

 public function concertacion(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $resultado = $this->service->concertacion($filtros);
 ResponseHelper::success($resultado);
 }

 public function evaluaciones(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $resultado = $this->service->evaluaciones($filtros);
 ResponseHelper::success($resultado);
 }

 public function funcionario(int $id): void
 {
 $resultado = $this->service->funcionario($id);
 ResponseHelper::success($resultado);
 }

 public function resumen(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $periodoId = (int) ($filtros['periodo_id'] ?? 0);
 if (!$periodoId) {
 ResponseHelper::error('periodo_id es requerido', 422);
 }
 $resultado = $this->service->resumenGeneral($periodoId);
 ResponseHelper::success($resultado);
 }

 public function porEntidad(int $id): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $periodoId = (int) ($filtros['periodo_id'] ?? 0);
 if (!$periodoId) {
 ResponseHelper::error('periodo_id es requerido', 422);
 }
 $resultado = $this->service->reportePorEntidad($id, $periodoId);
 ResponseHelper::success($resultado);
 }

 public function porDependencia(int $id): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $periodoId = (int) ($filtros['periodo_id'] ?? 0);
 if (!$periodoId) {
 ResponseHelper::error('periodo_id es requerido', 422);
 }
 $resultado = $this->service->reportePorDependencia($id, $periodoId);
 ResponseHelper::success($resultado);
 }

 public function compromisos(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $resultado = $this->service->reporteCompromisos($filtros);
 ResponseHelper::success($resultado);
 }

 public function descargarExcel(string $tipo): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $csv = $this->service->generarCSV($tipo, $filtros);

 $filename = "reporte_{$tipo}_" . date('Ymd_His') . '.csv';

 header('Content-Type: text/csv; charset=utf-8');
 header('Content-Disposition: attachment; filename="' . $filename . '"');
 header('Content-Length: ' . strlen($csv));
 header('Cache-Control: no-cache, must-revalidate');

 echo $csv;
 exit;
 }

 public function pdfConcertacion(int $id): void
 {
 $data = $this->service->datosConcertacionPdf($id);
 $html = \App\Helper\PdfHelper::concertacionPdf($data['concertacion'], $data['compromisos']);
 \App\Helper\PdfHelper::generar($html, "concertacion_{$id}.pdf");
 }

 public function pdfEvaluacion(int $id): void
 {
 $data = $this->service->datosEvaluacionPdf($id);
 $html = \App\Helper\PdfHelper::evaluacionPdf($data['evaluacion'], $data['detalles']);
 \App\Helper\PdfHelper::generar($html, "evaluacion_{$id}.pdf");
 }
}
