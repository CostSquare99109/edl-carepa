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
 'fecha_fin' => 'required'
 ]);

 if (!isset($datos['dias_habiles'])) {
 $fi = new \DateTime($datos['fecha_inicio']);
 $ff = new \DateTime($datos['fecha_fin']);
 $interval = $fi->diff($ff);
 $datos['dias_habiles'] = max(1, (int) $interval->days + 1);
 }

 $tiposValidos = ['vacacion', 'licencia', 'incapacidad', 'permiso', 'comision', 'otro'];
 if (!in_array($datos['tipo'], $tiposValidos)) {
 ResponseHelper::error('Tipo de ausentismo invalido', 422);
 }

 $diasHabiles = (int) $datos['dias_habiles'];

 if ($diasHabiles > 30) {
 $datos['afecta_evaluacion_eval'] = 1;
 $pdo = Database::getInstance();
 $stmt = $pdo->prepare("
 SELECT u.id FROM usuarios u
 INNER JOIN usuario_roles ur ON ur.usuario_id = u.id
 INNER JOIN roles r ON r.id = ur.rol_id
 WHERE r.codigo = 'jefe_personal' AND u.estado = 'activo' AND u.eliminado_en IS NULL
 LIMIT 1
 ");
 $stmt->execute();
 $jefe = $stmt->fetch();

 if (!empty($jefe['id'])) {
 $notifService = new NotificacionService();
 $notifService->crear([
 'usuario_id' => $jefe['id'],
 'tipo' => 'ausentismo_extendido',
 'titulo' => 'Ausentismo superior a 30 dias',
 'mensaje' => "El funcionario ID {$datos['funcionario_id']} registro un ausentismo de {$diasHabiles} dias habiles. Segun el Decreto 815 Art. 36, esto afecta su evaluacion de desempeno.",
 'url' => '/ausentismos'
 ]);
 }
 }

 unset($datos['afecta_evaluacion'], $datos['afecta_evaluacion_eval'], $datos['requiere_aprobacion_jefe']);

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
 $datosFiltrados['estado'] = $datosFiltrados['estado'] ?? 'vigente';
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

 $this->repo->eliminar($id);
 AuditoriaService::registrar('eliminar', 'ausentismos', $id, $aus, null);
 }
}
