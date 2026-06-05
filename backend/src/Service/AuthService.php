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

 $prioridad = ['admin', 'jefe_personal', 'evaluador', 'evaluado', 'cargador', 'comision_evaluadora'];
 $rolActivo = null;
 foreach ($prioridad as $p) {
 if (in_array($p, $rolCodigos)) {
 $rolActivo = $p;
 break;
 }
 }
 $rolActivo = $rolActivo ?? ($rolCodigos[0] ?? null);

 if ($usuario['es_contratista'] && !in_array('cargador', $rolCodigos)) {
 $rolCodigos[] = 'cargador';
 if ($rolActivo === null) {
 $rolActivo = 'cargador';
 }
 }

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
 $usuario['nombre_completo'] = trim(($usuario['primer_nombre'] ?? '') . ' ' . ($usuario['segundo_nombre'] ?? '') . ' ' . ($usuario['primer_apellido'] ?? '') . ' ' . ($usuario['segundo_apellido'] ?? ''));
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
 $existente = $this->usuarioRepo->buscarPorDocumento($datos['documento']);
 if ($existente) {
 ResponseHelper::error('Ya existe un usuario con ese documento', 409);
 }

 $existenteEmail = $this->usuarioRepo->buscarPorEmail($datos['email']);
 if ($existenteEmail) {
 ResponseHelper::error('Ya existe un usuario con ese correo', 409);
 }

 $hash = password_hash($datos['password'], PASSWORD_BCRYPT);

 $camposCrear = [
 'documento' => $datos['documento'],
 'tipo_documento' => $datos['tipo_documento'] ?? 'CC',
 'primer_nombre' => $datos['primer_nombre'] ?? '',
 'segundo_nombre' => $datos['segundo_nombre'] ?? null,
 'primer_apellido' => $datos['primer_apellido'] ?? '',
 'segundo_apellido' => $datos['segundo_apellido'] ?? null,
 'email' => $datos['email'],
 'password_hash' => $hash,
 'estado' => 'activo',
 'telefono1' => $datos['telefono1'] ?? $datos['telefono'] ?? null,
 'entidad_id' => $datos['entidad_id'] ?? null,
 'dependencia_id' => $datos['dependencia_id'] ?? null,
 'es_contratista' => $datos['es_contratista'] ?? 0,
 'nivel' => $datos['nivel'] ?? null,
 'naturaleza' => $datos['naturaleza'] ?? null,
 'tipo_nombramiento' => $datos['tipo_nombramiento'] ?? null,
 'denominacion_empleo' => $datos['denominacion_empleo'] ?? $datos['cargo'] ?? null,
 'codigo_empleo' => $datos['codigo_empleo'] ?? null,
 'grado_empleo' => $datos['grado_empleo'] ?? null,
 'genero' => $datos['genero'] ?? null,
 'fecha_posesion' => $datos['fecha_posesion'] ?? null,
 'en_periodo_prueba' => $datos['en_periodo_prueba'] ?? 0,
 'proposito_principal_empleo' => $datos['proposito_principal_empleo'] ?? null,
 ];

 $this->usuarioRepo->crear($camposCrear);

 $pdo = Database::getInstance();
 $usuarioId = (int) $pdo->lastInsertId();

 $esContratista = !empty($datos['es_contratista']);
 $rolCodigo = $esContratista ? 'cargador' : 'evaluado';
 $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = ? LIMIT 1");
 $stmt->execute([$rolCodigo]);
 $rol = $stmt->fetch();
 if ($rol) {
 $this->usuarioRepo->asignarRol($usuarioId, (int) $rol['id'], $datos['entidad_id'] ?? null);
 }

 if (!empty($datos['roles'])) {
 foreach ($datos['roles'] as $rolCod) {
 $stmt = $pdo->prepare("SELECT id FROM roles WHERE codigo = ? LIMIT 1");
 $stmt->execute([$rolCod]);
 $r = $stmt->fetch();
 if ($r && (int) $r['id'] !== (int) $rol['id']) {
 $this->usuarioRepo->asignarRol($usuarioId, (int) $r['id'], $datos['entidad_id'] ?? null);
 }
 }
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

 $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 $codigo = '';
 for ($i = 0; $i < 6; $i++) {
 $codigo .= $chars[random_int(0, strlen($chars) - 1)];
 }

 $expiracion = date('Y-m-d H:i:s', time() + 3600);

 $pdo = Database::getInstance();
 $stmt = $pdo->prepare("INSERT INTO recuperaciones (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)");
 $stmt->execute([$usuario['id'], $codigo, $expiracion]);

 $nombre = trim(($usuario['primer_nombre'] ?? '') . ' ' . ($usuario['primer_apellido'] ?? ''));
 $enviado = \App\Helper\MailHelper::enviarRecuperacion($email, $nombre, $codigo);

 if (!$enviado) {
 ResponseHelper::error('No se pudo enviar el correo de recuperacion. Intente mas tarde.', 500);
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
 ResponseHelper::error('Codigo invalido o expirado', 400);
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

 public function restablecerPassword(int $usuarioId): string
 {
 $usuario = $this->usuarioRepo->buscarPorId($usuarioId);
 if (!$usuario) {
 ResponseHelper::error('Usuario no encontrado', 404);
 }

 $tempPassword = 'Edl' . bin2hex(random_bytes(4)) . '!';
 $hash = password_hash($tempPassword, PASSWORD_BCRYPT);
 $this->usuarioRepo->restablecerPassword($usuarioId, $hash);
 $this->sesionRepo->revocarPorUsuario($usuarioId);

 AuditoriaService::registrar('restablecer_password', 'usuarios', $usuarioId);

 return $tempPassword;
 }

 public function obtenerPerfil(int $usuarioId): array
 {
 $usuario = $this->usuarioRepo->buscarPorId($usuarioId);
 if (!$usuario) {
 ResponseHelper::error('Usuario no encontrado', 404);
 }
 unset($usuario['password_hash']);
 $usuario['nombre_completo'] = trim(($usuario['primer_nombre'] ?? '') . ' ' . ($usuario['segundo_nombre'] ?? '') . ' ' . ($usuario['primer_apellido'] ?? '') . ' ' . ($usuario['segundo_apellido'] ?? ''));
 $roles = $this->usuarioRepo->obtenerRoles($usuarioId);
 $permisos = $this->usuarioRepo->obtenerPermisos($usuarioId);
 return ['usuario' => $usuario, 'roles' => $roles, 'permisos' => $permisos];
 }

 public function actualizarPerfil(int $usuarioId, array $datos): void
 {
 $permitidos = ['telefono1', 'telefono2', 'email'];
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

 $minLen = (int) Env::get('PASSWORD_LONGITUD_MINIMA', 8);
 if (strlen($nuevaPassword) < $minLen) {
 ResponseHelper::error("La contrasena debe tener al menos {$minLen} caracteres", 422);
 }

 $hash = password_hash($nuevaPassword, PASSWORD_BCRYPT);
 $this->usuarioRepo->actualizar($usuarioId, ['password_hash' => $hash]);
 }

 public function refreshToken(string $oldToken): array
 {
 try {
 $payload = JwtHelper::validate($oldToken);
 } catch (\Exception $e) {
 ResponseHelper::error('Token invalido para refresh', 401);
 }

 $exp = $payload['exp'] ?? 0;
 $tiempoRestante = $exp - time();

 if ($tiempoRestante > 900) {
 ResponseHelper::error('Token aun vigente, no es necesario refresh', 400);
 }

 $tokenHash = hash('sha256', $oldToken);
 $pdo = Database::getInstance();
 $stmt = $pdo->prepare("UPDATE sesiones SET revocada = 1 WHERE token_hash = ?");
 $stmt->execute([$tokenHash]);

 $usuarioId = (int) $payload['sub'];
 $usuario = $this->usuarioRepo->buscarPorId($usuarioId);
 if (!$usuario || $usuario['estado'] !== 'activo') {
 ResponseHelper::error('Usuario no valido', 401);
 }

 $roles = $payload['roles'] ?? [];
 $entidadId = $payload['entidad_id'] ?? $usuario['entidad_id'];
 $rolActivo = $payload['rol_activo'] ?? ($roles[0] ?? null);

 $nuevoToken = JwtHelper::generate($usuarioId, $usuario['documento'], $roles, $entidadId, $rolActivo);
 $nuevoHash = hash('sha256', $nuevoToken);
 $expiracion = date('Y-m-d H:i:s', time() + ((int) Env::get('JWT_EXPIRACION_MINUTOS', 120)) * 60);

 $this->sesionRepo->crearSesion(
 $usuarioId,
 $nuevoHash,
 $_SERVER['REMOTE_ADDR'] ?? '',
 $_SERVER['HTTP_USER_AGENT'] ?? '',
 $expiracion
 );

 AuditoriaService::registrar('refresh_token', 'usuarios', $usuarioId);

 return [
 'token' => $nuevoToken,
 'expiracion' => $expiracion,
 'rol_activo' => $rolActivo
 ];
 }

 public function cambiarRolActivo(int $usuarioId, string $rolCodigo): array
 {
 $roles = $this->usuarioRepo->obtenerRoles($usuarioId);
 $rolCodigos = array_column($roles, 'codigo');

 if (!in_array($rolCodigo, $rolCodigos)) {
 ResponseHelper::error('El usuario no tiene asignado el rol ' . $rolCodigo, 403);
 }

 $usuario = $this->usuarioRepo->buscarPorId($usuarioId);
 if (!$usuario) {
 ResponseHelper::error('Usuario no encontrado', 404);
 }

 $entidadId = $usuario['entidad_id'];
 $token = JwtHelper::generate($usuarioId, $usuario['documento'], $rolCodigos, $entidadId, $rolCodigo);
 $tokenHash = hash('sha256', $token);
 $expiracion = date('Y-m-d H:i:s', time() + ((int) Env::get('JWT_EXPIRACION_MINUTOS', 120)) * 60);

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
