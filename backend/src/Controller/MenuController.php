<?php

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

  $menu = match ($rolActivo) {
   'admin' => $this->menuAdmin(),
   'evaluador' => $this->menuEvaluador(),
   'evaluado' => $this->menuEvaluado(),
   default => $this->menuPorPermisos($user),
  };

  ResponseHelper::success($menu);
 }

 private function menuAdmin(): array
 {
  return [
   [
    'label' => 'Inicio',
    'icon' => 'dashboard',
    'ruta' => '/admin',
    'permisos' => ['dashboard.ver'],
   ],
   [
    'label' => 'Usuarios',
    'icon' => 'people',
    'ruta' => '/usuarios',
    'permisos' => ['usuarios.listar', 'usuarios.crear', 'usuarios.editar'],
   ],
   [
    'label' => 'Entidades',
    'icon' => 'business',
    'ruta' => '/entidades',
    'permisos' => ['entidades.listar', 'entidades.crear', 'entidades.editar', 'entidades.habilitar'],
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
    'icon' => 'attach_file',
    'ruta' => '/evidencias',
    'permisos' => ['evidencias.listar', 'evidencias.verificar'],
   ],
   [
    'label' => 'Compromisos de mejoramiento',
    'icon' => 'fact_check',
    'ruta' => '/compromisos/aprobar',
    'permisos' => ['compromisos.aprobar'],
   ],
   [
    'label' => 'Evaluar',
    'icon' => 'rate_review',
    'ruta' => '/evaluar',
    'permisos' => ['evaluaciones.evaluar'],
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
    'label' => 'Evidencias',
    'icon' => 'attach_file',
    'ruta' => '/evidencias',
    'permisos' => ['evidencias.listar', 'evidencias.subir'],
   ],
   [
    'label' => 'Ver Evaluaciones',
    'icon' => 'assessment',
    'ruta' => '/evaluaciones',
    'permisos' => ['evaluaciones.listar'],
   ],
  ];
 }

 private function menuPorPermisos(array $user): array
 {
  $roles = $user['roles'] ?? [];
  $rolCodigos = [];
  foreach ($roles as $r) {
   if (is_array($r) && isset($r['codigo'])) {
    $rolCodigos[] = $r['codigo'];
   } elseif (is_string($r)) {
    $rolCodigos[] = $r;
   }
  }

  if (empty($rolCodigos)) {
   return [];
  }

  $pdo = \App\Config\Database::getInstance();
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
   'compromisos' => ['label' => 'Compromisos', 'icon' => 'task_alt', 'ruta' => '/compromisos/mios'],
   'evidencias' => ['label' => 'Evidencias', 'icon' => 'attach_file', 'ruta' => '/evidencias'],
   'ausentismos' => ['label' => 'Ausentismos', 'icon' => 'event_busy', 'ruta' => '/ausentismos'],
   'movilidades' => ['label' => 'Movilidad', 'icon' => 'swap_horiz', 'ruta' => '/movilidad'],
   'reportes' => ['label' => 'Reportes', 'icon' => 'summarize', 'ruta' => '/reportes'],
   'cargas' => ['label' => 'Cargas Masivas', 'icon' => 'upload_file', 'ruta' => '/cargas'],
   'parametros' => ['label' => 'Parametros', 'icon' => 'settings', 'ruta' => '/parametros'],
  ];

  foreach ($modulos as $modulo => $permisosModulo) {
   if (isset($menuMap[$modulo])) {
    $menu[] = array_merge($menuMap[$modulo], ['permisos' => array_column($permisosModulo, 'codigo')]);
   }
  }

  return $menu;
 }
}
