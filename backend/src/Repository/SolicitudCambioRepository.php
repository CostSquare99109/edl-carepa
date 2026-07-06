<?php

declare(strict_types=1);

namespace App\Repository;

class SolicitudCambioRepository extends BaseRepository
{
    protected string $table = 'solicitudes_cambio_evaluador';

    public function listarPorEvaluado(int $evaluadoId, int $pagina = 1, int $porPagina = 20): array
    {
        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM solicitudes_cambio_evaluador WHERE evaluado_id = ? AND eliminado_en IS NULL");
        $stmt->execute([$evaluadoId]);
        $total = (int) $stmt->fetchColumn();

        $stmt = $this->pdo->prepare("
            SELECT s.*,
                   eva_actual.primer_nombre AS evaluador_actual_nombres,
                   eva_actual.primer_apellido AS evaluador_actual_apellidos,
                   eva_sug.primer_nombre AS evaluador_sugerido_nombres,
                   eva_sug.primer_apellido AS evaluador_sugerido_apellidos,
                   nuevo.primer_nombre AS nuevo_evaluador_nombres,
                   nuevo.primer_apellido AS nuevo_evaluador_apellidos,
                   decisor.primer_nombre AS decidido_por_nombres,
                   decisor.primer_apellido AS decidido_por_apellidos
            FROM solicitudes_cambio_evaluador s
            LEFT JOIN usuarios eva_actual ON eva_actual.id = s.evaluador_actual_id
            LEFT JOIN usuarios eva_sug ON eva_sug.id = s.evaluador_sugerido_id
            LEFT JOIN usuarios nuevo ON nuevo.id = s.nuevo_evaluador_id
            LEFT JOIN usuarios decisor ON decisor.id = s.decidido_por
            WHERE s.evaluado_id = ? AND s.eliminado_en IS NULL
            ORDER BY s.creado_en DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$evaluadoId, $porPagina, $offset]);
        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }

    public function listarPendientesJefe(int $pagina = 1, int $porPagina = 20): array
    {
        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM solicitudes_cambio_evaluador WHERE estado = 'pendiente' AND eliminado_en IS NULL");
        $stmt->execute();
        $total = (int) $stmt->fetchColumn();

        $stmt = $this->pdo->prepare("
            SELECT s.*,
                   eva_actual.primer_nombre AS evaluador_actual_nombres,
                   eva_actual.primer_apellido AS evaluador_actual_apellidos,
                   eva_sug.primer_nombre AS evaluador_sugerido_nombres,
                   eva_sug.primer_apellido AS evaluador_sugerido_apellidos,
                   evdo.primer_nombre AS evaluado_nombres,
                   evdo.primer_apellido AS evaluado_apellidos,
                   evdo.documento AS evaluado_documento
            FROM solicitudes_cambio_evaluador s
            INNER JOIN usuarios evdo ON evdo.id = s.evaluado_id
            LEFT JOIN usuarios eva_actual ON eva_actual.id = s.evaluador_actual_id
            LEFT JOIN usuarios eva_sug ON eva_sug.id = s.evaluador_sugerido_id
            WHERE s.estado = 'pendiente' AND s.eliminado_en IS NULL
            ORDER BY s.creado_en DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$porPagina, $offset]);
        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }

    public function decidir(int $id, string $estado, ?int $nuevoEvaluadorId, ?string $comentario, int $decididoPor): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE solicitudes_cambio_evaluador
            SET estado = ?, nuevo_evaluador_id = ?, decision_comentario = ?, decidido_por = ?, actualizado_en = NOW()
            WHERE id = ? AND eliminado_en IS NULL
        ");
        return $stmt->execute([$estado, $nuevoEvaluadorId, $comentario, $decididoPor, $id]);
    }

    public function existePendiente(int $evaluadoId): bool
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM solicitudes_cambio_evaluador WHERE evaluado_id = ? AND estado = 'pendiente' AND eliminado_en IS NULL");
        $stmt->execute([$evaluadoId]);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function registrarHistorial(int $concertacionId, int $anteriorId, int $nuevoId, string $motivo, ?int $solicitudId): int
    {
        $stmt = $this->pdo->prepare("INSERT INTO historial_evaluadores (concertacion_id, evaluador_anterior_id, evaluador_nuevo_id, motivo, solicitud_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$concertacionId, $anteriorId, $nuevoId, $motivo, $solicitudId]);
        return (int) $this->pdo->lastInsertId();
    }
}
