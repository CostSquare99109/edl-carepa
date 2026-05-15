<?php

namespace App\Service;

use App\Repository\UsuarioRepository;
use App\Repository\EntidadRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Middleware\TenantMiddleware;

class UsuarioService
{
    private UsuarioRepository $repo;

    public function __construct()
    {
        $this->repo = new UsuarioRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        $user = \App\Middleware\AuthMiddleware::user();
        $roles = $user['roles'] ?? [];

        if (!in_array('admin', $roles)) {
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
            'tipo_documento' => 'required|max:5',
            'nombres' => 'required|max:100',
            'apellidos' => 'required|max:100',
            'email' => 'required|email|max:150',
            'password' => 'required|min:8'
        ]);

        if ($this->repo->existe('documento', $datos['documento'])) {
            ResponseHelper::error('Ya existe un usuario con ese documento', 409);
        }
        if ($this->repo->existe('email', $datos['email'])) {
            ResponseHelper::error('Ya existe un usuario con ese email', 409);
        }

        $datos['password_hash'] = password_hash($datos['password'], PASSWORD_BCRYPT);
        unset($datos['password']);
        $datos['estado'] = $datos['estado'] ?? 'activo';

        $id = $this->repo->crear($datos);

        if (!empty($datos['roles'])) {
            $pdo = Database::getInstance();
            foreach ($datos['roles'] as $rolCodigo) {
                $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = ?");
                $stmt->execute([$rolCodigo]);
                $rol = $stmt->fetch();
                if ($rol) {
                    $this->repo->asignarRol($id, $rol['id'], $datos['entidad_id'] ?? null);
                }
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
        return $usuario;
    }

    public function actualizar(int $id, array $datos): void
    {
        $usuario = $this->repo->buscarPorId($id);
        if (!$usuario) {
            ResponseHelper::error('Usuario no encontrado', 404);
        }

        $permitidos = ['nombres','apellidos','email','telefono','tipo_documento','cargo','grado','tipo_vinculacion','fecha_vinculacion','entidad_id','dependencia_id','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

        if (isset($datos['password'])) {
            $datosFiltrados['password_hash'] = password_hash($datos['password'], PASSWORD_BCRYPT);
        }

        if (!empty($datos['roles'])) {
            $this->repo->removerRoles($id);
            $pdo = Database::getInstance();
            foreach ($datos['roles'] as $rolCodigo) {
                $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = ?");
                $stmt->execute([$rolCodigo]);
                $rol = $stmt->fetch();
                if ($rol) {
                    $this->repo->asignarRol($id, $rol['id'], $datos['entidad_id'] ?? $usuario['entidad_id']);
                }
            }
        }

        $this->repo->actualizar($id, $datosFiltrados);
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
}
