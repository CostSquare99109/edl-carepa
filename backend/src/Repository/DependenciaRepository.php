<?php

namespace App\Repository;

use PDO;

class DependenciaRepository extends BaseRepository
{
    protected string $table = 'dependencias';
    protected array $allowedFilterFields = ['codigo', 'nombre', 'estado', 'entidad_id'];

    /**
     * Listar dependencias con conteo de usuarios activos asociados
     */
    public function listarConConteoUsuarios(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['d.eliminado_en IS NULL'];
        $params = [];

        $ignoreKeys = ['pagina', 'por_pagina', 'orden', 'direccion', 'page', 'per_page'];

        foreach ($filtros as $campo => $valor) {
            if (in_array($campo, $ignoreKeys, true)) {
                continue;
            }
            if (!empty($this->allowedFilterFields) && !in_array($campo, $this->allowedFilterFields, true)) {
                continue;
            }
            if ($valor !== null && $valor !== '') {
                if (is_array($valor)) {
                    $placeholders = implode(',', array_fill(0, count($valor), '?'));
                    $conditions[] = "d.`{$campo}` IN ({$placeholders})";
                    $params = array_merge($params, $valor);
                } else {
                    $conditions[] = "d.`{$campo}` LIKE ?";
                    $params[] = "%{$valor}%";
                }
            }
        }

        $where = implode(' AND ', $conditions);

        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM `{$this->table}` d WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare(
            "SELECT d.*,
                (SELECT COUNT(*) FROM usuarios u
                 WHERE u.dependencia_id = d.id
                   AND u.estado = 'activo'
                   AND u.eliminado_en IS NULL) AS usuarios_count
             FROM `{$this->table}` d
             WHERE {$where}
             ORDER BY d.id ASC
             LIMIT ? OFFSET ?"
        );
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return [
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'total' => $total,
            'pagina' => $pagina,
            'por_pagina' => $porPagina,
            'total_paginas' => ceil($total / $porPagina)
        ];
    }

    /**
     * Cuenta usuarios activos asociados a una dependencia
     */
    public function contarUsuariosActivos(int $id): int
    {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM usuarios
             WHERE dependencia_id = :id
               AND estado = 'activo'
               AND eliminado_en IS NULL"
        );
        $stmt->execute([':id' => $id]);
        return (int) $stmt->fetchColumn();
    }
}
