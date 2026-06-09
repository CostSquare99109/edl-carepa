<?php

namespace App\Helper;

use Dompdf\Dompdf;
use Dompdf\Options;

class PdfHelper
{
 public static function generar(string $html, string $filename, bool $download = true): void
 {
  $options = new Options();
  $options->set('isHtml5ParserEnabled', true);
  $options->set('isRemoteEnabled', false);
  $options->set('defaultFont', 'Helvetica');

  $dompdf = new Dompdf($options);
  $dompdf->loadHtml($html);
  $dompdf->setPaper('letter', 'portrait');
  $dompdf->render();

  $dompdf->stream($filename, ['Attachment' => $download]);
 }

 public static function concertacionPdf(array $concertacion, array $compromisos): string
 {
  $fecha = date('d/m/Y', strtotime($concertacion['creado_en'] ?? 'now'));
  $periodo = htmlspecialchars($concertacion['periodo_nombre'] ?? '');
  $evaluado = htmlspecialchars(trim(($concertacion['evaluado_nombres'] ?? '') . ' ' . ($concertacion['evaluado_apellidos'] ?? '')));
  $evaluadoDoc = htmlspecialchars($concertacion['evaluado_documento'] ?? '');
  $evaluadoCargo = htmlspecialchars($concertacion['evaluado_cargo'] ?? '');
  $evaluadoDep = htmlspecialchars($concertacion['evaluado_dependencia'] ?? '');
  $evaluador = htmlspecialchars(trim(($concertacion['evaluador_nombres'] ?? '') . ' ' . ($concertacion['evaluador_apellidos'] ?? '')));
  $entidad = htmlspecialchars($concertacion['entidad_nombre'] ?? 'Alcaldia de Carepa');

  $compromisosHtml = '';
  foreach ($compromisos as $i => $c) {
   $tipo = $c['tipo'] === 'funcional' ? 'Compromiso Funcional' : 'Competencia Comportamental';
   $peso = $c['peso'] ?? 0;
   $desc = htmlspecialchars($c['descripcion'] ?? $c['competencia_nombre'] ?? '');
   $resultado = htmlspecialchars($c['resultado_esperado'] ?? '-');
   $medio = htmlspecialchars($c['medio_verificacion'] ?? '-');

   $compromisosHtml .= "
   <tr>
    <td style='border:1px solid #333;padding:6px;text-align:center;'>{$i}</td>
    <td style='border:1px solid #333;padding:6px;'>{$tipo}</td>
    <td style='border:1px solid #333;padding:6px;'>{$desc}</td>
    <td style='border:1px solid #333;padding:6px;text-align:center;'>{$peso}%</td>
    <td style='border:1px solid #333;padding:6px;'>{$resultado}</td>
    <td style='border:1px solid #333;padding:6px;'>{$medio}</td>
   </tr>";
  }

  return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
 body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; margin: 0; padding: 20px; color: #1a1a1a; }
 .header { text-align: center; border-bottom: 3px double #0A2B5E; padding-bottom: 10px; margin-bottom: 15px; }
 .header h1 { font-size: 14pt; color: #0A2B5E; margin: 0 0 3px; }
 .header h2 { font-size: 11pt; color: #0A2B5E; margin: 0 0 3px; font-weight: normal; }
 .header h3 { font-size: 10pt; color: #C4282B; margin: 0; font-weight: normal; }
 .datos { margin-bottom: 15px; }
 .datos table { width: 100%; border-collapse: collapse; }
 .datos td { padding: 4px 8px; border: 1px solid #ccc; font-size: 9pt; }
 .datos .label { background: #f0f0f0; font-weight: bold; width: 25%; color: #0A2B5E; }
 .titulo-seccion { background: #0A2B5E; color: white; padding: 6px 10px; font-size: 10pt; font-weight: bold; margin: 15px 0 0; }
 table.compromisos { width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 0; }
 table.compromisos th { background: #0A2B5E; color: white; padding: 6px; text-align: center; border: 1px solid #0A2B5E; }
 .firmas { margin-top: 40px; }
 .firmas table { width: 100%; }
 .firmas td { text-align: center; padding: 10px; vertical-align: top; }
 .firma-linea { border-top: 1px solid #333; width: 200px; margin: 40px auto 5px; }
 .firma-nombre { font-weight: bold; font-size: 9pt; }
 .firma-rol { font-size: 8pt; color: #555; }
 .footer { text-align: center; font-size: 7pt; color: #888; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 8px; }
</style>
</head>
<body>

<div class="header">
 <h1>{$entidad}</h1>
 <h2>ACTA DE CONCERTACION DE COMPROMISOS Y COMPETENCIAS</h2>
 <h3>Periodo: {$periodo}</h3>
</div>

<div class="datos">
 <table>
  <tr><td class="label">Evaluado</td><td>{$evaluado}</td><td class="label">Documento</td><td>{$evaluadoDoc}</td></tr>
  <tr><td class="label">Cargo</td><td>{$evaluadoCargo}</td><td class="label">Dependencia</td><td>{$evaluadoDep}</td></tr>
  <tr><td class="label">Evaluador</td><td>{$evaluador}</td><td class="label">Fecha</td><td>{$fecha}</td></tr>
 </table>
</div>

<div class="titulo-seccion">COMPROMISOS Y COMPETENCIAS CONCERTADAS</div>

<table class="compromisos">
 <thead>
  <tr>
   <th>No.</th>
   <th>Tipo</th>
   <th>Descripcion</th>
   <th>Peso</th>
   <th>Resultado Esperado</th>
   <th>Medio Verificacion</th>
  </tr>
 </thead>
 <tbody>
  {$compromisosHtml}
 </tbody>
</table>

<div class="firmas">
 <table>
  <tr>
   <td>
    <div class="firma-linea"></div>
    <div class="firma-nombre">{$evaluador}</div>
    <div class="firma-rol">Evaluador</div>
   </td>
   <td>
    <div class="firma-linea"></div>
    <div class="firma-nombre">{$evaluado}</div>
    <div class="firma-rol">Evaluado</div>
   </td>
  </tr>
 </table>
</div>

<div class="footer">
 Acta generada por el Sistema EDL-CAREPA - Alcaldia de Carepa, Antioquia<br>
 Documento sujeto a lo establecido en la Resolucion 1760 de 2010 de la CNSC
</div>

</body>
</html>
HTML;
 }

 public static function evaluacionPdf(array $evaluacion, array $compromisos, array $evidencias): string
 {
  $fecha = date('d/m/Y', strtotime($evaluacion['creado_en'] ?? 'now'));
  $evaluado = htmlspecialchars(trim(($evaluacion['evaluado_nombres'] ?? '') . ' ' . ($evaluacion['evaluado_apellidos'] ?? '')));
  $evaluadoDoc = htmlspecialchars($evaluacion['evaluado_documento'] ?? '');
  $evaluadoCargo = htmlspecialchars($evaluacion['evaluado_cargo'] ?? '');
  $evaluador = htmlspecialchars(trim(($evaluacion['evaluador_nombres'] ?? '') . ' ' . ($evaluacion['evaluador_apellidos'] ?? '')));
  $tipo = htmlspecialchars($evaluacion['tipo'] ?? '');
  $definitiva = $evaluacion['calificacion_definitiva'] ?? '-';
  $funcionales = $evaluacion['nota_funcionales'] ?? '-';
  $comportamentales = $evaluacion['nota_comportamentales'] ?? '-';
  $nivel = $evaluacion['nivel_resultado'] ?? '-';

  $nivelLabel = match($nivel) {
   'sobresaliente' => 'SOBRESALIENTE',
   'satisfactorio' => 'SATISFACTORIO',
   'no_satisfactorio' => 'NO SATISFACTORIO',
   default => strtoupper($nivel),
  };

  $compromisosHtml = '';
  foreach ($compromisos as $i => $c) {
   $calif = $c['calificacion'] ?? '-';
   $desc = htmlspecialchars($c['descripcion'] ?? $c['competencia_nombre'] ?? '');
   $compromisosHtml .= "<tr><td style='border:1px solid #333;padding:4px;text-align:center;'>{$i}</td><td style='border:1px solid #333;padding:4px;'>{$desc}</td><td style='border:1px solid #333;padding:4px;text-align:center;'>{$calif}</td></tr>";
  }

  return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
 body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; margin: 0; padding: 20px; color: #1a1a1a; }
 .header { text-align: center; border-bottom: 3px double #0A2B5E; padding-bottom: 10px; margin-bottom: 15px; }
 .header h1 { font-size: 14pt; color: #0A2B5E; margin: 0 0 3px; }
 .header h2 { font-size: 11pt; color: #0A2B5E; margin: 0; }
 .datos table { width: 100%; border-collapse: collapse; }
 .datos td { padding: 4px 8px; border: 1px solid #ccc; font-size: 9pt; }
 .datos .label { background: #f0f0f0; font-weight: bold; width: 25%; color: #0A2B5E; }
 .titulo-seccion { background: #0A2B5E; color: white; padding: 6px 10px; font-size: 10pt; font-weight: bold; margin: 15px 0 0; }
 .notas { margin: 15px 0; text-align: center; }
 .notas table { width: 80%; margin: 0 auto; border-collapse: collapse; }
 .notas td, .notas th { border: 1px solid #333; padding: 8px; text-align: center; }
 .notas th { background: #0A2B5E; color: white; }
 .nivel { font-size: 14pt; font-weight: bold; text-align: center; padding: 10px; margin: 10px 0; }
 .firmas { margin-top: 40px; }
 .firmas table { width: 100%; }
 .firmas td { text-align: center; padding: 10px; vertical-align: top; }
 .firma-linea { border-top: 1px solid #333; width: 200px; margin: 40px auto 5px; }
 .footer { text-align: center; font-size: 7pt; color: #888; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 8px; }
</style>
</head>
<body>

<div class="header">
 <h1>ACTA DE EVALUACION DEL DESEMPENO LABORAL</h1>
 <h2>Tipo: {$tipo}</h2>
</div>

<div class="datos">
 <table>
  <tr><td class="label">Evaluado</td><td>{$evaluado}</td><td class="label">Documento</td><td>{$evaluadoDoc}</td></tr>
  <tr><td class="label">Cargo</td><td>{$evaluadoCargo}</td><td class="label">Evaluador</td><td>{$evaluador}</td></tr>
  <tr><td class="label">Fecha</td><td>{$fecha}</td><td class="label"></td><td></td></tr>
 </table>
</div>

<div class="titulo-seccion">RESULTADO DE LA EVALUACION</div>

<div class="notas">
 <table>
  <tr><th>Funcionales (85%)</th><th>Comportamentales (15%)</th><th>Definitiva</th><th>Nivel</th></tr>
  <tr><td>{$funcionales}%</td><td>{$comportamentales}%</td><td>{$definitiva}%</td><td><strong>{$nivelLabel}</strong></td></tr>
 </table>
</div>

<div class="titulo-seccion">CALIFICACION DE COMPROMISOS</div>
<table style="width:100%;border-collapse:collapse;font-size:9pt;margin-top:0;">
 <thead><tr style="background:#0A2B5E;color:white;"><th style="padding:6px;border:1px solid #0A2B5E;">No.</th><th style="padding:6px;border:1px solid #0A2B5E;">Descripcion</th><th style="padding:6px;border:1px solid #0A2B5E;">Calificacion</th></tr></thead>
 <tbody>{$compromisosHtml}</tbody>
</table>

<div class="firmas">
 <table>
  <tr>
   <td><div class="firma-linea"></div><div style="font-weight:bold;font-size:9pt;">{$evaluador}</div><div style="font-size:8pt;color:#555;">Evaluador</div></td>
   <td><div class="firma-linea"></div><div style="font-weight:bold;font-size:9pt;">{$evaluado}</div><div style="font-size:8pt;color:#555;">Evaluado</div></td>
  </tr>
 </table>
</div>

<div class="footer">
 Acta generada por el Sistema EDL-CAREPA - Alcaldia de Carepa, Antioquia
</div>

</body>
</html>
HTML;
 }
}
