<?php
declare(strict_types=1);

namespace App\Service;

use App\Repository\UsuarioRepository;
use App\Repository\EntidadRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Middleware\AuthMiddleware;

class UsuarioService
{
 private UsuarioRepository $repo;

 public function __construct()
 {
 $this->repo = new UsuarioRepository();
 }

 public function listar(array $filtros, int $pagina, int $porPagina): array
 {
 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];

  if (!in_array('jefe_personal', $roles) && !in_array('jefe_dependencia', $roles) && !in_array('evaluador', $roles)) {
 if (!empty($user['entidad_id'])) {
 $filtros['entidad_id'] = $user['entidad_id'];
 }
 }

 return $this->repo->listarConRoles($filtros, $pagina, $porPagina);
 }

	public function crear(array $datos): int
	{
	 $v = new ValidatorHelper();
		$v->validate($datos, [
			'documento' => 'required|max:30',
			'primer_nombre' => 'required|max:100',
			'primer_apellido' => 'required|max:100',
			'email' => 'required|email|max:150',
			'password' => 'required'
		]);

	 if ($this->repo->existe('documento', $datos['documento'])) {
	 ResponseHelper::error('Ya existe un usuario con ese documento', 409);
	 }
	 if ($this->repo->existe('email', $datos['email'])) {
	 ResponseHelper::error('Ya existe un usuario con ese email', 409);
	 }

	 $password = $datos['password'] ?? $datos['documento'];
	 $datos['password_hash'] = password_hash($password, PASSWORD_BCRYPT);
	 unset($datos['password']);
 $datos['estado'] = $datos['estado'] ?? 'activo';

  if (!empty($datos['es_contratista'])) {
  $datos['es_contratista'] = 1;
  }

  $id = $this->repo->crear($datos);

  $roles = [];
  $naturaleza = $datos['naturaleza'] ?? '';
  if ($naturaleza === 'libre_nombramiento' || $naturaleza === 'libre_nombramiento_gerencia_publica') {
  $roles[] = 'evaluador';
  } elseif ($naturaleza === 'carrera_administrativa') {
  $roles[] = 'evaluado';
  }
  if (!empty($datos['es_contratista']) && !in_array('cargador', $roles)) {
  $roles[] = 'cargador';
  }
  if (empty($roles)) {
  $roles = ['evaluado'];
  }

 $pdo = Database::getInstance();
 foreach ($roles as $rolCodigo) {
 $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = ?");
 $stmt->execute([$rolCodigo]);
 $rol = $stmt->fetch();
 if ($rol) {
 $this->repo->asignarRol($id, $rol['id'], $datos['entidad_id'] ?? null);
 }
 }

 AuditoriaService::registrar('crear', 'usuarios', $id, null, $datos);
 return $id;
 }

 public function ver(int $id): ?array
 {
 $usuario = $this->repo->buscarPorId($id);
 if (!$usuario) {
 ResponseHelper::error('Usuario no encontrado', 404);
 }
 unset($usuario['password_hash']);
 $usuario['roles'] = $this->repo->obtenerRoles($id);
 $usuario['permisos'] = $this->repo->obtenerPermisos($id);
	$usuario['nombre_completo'] = trim(($usuario['primer_nombre'] ?? '') . ' ' . ($usuario['segundo_nombre'] ?? '') . ' ' . ($usuario['primer_apellido'] ?? '') . ' ' . ($usuario['segundo_apellido'] ?? ''));
	return $usuario;
 }

 public function actualizar(int $id, array $datos): void
 {
 $usuario = $this->repo->buscarPorId($id);
 if (!$usuario) {
 ResponseHelper::error('Usuario no encontrado', 404);
 }

  $permitidos = [
   'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
   'email', 'telefono1', 'telefono2', 'tipo_documento', 'genero',
   'denominacion_empleo', 'codigo_empleo', 'grado_empleo',
   'nivel', 'naturaleza', 'tipo_nombramiento',
   'entidad_id', 'dependencia_id',
   'estado', 'es_contratista',
   'en_periodo_prueba', 'fecha_posesion', 'proposito_principal_empleo',
   'es_evaluador_y_evaluado',
   'fecha_inicio_evaluacion', 'motivo_fecha_inicio_diferente',
  ];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 if (isset($datos['password'])) {
  $datosFiltrados['password_hash'] = password_hash($datos['password'], PASSWORD_BCRYPT);
  }

  $this->repo->actualizar($id, $datosFiltrados);

  if (isset($datos['naturaleza'])) {
  $naturalezaAnterior = $usuario['naturaleza'] ?? '';
  $naturalezaNueva = $datos['naturaleza'];

  if ($naturalezaAnterior !== $naturalezaNueva) {
  $rolAnterior = '';
  if ($naturalezaAnterior === 'libre_nombramiento' || $naturalezaAnterior === 'libre_nombramiento_gerencia_publica') {
  $rolAnterior = 'evaluador';
  } elseif ($naturalezaAnterior === 'carrera_administrativa') {
  $rolAnterior = 'evaluado';
  }

  $rolNuevo = '';
  if ($naturalezaNueva === 'libre_nombramiento' || $naturalezaNueva === 'libre_nombramiento_gerencia_publica') {
  $rolNuevo = 'evaluador';
  } elseif ($naturalezaNueva === 'carrera_administrativa') {
  $rolNuevo = 'evaluado';
  }

  $pdo = Database::getInstance();
  if ($rolAnterior && $rolAnterior !== $rolNuevo) {
  $stmt = $pdo->prepare("DELETE FROM usuario_rol WHERE usuario_id = ? AND rol_id = (SELECT id FROM roles WHERE codigo = ?)");
  $stmt->execute([$id, $rolAnterior]);
  }
  if ($rolNuevo) {
  $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = ?");
  $stmt->execute([$rolNuevo]);
  $rol = $stmt->fetch();
  if ($rol) {
  $this->repo->asignarRol($id, $rol['id'], $datos['entidad_id'] ?? $usuario['entidad_id']);
  }
  }
  }
  }
 AuditoriaService::registrar('actualizar', 'usuarios', $id, $usuario, $datosFiltrados);
 }

 public function eliminar(int $id): void
 {
 $usuario = $this->repo->buscarPorId($id);
 if (!$usuario) {
 ResponseHelper::error('Usuario no encontrado', 404);
 }
 $this->repo->eliminar($id);
 AuditoriaService::registrar('eliminar', 'usuarios', $id, $usuario);
 }

 public function listarPorDependenciaYRol(int $dependenciaId, string $rolCodigo): array
 {
  $rows = $this->repo->buscarPorDependenciaYRol($dependenciaId, $rolCodigo);
  return array_map(function ($u) {
   $nombre = trim(implode(' ', array_filter([$u['primer_nombre'] ?? '', $u['segundo_nombre'] ?? '', $u['primer_apellido'] ?? '', $u['segundo_apellido'] ?? ''])));
   return ['id' => (int) $u['id'], 'nombre' => $nombre];
  }, $rows);
 }

 public function asignarRoles(int $id, array $roles, ?int $entidadId = null): void
 {
 $usuario = $this->repo->buscarPorId($id);
 if (!$usuario) {
 ResponseHelper::error('Usuario no encontrado', 404);
 }

 $this->repo->removerRoles($id);
 $pdo = Database::getInstance();
 foreach ($roles as $rolCodigo) {
 $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = ?");
 $stmt->execute([$rolCodigo]);
 $rol = $stmt->fetch();
 if ($rol) {
 $this->repo->asignarRol($id, $rol['id'], $entidadId ?? $usuario['entidad_id']);
 }
 }

 AuditoriaService::registrar('asignar_roles', 'usuarios', $id, null, ['roles' => $roles]);
 }
}
