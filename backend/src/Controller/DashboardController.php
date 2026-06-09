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
        $puedeAprobar = !empty(array_intersect($rolCodigos, ['evaluador', 'jefe_entidad', 'jefe_dependencia', 'admin']));
        if ($puedeAprobar) {
            $compromisosPendientes = $notiService->compromisosPendientesPorAprobar((int) $user['id']);
        }

        // Mis compromisos enviados
        $stmt = $db->prepare("SELECT COUNT(*) FROM compromisos WHERE responsable_id = ? AND estado = 'propuesto' AND eliminado_en IS NULL");
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
            SELECT e.id, e.tipo, e.estado, e.puntaje, e.fecha_evaluacion,
                   CONCAT(u.nombres, ' ', u.apellidos) AS evaluado,
                   CONCAT(ev.nombres, ' ', ev.apellidos) AS evaluador
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
}
