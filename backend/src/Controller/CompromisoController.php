<?php

namespace App\Controller;

use App\Service\CompromisoService;
use App\Service\ConcertacionService;
use App\Service\AuditoriaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;
use App\Config\Database;

class CompromisoController
{
	private CompromisoService $service;

	public function __construct()
	{
		$this->service = new CompromisoService();
	}

	/** Listar compromisos (con filtros: estado, evaluador_id, responsable_id) */
	public function listar(): void
	{
		$filtros = SanitizerHelper::sanitizeArray($_GET);
		$pagina = (int) ($_GET['pagina'] ?? 1);
		$porPagina = (int) ($_GET['por_pagina'] ?? 20);
		$resultado = $this->service->listar($filtros, $pagina, $porPagina);
		ResponseHelper::success($resultado);
	}

	/** Buscar evaluado por documento para concertación */
	public function buscarEvaluado(): void
	{
		$documento = $_GET['documento'] ?? '';
		$periodoId = isset($_GET['periodo_id']) ? (int) $_GET['periodo_id'] : 0;

		if (empty($documento)) {
			ResponseHelper::error('El documento es requerido', 400);
		}

		$pdo = Database::getInstance();

		$sql = "
			SELECT u.id, u.documento, u.primer_nombre, u.segundo_nombre,
			       u.primer_apellido, u.segundo_apellido,
			       u.denominacion_empleo AS cargo, u.grado_empleo AS grado,
			       u.nivel, u.tipo_nombramiento AS tipo_vinculacion, u.dependencia_id,
			       d.nombre AS dependencia_nombre,
			       e.id AS evaluacion_id, e.estado AS evaluacion_estado,
			       e.periodo_id, e.es_comision_evaluadora,
			       p.nombre AS periodo_nombre
			FROM usuarios u
			LEFT JOIN evaluaciones e ON e.evaluado_id = u.id AND e.eliminado_en IS NULL
			LEFT JOIN periodos p ON p.id = e.periodo_id
			LEFT JOIN dependencias d ON d.id = u.dependencia_id
			WHERE u.documento = :doc
			  AND u.eliminado_en IS NULL
		";

		$params = ['doc' => $documento];

		if ($periodoId > 0) {
			$sql .= " AND (e.periodo_id = :periodo_id OR e.periodo_id IS NULL)";
			$params['periodo_id'] = $periodoId;
		}

		$sql .= " ORDER BY e.id DESC LIMIT 1";

		$stmt = $pdo->prepare($sql);
		$stmt->execute($params);
		$evaluado = $stmt->fetch(\PDO::FETCH_ASSOC);

		if (!$evaluado) {
			ResponseHelper::error('No se encontró un evaluado con ese documento registrado en el sistema.', 404);
		}

		$nombreCompleto = trim(($evaluado['primer_nombre'] ?? '') . ' ' . ($evaluado['primer_apellido'] ?? ''));
		$primerNombre = ($evaluado['primer_nombre'] ?? '');

		$nivel = match($evaluado['nivel'] ?? $evaluado['tipo_vinculacion'] ?? '') {
			'directivo' => 'Directivo',
			'asesor' => 'Asesor',
			'profesional' => 'Profesional',
			'tecnico' => 'Técnico',
			'asistencial' => 'Asistencial',
			default => 'Técnico'
		};

		ResponseHelper::success([
			'id' => (int) $evaluado['id'],
			'documento' => $evaluado['documento'],
			'nombre_completo' => $nombreCompleto,
			'nombres' => $evaluado['primer_nombre'] ?? '',
			'apellidos' => $evaluado['primer_apellido'] ?? '',
			'nivel' => $nivel,
			'denominacion' => $evaluado['cargo'] ?? '',
			'codigo' => $evaluado['dependencia_nombre'] ? substr($evaluado['dependencia_nombre'], 0, 30) : '',
			'grado' => $evaluado['grado'] ?? '',
			'evaluacion_id' => (int) ($evaluado['evaluacion_id'] ?? 0),
			'evaluacion_estado' => $evaluado['evaluacion_estado'],
			'periodo_id' => (int) ($evaluado['periodo_id'] ?? 0),
			'periodo_nombre' => $evaluado['periodo_nombre'],
			'es_comision_evaluadora' => (int) ($evaluado['es_comision_evaluadora'] ?? 0),
		]);
	}

	/** Listar competencias comportamentales (Decreto 2539/2005 y 815/2018) */
	public function competenciasComportamentales(): void
	{
		$pdo = Database::getInstance();
		$stmt = $pdo->query("SELECT codigo as id, nombre, decreto, descripcion FROM competencias ORDER BY decreto, nombre");
		$competencias = $stmt->fetchAll(\PDO::FETCH_ASSOC);
		ResponseHelper::success($competencias);
	}

	public function crear(int $concertacionId): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$pdo = Database::getInstance();

		$stmtCon = $pdo->prepare("SELECT id, evaluado_id, evaluador_id, periodo_id, tipo_concertacion FROM concertaciones WHERE id = ? AND eliminado_en IS NULL");
		$stmtCon->execute([$concertacionId]);
		$concertacion = $stmtCon->fetch(\PDO::FETCH_ASSOC);

		if (!$concertacion) {
			ResponseHelper::error('Concertacion no encontrada', 404);
		}

		$tipo = $input['tipo'] ?? 'funcional';
		$descripcion = $input['descripcion'] ?? '';
		$peso = (float) ($input['peso'] ?? 0);

		if (empty($descripcion)) {
			ResponseHelper::error('descripcion es requerido', 422);
		}
		if ($peso <= 0 || $peso > 100) {
			ResponseHelper::error('peso debe ser mayor a 0 y maximo 100', 422);
		}

		$stmt = $pdo->prepare("
			INSERT INTO compromisos (concertacion_id, meta_id, competencia_codigo, tipo, peso, descripcion, propuesto_por_jefe_entidad, estado, observaciones_evaluador)
			VALUES (:cid, :mid, :cc, :tipo, :peso, :desc, :prop_jefe, :estado, :obs_eval)
		");

		$stmt->execute([
			'cid' => $concertacionId,
			'mid' => $input['meta_id'] ?? null,
			'cc' => $input['competencia_codigo'] ?? $input['competencia_id'] ?? null,
			'tipo' => $tipo,
			'peso' => $peso,
			'desc' => $descripcion,
			'prop_jefe' => $input['es_propuesto_jefe'] ?? 1,
			'estado' => $input['estado'] ?? 'propuesto',
			'obs_eval' => $input['observaciones_evaluador'] ?? null,
		]);

		$compromisoId = (int) $pdo->lastInsertId();

		\App\Service\AuditoriaService::registrar('crear_compromiso', 'compromisos', $compromisoId);

		ResponseHelper::success(['id' => $compromisoId, 'concertacion_id' => $concertacionId], 'Compromiso creado', 201);
	}

	/** Guardar compromiso funcional (individual) */
	public function guardarFuncional(): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$requeridos = ['evaluacion_id', 'descripcion', 'peso'];
		foreach ($requeridos as $campo) {
			if (!isset($input[$campo]) || $input[$campo] === '') {
				ResponseHelper::error("El campo {$campo} es requerido", 400);
			}
		}

		$peso = (float) $input['peso'];
		if ($peso <= 0 || $peso > 100) {
			ResponseHelper::error('El peso debe ser mayor a 0 y máximo 100', 422);
		}

		$pdo = Database::getInstance();

		$stmtEval = $pdo->prepare("SELECT evaluado_id, periodo_id, concertacion_id FROM evaluaciones WHERE id = :eid");
		$stmtEval->execute(['eid' => $input['evaluacion_id']]);
		$evaluacion = $stmtEval->fetch(\PDO::FETCH_ASSOC);
		if (!$evaluacion) {
			ResponseHelper::error('Evaluación no encontrada', 404);
		}
		$concertacionId = $evaluacion['concertacion_id'];
		if (!$concertacionId) {
			$concertacionService = new ConcertacionService();
			$concertacionId = $concertacionService->crear([
				'periodo_id' => $evaluacion['periodo_id'],
				'evaluado_id' => $evaluacion['evaluado_id'],
				'evaluador_id' => $user['id'],
				'tipo_concertacion' => $input['tipo_concertacion'] ?? 'concertacion_bilateral',
			]);
		}

		$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM compromisos WHERE concertacion_id = :cid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmt->execute(['cid' => $concertacionId]);
		$count = $stmt->fetchColumn();

		$stmtPrueba = $pdo->prepare("SELECT u.en_periodo_prueba FROM usuarios u INNER JOIN concertaciones con ON con.evaluado_id = u.id WHERE con.id = :cid");
		$stmtPrueba->execute(['cid' => $concertacionId]);
		$esPrueba = (bool) $stmtPrueba->fetchColumn();
		$maxFunc = $esPrueba ? (int) \App\Config\Env::get('MAX_COMPROMISOS_FUNCIONALES_PRUEBA', 3) : (int) \App\Config\Env::get('MAX_COMPROMISOS_FUNCIONALES', 5);
		if ($count >= $maxFunc && empty($input['id'])) {
			ResponseHelper::error("No se pueden agregar más de {$maxFunc} compromisos funcionales", 422);
		}

		// Validacion CNSC: estructura verbo + objeto + condicion de resultado
		\App\Service\CompromisoService::validarEstructuraVerboObjetoCondicionStatic($input['descripcion']);

		if (!empty($input['id'])) {
			$sets = [];
			$params = [];
			foreach (['meta_id', 'descripcion', 'peso'] as $col) {
				if (isset($input[$col])) {
					$sets[] = "{$col} = :{$col}";
					$params[$col] = $input[$col];
				}
			}
			$sets[] = "actualizado_en = NOW()";
			$params['id'] = $input['id'];
			$stmt = $pdo->prepare("UPDATE compromisos SET " . implode(', ', $sets) . " WHERE id = :id AND eliminado_en IS NULL");
			$stmt->execute($params);
			$id = $input['id'];
		} else {
$stmt = $pdo->prepare("INSERT INTO compromisos (concertacion_id, meta_id, tipo, descripcion, peso, estado, es_propuesto_evaluado) VALUES (:cid, :mid, 'funcional', :desc, :peso, 'propuesto', :es_prop_evaluado)");
		$stmt->execute([
			'cid' => $concertacionId,
			'mid' => isset($input['meta_id']) ? (int) $input['meta_id'] : null,
			'desc' => $input['descripcion'],
			'peso' => $peso,
			'es_prop_evaluado' => isset($input['es_propuesto_evaluado']) ? 1 : 0,
		]);
			$id = $pdo->lastInsertId();
		}

		$stmt = $pdo->prepare("SELECT COALESCE(SUM(peso), 0) as total FROM compromisos WHERE concertacion_id = :cid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmt->execute(['cid' => $concertacionId]);
		$sumaPesos = (float) $stmt->fetchColumn();

		ResponseHelper::success([
			'id' => (int) $id,
			'suma_pesos_funcionales' => $sumaPesos,
		], 'Compromiso funcional guardado');
	}

	/** Eliminar compromiso funcional */
	public function eliminarFuncional(int $id): void
	{
		$pdo = Database::getInstance();
		$user = AuthMiddleware::user();

		$stmtEval = $pdo->prepare("SELECT c.id, con.id AS concertacion_id FROM compromisos c INNER JOIN concertaciones con ON con.id = c.concertacion_id WHERE c.id = :id AND c.tipo = 'funcional' AND con.evaluador_id = :uid AND c.eliminado_en IS NULL");
		$stmtEval->execute(['id' => $id, 'uid' => $user['id']]);
		$row = $stmtEval->fetch(\PDO::FETCH_ASSOC);

		if (!$row) {
			ResponseHelper::error('Compromiso no encontrado o no tiene permiso para eliminarlo', 404);
		}

		$stmt = $pdo->prepare("UPDATE compromisos SET eliminado_en = NOW() WHERE id = :id AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmt->execute(['id' => $id]);

		$stmt3 = $pdo->prepare("SELECT COALESCE(SUM(peso), 0) as total FROM compromisos WHERE concertacion_id = :cid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmt3->execute(['cid' => $row['concertacion_id']]);

		ResponseHelper::success(['suma_pesos_funcionales' => (float) $stmt3->fetchColumn()], 'Compromiso funcional eliminado');
	}

	/** Eliminar compromiso comportamental */
	public function eliminarComportamental(int $id): void
	{
		$pdo = Database::getInstance();
		$user = AuthMiddleware::user();

		$stmt = $pdo->prepare("UPDATE compromisos c INNER JOIN concertaciones con ON con.id = c.concertacion_id SET c.eliminado_en = NOW() WHERE c.id = :id AND c.tipo = 'comportamental' AND con.evaluador_id = :uid AND c.eliminado_en IS NULL");
		$stmt->execute(['id' => $id, 'uid' => $user['id']]);

		if ($stmt->rowCount() === 0) {
			ResponseHelper::error('Compromiso no encontrado o no tiene permiso para eliminarlo', 404);
		}

		ResponseHelper::success(null, 'Compromiso comportamental eliminado');
	}

	/** Aceptar compromiso por parte del evaluado */
	public function aceptarEvaluado(int $id): void
	{
		$pdo = Database::getInstance();
		$user = AuthMiddleware::user();

		$stmt = $pdo->prepare("SELECT c.id, c.estado FROM compromisos c INNER JOIN concertaciones con ON con.id = c.concertacion_id WHERE c.id = :id AND con.evaluado_id = :uid AND c.eliminado_en IS NULL");
		$stmt->execute(['id' => $id, 'uid' => $user['id']]);
		$comp = $stmt->fetch(\PDO::FETCH_ASSOC);

		if (!$comp) {
			ResponseHelper::error('Compromiso no encontrado o no tiene permiso', 404);
		}

		if (!in_array($comp['estado'], ['propuesto', 'aprobado', 'pendiente_aprobacion'])) {
			ResponseHelper::error('Solo puede aceptar compromisos en estado propuesto, pendiente_aprobacion o aprobado', 400);
		}

		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);

		$obs = isset($input['observaciones_evaluado']) ? trim($input['observaciones_evaluado']) : null;

		$stmtUp = $pdo->prepare("UPDATE compromisos SET estado = 'aprobado', observaciones_evaluado = COALESCE(:obs, observaciones_evaluado), actualizado_en = NOW() WHERE id = :id");
		$stmtUp->execute(['id' => $id, 'obs' => $obs]);

		ResponseHelper::success(['id' => $id, 'estado' => 'aprobado'], 'Compromiso aprobado');
	}

	/** Rechazar compromiso por parte del evaluado */
	public function rechazarEvaluado(int $id): void
	{
	$pdo = Database::getInstance();
	$user = AuthMiddleware::user();

	$stmt = $pdo->prepare("SELECT c.id, c.estado FROM compromisos c INNER JOIN concertaciones con ON con.id = c.concertacion_id WHERE c.id = :id AND con.evaluado_id = :uid AND c.eliminado_en IS NULL");
	$stmt->execute(['id' => $id, 'uid' => $user['id']]);
	$comp = $stmt->fetch(\PDO::FETCH_ASSOC);

	if (!$comp) {
	ResponseHelper::error('Compromiso no encontrado o no tiene permiso', 404);
	}

	if ($comp['estado'] !== 'propuesto') {
	ResponseHelper::error('Solo puede rechazar compromisos en estado propuesto', 400);
	}

	$input = json_decode(file_get_contents('php://input'), true) ?: [];
	$input = SanitizerHelper::sanitizeArray($input);

	$obs = isset($input['observaciones_evaluado']) ? trim($input['observaciones_evaluado']) : '';
	if ($obs === '') {
	ResponseHelper::error('Debe indicar el motivo del rechazo', 400);
	}

	$stmtUp = $pdo->prepare("UPDATE compromisos SET estado = 'devuelto', observaciones_evaluado = :obs, actualizado_en = NOW() WHERE id = :id");
	$stmtUp->execute(['id' => $id, 'obs' => $obs]);

	ResponseHelper::success(['id' => $id, 'estado' => 'devuelto'], 'Compromiso rechazado');
	}

	/** Evaluado acepta TODOS los compromisos de una evaluacion en bloque */
	public function aceptarConcertacionEvaluado(int $evaluacionId): void
	{
	$pdo = Database::getInstance();
	$user = AuthMiddleware::user();

	$stmt = $pdo->prepare("SELECT evaluado_id, evaluador_id, concertacion_id FROM evaluaciones WHERE id = :id AND eliminado_en IS NULL");
	$stmt->execute(['id' => $evaluacionId]);
	$eval = $stmt->fetch(\PDO::FETCH_ASSOC);
	if (!$eval || (int) $eval['evaluado_id'] !== (int) $user['id']) {
	ResponseHelper::error('Evaluación no encontrada o no tiene permiso', 404);
	}

	$input = json_decode(file_get_contents('php://input'), true) ?: [];
	$obs = isset($input['observaciones_evaluado']) ? trim($input['observaciones_evaluado']) : null;

	$stmtUp = $pdo->prepare("
	UPDATE compromisos
	SET estado = 'aprobado',
	observaciones_evaluado = COALESCE(:obs, observaciones_evaluado),
	actualizado_en = NOW()
	WHERE concertacion_id = :cid
	AND estado IN ('propuesto', 'pendiente_aprobacion')
	AND eliminado_en IS NULL
	");
	$stmtUp->execute(['cid' => $eval['concertacion_id'], 'obs' => $obs]);

	$afectados = $stmtUp->rowCount();

	if ($afectados === 0) {
	ResponseHelper::error('No hay compromisos pendientes de aceptación en esta evaluación', 400);
	}

	$stmtEval = $pdo->prepare("UPDATE evaluaciones SET estado = 'cerrada', actualizado_en = NOW() WHERE id = :id");
	$stmtEval->execute(['id' => $evaluacionId]);

	$stmtNotif = $pdo->prepare("
	INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, creado_en)
	VALUES (:uid, 'exito', 'Concertación aceptada por el evaluado', :msg, NOW())
	");
	$stmtNotif->execute([
	'uid' => $eval['evaluador_id'],
	'msg' => 'El evaluado ha aceptado la concertación de compromisos. Los compromisos están aprobados y listos para la etapa de evaluación.',
	]);

	ResponseHelper::success([
	'evaluacion_id' => $evaluacionId,
	'compromisos_aceptados' => $afectados,
	], 'Concertación aceptada. Todos los compromisos han sido aprobados.');
	}

	/** Evaluado rechaza TODA la concertacion de una evaluacion en bloque */
	public function rechazarConcertacionEvaluado(int $evaluacionId): void
	{
	$pdo = Database::getInstance();
	$user = AuthMiddleware::user();

	$stmt = $pdo->prepare("SELECT evaluado_id, evaluador_id, concertacion_id FROM evaluaciones WHERE id = :id AND eliminado_en IS NULL");
	$stmt->execute(['id' => $evaluacionId]);
	$eval = $stmt->fetch(\PDO::FETCH_ASSOC);
	if (!$eval || (int) $eval['evaluado_id'] !== (int) $user['id']) {
	ResponseHelper::error('Evaluación no encontrada o no tiene permiso', 404);
	}

	$input = json_decode(file_get_contents('php://input'), true) ?: [];
	$obs = isset($input['observaciones_evaluado']) ? trim($input['observaciones_evaluado']) : '';
	if ($obs === '') {
	ResponseHelper::error('Debe indicar el motivo del rechazo de la concertación', 400);
	}

	$stmtUp = $pdo->prepare("
	UPDATE compromisos
	SET estado = 'devuelto',
	observaciones_evaluado = :obs,
	actualizado_en = NOW()
	WHERE concertacion_id = :cid
	AND estado IN ('propuesto', 'pendiente_aprobacion')
	AND eliminado_en IS NULL
	");
	$stmtUp->execute(['cid' => $eval['concertacion_id'], 'obs' => $obs]);

	$afectados = $stmtUp->rowCount();

	if ($afectados === 0) {
	ResponseHelper::error('No hay compromisos pendientes en esta evaluación', 400);
	}

	$stmtEval = $pdo->prepare("UPDATE evaluaciones SET estado = 'pendiente', actualizado_en = NOW() WHERE id = :id");
	$stmtEval->execute(['id' => $evaluacionId]);

	$stmtNotif = $pdo->prepare("
	INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, creado_en)
	VALUES (:uid, 'alerta', 'Concertación rechazada por el evaluado', :msg, NOW())
	");
	$stmtNotif->execute([
	'uid' => $eval['evaluador_id'],
	'msg' => 'El evaluado ha rechazado la concertación de compromisos. Puede proceder con la fijación unilateral conforme al Art. 33 de la Resolución 1760 de 2010.',
	]);

	ResponseHelper::success([
	'evaluacion_id' => $evaluacionId,
	'compromisos_rechazados' => $afectados,
	], 'Concertación rechazada. El evaluador será notificado para proceder con fijación unilateral.');
	}

	/** Guardar compromiso comportamental con competencias */
	public function guardarComportamental(): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$requeridos = ['evaluacion_id', 'competencias'];
		foreach ($requeridos as $campo) {
			if (empty($input[$campo])) {
				ResponseHelper::error("El campo {$campo} es requerido", 400);
			}
		}

		$competencias = $input['competencias'];
		if (!is_array($competencias) || count($competencias) < 3) {
			ResponseHelper::error('Debe seleccionar al menos 3 competencias comportamentales', 422);
		}
		if (count($competencias) > 5) {
			ResponseHelper::error('No se pueden seleccionar más de 5 competencias comportamentales', 422);
		}

		$pdo = Database::getInstance();

		$stmtEval = $pdo->prepare("SELECT evaluado_id, periodo_id, concertacion_id FROM evaluaciones WHERE id = :eid");
		$stmtEval->execute(['eid' => $input['evaluacion_id']]);
		$evaluacion = $stmtEval->fetch(\PDO::FETCH_ASSOC);
		if (!$evaluacion) {
			ResponseHelper::error('Evaluación no encontrada', 404);
		}
		$concertacionId = $evaluacion['concertacion_id'];
		if (!$concertacionId) {
			$concertacionService = new ConcertacionService();
			$concertacionId = $concertacionService->crear([
				'periodo_id' => $evaluacion['periodo_id'],
				'evaluado_id' => $evaluacion['evaluado_id'],
				'evaluador_id' => $user['id'],
				'tipo_concertacion' => $input['tipo_concertacion'] ?? 'concertacion_bilateral',
			]);
		}

		// Crear un compromiso comportamental por cada competencia seleccionada
		$ids = [];
		foreach ($competencias as $comp) {
			$competenciaCodigo = $comp['competencia_codigo'] ?? $comp['competencia_id'] ?? null;
			$esPropuestoJefe = isset($comp['es_propuesto_jefe']) ? (int) $comp['es_propuesto_jefe'] : 0;

			if (!$competenciaCodigo) continue;

			$stmtComp = $pdo->prepare("SELECT codigo, nombre FROM competencias WHERE codigo = :cod");
			$stmtComp->execute(['cod' => $competenciaCodigo]);
			$competencia = $stmtComp->fetch(\PDO::FETCH_ASSOC);
			if (!$competencia) continue;

		$stmt = $pdo->prepare("
			INSERT INTO compromisos (concertacion_id, tipo, descripcion, peso, estado, competencia_codigo, propuesto_por_jefe_entidad, es_propuesto_evaluado)
			VALUES (:cid, 'comportamental', :desc, 0, 'propuesto', :cc, :prop_jefe, :es_prop_evaluado)
		");
		$stmt->execute([
			'cid' => $concertacionId,
			'desc' => $competencia['nombre'],
			'cc' => $competencia['codigo'],
			'prop_jefe' => $esPropuestoJefe,
			'es_prop_evaluado' => isset($input['es_propuesto_evaluado']) ? 1 : 0,
		]);

			$compromisoId = $pdo->lastInsertId();
			$ids[] = (int) $compromisoId;
		}

		ResponseHelper::success(['ids' => $ids, 'total' => count($ids)], 'Compromisos comportamentales guardados');
	}

	/** Listar compromisos de una evaluación (para el evaluador) */
	/** Listar compromisos de una evaluación (para el evaluador) con conductas predefinidas */
	public function listarPorEvaluacion(int $evaluacionId): void
	{
		$compromisos = $this->service->compromisosConConductas($evaluacionId);

		$funcionales = [];
		$comportamentales = [];
		foreach ($compromisos as $c) {
			if ($c['tipo'] === 'funcional') {
				$funcionales[] = $c;
			} else {
				$comportamentales[] = $c;
			}
		}

		$sumaPesos = 0;
		foreach ($funcionales as $f) {
			$sumaPesos += (float) $f['peso'];
		}

		ResponseHelper::success([
			'funcionales' => $funcionales,
			'comportamentales' => $comportamentales,
			'suma_pesos_funcionales' => $sumaPesos,
		]);
	}

	/** Confirmar concertación de compromisos */
	public function confirmarConcertacion(int $evaluacionId): void
	{
		$pdo = Database::getInstance();
		$user = AuthMiddleware::user();

		$stmt = $pdo->prepare("SELECT * FROM evaluaciones WHERE id = :id AND evaluador_id = :uid AND eliminado_en IS NULL");
		$stmt->execute(['id' => $evaluacionId, 'uid' => $user['id']]);
		$eval = $stmt->fetch(\PDO::FETCH_ASSOC);
		if (!$eval) {
			ResponseHelper::error('Evaluación no encontrada o no tiene permiso', 404);
		}

		$concertacionId = (int) $eval['concertacion_id'];

		$stmtF = $pdo->prepare("SELECT COUNT(*) as total, COALESCE(SUM(peso),0) as suma FROM compromisos WHERE concertacion_id = :cid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmtF->execute(['cid' => $concertacionId]);
		$funcData = $stmtF->fetch(\PDO::FETCH_ASSOC);

		if ($funcData['total'] < 1) {
			ResponseHelper::error('Debe ingresar al menos 1 compromiso funcional', 422);
		}
		if ($funcData['total'] > 5) {
			ResponseHelper::error('No puede tener más de 5 compromisos funcionales', 422);
		}
		if (abs((float)$funcData['suma'] - 100) > 0.01) {
			ResponseHelper::error('La suma de los pesos funcionales debe ser exactamente 100. Actualmente suma: ' . $funcData['suma'], 422);
		}

		$stmtC = $pdo->prepare("SELECT COUNT(*) as total FROM compromisos WHERE concertacion_id = :cid AND tipo = 'comportamental' AND eliminado_en IS NULL");
		$stmtC->execute(['cid' => $concertacionId]);
		$compTotal = (int) $stmtC->fetchColumn();

		if ($compTotal < 3) {
			ResponseHelper::error('Debe ingresar al menos 3 compromisos comportamentales', 422);
		}
		if ($compTotal > 5) {
			ResponseHelper::error('No puede tener más de 5 compromisos comportamentales', 422);
		}

		$stmtUp2 = $pdo->prepare("UPDATE compromisos SET estado = 'pendiente_aprobacion', actualizado_en = NOW() WHERE concertacion_id = :cid AND eliminado_en IS NULL");
		$stmtUp2->execute(['cid' => $concertacionId]);

	$stmtNotif = $pdo->prepare("
	INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, creado_en)
	VALUES (:uid, 'info', 'Concertación de compromisos pendiente', :msg, NOW())
	");
	$stmtNotif->execute([
	'uid' => $eval['evaluado_id'],
	'msg' => 'Su evaluador ha concertado compromisos funcionales y competencias comportamentales para su evaluación. Debe aceptar o rechazar la concertación.',
	]);

		$stmtUp = $pdo->prepare("UPDATE evaluaciones SET estado = 'cerrada', fecha_concertacion = CURDATE(), actualizado_en = NOW() WHERE id = :id");
		$stmtUp->execute(['id' => $evaluacionId]);

		ResponseHelper::success(null, 'Concertación de compromisos confirmada. Se ha notificado al evaluado.');
	}

	/** Funcionario envía un compromiso para aprobación del evaluador */
	public function enviar(): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$requeridos = ['evaluacion_id', 'tipo', 'descripcion', 'evaluador_id'];
		foreach ($requeridos as $campo) {
			if (empty($input[$campo])) {
				ResponseHelper::error("El campo {$campo} es requerido", 400);
			}
		}

		$tiposValidos = ['funcional', 'comportamental'];
		if (!in_array($input['tipo'], $tiposValidos)) {
			ResponseHelper::error('Tipo de compromiso invalido. Debe ser: funcional o comportamental', 422);
		}

		$datos = [
			'evaluacion_id' => (int) $input['evaluacion_id'],
			'tipo' => $input['tipo'],
			'descripcion' => $input['descripcion'],
			'resultado_esperado' => $input['resultado_esperado'] ?? null,
			'medio_verificacion' => $input['medio_verificacion'] ?? null,
			'observaciones_evaluado' => $input['observaciones_evaluado'] ?? null,
			'plazo' => $input['plazo'] ?? null,
			'responsable_id' => $user['id'],
			'evaluador_id' => (int) $input['evaluador_id'],
			'estado' => 'propuesto',
		];

		$id = $this->service->enviar($datos, $user);
		ResponseHelper::success(['id' => $id], 'Compromiso propuesto para aprobacion');
	}

	/** Evaluador aprueba un compromiso asignando peso */
	public function aprobar(int $id): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$peso = isset($input['peso']) ? (float) $input['peso'] : null;
		if ($peso === null) {
			ResponseHelper::error('El peso es requerido', 400);
		}
		if ($peso < 0 || $peso > 100) {
			ResponseHelper::error('El peso debe estar entre 0 y 100', 400);
		}

		$observaciones = $input['observaciones_evaluador'] ?? '';
		$this->service->aprobar($id, $peso, $observaciones, $user);
		ResponseHelper::success(null, 'Compromiso aprobado');
	}

	/** Evaluador rechaza un compromiso */
	public function rechazar(int $id): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$observaciones = $input['observaciones_evaluador'] ?? '';
		$this->service->rechazar($id, $observaciones, $user);
		ResponseHelper::success(null, 'Compromiso rechazado');
	}

	/** Obtener resumen de pesos de compromisos de una evaluación */
	public function resumenPesos(int $evaluacionId): void
	{
		$user = AuthMiddleware::user();
		$resultado = $this->service->resumenPesos($evaluacionId, $user);
		ResponseHelper::success($resultado);
	}

	/** Obtener compromisos pendientes de aprobación para el evaluador */
	public function pendientesAprobacion(): void
	{
		$user = AuthMiddleware::user();
		$pagina = (int) ($_GET['pagina'] ?? 1);
		$porPagina = (int) ($_GET['por_pagina'] ?? 20);
		$resultado = $this->service->pendientesAprobacion($user, $pagina, $porPagina);
		ResponseHelper::success($resultado);
	}

	public function actualizar(int $id): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$this->service->actualizar($id, $input);
		ResponseHelper::success(null, 'Compromiso actualizado');
	}

	/** Evaluador califica un compromiso */
	public function calificar(int $id): void
	{
		$input = json_decode(file_get_contents("php://input"), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$puntaje = isset($input["puntaje"]) ? (float) $input["puntaje"] : null;
		if ($puntaje === null) {
			ResponseHelper::error("El puntaje es requerido", 400);
		}
		if ($puntaje < 0 || $puntaje > 100) {
			ResponseHelper::error("El puntaje debe estar entre 0 y 100", 400);
		}

		$observaciones = $input["observaciones"] ?? "";
		$conductas = $input["conductas"] ?? null;
		$impactoAporta = $input["impacto_aporta_compromisos"] ?? null;
		$impactoExcede = $input["impacto_excede_estipulado"] ?? null;
		$justificacionExcede = $input["justificacion_excede"] ?? null;

		$this->service->calificar($id, $puntaje, $observaciones, $conductas, $user, $impactoAporta, $impactoExcede, $justificacionExcede);
		ResponseHelper::success(null, "Compromiso calificado");
	}

	/** Evaluador devuelve un compromiso al evaluado */
	public function devolver(int $id): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$observaciones = $input['observaciones_evaluador'] ?? '';
		if (empty($observaciones)) {
			ResponseHelper::error('Las observaciones son requeridas al devolver un compromiso', 422);
		}

		$this->service->devolver($id, $observaciones, $user);
		ResponseHelper::success(null, 'Compromiso devuelto al evaluado');
		}

		public function validarAntesDeFirmar(int $concertacionId): void
		{
		$concertacion = (new \App\Repository\ConcertacionRepository(Database::getInstance()))->buscarPorId($concertacionId);
		if (!$concertacion) {
		ResponseHelper::notFound('Concertacion no encontrada');
		}

		$validacion = $this->service->validarCompromisosAntesDeFirmar($concertacionId, (int) $concertacion['evaluado_id']);
		ResponseHelper::success($validacion);
		}

		/** Obtener compromisos propuestos por el evaluado para una evaluacion */
		public function propuestosPorEvaluado(): void
		{
		$evaluacionId = (int) ($_GET['evaluacion_id'] ?? 0);
		if ($evaluacionId <= 0) {
		ResponseHelper::error('evaluacion_id es requerido', 400);
		}

		$pdo = Database::getInstance();
		$stmt = $pdo->prepare("
		SELECT c.id, c.tipo, c.descripcion, c.peso,
		CASE WHEN c.tipo = 'comportamental' THEN comp.nombre ELSE NULL END AS competencia_nombre,
		CASE WHEN c.tipo = 'funcional' THEN m.descripcion ELSE NULL END AS meta_nombre
		FROM compromisos c
		INNER JOIN concertaciones con ON con.id = c.concertacion_id
		LEFT JOIN competencias comp ON comp.codigo = c.competencia_codigo AND c.tipo = 'comportamental'
		LEFT JOIN metas m ON m.id = c.meta_id AND c.tipo = 'funcional'
		WHERE con.id = (SELECT concertacion_id FROM evaluaciones WHERE id = :eid)
		AND c.estado = 'propuesto'
		AND c.eliminado_en IS NULL
		ORDER BY c.tipo, c.id
		");
		$stmt->execute(['eid' => $evaluacionId]);
		$compromisos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

		ResponseHelper::success($compromisos);
		}
		}
