<?php

namespace App\Service;

use App\Repository\NotificacionRepository;
use App\Config\Database;

class NotificacionService
{
  private NotificacionRepository $repo;

  public function __construct()
  {
    $this->repo = new NotificacionRepository();
  }

  public function notificar(int $usuarioId, string $titulo, string $mensaje, string $tipo = 'info'): int
  {
    return $this->repo->crearNotificacion($usuarioId, $titulo, $mensaje, $tipo);
  }

  public function notificarCompromisoPendiente(int $evaluadorId, string $nombreFuncionario, int $compromisoId): int
  {
    $titulo = 'Compromiso pendiente de aprobacion';
    $mensaje = "El funcionario {$nombreFuncionario} ha enviado un compromiso para su aprobacion. Debe asignar un peso porcentual.";
    return $this->repo->crearNotificacion($evaluadorId, $titulo, $mensaje, 'alerta');
  }

  public function notificarCompromisoAprobado(int $funcionarioId, int $compromisoId, float $peso): int
  {
    $titulo = 'Compromiso aprobado';
    $mensaje = "Su compromiso ha sido aprobado con un peso del {$peso}%.";
    return $this->repo->crearNotificacion($funcionarioId, $titulo, $mensaje, 'exito');
  }

  public function notificarCompromisoRechazado(int $funcionarioId, int $compromisoId, string $observaciones = ''): int
  {
    $titulo = 'Compromiso rechazado';
    $obs = $observaciones ? " Observaciones: {$observaciones}" : '';
    $mensaje = "Su compromiso ha sido rechazado.{$obs}";
    return $this->repo->crearNotificacion($funcionarioId, $titulo, $mensaje, 'error');
  }

  public function contarNoLeidas(int $usuarioId): int
  {
    $pdo = Database::getInstance();
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notificaciones WHERE usuario_id = ? AND leida = 0");
    $stmt->execute([$usuarioId]);
    return (int) $stmt->fetchColumn();
  }

  public function compromisosPendientesPorAprobar(int $evaluadorId): int
  {
    $pdo = Database::getInstance();
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM compromisos WHERE evaluador_id = ? AND estado = 'propuesto' AND eliminado_en IS NULL");
    $stmt->execute([$evaluadorId]);
    return (int) $stmt->fetchColumn();
  }
}
