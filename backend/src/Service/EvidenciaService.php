<?php

namespace App\Service;

use App\Repository\EvidenciaRepository;
use App\Helper\ResponseHelper;
use App\Helper\UploadHelper;
use App\Config\Database;
use App\Middleware\AuthMiddleware;

class EvidenciaService
{
 private EvidenciaRepository $evidenciaRepo;

 public function __construct()
 {
  $pdo = Database::getInstance();
  $this->evidenciaRepo = new EvidenciaRepository($pdo);
 }

 public function listar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();

  if (in_array($rolActivo, ['evaluador', 'evaluado'])) {
   $filtros['registrado_por'] = $user['id'];
  }

  return $this->evidenciaRepo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 /**
  * Registra una evidencia (descriptiva, con archivo adjunto opcional).
  *
  * Acepta:
  *  - descripcion      (obligatoria)
  *  - compromiso_id    (obligatorio)
  *  - periodo_id       (obligatorio)
  *  - ubicacion        (opcional; fisica o virtual. Si llega vacia pero hay archivo,
  *                      se autocompleta con "Archivo adjunto: <nombre>")
  *  - observacion      (opcional)
  *  - tipo             (opcional: 'compromiso' | 'competencia' | 'general')
  *  - archivo (file)   (opcional: foto, PDF, Word, Excel, etc.)
  */
 public function registrar(array $datos, ?array $archivo = null): int
 {
  $user = AuthMiddleware::user();

  $compromisoId = (int) ($datos['compromiso_id'] ?? 0);
  $descripcion = trim($datos['descripcion'] ?? '');
  $ubicacion = trim($datos['ubicacion'] ?? '');
  $periodoId = (int) ($datos['periodo_id'] ?? 0);
  $observacion = trim($datos['observacion'] ?? '');
  $tipo = $datos['tipo'] ?? 'compromiso';

  if ($compromisoId <= 0) {
  ResponseHelper::error('Debe seleccionar un compromiso o competencia', 400);
  }
  if ($descripcion === '') {
  ResponseHelper::error('La descripción es obligatoria', 400);
  }
  if ($periodoId <= 0) {
  ResponseHelper::error('Debe seleccionar el periodo de evaluación', 400);
  }

  $archivoPath = null;
  $archivoNombre = null;
  $archivoMime = null;
  $archivoTamano = null;
  if ($archivo && !empty($archivo['name']) && is_string($archivo['tmp_name']) && is_uploaded_file($archivo['tmp_name'])) {
   $validado = UploadHelper::validar($archivo);
   $archivoPath = UploadHelper::guardar($archivo, 'evidencias');
   $archivoNombre = $validado['original_name'];
   $archivoMime = $validado['mime_type'];
   $archivoTamano = (int) $validado['size'];

   if ($ubicacion === '') {
    $ubicacion = 'Archivo adjunto: ' . $archivoNombre;
   }
  }

  if ($ubicacion === '') {
   if ($archivo && ($archivo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    ResponseHelper::error('La subida del archivo fallo (codigo=' . ($archivo['error'] ?? 'N/A') . '). Use la opcion "ubicacion" si no desea adjuntar.', 400);
   }
   ResponseHelper::error('La ubicacion o el archivo adjunto del soporte es obligatorio', 400);
  }

  $pdo = Database::getInstance();
  $stmt = $pdo->prepare("
   SELECT c.id, c.tipo, c.descripcion, con.id as concertacion_id, con.evaluador_id, con.evaluado_id
   FROM compromisos c
   INNER JOIN concertaciones con ON con.id = c.concertacion_id
   WHERE c.id = :cid AND c.eliminado_en IS NULL
  ");
  $stmt->execute(['cid' => $compromisoId]);
  $compromiso = $stmt->fetch(\PDO::FETCH_ASSOC);

  if (!$compromiso) {
  ResponseHelper::error('Compromiso no encontrado', 404);
  }

  $concertacionId = (int) $compromiso['concertacion_id'];

  $crearDatos = [
   'concertacion_id' => $concertacionId,
   'compromiso_id' => $compromisoId,
   'periodo_id' => $periodoId,
   'registrado_por' => $user['id'],
   'compromiso_competencia' => $compromiso['descripcion'],
   'descripcion' => $descripcion,
   'ubicacion' => $ubicacion,
   'observacion' => $observacion ?: null,
   'tipo' => $tipo === 'competencia' ? 'competencia' : ($tipo === 'general' ? 'general' : 'compromiso'),
  ];

  if ($archivoPath !== null) {
   $crearDatos['archivo_path'] = $archivoPath;
   $crearDatos['archivo_nombre'] = $archivoNombre;
   $crearDatos['archivo_mime'] = $archivoMime;
   $crearDatos['archivo_tamano'] = $archivoTamano;
  }

  $id = $this->evidenciaRepo->crear($crearDatos);
  AuditoriaService::registrar('registrar_evidencia', 'evidencias', $id);

  return $id;
 }

 public function ver(int $id): array
 {
  $evidencia = $this->evidenciaRepo->buscarPorIdConRelaciones($id);
  if (!$evidencia) {
  ResponseHelper::notFound('Evidencia no encontrada');
  }
  return $evidencia;
 }

 /**
  * Actualiza una evidencia. Acepta archivo opcional para reemplazar.
  */
 public function actualizar(int $id, array $datos, ?array $archivo = null): void
 {
  $evidencia = $this->evidenciaRepo->buscarPorId($id);
  if (!$evidencia) {
  ResponseHelper::notFound('Evidencia no encontrada');
  }

  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();

if ((int) $evidencia['registrado_por'] !== $user['id']) {
    ResponseHelper::forbidden('Solo puede modificar evidencias propias');
   }

  $permitidos = ['descripcion', 'ubicacion', 'observacion', 'compromiso_competencia', 'tipo'];
  $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

  foreach (['descripcion'] as $req) {
   if (isset($datosFiltrados[$req]) && trim($datosFiltrados[$req]) === '') {
    ResponseHelper::error("$req es obligatorio", 400);
   }
  }

  if ($archivo && !empty($archivo['name']) && ($archivo['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
   $validado = UploadHelper::validar($archivo);
   $archivoPath = UploadHelper::guardar($validado, 'evidencias');
   $datosFiltrados['archivo_path'] = $archivoPath;
   $datosFiltrados['archivo_nombre'] = $validado['original_name'];
   $datosFiltrados['archivo_mime'] = $validado['mime_type'];
   $datosFiltrados['archivo_tamano'] = (int) $validado['size'];
  }

  $this->evidenciaRepo->actualizar($id, $datosFiltrados);
  AuditoriaService::registrar('actualizar_evidencia', 'evidencias', $id);
 }

 public function eliminar(int $id): void
 {
  $evidencia = $this->evidenciaRepo->buscarPorId($id);
  if (!$evidencia) {
  ResponseHelper::notFound('Evidencia no encontrada');
  }

  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();

if ((int) $evidencia['registrado_por'] !== $user['id']) {
    ResponseHelper::forbidden('Solo puede eliminar evidencias propias');
   }

  $this->evidenciaRepo->eliminar($id);
  AuditoriaService::registrar('eliminar_evidencia', 'evidencias', $id);
 }

 /**
  * Descarga el archivo adjunto de una evidencia (si existe).
  */
 public function descargarArchivo(int $id, string $rootDir): void
 {
  $evidencia = $this->evidenciaRepo->buscarPorId($id);
  if (!$evidencia || empty($evidencia['archivo_path'])) {
   ResponseHelper::notFound('Archivo no disponible para esta evidencia');
  }
  $rutaAbs = $rootDir . '/uploads/' . $evidencia['archivo_path'];
  if (!is_file($rutaAbs)) {
   ResponseHelper::notFound('Archivo fisico no encontrado en almacenamiento');
  }
  $mime = $evidencia['archivo_mime'] ?: 'application/octet-stream';
  $nombre = $evidencia['archivo_nombre'] ?: basename($rutaAbs);

  header('Content-Type: ' . $mime);
  header('Content-Disposition: attachment; filename="' . rawurlencode($nombre) . '"');
  header('Content-Length: ' . filesize($rutaAbs));
  header('Cache-Control: private, max-age=0, must-revalidate');
  readfile($rutaAbs);
  exit;
 }
}
