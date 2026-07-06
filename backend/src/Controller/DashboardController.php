<?php

namespace App\Controller;

use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Middleware\AuthMiddleware;
use App\Service\NotificacionService;

class DashboardController
{
    public function resumen(): void
    {
        $db = Database::getInstance();
        $user = AuthMiddleware::user();

        // Estadísticas generales
        $entidades = (int) $db->query("SELECT COUNT(*) FROM entidades WHERE eliminado_en IS NULL")->fetchColumn();
        $usuarios = (int) $db->query("SELECT COUNT(*) FROM usuarios WHERE eliminado_en IS NULL")->fetchColumn();
        $evaluaciones = (int) $db->query("SELECT COUNT(*) FROM evaluaciones WHERE eliminado_en IS NULL")->fetchColumn();
        $periodos = (int) $db->query("SELECT COUNT(*) FROM periodos WHERE estado IN ('configuracion','concertacion','seguimiento','evaluacion','calificacion') AND eliminado_en IS NULL")->fetchColumn();

        // Notificaciones no leídas
        $notiService = new NotificacionService();
        $notificacionesNoLeidas = $notiService->contarNoLeidas((int) $user['id']);

        // Compromisos pendientes de aprobación
        $compromisosPendientes = 0;
        $rolCodigos = [];
        foreach (($user['roles'] ?? []) as $r) {
            if (is_array($r) && isset($r['codigo'])) { $rolCodigos[] = $r['codigo']; }
            elseif (is_string($r)) { $rolCodigos[] = $r; }
        }
        $puedeAprobar = !empty(array_intersect($rolCodigos, ['evaluador', 'jefe_entidad', 'jefe_dependencia']));
        if ($puedeAprobar) {
            $compromisosPendientes = $notiService->compromisosPendientesPorAprobar((int) $user['id']);
        }

        // Mis compromisos enviados: los propuestos por el evaluado en sus evaluaciones
        $stmt = $db->prepare("SELECT COUNT(*) FROM compromisos c INNER JOIN concertaciones con ON con.id = c.concertacion_id INNER JOIN evaluaciones e ON e.concertacion_id = con.id WHERE e.evaluado_id = ? AND c.estado = 'propuesto' AND c.eliminado_en IS NULL");
        $stmt->execute([(int) $user['id']]);
        $misCompromisosEnviados = (int) $stmt->fetchColumn();

        ResponseHelper::success([
            'entidades' => $entidades,
            'usuarios' => $usuarios,
            'evaluaciones' => $evaluaciones,
            'periodos' => $periodos,
            'notificaciones_no_leidas' => $notificacionesNoLeidas,
            'compromisos_pendientes_aprobacion' => $compromisosPendientes,
            'mis_compromisos_enviados' => $misCompromisosEnviados,
        ]);
    }

    /** Estadísticas detalladas para el panel admin */
    public function adminStats(): void
    {
        $db = Database::getInstance();

        // Small-boxes
    $evaluadosActivos = (int) $db->query("
        SELECT COUNT(DISTINCT u.id) FROM usuarios u
        INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
        INNER JOIN roles r ON r.id = ur.rol_id
        WHERE r.codigo = 'evaluado'
        AND u.estado = 'activo' AND u.eliminado_en IS NULL
    ")->fetchColumn();

        $evaluadoresRegistrados = (int) $db->query("
            SELECT COUNT(DISTINCT u.id) FROM usuarios u
            INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
            INNER JOIN roles r ON r.id = ur.rol_id
            WHERE r.codigo = 'evaluador'
            AND u.estado = 'activo' AND u.eliminado_en IS NULL
        ")->fetchColumn();

    $evaluacionesCompletadas = (int) $db->query("
        SELECT COUNT(*) FROM evaluaciones
        WHERE estado IN ('calificada','aprobada_comision','cerrada') AND eliminado_en IS NULL
    ")->fetchColumn();

    $evaluacionesPendientes = (int) $db->query("
        SELECT COUNT(*) FROM evaluaciones
        WHERE estado IN ('pendiente','concertacion','en_proceso') AND eliminado_en IS NULL
    ")->fetchColumn();

        // Progreso por dependencia (top 10)
        $progresoDep = $db->query("
            SELECT d.nombre,
                   COUNT(e.id) AS total,
                   SUM(CASE WHEN e.estado IN ('calificada','aprobada_comision','cerrada') THEN 1 ELSE 0 END) AS completadas
            FROM dependencias d
            LEFT JOIN usuarios u ON u.dependencia_id = d.id AND u.eliminado_en IS NULL
            LEFT JOIN evaluaciones e ON e.evaluado_id = u.id AND e.eliminado_en IS NULL
            WHERE d.eliminado_en IS NULL AND d.estado = 'activa'
            GROUP BY d.id, d.nombre
            ORDER BY total DESC
            LIMIT 10
        ")->fetchAll(\PDO::FETCH_ASSOC);

    $progresoDependencia = array_map(function($row) {
        $total = max((int)$row['total'], 1);
        $completadas = (int)$row['completadas'];
        return [
            'dependencia' => $row['nombre'],
            'progreso' => round(($completadas / $total) * 100),
            'total' => $total,
            'completadas' => $completadas,
        ];
    }, $progresoDep);

        // Periodo activo
        $periodoActivo = $db->query("
            SELECT id, nombre, fecha_inicio, fecha_fin, estado
            FROM periodos
            WHERE estado IN ('configuracion','concertacion','seguimiento','evaluacion','calificacion') AND eliminado_en IS NULL
            ORDER BY fecha_inicio DESC LIMIT 1
        ")->fetch(\PDO::FETCH_ASSOC) ?: null;

        // Evaluaciones recientes
        $evalRecientes = $db->query("
            SELECT e.id, e.tipo, e.estado, e.calificacion_definitiva AS puntaje, e.fecha_evaluacion, e.creado_en,
                   TRIM(CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido)) AS evaluado,
                   TRIM(CONCAT_WS(' ', ev.primer_nombre, ev.segundo_nombre, ev.primer_apellido, ev.segundo_apellido)) AS evaluador
            FROM evaluaciones e
            INNER JOIN usuarios u ON u.id = e.evaluado_id
            INNER JOIN usuarios ev ON ev.id = e.evaluador_id
            WHERE e.eliminado_en IS NULL
            ORDER BY e.creado_en DESC LIMIT 8
        ")->fetchAll(\PDO::FETCH_ASSOC);

        // Entidades activas
        $entidadesActivas = (int) $db->query("SELECT COUNT(*) FROM entidades WHERE estado = 'activa' AND eliminado_en IS NULL")->fetchColumn();

        $evalPorEstado = $db->query("
        SELECT estado, COUNT(*) AS cantidad
        FROM evaluaciones
        WHERE eliminado_en IS NULL
        GROUP BY estado
        ORDER BY cantidad DESC
        ")->fetchAll(\PDO::FETCH_ASSOC);

        $evalPorDependencia = $db->query("
        SELECT d.nombre AS dependencia,
        SUM(CASE WHEN e.estado IN ('calificada','aprobada_comision','cerrada') THEN 1 ELSE 0 END) AS completadas,
        SUM(CASE WHEN e.estado IN ('pendiente','concertacion','en_proceso') THEN 1 ELSE 0 END) AS pendientes
        FROM dependencias d
        LEFT JOIN usuarios u ON u.dependencia_id = d.id AND u.eliminado_en IS NULL
        LEFT JOIN evaluaciones e ON e.evaluado_id = u.id AND e.eliminado_en IS NULL
        WHERE d.eliminado_en IS NULL AND d.estado = 'activa'
        GROUP BY d.id, d.nombre
        HAVING SUM(CASE WHEN e.estado IN ('calificada','aprobada_comision','cerrada') THEN 1 ELSE 0 END) > 0
        OR SUM(CASE WHEN e.estado IN ('pendiente','concertacion','en_proceso') THEN 1 ELSE 0 END) > 0
        ORDER BY (SUM(CASE WHEN e.estado IN ('calificada','aprobada_comision','cerrada') THEN 1 ELSE 0 END) + SUM(CASE WHEN e.estado IN ('pendiente','concertacion','en_proceso') THEN 1 ELSE 0 END)) DESC
        LIMIT 10
        ")->fetchAll(\PDO::FETCH_ASSOC);

        ResponseHelper::success([
        'evaluados_activos' => $evaluadosActivos,
        'evaluadores_registrados' => $evaluadoresRegistrados,
        'evaluaciones_completadas' => $evaluacionesCompletadas,
        'evaluaciones_pendientes' => $evaluacionesPendientes,
        'progreso_dependencias' => $progresoDependencia,
        'periodo_activo' => $periodoActivo,
        'evaluaciones_recientes' => $evalRecientes,
        'entidades_activas' => $entidadesActivas,
        'evaluaciones_por_estado' => $evalPorEstado,
        'evaluaciones_por_dependencia' => $evalPorDependencia,
        ]);
    }

    public function periodoActivo(): void
    {
        $db = Database::getInstance();

        $periodo = $db->query("
            SELECT id, nombre, fecha_inicio, fecha_fin, estado
            FROM periodos
            WHERE estado IN ('configuracion','concertacion','seguimiento','evaluacion','calificacion') AND eliminado_en IS NULL
            ORDER BY fecha_inicio DESC LIMIT 1
        ")->fetch(\PDO::FETCH_ASSOC);

        if (!$periodo) {
            ResponseHelper::success([
                'periodo' => null,
                'progreso' => 0,
                'dias_restantes' => 0,
                'dias_transcurridos' => 0,
                'duracion_total' => 0,
                'etapa_actual' => null,
                'etapas' => [],
            ]);
            return;
        }

        $inicio = new \DateTime($periodo['fecha_inicio']);
        $fin = new \DateTime($periodo['fecha_fin']);
        $hoy = new \DateTime(date('Y-m-d'));

        $duracion = (int) $inicio->diff($fin)->days;
        $transcurridos = max(0, (int) $inicio->diff($hoy)->days);
        if ($hoy < $inicio) {
            $transcurridos = 0;
        }
        $restantes = max(0, $duracion - $transcurridos);
        $progreso = $duracion > 0 ? min(100, round(($transcurridos / $duracion) * 100)) : 0;

        $etapaActual = $periodo['estado'];
        $ordenEtapas = ['configuracion', 'concertacion', 'seguimiento', 'evaluacion', 'calificacion'];
        $labelsEtapas = [
            'configuracion' => 'Configuracion',
            'concertacion' => 'Concertacion',
            'seguimiento' => 'Seguimiento',
            'evaluacion' => 'Evaluacion Parcial',
            'calificacion' => 'Calificacion Definitiva',
        ];
        $idxActual = array_search($etapaActual, $ordenEtapas);
        $etapas = [];
        foreach ($ordenEtapas as $i => $cod) {
            $etapas[] = [
                'codigo' => $cod,
                'label' => $labelsEtapas[$cod],
                'estado' => $i < $idxActual ? 'completada' : ($i === $idxActual ? 'actual' : 'pendiente'),
            ];
        }

        ResponseHelper::success([
            'periodo' => [
                'id' => (int) $periodo['id'],
                'nombre' => $periodo['nombre'],
                'fecha_inicio' => $periodo['fecha_inicio'],
                'fecha_fin' => $periodo['fecha_fin'],
                'estado' => $periodo['estado'],
            ],
            'progreso' => $progreso,
            'dias_restantes' => $restantes,
            'dias_transcurridos' => $transcurridos,
            'duracion_total' => $duracion,
            'etapa_actual' => $etapaActual,
            'etapa_label' => $labelsEtapas[$etapaActual] ?? $etapaActual,
            'etapas' => $etapas,
        ]);
    }

    public function actividad(): void
    {
        $db = Database::getInstance();
        $porPagina = min((int)($_GET['por_pagina'] ?? 10), 50);
        $pagina = (int)($_GET['pagina'] ?? 1);
        $offset = ($pagina - 1) * $porPagina;

        $total = (int) $db->query("SELECT COUNT(*) FROM auditoria")->fetchColumn();

        $stmt = $db->prepare("SELECT id, accion, entidad, registro_id, datos_nuevos, ip_address, creado_en as fecha FROM auditoria ORDER BY creado_en DESC LIMIT ? OFFSET ?");
        $stmt->execute([$porPagina, $offset]);
        $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        ResponseHelper::success([
            'items' => $data ?: [],
            'total' => $total,
            'pagina' => $pagina,
            'por_pagina' => $porPagina,
            'total_paginas' => (int) ceil($total / max($porPagina, 1)),
        ]);
    }

    /** Dashboard específico para el rol Evaluado con KPIs relevantes */
    public function evaluado(): void
    {
        $db = Database::getInstance();
        $user = AuthMiddleware::user();
        $userId = (int) $user['id'];

        // Período activo
        $periodoActivo = $db->query("
            SELECT id, nombre, fecha_inicio, fecha_fin, estado
            FROM periodos
            WHERE estado IN ('configuracion','concertacion','seguimiento','evaluacion','calificacion') AND eliminado_en IS NULL
            ORDER BY fecha_inicio DESC LIMIT 1
        ")->fetch(\PDO::FETCH_ASSOC);

        $periodoId = $periodoActivo ? (int) $periodoActivo['id'] : 0;

        // Evaluaciones del usuario
        $evaluaciones = [];
        $evaluacionActual = null;
        if ($periodoId > 0) {
            $stmt = $db->prepare("
                SELECT e.*, p.nombre as periodo_nombre
                FROM evaluaciones e
                INNER JOIN periodos p ON p.id = e.periodo_id
                WHERE e.evaluado_id = ? AND e.eliminado_en IS NULL
                ORDER BY e.creado_en DESC
            ");
            $stmt->execute([$userId]);
            $evaluaciones = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $evaluacionActual = $evaluaciones[0] ?? null;
        }

        // Compromisos del evaluado (agrupados por evaluación)
        $compromisosStats = [
            'total' => 0,
            'funcionales' => 0,
            'comportamentales' => 0,
            'propuestos' => 0,
            'pendientes_aprobacion' => 0,
            'aceptados' => 0,
            'en_progreso' => 0,
            'cumplidos' => 0,
            'rechazados' => 0,
            'vencidos' => 0,
        ];

        if ($periodoId > 0) {
            $stmt = $db->prepare("
                SELECT c.*, ev.id as evaluacion_id, ev.tipo as evaluacion_tipo
                FROM compromisos c
                INNER JOIN concertaciones con ON con.id = c.concertacion_id AND con.eliminado_en IS NULL
                INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id AND ev.eliminado_en IS NULL
                WHERE ev.evaluado_id = ? AND c.eliminado_en IS NULL
            ");
            $stmt->execute([$userId]);
            $compromisos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $compromisosStats['total'] = count($compromisos);
            foreach ($compromisos as $c) {
                if ($c['tipo'] === 'funcional') $compromisosStats['funcionales']++;
                elseif ($c['tipo'] === 'comportamental') $compromisosStats['comportamentales']++;

                $estado = $c['estado'] ?? '';
                if ($estado === 'propuesto') $compromisosStats['propuestos']++;
                elseif ($estado === 'pendiente_aprobacion') $compromisosStats['pendientes_aprobacion']++;
                elseif ($estado === 'aceptado_evaluado' || $estado === 'aprobado') $compromisosStats['aceptados']++;
                elseif ($estado === 'en_progreso') $compromisosStats['en_progreso']++;
                elseif ($estado === 'cumplido') $compromisosStats['cumplidos']++;
                elseif (in_array($estado, ['rechazado_evaluado', 'rechazado', 'devuelto'])) $compromisosStats['rechazados']++;
                elseif ($estado === 'vencido') $compromisosStats['vencidos']++;
            }
        }

        // Evidencias del evaluado
        $evidenciasStats = [
            'total' => 0,
            'este_periodo' => 0,
            'compromisos_con_evidencia' => 0,
            'competencias_con_evidencia' => 0,
        ];

        if ($periodoId > 0) {
            $stmt = $db->prepare("
                SELECT e.*, c.tipo as compromiso_tipo
                FROM evidencias e
                LEFT JOIN compromisos c ON c.id = e.compromiso_id
                WHERE e.periodo_id = ? AND e.eliminado_en IS NULL
                ORDER BY e.creado_en DESC
            ");
            $stmt->execute([$periodoId]);
            $evidencias = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $evidenciasStats['total'] = count($evidencias);
            $evidenciasStats['este_periodo'] = count($evidencias);
            foreach ($evidencias as $e) {
                if (($e['compromiso_tipo'] ?? '') === 'funcional') $evidenciasStats['compromisos_con_evidencia']++;
                elseif (($e['compromiso_tipo'] ?? '') === 'comportamental') $evidenciasStats['competencias_con_evidencia']++;
            }
        }

        // Compromisos pendientes de aceptación/rechazo de concertación
        $concertacionesPendientes = 0;
        if ($periodoId > 0) {
            $stmt = $db->prepare("
                SELECT c.id
                FROM concertaciones c
                WHERE c.evaluado_id = ? AND c.periodo_id = ? AND c.estado = 'propuesta_evaluado' AND c.eliminado_en IS NULL
            ");
            $stmt->execute([$userId, $periodoId]);
            $concertacionesPendientes = $stmt->rowCount();
        }

        // Próximos vencimientos (compromisos con plazo o fechas de evaluación)
        $proximosVencimientos = [];
        if ($periodoId > 0 && $evaluacionActual) {
            $hoy = new \DateTime();
            $finEvaluacion = new \DateTime($evaluacionActual['fecha_fin'] ?? $periodoActivo['fecha_fin']);
            $diasRestantes = max(0, $hoy->diff($finEvaluacion)->days);
            $proximosVencimientos[] = [
                'tipo' => 'evaluacion',
                'label' => 'Fin período de evaluación',
                'fecha' => $finEvaluacion->format('Y-m-d'),
                'dias_restantes' => $diasRestantes,
                'critico' => $diasRestantes <= 7,
            ];
        }

        // Notificaciones no leídas
        $notiService = new \App\Service\NotificacionService();
        $notificacionesNoLeidas = $notiService->contarNoLeidas($userId);

        // Compromisos de mejoramiento del evaluado
        $mejoramientosStats = [
            'total' => 0,
            'pendientes' => 0,
            'en_seguimiento' => 0,
            'completados' => 0,
        ];

        if ($periodoId > 0) {
            $stmt = $db->prepare("
                SELECT cm.*
                FROM compromisos_mejoramiento cm
                INNER JOIN concertaciones con ON con.id = cm.concertacion_id AND con.eliminado_en IS NULL
                WHERE con.evaluado_id = ? AND cm.eliminado_en IS NULL
            ");
            $stmt->execute([$userId]);
            $mejoramientos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $mejoramientosStats['total'] = count($mejoramientos);
            foreach ($mejoramientos as $m) {
                $estado = $m['estado'] ?? 'pendiente';
                if ($estado === 'pendiente') $mejoramientosStats['pendientes']++;
                elseif ($estado === 'en_progreso') $mejoramientosStats['en_seguimiento']++;
                elseif ($estado === 'completado') $mejoramientosStats['completados']++;
            }
        }

        // Ausentismos del evaluado (solo lectura)
        $ausentismosStats = [
            'total' => 0,
            'vigentes' => 0,
            'dias_totales' => 0,
            'afectan_evaluacion' => 0,
        ];

        $stmt = $db->prepare("
            SELECT * FROM ausentismos WHERE funcionario_id = ? AND eliminado_en IS NULL
        ");
        $stmt->execute([$userId]);
        $ausentismos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $ausentismosStats['total'] = count($ausentismos);
        foreach ($ausentismos as $a) {
            if (($a['estado'] ?? '') === 'vigente') $ausentismosStats['vigentes']++;
            $ausentismosStats['dias_totales'] += (int) ($a['dias'] ?? 0);
            if ((int) ($a['dias'] ?? 0) > 30) $ausentismosStats['afectan_evaluacion']++;
        }

        // Movilidades del evaluado (solo lectura)
        $movilidadesStats = [
            'total' => 0,
            'en_tramite' => 0,
            'aprobadas' => 0,
            'ejecutadas' => 0,
        ];

        $stmt = $db->prepare("
            SELECT * FROM movilidades WHERE funcionario_id = ? AND eliminado_en IS NULL
        ");
        $stmt->execute([$userId]);
        $movilidades = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $movilidadesStats['total'] = count($movilidades);
        foreach ($movilidades as $m) {
            $estado = $m['estado'] ?? 'tramite';
            if ($estado === 'tramite') $movilidadesStats['en_tramite']++;
            elseif ($estado === 'aprobado') $movilidadesStats['aprobadas']++;
            elseif ($estado === 'ejecutado') $movilidadesStats['ejecutadas']++;
        }

        // Progreso del período actual
        $progresoPeriodo = 0;
        $etapaActual = null;
        if ($periodoActivo) {
            $inicio = new \DateTime($periodoActivo['fecha_inicio']);
            $fin = new \DateTime($periodoActivo['fecha_fin']);
            $hoy = new \DateTime(date('Y-m-d'));

            $duracion = max(1, (int) $inicio->diff($fin)->days);
            $transcurridos = max(0, (int) $inicio->diff($hoy)->days);
            if ($hoy < $inicio) $transcurridos = 0;
            $progresoPeriodo = min(100, round(($transcurridos / $duracion) * 100));

            $ordenEtapas = ['configuracion', 'concertacion', 'seguimiento', 'evaluacion', 'calificacion'];
            $labelsEtapas = [
                'configuracion' => 'Configuración',
                'concertacion' => 'Concertación',
                'seguimiento' => 'Seguimiento',
                'evaluacion' => 'Evaluación Parcial',
                'calificacion' => 'Calificación Definitiva',
            ];
            $idxActual = array_search($periodoActivo['estado'], $ordenEtapas);
            $etapaActual = $idxActual !== false ? $labelsEtapas[$ordenEtapas[$idxActual]] : $periodoActivo['estado'];
        }

        ResponseHelper::success([
            'periodo_activo' => $periodoActivo ? [
                'id' => (int) $periodoActivo['id'],
                'nombre' => $periodoActivo['nombre'],
                'fecha_inicio' => $periodoActivo['fecha_inicio'],
                'fecha_fin' => $periodoActivo['fecha_fin'],
                'estado' => $periodoActivo['estado'],
                'progreso' => $progresoPeriodo,
                'etapa_actual' => $etapaActual,
            ] : null,
            'evaluacion_actual' => $evaluacionActual ? [
                'id' => (int) $evaluacionActual['id'],
                'tipo' => $evaluacionActual['tipo'],
                'estado' => $evaluacionActual['estado'],
                'calificacion_definitiva' => $evaluacionActual['calificacion_definitiva'],
                'nivel_resultado' => $evaluacionActual['nivel_resultado'],
            ] : null,
            'evaluaciones_historico' => array_map(function($e) {
                return [
                    'id' => (int) $e['id'],
                    'periodo' => $e['periodo_nombre'],
                    'tipo' => $e['tipo'],
                    'estado' => $e['estado'],
                    'calificacion' => $e['calificacion_definitiva'],
                    'nivel' => $e['nivel_resultado'],
                ];
            }, $evaluaciones),
            'compromisos' => $compromisosStats,
            'evidencias' => $evidenciasStats,
            'concertaciones_pendientes' => $concertacionesPendientes,
            'proximos_vencimientos' => $proximosVencimientos,
            'notificaciones_no_leidas' => $notificacionesNoLeidas,
            'mejoramientos' => $mejoramientosStats,
            'ausentismos' => $ausentismosStats,
            'movilidades' => $movilidadesStats,
        ]);
    }
}
