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

 public function concertacionesAprobadas(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $periodoId = (int) ($filtros['periodo_id'] ?? 0);
 if (!$periodoId) {
 ResponseHelper::error('periodo_id es requerido', 422);
 }
 $semestre = $filtros['semestre'] ?? '';
 if (!in_array($semestre, ['primer_semestre', 'segundo_semestre'], true)) {
 ResponseHelper::error('semestre debe ser primer_semestre o segundo_semestre', 422);
 }
 $resultado = $this->service->concertacionesAprobadas($periodoId, $semestre);
 ResponseHelper::success($resultado);
 }

 public function descargarExcelConcertaciones(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $periodoId = (int) ($filtros['periodo_id'] ?? 0);
 if (!$periodoId) {
 ResponseHelper::error('periodo_id es requerido', 422);
 }
 $semestre = $filtros['semestre'] ?? '';
 if (!in_array($semestre, ['primer_semestre', 'segundo_semestre'], true)) {
 ResponseHelper::error('semestre debe ser primer_semestre o segundo_semestre', 422);
 }

 while (ob_get_level()) ob_end_clean();

 $html = $this->service->generarExcelConcertacionesAprobadas($periodoId, $semestre);
 $filename = "concertaciones_aprobadas_{$periodoId}_{$semestre}_" . date('Ymd_His') . '.xls';

 header('Content-Type: application/vnd.ms-excel; charset=utf-8');
 header('Content-Disposition: attachment; filename="' . $filename . '"');
 header('Content-Length: ' . strlen($html));
 header('Cache-Control: no-cache, must-revalidate');
 header('Pragma: no-cache');

 echo $html;
 exit;
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
    $idPie = \App\Helper\PdfHelper::idPie($data['concertacion']);
    \App\Helper\PdfHelper::generar($html, "concertacion_{$id}.pdf", true, $idPie);
    }

    public function pdfEvaluacion(int $id): void
    {
    $data = $this->service->datosEvaluacionPdf($id);
    $html = \App\Helper\PdfHelper::evaluacionPdf($data['evaluacion'], $data['detalles']);
    $idPie = \App\Helper\PdfHelper::idPie($data['evaluacion']);
    \App\Helper\PdfHelper::generar($html, "evaluacion_{$id}.pdf", true, $idPie);
    }
}
