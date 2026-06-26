<?php

namespace App\Service;

use App\Repository\ConcertacionRepository;
use App\Repository\CompromisoRepository;
use App\Repository\PeriodoRepository;
use App\Repository\UsuarioRepository;
use App\Helper\ResponseHelper;
use App\Helper\HttpException;
use App\Config\Database;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

class ConcertacionService
{
 private ConcertacionRepository $concertacionRepo;
 private CompromisoRepository $compromisoRepo;
 private UsuarioRepository $usuarioRepo;

 public function __construct()
 {
 $pdo = Database::getInstance();
 $this->concertacionRepo = new ConcertacionRepository($pdo);
 $this->compromisoRepo = new CompromisoRepository($pdo);
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

 return $this->concertacionRepo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 public function ver(int $id): array
 {
 $concertacion = $this->concertacionRepo->buscarPorId($id);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 $concertacion['compromisos'] = $this->concertacionRepo->compromisosPorEvaluacion($id);

 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();
 if (!in_array($rolActivo, ['admin']) &&
 (int) $concertacion['evaluador_id'] !== $user['id'] &&
 (int) $concertacion['evaluado_id'] !== $user['id']
 ) {
 ResponseHelper::forbidden();
 }

 return $concertacion;
 }

 public function crear(array $datos): int
 {
 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if (!in_array($rolActivo, ['admin', 'evaluador'])) {
 ResponseHelper::forbidden('Solo administradores o evaluadores pueden crear concertaciones');
 }

  $periodoId = $datos['periodo_id'] ?? null;
  $evaluadoId = $datos['evaluado_id'] ?? null;
  $evaluadorId = $datos['evaluador_id'] ?? $user['id'];
  $tipoConcertacion = $datos['tipo_concertacion'] ?? 'concertacion_bilateral';

  if (!$periodoId || !$evaluadoId) {
   ResponseHelper::error('periodo_id y evaluado_id son requeridos', 422);
  }

  $evaluado = $this->usuarioRepo->buscarPorId((int) $evaluadoId);
  if ($evaluado && !empty($evaluado['en_periodo_prueba']) && (bool) $evaluado['en_periodo_prueba']) {
   $fechaInicio = $evaluado['fecha_posesion'] ?? $evaluado['creado_en'] ?? null;
   if ($fechaInicio) {
    $dias = (int) ((time() - strtotime($fechaInicio)) / 86400);
    if ($dias <= 120) {
     ResponseHelper::error('El funcionario se encuentra en periodo de prueba (menos de 4 meses). No es sujeto de evaluacion conforme al articulo 15 de la Resolucion 1760 de 2010.', 422);
    }
   }
  }

  $estado = $datos['estado'] ?? 'pendiente';
  $estadosValidos = ['pendiente', 'concertada', 'propuesta_evaluado', 'aprobada_evaluado', 'rechazada_evaluado', 'fijada'];
  if (!in_array($estado, $estadosValidos)) {
   $estado = 'pendiente';
  }

  $tiposConcertacionValidos = ['concertacion_bilateral', 'fijados_evaluador'];
  if (!in_array($tipoConcertacion, $tiposConcertacionValidos)) {
   $tipoConcertacion = 'concertacion_bilateral';
  }

  $crearDatos = [
   'periodo_id' => $periodoId,
   'evaluador_id' => $evaluadorId,
   'evaluado_id' => $evaluadoId,
   'tipo_concertacion' => $tipoConcertacion,
   'estado' => $estado,
   'observaciones' => $datos['observaciones'] ?? null,
 ];

  $id = $this->concertacionRepo->crear($crearDatos);

  $pdo = Database::getInstance();
  $stmt = $pdo->prepare("UPDATE evaluaciones SET concertacion_id = ? WHERE evaluado_id = ? AND periodo_id = ? AND concertacion_id IS NULL AND eliminado_en IS NULL LIMIT 1");
  $stmt->execute([$id, $evaluadoId, $periodoId]);

 AuditoriaService::registrar('crear_concertacion', 'concertaciones', $id);

 return $id;
 }

 public function actualizar(int $id, array $datos): void
 {
 $concertacion = $this->concertacionRepo->buscarPorId($id);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if (!in_array($rolActivo, ['admin']) &&
 (int) $concertacion['evaluador_id'] !== $user['id']) {
 ResponseHelper::forbidden();
 }

 $permitidos = ['observaciones', 'estado', 'fecha_concertacion'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 if (!empty($datosFiltrados)) {
 $this->concertacionRepo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar_concertacion', 'concertaciones', $id);
 }
 }

 public function fijarCompromisos(int $id): void
 {
 $concertacion = $this->concertacionRepo->buscarPorId($id);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if (!in_array($rolActivo, ['admin', 'evaluador'])) {
 ResponseHelper::forbidden('Solo administradores o evaluadores pueden fijar compromisos');
 }

 if ($concertacion['estado'] === 'concertada') {
 ResponseHelper::error('Los compromisos ya estan concertados', 400);
 }

 $compromisos = $this->concertacionRepo->compromisosPorConcertacion($id);

 $compromisosNoAprobados = array_filter($compromisos, function ($c) {
 return $c['estado'] !== 'aprobado' && $c['estado'] !== 'cumplido' && $c['estado'] !== 'incumplido';
 });

 if (count($compromisosNoAprobados) > 0) {
 ResponseHelper::error('No se pueden fijar los compromisos. Todos deben estar aprobados bilateralmente antes de fijar la concertacion.', 422);
 }

 if (empty($compromisos)) {
  ResponseHelper::error('No hay compromisos registrados para fijar', 422);
 }

 $compromisoService = new CompromisoService();
 $validacion = $compromisoService->validarCompromisosAntesDeFirmar($id, (int) $concertacion['evaluado_id']);
 if (!$validacion['valido']) {
  ResponseHelper::error('No se pueden fijar los compromisos. ' . implode(' | ', $validacion['errores']), 422);
 }

 $this->concertacionRepo->actualizar($id, [
 'estado' => 'concertada',
 'fecha_concertacion' => date('Y-m-d H:i:s'),
 ]);

 AuditoriaService::registrar('fijar_compromisos', 'concertaciones', $id);
 }

 /**
  * Verifica si la concertacion cumple las condiciones para fijar
  * unilateralmente conforme al Art. 33 de la Resolucion 1760/2010 y al
  * Acuerdo 617 de 2018: 15 dias habiles desde el inicio de la concertacion
  * (omision del evaluado) o 3 dias habiles desde la no conformidad del
  * evaluado. Implementa el endpoint PUT /concertaciones/{id}/fijar-unilateral
  * que el controller ya tenia registrado pero sin implementacion.
  */
 public function puedeFijarUnilateral(int $concertacionId): array
 {
 $concertacion = $this->concertacionRepo->buscarPorId($concertacionId);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 if ($concertacion['estado'] === 'concertada') {
 return ['puede' => false, 'motivo' => 'La concertacion ya fue aprobada bilateralmente'];
 }
 if ($concertacion['estado'] === 'fijada') {
 return ['puede' => false, 'motivo' => 'Los compromisos ya fueron fijados unilateralmente'];
 }

 $periodo = (new PeriodoRepository(Database::getInstance()))->buscarPorId((int) $concertacion['periodo_id']);
 $fechaInicioConcertacion = $periodo['fecha_inicio_concertacion'] ?? $periodo['fecha_inicio'] ?? null;

 if (!$fechaInicioConcertacion) {
 return ['puede' => false, 'motivo' => 'No hay fecha de inicio de concertacion definida para el periodo'];
 }

 $inicio = new \DateTime($fechaInicioConcertacion);
 $hoy = new \DateTime();

 $diasHabiles = 0;
 $fechaActual = clone $inicio;
 while ($fechaActual <= $hoy) {
 $diaSemana = (int) $fechaActual->format('N');
 if ($diaSemana >= 1 && $diaSemana <= 5) {
 $diasHabiles++;
 }
 $fechaActual->modify('+1 day');
 }

 $puede = $diasHabiles >= 15;

 return [
 'puede' => $puede,
 'dias_habiles_transcurridos' => $diasHabiles,
 'fecha_inicio_concertacion' => $fechaInicioConcertacion,
 'plazo_minimo_dias_habiles' => 15,
 'motivo' => $puede
 ? 'Han transcurrido 15 o mas dias habiles desde el inicio de la concertacion. Procede fijacion unilateral conforme al Art. 33 Res. 1760/2010.'
 : 'Faltan ' . (15 - $diasHabiles) . ' dias habiles para poder fijar unilateralmente',
 ];
 }

 /**
  * Ejecuta la fijacion unilateral de la concertacion por parte del evaluador.
  * Implementa el endpoint PUT /concertaciones/{id}/fijar-unilateral
  * (ConcertacionController::fijarUnilateral).
  */
 public function fijarUnilateral(int $concertacionId, array $datos = []): void
 {
 $check = $this->puedeFijarUnilateral($concertacionId);
 if (!$check['puede']) {
 ResponseHelper::error('No se puede fijar unilateralmente: ' . $check['motivo'], 422);
 }

 $concertacion = $this->concertacionRepo->buscarPorId($concertacionId);
 $user = AuthMiddleware::user();
 if ((int) $concertacion['evaluador_id'] !== (int) $user['id'] && AuthMiddleware::rolActivo() !== 'admin') {
 ResponseHelper::forbidden('Solo el evaluador asignado puede fijar unilateralmente los compromisos');
 }

 $testigoId = isset($datos['testigo_id']) ? (int) $datos['testigo_id'] : null;
 $motivo = $datos['motivo_fijacion_unilateral'] ?? 'vencimiento_plazo_sin_firma';
 $motivosValidos = ['no_conformidad_evaluado', 'vencimiento_plazo_sin_firma', 'negativa_concertar', 'omision_evaluador', 'otro'];
 if (!in_array($motivo, $motivosValidos, true)) {
 ResponseHelper::error('Motivo de fijacion unilateral invalido. Valores: ' . implode(', ', $motivosValidos), 422);
 }

 $actualizar = [
 'estado' => 'fijada',
 'tipo_concertacion' => 'fijados_evaluador',
 'fecha_concertacion' => date('Y-m-d H:i:s'),
 'motivo_fijacion_unilateral' => $motivo,
 'observaciones' => $datos['observaciones'] ?? 'Fijacion unilateral conforme al Art. 33 Res. 1760/2010',
 ];
 if ($testigoId) {
 $stmtTestigo = Database::getInstance()->prepare(
 "SELECT id FROM usuarios WHERE id = :uid AND eliminado_en IS NULL AND estado = 'activo'"
 );
 $stmtTestigo->execute(['uid' => $testigoId]);
 if (!$stmtTestigo->fetch()) {
 ResponseHelper::error('El testigo indicado no existe o no esta activo', 422);
 }
 $actualizar['testigo_id'] = $testigoId;
 $actualizar['fecha_testigo'] = date('Y-m-d H:i:s');
 }

 $this->concertacionRepo->actualizar($concertacionId, $actualizar);

 // Aprueba los compromisos que aun no estaban finalizados.
 $compromisos = $this->concertacionRepo->compromisosPorConcertacion($concertacionId);
 foreach ($compromisos as $c) {
 if ($c['estado'] !== 'aprobado' && $c['estado'] !== 'cumplido' && $c['estado'] !== 'incumplido') {
 $this->compromisoRepo->actualizar($c['id'], [
 'estado' => 'aprobado',
 'propuesto_por_jefe_entidad' => 1,
 ]);
 }
 }

 // Notificar al evaluado y al jefe de personal (Art. 33 Res. 1760/2010).
 $pdo = Database::getInstance();
 $mensaje = 'El evaluador ha fijado unilateralmente los compromisos de su evaluacion conforme al Art. 33 de la Resolucion 1760/2010, tras configurarse la causal: ' . $motivo . '. Puede presentar reclamacion ante la Comision de Personal dentro de los dos (2) dias habiles siguientes.';
 $stmtNotif = $pdo->prepare(
 "INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, creado_en)
 VALUES (:uid, 'alerta', 'Concertacion fijada unilateralmente', :msg, NOW())"
 );
 $stmtNotif->execute([
 'uid' => $concertacion['evaluado_id'],
 'msg' => $mensaje,
 ]);

 $stmtJefe = $pdo->prepare(
 "SELECT u.id FROM usuarios u
 INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
 INNER JOIN roles r ON r.id = ur.rol_id
 WHERE r.codigo = 'admin' AND u.estado = 'activo' AND u.eliminado_en IS NULL
 LIMIT 1"
 );
 $stmtJefe->execute();
 $jefe = $stmtJefe->fetch();
 if (!empty($jefe['id'])) {
 $stmtNotif2 = $pdo->prepare(
 "INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, creado_en)
 VALUES (:uid, 'info', 'Fijacion unilateral registrada', :msg, NOW())"
 );
 $stmtNotif2->execute([
 'uid' => $jefe['id'],
 'msg' => 'El evaluador ID ' . $concertacion['evaluador_id'] . ' registro fijacion unilateral de compromisos para el evaluado ID ' . $concertacion['evaluado_id'] . '. Motivo: ' . $motivo,
 ]);
 }

 AuditoriaService::registrar('fijar_unilateral', 'concertaciones', $concertacionId, null, [
 'motivo' => $motivo,
 'testigo_id' => $testigoId,
 ]);
 }

 public function compromisosPorEvaluacion(int $evaluacionId): array
 {
 $concertacion = $this->concertacionRepo->buscarPorId($evaluacionId);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }
 return $this->concertacionRepo->compromisosPorEvaluacion($evaluacionId);
 }

 public function compromisos(int $evaluacionId): array
 {
 return $this->compromisosPorEvaluacion($evaluacionId);
 }
}
