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

    /**
     * Competencias habilitadas para concertar compromisos comportamentales:
     * las comunes (transversales, Decreto 815/2018) mas las del nivel
     * jerarquico del evaluado. Cada fila trae el campo `origen` (comun|nivel).
     */
    public function paraConcertacion(?string $nivel = null): array
    {
        $sql = "
            SELECT 'comun' AS origen, NULL AS nivel_codigo,
                   ccm.com_bd AS competencia_codigo, c.nombre AS competencia_nombre,
                   ccm.com_json AS nombre_json,
                   CASE c.decreto WHEN '2539' THEN '2539/2005' WHEN '815' THEN '815/2018' ELSE c.decreto END AS decreto,
                   cd.id AS conducta_id, cd.texto AS conducta_texto, cd.orden AS conducta_orden
            FROM competencias_comunes_map ccm
            JOIN competencias c ON c.codigo = ccm.com_bd
            LEFT JOIN conductas cd ON cd.competencia_codigo = c.codigo AND cd.activo = 1
        ";
        $params = [];
        if ($nivel) {
            $sql .= "
                UNION ALL
                SELECT 'nivel' AS origen, v.nivel_codigo, v.competencia_codigo,
                       v.competencia_nombre, v.nombre_json, v.decreto,
                       v.conducta_id, v.conducta_texto, v.conducta_orden
                FROM v_competencias_por_nivel v
                WHERE v.nivel_codigo = ?
            ";
            $params[] = $nivel;
        }
        $sql .= " ORDER BY origen, competencia_codigo, conducta_orden";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function niveles(): array
    {
        return $this->pdo->query("SELECT * FROM niveles_jerarquicos ORDER BY orden")->fetchAll(PDO::FETCH_ASSOC);
    }
}
