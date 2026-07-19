<?php
declare(strict_types=1);

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
   $evaluacionId = isset($datos['evaluacion_id']) ? (int) $datos['evaluacion_id'] : 0;

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

   // Obtener info del compromiso
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

   // VALIDACION 1: No permitir duplicar evidencia en el mismo compromiso para el mismo evaluado en el mismo periodo
   $stmtDup = $pdo->prepare("
    SELECT id FROM evidencias
    WHERE compromiso_id = :cid
      AND registrado_por = :uid
      AND periodo_id = :pid
      AND eliminado_en IS NULL
    LIMIT 1
   ");
   $stmtDup->execute(['cid' => $compromisoId, 'uid' => $user['id'], 'pid' => $periodoId]);
   if ($stmtDup->fetch()) {
   ResponseHelper::error('Ya existe una evidencia registrada para este compromiso en este periodo. No se permiten duplicados.', 409);
   }

   // VALIDACION 2: Contar evidencias por tipo (funcional/comportamental) en este periodo
   $stmtCount = $pdo->prepare("
    SELECT c.tipo, COUNT(*) as total
    FROM evidencias e
    INNER JOIN compromisos c ON c.id = e.compromiso_id
    WHERE e.registrado_por = :uid
      AND e.periodo_id = :pid
      AND e.eliminado_en IS NULL
    GROUP BY c.tipo
   ");
   $stmtCount->execute(['uid' => $user['id'], 'pid' => $periodoId]);
   $cuentas = $stmtCount->fetchAll(\PDO::FETCH_ASSOC);

   $funcionales = 0;
   $comportamentales = 0;
   foreach ($cuentas as $row) {
   if ($row['tipo'] === 'funcional') $funcionales = (int) $row['total'];
   if ($row['tipo'] === 'comportamental') $comportamentales = (int) $row['total'];
   }

   $tipoCompromiso = $compromiso['tipo']; // 'funcional' o 'comportamental'

   if ($tipoCompromiso === 'funcional' && $funcionales >= 3) {
   ResponseHelper::error('Ya ha alcanzado el limite de 3 evidencias funcionales para este periodo. No puede registrar mas.', 422);
   }
   if ($tipoCompromiso === 'comportamental' && $comportamentales >= 3) {
   ResponseHelper::error('Ya ha alcanzado el limite de 3 evidencias comportamentales para este periodo. No puede registrar mas.', 422);
   }

   // VALIDACION 3: Bloqueo total si ya completó 3 funcionales + 3 comportamentales = 6
   if ($funcionales >= 3 && $comportamentales >= 3) {
   ResponseHelper::error('Ya ha completado las 6 evidencias requeridas (3 funcionales + 3 comportamentales) para este periodo. No puede agregar mas.', 422);
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

   if ($evaluacionId > 0) {
   $crearDatos['evaluacion_id'] = $evaluacionId;
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
   * Actualizar evidencia: politica "no se puede editar una vez guardada".
   * La trazabilidad exige que la evidencia sea inmutable despues del registro,
   * sin importar el estado de la evaluacion. Solo el admin podra corregir
   * via endpoint dedicado (no implementado en este controlador).
   */
  public function actualizar(int $id, array $datos, ?array $archivo = null): void
  {
  ResponseHelper::error(
  'Las evidencias no se pueden editar una vez guardadas. Para corregir informacion contacte al administrador.',
  422
  );
  }

 /**
   * Eliminar evidencia: misma politica. Una vez registrada es inmutable.
   */
  public function eliminar(int $id): void
  {
  ResponseHelper::error(
  'Las evidencias no se pueden eliminar. Para corregir informacion contacte al administrador.',
  422
  );
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
