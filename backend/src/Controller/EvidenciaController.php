<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\EvidenciaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Config\Env;

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

 public function registrar(): void
 {
 $datos = SanitizerHelper::sanitizeArray($_POST);
 $archivo = $_FILES['archivo'] ?? null;
 $id = $this->service->registrar($datos, $archivo);
 ResponseHelper::success(['id' => $id, 'mensaje' => 'La creacion de la evidencia se realizo correctamente.'], 'Evidencia registrada', 201);
 }

 public function ver(int $id): void
 {
 $ev = $this->service->ver($id);
 ResponseHelper::success($ev);
 }

 public function actualizar(int $id): void
 {
 $datos = SanitizerHelper::sanitizeArray($_POST);
 if (empty($datos)) {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $datos = SanitizerHelper::sanitizeArray($input);
 }
 $archivo = $_FILES['archivo'] ?? null;
 $this->service->actualizar($id, $datos, $archivo);
 ResponseHelper::success(null, 'La evidencia se actualizo correctamente.');
 }

 public function eliminar(int $id): void
 {
 $this->service->eliminar($id);
 ResponseHelper::success(null, 'La evidencia se elimino correctamente.');
 }

 public function compromisosEvaluado(): void
 {
 $evaluadoId = (int) ($_GET['evaluado_id'] ?? 0);
 $periodoId = (int) ($_GET['periodo_id'] ?? 0);

 if ($evaluadoId <= 0 || $periodoId <= 0) {
 ResponseHelper::error('evaluado_id y periodo_id son obligatorios', 422);
 }

 $pdo = \App\Config\Database::getInstance();

 $stmtCon = $pdo->prepare("SELECT id, periodo_id, evaluado_id FROM concertaciones WHERE evaluado_id = ? AND periodo_id = ? AND eliminado_en IS NULL LIMIT 1");
 $stmtCon->execute([$evaluadoId, $periodoId]);
 $con = $stmtCon->fetch();

 if (!$con) {
 ResponseHelper::success(['data' => []]);
 }

 $stmt = $pdo->prepare("
 SELECT id, concertacion_id, tipo, descripcion, peso, estado, competencia_codigo, calificacion, propuesto_por_jefe_entidad, es_propuesto_evaluado
 FROM compromisos
 WHERE concertacion_id = ? AND eliminado_en IS NULL
 ORDER BY FIELD(tipo, 'funcional', 'comportamental'), id
 ");
 $stmt->execute([$con['id']]);
 $data = $stmt->fetchAll();

 ResponseHelper::success(['data' => $data]);
 }

 /**
  * GET /evaluadores/mis-evaluados
  * Retorna los evaluados asignados al evaluador actual para un periodo dado.
  */
 public function evaluadosAsignados(): void
 {
 $periodoId = (int) ($_GET['periodo_id'] ?? 0);
 $q = trim((string) ($_GET['q'] ?? ''));

 if (!$periodoId) {
 ResponseHelper::success(['data' => []]);
 return;
 }

 $user = \App\Middleware\AuthMiddleware::user();
 $evaluadorId = (int) $user['id'];
 $pdo = \App\Config\Database::getInstance();

 $sql = "
 SELECT DISTINCT u.id, u.documento, u.primer_nombre, u.segundo_nombre,
   u.primer_apellido, u.segundo_apellido,
   u.denominacion_empleo, u.grado_empleo,
   d.nombre AS dependencia_nombre,
   ev.id AS evaluacion_id, ev.concertacion_id
 FROM evaluaciones ev
 INNER JOIN usuarios u ON u.id = ev.evaluado_id
 LEFT JOIN dependencias d ON d.id = u.dependencia_id
 WHERE ev.evaluador_id = ?
   AND ev.periodo_id = ?
   AND ev.eliminado_en IS NULL
   AND u.eliminado_en IS NULL
   AND u.estado = 'activo'
 ";
 $params = [$evaluadorId, $periodoId];

 if ($q !== '') {
 $sql .= " AND (u.documento LIKE ? OR CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) LIKE ?)";
 $like = '%' . $q . '%';
 $params[] = $like;
 $params[] = $like;
 }

 $sql .= " ORDER BY u.primer_nombre ASC LIMIT 50";

 $stmt = $pdo->prepare($sql);
 $stmt->execute($params);
 $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

 $data = array_map(function ($r) {
 $nombre = trim(implode(' ', array_filter([$r['primer_nombre'] ?? '', $r['segundo_nombre'] ?? '', $r['primer_apellido'] ?? '', $r['segundo_apellido'] ?? ''])));
 return [
 'id' => (int) $r['id'],
 'documento' => $r['documento'],
 'nombre_completo' => $nombre,
 'denominacion_empleo' => $r['denominacion_empleo'],
 'dependencia_nombre' => $r['dependencia_nombre'],
 'evaluacion_id' => $r['evaluacion_id'] ? (int) $r['evaluacion_id'] : null,
 'concertacion_id' => $r['concertacion_id'] ? (int) $r['concertacion_id'] : null,
 ];
 }, $rows);

 ResponseHelper::success(['data' => $data]);
 }

 /**
  * GET /evidencias/archivo/{id} - Descarga binaria del archivo adjunto.
  */
 public function descargarArchivo(int $id): void
 {
 $root = Env::get('EDL_ROOT', dirname(__DIR__, 2));
 if (!defined('EDL_ROOT')) {
 $root = dirname(__DIR__, 2);
 }
 $this->service->descargarArchivo($id, $root);
 }

 /**
  * GET /evidencias/plantilla-carga - Devuelve una plantilla CSV para carga
  * masiva de evidencias (util para el administrador).
  */
 public function plantillaCarga(): void
 {
 $csv = "documento_evaluado;periodo_nombre;compromiso_id;tipo;descripcion;ubicacion;observacion;archivo\n";
 $csv .= "1040353165;2026-2027;5;compromiso;\"Documento X\";\"C:\\\\soportes\";\"Sin observaciones\";\"\" \n";
 header('Content-Type: text/csv; charset=utf-8');
 header('Content-Disposition: attachment; filename="plantilla_evidencias.csv"');
 echo $csv;
 exit;
 }

 /**
  * POST /evidencias/carga-masiva - Carga masiva a partir de CSV subido.
  */
 public function cargaMasiva(): void
 {
 $archivo = $_FILES['archivo'] ?? null;
 $evaluadoIdInput = $_POST['evaluado_id'] ?? null;
 $periodoIdInput = $_POST['periodo_id'] ?? null;

 if (!$archivo || ($archivo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
 ResponseHelper::error('Debe adjuntar un archivo CSV', 422);
 }
 $ext = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
 if ($ext !== 'csv') {
 ResponseHelper::error('Solo se aceptan archivos CSV', 422);
 }

 $fh = fopen($archivo['tmp_name'], 'r');
 if (!$fh) {
 ResponseHelper::error('No se pudo abrir el archivo subido', 500);
 }

 $cabecera = fgetcsv($fh, 0, ';');
 if (!$cabecera) {
 ResponseHelper::error('El archivo no tiene cabecera con columnas validas', 422);
 }

 $idx = array_flip(array_map(fn ($c) => strtolower(trim((string)$c)), $cabecera));

 $requeridas = ['documento_evaluado', 'periodo_nombre', 'compromiso_id', 'tipo', 'descripcion'];
 foreach ($requeridas as $req) {
 if (!isset($idx[$req])) {
 ResponseHelper::error("Falta la columna requerida '$req' en el CSV", 422);
 }
 }

 $pdo = \App\Config\Database::getInstance();
 $user = \App\Middleware\AuthMiddleware::user();

 $totalCargados = 0;
 $totalErrores = 0;
 $errores = [];
 $linea = 1;

 while (($fila = fgetcsv($fh, 0, ';')) !== false) {
 $linea++;
 $reg = [];
 foreach ($idx as $col => $pos) {
 $reg[$col] = $fila[$pos] ?? null;
 }
 $evaluadoDoc = trim((string) ($reg['documento_evaluado'] ?? ''));
 if (!$evaluadoDoc) {
 $totalErrores++;
 $errores[] = "Linea $linea: documento_evaluado vacio";
 continue;
 }
 $stmtE = $pdo->prepare("SELECT id FROM usuarios WHERE documento = ? AND eliminado_en IS NULL LIMIT 1");
 $stmtE->execute([$evaluadoDoc]);
 $u = $stmtE->fetch();
 if (!$u) {
 $totalErrores++;
 $errores[] = "Linea $linea: no existe usuario con documento $evaluadoDoc";
 continue;
 }
 $evaluadoId = (int) $u['id'];

 $periodoNombre = trim((string) ($reg['periodo_nombre'] ?? ''));
 $stmtP = $pdo->prepare("SELECT id FROM periodos WHERE nombre = ? AND eliminado_en IS NULL LIMIT 1");
 $stmtP->execute([$periodoNombre]);
 $p = $stmtP->fetch();
 $periodoId = $p ? (int) $p['id'] : (int) ($periodoIdInput ?? 0);
 if (!$periodoId) {
 $totalErrores++;
 $errores[] = "Linea $linea: periodo no encontrado";
 continue;
 }

 $stmtC = $pdo->prepare("SELECT id FROM concertaciones WHERE evaluado_id = ? AND periodo_id = ? AND eliminado_en IS NULL LIMIT 1");
 $stmtC->execute([$evaluadoId, $periodoId]);
 $con = $stmtC->fetch();
 if (!$con) {
 $totalErrores++;
 $errores[] = "Linea $linea: no existe concertacion";
 continue;
 }

 $compromisoId = (int) ($reg['compromiso_id'] ?? 0);
 if ($compromisoId <= 0) {
 $totalErrores++;
 $errores[] = "Linea $linea: compromiso_id invalido";
 continue;
 }

 $descripcion = trim((string) ($reg['descripcion'] ?? ''));
 if ($descripcion === '') {
 $totalErrores++;
 $errores[] = "Linea $linea: descripcion vacia";
 continue;
 }

 $ubicacion = trim((string) ($reg['ubicacion'] ?? '')) ?: 'Cargado por CSV';
 $observacion = trim((string) ($reg['observacion'] ?? '')) ?: null;
 $tipo = in_array(strtolower((string) $reg['tipo']), ['compromiso', 'competencia', 'general'])
 ? strtolower((string) $reg['tipo'])
 : 'compromiso';

 $stmtIns = $pdo->prepare("
 INSERT INTO evidencias (concertacion_id, compromiso_id, periodo_id, registrado_por, compromiso_competencia, descripcion, ubicacion, observacion, tipo, creado_en)
 SELECT ?, ?, ?, ?, c.descripcion, ?, ?, ?, ?, NOW()
 FROM compromisos c WHERE c.id = ?
 ");
 $stmtIns->execute([
 $con['id'], $compromisoId, $periodoId, $user['id'],
 $descripcion, $ubicacion, $observacion, $tipo,
 $compromisoId,
 ]);
 if ($stmtIns->rowCount() > 0) {
 $totalCargados++;
 } else {
 $totalErrores++;
 $errores[] = "Linea $linea: no se inserto (verifique compromiso_id $compromisoId)";
 }
 }
 fclose($fh);

 ResponseHelper::success([
 'total_cargados' => $totalCargados,
 'total_errores' => $totalErrores,
 'errores' => array_slice($errores, 0, 50),
 ]);
 }
}
