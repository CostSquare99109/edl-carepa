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
 'admin_entidad' => $this->menuAdminEntidad(),
 'evaluador' => $this->menuEvaluador(),
 'evaluado' => $this->menuEvaluado(),
 'comision_evaluadora' => $this->menuComisionEvaluadora(),
 'admin_cnsc' => $this->menuAdminCnsc(),
 default => $this->menuPorPermisos($user),
 };

 ResponseHelper::success($menu);
 }

 /**
 * Menú para admin_entidad: [Usuarios]
 */
 private function menuAdminEntidad(): array
 {
 return [
 [
 'label' => 'Usuarios',
 'icon' => 'people',
 'ruta' => '/usuarios',
 'permisos' => ['usuarios.listar', 'usuarios.crear', 'usuarios.editar'],
 ],
 ];
 }

 /**
 * Menú para evaluador: [Evaluar, Evidencias, Ver Evaluaciones]
 */
 private function menuEvaluador(): array
 {
 return [
 [
 'label' => 'Evaluar',
 'icon' => 'rate_review',
 'ruta' => '/evaluar',
 'permisos' => ['evaluaciones.evaluar'],
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
 'label' => 'Ver Evaluaciones',
 'icon' => 'assessment',
 'ruta' => '/evaluaciones',
 'permisos' => ['evaluaciones.listar'],
 ],
 ];
 }

 /**
 * Menú para evaluado: [Compromisos y Competencias, Evidencias, Ver Evaluaciones]
 */
 private function menuEvaluado(): array
 {
 return [
 [
 'label' => 'Compromisos y Competencias',
 'icon' => 'task_alt',
 'ruta' => '/compromisos/mios',
 'permisos' => ['compromisos.listar', 'compromisos.crear'],
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

 /**
 * Menú para comisión evaluadora: [Evaluar (con marca Comisión), Aprobar Evaluaciones]
 */
 private function menuComisionEvaluadora(): array
 {
 return [
 [
 'label' => 'Evaluar',
 'icon' => 'rate_review',
 'ruta' => '/evaluar',
 'permisos' => ['evaluaciones.evaluar'],
 'marca' => 'Comisión',
 ],
 [
 'label' => 'Aprobar Compromisos',
 'icon' => 'fact_check',
 'ruta' => '/compromisos/aprobar',
 'permisos' => ['compromisos.aprobar'],
 ],
 ];
 }

 /**
 * Menú para admin_cnsc: [Entidades, Parámetros, Usuarios, Reportes, Soporte]
 */
 private function menuAdminCnsc(): array
 {
 return [
 [
 'label' => 'Entidades',
 'icon' => 'business',
 'ruta' => '/entidades',
 'permisos' => ['entidades.listar', 'entidades.crear', 'entidades.editar', 'entidades.habilitar'],
 ],
 [
 'label' => 'Parametros',
 'icon' => 'settings',
 'ruta' => '/parametros',
 'permisos' => ['parametros.listar', 'parametros.editar'],
 ],
 [
 'label' => 'Usuarios',
 'icon' => 'people',
 'ruta' => '/usuarios',
 'permisos' => ['usuarios.listar', 'usuarios.crear', 'usuarios.editar'],
 ],
 [
 'label' => 'Reportes',
 'icon' => 'summarize',
 'ruta' => '/reportes',
 'permisos' => ['reportes.generar'],
 ],
 [
 'label' => 'Soporte',
 'icon' => 'support_agent',
 'ruta' => '/soporte',
 'permisos' => ['soporte.acceso'],
 ],
 ];
 }

 /**
 * Fallback para roles no reconocidos: genera menú basado en permisos de BD
 */
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
