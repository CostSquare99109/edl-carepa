<?php

namespace App\Service;

use App\Repository\CompromisoRepository;
use App\Service\NotificacionService;
use App\Helper\ResponseHelper;
use App\Config\Database;

class CompromisoService
{
  private CompromisoRepository $repo;
  private NotificacionService $notificacionService;

  public function __construct()
  {
    $this->repo = new CompromisoRepository();
    $this->notificacionService = new NotificacionService();
  }

  public function listar(array $filtros, int $pagina, int $porPagina): array
  {
    return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
  }

	/** Evaluado propone compromiso → estado 'propuesto', notifica al evaluador (Concertación EDL-CAREPA) */
 public function enviar(array $datos, array $funcionario): int
 {
 $pdo = Database::getInstance();

 // Verificar que la evaluación existe y pertenece al evaluado
 $stmt = $pdo->prepare("SELECT e.*, p.nombre as periodo_nombre FROM evaluaciones e INNER JOIN periodos p ON p.id = e.periodo_id WHERE e.id = ? AND e.eliminado_en IS NULL");
 $stmt->execute([$datos['evaluacion_id']]);
 $evaluacion = $stmt->fetch(\PDO::FETCH_ASSOC);
 if (!$evaluacion) {
 ResponseHelper::error('Evaluacion no encontrada', 404);
 }
 if ((int) $evaluacion['evaluado_id'] !== $funcionario['id']) {
 ResponseHelper::error('No tiene permiso para proponer compromisos en esta evaluacion', 403);
 }

	// Insertar compromiso con estado 'propuesto' (terminología EDL-CAREPA Acuerdo 6176)
 $stmt = $pdo->prepare("
 INSERT INTO compromisos (evaluacion_id, tipo, descripcion, resultado_esperado, medio_verificacion, observaciones_evaluado, plazo, responsable_id, evaluador_id, estado, peso)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'propuesto', 0.00)
 ");
 $stmt->execute([
 $datos['evaluacion_id'],
 $datos['tipo'],
 $datos['descripcion'],
 $datos['resultado_esperado'] ?? null,
 $datos['medio_verificacion'] ?? null,
 $datos['observaciones_evaluado'] ?? null,
 $datos['plazo'],
 $datos['responsable_id'],
 $datos['evaluador_id'],
 ]);
 $compromisoId = (int) $pdo->lastInsertId();

    // Auditar
    AuditoriaService::registrar('crear', 'compromisos', $compromisoId, null, $datos);

    // Notificar al evaluador
    $nombreFuncionario = trim($funcionario['nombres'] . ' ' . $funcionario['apellidos']);
    $this->notificacionService->notificarCompromisoPendiente(
      (int) $datos['evaluador_id'],
      $nombreFuncionario,
      $compromisoId
    );

    return $compromisoId;
  }

  /** Evaluador aprueba compromiso con peso. Valida que la suma de pesos = 100% */
  public function aprobar(int $id, float $peso, string $observaciones, array $evaluador): void
  {
    $pdo = Database::getInstance();

    // Buscar compromiso
    $comp = $this->repo->buscarPorId($id);
    if (!$comp) {
      ResponseHelper::error('Compromiso no encontrado', 404);
    }
 if ($comp['estado'] !== 'propuesto') {
 ResponseHelper::error('Solo se pueden aprobar compromisos en estado propuesto', 400);
 }
 if ((int) $comp['evaluador_id'] !== $evaluador['id']) {
 ResponseHelper::error('Solo el evaluador asignado puede aprobar este compromiso', 403);
 }

    // Validar que la suma de pesos aprobados + este nuevo peso no supere 100%
    $evaluacionId = (int) $comp['evaluacion_id'];
    $stmt = $pdo->prepare("
      SELECT COALESCE(SUM(peso), 0) as total_pesos
      FROM compromisos
      WHERE evaluacion_id = ? AND estado = 'aprobado' AND id != ? AND eliminado_en IS NULL
    ");
    $stmt->execute([$evaluacionId, $id]);
    $pesoExistente = (float) $stmt->fetchColumn();
    $pesoTotal = $pesoExistente + $peso;

    if ($pesoTotal > 100) {
      ResponseHelper::error("La suma de pesos seria {$pesoTotal}%. El maximo permitido es 100%. Pesos ya asignados: {$pesoExistente}%", 400);
    }

    // Aprobar compromiso
    $stmt = $pdo->prepare("
      UPDATE compromisos SET peso = ?, estado = 'aprobado', observaciones_evaluador = ?, actualizado_en = NOW()
      WHERE id = ?
    ");
    $stmt->execute([$peso, $observaciones, $id]);

    // Auditar
    AuditoriaService::registrar('aprobar', 'compromisos', $id, $comp, ['peso' => $peso, 'estado' => 'aprobado']);

    // Notificar al funcionario
    $this->notificacionService->notificarCompromisoAprobado(
      (int) $comp['responsable_id'],
      $id,
      $peso
    );

    // Verificar si ya suman 100% los pesos aprobados
    $stmt = $pdo->prepare("
      SELECT COALESCE(SUM(peso), 0) as total_pesos
      FROM compromisos
      WHERE evaluacion_id = ? AND estado = 'aprobado' AND eliminado_en IS NULL
    ");
    $stmt->execute([$evaluacionId]);
    $totalAprobado = (float) $stmt->fetchColumn();

    if (abs($totalAprobado - 100.0) < 0.01) {
      // Todos los pesos asignados, notificar al evaluador
      $this->notificacionService->notificar(
        (int) $evaluador['id'],
        'Distribucion de pesos completa',
        "Los compromisos de la evaluacion #{$evaluacionId} suman exactamente 100%. La distribucion esta completa.",
        'exito'
      );
    }
  }

 /** Evaluador devuelve compromiso al evaluado (Concertación EDL-CAREPA) */
 public function rechazar(int $id, string $observaciones, array $evaluador): void
 {
 $pdo = Database::getInstance();

 $comp = $this->repo->buscarPorId($id);
 if (!$comp) {
 ResponseHelper::error('Compromiso no encontrado', 404);
 }
 if ($comp['estado'] !== 'propuesto') {
 ResponseHelper::error('Solo se pueden devolver compromisos en estado propuesto', 400);
 }
 if ((int) $comp['evaluador_id'] !== $evaluador['id']) {
 ResponseHelper::error('Solo el evaluador asignado puede devolver este compromiso', 403);
 }

 $stmt = $pdo->prepare("
 UPDATE compromisos SET estado = 'devuelto', observaciones_evaluador = ?, actualizado_en = NOW()
 WHERE id = ?
 ");
 $stmt->execute([$observaciones, $id]);

 AuditoriaService::registrar('devolver', 'compromisos', $id, $comp, ['estado' => 'devuelto']);

 // Notificar al evaluado
 $this->notificacionService->notificarCompromisoRechazado(
 (int) $comp['responsable_id'],
 $id,
 $observaciones
 );
 }

  /** Resumen de pesos de compromisos para una evaluación */
  public function resumenPesos(int $evaluacionId, array $user): array
  {
    $pdo = Database::getInstance();

    // Verificar acceso
    $stmt = $pdo->prepare("SELECT * FROM evaluaciones WHERE id = ? AND eliminado_en IS NULL");
    $stmt->execute([$evaluacionId]);
    $evaluacion = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (!$evaluacion) {
      ResponseHelper::error('Evaluacion no encontrada', 404);
    }

    // Compromisos aprobados
    $stmt = $pdo->prepare("
      SELECT c.id, c.tipo, c.descripcion, c.peso, c.estado,
             CONCAT(u.nombres, ' ', u.apellidos) as responsable_nombre
      FROM compromisos c
      INNER JOIN usuarios u ON u.id = c.responsable_id
      WHERE c.evaluacion_id = ? AND c.eliminado_en IS NULL
      ORDER BY c.estado, c.id
    ");
    $stmt->execute([$evaluacionId]);
    $compromisos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    $totalAprobado = 0;
    $pendientes = 0;
    foreach ($compromisos as $c) {
      if ($c['estado'] === 'aprobado') {
        $totalAprobado += (float) $c['peso'];
      }
 if ($c['estado'] === 'propuesto') {
 $pendientes++;
 }
    }

    return [
      'evaluacion_id' => $evaluacionId,
      'compromisos' => $compromisos,
      'total_peso_aprobado' => round($totalAprobado, 2),
      'peso_restante' => round(100 - $totalAprobado, 2),
      'compromisos_pendientes' => $pendientes,
      'distribucion_completa' => abs($totalAprobado - 100.0) < 0.01,
    ];
  }

  /** Compromisos pendientes de aprobación para el evaluador logueado */
  public function pendientesAprobacion(array $evaluador, int $pagina = 1, int $porPagina = 20): array
  {
    return $this->repo->pendientesPorEvaluador((int) $evaluador['id'], $pagina, $porPagina);
  }

 public function actualizar(int $id, array $datos): void
 {
 $comp = $this->repo->buscarPorId($id);
 if (!$comp) {
 ResponseHelper::error('Compromiso no encontrado', 404);
 }
 $permitidos = ['descripcion', 'plazo', 'estado', 'resultado_esperado', 'medio_verificacion', 'observaciones_evaluado', 'calificacion'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
 $this->repo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar', 'compromisos', $id, $comp, $datosFiltrados);
 }

 /** Evaluador califica un compromiso (puntaje 0-100) */
 public function calificar(int $id, float $puntaje, string $observaciones, array $evaluador): void
 {
 $comp = $this->repo->buscarPorId($id);
 if (!$comp) {
 ResponseHelper::error('Compromiso no encontrado', 404);
 }
 if ($comp['estado'] !== 'aprobado') {
 ResponseHelper::error('Solo se pueden calificar compromisos aprobados', 400);
 }
 if ((int) $comp['evaluador_id'] !== $evaluador['id']) {
 ResponseHelper::error('Solo el evaluador asignado puede calificar este compromiso', 403);
 }

 $pdo = Database::getInstance();
 $nuevoEstado = $puntaje >= 60 ? 'cumplido' : 'incumplido';
 $stmt = $pdo->prepare("
 UPDATE compromisos SET calificacion = ?, estado = ?, observaciones_evaluador = CONCAT(COALESCE(observaciones_evaluador, ''), ?), actualizado_en = NOW()
 WHERE id = ?
 ");
 $obsStr = $observaciones ? "\n[Calificacion]: " . $observaciones : '';
 $stmt->execute([$puntaje, $nuevoEstado, $obsStr, $id]);

 AuditoriaService::registrar('calificar', 'compromisos', $id, $comp, ['calificacion' => $puntaje, 'estado' => $nuevoEstado]);
 }

 /** Evaluador devuelve compromiso al evaluado con observaciones (Concertación EDL-CAREPA) */
 public function devolver(int $id, string $observaciones, array $evaluador): void
 {
 $comp = $this->repo->buscarPorId($id);
 if (!$comp) {
 ResponseHelper::error('Compromiso no encontrado', 404);
 }
 if ($comp['estado'] !== 'propuesto') {
 ResponseHelper::error('Solo se pueden devolver compromisos en estado propuesto', 400);
 }
 if ((int) $comp['evaluador_id'] !== $evaluador['id']) {
 ResponseHelper::error('Solo el evaluador asignado puede devolver este compromiso', 403);
 }

 $pdo = Database::getInstance();
 $stmt = $pdo->prepare("
 UPDATE compromisos SET estado = 'devuelto', observaciones_evaluador = ?, actualizado_en = NOW()
 WHERE id = ?
 ");
 $stmt->execute([$observaciones, $id]);

 AuditoriaService::registrar('devolver', 'compromisos', $id, $comp, ['estado' => 'devuelto', 'observaciones' => $observaciones]);

 $this->notificacionService->notificarCompromisoRechazado(
 (int) $comp['responsable_id'],
 $id,
 $observaciones
 );
 }
}