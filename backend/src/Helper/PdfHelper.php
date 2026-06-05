<?php

namespace App\Helper;

use Dompdf\Dompdf;
use Dompdf\Options;

class PdfHelper
{
 public static function generar(string $html, string $filename = 'documento.pdf'): void
 {
 $options = new Options();
 $options->set('isHtml5ParserEnabled', true);
 $options->set('isRemoteEnabled', false);
 $options->set('defaultFont', 'Helvetica');

 $dompdf = new Dompdf($options);
 $dompdf->loadHtml($html);
 $dompdf->setPaper('letter', 'portrait');
 $dompdf->render();

 $dompdf->stream($filename, ['Attachment' => true]);
 exit;
 }

 public static function concertacionPdf(array $concertacion, array $compromisos): string
 {
 $azul = '#0A2B5E';
 $rojo = '#C4282B';
 $verde = '#1E5A3C';
 $evaluado = $concertacion['evaluado_nombre'] ?? 'N/A';
 $documento = $concertacion['evaluado_documento'] ?? '';
 $cargo = $concertacion['evaluado_cargo'] ?? '';
 $entidad = $concertacion['entidad_nombre'] ?? '';
 $periodo = $concertacion['periodo_nombre'] ?? '';
 $estado = $concertacion['estado'] ?? '';
 $fecha = $concertacion['fecha_formalizacion'] ?? $concertacion['creado_en'] ?? '';

 $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
 body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; margin: 30px; color: #333; }
 .header { text-align: center; border-bottom: 3px solid {$azul}; padding-bottom: 10px; margin-bottom: 20px; }
 .header h1 { color: {$azul}; font-size: 14pt; margin: 0; }
 .header h2 { color: {$rojo}; font-size: 11pt; margin: 4px 0 0; }
 .info-grid { display: table; width: 100%; margin-bottom: 15px; }
 .info-row { display: table-row; }
 .info-cell { display: table-cell; padding: 4px 8px; border: 1px solid #ddd; }
 .info-label { font-weight: bold; background: #f5f5f5; width: 30%; color: {$azul}; }
 .section-title { color: {$azul}; font-size: 11pt; border-bottom: 2px solid {$verde}; padding-bottom: 4px; margin: 15px 0 8px; }
 table.compromisos { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9pt; }
 table.compromisos th { background: {$azul}; color: white; padding: 6px 8px; text-align: left; }
 table.compromisos td { border: 1px solid #ddd; padding: 5px 8px; }
 table.compromisos tr:nth-child(even) { background: #f9f9f9; }
 .firma-area { margin-top: 40px; display: table; width: 100%; }
 .firma-box { display: table-cell; width: 45%; text-align: center; padding: 0 10px; }
 .firma-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; font-size: 9pt; }
 .footer { text-align: center; font-size: 8pt; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 8px; }
</style>
</head>
<body>
 <div class="header">
 <h1>ALCALDIA DE CAREPA</h1>
 <h2>ACTA DE CONCERTACION DE COMPROMISOS</h2>
 </div>

 <div class="info-grid">
 <div class="info-row">
 <div class="info-cell info-label">Funcionario</div>
 <div class="info-cell">{$evaluado}</div>
 <div class="info-cell info-label">Documento</div>
 <div class="info-cell">{$documento}</div>
 </div>
 <div class="info-row">
 <div class="info-cell info-label">Cargo</div>
 <div class="info-cell">{$cargo}</div>
 <div class="info-cell info-label">Entidad</div>
 <div class="info-cell">{$entidad}</div>
 </div>
 <div class="info-row">
 <div class="info-cell info-label">Periodo</div>
 <div class="info-cell">{$periodo}</div>
 <div class="info-cell info-label">Estado</div>
 <div class="info-cell">{$estado}</div>
 </div>
 <div class="info-row">
 <div class="info-cell info-label">Fecha Formalizacion</div>
 <div class="info-cell">{$fecha}</div>
 <div class="info-cell info-label"></div>
 <div class="info-cell"></div>
 </div>
 </div>

 <div class="section-title">Compromisos Concertados</div>

 <table class="compromisos">
 <thead>
 <tr>
 <th>No.</th>
 <th>Tipo</th>
 <th>Descripcion</th>
 <th>Peso %</th>
 <th>Meta</th>
 </tr>
 </thead>
 <tbody>
HTML;

 $i = 1;
 foreach ($compromisos as $c) {
 $tipo = ucfirst($c['tipo'] ?? '');
 $desc = htmlspecialchars($c['descripcion'] ?? $c['texto_compromiso'] ?? '');
 $peso = ($c['peso'] ?? 0) . '%';
 $meta = htmlspecialchars($c['meta'] ?? $c['indicador'] ?? '');
 $html .= "<tr><td>{$i}</td><td>{$tipo}</td><td>{$desc}</td><td>{$peso}</td><td>{$meta}</td></tr>";
 $i++;
 }

 if (empty($compromisos)) {
 $html .= '<tr><td colspan="5" style="text-align:center;color:#999;">Sin compromisos registrados</td></tr>';
 }

 $html .= <<<HTML
 </tbody>
 </table>

 <div class="firma-area">
 <div class="firma-box">
 <div class="firma-line">EVALUADO<br>{$evaluado}</div>
 </div>
 <div class="firma-box">
 <div class="firma-line">JEFE INMEDIATO<br>________________________________</div>
 </div>
 </div>

 <div class="footer">
 Documento generado automaticamente por el Sistema EDL - Alcaldia de Carepa, Antioquia<br>
 Fecha de generacion: __DATE__
 </div>
</body>
</html>
HTML;

 return str_replace('__DATE__', date('d/m/Y H:i'), $html);
 }

 public static function evaluacionPdf(array $evaluacion, array $detalles): string
 {
 $azul = '#0A2B5E';
 $rojo = '#C4282B';
 $verde = '#1E5A3C';
 $evaluado = $evaluacion['evaluado_nombre'] ?? 'N/A';
 $documento = $evaluacion['evaluado_documento'] ?? '';
 $cargo = $evaluacion['evaluado_cargo'] ?? '';
 $tipo = ucfirst($evaluacion['tipo'] ?? '');
 $periodo = $evaluacion['periodo_nombre'] ?? '';
 $calDef = $evaluacion['calificacion_definitiva'] ?? 'N/A';
 $estado = $evaluacion['estado'] ?? '';

 $categoria = 'Sin calificacion';
 if (is_numeric($calDef)) {
 if ($calDef >= 4.5) $categoria = 'Superior';
 elseif ($calDef >= 3.5) $categoria = 'Sobresaliente';
 elseif ($calDef >= 3.0) $categoria = 'Satisfactorio';
 elseif ($calDef >= 2.0) $categoria = 'No Satisfactorio';
 }

 $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
 body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; margin: 30px; color: #333; }
 .header { text-align: center; border-bottom: 3px solid {$azul}; padding-bottom: 10px; margin-bottom: 20px; }
 .header h1 { color: {$azul}; font-size: 14pt; margin: 0; }
 .header h2 { color: {$rojo}; font-size: 11pt; margin: 4px 0 0; }
 .info-grid { display: table; width: 100%; margin-bottom: 15px; }
 .info-row { display: table-row; }
 .info-cell { display: table-cell; padding: 4px 8px; border: 1px solid #ddd; }
 .info-label { font-weight: bold; background: #f5f5f5; width: 30%; color: {$azul}; }
 .section-title { color: {$azul}; font-size: 11pt; border-bottom: 2px solid {$verde}; padding-bottom: 4px; margin: 15px 0 8px; }
 .calificacion-box { text-align: center; padding: 15px; border: 2px solid {$azul}; border-radius: 8px; margin: 15px 0; }
 .calificacion-numero { font-size: 28pt; font-weight: bold; color: {$azul}; }
 .calificacion-texto { font-size: 12pt; color: {$rojo}; font-weight: bold; }
 table.detalles { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9pt; }
 table.detalles th { background: {$azul}; color: white; padding: 6px 8px; text-align: left; }
 table.detalles td { border: 1px solid #ddd; padding: 5px 8px; }
 table.detalles tr:nth-child(even) { background: #f9f9f9; }
 .firma-area { margin-top: 40px; display: table; width: 100%; }
 .firma-box { display: table-cell; width: 30%; text-align: center; padding: 0 5px; }
 .firma-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; font-size: 8pt; }
 .footer { text-align: center; font-size: 8pt; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 8px; }
</style>
</head>
<body>
 <div class="header">
 <h1>ALCALDIA DE CAREPA</h1>
 <h2>ACTA DE EVALUACION DEL DESEMPENO LABORAL</h2>
 </div>

 <div class="info-grid">
 <div class="info-row">
 <div class="info-cell info-label">Funcionario</div>
 <div class="info-cell">{$evaluado}</div>
 <div class="info-cell info-label">Documento</div>
 <div class="info-cell">{$documento}</div>
 </div>
 <div class="info-row">
 <div class="info-cell info-label">Cargo</div>
 <div class="info-cell">{$cargo}</div>
 <div class="info-cell info-label">Tipo Evaluacion</div>
 <div class="info-cell">{$tipo}</div>
 </div>
 <div class="info-row">
 <div class="info-cell info-label">Periodo</div>
 <div class="info-cell">{$periodo}</div>
 <div class="info-cell info-label">Estado</div>
 <div class="info-cell">{$estado}</div>
 </div>
 </div>

 <div class="calificacion-box">
 <div class="calificacion-numero">{$calDef}</div>
 <div class="calificacion-texto">{$categoria}</div>
 </div>

 <div class="section-title">Detalle de la Evaluacion</div>

 <table class="detalles">
 <thead>
 <tr>
 <th>Competencia/Compromiso</th>
 <th>Tipo</th>
 <th>Peso %</th>
 <th>Calificacion</th>
 </tr>
 </thead>
 <tbody>
HTML;

 foreach ($detalles as $d) {
 $nombre = htmlspecialchars($d['nombre'] ?? $d['descripcion'] ?? '');
 $tipoD = ucfirst($d['tipo'] ?? '');
 $peso = ($d['peso'] ?? 0) . '%';
 $calif = $d['calificacion'] ?? $d['puntaje'] ?? 'N/A';
 $html .= "<tr><td>{$nombre}</td><td>{$tipoD}</td><td>{$peso}</td><td>{$calif}</td></tr>";
 }

 if (empty($detalles)) {
 $html .= '<tr><td colspan="4" style="text-align:center;color:#999;">Sin detalle disponible</td></tr>';
 }

 $html .= <<<HTML
 </tbody>
 </table>

 <div class="firma-area">
 <div class="firma-box">
 <div class="firma-line">EVALUADO<br>{$evaluado}</div>
 </div>
 <div class="firma-box">
 <div class="firma-line">EVALUADOR<br>________________________________</div>
 </div>
 <div class="firma-box">
 <div class="firma-line">COMISION DE EVALUACION<br>________________________________</div>
 </div>
 </div>

 <div class="footer">
 Documento generado automaticamente por el Sistema EDL - Alcaldia de Carepa, Antioquia<br>
 Fecha de generacion: __DATE__
 </div>
</body>
</html>
HTML;

 return str_replace('__DATE__', date('d/m/Y H:i'), $html);
 }
}
