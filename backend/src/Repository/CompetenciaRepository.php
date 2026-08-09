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

    // FASE 2 - NUEVOS MÉTODOS
    public function comunes(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT ccm.com_json, ccm.com_bd, ccm.nombre, c.nombre AS competencia_nombre, c.decreto
            FROM competencias_comunes_map ccm
            JOIN competencias c ON c.codigo = ccm.com_bd
            ORDER BY ccm.com_json
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function porNivel(?string $nivel = null): array
    {
        $sql = "SELECT * FROM v_competencias_por_nivel";
        $params = [];
        if ($nivel) {
            $sql .= " WHERE nivel_codigo = ?";
            $params[] = $nivel;
        }
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function niveles(): array
    {
        return $this->pdo->query("SELECT * FROM niveles_jerarquicos ORDER BY orden")->fetchAll(PDO::FETCH_ASSOC);
    }
}
