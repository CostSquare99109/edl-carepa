<?php

namespace App\Service;

use App\Repository\UsuarioRepository;
use App\Repository\SesionRepository;
use App\Helper\JwtHelper;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Config\Env;

class AuthService
{
    private UsuarioRepository $usuarioRepo;
    private SesionRepository $sesionRepo;

    public function __construct()
    {
        $pdo = Database::getInstance();
        $this->usuarioRepo = new UsuarioRepository($pdo);
        $this->sesionRepo = new SesionRepository($pdo);
    }

    public function login(string $documento, string $tipoDocumento, string $password): array
    {
        $usuario = $this->usuarioRepo->buscarPorDocumento($documento, $tipoDocumento);

        if (!$usuario) {
            ResponseHelper::error('Credenciales invalidas', 401);
        }

        if ($usuario['estado'] === 'bloqueado') {
            ResponseHelper::error('Cuenta bloqueada. Contacte al administrador.', 403);
        }

        if ($usuario['estado'] !== 'activo') {
            ResponseHelper::error('Cuenta inactiva', 403);
        }

        if (!password_verify($password, $usuario['password_hash'])) {
            $this->usuarioRepo->incrementarIntentosFallidos($usuario['id']);
            $maxIntentos = (int) Env::get('INTENTOS_LOGIN_MAXIMOS', 5);
            $bloqueado = $this->usuarioRepo->bloquearSiExcedeIntentos($usuario['id'], $maxIntentos);
            if ($bloqueado) {
                ResponseHelper::error('Cuenta bloqueada por intentos fallidos', 403);
            }
            ResponseHelper::error('Credenciales invalidas', 401);
        }

        $roles = $this->usuarioRepo->obtenerRoles($usuario['id']);
        $rolCodigos = array_column($roles, 'codigo');
        $entidadId = $usuario['entidad_id'];

        $token = JwtHelper::generate($usuario['id'], $usuario['documento'], $rolCodigos, $entidadId);
        $tokenHash = hash('sha256', $token);
        $expiracion = date('Y-m-d H:i:s', time() + ((int) Env::get('JWT_EXPIRACION_MINUTOS', 120)) * 60);

        $this->sesionRepo->crearSesion(
            $usuario['id'],
            $tokenHash,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? '',
            $expiracion
        );

        $this->usuarioRepo->actualizarUltimoAcceso($usuario['id']);

        unset($usuario['password_hash']);
        AuditoriaService::registrar('login', 'usuarios', $usuario['id']);

        return [
            'token' => $token,
            'expiracion' => $expiracion,
            'usuario' => $usuario,
            'roles' => $roles
        ];
    }

    public function logout(int $usuarioId): void
    {
        $this->sesionRepo->revocarPorUsuario($usuarioId);
        AuditoriaService::registrar('logout', 'usuarios', $usuarioId);
    }

    public function recuperarPassword(string $email): string
    {
        $usuario = $this->usuarioRepo->buscarPorEmail($email);
        if (!$usuario) {
            ResponseHelper::error('No existe cuenta con ese correo', 404);
        }

        $token = bin2hex(random_bytes(32));
        $expiracion = date('Y-m-d H:i:s', time() + 3600);

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("INSERT INTO recuperaciones (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)");
        $stmt->execute([$usuario['id'], $token, $expiracion]);

        return $token;
    }

    public function resetPassword(string $token, string $nuevaPassword): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM recuperaciones WHERE token = ? AND utilizado = 0 AND fecha_expiracion > NOW()");
        $stmt->execute([$token]);
        $rec = $stmt->fetch();

        if (!$rec) {
            ResponseHelper::error('Token invalido o expirado', 400);
        }

        $hash = password_hash($nuevaPassword, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("UPDATE usuarios SET password_hash = ?, estado = 'activo', intentos_fallidos = 0 WHERE id = ?");
        $stmt->execute([$hash, $rec['usuario_id']]);

        $stmt = $pdo->prepare("UPDATE recuperaciones SET utilizado = 1 WHERE id = ?");
        $stmt->execute([$rec['id']]);

        $this->sesionRepo->revocarPorUsuario($rec['usuario_id']);
    }

    public function obtenerPerfil(int $usuarioId): array
    {
        $usuario = $this->usuarioRepo->buscarPorId($usuarioId);
        if (!$usuario) {
            ResponseHelper::error('Usuario no encontrado', 404);
        }
        unset($usuario['password_hash']);
        $roles = $this->usuarioRepo->obtenerRoles($usuarioId);
        $permisos = $this->usuarioRepo->obtenerPermisos($usuarioId);
        return ['usuario' => $usuario, 'roles' => $roles, 'permisos' => $permisos];
    }

    public function actualizarPerfil(int $usuarioId, array $datos): void
    {
        $permitidos = ['telefono', 'email'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        if (empty($datosFiltrados)) {
            ResponseHelper::error('No hay datos para actualizar', 400);
        }
        $this->usuarioRepo->actualizar($usuarioId, $datosFiltrados);
    }

    public function cambiarPassword(int $usuarioId, string $passwordActual, string $nuevaPassword): void
    {
        $usuario = $this->usuarioRepo->buscarPorId($usuarioId);
        if (!$usuario) {
            ResponseHelper::error('Usuario no encontrado', 404);
        }

        if (!password_verify($passwordActual, $usuario['password_hash'])) {
            ResponseHelper::error('Contrasena actual incorrecta', 400);
        }

        $hash = password_hash($nuevaPassword, PASSWORD_BCRYPT);
        $this->usuarioRepo->actualizar($usuarioId, ['password_hash' => $hash]);
    }
}
