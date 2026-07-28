<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\CompromisoService;
use App\Service\ConcertacionService;
use App\Service\AuditoriaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;
use App\Config\Database;

/**
 * Controller para Paquete 1: Compromisos Funcionales.
 *
 * A partir de la separación de paquetes (julio 2026) este controller
 * SOLO gestiona compromisos funcionales. Los compromisos comportamentales
 * se exponen en CompromisoComportamentalController (Paquete 2).
 *
 * No comparte estado, validaciones ni registros con Paquete 2.
 */
class CompromisoController
{
    private CompromisoService $service;

    public function __construct()
    {
        $this->service = new CompromisoService();
    }

    public function listar(): void
    {
        $filtros = SanitizerHelper::sanitizeArray($_GET);
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->listar($filtros, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

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

        $nivel = match($evaluado['nivel'] ?? $evaluado['tipo_vinculacion'] ?? '') {
            'directivo' => 'Directivo',
            'asesor' => 'Asesor',
            'profesional' => 'Profesional',
            'tecnico' => 'Técnico',
            'asistencial' => 'Asistencial',
            default => 'Técnico'
        };

        // Obtener todas las evaluaciones del empleado para este período
        $evaluaciones = [];
        if ($evaluado['id']) {
            $stmtEvals = $pdo->prepare("
                SELECT id, tipo, estado, periodo_id, concertacion_id
                FROM evaluaciones
                WHERE evaluado_id = :uid AND eliminado_en IS NULL
                ORDER BY id DESC
            ");
            $stmtEvals->execute(['uid' => $evaluado['id']]);
            $evaluaciones = $stmtEvals->fetchAll(\PDO::FETCH_ASSOC);
        }

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
            'dependencia_id' => (int) ($evaluado['dependencia_id'] ?? 0),
            'evaluaciones' => $evaluaciones,
        ]);
    }

    public function crear(int $concertacionId): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $input['concertacion_id'] = $concertacionId;
        $id = $this->service->crear($input);
        ResponseHelper::success(['id' => $id], 'Compromiso funcional creado', 201);
    }

    public function guardarFuncional(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $user = AuthMiddleware::user();

        $requeridos = ['evaluacion_id', 'descripcion'];
        foreach ($requeridos as $campo) {
            if (empty($input[$campo])) {
                ResponseHelper::error("El campo {$campo} es requerido", 400);
            }
        }

        $evaluacionId = (int) $input['evaluacion_id'];
        $pdo = Database::getInstance();

        $stmtEval = $pdo->prepare("SELECT evaluado_id, periodo_id, concertacion_id FROM evaluaciones WHERE id = :eid AND eliminado_en IS NULL");
        $stmtEval->execute(['eid' => $evaluacionId]);
        $evaluacion = $stmtEval->fetch(\PDO::FETCH_ASSOC);

        if (!$evaluacion) {
            $evaluadoId = !empty($input['evaluado_id']) ? (int) $input['evaluado_id'] : 0;
            if ($evaluadoId <= 0) {
                ResponseHelper::error('Se requiere evaluado_id para crear una nueva evaluación', 400);
            }
            $periodoId = !empty($input['periodo_id']) ? (int) $input['periodo_id'] : 0;
            if ($periodoId <= 0) {
                $stmtPeriodo = $pdo->query("SELECT id FROM periodos WHERE estado IN ('configuracion','concertacion','seguimiento','evaluacion','calificacion') AND eliminado_en IS NULL ORDER BY fecha_inicio DESC LIMIT 1");
                $periodoId = (int) $stmtPeriodo->fetchColumn();
            }
            if ($periodoId <= 0) {
                ResponseHelper::error('No hay un periodo activo para crear la evaluación', 400);
            }

            $evService = new \App\Service\EvaluacionService();
            $evaluacionId = $evService->crear([
                'periodo_id' => $periodoId,
                'evaluado_id' => $evaluadoId,
                'evaluador_id' => $user['id'],
                'tipo' => 'parcial_primer_semestre',
            ]);
            $evaluacion = [
                'evaluado_id' => $evaluadoId,
                'periodo_id' => $periodoId,
                'concertacion_id' => null,
            ];
            $input['evaluacion_id'] = $evaluacionId;
        } else {
            $evaluadoId = (int) $evaluacion['evaluado_id'];
            $periodoId = (int) $evaluacion['periodo_id'];
        }

        $concertacionId = $evaluacion['concertacion_id'];
        if (!$concertacionId) {
            $concertacionService = new ConcertacionService();
            $concertacionId = $concertacionService->crear([
                'periodo_id' => $periodoId,
                'evaluado_id' => $evaluadoId,
                'evaluador_id' => $user['id'],
                'tipo_concertacion' => $input['tipo_concertacion'] ?? 'concertacion_bilateral',
                'evaluacion_id' => $evaluacionId,
            ]);
        }

        $input['peso'] = $input['peso'] ?? 0;
        $input['meta_id'] = $input['meta_id'] ?? null;

        $id = $this->service->crear($input);
        ResponseHelper::success(['id' => $id, 'evaluacion_id' => $evaluacionId], 'Compromiso funcional guardado');
    }

    public function eliminarFuncional(int $id): void
    {
        $user = AuthMiddleware::user();
        $this->service->eliminar($id, $user);
        ResponseHelper::success(null, 'Compromiso funcional eliminado');
    }

    public function aceptarEvaluado(int $id): void
    {
        $pdo = Database::getInstance();
        $user = AuthMiddleware::user();

        $stmt = $pdo->prepare("SELECT c.id, c.estado FROM compromisos c INNER JOIN concertaciones con ON con.id = c.concertacion_id WHERE c.id = :id AND c.tipo = 'funcional' AND con.evaluado_id = :uid AND c.eliminado_en IS NULL");
        $stmt->execute(['id' => $id, 'uid' => $user['id']]);
        $comp = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$comp) {
            ResponseHelper::error('Compromiso funcional no encontrado o no tiene permiso', 404);
        }

        if (!in_array($comp['estado'], ['propuesto', 'aprobado', 'pendiente_aprobacion'])) {
            ResponseHelper::error('Solo puede aceptar compromisos en estado propuesto, pendiente_aprobacion o aprobado', 400);
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);

        $obs = isset($input['observaciones_evaluado']) ? trim($input['observaciones_evaluado']) : null;

        $stmtUp = $pdo->prepare("UPDATE compromisos SET estado = 'aprobado', observaciones_evaluado = COALESCE(:obs, observaciones_evaluado), actualizado_en = NOW() WHERE id = :id AND tipo = 'funcional'");
        $stmtUp->execute(['id' => $id, 'obs' => $obs]);

        ResponseHelper::success(['id' => $id, 'estado' => 'aprobado'], 'Compromiso funcional aprobado');
    }

    public function rechazarEvaluado(int $id): void
    {
        $pdo = Database::getInstance();
        $user = AuthMiddleware::user();

        $stmt = $pdo->prepare("SELECT c.id, c.estado FROM compromisos c INNER JOIN concertaciones con ON con.id = c.concertacion_id WHERE c.id = :id AND c.tipo = 'funcional' AND con.evaluado_id = :uid AND c.eliminado_en IS NULL");
        $stmt->execute(['id' => $id, 'uid' => $user['id']]);
        $comp = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$comp) {
            ResponseHelper::error('Compromiso funcional no encontrado o no tiene permiso', 404);
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

        $stmtUp = $pdo->prepare("UPDATE compromisos SET estado = 'devuelto', observaciones_evaluado = :obs, actualizado_en = NOW() WHERE id = :id AND tipo = 'funcional'");
        $stmtUp->execute(['id' => $id, 'obs' => $obs]);

        ResponseHelper::success(['id' => $id, 'estado' => 'devuelto'], 'Compromiso funcional rechazado');
    }

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

        // Aceptar la concertacion aprueba TODOS los compromisos (funcionales +
        // comportamentales). Antes solo aprobaba funcionales -- los comportamentales
        // quedaban en 'propuesto' para siempre. Ahora es consistente con el rechazo.
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

        // Desglose por tipo para reporte al frontend y auditoria.
        $stmtBreaks = $pdo->prepare("
            SELECT tipo, COUNT(*) AS total
            FROM compromisos
            WHERE concertacion_id = :cid
              AND estado = 'aprobado'
              AND eliminado_en IS NULL
              AND actualizado_en >= (NOW() - INTERVAL 2 SECOND)
            GROUP BY tipo
        ");
        $stmtBreaks->execute(['cid' => $eval['concertacion_id']]);
        $desglose = [];
        foreach ($stmtBreaks->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $desglose[$row['tipo']] = (int) $row['total'];
        }

        $stmtEval = $pdo->prepare("UPDATE evaluaciones SET estado = 'cerrada', actualizado_en = NOW() WHERE id = :id");
        $stmtEval->execute(['id' => $evaluacionId]);

        $stmtNotif = $pdo->prepare("
            INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, creado_en)
            VALUES (:uid, 'exito', 'Concertación aceptada por el evaluado', :msg, NOW())
        ");
        $detalleNotif = sprintf(
            'Compromisos: %d funcionales, %d comportamentales.',
            $desglose['funcional'] ?? 0,
            $desglose['comportamental'] ?? 0
        );
        $stmtNotif->execute([
            'uid' => $eval['evaluador_id'],
            'msg' => 'El evaluado ha aceptado la concertación. ' . $detalleNotif,
        ]);

        AuditoriaService::registrar('aceptar_concertacion_evaluado', 'evaluaciones', $evaluacionId, [
            'concertacion_id' => (int) $eval['concertacion_id'],
            'compromisos_aprobados' => $afectados,
            'desglose' => $desglose,
            'observaciones_evaluado' => $obs,
        ]);

        ResponseHelper::success([
            'evaluacion_id' => $evaluacionId,
            'compromisos_aprobados' => $afectados,
            'funcionales' => $desglose['funcional'] ?? 0,
            'comportamentales' => $desglose['comportamental'] ?? 0,
        ], 'Concertación aceptada.');
    }

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

        // Al rechazar la concertacion, el evaluado devuelve TODOS los compromisos
        // de esa concertacion (funcionales + comportamentales) para que el evaluador
        // los ajuste y reenvie. Antes solo rechazaba funcionales, lo que dejaba
        // los comportamentales 'propuesto' firmes mientras los funcionales quedaban
        // en 'devuelto' -- comportamiento asimetrico y confuso.
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

        // Desglose por tipo para reportar al frontend y al log de auditoria.
        $stmtBreaks = $pdo->prepare("
            SELECT tipo, COUNT(*) AS total
            FROM compromisos
            WHERE concertacion_id = :cid
              AND estado = 'devuelto'
              AND eliminado_en IS NULL
              AND actualizado_en >= (NOW() - INTERVAL 2 SECOND)
            GROUP BY tipo
        ");
        $stmtBreaks->execute(['cid' => $eval['concertacion_id']]);
        $desglose = [];
        foreach ($stmtBreaks->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $desglose[$row['tipo']] = (int) $row['total'];
        }

        $stmtEval = $pdo->prepare("UPDATE evaluaciones SET estado = 'pendiente', actualizado_en = NOW() WHERE id = :id");
        $stmtEval->execute(['id' => $evaluacionId]);

        $stmtNotif = $pdo->prepare("
            INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, creado_en)
            VALUES (:uid, 'alerta', 'Concertación rechazada por el evaluado', :msg, NOW())
        ");
        $detalleNotif = sprintf(
            'Compromisos: %d funcionales, %d comportamentales.',
            $desglose['funcional'] ?? 0,
            $desglose['comportamental'] ?? 0
        );
        $stmtNotif->execute([
            'uid' => $eval['evaluador_id'],
            'msg' => 'El evaluado ha rechazado la concertación. ' . $detalleNotif .
                     ' Puede proceder con la fijación unilateral conforme al Art. 33 de la Resolución 1760 de 2010.',
        ]);

        AuditoriaService::registrar('rechazar_concertacion_evaluado', 'evaluaciones', $evaluacionId, [
            'concertacion_id' => (int) $eval['concertacion_id'],
            'compromisos_devueltos' => $afectados,
            'desglose' => $desglose,
            'observaciones_evaluado' => $obs,
        ]);

        ResponseHelper::success([
            'evaluacion_id' => $evaluacionId,
            'compromisos_devueltos' => $afectados,
            'funcionales' => $desglose['funcional'] ?? 0,
            'comportamentales' => $desglose['comportamental'] ?? 0,
        ], 'Concertación rechazada.');
    }

    public function listarPorEvaluacion(int $evaluacionId): void
    {
        $funcionales = (new \App\Repository\CompromisoRepository(Database::getInstance()))
            ->buscarConMetas($evaluacionId);

        $sumaPesos = 0;
        foreach ($funcionales as $f) {
            $sumaPesos += (float) $f['peso'];
        }

        ResponseHelper::success([
            'funcionales' => $funcionales,
            'suma_pesos_funcionales' => $sumaPesos,
        ]);
    }

    public function confirmarConcertacion(int $evaluacionId): void
    {
        $pdo = Database::getInstance();
        $user = AuthMiddleware::user();

        $esAdmin = in_array('jefe_personal', $user['roles'] ?? [], true);

        $sql = "SELECT ev.* FROM evaluaciones ev
                INNER JOIN concertaciones con ON con.id = ev.concertacion_id
                WHERE ev.id = :id AND ev.eliminado_en IS NULL";
        if (!$esAdmin) {
            $sql .= " AND (ev.evaluador_id = :uid1 OR con.evaluador_id = :uid2)";
        }
        $stmt = $pdo->prepare($sql);
        $params = ['id' => $evaluacionId];
        if (!$esAdmin) {
            $params['uid1'] = $user['id'];
            $params['uid2'] = $user['id'];
        }
        $stmt->execute($params);
        $eval = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$eval) {
            ResponseHelper::error('Evaluación no encontrada o no tiene permiso', 404);
        }

        $concertacionId = (int) $eval['concertacion_id'];

        $validacion = $this->service->validarCompromisosAntesDeFirmar($concertacionId, (int) $eval['evaluado_id']);
        if (!$validacion['valido']) {
            ResponseHelper::error(implode('; ', $validacion['errores']), 422);
        }

        $sumaPesos = (new \App\Repository\CompromisoRepository($pdo))->sumPesosPorConcertacion($concertacionId);
        if (abs($sumaPesos - 100) > 0.01) {
            ResponseHelper::error(
                "La suma de los pesos de los compromisos funcionales debe ser exactamente 100%. Actual: {$sumaPesos}%",
                422
            );
        }

        $stmtUp = $pdo->prepare("UPDATE compromisos SET estado = 'pendiente_aprobacion', actualizado_en = NOW() WHERE concertacion_id = :cid AND tipo = 'funcional' AND eliminado_en IS NULL AND estado = 'propuesto'");
        $stmtUp->execute(['cid' => $concertacionId]);

        $stmtNotif = $pdo->prepare("
            INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, creado_en)
            VALUES (:uid, 'info', 'Concertación de compromisos funcionales pendiente', :msg, NOW())
        ");
        $stmtNotif->execute([
            'uid' => $eval['evaluado_id'],
            'msg' => 'Su evaluador ha confirmado los compromisos funcionales. Debe aceptar o rechazar la concertación.',
        ]);

        $stmtUp2 = $pdo->prepare("UPDATE evaluaciones SET estado = 'cerrada', fecha_concertacion = CURDATE(), actualizado_en = NOW() WHERE id = :id");
        $stmtUp2->execute(['id' => $evaluacionId]);

        ResponseHelper::success(null, 'Concertación de compromisos funcionales confirmada. Se ha notificado al evaluado.');
    }

    public function enviar(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $user = AuthMiddleware::user();

        if (empty($input['descripcion'])) {
            ResponseHelper::error('El campo descripcion es requerido', 400);
        }
        if (empty($input['evaluacion_id']) && empty($input['concertacion_id'])) {
            ResponseHelper::error('Debe indicar evaluacion_id o concertacion_id', 400);
        }

        $pdo = \App\Config\Database::getInstance();

        $evaluacionId = null;
        $concertacionId = null;
        $evaluadorId = !empty($input['evaluador_id']) ? (int) $input['evaluador_id'] : null;

        if (!empty($input['evaluacion_id'])) {
            $evaluacionId = (int) $input['evaluacion_id'];
            $stmt = $pdo->prepare("SELECT e.id, e.concertacion_id, con.evaluador_id FROM evaluaciones e LEFT JOIN concertaciones con ON con.id = e.concertacion_id WHERE e.id = ? AND e.eliminado_en IS NULL");
            $stmt->execute([$evaluacionId]);
            $evalData = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$evalData) {
                ResponseHelper::error('La evaluacion indicada no existe', 404);
            }
            $concertacionId = $evalData['concertacion_id'] ? (int) $evalData['concertacion_id'] : null;
            if (!$evaluadorId) {
                $evaluadorId = !empty($evalData['evaluador_id']) ? (int) $evalData['evaluador_id'] : null;
            }
        } else {
            $concertacionId = (int) $input['concertacion_id'];
            $stmt = $pdo->prepare("SELECT id, evaluador_id FROM concertaciones WHERE id = ? AND eliminado_en IS NULL");
            $stmt->execute([$concertacionId]);
            $conData = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$conData) {
                ResponseHelper::error('La concertacion indicada no existe', 404);
            }
            if (!$evaluadorId) {
                $evaluadorId = !empty($conData['evaluador_id']) ? (int) $conData['evaluador_id'] : null;
            }
        }

        if (!$evaluadorId) {
            ResponseHelper::error('No se pudo determinar el evaluador. Indique evaluador_id o asocie un evaluador a la concertacion', 400);
        }

        $datos = [
            'evaluacion_id' => $evaluacionId,
            'concertacion_id' => $concertacionId,
            'descripcion' => $input['descripcion'],
            'resultado_esperado' => $input['resultado_esperado'] ?? null,
            'medio_verificacion' => $input['medio_verificacion'] ?? null,
            'observaciones_evaluado' => $input['observaciones_evaluado'] ?? null,
            'plazo' => $input['plazo'] ?? null,
            'peso' => $input['peso'] ?? 0,
            'meta_id' => $input['meta_id'] ?? null,
            'evaluador_id' => $evaluadorId,
            'estado' => 'propuesto',
        ];

        $id = $this->service->enviar($datos, $user);
        ResponseHelper::success(['id' => $id], 'Compromiso funcional propuesto para aprobacion');
    }

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
        ResponseHelper::success(null, 'Compromiso funcional aprobado');
    }

    public function rechazar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $user = AuthMiddleware::user();

        $observaciones = $input['observaciones_evaluador'] ?? '';
        $this->service->rechazar($id, $observaciones, $user);
        ResponseHelper::success(null, 'Compromiso funcional rechazado');
    }

    public function resumenPesos(int $evaluacionId): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT concertacion_id FROM evaluaciones WHERE id = :id AND eliminado_en IS NULL");
        $stmt->execute(['id' => $evaluacionId]);
        $concertacionId = $stmt->fetchColumn();
        if (!$concertacionId) {
            ResponseHelper::notFound('Concertacion no encontrada');
        }
        $resultado = $this->service->resumenPesos((int) $concertacionId);
        ResponseHelper::success($resultado);
    }

    public function pendientesAprobacion(): void
    {
        $user = AuthMiddleware::user();
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $estado = isset($_GET['estado']) ? SanitizerHelper::sanitize((string) $_GET['estado']) : 'propuesto';
        $resultado = $this->service->pendientesAprobacion($user, $pagina, $porPagina, $estado);
        ResponseHelper::success($resultado);
    }

    public function actualizar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $this->service->actualizar($id, $input);
        ResponseHelper::success(null, 'Compromiso funcional actualizado');
    }

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

        $this->service->calificar($id, $puntaje, $observaciones, $user);
        ResponseHelper::success(null, "Compromiso funcional calificado");
    }

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
        ResponseHelper::success(null, 'Compromiso funcional devuelto al evaluado');
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

    public function propuestosPorEvaluado(): void
    {
        $evaluacionId = (int) ($_GET['evaluacion_id'] ?? 0);
        if ($evaluacionId <= 0) {
            ResponseHelper::error('evaluacion_id es requerido', 400);
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("
            SELECT c.id, c.tipo, c.descripcion, c.peso,
                   NULL AS competencia_nombre,
                   m.descripcion AS meta_nombre
            FROM compromisos c
            INNER JOIN concertaciones con ON con.id = c.concertacion_id
            LEFT JOIN metas m ON m.id = c.meta_id
            WHERE con.id = (SELECT concertacion_id FROM evaluaciones WHERE id = :eid)
              AND c.tipo = 'funcional'
              AND c.estado = 'propuesto'
              AND c.eliminado_en IS NULL
            ORDER BY c.id
        ");
        $stmt->execute(['eid' => $evaluacionId]);
        $compromisos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        ResponseHelper::success($compromisos);
    }

    /**
     * GET /compromisos/mis-compromisos?periodo_id=X
     *
     * Retorna todos los compromisos del evaluado autenticado (funcionales +
     * comportamentales) para un periodo, con el conteo por tipo.
     * El frontend EvidenciasEvaluado usa esto para calcular dinamicamente
     * cuantos slots de evidencia mostrar por tipo.
     */
    public function misCompromisos(): void
    {
        $user = AuthMiddleware::user();
        $periodoId = (int) ($_GET['periodo_id'] ?? 0);

        if ($periodoId <= 0) {
            ResponseHelper::error('periodo_id es requerido', 400);
        }

        $pdo = Database::getInstance();

        // Compromisos funcionales del evaluado en el periodo
        $sqlFunc = "
            SELECT c.id, c.concertacion_id, c.tipo, c.meta_id, c.descripcion,
                   c.peso, c.estado, c.resultado_esperado, c.medio_verificacion,
                   m.descripcion AS meta_descripcion
            FROM compromisos c
            INNER JOIN concertaciones con ON con.id = c.concertacion_id
            INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id
            LEFT JOIN metas m ON m.id = c.meta_id
            WHERE con.evaluado_id = :uid
              AND ev.periodo_id = :pid
              AND c.tipo = 'funcional'
              AND c.eliminado_en IS NULL
              AND con.eliminado_en IS NULL
              AND ev.eliminado_en IS NULL
            ORDER BY c.id
        ";
        $stmtF = $pdo->prepare($sqlFunc);
        $stmtF->execute(['uid' => $user['id'], 'pid' => $periodoId]);
        $funcionales = $stmtF->fetchAll(\PDO::FETCH_ASSOC);

        // Compromisos comportamentales del evaluado en el periodo
        $sqlComp = "
            SELECT c.id, c.concertacion_id, c.tipo, c.competencia_codigo,
                   c.descripcion, c.peso, c.estado,
                   c.nivel_comportamental, c.puntaje_comportamental
            FROM compromisos c
            INNER JOIN concertaciones con ON con.id = c.concertacion_id
            INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id
            WHERE con.evaluado_id = :uid
              AND ev.periodo_id = :pid
              AND c.tipo = 'comportamental'
              AND c.eliminado_en IS NULL
              AND con.eliminado_en IS NULL
              AND ev.eliminado_en IS NULL
            ORDER BY c.id
        ";
        $stmtC = $pdo->prepare($sqlComp);
        $stmtC->execute(['uid' => $user['id'], 'pid' => $periodoId]);
        $comportamentales = $stmtC->fetchAll(\PDO::FETCH_ASSOC);

        // Solo compromisos en estados que permiten registro de evidencias
        $estadosActivos = ['aprobado', 'en_progreso', 'cumplido', 'aceptado_evaluado'];
        $funcionalesActivos = array_values(array_filter(
            $funcionales,
            fn($c) => in_array($c['estado'], $estadosActivos, true)
        ));
        $comportamentalesActivos = array_values(array_filter(
            $comportamentales,
            fn($c) => in_array($c['estado'], $estadosActivos, true)
        ));

        ResponseHelper::success([
            'funcionales' => $funcionalesActivos,
            'comportamentales' => $comportamentalesActivos,
            'total_funcionales' => count($funcionalesActivos),
            'total_comportamentales' => count($comportamentalesActivos),
            'total' => count($funcionalesActivos) + count($comportamentalesActivos),
        ]);
    }
}