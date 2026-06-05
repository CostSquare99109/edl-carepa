<?php

namespace App\Middleware;

use App\Middleware\AuthMiddleware;

class TenantMiddleware
{
 public static function applyEntityFilter(array &$conditions, array &$params, string $alias = 'e'): void
 {
 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];

 if (in_array('admin', $roles)) {
 return;
 }

 if (in_array('jefe_personal', $roles) || in_array('evaluador', $roles)) {
 if ($user['entidad_id'] !== null) {
 $conditions[] = "{$alias}.entidad_id = ?";
 $params[] = $user['entidad_id'];
 }
 }
 }

 public static function applyUserFilter(array &$conditions, array &$params, string $alias = 'u'): void
 {
 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];

 if (in_array('admin', $roles)) {
 return;
 }

 if (in_array('evaluado', $roles) && !in_array('evaluador', $roles) && !in_array('jefe_personal', $roles)) {
 $conditions[] = "{$alias}.id = ?";
 $params[] = $user['id'];
 } elseif (in_array('jefe_personal', $roles) || in_array('evaluador', $roles)) {
 if ($user['entidad_id'] !== null) {
 $conditions[] = "{$alias}.entidad_id = ?";
 $params[] = $user['entidad_id'];
 }
 }
 }

 public static function getEntityId(): ?int
 {
 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];

 if (in_array('admin', $roles)) {
 return null;
 }

 return $user['entidad_id'];
 }

 public static function puedeAccesarRecurso(int $recursoEntidadId): bool
 {
 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];

 if (in_array('admin', $roles)) {
 return true;
 }

 if ($user['entidad_id'] === null) {
 return false;
 }

 return (int) $user['entidad_id'] === $recursoEntidadId;
 }

 public static function puedeAccesarUsuario(int $targetUserId): bool
 {
 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];

 if (in_array('admin', $roles)) {
 return true;
 }

 if ((int) $user['id'] === $targetUserId) {
 return true;
 }

 if (in_array('jefe_personal', $roles) || in_array('evaluador', $roles)) {
 return true;
 }

 return false;
 }
}
