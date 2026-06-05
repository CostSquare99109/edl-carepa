<?php

namespace App\Controller;

use App\Service\UsuarioService;
use App\Service\AuthService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;

class UsuarioController
{
 private UsuarioService $service;
 private AuthService $authService;

 public function __construct()
 {
 $this->service = new UsuarioService();
 $this->authService = new AuthService();
 }

 public function listar(): void
 {
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $pagina = (int) ($_GET['pagina'] ?? 1);
 $porPagina = (int) ($_GET['por_pagina'] ?? 20);
 $resultado = $this->service->listar($filtros, $pagina, $porPagina);
 ResponseHelper::success($resultado);
 }

 public function crear(): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $id = $this->service->crear($input);
 ResponseHelper::success(['id' => $id], 'Usuario creado', 201);
 }

 public function ver(int $id): void
 {
 $usuario = $this->service->ver($id);
 ResponseHelper::success($usuario);
 }

 public function actualizar(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);
 $this->service->actualizar($id, $input);
 ResponseHelper::success(null, 'Usuario actualizado');
 }

 public function eliminar(int $id): void
 {
 $this->service->eliminar($id);
 ResponseHelper::success(null, 'Usuario eliminado');
 }

 public function restablecerPassword(int $id): void
 {
 $tempPassword = $this->authService->restablecerPassword($id);
 ResponseHelper::success(['password_temporal' => $tempPassword], 'Contrasena restablecida');
 }

 public function asignarRoles(int $id): void
 {
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);

 if (empty($input['roles']) || !is_array($input['roles'])) {
 ResponseHelper::error('El campo roles es requerido y debe ser un arreglo', 422);
 }

 $this->service->asignarRoles($id, $input['roles'], $input['entidad_id'] ?? null);
 ResponseHelper::success(null, 'Roles asignados');
 }
}
