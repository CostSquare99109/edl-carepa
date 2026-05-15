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

    $entidades = $db->query("SELECT COUNT(*) as c FROM entidades")->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0;
    $usuarios = $db->query("SELECT COUNT(*) as c FROM usuarios")->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0;
    $evaluaciones = $db->query("SELECT COUNT(*) as c FROM evaluaciones")->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0;
    $periodos = $db->query("SELECT COUNT(*) as c FROM periodos WHERE estado = 'activo'")->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0;

    // Notificaciones no leídas
    $notiService = new NotificacionService();
    $notificacionesNoLeidas = $notiService->contarNoLeidas((int) $user['id']);

    // Compromisos pendientes de aprobación (si es evaluador)
    $compromisosPendientes = 0;
    $rolCodigos = [];
    foreach (($user['roles'] ?? []) as $r) {
      if (is_array($r) && isset($r['codigo'])) {
        $rolCodigos[] = $r['codigo'];
      } elseif (is_string($r)) {
        $rolCodigos[] = $r;
      }
    }
    $puedeAprobar = !empty(array_intersect($rolCodigos, ['evaluador', 'jefe_entidad', 'jefe_dependencia', 'admin']));
    if ($puedeAprobar) {
      $compromisosPendientes = $notiService->compromisosPendientesPorAprobar((int) $user['id']);
    }

    // Mis compromisos enviados pendientes (si es funcionario)
    $misCompromisosEnviados = 0;
    $stmt = $db->prepare("SELECT COUNT(*) FROM compromisos WHERE responsable_id = ? AND estado = 'enviado' AND eliminado_en IS NULL");
    $stmt->execute([(int) $user['id']]);
    $misCompromisosEnviados = (int) $stmt->fetchColumn();

    ResponseHelper::success([
      'entidades' => (int)$entidades,
      'usuarios' => (int)$usuarios,
      'evaluaciones' => (int)$evaluaciones,
      'periodos' => (int)$periodos,
      'notificaciones_no_leidas' => $notificacionesNoLeidas,
      'compromisos_pendientes_aprobacion' => $compromisosPendientes,
      'mis_compromisos_enviados' => $misCompromisosEnviados,
    ]);
  }

  public function actividad(): void
  {
    $db = Database::getInstance();
    $porPagina = min((int)($_GET['por_pagina'] ?? 10), 50);

    $stmt = $db->prepare("SELECT id, accion as descripcion, fecha, tabla_afectada as tipo FROM auditoria ORDER BY fecha DESC LIMIT ?");
    $stmt->execute([$porPagina]);
    $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    ResponseHelper::success([
      'data' => $data ?: [],
      'total' => count($data),
      'pagina' => 1,
      'por_pagina' => $porPagina,
      'total_paginas' => 1,
    ]);
  }
}
