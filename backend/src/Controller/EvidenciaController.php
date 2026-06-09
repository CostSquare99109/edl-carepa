<?php

namespace App\Controller;

use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;
use App\Config\Database;

class EvidenciaController
{
 /** Listar evidencias (con filtros) */
 public function listar(): void
 {
 $user = AuthMiddleware::user();
 $filtros = SanitizerHelper::sanitizeArray($_GET);
 $pagina = (int) ($_GET['pagina'] ?? 1);
 $porPagina = (int) ($_GET['por_pagina'] ?? 20);
 $offset = ($pagina - 1) * $porPagina;

 $pdo = Database::getInstance();
 $where = "e.eliminado_en IS NULL";
 $params = [];

 // Filtro por evaluado (si se especifica evaluacion_id, buscar por responsable_id en compromisos)
 if (!empty($filtros['evaluacion_id'])) {
 $where .= " AND e.compromiso_id IN (SELECT id FROM compromisos WHERE evaluacion_id = :eid AND eliminado_en IS NULL)";
 $params['eid'] = (int) $filtros['evaluacion_id'];
 } else {
 // Por defecto, las del usuario autenticado
 $where .= " AND e.subido_por = :uid";
 $params['uid'] = $user['id'];
 }

 if (!empty($filtros['compromiso_id'])) {
 $where .= " AND e.compromiso_id = :compromiso_id";
 $params['compromiso_id'] = (int) $filtros['compromiso_id'];
 }
 if (!empty($filtros['periodo_id'])) {
 $where .= " AND e.periodo_id = :periodo_id";
 $params['periodo_id'] = (int) $filtros['periodo_id'];
 }
 if (!empty($filtros['tipo'])) {
 $where .= " AND e.tipo = :tipo";
 $params['tipo'] = $filtros['tipo'];
 }

 $stmtTotal = $pdo->prepare("SELECT COUNT(*) FROM evidencias e WHERE $where");
 $stmtTotal->execute($params);
 $total = (int) $stmtTotal->fetchColumn();

 $stmt = $pdo->prepare("
 SELECT e.*, c.descripcion AS compromiso_descripcion, c.tipo AS compromiso_tipo, c.peso AS compromiso_peso
 FROM evidencias e
 LEFT JOIN compromisos c ON c.id = e.compromiso_id
 WHERE $where
 ORDER BY e.creado_en DESC
 LIMIT $porPagina OFFSET $offset
 ");
 $stmt->execute($params);
 $evidencias = $stmt->fetchAll(\PDO::FETCH_ASSOC);

 ResponseHelper::success([
 'data' => $evidencias,
 'total' => $total,
 'pagina' => $pagina,
 'por_pagina' => $porPagina,
 'total_paginas' => $total > 0 ? (int) ceil($total / $porPagina) : 0,
 ]);
 }

 /** Ver una evidencia especifica */
 public function ver(int $id): void
 {
 $pdo = Database::getInstance();
 $stmt = $pdo->prepare("
 SELECT e.*, c.descripcion AS compromiso_descripcion, c.tipo AS compromiso_tipo
 FROM evidencias e
 LEFT JOIN compromisos c ON c.id = e.compromiso_id
 WHERE e.id = :id AND e.eliminado_en IS NULL
 ");
 $stmt->execute(['id' => $id]);
 $evidencia = $stmt->fetch(\PDO::FETCH_ASSOC);

 if (!$evidencia) {
 ResponseHelper::error('Evidencia no encontrada', 404);
 }

 ResponseHelper::success($evidencia);
 }

 /** Registrar evidencia (sistema descriptivo - sin archivos) */
 public function registrar(): void
 {
 $user = AuthMiddleware::user();
 $pdo = Database::getInstance();
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);

 $compromisoId = (int) ($input['compromiso_id'] ?? 0);
 $descripcion = trim($input['descripcion'] ?? '');
 $periodoId = (int) ($input['periodo_id'] ?? 0);
 $observacion = trim($input['observacion'] ?? '');
 $tipo = $input['tipo'] ?? 'compromiso';

 if ($compromisoId <= 0) {
 ResponseHelper::error('Debe seleccionar un compromiso o competencia', 400);
 }
 if ($descripcion === '') {
 ResponseHelper::error('La descripción del logro es obligatoria', 400);
 }
 $ubicacion = trim($input['ubicacion'] ?? '');
 if ($ubicacion === '') {
 ResponseHelper::error('La ubicación del soporte es obligatoria', 400);
 }
 if ($periodoId <= 0) {
 ResponseHelper::error('Debe seleccionar el periodo de evaluación', 400);
 }

 // Verificar que el compromiso pertenece al evaluado
 $stmtComp = $pdo->prepare("
 SELECT c.id, c.evaluacion_id, c.tipo, c.descripcion, c.estado, e.evaluador_id
 FROM compromisos c
 JOIN evaluaciones e ON e.id = c.evaluacion_id
 WHERE c.id = :cid AND c.responsable_id = :uid AND c.eliminado_en IS NULL
 ");
 $stmtComp->execute(['cid' => $compromisoId, 'uid' => $user['id']]);
 $compromiso = $stmtComp->fetch(\PDO::FETCH_ASSOC);

 if (!$compromiso) {
 ResponseHelper::error('Compromiso no encontrado o no tiene permiso', 404);
 }

 // Obtener nombre del compromiso/competencia para el campo compromiso_competencia
 $compromisoCompetencia = $compromiso['descripcion'];

 // Insertar evidencia (bitacora descriptiva)
 $stmt = $pdo->prepare("
 INSERT INTO evidencias (compromiso_id, periodo_id, subido_por, registrado_por, descripcion, ubicacion, observacion, compromiso_competencia, tipo, estado, creado_en)
 VALUES (:compromiso_id, :periodo_id, :subido_por, :registrado_por, :descripcion, :ubicacion, :observacion, :compromiso_competencia, :tipo, 'pendiente', NOW())
 ");
 $stmt->execute([
 'compromiso_id' => $compromisoId,
 'periodo_id' => $periodoId,
 'subido_por' => $user['id'],
 'registrado_por' => $user['id'],
 'descripcion' => $descripcion,
 'ubicacion' => $ubicacion ?: null,
 'observacion' => $observacion ?: null,
 'compromiso_competencia' => $compromisoCompetencia,
 'tipo' => $tipo === 'competencia' ? 'competencia' : 'compromiso',
 ]);

 $id = $pdo->lastInsertId();

 ResponseHelper::success(['id' => (int) $id], 'Evidencia registrada correctamente');
 }

 /** Actualizar evidencia (solo el autor) */
 public function actualizar(int $id): void
 {
 $user = AuthMiddleware::user();
 $pdo = Database::getInstance();
 $input = json_decode(file_get_contents('php://input'), true) ?: [];
 $input = SanitizerHelper::sanitizeArray($input);

 // Verificar que es del usuario
 $stmt = $pdo->prepare("SELECT * FROM evidencias WHERE id = :id AND subido_por = :uid AND eliminado_en IS NULL");
 $stmt->execute(['id' => $id, 'uid' => $user['id']]);
 $evidencia = $stmt->fetch(\PDO::FETCH_ASSOC);

 if (!$evidencia) {
 ResponseHelper::error('Evidencia no encontrada o no tiene permiso', 404);
 }

 $sets = [];
 $params = ['id' => $id];

 if (isset($input['descripcion'])) {
 $val = trim($input['descripcion']);
 if ($val === '') ResponseHelper::error('La descripción es obligatoria', 400);
 $sets[] = "descripcion = :descripcion";
 $params['descripcion'] = $val;
 }
 if (array_key_exists('ubicacion', $input)) {
 $sets[] = "ubicacion = :ubicacion";
 $params['ubicacion'] = trim($input['ubicacion']) ?: null;
 }
 if (array_key_exists('observacion', $input)) {
 $sets[] = "observacion = :observacion";
 $params['observacion'] = trim($input['observacion']) ?: null;
 }
 if (!empty($input['compromiso_id'])) {
 $compId = (int) $input['compromiso_id'];
 $stmtComp = $pdo->prepare("SELECT id FROM compromisos WHERE id = :cid AND responsable_id = :uid AND eliminado_en IS NULL");
 $stmtComp->execute(['cid' => $compId, 'uid' => $user['id']]);
 if (!$stmtComp->fetchColumn()) {
 ResponseHelper::error('Compromiso no válido', 400);
 }
 $sets[] = "compromiso_id = :compromiso_id";
 $params['compromiso_id'] = $compId;
 }
 if (!empty($input['periodo_id'])) {
 $sets[] = "periodo_id = :periodo_id";
 $params['periodo_id'] = (int) $input['periodo_id'];
 }

 if (empty($sets)) {
 ResponseHelper::error('No hay datos para actualizar', 400);
 }

 $sets[] = "actualizado_en = NOW()";
 $sql = "UPDATE evidencias SET " . implode(', ', $sets) . " WHERE id = :id";
 $stmtUp = $pdo->prepare($sql);
 $stmtUp->execute($params);

 ResponseHelper::success(['id' => $id], 'Evidencia actualizada correctamente');
 }

 }
