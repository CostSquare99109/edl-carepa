<?php

namespace App\Helper;

use Dompdf\Dompdf;
use Dompdf\Options;

if (!function_exists('romanNumerals')) {
    function romanNumerals(int $numero): string
    {
        $mapa = [
            1 => 'I', 4 => 'IV', 5 => 'V', 9 => 'IX',
            10 => 'X', 40 => 'XL', 50 => 'L', 90 => 'XC',
            100 => 'C', 400 => 'CD', 500 => 'D', 900 => 'CM',
            1000 => 'M',
        ];
        $resultado = '';
        foreach (array_reverse($mapa, true) as $valor => $simbolo) {
            while ($numero >= $valor) {
                $resultado .= $simbolo;
                $numero -= $valor;
            }
        }
        return $resultado;
    }
}

class PdfHelper
{
    public const COLOR_AZUL = '#0A2B5E';
    public const COLOR_TEXTO = '#1A1A1A';
    public const COLOR_GRIS = '#9E9E9E';
    public const COLOR_GRIS_CLARO = '#F2F2F2';
    public const COLOR_GRIS_LABEL = '#E8E8E8';
    public const COLOR_BORDE = '#7F7F7F';

    private static ?string $logoBase64 = null;
    private static ?string $cnscBase64 = null;

    public static function generar(string $html, string $filename, bool $download = true, string $idPie = ''): void
    {
        if (ob_get_level() > 0) {
            ob_end_clean();
        }

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('isPhpEnabled', false);
        $options->set('defaultFont', 'Helvetica');
        $options->set('defaultMediaType', 'print');
        $options->set('isFontSubsettingEnabled', true);
        $options->set('chroot', [
            dirname(__DIR__, 2),
            sys_get_temp_dir(),
        ]);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('letter', 'portrait');
        $dompdf->render();

        $idPieLimpio = html_entity_decode(strip_tags($idPie), ENT_QUOTES, 'UTF-8');
        if ($idPieLimpio === '') {
            $idPieLimpio = '';
        }

        $canvas = $dompdf->getCanvas();
        $fontMetrics = $dompdf->getFontMetrics();
        $fontBold = $fontMetrics->getFont('Helvetica', 'bold');
        $fontNorm = $fontMetrics->getFont('Helvetica', 'normal');
        $sizeSmall = 7;

        $canvas->page_script(function ($pageNumber, $pageCount, $canvas) use ($fontBold, $fontNorm, $sizeSmall, $idPieLimpio) {
            $w = $canvas->get_width();
            $h = $canvas->get_height();
            $azul = [0.04, 0.17, 0.37];
            $gris = [0.33, 0.33, 0.33];

            $lineY = $h - 32;
            $canvas->line(34, $lineY, $w - 34, $lineY, $gris, 0.5);

            if ($idPieLimpio !== '') {
                $canvas->text(34, $h - 22, $idPieLimpio, $fontBold, $sizeSmall, $azul);
            }

            $txt = 'Pagina ' . $pageNumber . ' de ' . $pageCount;
            $canvas->text($w - 90, $h - 22, $txt, $fontNorm, $sizeSmall, $gris);
        });

        $dompdf->stream($filename, ['Attachment' => $download]);
    }

    public static function logoBase64(): string
    {
        if (self::$logoBase64 !== null) {
            return self::$logoBase64;
        }
        $paths = [
            dirname(__DIR__, 2) . '/public/escudo.jpg',
            dirname(__DIR__, 2) . '/public/escudo.jpeg',
            dirname(__DIR__, 2) . '/public/escudo.png',
            dirname(__DIR__) . '/public/escudo.jpg',
            dirname(__DIR__) . '/public/escudo.png',
        ];
        foreach ($paths as $path) {
            if (is_file($path) && is_readable($path)) {
                $mime = self::mimeFromFile($path);
                self::$logoBase64 = 'data:' . $mime . ';base64,' . base64_encode((string) file_get_contents($path));
                return self::$logoBase64;
            }
        }
        self::$logoBase64 = '';
        return self::$logoBase64;
    }

    public static function cnscBase64(): string
    {
        if (self::$cnscBase64 !== null) {
            return self::$cnscBase64;
        }
        $paths = [
            dirname(__DIR__, 2) . '/public/cnsc.jpg',
            dirname(__DIR__, 2) . '/public/cnsc.jpeg',
            dirname(__DIR__, 2) . '/public/cnsc.png',
            dirname(__DIR__, 2) . '/public/cnsc.svg',
            dirname(__DIR__) . '/public/cnsc.jpg',
            dirname(__DIR__) . '/public/cnsc.png',
        ];
        foreach ($paths as $path) {
            if (is_file($path) && is_readable($path)) {
                $mime = self::mimeFromFile($path);
                self::$cnscBase64 = 'data:' . $mime . ';base64,' . base64_encode((string) file_get_contents($path));
                return self::$cnscBase64;
            }
        }
        self::$cnscBase64 = '';
        return self::$cnscBase64;
    }

    private static function mimeFromFile(string $path): string
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return match ($ext) {
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };
    }

    public static function formatoPorcentaje(mixed $valor, bool $conSigno = true): string
    {
        if ($valor === null || $valor === '' || $valor === false) {
            return '—';
        }
        if (is_string($valor)) {
            $valor = trim($valor);
            if ($valor === '' || strtolower($valor) === 'null') {
                return '—';
            }
        }
        if (!is_numeric($valor)) {
            return '—';
        }
        $num = (float) $valor;
        if (!is_finite($num)) {
            return '—';
        }
        return number_format($num, 2, '.', ',') . ($conSigno ? '%' : '');
    }

    public static function formatoNumero(mixed $valor, int $decimales = 2): string
    {
        if ($valor === null || $valor === '' || $valor === false) {
            return '—';
        }
        if (is_string($valor)) {
            $valor = trim($valor);
            if ($valor === '' || strtolower($valor) === 'null') {
                return '—';
            }
        }
        if (!is_numeric($valor)) {
            return '—';
        }
        $num = (float) $valor;
        if (!is_finite($num)) {
            return '—';
        }
        return number_format($num, $decimales, '.', ',');
    }

    public static function formatoTexto(mixed $valor, string $default = 'No aplica'): string
    {
        if ($valor === null || $valor === '' || $valor === false) {
            return $default;
        }
        $texto = trim((string) $valor);
        if ($texto === '' || strtolower($texto) === 'null') {
            return $default;
        }
        return $texto;
    }

    public static function formatoFecha(mixed $valor, string $default = '—'): string
    {
        if (empty($valor) || $valor === '0000-00-00' || $valor === '0000-00-00 00:00:00') {
            return $default;
        }
        $ts = is_numeric($valor) ? (int) $valor : strtotime((string) $valor);
        if (!$ts) {
            return $default;
        }
        return date('d/m/Y', $ts);
    }

    public static function formatoFechaHora(mixed $valor, string $default = '—'): string
    {
        if (empty($valor)) {
            return $default;
        }
        $ts = is_numeric($valor) ? (int) $valor : strtotime((string) $valor);
        if (!$ts) {
            return $default;
        }
        return date('d/m/Y H:i', $ts);
    }

    public static function formatoEnum(mixed $valor): string
    {
        $texto = self::formatoTexto($valor, '');
        if ($texto === '') {
            return '—';
        }
        $texto = str_replace('_', ' ', $texto);
        return mb_strtoupper($texto, 'UTF-8');
    }

    public static function formatoNivelJerarquico(mixed $nivel): string
    {
        $mapa = [
            'directivo' => 'Directivo',
            'asesor' => 'Asesor',
            'profesional' => 'Profesional',
            'tecnico' => 'Técnico',
            'asistencial' => 'Asistencial',
        ];
        $key = strtolower(self::formatoTexto($nivel, ''));
        if ($key === '') {
            return '—';
        }
        return $mapa[$key] ?? ucfirst($key);
    }

    public static function formatoTipoDocumento(mixed $tipo): string
    {
        $mapa = [
            'CC' => 'C.C.',
            'CE' => 'C.E.',
            'PA' => 'Pasaporte',
            'TI' => 'T.I.',
            'RC' => 'Registro Civil',
            'DIP' => 'D.I.P.',
            'NIT' => 'NIT',
        ];
        $key = strtoupper(self::formatoTexto($tipo, ''));
        if ($key === '') {
            return '—';
        }
        return $mapa[$key] ?? $key;
    }

    public static function formatoNombreCompleto(array $persona): string
    {
        $partes = array_filter([
            trim((string) ($persona['primer_nombre'] ?? '')),
            trim((string) ($persona['segundo_nombre'] ?? '')),
            trim((string) ($persona['primer_apellido'] ?? '')),
            trim((string) ($persona['segundo_apellido'] ?? '')),
        ], static fn($v) => $v !== '');
        return self::formatoTexto(implode(' ', $partes), 'No registra');
    }

    public static function formatoEstado(mixed $estado): string
    {
        $mapa = [
            'pendiente' => 'Pendiente',
            'en_proceso' => 'En proceso',
            'calificada' => 'Calificada',
            'aprobada_comision' => 'Aprobada por Comisión',
            'rechazada_comision' => 'Rechazada por Comisión',
            'cerrada' => 'Cerrada',
            'anulada' => 'Anulada',
            'aprobado' => 'Aprobado',
            'rechazado' => 'Rechazado',
            'devuelto' => 'Devuelto',
            'cumplido' => 'Cumplido',
            'incumplido' => 'Incumplido',
            'en_progreso' => 'En progreso',
            'pendiente_aprobacion' => 'Pendiente de aprobación',
            'propuesto' => 'Propuesto',
            'sobresaliente' => 'Sobresaliente',
            'satisfactorio' => 'Satisfactorio',
            'no_satisfactorio' => 'No satisfactorio',
            'si' => 'Sí',
            'no' => 'No',
            'moderadamente' => 'Moderadamente',
            'nunca' => 'Nunca',
            'algunas_veces' => 'Algunas veces',
            'frecuentemente' => 'Frecuentemente',
            'siempre' => 'Siempre',
            'bajo' => 'Bajo',
            'aceptable' => 'Aceptable',
            'alto' => 'Alto',
            'muy_alto' => 'Muy alto',
            'concertacion_bilateral' => 'Concertación bilateral',
            'concertacion_unilateral' => 'Concertación unilateral',
            'fijados_evaluador' => 'Fijados por el evaluador',
            'cambio_evaluador' => 'Cambio de evaluador',
            'retiro_empleado_responsable' => 'Retiro del empleado responsable de evaluar',
            'impedimento' => 'Impedimento',
            'recusacion' => 'Recusación',
        ];
        $key = strtolower(self::formatoTexto($estado, ''));
        if ($key === '') {
            return '—';
        }
        return $mapa[$key] ?? ucwords(str_replace('_', ' ', $key));
    }

    public static function formatoTipoEvaluacion(mixed $tipo): string
    {
        $mapa = [
            'parcial_primer_semestre' => 'Evaluación 1.er Semestre',
            'parcial_segundo_semestre' => 'Evaluación 2.do Semestre',
            'parcial_eventual' => 'Evaluación Parcial Eventual',
            'calificacion_definitiva' => 'Calificación Definitiva',
            'calificacion_extraordinaria' => 'Calificación Extraordinaria',
        ];
        return $mapa[strtolower(self::formatoTexto($tipo, ''))] ?? self::formatoTexto($tipo);
    }

    public static function formatoNivelResultado(mixed $nivel): string
    {
        $mapa = [
            'sobresaliente' => 'Sobresaliente',
            'satisfactorio' => 'Satisfactorio',
            'no_satisfactorio' => 'No satisfactorio',
        ];
        $key = strtolower(self::formatoTexto($nivel, ''));
        if ($key === '') {
            return '—';
        }
        return $mapa[$key] ?? self::formatoTexto($nivel);
    }

    private static function partesFecha(string $fechaIso): array
    {
        if (empty($fechaIso) || $fechaIso === '0000-00-00' || $fechaIso === '0000-00-00 00:00:00') {
            return ['—', '—', '—'];
        }
        $ts = strtotime($fechaIso);
        if (!$ts) {
            return ['—', '—', '—'];
        }
        return [
            date('d', $ts),
            date('m', $ts),
            (string) date('Y', $ts),
        ];
    }

    public static function estiloInstitucional(): string
    {
        $azul = self::COLOR_AZUL;
        $texto = self::COLOR_TEXTO;
        $gris = self::COLOR_GRIS;
        $grisClaro = self::COLOR_GRIS_CLARO;
        $grisLabel = self::COLOR_GRIS_LABEL;
        $borde = self::COLOR_BORDE;

        return <<<CSS
@page { margin: 12mm 12mm 28mm 12mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: {$texto}; font-size: 8pt; line-height: 1.25; background: #FFFFFF; }

.page-break { page-break-after: always; }
.no-break { page-break-inside: avoid; }

/* Header con logos izquierda y derecha */
table.hdr { width: 100%; border-collapse: collapse; margin-bottom: 3px; }
table.hdr td { vertical-align: middle; padding: 0; }
table.hdr td.logo { width: 20%; }
table.hdr td.logo img { width: 110px; height: auto; max-height: 55px; }
table.hdr td.tit { text-align: center; padding: 0 6px; }
table.hdr .t1 { font-size: 9.5pt; font-weight: bold; letter-spacing: 0.3px; }
table.hdr .t2 { font-size: 8.5pt; font-weight: bold; letter-spacing: 0.2px; margin-top: 2px; }
table.hdr .t3 { font-size: 8.5pt; font-weight: bold; letter-spacing: 0.2px; margin-top: 1px; }
table.hdr .t4 { font-size: 8pt; font-style: italic; letter-spacing: 0.2px; margin-top: 1px; }

/* Tabla de la entidad (banda gris) */
table.entidad { width: 100%; border-collapse: collapse; margin: 3px 0 0 0; }
table.entidad td { border: 1px solid {$borde}; padding: 4px 8px; text-align: center; font-weight: bold; font-size: 9.5pt; background-color: {$grisClaro}; color: {$texto}; text-transform: uppercase; letter-spacing: 0.5px; }

/* Tabla de período evaluación + fecha concertación */
table.periodo { width: 100%; border-collapse: collapse; margin-top: 0; }
table.periodo td { border: 1px solid {$borde}; padding: 2px 4px; text-align: center; vertical-align: middle; font-size: 7.5pt; background-color: #FFFFFF; color: {$texto}; }
table.periodo td.label { background-color: {$grisLabel}; font-weight: bold; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.2px; padding: 3px 2px; color: {$texto}; }
table.periodo td.al { width: 26px; font-weight: bold; background-color: #FFFFFF; font-size: 8.5pt; color: {$texto}; }
table.periodo td.fecha-label { font-size: 6.5pt; font-weight: bold; text-transform: uppercase; padding: 3px 2px; background-color: {$grisLabel}; color: {$texto}; }
table.periodo td.fechacell { font-size: 10pt; font-weight: bold; background-color: #FFFFFF; color: {$texto}; }
table.periodo td.dim { width: 3.5%; font-size: 6.5pt; font-weight: bold; color: #555; background-color: #FFFFFF; }

/* Titulo de seccion numerado (banda azul) */
.sec-title { background-color: {$azul}; color: #FFFFFF; text-align: center; font-weight: bold; font-size: 8.5pt; padding: 2px 8px; text-transform: uppercase; letter-spacing: 0.5px; margin: 3px 0 0 0; }
.sec-title-first { margin-top: 0; }
.sec-subtitle { background-color: {$grisLabel}; border: 1px solid {$borde}; border-top: none; text-align: center; font-size: 7.5pt; font-weight: bold; padding: 3px 8px; text-transform: uppercase; letter-spacing: 0.3px; }

/* Tabla principal de identificacion y datos */
table.id { width: 100%; border-collapse: collapse; margin-top: 0; }
table.id td { border: 1px solid {$borde}; padding: 1px 4px; vertical-align: middle; font-size: 7.5pt; background-color: #FFFFFF; color: {$texto}; }
table.id td.lbl { background-color: {$grisLabel}; font-weight: bold; text-align: center; font-size: 6pt; color: {$texto}; padding: 1px 2px; line-height: 1.1; }
table.id td.val { background-color: #FFFFFF; color: {$texto}; text-align: center; font-size: 8pt; min-height: 8px; line-height: 1.1; }
table.id td.val-left { background-color: #FFFFFF; color: {$texto}; text-align: left; font-size: 7.5pt; padding-left: 6px; line-height: 1.1; }
table.id td.merged { background-color: {$grisLabel}; color: {$texto}; text-align: center; font-weight: bold; font-size: 6.5pt; padding: 1px 2px; text-transform: uppercase; letter-spacing: 0.2px; line-height: 1.1; }

/* Column widths identificación */
table.id .c-tipo { width: 10%; }
table.id .c-num  { width: 17%; }
table.id .c-pap  { width: 22%; }
table.id .c-sap  { width: 22%; }
table.id .c-pnom { width: 17%; }
table.id .c-onom { width: 17%; }
table.id .c-niv  { width: 17%; }
table.id .c-dep  { width: 73%; }
table.id .c-cod  { width: 7%; }
table.id .c-grd  { width: 7%; }
table.id .c-den  { width: 60%; }
table.id .c-prop { width: 73%; }
table.id .c-mot  { width: 73%; }

/* Tabla de compromisos funcionales (formato CNSC) */
table.fn { width: 100%; border-collapse: collapse; margin-top: 0; page-break-inside: auto; }
table.fn th { background-color: {$grisLabel}; color: {$texto}; padding: 3px 4px; text-align: center; font-size: 7pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2px; border: 1px solid {$borde}; line-height: 1.2; }
table.fn td { border: 1px solid {$borde}; padding: 3px 5px; vertical-align: middle; font-size: 7.5pt; background-color: #FFFFFF; color: {$texto}; }
table.fn td.lbl { font-weight: bold; text-align: center; font-size: 7pt; background-color: {$grisLabel}; color: {$texto}; text-transform: uppercase; }
table.fn .col-comp { width: 85%; }
table.fn .col-peso { width: 15%; text-align: center; font-weight: bold; font-size: 9pt; }
table.fn .vacio { color: #888; font-style: italic; text-align: center; padding: 10px; background-color: #FFFFFF; }

/* Tabla de compromisos comportamentales (formato CNSC) */
table.cb { width: 100%; border-collapse: collapse; margin-top: 0; }
table.cb th { background-color: {$grisLabel}; color: {$texto}; padding: 3px 4px; text-align: center; font-size: 7pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2px; border: 1px solid {$borde}; }
table.cb td { border: 1px solid {$borde}; padding: 2px 5px; vertical-align: top; font-size: 7pt; background-color: #FFFFFF; color: {$texto}; }
table.cb tr { page-break-inside: avoid; }
table.cb .col-num { width: 6%; text-align: center; font-weight: bold; font-size: 12pt; vertical-align: middle; }
table.cb .col-comp { width: 79%; }
table.cb .col-prop { width: 15%; text-align: center; font-size: 8pt; }
table.cb .competencia-nombre { font-size: 8.5pt; font-weight: bold; margin-bottom: 2px; }
table.cb .competencia-decreto { font-size: 7.5pt; font-style: italic; color: #444; margin-bottom: 3px; }
table.cb .conductas-label { font-size: 7pt; font-weight: bold; text-align: center; text-transform: uppercase; border-top: 1px solid {$borde}; border-bottom: 1px solid {$borde}; padding: 2px; margin: 3px 0; background-color: {$grisClaro}; }
table.cb .conductas { font-size: 7.5pt; padding: 0 0 0 12px; margin: 3px 0 0 0; }
table.cb .conductas li { padding: 1px 0; }
table.cb .vacio { color: #888; font-style: italic; text-align: center; padding: 10px; background-color: #FFFFFF; }

/* Firmas */
table.firmas { width: 100%; border-collapse: collapse; margin-top: 4px; page-break-inside: avoid; }
table.firmas td { border: 1px solid {$borde}; padding: 4px 5px; vertical-align: bottom; text-align: center; background-color: #FFFFFF; color: {$texto}; }
table.firmas td.f-label { font-size: 7pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; background-color: {$grisLabel}; padding: 3px; color: {$texto}; }
table.firmas td.f-area { height: 65px; background-color: #FFFFFF; }
table.firmas td.f-data { font-size: 7.5pt; padding: 3px 5px; text-align: left; background-color: #FFFFFF; color: {$texto}; }
table.firmas .firma-col { width: 33.33%; }

/* Motivo ajuste compromisos */
table.motivo { width: 100%; border-collapse: collapse; margin-top: 0; }
table.motivo td { border: 1px solid {$borde}; padding: 4px 8px; vertical-align: middle; background-color: #FFFFFF; color: {$texto}; }
table.motivo td.lbl { background-color: {$grisLabel}; font-weight: bold; text-align: center; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.2px; color: {$texto}; }
table.motivo td.val { background-color: #FFFFFF; color: {$texto}; font-size: 8pt; text-align: left; }

/* Reclamacion */
table.rec { width: 100%; border-collapse: collapse; margin-top: 0; }
table.rec td { border: 1px solid {$borde}; padding: 4px 6px; vertical-align: middle; font-size: 7.5pt; background-color: #FFFFFF; color: {$texto}; }
table.rec td.lbl { background-color: {$grisLabel}; font-weight: bold; text-align: center; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.2px; color: {$texto}; }
table.rec td.val { background-color: #FFFFFF; color: {$texto}; text-align: center; font-size: 8.5pt; min-height: 12px; }
table.rec td.area { height: 42px; background-color: #FFFFFF; }
table.rec .c-rec { width: 35%; }
table.rec .c-dec { width: 30%; }
table.rec .c-mot { width: 35%; }

/* Helpers */
.tc { text-align: center; }
.tl { text-align: left; }
.tr { text-align: right; }
.muted { color: #888; font-style: italic; }
.small { font-size: 7pt; }
.bold { font-weight: bold; }
.upper { text-transform: uppercase; letter-spacing: 0.3px; }
CSS;
    }

    public static function idPie(array $base): string
    {
        $doc = self::formatoTexto($base['evaluado_documento'] ?? '');
        $apellido = self::formatoTexto($base['evaluado_apellidos'] ?? '');
        $nombre = self::formatoTexto($base['evaluado_nombres'] ?? '');
        $full = trim($apellido . ' ' . $nombre);
        $fullUpper = mb_strtoupper(preg_replace('/\s+/', '', $full), 'UTF-8');
        $docTxt = $doc !== '' ? ('C.C. ' . $doc) : 'C.C.';
        return trim($docTxt . ' - ' . $fullUpper);
    }

    public static function footerHtml(string $norma): string
    {
        $norma = htmlspecialchars($norma, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return <<<HTML
<div class="footer">
  <span class="sistema">Sistema EDL-CAREPA</span> — Alcaldía Municipal de Carepa, Antioquia<br>
  Documento generado electrónicamente. Tiene validez como soporte formal del proceso de Evaluación del Desempeño Laboral.<br>
  <span class="norma">Marco normativo: {$norma}</span>
</div>
HTML;
    }

    public static function headerHtml(string $tituloPrincipal = '', string $subtitulo = '', string $tipoProceso = ''): string
    {
        $escudo = self::logoBase64();

        if ($escudo !== '') {
            $logoHtml = '<img src="' . $escudo . '" alt="Alcaldía de Carepa" />';
        } else {
            $logoHtml = '<div style="border:1px solid #999;padding:6px;text-align:center;font-weight:bold;font-size:10pt;color:#0A2B5E;">CAREPA</div>';
        }

        $t1 = htmlspecialchars('ALCALDÍA DE CAREPA', ENT_QUOTES, 'UTF-8');
        $t2 = htmlspecialchars($tipoProceso !== '' ? $tipoProceso : 'SISTEMA EDL-CAREPA — EVALUACIÓN DEL DESEMPEÑO LABORAL', ENT_QUOTES, 'UTF-8');
        $t3 = htmlspecialchars($tituloPrincipal !== '' ? $tituloPrincipal : 'CONCERTACIÓN DE COMPROMISOS FUNCIONALES Y COMPORTAMENTALES', ENT_QUOTES, 'UTF-8');
        $t4 = htmlspecialchars($subtitulo, ENT_QUOTES, 'UTF-8');

        return <<<HTML
<table class="hdr">
  <tr>
    <td class="logo">{$logoHtml}</td>
    <td class="tit">
      <div class="t1">{$t1}</div>
      <div class="t2">{$t2}</div>
      <div class="t3">{$t3}</div>
      <div class="t4">{$t4}</div>
    </td>
    <td class="logo" style="text-align:right;">{$logoHtml}</td>
  </tr>
</table>
HTML;
    }

    public static function concertacionPdf(array $concertacion, array $compromisos): string
    {
        $css = self::estiloInstitucional();
        $header = self::headerHtml(
            'CONCERTACIÓN DE COMPROMISOS FUNCIONALES Y COMPORTAMENTALES',
            'PERÍODO DE PRUEBA',
            'PROCESO: EVALUACIÓN DEL DESEMPEÑO LABORAL'
        );

        $entidad = self::formatoTexto($concertacion['entidad_nombre'] ?? '', 'ALCALDÍA MUNICIPAL DE CAREPA — ANTIOQUIA');
        $entidadMayus = mb_strtoupper($entidad, 'UTF-8');

        $periodoInicio = self::partesFecha((string) ($concertacion['periodo_fecha_inicio'] ?? ''));
        $periodoFin = self::partesFecha((string) ($concertacion['periodo_fecha_fin'] ?? ''));
        $fechaConcert = self::partesFecha((string) ($concertacion['fecha_concertacion'] ?? ''));

        $entidadTabla = '<table class="entidad"><tr><td>' . htmlspecialchars($entidadMayus, ENT_QUOTES, 'UTF-8') . '</td></tr></table>';

        $periodoTabla = '<table class="periodo">'
            . '<tr>'
            . '<td class="label" style="width:14%;">PERÍODO EVALUACIÓN</td>'
            . '<td class="dim">DÍA</td><td class="fechacell">' . htmlspecialchars($periodoInicio[0], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">MES</td><td class="fechacell">' . htmlspecialchars($periodoInicio[1], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">AÑO</td><td class="fechacell">' . htmlspecialchars($periodoInicio[2], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="al">AL</td>'
            . '<td class="dim">DÍA</td><td class="fechacell">' . htmlspecialchars($periodoFin[0], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">MES</td><td class="fechacell">' . htmlspecialchars($periodoFin[1], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">AÑO</td><td class="fechacell">' . htmlspecialchars($periodoFin[2], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="fecha-label" style="width:14%;">FECHA CONCERTACIÓN DE COMPROMISOS</td>'
            . '<td class="dim">DÍA</td><td class="fechacell">' . htmlspecialchars($fechaConcert[0], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">MES</td><td class="fechacell">' . htmlspecialchars($fechaConcert[1], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">AÑO</td><td class="fechacell">' . htmlspecialchars($fechaConcert[2], ENT_QUOTES, 'UTF-8') . '</td>'
            . '</tr>'
            . '</table>';

        $evaluado = self::datosPersona($concertacion, 'evaluado');
        $evaluador = self::datosPersona($concertacion, 'evaluador');
        $comision = self::datosPersona($concertacion, 'comision');

        $sec1 = self::seccionIdentificacion('I. IDENTIFICACIÓN DEL EVALUADO', $evaluado, false);

        $motivoCambioTxt = '';
        if (!empty($concertacion['evaluador_no_jefe'])) {
            $motivoCambioTxt = self::formatoEstado($concertacion['motivo_no_jefe'] ?? '');
        }

        $sec2 = self::seccionIdentificacion('II. IDENTIFICACIÓN DEL EVALUADOR', $evaluador, true, $motivoCambioTxt);

        $sec3 = self::seccionIdentificacion('III. IDENTIFICACIÓN EVALUADOR (En caso de constituir Comisión Evaluadora)', $comision, true);

$sec4 = self::seccionCompromisosFuncionales($compromisos);

        $sec5 = self::seccionCompromisosComportamentales($compromisos);

        $motivoAjuste = self::seccionMotivoAjuste($compromisos);

        $firmas = self::seccionFirmas($concertacion, $evaluado, $evaluador);

        $reclamacion = self::seccionReclamacion();

        $evaluadoDoc = self::formatoTexto($concertacion['evaluado_documento'] ?? '');
        $evaluadoNombreCorto = mb_strtoupper(
            trim(($concertacion['evaluado_apellidos'] ?? '') . ' ' . ($concertacion['evaluado_nombres'] ?? '')),
            'UTF-8'
        );
        $idPie = 'C.C. ' . htmlspecialchars($evaluadoDoc, ENT_QUOTES, 'UTF-8') . ' - ' . htmlspecialchars($evaluadoNombreCorto, ENT_QUOTES, 'UTF-8');

        $idFormato = 'EDL-CONC-' . str_pad((string) ((int) ($concertacion['id'] ?? 0)), 5, '0', STR_PAD_LEFT);

        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Concertación — {$evaluado['nombre_completo']}</title>
<style>
{$css}
</style>
</head>
<body>

{$header}

{$entidadTabla}
{$periodoTabla}

{$sec1}
{$sec2}
{$sec3}
{$sec4}
{$sec5}

{$motivoAjuste}

{$firmas}
{$reclamacion}

</body>
</html>
HTML;
    }

    private static function datosPersona(array $base, string $prefijo): array
    {
        $tipoDoc = $base["{$prefijo}_tipo_documento"] ?? '';
        $doc = $base["{$prefijo}_documento"] ?? '';
        $pNom = $base["{$prefijo}_nombres"] ?? '';
        $sNom = $base["{$prefijo}_segundo_nombre"] ?? '';
        $pApe = $base["{$prefijo}_apellidos"] ?? '';
        $sApe = $base["{$prefijo}_segundo_apellido"] ?? '';

        return [
            'tipo_documento' => self::formatoTipoDocumento($tipoDoc),
            'documento' => self::formatoTexto($doc, '—'),
            'primer_apellido' => self::formatoTexto($pApe, '—'),
            'segundo_apellido' => self::formatoTexto($sApe, '—'),
            'primer_nombre' => self::formatoTexto($pNom, '—'),
            'otros_nombres' => self::formatoTexto($sNom, '—'),
            'nivel_jerarquico' => self::formatoNivelJerarquico($base["{$prefijo}_nivel"] ?? ''),
            'dependencia' => self::formatoTexto($base["{$prefijo}_dependencia"] ?? '—', '—'),
            'denominacion' => self::formatoTexto($base["{$prefijo}_cargo"] ?? '', '—'),
            'codigo' => self::formatoTexto($base["{$prefijo}_codigo"] ?? '', '—'),
            'grado' => self::formatoTexto($base["{$prefijo}_grado"] ?? '', '—'),
            'proposito' => self::formatoTexto($base["{$prefijo}_proposito"] ?? '', '—'),
            'nombre_completo' => self::formatoNombreCompleto([
                'primer_nombre' => $pNom,
                'segundo_nombre' => $sNom,
                'primer_apellido' => $pApe,
                'segundo_apellido' => $sApe,
            ]),
        ];
    }

    private static function seccionIdentificacion(string $titulo, array $p, bool $incluirMotivo, string $motivoCambio = ''): string
    {
        $tituloEsc = htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8');
        $rows = '';
        $rows .= '<tr>'
            . '<td class="lbl c-tipo">Tipo de Documento</td>'
            . '<td class="lbl c-num">Número de identificación</td>'
            . '<td class="lbl c-pap" colspan="2">Primer apellido</td>'
            . '<td class="lbl c-sap" colspan="2">Segundo apellido</td>'
            . '</tr>';
        $rows .= '<tr>'
            . '<td class="val c-tipo">' . htmlspecialchars($p['tipo_documento'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="val c-num">' . htmlspecialchars($p['documento'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="val c-pap" colspan="2">' . htmlspecialchars($p['primer_apellido'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="val c-sap" colspan="2">' . htmlspecialchars($p['segundo_apellido'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '</tr>';
        $rows .= '<tr>'
            . '<td class="lbl c-tipo">&nbsp;</td>'
            . '<td class="lbl c-num">Primer nombre</td>'
            . '<td class="lbl c-pnom" colspan="2">Otros nombres</td>'
            . '<td class="lbl c-sap" colspan="2">Nivel jerárquico</td>'
            . '</tr>';
        $rows .= '<tr>'
            . '<td class="val c-tipo">&nbsp;</td>'
            . '<td class="val c-num">' . htmlspecialchars($p['primer_nombre'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="val c-pnom" colspan="2">' . htmlspecialchars($p['otros_nombres'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="val c-sap" colspan="2">' . htmlspecialchars($p['nivel_jerarquico'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '</tr>';

        $rows .= '<tr><td class="merged c-dep" colspan="6">'
            . ($titulo === 'I. IDENTIFICACIÓN DEL EVALUADO'
                ? 'Dependencia o área a la que pertenece el evaluado'
                : 'Área o Dependencia a la que pertenece el evaluador')
            . '</td></tr>';
        $rows .= '<tr><td class="val c-dep" colspan="6">' . htmlspecialchars($p['dependencia'], ENT_QUOTES, 'UTF-8') . '</td></tr>';

        $rows .= '<tr>'
            . '<td class="merged c-den" colspan="3">Denominación del empleo</td>'
            . '<td class="lbl c-cod">Código</td>'
            . '<td class="merged" style="width:5%;">&nbsp;</td>'
            . '<td class="lbl c-grd">Grado</td>'
            . '</tr>';
        $rows .= '<tr>'
            . '<td class="val c-den" colspan="3">' . htmlspecialchars($p['denominacion'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="val c-cod">' . htmlspecialchars($p['codigo'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="val" style="width:5%;">&nbsp;</td>'
            . '<td class="val c-grd">' . htmlspecialchars($p['grado'], ENT_QUOTES, 'UTF-8') . '</td>'
            . '</tr>';

        $rows .= '<tr><td class="merged c-prop" colspan="6">Propósito del empleo</td></tr>';
        $rows .= '<tr><td class="val-left c-prop" colspan="6">' . htmlspecialchars($p['proposito'], ENT_QUOTES, 'UTF-8') . '</td></tr>';

        if ($incluirMotivo) {
            $rows .= '<tr><td class="merged c-mot" colspan="6">Motivo cambio de evaluador</td></tr>';
            $rows .= '<tr><td class="val-left c-mot" colspan="6">' . htmlspecialchars($motivoCambio !== '' ? $motivoCambio : '—', ENT_QUOTES, 'UTF-8') . '</td></tr>';
        }

        $html = '<div class="sec-title">' . $tituloEsc . '</div>'
            . '<table class="id">' . $rows . '</table>';

        return $html;
    }

    private static function seccionCompromisosFuncionales(array $compromisos): string
    {
        $funcionales = array_values(array_filter($compromisos, static fn($c) => ($c['tipo'] ?? '') === 'funcional'));

        $rows = '';
        if (empty($funcionales)) {
            $rows = '<tr><td colspan="2" class="vacio">No se han registrado compromisos funcionales.</td></tr>';
        } else {
            foreach ($funcionales as $f) {
                $descripcion = self::formatoTexto($f['descripcion'] ?? '', '—');
                $peso = self::formatoPorcentaje($f['peso'] ?? null);
                $descripcionHtml = '<div style="font-size:8pt;line-height:1.3;text-align:left;">' . nl2br(htmlspecialchars($descripcion, ENT_QUOTES, 'UTF-8')) . '</div>';
                $rows .= '<tr>'
                    . '<td class="col-comp">' . $descripcionHtml . '</td>'
                    . '<td class="col-peso">' . htmlspecialchars($peso, ENT_QUOTES, 'UTF-8') . '</td>'
                    . '</tr>';
            }
        }

        $cabecera = '<table class="fn">'
            . '<thead><tr>'
            . '<th class="col-comp">COMPROMISOS FUNCIONALES</th>'
            . '<th class="col-peso">Peso porcentual del compromiso</th>'
            . '</tr></thead>'
            . '<tbody>' . $rows . '</tbody>'
            . '</table>';

        return '<div class="sec-title">IV. CONCERTACIÓN DE COMPROMISOS FUNCIONALES</div>' . $cabecera;
    }

    private static function seccionCompromisosComportamentales(array $compromisos): string
    {
        $comportamentales = array_values(array_filter($compromisos, static fn($c) => ($c['tipo'] ?? '') === 'comportamental'));

        $rows = '';
        if (empty($comportamentales)) {
            $rows = '<tr><td colspan="3" class="vacio">No se han registrado compromisos comportamentales.</td></tr>';
        } else {
            $ordenCodigos = [];
            foreach ($comportamentales as $co) {
                $cod = (string) ($co['competencia_codigo'] ?? '');
                if ($cod === '') {
                    $cod = 'GENERAL';
                }
                if (!isset($ordenCodigos[$cod])) {
                    $ordenCodigos[$cod] = [
                        'primer_item' => $co,
                        'nombre' => $co['competencia_nombre'] ?? self::formatoTexto($co['descripcion'] ?? '', 'Competencia'),
                        'decreto' => $co['competencia_decreto'] ?? '',
                        'propuesto_jefe' => !empty($co['propuesto_por_jefe_entidad']),
                        'conductas' => [],
                    ];
                }
                if (!empty($co['conductas']) && empty($ordenCodigos[$cod]['conductas'])) {
                    foreach ($co['conductas'] as $cnd) {
                        $ordenCodigos[$cod]['conductas'][] = $cnd;
                    }
                }
            }

            $num = 1;
            foreach ($ordenCodigos as $cod => $info) {
                $nombre = htmlspecialchars(self::formatoTexto($info['nombre'], 'Competencia'), ENT_QUOTES, 'UTF-8');
                $decretoRaw = self::formatoTexto($info['decreto'], '—');
                $decretoTxt = $decretoRaw !== '—' ? 'Decreto ' . htmlspecialchars($decretoRaw, ENT_QUOTES, 'UTF-8') : '';
                $propuestoTxt = $info['propuesto_jefe'] ? 'Sí' : '—';

                $competenciaCell = '<div class="competencia-nombre">' . $nombre . '</div>';
                if ($decretoTxt !== '') {
                    $competenciaCell .= '<div class="competencia-decreto">' . $decretoTxt . '</div>';
                }
                $competenciaCell .= '<div class="conductas-label">CONDUCTAS ASOCIADAS</div>';
                if (!empty($info['conductas'])) {
                    $competenciaCell .= '<ul class="conductas">';
                    foreach ($info['conductas'] as $cnd) {
                        $texto = self::formatoTexto($cnd['texto'] ?? '');
                        $competenciaCell .= '<li>' . htmlspecialchars($texto, ENT_QUOTES, 'UTF-8') . '</li>';
                    }
                    $competenciaCell .= '</ul>';
                } else {
                    $competenciaCell .= '<div class="muted small" style="padding:4px 0 0 0;">Sin conductas registradas.</div>';
                }

                $rows .= '<tr>'
                    . '<td class="col-num">' . $num . '</td>'
                    . '<td class="col-comp">' . $competenciaCell . '</td>'
                    . '<td class="col-prop">' . htmlspecialchars($propuestoTxt, ENT_QUOTES, 'UTF-8') . '</td>'
                    . '</tr>';
                $num++;
            }
        }

        $cabecera = '<table class="cb">'
            . '<thead><tr>'
            . '<th class="col-num">No.</th>'
            . '<th class="col-comp">COMPETENCIAS</th>'
            . '<th class="col-prop">Propuesto Jefe Entidad</th>'
            . '</tr></thead>'
            . '<tbody>' . $rows . '</tbody>'
            . '</table>';

        return '<div class="sec-title">V. CONCERTACIÓN DE COMPROMISOS COMPORTAMENTALES</div>' . $cabecera;
    }

    private static function seccionMotivoAjuste(array $compromisos): string
    {
        $motivos = [];
        foreach ($compromisos as $c) {
            if (!empty($c['motivo_ajuste'])) {
                $txt = self::formatoEstado($c['motivo_ajuste']);
                if ($txt !== '' && $txt !== '—' && !in_array($txt, $motivos, true)) {
                    $motivos[] = $txt;
                }
            }
        }
        $valor = empty($motivos) ? '—' : implode('; ', $motivos);

        $html = '<table class="motivo">'
            . '<tr>'
            . '<td class="lbl" style="width:35%;">Motivo Ajuste Compromisos</td>'
            . '<td class="val" style="width:65%;">' . htmlspecialchars($valor, ENT_QUOTES, 'UTF-8') . '</td>'
            . '</tr>'
            . '</table>';
        return $html;
    }

    private static function seccionFirmas(array $concertacion, array $evaluado, array $evaluador): string
    {
        $testigo = [
            'tipo_documento' => self::formatoTipoDocumento($concertacion['testigo_tipo_documento'] ?? ''),
            'documento' => self::formatoTexto($concertacion['testigo_documento'] ?? '', '—'),
            'nombre' => self::formatoNombreCompleto([
                'primer_nombre' => $concertacion['testigo_nombres'] ?? '',
                'segundo_nombre' => $concertacion['testigo_segundo_nombre'] ?? '',
                'primer_apellido' => $concertacion['testigo_apellidos'] ?? '',
                'segundo_apellido' => $concertacion['testigo_segundo_apellido'] ?? '',
            ]),
        ];

        $fechaTestigo = self::formatoFecha($concertacion['fecha_testigo'] ?? null);
        $ausenciaTxt = '';
        if (!empty($concertacion['conformar_comision_evaluadora']) || !empty($concertacion['motivo_fijacion_unilateral']) || (($concertacion['tipo_concertacion'] ?? '') === 'fijados_evaluador')) {
            $ausenciaTxt = 'Ausencia de concertación (El evaluador procederá a fijarlos)';
        }

        $firmasTop = '<table class="firmas">'
            . '<tr>'
            . '<td class="f-label firma-col">FIRMA DEL EVALUADO</td>'
            . '<td class="f-label firma-col">FIRMA DEL JEFE INMEDIATO</td>'
            . '<td class="f-label firma-col">FIRMA DEL EVALUADOR EN COMISIÓN EVALUADORA</td>'
            . '</tr>'
            . '<tr>'
            . '<td class="f-area firma-col">&nbsp;</td>'
            . '<td class="f-area firma-col">&nbsp;</td>'
            . '<td class="f-area firma-col">&nbsp;</td>'
            . '</tr>'
            . '</table>';

        $testigoTabla = '<table class="firmas" style="margin-top:6px;">'
            . '<tr>'
            . '<td class="f-label" style="width:18%;">' . ($ausenciaTxt !== '' ? $ausenciaTxt : 'Ausencia de concertación (El evaluador procederá a fijarlos)') . '</td>'
            . '<td class="f-label">DATOS DEL TESTIGO</td>'
            . '<td class="f-label" style="width:22%;">FIRMA DEL TESTIGO</td>'
            . '<td class="f-label" style="width:10%;">FECHA</td>'
            . '</tr>'
            . '<tr>'
            . '<td class="f-area" style="width:18%;">&nbsp;</td>'
            . '<td class="f-data">&nbsp;</td>'
            . '<td class="f-area" style="width:22%;">&nbsp;</td>'
            . '<td class="f-area tc" style="width:10%;">&nbsp;</td>'
            . '</tr>'
            . '</table>';

        return '<div class="sec-title">VI. FIRMAS</div>' . $firmasTop . $testigoTabla;
    }

    private static function seccionReclamacion(): string
    {
        $html = '<div class="sec-title">VII. RECLAMACIÓN</div>'
            . '<table class="rec">'
            . '<tr>'
            . '<td class="lbl c-rec">RECLAMACIÓN EN ÚNICA INSTANCIA ANTE LA COMISIÓN DE PERSONAL (Parágrafo del artículo 3°, del Acuerdo 617 de 2018)</td>'
            . '<td class="lbl c-dec">DECISIÓN DE LA COMISIÓN DE PERSONAL</td>'
            . '<td class="lbl c-mot">MOTIVACIÓN DE LA DECISIÓN</td>'
            . '</tr>'
            . '<tr>'
            . '<td class="area c-rec">&nbsp;</td>'
            . '<td class="area c-dec">&nbsp;</td>'
            . '<td class="area c-mot">&nbsp;</td>'
            . '</tr>'
            . '<tr>'
            . '<td class="lbl">Número de Radicado</td>'
            . '<td class="val" colspan="2">&nbsp;</td>'
            . '</tr>'
            . '<tr>'
            . '<td class="lbl">Fecha Reclamación</td>'
            . '<td class="val" colspan="2">&nbsp;</td>'
            . '</tr>'
            . '</table>';

        return $html;
    }

    public static function evaluacionPdf(array $evaluacion, array $detalles): string
    {
        $css = self::estiloInstitucional();
        $header = self::headerHtml(
            'CONCERTACIÓN DE COMPROMISOS FUNCIONALES Y COMPORTAMENTALES',
            'PERÍODO DE PRUEBA',
            'PROCESO: EVALUACIÓN DEL DESEMPEÑO LABORAL'
        );

        $entidad = self::formatoTexto($evaluacion['entidad_nombre'] ?? '', 'ALCALDÍA MUNICIPAL DE CAREPA — ANTIOQUIA');
        $entidadMayus = mb_strtoupper($entidad, 'UTF-8');

        $periodoInicio = self::partesFecha((string) ($evaluacion['periodo_fecha_inicio'] ?? ''));
        $periodoFin = self::partesFecha((string) ($evaluacion['periodo_fecha_fin'] ?? ''));
        $fechaConcert = self::partesFecha((string) ($evaluacion['fecha_calificacion'] ?? ''));

        $entidadTabla = '<table class="entidad"><tr><td>' . htmlspecialchars($entidadMayus, ENT_QUOTES, 'UTF-8') . '</td></tr></table>';

        $periodoTabla = '<table class="periodo">'
            . '<tr>'
            . '<td class="label" style="width:14%;">PERÍODO EVALUACIÓN</td>'
            . '<td class="dim">DÍA</td><td class="fechacell">' . htmlspecialchars($periodoInicio[0], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">MES</td><td class="fechacell">' . htmlspecialchars($periodoInicio[1], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">AÑO</td><td class="fechacell">' . htmlspecialchars($periodoInicio[2], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="al">AL</td>'
            . '<td class="dim">DÍA</td><td class="fechacell">' . htmlspecialchars($periodoFin[0], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">MES</td><td class="fechacell">' . htmlspecialchars($periodoFin[1], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">AÑO</td><td class="fechacell">' . htmlspecialchars($periodoFin[2], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="fecha-label" style="width:14%;">FECHA CONCERTACIÓN DE COMPROMISOS</td>'
            . '<td class="dim">DÍA</td><td class="fechacell">' . htmlspecialchars($fechaConcert[0], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">MES</td><td class="fechacell">' . htmlspecialchars($fechaConcert[1], ENT_QUOTES, 'UTF-8') . '</td>'
            . '<td class="dim">AÑO</td><td class="fechacell">' . htmlspecialchars($fechaConcert[2], ENT_QUOTES, 'UTF-8') . '</td>'
            . '</tr>'
            . '</table>';

        $evaluado = self::datosPersona($evaluacion, 'evaluado');
        $evaluador = self::datosPersona($evaluacion, 'evaluador');
        $comision = self::datosPersona($evaluacion, 'comision');

        $sec1 = self::seccionIdentificacion('I. IDENTIFICACIÓN DEL EVALUADO', $evaluado, false);
        $sec2 = self::seccionIdentificacion('II. IDENTIFICACIÓN DEL EVALUADOR', $evaluador, true, '');
        $sec3 = self::seccionIdentificacion('III. IDENTIFICACIÓN EVALUADOR (En caso de constituir Comisión Evaluadora)', $comision, true);

        $sec4 = self::seccionCompromisosFuncionales($detalles);
        $sec5 = self::seccionCompromisosComportamentales($detalles);

        $motivoAjuste = self::seccionMotivoAjuste($detalles);

        $firmas = self::seccionFirmasEvaluacion($evaluacion, $evaluado, $evaluador);
        $reclamacion = self::seccionReclamacion();

        $evaluadoDoc = self::formatoTexto($evaluacion['evaluado_documento'] ?? '');
        $evaluadoNombreCorto = mb_strtoupper(
            trim(($evaluacion['evaluado_apellidos'] ?? '') . ' ' . ($evaluacion['evaluado_nombres'] ?? '')),
            'UTF-8'
        );
        $idPie = 'C.C. ' . htmlspecialchars($evaluadoDoc, ENT_QUOTES, 'UTF-8') . ' - ' . htmlspecialchars($evaluadoNombreCorto, ENT_QUOTES, 'UTF-8');

        $idFormato = 'EDL-EVAL-' . str_pad((string) ((int) ($evaluacion['id'] ?? 0)), 5, '0', STR_PAD_LEFT);

        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Evaluación — {$evaluado['nombre_completo']}</title>
<style>
{$css}
</style>
</head>
<body>

{$header}

{$entidadTabla}
{$periodoTabla}

{$sec1}
{$sec2}
{$sec3}
{$sec4}
{$sec5}

{$motivoAjuste}

{$firmas}
{$reclamacion}

</body>
</html>
HTML;
    }

    private static function seccionFirmasEvaluacion(array $evaluacion, array $evaluado, array $evaluador): string
    {
        $firmasTop = '<table class="firmas">'
            . '<tr>'
            . '<td class="f-label firma-col">FIRMA DEL EVALUADO</td>'
            . '<td class="f-label firma-col">FIRMA DEL JEFE INMEDIATO</td>'
            . '<td class="f-label firma-col">FIRMA DEL EVALUADOR EN COMISIÓN EVALUADORA</td>'
            . '</tr>'
            . '<tr>'
            . '<td class="f-area firma-col">&nbsp;</td>'
            . '<td class="f-area firma-col">&nbsp;</td>'
            . '<td class="f-area firma-col">&nbsp;</td>'
            . '</tr>'
            . '</table>';

        $testigoTabla = '<table class="firmas" style="margin-top:6px;">'
            . '<tr>'
            . '<td class="f-label" style="width:18%;">Ausencia de concertación (El evaluador procederá a fijarlos)</td>'
            . '<td class="f-label">DATOS DEL TESTIGO</td>'
            . '<td class="f-label" style="width:22%;">FIRMA DEL TESTIGO</td>'
            . '<td class="f-label" style="width:10%;">FECHA</td>'
            . '</tr>'
            . '<tr>'
            . '<td class="f-area" style="width:18%;">&nbsp;</td>'
            . '<td class="f-data">&nbsp;</td>'
            . '<td class="f-area" style="width:22%;">&nbsp;</td>'
            . '<td class="f-area tc" style="width:10%;">&nbsp;</td>'
            . '</tr>'
            . '</table>';

        return '<div class="sec-title">VI. FIRMAS</div>' . $firmasTop . $testigoTabla;
    }
}