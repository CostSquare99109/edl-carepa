<?php
declare(strict_types=1);

namespace App\Repository;

use App\Config\Database;
use PDO;

class CompetenciaRepository extends BaseRepository
{
	protected string $table = 'competencias';
	protected string $primaryKey = 'codigo';

	public function listarTodas(): array
	{
		$stmt = $this->pdo->prepare("SELECT codigo as id, nombre, decreto, descripcion FROM competencias ORDER BY decreto, nombre");
		$stmt->execute();
		return $stmt->fetchAll();
	}

	public function listarPorDecreto(string $decreto): array
	{
		$stmt = $this->pdo->prepare("SELECT codigo as id, nombre, decreto, descripcion FROM competencias WHERE decreto = ? ORDER BY nombre");
		$stmt->execute([$decreto]);
		return $stmt->fetchAll();
	}

	public function decretosDisponibles(): array
	{
		$stmt = $this->pdo->prepare("SELECT DISTINCT decreto FROM competencias ORDER BY decreto");
		$stmt->execute();
		return $stmt->fetchAll(PDO::FETCH_COLUMN);
	}
}
