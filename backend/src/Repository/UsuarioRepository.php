<?php

namespace App\Repository;

use PDO;

class UsuarioRepository extends BaseRepository
{
 protected string $table = 'usuarios';

 protected array $allowedFilterFields = [
  'documento', 'tipo_documento', 'genero',
  'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
  'email', 'telefono1', 'telefono2', 'password_hash',
  'estado', 'entidad_id', 'dependencia_id',
  'es_contratista', 'nivel', 'naturaleza', 'tipo_nombramiento',
  'denominacion_empleo', 'codigo_empleo', 'grado_empleo',
  'es_evaluador_y_evaluado', 'dependencia_evaluacion_id',
  'en_periodo_prueba', 'fecha_posesion', 'proposito_principal_empleo',
  'evaluacion_inicio_febrero', 'debe_cambiar_password',
  'fecha_inicio_evaluacion', 'motivo_fecha_inicio_diferente',
 ];

 public function buscarPorDocumento(string $documento): ?array
 {
 $stmt = $this->pdo->prepare("SELECT * FROM usuarios WHERE documento = ? AND eliminado_en IS NULL");
 $stmt->execute([$documento]);
 return $stmt->fetch() ?: null;
 }

 public function buscarPorEmail(string $email): ?array
 {
 $stmt = $this->pdo->prepare("SELECT * FROM usuarios WHERE email = ? AND eliminado_en IS NULL");
 $stmt->execute([$email]);
 return $stmt->fetch() ?: null;
 }

 public function actualizarUltimoAcceso(int $id): void
 {
  $stmt = $this->pdo->prepare("UPDATE usuarios SET ultimo_acceso = NOW(), intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?");
 $stmt->execute([$id]);
 }

 public function incrementarIntentosFallidos(int $id): void
 {
 $stmt = $this->pdo->prepare("UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = ?");
 $stmt->execute([$id]);
 }

 public function bloquearSiExcedeIntentos(int $id, int $maxIntentos): bool
 {
  $stmt = $this->pdo->prepare("SELECT intentos_fallidos FROM usuarios WHERE id = ?");
  $stmt->execute([$id]);
  $intentos = (int) $stmt->fetchColumn();

  if ($intentos >= $maxIntentos) {
  $stmt = $this->pdo->prepare("UPDATE usuarios SET bloqueado_hasta = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?");
  $stmt->execute([$id]);
  return true;
  }
  return false;
 }

 public function verificarBloqueoTemporal(int $id): ?string
 {
  $stmt = $this->pdo->prepare("SELECT bloqueado_hasta FROM usuarios WHERE id = ? AND bloqueado_hasta IS NOT NULL AND bloqueado_hasta > NOW()");
  $stmt->execute([$id]);
  $bloqueadoHasta = $stmt->fetchColumn();
  if ($bloqueadoHasta) {
   $restante = strtotime($bloqueadoHasta) - time();
   if ($restante > 0) {
    return $bloqueadoHasta;
   }
  }
  return null;
 }

 public function restablecerPassword(int $id, string $hash): void
 {
  $stmt = $this->pdo->prepare("UPDATE usuarios SET password_hash = ?, estado = 'activo', intentos_fallidos = 0, bloqueado_hasta = NULL, debe_cambiar_password = 1 WHERE id = ?");
 $stmt->execute([$hash, $id]);
 }

 public function limpiarDebeCambiarPassword(int $id): void
 {
 $stmt = $this->pdo->prepare("UPDATE usuarios SET debe_cambiar_password = 0 WHERE id = ?");
 $stmt->execute([$id]);
 }

 public function obtenerRoles(int $usuarioId): array
 {
 $stmt = $this->pdo->prepare("SELECT r.codigo, r.nombre, ur.entidad_id FROM usuario_rol ur INNER JOIN roles r ON r.id = ur.rol_id WHERE ur.usuario_id = ?");
 $stmt->execute([$usuarioId]);
 return $stmt->fetchAll();
 }

 public function obtenerPermisos(int $usuarioId): array
 {
 $stmt = $this->pdo->prepare("SELECT DISTINCT p.codigo, p.nombre, p.modulo FROM usuario_rol ur INNER JOIN rol_permiso rp ON rp.rol_id = ur.rol_id INNER JOIN permisos p ON p.id = rp.permiso_id WHERE ur.usuario_id = ?");
 $stmt->execute([$usuarioId]);
 return $stmt->fetchAll();
 }

 public function listarConRoles(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 $conditions = ['u.eliminado_en IS NULL'];
 $params = [];

 if (!empty($filtros['busqueda'])) {
  $conditions[] = "(u.primer_nombre LIKE ? OR u.primer_apellido LIKE ? OR u.documento LIKE ? OR u.email LIKE ?)";
 $b = "%{$filtros['busqueda']}%";
 $params = array_merge($params, [$b, $b, $b, $b]);
 }
  if (!empty($filtros['documento'])) {
  $conditions[] = "u.documento = ?";
  $params[] = $filtros['documento'];
  }
  if (!empty($filtros['entidad_id'])) {
 $conditions[] = "u.entidad_id = ?";
 $params[] = $filtros['entidad_id'];
 }
 if (!empty($filtros['dependencia_id'])) {
 $conditions[] = "u.dependencia_id = ?";
 $params[] = $filtros['dependencia_id'];
 }
 if (!empty($filtros['estado'])) {
 $conditions[] = "u.estado = ?";
 $params[] = $filtros['estado'];
 }
 if (!empty($filtros['rol'])) {
 $conditions[] = "EXISTS (SELECT 1 FROM usuario_rol ur2 INNER JOIN roles r2 ON r2.id = ur2.rol_id WHERE ur2.usuario_id = u.id AND r2.codigo = ?)";
 $params[] = $filtros['rol'];
 }

 $where = implode(' AND ', $conditions);

 $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM usuarios u WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
 $stmt = $this->pdo->prepare("SELECT u.*, e.nombre as entidad_nombre, d.nombre as dependencia_nombre FROM usuarios u LEFT JOIN entidades e ON e.id = u.entidad_id LEFT JOIN dependencias d ON d.id = u.dependencia_id WHERE {$where} ORDER BY u.id ASC LIMIT ? OFFSET ?");
 $params[] = $porPagina;
 $params[] = $offset;
 $stmt->execute($params);

 $usuarios = $stmt->fetchAll();
 foreach ($usuarios as &$u) {
 unset($u['password_hash']);
 $u['roles'] = $this->obtenerRoles((int) $u['id']);
  $u['nombre_completo'] = trim(($u['primer_nombre'] ?? '') . ' ' . ($u['segundo_nombre'] ?? '') . ' ' . ($u['primer_apellido'] ?? '') . ' ' . ($u['segundo_apellido'] ?? ''));
 }

 return [
 'data' => $usuarios,
 'total' => $total,
 'pagina' => $pagina,
 'por_pagina' => $porPagina,
 'total_paginas' => ceil($total / $porPagina)
 ];
 }

 public function buscarPorDependenciaYRol(int $dependenciaId, string $rolCodigo): array
 {
  $stmt = $this->pdo->prepare("SELECT u.id, u.documento, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido FROM usuarios u WHERE u.dependencia_id = ? AND u.eliminado_en IS NULL AND u.estado = 'activo' AND EXISTS (SELECT 1 FROM usuario_rol ur INNER JOIN roles r ON r.id = ur.rol_id WHERE ur.usuario_id = u.id AND r.codigo = ?) ORDER BY u.primer_nombre ASC");
  $stmt->execute([$dependenciaId, $rolCodigo]);
  return $stmt->fetchAll();
 }

    public function listarPorRol(string $rolCodigo): array
    {
        $stmt = $this->pdo->prepare("
            SELECT u.id, u.documento, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido, u.email
            FROM usuarios u
            WHERE u.eliminado_en IS NULL AND u.estado = 'activo'
            AND EXISTS (SELECT 1 FROM usuario_rol ur INNER JOIN roles r ON r.id = ur.rol_id WHERE ur.usuario_id = u.id AND r.codigo = ?)
            ORDER BY u.primer_nombre ASC
        ");
        $stmt->execute([$rolCodigo]);
        $data = $stmt->fetchAll();
        return ['data' => $data, 'total' => count($data)];
    }

    public function asignarRol(int $usuarioId, int $rolId, ?int $entidadId = null): void
 {
 $stmt = $this->pdo->prepare("INSERT IGNORE INTO usuario_rol (usuario_id, rol_id, entidad_id) VALUES (?, ?, ?)");
 $stmt->execute([$usuarioId, $rolId, $entidadId]);
 }

 public function removerRoles(int $usuarioId): void
 {
 $stmt = $this->pdo->prepare("DELETE FROM usuario_rol WHERE usuario_id = ?");
 $stmt->execute([$usuarioId]);
 }
}
