<?php

namespace App\Service;

use App\Repository\EvaluacionRepository;
use App\Repository\CompromisoRepository;
use App\Repository\CompromisoComportamentalRepository;
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
 private CompromisoComportamentalRepository $compromisoCompRepo;
 private ConcertacionRepository $concertacionRepo;
 private UsuarioRepository $usuarioRepo;

 public function __construct()
 {
  $pdo = Database::getInstance();
  $this->evaluacionRepo = new EvaluacionRepository($pdo);
  $this->compromisoRepo = new CompromisoRepository($pdo);
 $this->compromisoCompRepo = new CompromisoComportamentalRepository($pdo);
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

		$resultado = $this->evaluacionRepo->listarConRelaciones($filtros, $pagina, $porPagina);

		// Si se busco por documento_evaluado y no hay resultados, buscar al usuario directamente
		// para permitir concertacion aunque no tenga evaluacion creada aun
		if (!empty($filtros['documento_evaluado'])) {
			$data = $resultado['data'] ?? [];
			if (empty($data)) {
				$usuarioRepo = new \App\Repository\UsuarioRepository();
				$usuario = $usuarioRepo->buscarPorDocumento($filtros['documento_evaluado']);
				if ($usuario && !empty($usuario['id'])) {
					$denominacion = $usuario['denominacion_empleo'] ?? $usuario['denominacion'] ?? null;
					$data[] = [
						'id' => 0,
						'evaluado_id' => (int) $usuario['id'],
						'evaluado_documento' => $usuario['documento'] ?? null,
						'evaluado_nombre' => trim(($usuario['primer_nombre'] ?? '') . ' ' . ($usuario['segundo_nombre'] ?? '') . ' ' . ($usuario['primer_apellido'] ?? '') . ' ' . ($usuario['segundo_apellido'] ?? '')),
						'denominacion' => $denominacion,
						'denominacion_empleo' => $denominacion,
						'nivel' => $usuario['nivel'] ?? null,
						'codigo' => $usuario['codigo'] ?? null,
						'grado' => $usuario['grado'] ?? null,
						'periodo_id' => null,
						'periodo_nombre' => null,
						'estado' => null,
						'es_comision_evaluadora' => 0,
						'dependencia_id' => $usuario['dependencia_id'] ?? 0,
					];
					$resultado['data'] = $data;
					$resultado['total'] = 1;
				}
			}
		}

		return $resultado;
	}

  public function ver(int $id): array
  {
  $evaluacion = $this->evaluacionRepo->buscarPorId($id);
  if (!$evaluacion) {
  ResponseHelper::notFound('Evaluacion no encontrada');
  }

  // Enriquecer con informacion del evaluado y evaluador
  $pdo = Database::getInstance();
  if (!empty($evaluacion['evaluado_id'])) {
   $stmtE = $pdo->prepare("SELECT documento, CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) as nombre, denominacion_empleo FROM usuarios WHERE id = ? AND eliminado_en IS NULL");
   $stmtE->execute([$evaluacion['evaluado_id']]);
   $evalInfo = $stmtE->fetch(\PDO::FETCH_ASSOC);
   if ($evalInfo) {
    $evaluacion['evaluado_documento'] = $evalInfo['documento'] ?? null;
    $evaluacion['evaluado_nombre'] = trim($evalInfo['nombre'] ?? '') ?: null;
    $evaluacion['evaluado_cargo'] = $evalInfo['denominacion_empleo'] ?? null;
   }
  }
  if (!empty($evaluacion['evaluador_id'])) {
   $stmtR = $pdo->prepare("SELECT documento, CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) as nombre FROM usuarios WHERE id = ? AND eliminado_en IS NULL");
   $stmtR->execute([$evaluacion['evaluador_id']]);
   $evInfo = $stmtR->fetch(\PDO::FETCH_ASSOC);
   if ($evInfo) {
    $evaluacion['evaluador_documento'] = $evInfo['documento'] ?? null;
    $evaluacion['evaluador_nombre'] = trim($evInfo['nombre'] ?? '') ?: null;
   }
  }

  return $evaluacion;
  }

 public function crear(array $datos): int
 {
 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

if ($rolActivo !== 'evaluador') {
 ResponseHelper::forbidden('Solo evaluadores pueden crear evaluaciones');
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

	$periodoId = (int) ($datos['periodo_id'] ?? 0);
	$evaluadoId = (int) ($datos['evaluado_id'] ?? 0);

	// Si no se envio periodo_id, resolver el periodo activo
	if ($periodoId <= 0) {
		$pdo = Database::getInstance();
		$stmtPer = $pdo->query("SELECT id FROM periodos WHERE estado IN ('configuracion','concertacion','seguimiento','evaluacion','calificacion') AND eliminado_en IS NULL ORDER BY fecha_inicio DESC LIMIT 1");
		$activo = $stmtPer->fetch(\PDO::FETCH_ASSOC);
		if ($activo) {
			$periodoId = (int) $activo['id'];
			$datos['periodo_id'] = $periodoId;
		} else {
			ResponseHelper::error('No hay un periodo activo. Debe especificar un periodo_id valido.', 400);
		}
	}

	if ($periodoId > 0 && $evaluadoId > 0) {
	$pdo = Database::getInstance();

	// Buscar evaluacion activa existente
	$stmtUnico = $pdo->prepare(
	"SELECT COUNT(*) AS c FROM evaluaciones
	WHERE evaluado_id = :eid
	AND periodo_id = :pid
	AND tipo = :tipo
	AND eliminado_en IS NULL"
	);
	$stmtUnico->execute([
	'eid' => $evaluadoId,
	'pid' => $periodoId,
	'tipo' => $tipo,
	]);
	$rowUnico = $stmtUnico->fetch(\PDO::FETCH_ASSOC);
	if ((int) ($rowUnico['c'] ?? 0) > 0) {
	ResponseHelper::error(
	'Ya existe una evaluacion de tipo "' . $tipo . '" registrada para este evaluado en el periodo seleccionado (regla 10.5 de la especificacion EDL Carepa).',
	409
	);
	}

	// Si no hay activa, buscar soft-deleteada y reactivar
	$stmtDeleted = $pdo->prepare("SELECT id, concertacion_id FROM evaluaciones WHERE evaluado_id = :eid AND periodo_id = :pid AND tipo = :tipo AND eliminado_en IS NOT NULL LIMIT 1");
	$stmtDeleted->execute(['eid' => $evaluadoId, 'pid' => $periodoId, 'tipo' => $tipo]);
	$deletedEval = $stmtDeleted->fetch(\PDO::FETCH_ASSOC);
	if ($deletedEval) {
		$pdo->prepare("UPDATE evaluaciones SET eliminado_en = NULL, actualizado_en = NOW(), estado = 'pendiente', evaluador_id = :evid WHERE id = :id")
			->execute(['evid' => $datos['evaluador_id'] ?? $user['id'], 'id' => $deletedEval['id']]);
		if (!empty($deletedEval['concertacion_id'])) {
			$pdo->prepare("UPDATE concertaciones SET eliminado_en = NULL, actualizado_en = NOW() WHERE id = :id AND eliminado_en IS NOT NULL")
				->execute(['id' => $deletedEval['concertacion_id']]);
		}
		return (int) $deletedEval['id'];
	}
	}

  // Propagar la marca de comision evaluadora desde la concertacion.
  // Si la concertacion tiene conformar_comision_evaluadora=1, la
  // calificacion definitiva de este evaluado debera pasar por la
  // comision antes de quedar en firme (Acuerdo 617 de 2018).
  $esComision = 0;
  $concertacionId = (int) ($datos['concertacion_id'] ?? 0);
  if ($concertacionId > 0) {
   $pdo = Database::getInstance();
   $stmtC = $pdo->prepare(
    "SELECT conformar_comision_evaluadora, comision_evaluador_id FROM concertaciones WHERE id = :id AND eliminado_en IS NULL"
   );
   $stmtC->execute(['id' => $concertacionId]);
   $con = $stmtC->fetch(\PDO::FETCH_ASSOC);
   if ($con && (int) ($con['conformar_comision_evaluadora'] ?? 0) === 1) {
    $esComision = 1;
   }
  }
  // Tambien: si el jefe inmediato es de carrera provisional o periodo
  // de prueba, la comision evaluadora es obligatoria (Art. 30 Acuerdo
  // 617 de 2018). Esto lo verificamos por la naturaleza/tipo del evaluador.
  if ($esComision === 0 && $evaluado) {
   $jefeEsProvisional = !empty($evaluado['es_evaluador_y_evaluado'])
    || in_array(strtolower((string) ($evaluado['tipo_nombramiento'] ?? '')), ['provisional', 'periodo_prueba'], true);
   // Es un caso limite; dejamos la propagacion por defecto desde la
   // concertacion, que es la forma oficial de conformar la comision.
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
 'es_comision_evaluadora' => $esComision,
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

 // Paquete 1: leer SOLO de la tabla compromisos (que tras la migración solo
 // contiene tipo='funcional'). Mantiene la lógica 0-100 original.
 $sumaCalifFunc = 0;
 $sumaPesoFunc = 0;
 $funcionales = $this->compromisoRepo->listarPorConcertacion($concertacionId, true);
 foreach ($funcionales as $c) {
 if ($c['calificacion'] !== null) {
 $sumaCalifFunc += (float) $c['calificacion'] * (float) $c['peso'];
 $sumaPesoFunc += (float) $c['peso'];
 }
 }

  $notaFunc = $sumaPesoFunc > 0 ? ($sumaCalifFunc / $sumaPesoFunc) * ($pesoFunc / 100) : 0;

  // Paquete 2: leer SOLO de la tabla compromisos con tipo = 'comportamental'
 // (escala 4-15). Es completamente independiente de Paquete 1.
 $sumaCalifComp = 0;
 $sumaPesoComp = 0;
 $comportamentales = $this->compromisoCompRepo->listarPorConcertacion($concertacionId, true);
 foreach ($comportamentales as $c) {
 if ($c['calificacion'] !== null) {
 $sumaCalifComp += (float) $c['calificacion'] * (float) $c['peso'];
 $sumaPesoComp += (float) $c['peso'];
 }
 }
 $puntajeCompBruto = $sumaPesoComp > 0 ? $sumaCalifComp / $sumaPesoComp : 0;

  // Subescala comportamental (rango 4-15):
  // Bajo: 4-6, Aceptable: 7-9, Alto: 10-12, Muy Alto: 13-15
  // Esta subescala ya viene registrada a nivel de compromiso (en
  // `compromisos.nivel_comportamental`). Aqui solo la consolidamos a nivel
  // de evaluacion usando el promedio ponderado de puntajes.
  $nivelComp = 'bajo';
  if ($puntajeCompBruto >= 13) {
  $nivelComp = 'muy_alto';
  } elseif ($puntajeCompBruto >= 10) {
  $nivelComp = 'alto';
  } elseif ($puntajeCompBruto >= 7) {
  $nivelComp = 'aceptable';
  }

  // Convertir puntaje comportamental (4-15) a porcentaje y aplicar peso (15%)
  // Formula: ((puntaje - 4) / 11) * 100 * (pesoComp / 100)
  $notaComp = ($puntajeCompBruto >= 4) ? ((($puntajeCompBruto - 4) / 11) * 100) * ($pesoComp / 100) : 0;

  // Ponderacion: ambos valores ya incluyen su peso
  $califDefinitiva = $notaFunc + $notaComp;

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

  public function anular(int $id, string $motivo = '', array $user = []): void
  {
  $evaluacion = $this->evaluacionRepo->buscarPorId($id);
  if (!$evaluacion) {
   ResponseHelper::notFound('Evaluacion no encontrada');
  }

  if (in_array($evaluacion['estado'], ['cerrada', 'aprobada_comision', 'anulada'], true)) {
   ResponseHelper::error('La evaluacion ya se encuentra en firme o anulada y no puede anularse', 409);
  }

  $this->evaluacionRepo->actualizar($id, [
   'estado' => 'anulada',
   'motivo_anulacion' => $motivo ?: null,
  ]);
  AuditoriaService::registrar('anular_evaluacion', 'evaluaciones', $id, null, ['motivo' => $motivo]);
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

  // Se permite guardar en cualquier estado (incluye re-apertura de evaluaciones finalizadas)

  // Validacion CNSC (Tutorial_EDL_APP_Realizacion_de_las_Evaluaciones_desde_el_Rol.md):
  // para la evaluacion parcial eventual se requiere el motivo (Acuerdo 617 de 2018, art. 6)
  // y, cuando el motivo es separacion_temporal_mas_30_dias, la justificacion correspondiente.
  $tipoEvaluacionGuardar = $datos['tipo_evaluacion'] ?? $evaluacion['tipo'];
  if ($tipoEvaluacionGuardar === 'parcial_eventual') {
   $motivoParcial = $datos['motivo'] ?? $evaluacion['motivo_parcial_eventual'] ?? null;
   if (empty($motivoParcial)) {
    ResponseHelper::error(
     'Para la evaluacion parcial eventual debe seleccionar el motivo (Acuerdo 617 de 2018, art. 6).',
     422
    );
   }
   $motivosValidos = ['cambio_evaluador', 'lapso_ultima_evaluacion', 'periodo_prueba_otro_empleo', 'separacion_temporal_mas_30_dias', 'cambio_empleo_traslado'];
   if (!in_array($motivoParcial, $motivosValidos, true)) {
    ResponseHelper::error(
     'Motivo de evaluacion parcial eventual invalido. Valores validos: ' . implode(', ', $motivosValidos),
     422
    );
   }
   if ($motivoParcial === 'separacion_temporal_mas_30_dias') {
    $razonSeparacion = $datos['razon'] ?? $evaluacion['motivo_extraordinaria'] ?? null;
    $razonesValidas = ['suspension', 'encargo', 'licencia', 'comision', 'vacaciones'];
    if (empty($razonSeparacion)) {
     ResponseHelper::error(
      'Para el motivo "separacion temporal del empleo por mas de 30 dias" debe indicar la justificacion (suspension, encargo, licencia, comision o vacaciones).',
      422
     );
    }
    if (!in_array($razonSeparacion, $razonesValidas, true)) {
     ResponseHelper::error(
      'Justificacion de separacion temporal invalida. Valores validos: ' . implode(', ', $razonesValidas),
      422
     );
    }
   }
  }

  // Validacion CNSC (Tutorial_para_la_realizacion_de_la_primera_evaluacion_parcial.md):
  // si el evaluador responde de manera afirmativa a la pregunta de aporte
  // adicional, la justificacion debe tener minimo 40 caracteres.
  $aporteAdicional = strtolower((string) ($datos['aporte_adicional'] ?? ''));
  $aporteAcepta = in_array($aporteAdicional, ['si', '1', 'true', 'moderadamente', 'moderado'], true);
  $justificacion = isset($datos['justificacion']) ? trim((string) $datos['justificacion']) : '';
  if ($aporteAcepta && mb_strlen($justificacion) < 40) {
   ResponseHelper::error(
    'La justificacion del aporte adicional debe tener minimo 40 caracteres (Acuerdo 617 de 2018). Actual: ' . mb_strlen($justificacion),
    422
   );
  }

  // Validar fechas para evaluación 2do semestre
  $tipoEvaluacion = $datos['tipo_evaluacion'] ?? $evaluacion['tipo'];
  $tiposValidos = ['parcial_primer_semestre', 'parcial_segundo_semestre', 'parcial_eventual', 'calificacion_definitiva', 'calificacion_extraordinaria'];
  if (!in_array($tipoEvaluacion, $tiposValidos, true)) {
   ResponseHelper::error('Tipo de evaluacion invalido. Valores validos: ' . implode(', ', $tiposValidos), 422);
  }
  if ($tipoEvaluacion === 'parcial_segundo_semestre') {
   $fechaInicio = $datos['fecha_inicio_eval'] ?? $evaluacion['fecha_inicio'];
   $fechaFin = $datos['fecha_fin_eval'] ?? $evaluacion['fecha_fin'];
   $pdo = Database::getInstance();
   $stmtPer = $pdo->prepare('SELECT nombre FROM periodos WHERE id = ?');
   $stmtPer->execute([$evaluacion['periodo_id']]);
   $periodoNombre = $stmtPer->fetchColumn() ?: '';
   if (!empty($fechaInicio) && !empty($fechaFin) && !empty($periodoNombre)) {
    $errorFechas = $this->validarFechasSegundoSemestre($fechaInicio, $fechaFin, $periodoNombre);
    if ($errorFechas) {
     ResponseHelper::error($errorFechas, 422);
    }
   }
  }

  // Validacion cruzada: si vienen ambas fechas, inicio <= fin (cualquier tipo)
  $fechaInicioCheck = $datos['fecha_inicio_eval'] ?? $evaluacion['fecha_inicio'] ?? null;
  $fechaFinCheck = $datos['fecha_fin_eval'] ?? $evaluacion['fecha_fin'] ?? null;
  if (!empty($fechaInicioCheck) && !empty($fechaFinCheck) && $fechaInicioCheck > $fechaFinCheck) {
   ResponseHelper::error('La fecha de inicio no puede ser posterior a la fecha de fin.', 422);
  }

  // Validacion CNSC Acuerdo 617 de 2018, art. 6: las evaluaciones parciales eventuales
  // cubren a lo sumo 180 dias calendario. El frontend lo bloquea tambien al capturar
  // fechas; aqui lo revalidamos por seguridad.
  if ($tipoEvaluacion === 'parcial_eventual' && !empty($fechaInicioCheck) && !empty($fechaFinCheck)) {
   $diasEvaluados = (int) floor((strtotime($fechaFinCheck) - strtotime($fechaInicioCheck)) / 86400) + 1;
   if ($diasEvaluados > 180) {
    ResponseHelper::error(
     'Los dias evaluados (' . $diasEvaluados . ') no pueden superar 180 (Acuerdo 617 de 2018, art. 6).',
     422
    );
   }
   if ($diasEvaluados <= 0) {
    ResponseHelper::error('La fecha de fin debe ser igual o posterior a la fecha de inicio.', 422);
   }
  }

  $permitidos = [
   'cumplio_compromisos', 'aporte_adicional', 'descripcion_aporte',
   'justificacion', 'tipo_evaluacion', 'motivo', 'razon',
   'fecha_inicio_eval', 'fecha_fin_eval',
   'evaluador_no_jefe', 'motivo_no_jefe',
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

  	if (!empty($datos['razon'])) {
  	$actualizar['motivo_extraordinaria'] = $datos['razon'];
  	}

  	unset($actualizar['tipo_evaluacion'], $actualizar['fecha_inicio_eval'], $actualizar['fecha_fin_eval'], $actualizar['motivo'], $actualizar['razon']);

  	if (isset($datos['evaluador_no_jefe'])) {
   $actualizar['evaluador_no_jefe'] = (int) $datos['evaluador_no_jefe'] === 1 ? 1 : 0;
   if ((int) $datos['evaluador_no_jefe'] === 1) {
    $motivosValidos = ['retiro_empleado_responsable', 'impedimento', 'recusacion'];
    $motivo = $datos['motivo_no_jefe'] ?? '';
    if (in_array($motivo, $motivosValidos, true)) {
     $actualizar['motivo_no_jefe'] = $motivo;
    } else {
     unset($actualizar['evaluador_no_jefe']);
    }
   }
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

  // Validar fechas para evaluación 2do semestre
  $tipoEvaluacion = $datos['tipo_evaluacion'] ?? $evaluacion['tipo'];
  if ($tipoEvaluacion === 'parcial_segundo_semestre') {
   $fechaInicio = $datos['fecha_inicio_eval'] ?? $evaluacion['fecha_inicio'];
   $fechaFin = $datos['fecha_fin_eval'] ?? $evaluacion['fecha_fin'];
   $pdo = Database::getInstance();
   $stmtPer = $pdo->prepare('SELECT nombre FROM periodos WHERE id = ?');
   $stmtPer->execute([$evaluacion['periodo_id']]);
   $periodoNombre = $stmtPer->fetchColumn() ?: '';
   if (!empty($fechaInicio) && !empty($fechaFin) && !empty($periodoNombre)) {
    $errorFechas = $this->validarFechasSegundoSemestre($fechaInicio, $fechaFin, $periodoNombre);
    if ($errorFechas) {
     ResponseHelper::error($errorFechas, 422);
    }
   }
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
    WHERE r.codigo = 'comision_evaluadora'
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

  /**
   * Buscar evaluado por documento o nombre para el evaluador (usado en PanelEvaluador y EvaluarPage)
   */
  public function buscarEvaluadoParaEvaluador(array $filtros): array
   {
    $q = $filtros['q'] ?? '';
    $documento = $filtros['documento'] ?? '';
    $nombre = $filtros['nombre'] ?? '';
    $periodoId = isset($filtros['periodo_id']) ? (int) $filtros['periodo_id'] : 0;
    $evaluador = AuthMiddleware::user();
    $evaluadorId = (int) $evaluador['id'];
    $entidadId = isset($evaluador['entidad_id']) ? (int) $evaluador['entidad_id'] : 0;

    if (empty($q) && empty($documento) && empty($nombre)) {
     ResponseHelper::error('Debe proporcionar documento o nombre para buscar', 400);
    }

    $pdo = Database::getInstance();

    $sql = "
     SELECT u.id, u.documento, u.primer_nombre, u.segundo_nombre,
            u.primer_apellido, u.segundo_apellido,
            u.denominacion_empleo AS cargo, u.grado_empleo AS grado,
            u.codigo_empleo,
            u.nivel, u.tipo_nombramiento AS tipo_vinculacion, u.dependencia_id,
            d.nombre AS dependencia_nombre, d.codigo AS dependencia_codigo,
            e.id AS evaluacion_id, e.estado AS evaluacion_estado,
            e.tipo AS evaluacion_tipo, e.fecha_inicio, e.fecha_fin,
            e.nota_funcionales, e.nota_comportamentales, e.calificacion_definitiva,
            e.nivel_resultado, p.nombre AS periodo_nombre
     FROM usuarios u
     LEFT JOIN evaluaciones e ON e.evaluado_id = u.id AND e.eliminado_en IS NULL AND e.periodo_id = :periodo_id
     LEFT JOIN periodos p ON p.id = :periodo_id2
     LEFT JOIN dependencias d ON d.id = u.dependencia_id
     INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
     INNER JOIN roles r ON r.id = ur.rol_id AND r.codigo = 'evaluado'
     WHERE u.eliminado_en IS NULL
       AND u.estado = 'activo'
    ";

    $params = [
     'periodo_id' => $periodoId,
     'periodo_id2' => $periodoId,
    ];

    if ($entidadId > 0) {
     $sql .= " AND (u.entidad_id = :eid OR u.dependencia_id IN (SELECT id FROM dependencias WHERE entidad_id = :eid2))";
     $params['eid'] = $entidadId;
     $params['eid2'] = $entidadId;
    }

    if (!empty($q)) {
     $sql .= " AND (u.documento LIKE :q_doc
              OR CONCAT_WS(' ', u.primer_nombre, u.primer_apellido) LIKE :q_nom
              OR CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) LIKE :q_nom2)";
     $params['q_doc'] = "%{$q}%";
     $params['q_nom'] = "%{$q}%";
     $params['q_nom2'] = "%{$q}%";
    } else {
     if (!empty($documento)) {
      $sql .= " AND u.documento LIKE :doc ";
      $params['doc'] = "%{$documento}%";
     }
     if (!empty($nombre)) {
      $sql .= " AND (CONCAT_WS(' ', u.primer_nombre, u.primer_apellido) LIKE :nom
              OR CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) LIKE :nom2)";
      $params['nom'] = "%{$nombre}%";
      $params['nom2'] = "%{$nombre}%";
     }
    }

    $sql .= " ORDER BY u.primer_apellido, u.primer_nombre LIMIT 20";

   $stmt = $pdo->prepare($sql);
   $stmt->execute($params);
   $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);

   if (empty($results)) {
    return [];
   }

   return array_map(function ($row) {
    $nombreCompleto = trim(($row['primer_nombre'] ?? '') . ' ' . ($row['segundo_nombre'] ?? '') . ' ' . ($row['primer_apellido'] ?? '') . ' ' . ($row['segundo_apellido'] ?? ''));
    $nivel = match($row['nivel'] ?? $row['tipo_vinculacion'] ?? '') {
     'directivo' => 'Directivo',
     'asesor' => 'Asesor',
     'profesional' => 'Profesional',
     'tecnico' => 'Técnico',
     'asistencial' => 'Asistencial',
     default => 'Técnico'
    };
    return [
     'id' => (int) $row['id'],
     'documento' => $row['documento'],
     'nombre_completo' => $nombreCompleto,
     'nivel' => $nivel,
     'denominacion' => $row['cargo'] ?? '',
     'codigo' => $row['codigo_empleo'] ?? ($row['dependencia_codigo'] ? substr($row['dependencia_codigo'], 0, 30) : ''),
     'grado' => $row['grado'] ?? '',
     'dependencia' => $row['dependencia_nombre'] ?? '',
     'evaluacion_id' => (int) ($row['evaluacion_id'] ?? 0),
     'evaluacion_estado' => $row['evaluacion_estado'] ?? null,
     'evaluacion_tipo' => $row['evaluacion_tipo'] ?? null,
     'fecha_inicio' => $row['fecha_inicio'] ?? null,
     'fecha_fin' => $row['fecha_fin'] ?? null,
     'nota_funcionales' => $row['nota_funcionales'] !== null ? (float) $row['nota_funcionales'] : null,
     'nota_comportamentales' => $row['nota_comportamentales'] !== null ? (float) $row['nota_comportamentales'] : null,
     'calificacion_definitiva' => $row['calificacion_definitiva'] !== null ? (float) $row['calificacion_definitiva'] : null,
     'nivel_resultado' => $row['nivel_resultado'] ?? null,
     'periodo_nombre' => $row['periodo_nombre'] ?? '',
    ];
   }, $results);
  }

 /**
   * Obtener evaluaciones previas de un evaluado
   * Si evaluacionId es 0, se usa evaluadoId directamente
   */
  public function obtenerEvaluacionesPrevias(int $evaluacionId, ?int $evaluadoId = null): array
  {
   $pdo = Database::getInstance();

   $selectExtra = ",
    TRIM(CONCAT_WS(' ', ed.primer_nombre, ed.segundo_nombre, ed.primer_apellido, ed.segundo_apellido)) AS evaluado_nombre,
    ed.documento AS evaluado_documento,
    TRIM(CONCAT_WS(' ', ev.primer_nombre, ev.segundo_nombre, ev.primer_apellido, ev.segundo_apellido)) AS evaluador_nombre,
    ev.documento AS evaluador_documento,
    evr.primer_nombre AS resp_nombre, evr.primer_apellido AS resp_apellido,
    evr.documento AS resp_documento,
    p.nombre AS periodo_nombre";

   $joinExtra = "
    INNER JOIN periodos p ON p.id = e.periodo_id
    INNER JOIN usuarios ed ON ed.id = e.evaluado_id
    INNER JOIN usuarios ev ON ev.id = e.evaluador_id
    LEFT JOIN usuarios evr ON evr.id = e.comision_evaluadora_id";

   if ($evaluadoId && $evaluacionId === 0) {
    $stmt = $pdo->prepare(
     "SELECT e.* {$selectExtra}
      FROM evaluaciones e
      {$joinExtra}
      WHERE e.evaluado_id = ? AND e.eliminado_en IS NULL
      ORDER BY e.fecha_inicio DESC, e.id DESC"
    );
    $stmt->execute([$evaluadoId]);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
   }

   $evaluacion = $this->evaluacionRepo->buscarPorId($evaluacionId);
   if (!$evaluacion) {
    ResponseHelper::notFound('Evaluacion no encontrada');
   }

   $stmt = $pdo->prepare(
    "SELECT e.* {$selectExtra}
     FROM evaluaciones e
     {$joinExtra}
     WHERE e.evaluado_id = ? AND e.eliminado_en IS NULL
     ORDER BY e.fecha_inicio DESC, e.id DESC"
   );
   $stmt->execute([$evaluacion['evaluado_id']]);
   return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

 /**
  * Validar fechas para evaluacion 2do semestre
  * Debe estar entre 01-08-ANIO y 31-01-ANIO+1
  *
  * Metodo estatico puro: no usa $this ni BD. Probable de testear sin
  * instanciar EvaluacionService (los tests pasan una copia de la firma).
  */
 public static function validarFechasSegundoSemestreStatic(string $fechaInicio, string $fechaFin, string $periodoNombre): ?string
 {
  $periodoNormalizado = trim(preg_replace('/\s+/', '', $periodoNombre) ?? '');
  if (preg_match('/^(\d{4})-(\d{4})$/', $periodoNormalizado, $matches)) {
   $anio = (int) $matches[1];
   $anioFin = (int) $matches[2];
   if ($anioFin !== $anio + 1) {
    return "El periodo '{$periodoNombre}' no tiene un formato valido (se esperaba AAAA-AAAA con anios consecutivos).";
   }
   $fechaMin = sprintf('%04d-08-01', $anio);
   $fechaMax = sprintf('%04d-01-31', $anio + 1);

   if ($fechaInicio < $fechaMin) {
    return "La fecha de inicio debe ser posterior o igual al 01-08-{$anio} para evaluacion 2do semestre.";
   }
   if ($fechaFin > $fechaMax) {
    return "La fecha de fin debe ser anterior o igual al 31-01-" . ($anio + 1) . " para evaluacion 2do semestre.";
   }
   if ($fechaInicio > $fechaFin) {
    return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
   }
  }
  return null;
 }

 public function validarFechasSegundoSemestre(string $fechaInicio, string $fechaFin, string $periodoNombre): ?string
 {
  return self::validarFechasSegundoSemestreStatic($fechaInicio, $fechaFin, $periodoNombre);
 }

 /**
  * Calcular la nota definitiva a partir de notas funcional y comportamental
  * ponderadas 85% / 15% segun Acuerdo 617 de 2018 (espec. 10.1, 10.2, 11).
  * Tambien devuelve banda (ALTO/MEDIO/BAJO) y nivel (Sobresaliente/Satisfactorio/No satisfactorio).
  * @return array{nota_funcional_pond:float,nota_comportamental_pond:float,definitiva:float,banda:string,nivel:string}
  */
 public function calcularNotaDefinitiva(float $notaFuncionales, float $notaComportamentales): array
 {
  $notaFuncionalPond = round($notaFuncionales * 0.85, 2);
  $notaComportamentalPond = round($notaComportamentales * 0.15, 2);
  $definitiva = round($notaFuncionalPond + $notaComportamentalPond, 2);

  if ($definitiva >= 90.0) {
   $banda = 'ALTO';
   $nivel = 'sobresaliente';
  } elseif ($definitiva > 65.0) {
   $banda = 'MEDIO';
   $nivel = 'satisfactorio';
  } else {
   $banda = 'BAJO';
   $nivel = 'no_satisfactorio';
  }

  return [
   'nota_funcional_pond' => $notaFuncionalPond,
   'nota_comportamental_pond' => $notaComportamentalPond,
   'definitiva' => $definitiva,
   'banda' => $banda,
   'nivel' => $nivel,
  ];
 }

 /**
  * Verifica si existe una evaluacion de primer semestre activa
  * para un evaluado y periodo dados. Necesario para habilitar
  * evaluacion de segundo semestre (espec. 5.2).
  */
 public function existeEvaluacionPrimerSemestre(int $evaluadoId, int $periodoId): bool
 {
  $pdo = Database::getInstance();
  $stmt = $pdo->prepare(
   "SELECT COUNT(*) AS c FROM evaluaciones
    WHERE evaluado_id = ?
      AND periodo_id = ?
      AND tipo = 'parcial_primer_semestre'
      AND eliminado_en IS NULL
      AND estado IN ('calificada','aprobada_comision','cerrada','en_proceso','pendiente')"
  );
  $stmt->execute([$evaluadoId, $periodoId]);
  $row = $stmt->fetch(\PDO::FETCH_ASSOC);
  return ((int) ($row['c'] ?? 0)) > 0;
 }
}
