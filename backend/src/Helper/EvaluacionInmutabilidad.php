<?php
declare(strict_types=1);

namespace App\Helper;

use App\Config\Database;
use App\Helper\ResponseHelper;

/**
 * Regla centralizada de inmutabilidad de evaluaciones (Fase F).
 *
 * Una evaluacion en estado terminal (calificada, cerrada, anulada,
 * aprobada_comision, rechazada_comision) no admite operaciones normales
 * de creacion, edicion, eliminacion, calificacion ni aprobacion de sus
 * compromisos. La lista de estados termina es la MISMA que ya usaba
 * CompromisoService::validarPropuestaPermitida (no se inventan estados).
 *
 * Codigo HTTP: 400, el mismo que aplicaba la guardia preexistente.
 */
final class EvaluacionInmutabilidad
{
    public const ESTADOS_TERMINALES = ['calificada', 'cerrada', 'anulada', 'aprobada_comision', 'rechazada_comision'];

    /** Acciones y su verbo en el mensaje (coherente con el mensaje preexistente). */
    private const MENSAJES = [
        'proponer'   => 'No se pueden proponer compromisos. La evaluacion esta %s.',
        'modificar'  => 'No se puede modificar el compromiso. La evaluacion esta %s.',
        'eliminar'   => 'No se puede eliminar el compromiso. La evaluacion esta %s.',
        'calificar'  => 'No se puede calificar el compromiso. La evaluacion esta %s.',
        'gestionar'  => 'No se puede gestionar el compromiso. La evaluacion esta %s.',
    ];

    public static function esTerminal(?string $estado): bool
    {
        return $estado !== null && in_array($estado, self::ESTADOS_TERMINALES, true);
    }

    public static function estadoDeEvaluacion(int $evaluacionId): ?string
    {
        $stmt = Database::getInstance()->prepare(
            "SELECT estado FROM evaluaciones WHERE id = ? AND eliminado_en IS NULL"
        );
        $stmt->execute([$evaluacionId]);
        $estado = $stmt->fetchColumn();
        return $estado !== false ? (string) $estado : null;
    }

    /** Resuelve la evaluacion vigente a partir de un compromiso. */
    public static function evaluacionDeCompromiso(int $compromisoId): ?int
    {
        $stmt = Database::getInstance()->prepare(
            "SELECT e.id FROM compromisos c
             INNER JOIN evaluaciones e ON e.concertacion_id = c.concertacion_id AND e.eliminado_en IS NULL
             WHERE c.id = ? AND c.eliminado_en IS NULL
             ORDER BY e.id DESC LIMIT 1"
        );
        $stmt->execute([$compromisoId]);
        $id = $stmt->fetchColumn();
        return $id !== false ? (int) $id : null;
    }

    /** Resuelve la evaluacion vigente a partir de una concertacion. */
    public static function evaluacionDeConcertacion(int $concertacionId): ?int
    {
        $stmt = Database::getInstance()->prepare(
            "SELECT id FROM evaluaciones WHERE concertacion_id = ? AND eliminado_en IS NULL
             ORDER BY id DESC LIMIT 1"
        );
        $stmt->execute([$concertacionId]);
        $id = $stmt->fetchColumn();
        return $id !== false ? (int) $id : null;
    }

    /**
     * Guardia central: aborta (HTTP 400) si la evaluacion esta en estado terminal.
     * Si $evaluacionId es null no hay evaluacion vinculada: no bloquea.
     */
    public static function asegurarMutable(?int $evaluacionId, string $accion = 'modificar'): void
    {
        if ($evaluacionId === null || $evaluacionId <= 0) {
            return;
        }
        $estado = self::estadoDeEvaluacion($evaluacionId);
        if (self::esTerminal($estado)) {
            $plantilla = self::MENSAJES[$accion] ?? self::MENSAJES['modificar'];
            ResponseHelper::error(sprintf($plantilla, $estado), 400);
        }
    }

    /** Guardia a partir de un compromiso. */
    public static function asegurarCompromisoMutable(int $compromisoId, string $accion = 'modificar'): void
    {
        self::asegurarMutable(self::evaluacionDeCompromiso($compromisoId), $accion);
    }

    /** Guardia a partir de una concertacion. */
    public static function asegurarConcertacionMutable(int $concertacionId, string $accion = 'modificar'): void
    {
        self::asegurarMutable(self::evaluacionDeConcertacion($concertacionId), $accion);
    }
}
