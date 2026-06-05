<?php

namespace App\Service;

use App\Repository\AusentismoRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;
use App\Config\Database;

class AusentismoService
{
 private AusentismoRepository $repo;

 public function __construct()
 {
 $this->repo = new AusentismoRepository();
 }

 public function listar(array $filtros, int $pagina, int $porPagina): array
 {
 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];

 if (!in_array('admin', $roles) && !in_array('jefe_personal', $roles)) {
 $filtros['funcionario_id'] = $user['id'];
 }

 return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 public function ver(int $id): array
 {
 $aus = $this->repo->buscarPorId($id);
 if (!$aus) {
 ResponseHelper::error('Ausentismo no encontrado', 404);
 }

 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];
 if (!in_array('admin', $roles) && !in_array('jefe_personal', $roles) && (int) $aus['funcionario_id'] !== $user['id']) {
 ResponseHelper::forbidden();
 }

 return $aus;
 }

 public function crear(array $datos): int
 {
 $v = new ValidatorHelper();
 $v->validate($datos, [
 'funcionario_id' => 'required',
 'tipo' => 'required',
 'fecha_inicio' => 'required',
 'fecha_fin' => 'required',
 'dias_habiles' => 'required'
 ]);

 $tiposValidos = ['vacacion', 'licencia', 'incapacidad', 'permiso', 'comision', 'otro'];
 if (!in_array($datos['tipo'], $tiposValidos)) {
 ResponseHelper::error('Tipo de ausentismo invalido', 422);
 }

 $diasHabiles = (int) $datos['dias_habiles'];

 if ($diasHabiles > 30) {
 $datos['tipo'] = 'licencia_extendida';
 $datos['afecta_evaluacion'] = 1;
 $datos['requiere_aprobacion_jefe'] = 1;

 $pdo = Database::getInstance();
 $stmt = $pdo->prepare("SELECT jefe_id FROM usuarios WHERE id = ? AND eliminado_en IS NULL");
 $stmt->execute([$datos['funcionario_id']]);
 $funcionario = $stmt->fetch();

 if (!empty($funcionario['jefe_id'])) {
 $notifService = new NotificacionService();
 $notifService->crear([
 'usuario_id' => $funcionario['jefe_id'],
 'tipo' => 'ausentismo_extendido',
 'titulo' => 'Ausentismo superior a 30 dias',
 'mensaje' => "El funcionario ID {$datos['funcionario_id']} registro un ausentismo de {$diasHabiles} dias habiles. Segun el Decreto 815 Art. 36, esto afecta su evaluacion de desempeno.",
 'url' => '/ausentismos'
 ]);
 }
 } else {
 $datos['afecta_evaluacion'] = 0;
 $datos['requiere_aprobacion_jefe'] = 0;
 }

 $id = $this->repo->crear($datos);
 AuditoriaService::registrar('crear', 'ausentismos', $id, null, $datos);
 return $id;
 }

 public function actualizar(int $id, array $datos): void
 {
 $aus = $this->repo->buscarPorId($id);
 if (!$aus) {
 ResponseHelper::error('Ausentismo no encontrado', 404);
 }

 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];
 if (!in_array('admin', $roles) && !in_array('jefe_personal', $roles) && (int) $aus['funcionario_id'] !== $user['id']) {
 ResponseHelper::forbidden();
 }

 $permitidos = ['tipo', 'fecha_inicio', 'fecha_fin', 'dias_habiles', 'justificado', 'observaciones', 'estado'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 if (isset($datosFiltrados['dias_habiles']) && (int) $datosFiltrados['dias_habiles'] > 30) {
 $datosFiltrados['afecta_evaluacion'] = 1;
 $datosFiltrados['requiere_aprobacion_jefe'] = 1;
 }

 $this->repo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar', 'ausentismos', $id, $aus, $datosFiltrados);
 }

 public function eliminar(int $id): void
 {
 $aus = $this->repo->buscarPorId($id);
 if (!$aus) {
 ResponseHelper::error('Ausentismo no encontrado', 404);
 }

 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];
 if (!in_array('admin', $roles) && !in_array('jefe_personal', $roles)) {
 ResponseHelper::forbidden();
 }

 $this->repo->eliminarLogico($id);
 AuditoriaService::registrar('eliminar', 'ausentismos', $id, $aus, null);
 }
}
