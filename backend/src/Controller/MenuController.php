<?php
declare(strict_types=1);

namespace App\Controller;

use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class MenuController
{
 public function obtener(): void
 {
  $user = AuthMiddleware::user();
  $rolActivo = $user['rol_activo'] ?? '';

  if (empty($rolActivo)) {
   ResponseHelper::success([]);
   return;
  }

  $menu = $this->menuParaRol($rolActivo, $user);

  ResponseHelper::success($menu);
 }

 private function menuParaRol(string $rol, array $user): array
 {
  return match ($rol) {
    'jefe_personal' => $this->menuAdmin(),
    'admin_carepa' => $this->menuAdminCarepa(),
    'jefe_dependencia' => $this->menuJefeDependencia($user),
    'evaluador' => $this->menuEvaluador(),
    'evaluado' => $this->menuEvaluado(),
    default => $this->menuPorPermisos($user),
  };
 }

 private function menuAdmin(): array
 {
  return [
   [
    'label' => 'Inicio',
    'icon' => 'dashboard',
    'ruta' => '/',
    'permisos' => ['dashboard.ver'],
   ],
    [
     'label' => 'Usuarios',
    'icon' => 'people',
    'ruta' => '/admin-usuarios',
    'permisos' => ['usuarios.listar', 'usuarios.crear', 'usuarios.editar'],
   ],
   [
    'label' => 'Dependencias',
    'icon' => 'account_tree',
    'ruta' => '/dependencias',
    'permisos' => ['dependencias.listar', 'dependencias.crear', 'dependencias.editar'],
   ],
   [
    'label' => 'Periodos',
    'icon' => 'calendar_today',
    'ruta' => '/periodos',
    'permisos' => ['periodos.listar', 'periodos.crear', 'periodos.editar'],
   ],
   [
    'label' => 'Evaluaciones',
    'icon' => 'assessment',
    'ruta' => '/evaluaciones',
    'permisos' => ['evaluaciones.listar', 'evaluaciones.crear', 'evaluaciones.evaluar'],
   ],
   [
    'label' => 'Aprobar Compromisos',
    'icon' => 'fact_check',
    'ruta' => '/compromisos/aprobar',
    'permisos' => ['compromisos.aprobar'],
   ],
   [
    'label' => 'Evidencias',
    'icon' => 'attach_file',
    'ruta' => '/evidencias',
    'permisos' => ['evidencias.listar', 'evidencias.verificar'],
   ],
   [
    'label' => 'Parametros',
    'icon' => 'settings',
    'ruta' => '/parametros',
    'permisos' => ['parametros.listar', 'parametros.editar'],
   ],
    [
     'label' => 'Reportes',
     'icon' => 'summarize',
     'ruta' => '/reportes',
     'permisos' => ['reportes.generar'],
    ],
    [
     'label' => 'Auditoria',
    'icon' => 'history',
    'ruta' => '/auditoria',
    'permisos' => ['auditoria.ver'],
   ],
   [
    'label' => 'Solicitudes Cambio Evaluador',
    'icon' => 'sync_alt',
    'ruta' => '/compromisos/solicitudes-cambio',
    'permisos' => ['jefe_personal.solicitudes'],
   ],
   [
    'label' => 'Manual de Funciones',
    'icon' => 'menu_book',
    'ruta' => '/manual-funciones',
    'permisos' => ['cargos_manual.ver'],
   ],
  ];
 }

 private function menuAdminCarepa(): array
 {
  return [
   [
    'label' => 'Inicio',
    'icon' => 'dashboard',
    'ruta' => '/',
    'permisos' => ['dashboard.ver'],
   ],
   [
    'label' => 'Dependencias',
    'icon' => 'account_tree',
    'ruta' => '/dependencias',
    'permisos' => ['dependencias.listar'],
   ],
   [
    'label' => 'Usuarios',
    'icon' => 'people',
    'ruta' => '/usuarios',
    'permisos' => ['usuarios.listar'],
   ],
   [
    'label' => 'Manual de Funciones',
    'icon' => 'menu_book',
    'ruta' => '/manual-funciones',
    'permisos' => ['cargos_manual.ver'],
   ],
  ];
 }

 private function menuJefeDependencia(array $user): array
 {
   return [
    [
     'label' => 'Inicio',
     'icon' => 'dashboard',
     'ruta' => '/',
     'permisos' => ['dashboard.ver'],
    ],
    [
     'label' => 'Períodos',
     'icon' => 'calendar_today',
     'ruta' => '/periodos',
     'permisos' => ['periodos.listar'],
    ],
     [
      'label' => 'Metas',
      'icon' => 'flag',
      'ruta' => '/metas',
      'permisos' => ['metas.listar', 'metas.crear', 'metas.editar'],
     ],
     [
      'label' => 'Usuarios',
     'icon' => 'people',
     'ruta' => '/admin-usuarios',
     'permisos' => ['usuarios.listar', 'usuarios.crear', 'usuarios.editar'],
    ],
    [
     'label' => 'Ausentismos',
     'icon' => 'event_busy',
     'ruta' => '/ausentismos',
     'permisos' => ['ausentismos.listar', 'ausentismos.crear'],
    ],
    [
     'label' => 'Evaluaciones y Calificación',
     'icon' => 'assessment',
     'ruta' => '/evaluaciones',
     'permisos' => ['evaluaciones.listar', 'evaluaciones.crear'],
    ],
     [
      'label' => 'Solicitudes Cambio Evaluador',
     'icon' => 'sync_alt',
    'ruta' => '/compromisos/solicitudes-cambio',
    'permisos' => ['jefe_personal.solicitudes'],
   ],
  ];
 }

  private function menuEvaluador(): array
  {
   return [
    [
     'label' => 'Inicio',
     'icon' => 'dashboard',
     'ruta' => '/',
     'permisos' => ['dashboard.ver'],
    ],
    [
     'label' => 'Compromisos y Competencias',
     'icon' => 'task_alt',
     'ruta' => '/compromisos-y-competencias',
     'permisos' => ['compromisos.listar', 'compromisos.crear'],
    ],
    [
     'label' => 'Evidencias',
     'icon' => 'folder_open',
     'ruta' => '/evidencias',
     'permisos' => ['evidencias.listar', 'evidencias.verificar'],
    ],
    [
     'label' => 'Compromisos de Mejoramiento',
     'icon' => 'trending_up',
     'ruta' => '/compromisos/mejoramiento',
     'permisos' => ['mejoramiento.listar', 'mejoramiento.crear'],
    ],
[
     'label' => 'Evaluar',
    'icon' => 'rate_review',
    'ruta' => '/evaluar',
    'permisos' => ['evaluaciones.evaluar'],
    ],
    [
     'label' => 'Ver Evaluaciones',
    'icon' => 'visibility',
    'ruta' => '/evaluaciones/ver',
    'permisos' => ['evaluaciones.listar'],
    ],
   ];
  }


  private function menuEvaluado(): array
 {
  return [
   [
    'label' => 'Inicio',
    'icon' => 'dashboard',
    'ruta' => '/',
    'permisos' => ['dashboard.ver'],
   ],
   [
    'label' => 'Compromisos y Competencias',
    'icon' => 'task_alt',
    'ruta' => '/compromisos/mios',
    'permisos' => ['compromisos.listar', 'compromisos.crear', 'compromisos.aceptar'],
   ],
   [
    'label' => 'Proponer Compromisos',
    'icon' => 'rate_review',
    'ruta' => '/compromisos/proponer',
    'permisos' => ['compromisos.crear'],
   ],
   [
   'label' => 'Mis Evidencias',
   'icon' => 'folder_open',
   'ruta' => '/mis-evidencias',
   'permisos' => ['evidencias.listar', 'evidencias.crear'],
   ],
[
     'label' => 'Ver Evaluaciones',
    'icon' => 'assessment',
    'ruta' => '/evaluaciones/ver',
    'permisos' => ['evaluaciones.listar'],
   ],
  ];
 }

  private function menuPorPermisos(array $user): array
  {
   $rolActivo = $user['rol_activo'] ?? '';

   if (empty($rolActivo)) {
    return [];
   }

   $pdo = \App\Config\Database::getInstance();
   $stmt = $pdo->prepare("SELECT DISTINCT p.modulo, p.codigo, p.nombre FROM rol_permiso rp INNER JOIN permisos p ON p.id = rp.permiso_id INNER JOIN roles r ON r.id = rp.rol_id WHERE r.codigo = ? ORDER BY p.modulo, p.nombre");
   $stmt->execute([$rolActivo]);
   $permisos = $stmt->fetchAll();

  $modulos = [];
  foreach ($permisos as $p) {
   $modulos[$p['modulo']][] = ['codigo' => $p['codigo'], 'nombre' => $p['nombre']];
  }

  $menu = [];
  $menuMap = [

   'dependencias' => ['label' => 'Dependencias', 'icon' => 'account_tree', 'ruta' => '/dependencias'],
   'usuarios' => ['label' => 'Usuarios', 'icon' => 'people', 'ruta' => '/usuarios'],
   'periodos' => ['label' => 'Periodos', 'icon' => 'calendar_today', 'ruta' => '/periodos'],
   'metas' => ['label' => 'Metas', 'icon' => 'flag', 'ruta' => '/metas'],
   'concertaciones' => ['label' => 'Concertaciones', 'icon' => 'handshake', 'ruta' => '/concertaciones'],
   'evaluaciones' => ['label' => 'Evaluaciones', 'icon' => 'assessment', 'ruta' => '/evaluaciones'],
   'compromisos' => ['label' => 'Compromisos', 'icon' => 'task_alt', 'ruta' => '/compromisos/mios'],
   'admin_compromisos' => ['label' => 'Gestion Compromisos', 'icon' => 'task', 'ruta' => '/admin/admin-compromisos'],
   'evidencias' => ['label' => 'Evidencias', 'icon' => 'attach_file', 'ruta' => '/evidencias'],
   'ausentismos' => ['label' => 'Ausentismos', 'icon' => 'event_busy', 'ruta' => '/ausentismos'],
   'movilidades' => ['label' => 'Movilidad', 'icon' => 'swap_horiz', 'ruta' => '/movilidad'],
 'consulta' => ['label' => 'Consulta Funcionario', 'icon' => 'search', 'ruta' => '/consulta-funcionario'],
    'reportes' => ['label' => 'Reportes', 'icon' => 'summarize', 'ruta' => '/reportes'],
    'parametros' => ['label' => 'Parametros', 'icon' => 'settings', 'ruta' => '/parametros'],
    'solicitudes' => ['label' => 'Solicitudes Cambio Evaluador', 'icon' => 'sync_alt', 'ruta' => '/compromisos/solicitudes-cambio'],
   ];

  foreach ($modulos as $modulo => $permisosModulo) {
   if (isset($menuMap[$modulo])) {
    $menu[] = array_merge($menuMap[$modulo], ['permisos' => array_column($permisosModulo, 'codigo')]);
   }
  }

  return $menu;
 }
}