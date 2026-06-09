<?php

namespace App\Service;

use App\Repository\MovilidadRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class MovilidadService
{
 private MovilidadRepository $repo;

 public function __construct()
 {
 $this->repo = new MovilidadRepository();
 }

 public function listar(array $filtros, int $pagina, int $porPagina): array
 {
 return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 public function ver(int $id): array
 {
 $mov = $this->repo->buscarPorId($id);
 if (!$mov) {
 ResponseHelper::error('Movilidad no encontrada', 404);
 }
 return $mov;
 }

 public function crear(array $datos): int
 {
 $v = new ValidatorHelper();
 $v->validate($datos, [
 'funcionario_id' => 'required',
 'tipo' => 'required',
 'fecha_movimiento' => 'required'
 ]);

 $tiposValidos = ['ascenso', 'traslado', 'encargo', 'comision', 'reintegro', 'retiro', 'otro'];
 if (!in_array($datos['tipo'], $tiposValidos)) {
 ResponseHelper::error('Tipo de movilidad invalido. Valores validos: ' . implode(', ', $tiposValidos), 422);
 }

 $estadosValidos = ['tramite', 'aprobado', 'ejecutado', 'anulado'];
 if (isset($datos['estado']) && !in_array($datos['estado'], $estadosValidos)) {
 unset($datos['estado']);
 }

 $permitidos = ['funcionario_id', 'tipo', 'entidad_origen_id', 'dependencia_origen_id', 'entidad_destino_id', 'dependencia_destino_id', 'fecha_movimiento', 'acto_administrativo', 'observaciones', 'estado'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 $id = $this->repo->crear($datosFiltrados);
 AuditoriaService::registrar('crear', 'movilidades', $id, null, $datos);
 return $id;
 }

 public function actualizar(int $id, array $datos): void
 {
 $mov = $this->repo->buscarPorId($id);
 if (!$mov) {
 ResponseHelper::error('Movilidad no encontrada', 404);
 }

 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];
 if (!in_array('admin', $roles) && !in_array('jefe_personal', $roles)) {
 ResponseHelper::forbidden();
 }

 $permitidos = ['tipo', 'entidad_origen_id', 'dependencia_origen_id', 'entidad_destino_id', 'dependencia_destino_id', 'fecha_movimiento', 'acto_administrativo', 'observaciones', 'estado'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
 $this->repo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar', 'movilidades', $id, $mov, $datosFiltrados);
 }

 public function eliminar(int $id): void
 {
 $mov = $this->repo->buscarPorId($id);
 if (!$mov) {
 ResponseHelper::error('Movilidad no encontrada', 404);
 }

 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];
 if (!in_array('admin', $roles)) {
 ResponseHelper::forbidden();
 }

 $this->repo->eliminar($id);
 AuditoriaService::registrar('eliminar', 'movilidades', $id, $mov, null);
 }
}
