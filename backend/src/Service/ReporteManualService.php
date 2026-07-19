<?php
declare(strict_types=1);

namespace App\Service;

use App\Repository\CargoManualRepository;
use App\Config\Database;
use App\Helper\PdfHelper;
use App\Helper\ResponseHelper;

class ReporteManualService
{
 private CargoManualRepository $repo;

 public function __construct()
 {
  $pdo = Database::getInstance();
  $this->repo = new CargoManualRepository($pdo);
 }

 /**
  * Genera HTML para PDF de una ficha del Manual de Funciones
  * Usa Dompdf via PdfHelper
  */
 public function fichaHtml(int $cargoId): ?string
 {
  $cargo = $this->repo->buscarPorId($cargoId);
  if (!$cargo) {
   return null;
  }
  $detalle = $this->repo->detalle($cargoId);
  $requisitos = $this->repo->requisitos($cargoId);

  $seccionesHtml = '';
  $seccionesLabels = [
   'identificacion' => 'I. Identificacion',
   'proposito' => 'II. Proposito Principal',
   'funciones' => 'III. Funciones Esenciales',
   'contribuciones' => 'IV. Contribuciones Individuales',
   'conocimientos' => 'V. Conocimientos Basicos o Esenciales',
   'competencias' => 'VI. Competencias Comportamentales',
   'requisitos_estudio' => 'VII. Requisitos de Estudio',
   'requisitos_experiencia' => 'VII. Requisitos de Experiencia',
   'requisitos' => 'VII. Requisitos',
  ];

  foreach ($detalle as $d) {
   $titulo = $seccionesLabels[$d['seccion']] ?? $d['seccion'];
   $contenido = $d['contenido'];
   $esLista = false;
   $items = [];
   $textoPlano = is_string($contenido) ? $contenido : '';

   $decoded = json_decode((string) $contenido, true);
   if (is_array($decoded)) {
    $esLista = true;
    $items = $decoded;
    $textoPlano = '';
   }

   $seccionesHtml .= '<div class="seccion">';
   $seccionesHtml .= '<h2>' . htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') . '</h2>';
   if ($esLista) {
    $seccionesHtml .= '<ol>';
    foreach ($items as $item) {
     if (is_array($item)) {
      // Lista con sub-arreglo (ej. {"comunes":[...],"nivel":[...]})
      $seccionesHtml .= '<li><ul>';
      foreach ($item as $subKey => $subVal) {
       $label = is_string($subKey) ? htmlspecialchars($subKey, ENT_QUOTES, 'UTF-8') . ': ' : '';
       if (is_array($subVal)) {
        $seccionesHtml .= '<li>' . $label . htmlspecialchars(implode(', ', array_map('strval', $subVal)), ENT_QUOTES, 'UTF-8') . '</li>';
       } else {
        $seccionesHtml .= '<li>' . $label . htmlspecialchars((string) $subVal, ENT_QUOTES, 'UTF-8') . '</li>';
       }
      }
      $seccionesHtml .= '</ul></li>';
     } else {
      $seccionesHtml .= '<li>' . htmlspecialchars((string) $item, ENT_QUOTES, 'UTF-8') . '</li>';
     }
    }
    $seccionesHtml .= '</ol>';
   } else {
    $seccionesHtml .= '<p>' . htmlspecialchars($textoPlano, ENT_QUOTES, 'UTF-8') . '</p>';
   }
   $seccionesHtml .= '</div>';
  }

  // Pre-calcular variables para evitar problemas de LSP en heredoc
  $denominacion = htmlspecialchars($cargo['denominacion'], ENT_QUOTES, 'UTF-8');
  $codigoGrado = htmlspecialchars($cargo['codigo'] . '-' . $cargo['grado'], ENT_QUOTES, 'UTF-8');
  $dependencia = htmlspecialchars($cargo['dependencia_nombre'] ?? '', ENT_QUOTES, 'UTF-8');
  $nivel = htmlspecialchars($cargo['nivel'], ENT_QUOTES, 'UTF-8');
  $naturaleza = htmlspecialchars(str_replace('_', ' ', $cargo['naturaleza']), ENT_QUOTES, 'UTF-8');
  $planta = htmlspecialchars($cargo['planta'], ENT_QUOTES, 'UTF-8');
  $numCargos = (int) $cargo['num_cargos'];
  $fecha = date('d/m/Y H:i');
  $numCargosTxt = (string) $numCargos;
  $requisitosHtml = '';
  if (!empty($requisitos)) {
   $requisitosHtml .= '<div class="seccion"><h2>Requisitos Estructurados</h2><table border="1" cellpadding="4" cellspacing="0">';
   $requisitosHtml .= '<tr><th>Nivel</th><th>Titulo</th><th>NBC</th><th>Experiencia</th></tr>';
   foreach ($requisitos as $r) {
    $requisitosHtml .= '<tr>';
    $requisitosHtml .= '<td>' . htmlspecialchars($r['nivel_educativo'] ?? '', ENT_QUOTES, 'UTF-8') . '</td>';
    $requisitosHtml .= '<td>' . htmlspecialchars($r['titulo_requerido'] ?? '', ENT_QUOTES, 'UTF-8') . '</td>';
    $requisitosHtml .= '<td>' . htmlspecialchars(($r['area_conocimiento'] ?? '') . ' / ' . ($r['nbc'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>';
    $requisitosHtml .= '<td>' . (int)($r['experiencia_meses'] ?? 0) . ' meses (' . htmlspecialchars($r['experiencia_tipo'] ?? '', ENT_QUOTES, 'UTF-8') . ')</td>';
    $requisitosHtml .= '</tr>';
   }
   $requisitosHtml .= '</table></div>';
  }

  $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ficha Manual de Funciones - {$codigoGrado}</title>
<style>
body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #222; }
.header { border-bottom: 3px solid #0A2B5E; padding-bottom: 10px; margin-bottom: 15px; }
.header h1 { color: #0A2B5E; margin: 0; font-size: 16pt; }
.header .sub { color: #555; font-size: 9pt; margin-top: 4px; }
table.meta { width: 100%; margin-top: 10px; border-collapse: collapse; }
table.meta td { padding: 4px 8px; border: 1px solid #ccc; }
table.meta td.k { background: #f0f4fa; font-weight: bold; width: 25%; }
.seccion { margin-top: 12px; page-break-inside: avoid; }
.seccion h2 { color: #0A2B5E; font-size: 12pt; border-bottom: 1px solid #0A2B5E; padding-bottom: 3px; }
.seccion p, .seccion li { text-align: justify; line-height: 1.4; }
.footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 8pt; color: #666; text-align: center; }
table.req th { background: #0A2B5E; color: #fff; }
</style>
</head>
<body>

<div class="header">
  <h1>Manual de Funciones - {$denominacion}</h1>
  <div class="sub">Decreto 159 de 2024 - Anexo 01 - Municipio de Carepa | Codigo {$codigoGrado}</div>
</div>

<table class="meta">
  <tr>
    <td class="k">Dependencia</td><td>{$dependencia}</td>
    <td class="k">Nivel</td><td>{$nivel}</td>
  </tr>
  <tr>
    <td class="k">Naturaleza</td><td>{$naturaleza}</td>
    <td class="k">Planta</td><td>{$planta}</td>
  </tr>
  <tr>
    <td class="k">Num. Cargos</td><td>{$numCargosTxt}</td>
    <td class="k">Fuente</td><td>decreto_159_2024</td>
  </tr>
</table>

{$seccionesHtml}

{$requisitosHtml}

<div class="footer">
  Generado el {$fecha} - Sistema EDL Carepa - Alcaldia de Carepa
</div>

</body>
</html>
HTML;

  return $html;
 }
}