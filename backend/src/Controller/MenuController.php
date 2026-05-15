<?php

namespace App\Controller;

use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;
use App\Config\Database;

class MenuController
{
  public function obtener(): void
  {
    $user = AuthMiddleware::user();
    $roles = $user['roles'] ?? [];

    // Asegurar que roles sea un array plano de strings
    $rolCodigos = [];
    foreach ($roles as $r) {
      if (is_array($r) && isset($r['codigo'])) {
        $rolCodigos[] = $r['codigo'];
      } elseif (is_string($r)) {
        $rolCodigos[] = $r;
      }
    }

    if (empty($rolCodigos)) {
      ResponseHelper::success([]);
      return;
    }

    $pdo = Database::getInstance();
    $placeholders = implode(',', array_fill(0, count($rolCodigos), '?'));
    $stmt = $pdo->prepare("SELECT DISTINCT p.modulo, p.codigo, p.nombre FROM rol_permiso rp INNER JOIN permisos p ON p.id = rp.permiso_id INNER JOIN roles r ON r.id = rp.rol_id WHERE r.codigo IN ({$placeholders}) ORDER BY p.modulo, p.nombre");
    $stmt->execute($rolCodigos);
    $permisos = $stmt->fetchAll();

    $modulos = [];
    foreach ($permisos as $p) {
      $modulos[$p['modulo']][] = ['codigo' => $p['codigo'], 'nombre' => $p['nombre']];
    }

 $menu = [];
 $menuMap = [
 'entidades' => ['label' => 'Entidades', 'icon' => 'business', 'ruta' => '/entidades'],
 'dependencias' => ['label' => 'Dependencias', 'icon' => 'account_tree', 'ruta' => '/dependencias'],
 'usuarios' => ['label' => 'Usuarios', 'icon' => 'people', 'ruta' => '/usuarios'],
 'periodos' => ['label' => 'Periodos', 'icon' => 'calendar_today', 'ruta' => '/periodos'],
 'metas' => ['label' => 'Metas', 'icon' => 'flag', 'ruta' => '/metas'],
 'concertaciones' => ['label' => 'Concertaciones', 'icon' => 'handshake', 'ruta' => '/concertaciones'],
 'evaluaciones' => ['label' => 'Evaluaciones', 'icon' => 'assessment', 'ruta' => '/evaluaciones'],
 'compromisos' => ['label' => 'Mis Compromisos', 'icon' => 'task_alt', 'ruta' => '/compromisos/mios'],
 'evidencias' => ['label' => 'Evidencias', 'icon' => 'attach_file', 'ruta' => '/evidencias'],
 'ausentismos' => ['label' => 'Ausentismos', 'icon' => 'event_busy', 'ruta' => '/ausentismos'],
 'movilidades' => ['label' => 'Movilidad', 'icon' => 'swap_horiz', 'ruta' => '/movilidad'],
 'reportes' => ['label' => 'Reportes', 'icon' => 'summarize', 'ruta' => '/reportes'],
 'cargas' => ['label' => 'Cargas Masivas', 'icon' => 'upload_file', 'ruta' => '/cargas'],
 'auditoria' => ['label' => 'Auditoria', 'icon' => 'history', 'ruta' => '/auditoria'],
 'parametros' => ['label' => 'Parametros', 'icon' => 'settings', 'ruta' => '/parametros'],
 ];

 foreach ($modulos as $modulo => $permisosModulo) {
 if (isset($menuMap[$modulo])) {
 $menu[] = array_merge($menuMap[$modulo], ['permisos' => $permisosModulo]);
 }
 }

 // Agregar item "Aprobar Compromisos" para evaluadores
 $puedeAprobar = !empty(array_intersect($rolCodigos, ['evaluador', 'jefe_entidad', 'jefe_dependencia', 'admin']));
 if ($puedeAprobar) {
 $menu[] = [
 'label' => 'Aprobar Compromisos',
 'icon' => 'fact_check',
 'ruta' => '/compromisos/aprobar',
 'permisos' => [['codigo' => 'compromisos.aprobar', 'nombre' => 'Aprobar compromiso']],
 ];
 }

 ResponseHelper::success($menu);
  }
}
