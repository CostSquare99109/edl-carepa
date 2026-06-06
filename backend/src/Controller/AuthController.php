<?php

namespace App\Controller;

use App\Service\AuthService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Helper\ValidatorHelper;
use App\Middleware\AuthMiddleware;

class AuthController
{
    private AuthService $service;

    public function __construct()
    {
        $this->service = new AuthService();
    }

    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);

        $v = new ValidatorHelper();
		if (!$v->validate($input, ['documento' => 'required', 'password' => 'required'])) {
		  ResponseHelper::error('Datos incompletos: ' . implode(', ', $v->getErrors()), 422);
		 }

		 $resultado = $this->service->login($input['documento'], $input['password']);
        ResponseHelper::success($resultado, 'Autenticacion exitosa');
    }

    public function registro(): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);

 $v = new ValidatorHelper();
		if (!$v->validate($input, [
			'documento' => 'required',
			'tipo_documento' => 'required',
			'nombres' => 'required',
			'apellidos' => 'required',
			'email' => 'required|email',
			'password' => 'required|min:8',
		])) {
			ResponseHelper::error('Datos incompletos: ' . implode(', ', $v->getErrors()), 422);
		}

 $resultado = $this->service->registrar($input);
 ResponseHelper::success($resultado, 'Usuario registrado exitosamente');
 }

 public function logout(): void
    {
        $user = AuthMiddleware::user();
        $this->service->logout($user['id']);
        ResponseHelper::success(null, 'Sesion cerrada');
    }

	public function recuperar(): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);

		$v = new ValidatorHelper();
		if (!$v->validate($input, ['email' => 'required|email'])) {
			ResponseHelper::error('Correo invalido', 422);
		}

		$codigo = $this->service->recuperarPassword($input['email']);
		ResponseHelper::success(['codigo' => $codigo], 'Se envió un código de recuperación a su correo');
	}

	public function verificarCodigo(): void
	{
		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$input = SanitizerHelper::sanitizeArray($input);

		$v = new ValidatorHelper();
		if (!$v->validate($input, ['codigo' => 'required'])) {
			ResponseHelper::error('Código requerido', 422);
		}

		$resultado = $this->service->verificarCodigo($input['codigo']);
		ResponseHelper::success($resultado, 'Código verificado correctamente');
	}

    public function resetPassword(string $token): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);

        $v = new ValidatorHelper();
        if (!$v->validate($input, ['password' => 'required|min:8'])) {
            ResponseHelper::error('Contrasena invalida: minimo 8 caracteres', 422);
        }

        $this->service->resetPassword($token, $input['password']);
        ResponseHelper::success(null, 'Contrasena actualizada');
    }

    public function perfil(): void
    {
        $user = AuthMiddleware::user();
        $resultado = $this->service->obtenerPerfil($user['id']);
        ResponseHelper::success($resultado);
    }

    public function actualizarPerfil(): void
    {
        $user = AuthMiddleware::user();
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $this->service->actualizarPerfil($user['id'], $input);
        ResponseHelper::success(null, 'Perfil actualizado');
    }

 public function cambiarPassword(): void
 {
 $user = AuthMiddleware::user();
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);

 $v = new ValidatorHelper();
 if (!$v->validate($input, ['password_actual' => 'required', 'password_nueva' => 'required|min:8'])) {
 ResponseHelper::error('Datos invalidos', 422);
 }

 $this->service->cambiarPassword($user['id'], $input['password_actual'], $input['password_nueva']);
 ResponseHelper::success(null, 'Contrasena actualizada');
 }

 public function refreshToken(): void
 {
 $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
 if (!preg_match('/^Bearer\s+(.+)$/', $header, $matches)) {
 ResponseHelper::error('Token requerido', 401);
 }

 $resultado = $this->service->refreshToken($matches[1]);
 ResponseHelper::success($resultado, 'Token renovado');
 }

 public function csrfToken(): void
 {
 $token = \App\Helper\CsrfHelper::generar();
 ResponseHelper::success(['csrf_token' => $token]);
 }

 public function cambiarRol(): void
 {
 $user = AuthMiddleware::user();
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);

 $v = new ValidatorHelper();
 if (!$v->validate($input, ['rol_codigo' => 'required'])) {
 ResponseHelper::error('Debe especificar rol_codigo', 422);
 }

 $resultado = $this->service->cambiarRolActivo($user['id'], $input['rol_codigo']);
 ResponseHelper::success($resultado, 'Rol activo actualizado');
 }
}
