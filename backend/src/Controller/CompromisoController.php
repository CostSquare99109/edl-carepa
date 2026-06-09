<?php

namespace App\Controller;

use App\Service\CompromisoService;
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
			SELECT u.id, u.documento, u.nombres, u.apellidos, u.cargo, u.grado,
			       u.tipo_vinculacion, u.dependencia_id,
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

		$nombreCompleto = trim($evaluado['nombres'] . ' ' . $evaluado['apellidos']);
		$primerNombre = explode(' ', $evaluado['nombres'])[0];

		// Mapear nivel según tipo_vinculacion y grado
		$nivel = match($evaluado['tipo_vinculacion']) {
			'planta' => 'Directivo',
			'contrato' => 'Asesor',
			'provisional' => 'Técnico',
			'encargo' => 'Asesor',
			'comision' => 'Profesional',
			default => 'Técnico'
		};

		ResponseHelper::success([
			'id' => (int) $evaluado['id'],
			'documento' => $evaluado['documento'],
			'nombre_completo' => $nombreCompleto,
			'nombres' => $evaluado['nombres'],
			'apellidos' => $evaluado['apellidos'],
			'nivel' => $nivel,
			'denominacion' => $evaluado['cargo'] ?? '',
			'codigo' => $evaluado['dependencia_nombre'] ? substr($evaluado['dependencia_nombre'], 0, 30) : '',
			'grado' => $evaluado['grado'] ?? '',
			'evaluacion_id' => (int) $evaluado['evaluacion_id'],
			'evaluacion_estado' => $evaluado['evaluacion_estado'],
			'periodo_id' => (int) $evaluado['periodo_id'],
			'periodo_nombre' => $evaluado['periodo_nombre'],
			'es_comision_evaluadora' => (int) $evaluado['es_comision_evaluadora'],
		]);
	}

	/** Listar competencias comportamentales (Decreto 2539/2005 y 815/2018) */
	public function competenciasComportamentales(): void
	{
		$pdo = Database::getInstance();
		$stmt = $pdo->query("SELECT id, nombre, decreto, descripcion FROM competencias_comportamentales WHERE estado = 'activa' ORDER BY decreto, nombre");
		$competencias = $stmt->fetchAll(\PDO::FETCH_ASSOC);
		ResponseHelper::success($competencias);
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

		// Obtener evaluado_id de la evaluación (el responsable es el evaluado)
		$stmtEval = $pdo->prepare("SELECT evaluado_id FROM evaluaciones WHERE id = :eid");
		$stmtEval->execute(['eid' => $input['evaluacion_id']]);
		$evaluadoId = $stmtEval->fetchColumn();
		if (!$evaluadoId) {
			ResponseHelper::error('Evaluación no encontrada', 404);
		}

		// Verificar máximo 5 compromisos funcionales
		$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM compromisos WHERE evaluacion_id = :eid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmt->execute(['eid' => $input['evaluacion_id']]);
		$count = $stmt->fetchColumn();

		if ($count >= 5 && empty($input['id'])) {
			ResponseHelper::error('No se pueden agregar más de 5 compromisos funcionales', 422);
		}

		$datos = [
			'evaluacion_id' => (int) $input['evaluacion_id'],
			'meta_id' => isset($input['meta_id']) ? (int) $input['meta_id'] : null,
			'tipo' => 'funcional',
			'descripcion' => $input['descripcion'],
			'peso' => $peso,
			'responsable_id' => $evaluadoId,
			'evaluador_id' => $user['id'],
			'estado' => 'aprobado',
			'tipo_concertacion' => $input['tipo_concertacion'] ?? null,
			'no_es_jefe_inmediato' => isset($input['no_es_jefe_inmediato']) ? (int) $input['no_es_jefe_inmediato'] : 0,
			'motivo_cambio_evaluador' => $input['motivo_cambio_evaluador'] ?? null,
		];

		if (!empty($input['id'])) {
			// Actualizar existente
			$sets = [];
			$params = [];
			foreach (['meta_id', 'descripcion', 'peso'] as $col) {
				if (isset($datos[$col])) {
					$sets[] = "{$col} = :{$col}";
					$params[$col] = $datos[$col];
				}
			}
			$sets[] = "actualizado_en = NOW()";
			$params['id'] = $input['id'];
			$stmt = $pdo->prepare("UPDATE compromisos SET " . implode(', ', $sets) . " WHERE id = :id AND eliminado_en IS NULL");
			$stmt->execute($params);
			$id = $input['id'];
		} else {
			// Crear nuevo
			$columns = implode(', ', array_keys($datos));
			$placeholders = implode(', ', array_map(fn($k) => ":$k", array_keys($datos)));
			$stmt = $pdo->prepare("INSERT INTO compromisos ($columns) VALUES ($placeholders)");
			$stmt->execute($datos);
			$id = $pdo->lastInsertId();
		}

		// Verificar suma de pesos
		$stmt = $pdo->prepare("SELECT COALESCE(SUM(peso), 0) as total FROM compromisos WHERE evaluacion_id = :eid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmt->execute(['eid' => $input['evaluacion_id']]);
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

		// Obtener evaluacion_id ANTES de eliminar
		$stmtEval = $pdo->prepare("SELECT evaluacion_id FROM compromisos WHERE id = :id AND tipo = 'funcional' AND evaluador_id = :uid AND eliminado_en IS NULL");
		$stmtEval->execute(['id' => $id, 'uid' => $user['id']]);
		$evalId = $stmtEval->fetchColumn();

		if (!$evalId) {
			ResponseHelper::error('Compromiso no encontrado o no tiene permiso para eliminarlo', 404);
		}

		$stmt = $pdo->prepare("UPDATE compromisos SET eliminado_en = NOW() WHERE id = :id AND tipo = 'funcional' AND evaluador_id = :uid AND eliminado_en IS NULL");
		$stmt->execute(['id' => $id, 'uid' => $user['id']]);

		// Obtener suma de pesos restantes
		$stmt3 = $pdo->prepare("SELECT COALESCE(SUM(peso), 0) as total FROM compromisos WHERE evaluacion_id = :eid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmt3->execute(['eid' => $evalId]);

		ResponseHelper::success(['suma_pesos_funcionales' => (float) $stmt3->fetchColumn()], 'Compromiso funcional eliminado');
	}

	/** Eliminar compromiso comportamental */
	public function eliminarComportamental(int $id): void
	{
		$pdo = Database::getInstance();
		$user = AuthMiddleware::user();

		$stmt = $pdo->prepare("UPDATE compromisos SET eliminado_en = NOW() WHERE id = :id AND tipo = 'comportamental' AND evaluador_id = :uid AND eliminado_en IS NULL");
		$stmt->execute(['id' => $id, 'uid' => $user['id']]);

		if ($stmt->rowCount() === 0) {
			ResponseHelper::error('Compromiso no encontrado o no tiene permiso para eliminarlo', 404);
		}

		// Eliminar también la relación en compromiso_comportamental
		$stmt2 = $pdo->prepare("DELETE FROM compromiso_comportamental WHERE compromiso_id = :cid");
		$stmt2->execute(['cid' => $id]);

		ResponseHelper::success(null, 'Compromiso comportamental eliminado');
	}

	/** Aceptar compromiso por parte del evaluado */
	public function aceptarEvaluado(int $id): void
	{
		$pdo = Database::getInstance();
		$user = AuthMiddleware::user();

		// Verificar que el compromiso pertenece a este evaluado (responsable_id)
		$stmt = $pdo->prepare("SELECT id, estado FROM compromisos WHERE id = :id AND responsable_id = :uid AND eliminado_en IS NULL");
		$stmt->execute(['id' => $id, 'uid' => $user['id']]);
		$comp = $stmt->fetch(\PDO::FETCH_ASSOC);

		if (!$comp) {
			ResponseHelper::error('Compromiso no encontrado o no tiene permiso', 404);
		}

		if ($comp['estado'] !== 'propuesto' && $comp['estado'] !== 'aprobado') {
			ResponseHelper::error('Solo puede aceptar compromisos en estado propuesto o aprobado', 400);
		}

		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);

		$obs = isset($input['observaciones_evaluado']) ? trim($input['observaciones_evaluado']) : null;

		$stmtUp = $pdo->prepare("UPDATE compromisos SET estado = 'aceptado_evaluado', observaciones_evaluado = COALESCE(:obs, observaciones_evaluado), actualizado_en = NOW() WHERE id = :id");
		$stmtUp->execute(['id' => $id, 'obs' => $obs]);

		ResponseHelper::success(['id' => $id, 'estado' => 'aceptado_evaluado'], 'Compromiso aceptado');
	}

	/** Rechazar compromiso por parte del evaluado */
	public function rechazarEvaluado(int $id): void
	{
	$pdo = Database::getInstance();
	$user = AuthMiddleware::user();

	// Verificar que el compromiso pertenece a este evaluado (responsable_id)
	$stmt = $pdo->prepare("SELECT id, estado FROM compromisos WHERE id = :id AND responsable_id = :uid AND eliminado_en IS NULL");
	$stmt->execute(['id' => $id, 'uid' => $user['id']]);
	$comp = $stmt->fetch(\PDO::FETCH_ASSOC);

	if (!$comp) {
	ResponseHelper::error('Compromiso no encontrado o no tiene permiso', 404);
	}

	if ($comp['estado'] !== 'propuesto' && $comp['estado'] !== 'aprobado') {
	ResponseHelper::error('Solo puede rechazar compromisos en estado propuesto o aprobado', 400);
	}

	$input = json_decode(file_get_contents('php://input'), true) ?: [];
	$input = SanitizerHelper::sanitizeArray($input);

	$obs = isset($input['observaciones_evaluado']) ? trim($input['observaciones_evaluado']) : '';
	if ($obs === '') {
	ResponseHelper::error('Debe indicar el motivo del rechazo', 400);
	}

	$stmtUp = $pdo->prepare("UPDATE compromisos SET estado = 'rechazado_evaluado', observaciones_evaluado = :obs, actualizado_en = NOW() WHERE id = :id");
	$stmtUp->execute(['id' => $id, 'obs' => $obs]);

	ResponseHelper::success(['id' => $id, 'estado' => 'rechazado_evaluado'], 'Compromiso rechazado');
	}

	/** Evaluado acepta TODOS los compromisos de una evaluacion en bloque */
	public function aceptarConcertacionEvaluado(int $evaluacionId): void
	{
	$pdo = Database::getInstance();
	$user = AuthMiddleware::user();

	// Verificar que la evaluacion pertenece a este evaluado
	$stmt = $pdo->prepare("SELECT evaluado_id FROM evaluaciones WHERE id = :id AND eliminado_en IS NULL");
	$stmt->execute(['id' => $evaluacionId]);
	$eval = $stmt->fetch(\PDO::FETCH_ASSOC);
	if (!$eval || (int) $eval['evaluado_id'] !== (int) $user['id']) {
	ResponseHelper::error('Evaluación no encontrada o no tiene permiso', 404);
	}

	$input = json_decode(file_get_contents('php://input'), true) ?: [];
	$obs = isset($input['observaciones_evaluado']) ? trim($input['observaciones_evaluado']) : null;

	// Cambiar todos los compromisos pendiente_evaluado a aceptado
	$stmtUp = $pdo->prepare("
	UPDATE compromisos
	SET estado = 'aceptado_evaluado',
	observaciones_evaluado = COALESCE(:obs, observaciones_evaluado),
	actualizado_en = NOW()
	WHERE evaluacion_id = :eid
	AND estado = 'pendiente_evaluado'
	AND eliminado_en IS NULL
	");
	$stmtUp->execute(['eid' => $evaluacionId, 'obs' => $obs]);

	$afectados = $stmtUp->rowCount();

	if ($afectados === 0) {
	ResponseHelper::error('No hay compromisos pendientes de aceptación en esta evaluación', 400);
	}

	// Cambiar estado de la evaluacion
	$stmtEval = $pdo->prepare("UPDATE evaluaciones SET estado = 'aceptada_evaluado', actualizado_en = NOW() WHERE id = :id");
	$stmtEval->execute(['id' => $evaluacionId]);

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

	// Verificar que la evaluacion pertenece a este evaluado
	$stmt = $pdo->prepare("SELECT evaluado_id FROM evaluaciones WHERE id = :id AND eliminado_en IS NULL");
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

	// Cambiar todos los compromisos pendiente_evaluado a rechazado
	$stmtUp = $pdo->prepare("
	UPDATE compromisos
	SET estado = 'rechazado_evaluado',
	observaciones_evaluado = :obs,
	actualizado_en = NOW()
	WHERE evaluacion_id = :eid
	AND estado = 'pendiente_evaluado'
	AND eliminado_en IS NULL
	");
	$stmtUp->execute(['eid' => $evaluacionId, 'obs' => $obs]);

	$afectados = $stmtUp->rowCount();

	if ($afectados === 0) {
	ResponseHelper::error('No hay compromisos pendientes en esta evaluación', 400);
	}

	// Cambiar estado de la evaluacion a rechazada -> procede fijacion unilateral
	$stmtEval = $pdo->prepare("UPDATE evaluaciones SET estado = 'rechazada_evaluado', actualizado_en = NOW() WHERE id = :id");
	$stmtEval->execute(['id' => $evaluacionId]);

	// Notificar al evaluador
	$stmtNotif = $pdo->prepare("
	INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, evaluacion_id, creado_en)
	VALUES (:uid, 'rechazo_concertacion', 'Concertación rechazada por el evaluado', :msg, :eid, NOW())
	");
	$stmtNotif->execute([
	'uid' => $eval['evaluado_id'],
	'eid' => $evaluacionId,
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

		// Obtener evaluado_id de la evaluación
		$stmtEval = $pdo->prepare("SELECT evaluado_id FROM evaluaciones WHERE id = :eid");
		$stmtEval->execute(['eid' => $input['evaluacion_id']]);
		$evaluadoId = $stmtEval->fetchColumn();
		if (!$evaluadoId) {
			ResponseHelper::error('Evaluación no encontrada', 404);
		}

		// Crear un compromiso comportamental por cada competencia seleccionada
		$ids = [];
		foreach ($competencias as $comp) {
			$competenciaId = (int) ($comp['competencia_id'] ?? 0);
			$esPropuestoJefe = isset($comp['es_propuesto_jefe']) ? (int) $comp['es_propuesto_jefe'] : 0;

			if ($competenciaId <= 0) continue;

			// Obtener nombre de la competencia
			$stmtComp = $pdo->prepare("SELECT nombre FROM competencias_comportamentales WHERE id = :cid AND estado = 'activa'");
			$stmtComp->execute(['cid' => $competenciaId]);
			$nombreComp = $stmtComp->fetchColumn();
			if (!$nombreComp) continue;

		$stmt = $pdo->prepare("
			INSERT INTO compromisos (evaluacion_id, tipo, descripcion, peso, responsable_id, evaluador_id, estado, es_propuesto_jefe, tipo_concertacion)
			VALUES (:eid, 'comportamental', :desc, 0, :resp_id, :eval_id, 'aprobado', :prop_jefe, :tipo_conc)
		");
		$stmt->execute([
			'eid' => $input['evaluacion_id'],
			'desc' => $nombreComp,
			'resp_id' => $evaluadoId,
			'eval_id' => $user['id'],
			'prop_jefe' => $esPropuestoJefe,
			'tipo_conc' => $input['tipo_concertacion'] ?? null,
		]);

			$compromisoId = $pdo->lastInsertId();

			// Crear relación en compromiso_comportamental
			$stmtRel = $pdo->prepare("
				INSERT INTO compromiso_comportamental (compromiso_id, competencia_id, es_propuesto_jefe)
				VALUES (:comp_id, :compet_id, :prop_jefe)
			");
			$stmtRel->execute([
				'comp_id' => $compromisoId,
				'compet_id' => $competenciaId,
				'prop_jefe' => $esPropuestoJefe,
			]);

			$ids[] = (int) $compromisoId;
		}

		ResponseHelper::success(['ids' => $ids, 'total' => count($ids)], 'Compromisos comportamentales guardados');
	}

	/** Listar compromisos de una evaluación (para el evaluador) */
	public function listarPorEvaluacion(int $evaluacionId): void
	{
		$pdo = Database::getInstance();

		$stmt = $pdo->prepare("
			SELECT c.*, 
			       cc.competencia_id,
			       cb.nombre AS competencia_nombre,
			       cb.decreto AS competencia_decreto
			FROM compromisos c
			LEFT JOIN compromiso_comportamental cc ON cc.compromiso_id = c.id
			LEFT JOIN competencias_comportamentales cb ON cb.id = cc.competencia_id
			WHERE c.evaluacion_id = :eid 
			  AND c.eliminado_en IS NULL
			ORDER BY c.tipo, c.id
		");
		$stmt->execute(['eid' => $evaluacionId]);
		$rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

		// Agrupar compromisos comportamentales
		$funcionales = [];
		$comportamentales = [];

		foreach ($rows as $row) {
			if ($row['tipo'] === 'funcional') {
				$funcionales[] = $row;
			} else {
				$comportamentales[] = $row;
			}
		}

		// Suma de pesos
		$stmtP = $pdo->prepare("SELECT COALESCE(SUM(peso), 0) FROM compromisos WHERE evaluacion_id = :eid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmtP->execute(['eid' => $evaluacionId]);
		$sumaPesos = (float) $stmtP->fetchColumn();

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

		// Verificar que la evaluación pertenece a este evaluador
		$stmt = $pdo->prepare("SELECT * FROM evaluaciones WHERE id = :id AND evaluador_id = :uid AND eliminado_en IS NULL");
		$stmt->execute(['id' => $evaluacionId, 'uid' => $user['id']]);
		$eval = $stmt->fetch(\PDO::FETCH_ASSOC);
		if (!$eval) {
			ResponseHelper::error('Evaluación no encontrada o no tiene permiso', 404);
		}

		// Verificar compromisos funcionales (min 1, max 5)
		$stmtF = $pdo->prepare("SELECT COUNT(*) as total, COALESCE(SUM(peso),0) as suma FROM compromisos WHERE evaluacion_id = :eid AND tipo = 'funcional' AND eliminado_en IS NULL");
		$stmtF->execute(['eid' => $evaluacionId]);
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

		// Verificar compromisos comportamentales (min 3, max 5)
		$stmtC = $pdo->prepare("SELECT COUNT(*) as total FROM compromisos WHERE evaluacion_id = :eid AND tipo = 'comportamental' AND eliminado_en IS NULL");
		$stmtC->execute(['eid' => $evaluacionId]);
		$compTotal = (int) $stmtC->fetchColumn();

		if ($compTotal < 3) {
			ResponseHelper::error('Debe ingresar al menos 3 compromisos comportamentales', 422);
		}
		if ($compTotal > 5) {
			ResponseHelper::error('No puede tener más de 5 compromisos comportamentales', 422);
		}

		// Cambiar todos los compromisos de la evaluacion a pendiente_evaluado
		// para que el evaluado deba aceptar o rechazar
		$stmtUp2 = $pdo->prepare("UPDATE compromisos SET estado = 'pendiente_evaluado', actualizado_en = NOW() WHERE evaluacion_id = :eid AND eliminado_en IS NULL");
		$stmtUp2->execute(['eid' => $evaluacionId]);

		// Crear notificacion al evaluado
		$stmtNotif = $pdo->prepare("
		INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, evaluacion_id, creado_en)
		VALUES (:uid, 'concertacion', 'Concertación de compromisos pendiente', :msg, :eid, NOW())
		");
		$stmtNotif->execute([
		'uid' => $eval['evaluado_id'],
		'eid' => $evaluacionId,
		'msg' => 'Su evaluador ha concertado compromisos funcionales y competencias comportamentales para su evaluación. Debe aceptar o rechazar la concertación.',
		]);

		// Actualizar estado de la evaluación a 'concertacion'
		$stmtUp = $pdo->prepare("UPDATE evaluaciones SET estado = 'concertacion', fecha_concertacion = CURDATE(), actualizado_en = NOW() WHERE id = :id");
		$stmtUp->execute(['id' => $evaluacionId]);

		ResponseHelper::success(null, 'Concertación de compromisos confirmada. Se ha notificado al evaluado para que acepte o rechace.');
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
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);
		$user = AuthMiddleware::user();

		$puntaje = isset($input['puntaje']) ? (float) $input['puntaje'] : null;
		if ($puntaje === null) {
			ResponseHelper::error('El puntaje es requerido', 400);
		}
		if ($puntaje < 0 || $puntaje > 100) {
			ResponseHelper::error('El puntaje debe estar entre 0 y 100', 400);
		}

		$observaciones = $input['observaciones'] ?? '';
		$this->service->calificar($id, $puntaje, $observaciones, $user);
		ResponseHelper::success(null, 'Compromiso calificado');
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
		LEFT JOIN competencias_comportamentales comp ON comp.id = c.competencia_id AND c.tipo = 'comportamental'
		LEFT JOIN metas m ON m.id = c.meta_id AND c.tipo = 'funcional'
		WHERE c.evaluacion_id = :eid
		AND c.estado = 'propuesto'
		AND c.eliminado_en IS NULL
		ORDER BY c.tipo, c.id
		");
		$stmt->execute(['eid' => $evaluacionId]);
		$compromisos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

		ResponseHelper::success($compromisos);
		}
		}
