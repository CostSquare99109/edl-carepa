<?php

namespace App\Repository;

class PeriodoRepository extends BaseRepository
{
    protected string $table = 'periodos';

    public function metasPorPeriodo(int $periodoId, int $pagina = 1, int $porPagina = 20): array
    {
        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM metas WHERE periodo_id = ? AND eliminado_en IS NULL");
        $stmt->execute([$periodoId]);
        $total = (int) $stmt->fetchColumn();

        $stmt = $this->pdo->prepare("SELECT m.*, COALESCE(CONCAT(f.primer_nombre, ' ', f.primer_apellido), '') as funcionario_nombre, COALESCE(CONCAT(e.primer_nombre, ' ', e.primer_apellido), '') as evaluador_nombre FROM metas m LEFT JOIN usuarios f ON f.id = m.funcionario_id LEFT JOIN usuarios e ON e.id = m.evaluador_id WHERE m.periodo_id = ? AND m.eliminado_en IS NULL ORDER BY m.id ASC LIMIT ? OFFSET ?");
        $stmt->execute([$periodoId, $porPagina, $offset]);
        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }

    public function evaluacionesPorPeriodo(int $periodoId, int $pagina = 1, int $porPagina = 20): array
    {
        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM evaluaciones WHERE periodo_id = ? AND eliminado_en IS NULL");
        $stmt->execute([$periodoId]);
        $total = (int) $stmt->fetchColumn();

        $stmt = $this->pdo->prepare("SELECT ev.*, CONCAT(ev2.primer_nombre, ' ', ev2.primer_apellido) as evaluado_nombre, CONCAT(ev3.primer_nombre, ' ', ev3.primer_apellido) as evaluador_nombre FROM evaluaciones ev INNER JOIN usuarios ev2 ON ev2.id = ev.evaluado_id INNER JOIN usuarios ev3 ON ev3.id = ev.evaluador_id WHERE ev.periodo_id = ? AND ev.eliminado_en IS NULL ORDER BY ev.id ASC LIMIT ? OFFSET ?");
        $stmt->execute([$periodoId, $porPagina, $offset]);
        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }
}
