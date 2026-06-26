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

 if (!in_array('admin', $roles)) {
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
 if (!in_array('admin', $roles) && (int) $aus['funcionario_id'] !== $user['id']) {
 ResponseHelper::forbidden();
 }

 return $aus;
 }

 public function crear(array $datos): int
 {
 $v = new ValidatorHelper();
 $v->validate($datos, [
 'funcionario_id' => 'required',
 'motivo' => 'required',
 'fecha_inicio' => 'required',
 'fecha_fin' => 'required'
 ]);

 if (!isset($datos['dias'])) {
 $fi = new \DateTime($datos['fecha_inicio']);
 $ff = new \DateTime($datos['fecha_fin']);
 $interval = $fi->diff($ff);
 $datos['dias'] = max(1, (int) $interval->days + 1);
 }

 /**
  * Motivos validos segun schema.sql (ENUM ausentismos.motivo):
  * incapacidad, comision, encargo, suspension, licencias, vacaciones, otro.
  */
 $tiposValidos = ['incapacidad', 'comision', 'encargo', 'suspension', 'licencias', 'vacaciones', 'otro'];
 if (!in_array($datos['motivo'], $tiposValidos, true)) {
 ResponseHelper::error('Tipo de ausentismo invalido. Valores permitidos: ' . implode(', ', $tiposValidos), 422);
 }

 /**
  * Restriccion normativa: el ausentismo solo aplica a funcionarios de
  * carrera administrativa o en periodo de prueba (Art. 36 Decreto 815 de 2018,
  * ver transcripcion cnsc/11-modulo-jefe-personal.md).
  */
 $stmtFuncionario = Database::getInstance()->prepare(
 "SELECT naturaleza, en_periodo_prueba FROM usuarios WHERE id = :uid AND eliminado_en IS NULL"
 );
 $stmtFuncionario->execute(['uid' => $datos['funcionario_id']]);
 $funcionario = $stmtFuncionario->fetch();
 if (!$funcionario) {
 ResponseHelper::error('Funcionario no encontrado', 404);
 }
 $esCarrera = ($funcionario['naturaleza'] ?? null) === 'carrera_administrativa';
 $esPeriodoPrueba = !empty($funcionario['en_periodo_prueba']) && (bool) $funcionario['en_periodo_prueba'];
 if (!$esCarrera && !$esPeriodoPrueba) {
 ResponseHelper::error(
 'El funcionario no es de carrera administrativa ni se encuentra en periodo de prueba. El registro de ausentismo (>30 dias) no aplica conforme al Decreto 815 de 2018.',
 422
 );
 }

 $datos['dias'] = (int) $datos['dias'];

 if ($datos['dias'] > 30) {
 $datos['afecta_evaluacion_eval'] = 1;
 $pdo = Database::getInstance();
 $stmt = $pdo->prepare("
 SELECT u.id FROM usuarios u
 INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
 INNER JOIN roles r ON r.id = ur.rol_id
 WHERE r.codigo = 'admin' AND u.estado = 'activo' AND u.eliminado_en IS NULL
 LIMIT 1
 ");
 $stmt->execute();
 $jefe = $stmt->fetch();

	if (!empty($jefe['id'])) {
	$notifService = new NotificacionService();
	$notifService->notificar(
	$jefe['id'],
	'Ausentismo superior a 30 dias',
	"El funcionario ID {$datos['funcionario_id']} registro un ausentismo de {$datos['dias']} dias. Segun el Decreto 815 Art. 36, esto afecta su evaluacion de desempeno.",
	'alerta'
	);
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
 if (!in_array('admin', $roles) && (int) $aus['funcionario_id'] !== $user['id']) {
 ResponseHelper::forbidden();
 }

 $permitidos = ['motivo', 'fecha_inicio', 'fecha_fin', 'dias', 'observaciones', 'estado'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 if (isset($datosFiltrados['dias']) && (int) $datosFiltrados['dias'] > 30) {
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
 if (!in_array('admin', $roles)) {
 ResponseHelper::forbidden();
 }

 $this->repo->eliminar($id);
 AuditoriaService::registrar('eliminar', 'ausentismos', $id, $aus, null);
 }
}
