<?php

namespace App\Service;

use App\Repository\EvaluacionRepository;
use App\Repository\CompromisoRepository;
use App\Repository\ConcertacionRepository;
use App\Repository\UsuarioRepository;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

class EvaluacionService
{
 private EvaluacionRepository $evaluacionRepo;
 private CompromisoRepository $compromisoRepo;
 private ConcertacionRepository $concertacionRepo;
 private UsuarioRepository $usuarioRepo;

 public function __construct()
 {
  $pdo = Database::getInstance();
  $this->evaluacionRepo = new EvaluacionRepository($pdo);
  $this->compromisoRepo = new CompromisoRepository($pdo);
  $this->concertacionRepo = new ConcertacionRepository($pdo);
  $this->usuarioRepo = new UsuarioRepository($pdo);
 }

 public function listar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if ($rolActivo === 'evaluador') {
 $filtros['evaluador_id'] = $user['id'];
 } elseif ($rolActivo === 'evaluado') {
 $filtros['evaluado_id'] = $user['id'];
 }

 return $this->evaluacionRepo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 public function ver(int $id): array
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($id);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }
 return $evaluacion;
 }

 public function crear(array $datos): int
 {
 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if (!in_array($rolActivo, ['admin', 'evaluador'])) {
 ResponseHelper::forbidden('Solo administradores o evaluadores pueden crear evaluaciones');
 }

  $tiposValidos = ['parcial_primer_semestre', 'parcial_segundo_semestre', 'parcial_eventual', 'calificacion_definitiva', 'calificacion_extraordinaria'];
  $tipo = $datos['tipo'] ?? 'parcial_primer_semestre';
  if (!in_array($tipo, $tiposValidos)) {
   ResponseHelper::error('Tipo de evaluacion invalido. Valores validos: ' . implode(', ', $tiposValidos), 422);
  }

 $evaluado = $this->usuarioRepo->buscarPorId((int) $datos['evaluado_id']);
	if ($evaluado && !empty($evaluado['en_periodo_prueba']) && (bool) $evaluado['en_periodo_prueba']) {
  $fechaInicio = $evaluado['fecha_vinculacion'] ?? $evaluado['creado_en'] ?? null;
  if ($fechaInicio) {
   $dias = (int) ((time() - strtotime($fechaInicio)) / 86400);
   if ($dias <= 120) {
    ResponseHelper::error('El funcionario se encuentra en periodo de prueba. No es sujeto de evaluacion conforme al articulo 15 de la Resolucion 1760 de 2010.', 422);
   }
  }
 }

 $crearDatos = [
 'periodo_id' => $datos['periodo_id'],
 'evaluado_id' => $datos['evaluado_id'],
 'evaluador_id' => $datos['evaluador_id'] ?? $user['id'],
 'concertacion_id' => $datos['concertacion_id'] ?? null,
 'tipo' => $tipo,
 'motivo_parcial_eventual' => $datos['motivo_parcial_eventual'] ?? null,
 'fecha_inicio' => $datos['fecha_inicio'] ?? null,
 'fecha_fin' => $datos['fecha_fin'] ?? null,
 'estado' => 'pendiente',
 ];

 $id = $this->evaluacionRepo->crear($crearDatos);
 AuditoriaService::registrar('crear_evaluacion', 'evaluaciones', $id);

 return $id;
 }

 public function crearParcial(int $evaluacionId, array $datos): int
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($evaluacionId);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }

 $motivo = $datos['motivo_parcial_eventual'] ?? null;
 if (!$motivo) {
 ResponseHelper::error('motivo_parcial_eventual es requerido', 422);
 }

 $motivosValidos = ['cambio_evaluador', 'lapso_ultima_evaluacion', 'periodo_prueba_otro_empleo', 'separacion_temporal_mas_30_dias', 'cambio_empleo_traslado'];
 if (!in_array($motivo, $motivosValidos)) {
 ResponseHelper::error('Motivo de evaluacion parcial eventual invalido', 422);
 }

 $nuevaEvaluacion = [
 'periodo_id' => $evaluacion['periodo_id'],
 'evaluado_id' => $evaluacion['evaluado_id'],
 'evaluador_id' => $datos['evaluador_id'] ?? $evaluacion['evaluador_id'],
 'concertacion_id' => $evaluacion['concertacion_id'],
 'tipo' => 'parcial_eventual',
 'motivo_parcial_eventual' => $motivo,
 'fecha_inicio' => $datos['fecha_inicio'] ?? date('Y-m-d'),
 'fecha_fin' => $datos['fecha_fin'] ?? null,
 ];

 $id = $this->evaluacionRepo->crear($nuevaEvaluacion);
 AuditoriaService::registrar('crear_evaluacion_parcial', 'evaluaciones', $id);

 return $id;
 }

 public function calificar(int $id, array $datos): void
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($id);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }

 if (!in_array($evaluacion['estado'], ['pendiente', 'en_proceso'])) {
 ResponseHelper::error('La evaluacion no puede ser calificada en su estado actual', 400);
 }

 $permitidos = ['observaciones'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
 $datosFiltrados['estado'] = 'en_proceso';

 $this->evaluacionRepo->actualizar($id, $datosFiltrados);
 }

 public function calificarDefinitiva(int $id, array $datos): void
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($id);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }

 $concertacionId = (int) $evaluacion['concertacion_id'];
 $pesoFunc = (int) Env::get('PESO_FUNCIONALES', 85);
 $pesoComp = (int) Env::get('PESO_COMPORTAMENTALES', 15);

 $sumaCalifFunc = 0;
 $sumaPesoFunc = 0;
 $compromisos = $this->evaluacionRepo->compromisosPorEvaluacion($id);

 foreach ($compromisos as $c) {
 if ($c['tipo'] === 'funcional' && $c['calificacion'] !== null) {
 $sumaCalifFunc += (float) $c['calificacion'] * (float) $c['peso'];
 $sumaPesoFunc += (float) $c['peso'];
 }
 }

 $notaFunc = $sumaPesoFunc > 0 ? $sumaCalifFunc / $sumaPesoFunc : 0;

 // Calificacion comportamental: escala 4-15 puntos
 $sumaCalifComp = 0;
 $sumaPesoComp = 0;
 foreach ($compromisos as $c) {
 if ($c['tipo'] === 'comportamental' && $c['calificacion'] !== null) {
 $sumaCalifComp += (float) $c['calificacion'] * (float) $c['peso'];
 $sumaPesoComp += (float) $c['peso'];
 }
 }
 $puntajeCompBruto = $sumaPesoComp > 0 ? $sumaCalifComp / $sumaPesoComp : 0;

 // Subescala comportamental (rango 4-15):
 // Bajo: 4-6, Aceptable: 7-9, Alto: 10-12, Muy Alto: 13-15
 $nivelComp = 'bajo';
 if ($puntajeCompBruto >= 13) {
 $nivelComp = 'muy_alto';
 } elseif ($puntajeCompBruto >= 10) {
 $nivelComp = 'alto';
 } elseif ($puntajeCompBruto >= 7) {
 $nivelComp = 'aceptable';
 }

 // Convertir puntaje comportamental (4-15) a porcentaje (0-100) para la ponderacion
 // Formula: (puntaje - min) / (max - min) * 100 = (puntaje - 4) / 11 * 100
 $notaComp = ($puntajeCompBruto >= 4) ? (($puntajeCompBruto - 4) / 11) * 100 : 0;

 // Ponderacion: 85% funcional + 15% comportamental
 $califDefinitiva = ($notaFunc * $pesoFunc / 100) + ($notaComp * $pesoComp / 100);

 // Escala final: Sobresaliente >= 90%, Satisfactorio > 65% y < 90%, No Satisfactorio <= 65%
 $umbralSobresaliente = (float) Env::get('UMBRAL_SOBRESALIENTE', 90);
 $umbralSatisfactorio = (float) Env::get('UMBRAL_SATISFACTORIO', 65);

 $nivel = $califDefinitiva >= $umbralSobresaliente ? 'sobresaliente' : ($califDefinitiva > $umbralSatisfactorio ? 'satisfactorio' : 'no_satisfactorio');

$this->evaluacionRepo->actualizar($id, [
  'nota_funcionales' => round($notaFunc, 2),
  'nota_comportamentales' => round($notaComp, 2),
  'calificacion_definitiva' => round($califDefinitiva, 2),
  'nivel_resultado' => $nivel,
  'estado' => 'calificada',
  'fecha_calificacion' => date('Y-m-d'),
  ]);

 AuditoriaService::registrar('calificar_definitiva', 'evaluaciones', $id, null, [
 'calificacion_definitiva' => round($califDefinitiva, 2),
 'nivel_resultado' => $nivel,
 ]);
 }

 public function aprobarComision(int $id, array $datos): void
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($id);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }

 if ($evaluacion['estado'] !== 'calificada') {
 ResponseHelper::error('Solo se pueden aprobar evaluaciones en estado calificada', 400);
 }

 $user = AuthMiddleware::user();
 $accion = $datos['accion'] ?? 'aprobar';
 $pdo = Database::getInstance();

 if ($accion === 'rechazar') {
 $this->evaluacionRepo->actualizar($id, [
 'estado' => 'rechazada_comision',
 'observaciones' => $datos['observaciones'] ?? 'Rechazada por Comision Evaluadora',
 ]);

 // Notificar al evaluador para que corrija
 $stmtNotif = $pdo->prepare(
 "INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, evaluacion_id, creado_en)
 VALUES (:uid, :titulo, :mensaje, 'alerta', :eid, NOW())"
 );
 $stmtNotif->execute([
 'uid' => $evaluacion['evaluador_id'],
 'titulo' => 'Evaluacion rechazada por la Comision',
 'mensaje' => 'La Comision Evaluadora rechazo la calificacion definitiva del servidor. Debe ingresar y realizar los ajustes pertinentes. Observaciones: ' . ($datos['observaciones'] ?? 'Sin observaciones'),
 'eid' => $id,
 ]);
 } else {
 $this->evaluacionRepo->actualizar($id, [
 'estado' => 'aprobada_comision',
 'es_comision_evaluadora' => 1,
 'comision_evaluadora_id' => $user['id'],
 ]);

 // Notificar al evaluado que su evaluacion quedo en firme
 $stmtNotif = $pdo->prepare(
 "INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, evaluacion_id, creado_en)
 VALUES (:uid, :titulo, :mensaje, 'exito', :eid, NOW())"
 );
 $nivelTexto = match($evaluacion['nivel_resultado'] ?? '') {
 'sobresaliente' => 'SOBRESALIENTE',
 'satisfactorio' => 'SATISFACTORIO',
 'no_satisfactorio' => 'NO SATISFACTORIO',
 default => 'CALIFICADA',
 };
 $stmtNotif->execute([
 'uid' => $evaluacion['evaluado_id'],
 'titulo' => 'Evaluacion aprobada y en firme',
 'mensaje' => "Su evaluacion del periodo {$evaluacion['periodo_id']} fue aprobada por la Comision Evaluadora con calificacion {$nivelTexto}. La calificacion queda en firme.",
 'eid' => $id,
 ]);

 // Notificar al evaluador que la calificacion quedo en firme
 $stmtNotif2 = $pdo->prepare(
 "INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, evaluacion_id, creado_en)
 VALUES (:uid, :titulo, :mensaje, 'info', :eid, NOW())"
 );
 $stmtNotif2->execute([
 'uid' => $evaluacion['evaluador_id'],
 'titulo' => 'Evaluacion aprobada por la Comision',
 'mensaje' => "La Comision Evaluadora aprobo la calificacion definitiva del servidor con nivel {$nivelTexto}. La evaluacion queda en firme.",
 'eid' => $id,
 ]);
 }

 AuditoriaService::registrar('comision_evaluadora_' . $accion, 'evaluaciones', $id);
 }

 public function compromisos(int $evaluacionId): array
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($evaluacionId);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }
 return $this->evaluacionRepo->compromisosPorEvaluacion($evaluacionId);
 }

public function pendientesCalificar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
  {
  $user = AuthMiddleware::user();
  return $this->evaluacionRepo->pendientesPorEvaluador((int) $user['id'], $pagina, $porPagina);
  }

 public function guardar(int $id, array $datos): void
 {
  $evaluacion = $this->evaluacionRepo->buscarPorId($id);
  if (!$evaluacion) {
   ResponseHelper::notFound('Evaluacion no encontrada');
  }

  if (!in_array($evaluacion['estado'], ['pendiente', 'en_proceso'])) {
   ResponseHelper::error('La evaluacion no puede ser guardada en su estado actual', 400);
  }

  $permitidos = [
   'cumplio_compromisos', 'aporte_adicional', 'descripcion_aporte',
   'justificacion', 'tipo_evaluacion', 'motivo', 'razon',
   'fecha_inicio_eval', 'fecha_fin_eval',
  ];

  $actualizar = array_intersect_key($datos, array_flip($permitidos));

  if (!empty($datos['fecha_inicio_eval'])) {
   $actualizar['fecha_inicio'] = $datos['fecha_inicio_eval'];
  }
  if (!empty($datos['fecha_fin_eval'])) {
   $actualizar['fecha_fin'] = $datos['fecha_fin_eval'];
  }

  if (!empty($datos['tipo_evaluacion'])) {
   $actualizar['tipo'] = $datos['tipo_evaluacion'];
  }
  if (!empty($datos['motivo'])) {
   $actualizar['motivo_parcial_eventual'] = $datos['motivo'];
  }

  $actualizar['estado'] = 'en_proceso';
  $actualizar['observaciones'] = ($datos['observaciones'] ?? '');

  $this->evaluacionRepo->actualizar($id, $actualizar);
  AuditoriaService::registrar('guardar_evaluacion', 'evaluaciones', $id);
 }

 public function solicitarRevision(int $id): void
 {
  $evaluacion = $this->evaluacionRepo->buscarPorId($id);
  if (!$evaluacion) {
   ResponseHelper::notFound('Evaluacion no encontrada');
  }

  $this->evaluacionRepo->actualizar($id, [
   'estado' => 'pendiente',
   'observaciones' => 'Revision solicitada por el evaluador',
  ]);
  AuditoriaService::registrar('solicitar_revision_evaluacion', 'evaluaciones', $id);
 }

 public function finalizar(int $id, array $datos): void
 {
  $evaluacion = $this->evaluacionRepo->buscarPorId($id);
  if (!$evaluacion) {
   ResponseHelper::notFound('Evaluacion no encontrada');
  }

  if (!in_array($evaluacion['estado'], ['en_proceso'])) {
   ResponseHelper::error('La evaluacion debe estar en proceso para poder finalizarse', 400);
  }

  $this->calificarDefinitiva($id, $datos);

  // Notificar a la Comision Evaluadora que hay una nueva evaluacion pendiente de revision
  $pdo = Database::getInstance();
  $stmtNotif = $pdo->prepare(
   "INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, evaluacion_id, creado_en)
    SELECT u.id, :titulo, :mensaje, 'info', :eid, NOW()
    FROM usuarios u
    INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
    INNER JOIN roles r ON r.id = ur.rol_id
    WHERE r.codigo IN ('comision_evaluadora', 'admin')
    AND u.estado = 'activo'
    AND u.eliminado_en IS NULL"
  );
  $stmtNotif->execute([
   'titulo' => 'Nueva evaluacion pendiente de aprobacion',
   'mensaje' => "La evaluacion del servidor fue finalizada por el evaluador y esta pendiente de revision y aprobacion por la Comision Evaluadora.",
   'eid' => $id,
  ]);

  AuditoriaService::registrar('finalizar_evaluacion', 'evaluaciones', $id);
 }
}
