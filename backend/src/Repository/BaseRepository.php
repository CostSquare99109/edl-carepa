<?php

namespace App\Repository;

use App\Config\Database;
use PDO;

class BaseRepository
{
    protected PDO $pdo;
    protected string $table;
    protected string $primaryKey = 'id';

    public function __construct(?PDO $pdo = null)
    {
        $this->pdo = $pdo ?? Database::getInstance();
    }

	protected array $allowedFilterFields = [];
	protected array $allowedSortFields = ['id', 'creado_en', 'actualizado_en'];

	public function listar(array $filtros = [], int $pagina = 1, int $porPagina = 20, string $orden = 'id', string $direccion = 'ASC'): array
	{
		$conditions = ['eliminado_en IS NULL'];
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
					$conditions[] = "`{$campo}` IN ({$placeholders})";
					$params = array_merge($params, $valor);
				} else {
					$conditions[] = "`{$campo}` LIKE ?";
					$params[] = "%{$valor}%";
				}
			}
		}

		$where = implode(' AND ', $conditions);

		$countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM `{$this->table}` WHERE {$where}");
		$countStmt->execute($params);
		$total = (int) $countStmt->fetchColumn();

		$offset = ($pagina - 1) * $porPagina;
		$dir = strtoupper($direccion) === 'DESC' ? 'DESC' : 'ASC';

		if (!in_array($orden, $this->allowedSortFields, true)) {
			$orden = $this->primaryKey;
		}

		$stmt = $this->pdo->prepare("SELECT * FROM `{$this->table}` WHERE {$where} ORDER BY `{$orden}` {$dir} LIMIT ? OFFSET ?");
		$params[] = $porPagina;
		$params[] = $offset;
		$stmt->execute($params);

        return [
            'data' => $stmt->fetchAll(),
            'total' => $total,
            'pagina' => $pagina,
            'por_pagina' => $porPagina,
            'total_paginas' => ceil($total / $porPagina)
        ];
    }

    public function buscarPorId(int $id): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ? AND eliminado_en IS NULL");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function crear(array $datos): int
    {
    	$datos = $this->filtrarCampos($datos);
    	$campos = implode(', ', array_map(fn($c) => "`{$c}`", array_keys($datos)));
    	$placeholders = implode(', ', array_fill(0, count($datos), '?'));
    	$stmt = $this->pdo->prepare("INSERT INTO `{$this->table}` ({$campos}) VALUES ({$placeholders})");
    	$stmt->execute(array_values($datos));
    	return (int) $this->pdo->lastInsertId();
    }

    public function actualizar(int $id, array $datos): bool
    {
    	$datos = $this->filtrarCampos($datos);
    	$sets = [];
    	$params = [];
    	foreach ($datos as $campo => $valor) {
    		$sets[] = "`{$campo}` = ?";
    		$params[] = $valor;
    	}
    	$params[] = $id;
    	$stmt = $this->pdo->prepare("UPDATE `{$this->table}` SET " . implode(', ', $sets) . " WHERE `{$this->primaryKey}` = ? AND eliminado_en IS NULL");
    	return $stmt->execute($params);
    }

    public function eliminar(int $id): bool
    {
        $stmt = $this->pdo->prepare("UPDATE {$this->table} SET eliminado_en = NOW() WHERE {$this->primaryKey} = ?");
        return $stmt->execute([$id]);
    }

    public function buscarPorCampo(string $campo, mixed $valor): ?array
    {
    	if (!preg_match('/^[a-zA-Z0-9_]+$/', $campo)) {
    		return null;
    	}
    	$stmt = $this->pdo->prepare("SELECT * FROM `{$this->table}` WHERE `{$campo}` = ? AND eliminado_en IS NULL LIMIT 1");
    	$stmt->execute([$valor]);
    	$result = $stmt->fetch();
    	return $result ?: null;
    }

    public function existe(string $campo, mixed $valor, ?int $excluirId = null): bool
    {
    	if (!preg_match('/^[a-zA-Z0-9_]+$/', $campo)) {
    		return false;
    	}
    	$sql = "SELECT COUNT(*) FROM `{$this->table}` WHERE `{$campo}` = ? AND eliminado_en IS NULL";
    	$params = [$valor];
    	if ($excluirId) {
    		$sql .= " AND `{$this->primaryKey}` != ?";
    		$params[] = $excluirId;
    	}
    	$stmt = $this->pdo->prepare($sql);
    	$stmt->execute($params);
    	return (int) $stmt->fetchColumn() > 0;
    }

    protected array $guardedFields = ['id', 'eliminado_en', 'creado_en', 'actualizado_en'];

    protected function filtrarCampos(array $datos): array
    {
    	if (!empty($this->allowedFilterFields)) {
    		return array_intersect_key($datos, array_flip($this->allowedFilterFields));
    	}
    	return array_filter(
    		$datos,
    		fn($key) => preg_match('/^[a-zA-Z0-9_]+$/', $key) && !in_array($key, $this->guardedFields, true),
    		ARRAY_FILTER_USE_KEY
    	);
    }
    }
