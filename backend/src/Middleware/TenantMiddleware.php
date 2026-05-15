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

        if (in_array('jefe_entidad', $roles) || in_array('jefe_dependencia', $roles)) {
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

        if (in_array('funcionario', $roles) && !in_array('evaluador', $roles) && !in_array('jefe_entidad', $roles)) {
            $conditions[] = "{$alias}.id = ?";
            $params[] = $user['id'];
        } elseif (in_array('jefe_entidad', $roles) || in_array('jefe_dependencia', $roles)) {
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
}
