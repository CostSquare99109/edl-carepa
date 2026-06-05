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

    public function login(string $documento, string $password): array
    {
    	$usuario = $this->usuarioRepo->buscarPorDocumento($documento);

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

 // Priorizar rol admin si lo tiene, si no el primer rol
 $prioridad = ['admin', 'evaluador', 'evaluado'];
 $rolActivo = null;
 foreach ($prioridad as $p) {
 if (in_array($p, $rolCodigos)) {
 $rolActivo = $p;
 break;
 }
 }
 $rolActivo = $rolActivo ?? ($rolCodigos[0] ?? null);

 $token = JwtHelper::generate($usuario['id'], $usuario['documento'], $rolCodigos, $entidadId, $rolActivo);
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
 'roles' => $roles,
 'rol_activo' => $rolActivo
 ];
    }

    public function registrar(array $datos): array
 {
 // Verificar si ya existe documento o email
 $existente = $this->usuarioRepo->buscarPorDocumento($datos['documento']);
 if ($existente) {
 ResponseHelper::error('Ya existe un usuario con ese documento', 409);
 }

 $existenteEmail = $this->usuarioRepo->buscarPorEmail($datos['email']);
 if ($existenteEmail) {
 ResponseHelper::error('Ya existe un usuario con ese correo', 409);
 }

 $hash = password_hash($datos['password'], PASSWORD_BCRYPT);

 $this->usuarioRepo->crear([
 'documento' => $datos['documento'],
 'tipo_documento' => $datos['tipo_documento'],
 'nombres' => $datos['nombres'],
 'apellidos' => $datos['apellidos'],
 'email' => $datos['email'],
 'password_hash' => $hash,
 'estado' => 'activo',
 'telefono' => $datos['telefono'] ?? null,
 'cargo' => $datos['cargo'] ?? null,
 'entidad_id' => $datos['entidad_id'] ?? null,
 ]);

 // Asignar rol evaluado por defecto
 $pdo = Database::getInstance();
 $usuarioId = (int) $pdo->lastInsertId();
 $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = 'evaluado' LIMIT 1");
 $stmt->execute();
 $rol = $stmt->fetch();
 if ($rol) {
 $stmt = $pdo->prepare("INSERT IGNORE INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)");
 $stmt->execute([$usuarioId, $rol['id']]);
 }

 AuditoriaService::registrar('registro', 'usuarios', $usuarioId);

 return ['usuario_id' => $usuarioId];
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

		// Generar código de 6 caracteres: mayúsculas + números
		$chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		$codigo = '';
		for ($i = 0; $i < 6; $i++) {
			$codigo .= $chars[random_int(0, strlen($chars) - 1)];
		}

		$expiracion = date('Y-m-d H:i:s', time() + 3600);

		$pdo = Database::getInstance();
		$stmt = $pdo->prepare("INSERT INTO recuperaciones (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)");
		$stmt->execute([$usuario['id'], $codigo, $expiracion]);

		// Enviar correo con el código
		$nombre = trim(($usuario['nombres'] ?? '') . ' ' . ($usuario['apellidos'] ?? ''));
		$enviado = \App\Helper\MailHelper::enviarRecuperacion($email, $nombre, $codigo);

		if (!$enviado) {
			ResponseHelper::error('No se pudo enviar el correo de recuperación. Intente más tarde.', 500);
		}

		return $codigo;
	}

	public function verificarCodigo(string $codigo): array
	{
		$pdo = Database::getInstance();
		$stmt = $pdo->prepare("SELECT * FROM recuperaciones WHERE token = ? AND utilizado = 0 AND fecha_expiracion > NOW() ORDER BY id DESC LIMIT 1");
		$stmt->execute([strtoupper($codigo)]);
		$rec = $stmt->fetch();

		if (!$rec) {
			ResponseHelper::error('Código inválido o expirado', 400);
		}

		return ['codigo_valido' => true, 'recuperacion_id' => $rec['id']];
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

 /**
 * Cambia el rol activo del usuario, genera nuevo JWT con el rol seleccionado
 */
 public function cambiarRolActivo(int $usuarioId, string $rolCodigo): array
 {
 // Verificar que el usuario tenga ese rol asignado
 $roles = $this->usuarioRepo->obtenerRoles($usuarioId);
 $rolCodigos = array_column($roles, 'codigo');

 if (!in_array($rolCodigo, $rolCodigos)) {
 ResponseHelper::error('El usuario no tiene asignado el rol ' . $rolCodigo, 403);
 }

 $usuario = $this->usuarioRepo->buscarPorId($usuarioId);
 if (!$usuario) {
 ResponseHelper::error('Usuario no encontrado', 404);
 }

 // Generar nuevo JWT con el rol_activo actualizado
 $entidadId = $usuario['entidad_id'];
 $token = JwtHelper::generate($usuarioId, $usuario['documento'], $rolCodigos, $entidadId, $rolCodigo);
 $tokenHash = hash('sha256', $token);
 $expiracion = date('Y-m-d H:i:s', time() + ((int) Env::get('JWT_EXPIRACION_MINUTOS', 120)) * 60);

	// NO revocar sesiones anteriores — las peticiones en vuelo con el token
	// viejo seguirían funcionando hasta que expiren naturalmente.
	// Solo crear la nueva sesión con el token actualizado.
	$this->sesionRepo->crearSesion(
 $usuarioId,
 $tokenHash,
 $_SERVER['REMOTE_ADDR'] ?? '',
 $_SERVER['HTTP_USER_AGENT'] ?? '',
 $expiracion
 );

 AuditoriaService::registrar('cambiar_rol', 'usuarios', $usuarioId, null, ['rol_activo' => $rolCodigo]);

 return [
 'token' => $token,
 'expiracion' => $expiracion,
 'rol_activo' => $rolCodigo
 ];
 }
}
