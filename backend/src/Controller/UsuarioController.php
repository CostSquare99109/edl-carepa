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

 /**
 * Búsqueda global para el header (autocompletado).
 * GET /usuarios/buscar-global?q=<texto>&por_pagina=<n>
 * Devuelve lista compacta con id, label (nombre completo) y sublabel (documento | dependencia).
 */
 public function buscarGlobal(): void
 {
 $q = trim((string) ($_GET['q'] ?? ''));
 $porPagina = min(50, max(1, (int) ($_GET['por_pagina'] ?? 8)));
 if (mb_strlen($q) < 2) {
 ResponseHelper::success(['data' => []]);
 return;
 }
 $pdo = \App\Config\Database::getInstance();
 $like = '%' . $q . '%';
 $sql = "SELECT u.id, u.documento, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido, d.nombre AS dependencia_nombre
 FROM usuarios u
 LEFT JOIN dependencias d ON d.id = u.dependencia_id
 WHERE u.estado = 'activo'
 AND (u.documento LIKE :q1
 OR CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) LIKE :q2)
 ORDER BY u.primer_nombre ASC
 LIMIT {$porPagina}";
 $stmt = $pdo->prepare($sql);
 $stmt->bindValue(':q1', $like);
 $stmt->bindValue(':q2', $like);
 $stmt->execute();
 $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
 $data = array_map(function ($r) {
 $nombre = trim(implode(' ', array_filter([$r['primer_nombre'] ?? '', $r['segundo_nombre'] ?? '', $r['primer_apellido'] ?? '', $r['segundo_apellido'] ?? ''])));
 return [
 'id' => (int) $r['id'],
 'label' => $nombre,
 'sublabel' => trim(($r['documento'] ?? '') . (isset($r['dependencia_nombre']) && $r['dependencia_nombre'] ? ' · ' . $r['dependencia_nombre'] : '')),
 'ruta' => '/admin/usuarios',
 ];
 }, $rows);
 ResponseHelper::success(['data' => $data]);
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

   public function evaluadoresPorDependencia(): void
   {
    $dependenciaId = \App\Middleware\AuthMiddleware::user()['dependencia_id'] ?? null;
    if (!$dependenciaId) {
     ResponseHelper::success([]);
     return;
    }
    $usuarios = $this->service->listarPorDependenciaYRol((int) $dependenciaId, 'evaluador');
    ResponseHelper::success($usuarios);
   }

   public function evaluadoresBuscar(): void
   {
    $user = \App\Middleware\AuthMiddleware::user();
    $dependenciaId = $user['dependencia_id'] ?? null;
    if (!$dependenciaId) {
     ResponseHelper::success(['data' => []]);
     return;
    }
    $q = trim((string) ($_GET['q'] ?? ''));
    $porPagina = min(50, max(1, (int) ($_GET['por_pagina'] ?? 20)));
    $pdo = \App\Config\Database::getInstance();
    $params = [$dependenciaId];
    $like = '%' . $q . '%';
    $sql = "SELECT u.id, u.documento, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido
            FROM usuarios u
            WHERE u.dependencia_id = ?
            AND u.estado = 'activo'
            AND EXISTS (SELECT 1 FROM usuario_rol ur INNER JOIN roles r ON r.id = ur.rol_id WHERE ur.usuario_id = u.id AND r.codigo = 'evaluador')";
    if (mb_strlen($q) >= 2) {
     $sql .= " AND (u.documento LIKE ? OR CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) LIKE ?)";
     $params[] = $like;
     $params[] = $like;
    }
    $sql .= " ORDER BY u.primer_nombre ASC LIMIT {$porPagina}";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    $data = array_map(function ($r) {
     $nombre = trim(implode(' ', array_filter([$r['primer_nombre'] ?? '', $r['segundo_nombre'] ?? '', $r['primer_apellido'] ?? '', $r['segundo_apellido'] ?? ''])));
     return [
      'id' => (int) $r['id'],
      'documento' => $r['documento'],
      'primer_nombre' => $r['primer_nombre'],
      'primer_apellido' => $r['primer_apellido'],
      'label' => $nombre . ' — ' . $r['documento'],
     ];
    }, $rows);
    ResponseHelper::success(['data' => $data]);
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
