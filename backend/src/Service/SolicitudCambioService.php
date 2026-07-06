<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\SolicitudCambioRepository;
use App\Repository\ConcertacionRepository;
use App\Repository\UsuarioRepository;
use App\Helper\ResponseHelper;

class SolicitudCambioService
{
    private SolicitudCambioRepository $repo;
    private ConcertacionRepository $concertacionRepo;
    private UsuarioRepository $usuarioRepo;
    private NotificacionService $notificacionService;

    public function __construct()
    {
        $this->repo = new SolicitudCambioRepository();
        $this->concertacionRepo = new ConcertacionRepository();
        $this->usuarioRepo = new UsuarioRepository();
        $this->notificacionService = new NotificacionService();
    }

    public function misSolicitudes(int $evaluadoId, int $pagina = 1, int $porPagina = 20): array
    {
        return $this->repo->listarPorEvaluado($evaluadoId, $pagina, $porPagina);
    }

    public function pendientesJefe(int $pagina = 1, int $porPagina = 20): array
    {
        return $this->repo->listarPendientesJefe($pagina, $porPagina);
    }

    public function crear(array $datos, int $evaluadoId, int $evaluadorActualId): array
    {
        if ($this->repo->existePendiente($evaluadoId)) {
            ResponseHelper::error('Ya tienes una solicitud pendiente. Espera a que sea resuelta antes de crear una nueva.', 400);
        }

        $motivosPermitidos = ['retiro_empleado_responsable', 'impedimento', 'recusacion'];
        if (!in_array($datos['motivo'], $motivosPermitidos)) {
            ResponseHelper::validationError(['motivo' => 'Motivo no valido']);
        }

        if (empty($datos['descripcion'])) {
            ResponseHelper::validationError(['descripcion' => 'La descripcion es requerida']);
        }

        $id = $this->repo->crear([
            'evaluado_id' => $evaluadoId,
            'evaluador_actual_id' => $evaluadorActualId,
            'evaluador_sugerido_id' => !empty($datos['evaluador_sugerido_id']) ? (int) $datos['evaluador_sugerido_id'] : null,
            'motivo' => $datos['motivo'],
            'descripcion' => $datos['descripcion'],
        ]);

        $jefes = $this->usuarioRepo->listarPorRol('jefe_de_personal');
        foreach ($jefes['data'] ?? [] as $jefe) {
            $this->notificacionService->notificar(
                (int) $jefe['id'],
                'Nueva solicitud de cambio de evaluador',
                "Un funcionario ha solicitado un cambio de evaluador.",
                'alerta'
            );
        }

        return ['id' => $id];
    }

    public function decidir(int $id, string $decision, ?int $nuevoEvaluadorId, ?string $comentario, int $decididoPor): array
    {
        $solicitud = $this->repo->buscarPorId($id);
        if (!$solicitud) {
            ResponseHelper::notFound('Solicitud no encontrada');
        }
        if ($solicitud['estado'] !== 'pendiente') {
            ResponseHelper::error('Esta solicitud ya fue resuelta', 400);
        }

        $estado = $decision === 'aprobar' ? 'aprobada' : 'rechazada';
        $this->repo->decidir($id, $estado, $nuevoEvaluadorId, $comentario, $decididoPor);

        if ($estado === 'aprobada' && $nuevoEvaluadorId) {
            $concertaciones = $this->concertacionRepo->buscarPorEvaluadorYEvaluado(
                (int) $solicitud['evaluador_actual_id'],
                (int) $solicitud['evaluado_id']
            );
            foreach ($concertaciones as $con) {
                $this->concertacionRepo->reassignarEvaluador((int) $con['id'], $nuevoEvaluadorId);
                $this->repo->registrarHistorial(
                    (int) $con['id'],
                    (int) $solicitud['evaluador_actual_id'],
                    $nuevoEvaluadorId,
                    $solicitud['motivo'],
                    $id
                );
            }
        }

        $titulo = $estado === 'aprobada'
            ? 'Solicitud de cambio de evaluador aprobada'
            : 'Solicitud de cambio de evaluador rechazada';
        $msg = $estado === 'aprobada'
            ? 'Tu solicitud de cambio de evaluador ha sido aprobada.'
            : 'Tu solicitud de cambio de evaluador ha sido rechazada.' . ($comentario ? " Comentario: {$comentario}" : '');
        $this->notificacionService->notificar((int) $solicitud['evaluado_id'], $titulo, $msg, $estado === 'aprobada' ? 'exito' : 'error');

        if ($estado === 'aprobada' && $nuevoEvaluadorId) {
            $this->notificacionService->notificar(
                $nuevoEvaluadorId,
                'Asignado como evaluador',
                'Has sido asignado como nuevo evaluador de un funcionario.',
                'info'
            );
        }

        return ['id' => $id, 'estado' => $estado];
    }
}
