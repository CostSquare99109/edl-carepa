<?php

namespace App\Service;

use App\Config\Database;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;
use App\Config\Env;

class ReporteService
{
 public function concertacion(array $filtros): array
 {
 $pdo = Database::getInstance();
 $conditions = ['c.eliminado_en IS NULL'];
 $params = [];

 if (!empty($filtros['periodo_id'])) {
 $conditions[] = "c.meta_id IN (SELECT m.id FROM metas m WHERE m.periodo_id = ?)";
 $params[] = $filtros['periodo_id'];
 }
 if (!empty($filtros['entidad_id'])) { $conditions[] = "u.entidad_id = ?"; $params[] = $filtros['entidad_id']; }
 if (!empty($filtros['estado'])) { $conditions[] = "c.estado = ?"; $params[] = $filtros['estado']; }

 $where = implode(' AND ', $conditions);
 $stmt = $pdo->prepare("SELECT c.estado, COUNT(*) as total FROM concertaciones c INNER JOIN usuarios u ON u.id = c.funcionario_id WHERE {$where} GROUP BY c.estado");
 $stmt->execute($params);
 return $stmt->fetchAll();
 }

 public function evaluaciones(array $filtros): array
 {
 $pdo = Database::getInstance();
 $conditions = ['ev.eliminado_en IS NULL'];
 $params = [];

 if (!empty($filtros['periodo_id'])) { $conditions[] = "ev.periodo_id = ?"; $params[] = $filtros['periodo_id']; }
 if (!empty($filtros['tipo'])) { $conditions[] = "ev.tipo = ?"; $params[] = $filtros['tipo']; }
 if (!empty($filtros['estado'])) { $conditions[] = "ev.estado = ?"; $params[] = $filtros['estado']; }

 $where = implode(' AND ', $conditions);
 $stmt = $pdo->prepare("SELECT ev.tipo, ev.estado, COUNT(*) as total, AVG(ev.calificacion_definitiva) as promedio FROM evaluaciones ev WHERE {$where} GROUP BY ev.tipo, ev.estado");
 $stmt->execute($params);
 return $stmt->fetchAll();
 }

 public function funcionario(int $funcionarioId): array
 {
 $pdo = Database::getInstance();
 $stmt = $pdo->prepare("SELECT id, nombres, apellidos, documento, cargo, estado FROM usuarios WHERE id = ? AND eliminado_en IS NULL");
 $stmt->execute([$funcionarioId]);
 $funcionario = $stmt->fetch();
 if (!$funcionario) {
 ResponseHelper::error('Funcionario no encontrado', 404);
 }

 $stmt = $pdo->prepare("SELECT COUNT(*) as total, AVG(calificacion_definitiva) as promedio FROM evaluaciones WHERE evaluado_id = ? AND eliminado_en IS NULL");
 $stmt->execute([$funcionarioId]);
 $evalStats = $stmt->fetch();

 $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM metas WHERE funcionario_id = ? AND eliminado_en IS NULL");
 $stmt->execute([$funcionarioId]);
 $metaStats = $stmt->fetch();

 $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM compromisos WHERE evaluacion_id IN (SELECT id FROM evaluaciones WHERE evaluado_id = ?) AND eliminado_en IS NULL");
 $stmt->execute([$funcionarioId]);
 $compStats = $stmt->fetch();

 return [
 'funcionario' => $funcionario,
 'evaluaciones' => $evalStats,
 'metas' => $metaStats,
 'compromisos' => $compStats
 ];
 }

 public function resumenGeneral(int $periodoId): array
 {
 $pdo = Database::getInstance();

 $stmt = $pdo->prepare("
 SELECT
 (SELECT COUNT(*) FROM usuarios WHERE eliminado_en IS NULL AND estado = 'activo') as total_funcionarios,
 (SELECT COUNT(*) FROM concertaciones WHERE meta_id IN (SELECT m.id FROM metas m WHERE m.periodo_id = ?) AND eliminado_en IS NULL) as total_concertaciones,
 (SELECT COUNT(*) FROM evaluaciones WHERE periodo_id = ? AND eliminado_en IS NULL) as total_evaluaciones,
 (SELECT COUNT(DISTINCT evaluado_id) FROM evaluaciones WHERE periodo_id = ? AND eliminado_en IS NULL AND estado = 'calificada') as evaluados_calificados
 ");
 $stmt->execute([$periodoId, $periodoId, $periodoId]);
 $general = $stmt->fetch();

 $stmt = $pdo->prepare("
 SELECT e.estado, COUNT(*) as total
 FROM evaluaciones e
 WHERE e.periodo_id = ? AND e.eliminado_en IS NULL
 GROUP BY e.estado
 ");
 $stmt->execute([$periodoId]);
 $porEstado = $stmt->fetchAll();

 $stmt = $pdo->prepare("
 SELECT
 CASE
 WHEN calificacion_definitiva >= 90 THEN 'sobresaliente'
 WHEN calificacion_definitiva >= 65 THEN 'satisfactorio'
 WHEN calificacion_definitiva > 0 THEN 'no_satisfactorio'
 ELSE 'sin_calificacion'
 END as categoria,
 COUNT(*) as total
 FROM evaluaciones
 WHERE periodo_id = ? AND eliminado_en IS NULL AND calificacion_definitiva IS NOT NULL
 GROUP BY categoria
 ORDER BY FIELD(categoria, 'sobresaliente', 'satisfactorio', 'no_satisfactorio', 'sin_calificacion')
 ");
 $stmt->execute([$periodoId]);
 $porCalificacion = $stmt->fetchAll();

 return [
 'general' => $general,
 'por_estado' => $porEstado,
 'por_calificacion' => $porCalificacion
 ];
 }

 public function reportePorEntidad(int $entidadId, int $periodoId): array
 {
 $pdo = Database::getInstance();

 $stmt = $pdo->prepare("SELECT id, codigo, nombre FROM entidades WHERE id = ? AND eliminado_en IS NULL");
 $stmt->execute([$entidadId]);
 $entidad = $stmt->fetch();
 if (!$entidad) {
 ResponseHelper::error('Entidad no encontrada', 404);
 }

 $stmt = $pdo->prepare("
 SELECT
 COUNT(DISTINCT u.id) as total_funcionarios,
 COUNT(DISTINCT c.id) as total_concertaciones,
 COUNT(DISTINCT ev.id) as total_evaluaciones,
 AVG(ev.calificacion_definitiva) as promedio_calificacion
 FROM usuarios u
 LEFT JOIN concertaciones c ON c.funcionario_id = u.id AND c.meta_id IN (SELECT m.id FROM metas m WHERE m.periodo_id = ?) AND c.eliminado_en IS NULL
 LEFT JOIN evaluaciones ev ON ev.evaluado_id = u.id AND ev.periodo_id = ? AND ev.eliminado_en IS NULL
 WHERE u.entidad_id = ? AND u.eliminado_en IS NULL
 ");
 $stmt->execute([$periodoId, $periodoId, $entidadId]);
 $stats = $stmt->fetch();

 $stmt = $pdo->prepare("
 SELECT
 CASE
 WHEN ev.calificacion_definitiva >= 90 THEN 'sobresaliente'
 WHEN ev.calificacion_definitiva >= 65 THEN 'satisfactorio'
 WHEN ev.calificacion_definitiva > 0 THEN 'no_satisfactorio'
 ELSE 'sin_calificacion'
 END as categoria,
 COUNT(*) as total
 FROM evaluaciones ev
 INNER JOIN usuarios u ON u.id = ev.evaluado_id
 WHERE ev.periodo_id = ? AND u.entidad_id = ? AND ev.eliminado_en IS NULL AND ev.calificacion_definitiva IS NOT NULL
 GROUP BY categoria
 ");
 $stmt->execute([$periodoId, $entidadId]);
 $porCalificacion = $stmt->fetchAll();

 return [
 'entidad' => $entidad,
 'estadisticas' => $stats,
 'por_calificacion' => $porCalificacion
 ];
 }

 public function reportePorDependencia(int $dependenciaId, int $periodoId): array
 {
 $pdo = Database::getInstance();

 $stmt = $pdo->prepare("SELECT id, codigo, nombre FROM dependencias WHERE id = ? AND eliminado_en IS NULL");
 $stmt->execute([$dependenciaId]);
 $dependencia = $stmt->fetch();
 if (!$dependencia) {
 ResponseHelper::error('Dependencia no encontrada', 404);
 }

 $stmt = $pdo->prepare("
 SELECT
 COUNT(DISTINCT u.id) as total_funcionarios,
 COUNT(DISTINCT c.id) as total_concertaciones,
 COUNT(DISTINCT ev.id) as total_evaluaciones,
 AVG(ev.calificacion_definitiva) as promedio_calificacion
 FROM usuarios u
 LEFT JOIN concertaciones c ON c.funcionario_id = u.id AND c.meta_id IN (SELECT m.id FROM metas m WHERE m.periodo_id = ?) AND c.eliminado_en IS NULL
 LEFT JOIN evaluaciones ev ON ev.evaluado_id = u.id AND ev.periodo_id = ? AND ev.eliminado_en IS NULL
 WHERE u.dependencia_id = ? AND u.eliminado_en IS NULL
 ");
 $stmt->execute([$periodoId, $periodoId, $dependenciaId]);
 $stats = $stmt->fetch();

 return [
 'dependencia' => $dependencia,
 'estadisticas' => $stats
 ];
 }

 public function reporteCompromisos(array $filtros): array
 {
 $pdo = Database::getInstance();
 $conditions = ['co.eliminado_en IS NULL'];
 $params = [];

 if (!empty($filtros['periodo_id'])) {
 $conditions[] = "ev.periodo_id = ?";
 $params[] = $filtros['periodo_id'];
 }
 if (!empty($filtros['estado'])) { $conditions[] = "co.estado = ?"; $params[] = $filtros['estado']; }
 if (!empty($filtros['tipo'])) { $conditions[] = "co.tipo = ?"; $params[] = $filtros['tipo']; }

 $where = implode(' AND ', $conditions);
 $stmt = $pdo->prepare("
 SELECT co.estado, co.tipo, COUNT(*) as total,
 AVG(co.calificacion) as promedio_puntaje
 FROM compromisos co
 INNER JOIN evaluaciones ev ON ev.id = co.evaluacion_id
 LEFT JOIN concertaciones c ON c.id = ev.concertacion_id
 WHERE {$where}
 GROUP BY co.estado, co.tipo
 ");
 $stmt->execute($params);
 return $stmt->fetchAll();
 }

 public function generarCSV(string $tipo, array $filtros): string
 {
 $pdo = Database::getInstance();

 switch ($tipo) {
 case 'concertacion':
 $data = $this->concertacion($filtros);
 $headers = ['Estado', 'Total'];
 $callback = function ($row) { return [$row['estado'], $row['total']]; };
 break;
 case 'evaluaciones':
 $data = $this->evaluaciones($filtros);
 $headers = ['Tipo', 'Estado', 'Total', 'Promedio'];
 $callback = function ($row) { return [$row['tipo'], $row['estado'], $row['total'], round($row['promedio'], 2)]; };
 break;
 case 'compromisos':
 $data = $this->reporteCompromisos($filtros);
 $headers = ['Estado', 'Tipo', 'Total', 'Promedio Puntaje'];
 $callback = function ($row) { return [$row['estado'], $row['tipo'], $row['total'], round($row['promedio_puntaje'], 2)]; };
 break;
 case 'resumen':
 $periodoId = (int) ($filtros['periodo_id'] ?? 0);
 if (!$periodoId) { ResponseHelper::error('periodo_id es requerido', 422); }
 $resumen = $this->resumenGeneral($periodoId);
 $data = $resumen['por_calificacion'];
 $headers = ['Categoria', 'Total'];
 $callback = function ($row) { return [$row['categoria'], $row['total']]; };
 break;
 default:
 ResponseHelper::error('Tipo de reporte invalido', 422);
 }

 $output = fopen('php://temp', 'r+');
 fputcsv($output, $headers);
 foreach ($data as $row) {
 fputcsv($output, $callback($row));
 }
 rewind($output);
 $csv = stream_get_contents($output);
 fclose($output);

 return $csv;
 }

 public function datosConcertacionPdf(int $id): array
 {
 $pdo = Database::getInstance();

 $stmt = $pdo->prepare("
 SELECT c.*,
 u.documento as evaluado_documento,
 u.nombres as evaluado_nombres, u.apellidos as evaluado_apellidos,
 u.cargo as evaluado_cargo,
 d.nombre as evaluado_dependencia,
 e.nombre as entidad_nombre,
 p.nombre as periodo_nombre,
 ev.nombres as evaluador_nombres, ev.apellidos as evaluador_apellidos,
 c.fecha_concertacion, c.estado, c.creado_en
 FROM concertaciones c
 INNER JOIN usuarios u ON u.id = c.funcionario_id
 LEFT JOIN entidades e ON e.id = u.entidad_id
 LEFT JOIN dependencias d ON d.id = u.dependencia_id
 LEFT JOIN metas m ON m.id = c.meta_id
 LEFT JOIN periodos p ON p.id = m.periodo_id
 LEFT JOIN usuarios ev ON ev.id = c.evaluador_id
 WHERE c.id = ? AND c.eliminado_en IS NULL
 ");
 $stmt->execute([$id]);
 $concertacion = $stmt->fetch();
 if (!$concertacion) {
 ResponseHelper::error('Concertacion no encontrada', 404);
 }

 $stmt = $pdo->prepare("
 SELECT co.*, co.descripcion as texto_compromiso, co.peso, co.resultado_esperado as meta
 FROM compromisos co
 WHERE co.evaluacion_id = ? AND co.eliminado_en IS NULL
 ORDER BY co.tipo, co.id
 ");
 $stmt->execute([$id]);
 $compromisos = $stmt->fetchAll();

 return ['concertacion' => $concertacion, 'compromisos' => $compromisos];
 }

 public function datosEvaluacionPdf(int $id): array
 {
 $pdo = Database::getInstance();

 $stmt = $pdo->prepare("
 SELECT ev.*,
 u.documento as evaluado_documento,
 u.nombres as evaluado_nombres, u.apellidos as evaluado_apellidos,
 u.cargo as evaluado_cargo,
 p.nombre as periodo_nombre
 FROM evaluaciones ev
 INNER JOIN usuarios u ON u.id = ev.evaluado_id
 LEFT JOIN periodos p ON p.id = ev.periodo_id
 WHERE ev.id = ? AND ev.eliminado_en IS NULL
 ");
 $stmt->execute([$id]);
 $evaluacion = $stmt->fetch();
 if (!$evaluacion) {
 ResponseHelper::error('Evaluacion no encontrada', 404);
 }

 $stmt = $pdo->prepare("
 SELECT cd.nombre, cd.tipo, cd.peso, cd.calificacion, cd.puntaje
 FROM calificaciones_detalle cd
 WHERE cd.evaluacion_id = ?
 ORDER BY cd.tipo, cd.id
 ");
 $stmt->execute([$id]);
 $detalles = $stmt->fetchAll();

 if (empty($detalles)) {
 $stmt = $pdo->prepare("
 SELECT co.descripcion as nombre, co.tipo, co.peso,
 co.calificacion, co.calificacion as puntaje
 FROM compromisos co
 WHERE co.evaluacion_id = ? AND co.eliminado_en IS NULL
 ");
 $stmt->execute([$id]);
 $detalles = $stmt->fetchAll();
 }

 return ['evaluacion' => $evaluacion, 'detalles' => $detalles];
 }
}
