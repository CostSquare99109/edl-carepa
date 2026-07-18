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
   $conditions[] = "c.periodo_id = ?";
   $params[] = $filtros['periodo_id'];
  }
 if (!empty($filtros['entidad_id'])) { $conditions[] = "u.entidad_id = ?"; $params[] = $filtros['entidad_id']; }
 if (!empty($filtros['estado'])) { $conditions[] = "c.estado = ?"; $params[] = $filtros['estado']; }

 $where = implode(' AND ', $conditions);
 $stmt = $pdo->prepare("SELECT c.estado, COUNT(*) as total FROM concertaciones c INNER JOIN usuarios u ON u.id = c.evaluado_id WHERE {$where} GROUP BY c.estado");
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
 $stmt = $pdo->prepare("SELECT id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, documento, denominacion_empleo, estado FROM usuarios WHERE id = ? AND eliminado_en IS NULL");
 $stmt->execute([$funcionarioId]);
 $funcionario = $stmt->fetch();
 if (!$funcionario) {
 ResponseHelper::error('Funcionario no encontrado', 404);
 }

 $stmt = $pdo->prepare("SELECT COUNT(*) as total, AVG(calificacion_definitiva) as promedio FROM evaluaciones WHERE evaluado_id = ? AND eliminado_en IS NULL");
 $stmt->execute([$funcionarioId]);
 $evalStats = $stmt->fetch();

 $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM metas WHERE dependencia_id = (SELECT dependencia_id FROM usuarios WHERE id = ?) AND eliminado_en IS NULL");
 $stmt->execute([$funcionarioId]);
 $metaStats = $stmt->fetch();

 $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM compromisos WHERE concertacion_id IN (SELECT concertacion_id FROM evaluaciones WHERE evaluado_id = ? AND eliminado_en IS NULL) AND eliminado_en IS NULL");
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
  (SELECT COUNT(*) FROM concertaciones WHERE periodo_id = ? AND eliminado_en IS NULL) as total_concertaciones,
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
	LEFT JOIN concertaciones c ON c.evaluado_id = u.id AND c.periodo_id = ? AND c.eliminado_en IS NULL
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
	LEFT JOIN concertaciones c ON c.evaluado_id = u.id AND c.periodo_id = ? AND c.eliminado_en IS NULL
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
	INNER JOIN concertaciones c ON c.id = co.concertacion_id
	INNER JOIN evaluaciones ev ON ev.concertacion_id = c.id
	WHERE {$where}
	GROUP BY co.estado, co.tipo
	");
 $stmt->execute($params);
 return $stmt->fetchAll();
 }

  public function concertacionesAprobadas(int $periodoId, string $semestre = 'primer_semestre'): array
   {
   $pdo = Database::getInstance();

   $stmtPeriodo = $pdo->prepare("SELECT fecha_inicio, fecha_fin FROM periodos WHERE id = ?");
   $stmtPeriodo->execute([$periodoId]);
   $periodo = $stmtPeriodo->fetch();
   if (!$periodo) {
   ResponseHelper::error('Periodo no encontrado', 404);
   }
   $fechaInicio = $periodo['fecha_inicio'];
   $fechaFin = $periodo['fecha_fin'];
   $puntoMedio = date('Y-m-d', strtotime($fechaInicio . ' +6 months'));

   if ($semestre === 'primer_semestre') {
   $rangoInicio = $fechaInicio;
   $rangoFin = $puntoMedio;
   } else {
   $rangoInicio = $puntoMedio;
   $rangoFin = $fechaFin;
   }

   $stmt = $pdo->prepare("
   SELECT
   p.nombre as periodo,
   ev.documento as evaluado_documento,
   TRIM(CONCAT_WS(' ', ev.primer_nombre, ev.segundo_nombre, ev.primer_apellido, ev.segundo_apellido)) as evaluado_nombre,
   ev.email as evaluado_email,
   (SELECT SUM(CASE WHEN co.tipo = 'funcional' THEN 1 ELSE 0 END) FROM compromisos co WHERE co.concertacion_id IN (SELECT id FROM concertaciones WHERE evaluado_id = c.evaluado_id AND periodo_id = c.periodo_id AND estado = 'aprobada_evaluado' AND eliminado_en IS NULL AND actualizado_en >= ? AND actualizado_en <= ?) AND co.eliminado_en IS NULL) as compromisos_funcionales,
   (SELECT COALESCE(SUM(CASE WHEN co2.tipo = 'comportamental' THEN co2.peso ELSE 0 END), 0) FROM compromisos co2 WHERE co2.concertacion_id IN (SELECT id FROM concertaciones WHERE evaluado_id = c.evaluado_id AND periodo_id = c.periodo_id AND estado = 'aprobada_evaluado' AND eliminado_en IS NULL AND actualizado_en >= ? AND actualizado_en <= ?) AND co2.eliminado_en IS NULL) as peso_comportamentales,
   (SELECT GROUP_CONCAT(DISTINCT m.descripcion SEPARATOR '; ') FROM compromisos co3 INNER JOIN metas m ON m.id = co3.meta_id WHERE co3.concertacion_id IN (SELECT id FROM concertaciones WHERE evaluado_id = c.evaluado_id AND periodo_id = c.periodo_id AND estado = 'aprobada_evaluado' AND eliminado_en IS NULL AND actualizado_en >= ? AND actualizado_en <= ?) AND co3.meta_id IS NOT NULL AND co3.eliminado_en IS NULL) as metas_institucionales,
   MIN(er.documento) as evaluador_documento,
   MIN(TRIM(CONCAT_WS(' ', er.primer_nombre, er.segundo_nombre, er.primer_apellido))) as evaluador_nombre,
   'Sin comision' as comision_evaluadora,
   ev.denominacion_empleo as cargo,
   MIN(c.creado_en) as fecha_creacion,
   MAX(c.actualizado_en) as fecha_aprobacion
   FROM concertaciones c
   INNER JOIN periodos p ON p.id = c.periodo_id
   INNER JOIN usuarios ev ON ev.id = c.evaluado_id AND ev.eliminado_en IS NULL
   INNER JOIN usuarios er ON er.id = c.evaluador_id AND er.eliminado_en IS NULL
   WHERE c.periodo_id = ?
   AND c.estado = 'aprobada_evaluado'
   AND c.eliminado_en IS NULL
   AND c.actualizado_en >= ?
   AND c.actualizado_en <= ?
   GROUP BY c.evaluado_id, c.periodo_id, p.nombre, ev.documento, ev.primer_nombre, ev.segundo_nombre, ev.primer_apellido, ev.segundo_apellido, ev.email, ev.denominacion_empleo
   ORDER BY MAX(c.actualizado_en) DESC
   ");
   $stmt->execute([$rangoInicio, $rangoFin, $rangoInicio, $rangoFin, $rangoInicio, $rangoFin, $periodoId, $rangoInicio, $rangoFin]);
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
  case 'concertaciones-aprobadas':
  $periodoId = (int) ($filtros['periodo_id'] ?? 0);
  if (!$periodoId) { ResponseHelper::error('periodo_id es requerido', 422); }
  $data = $this->concertacionesAprobadas($periodoId);
  $headers = ['Periodo', 'Documento evaluado', 'Compromisos funcionales', 'Peso comportamental %', 'Metas institucionales', 'Documento evaluador', 'Nombre evaluador', 'Comision evaluadora', 'Cargo', 'Fecha creacion', 'Fecha aprobacion'];
  $callback = function ($row) {
  return [
  $row['periodo'], $row['evaluado_documento'], $row['compromisos_funcionales'],
  $row['peso_comportamentales'], $row['metas_institucionales'],
  $row['evaluador_documento'], $row['evaluador_nombre'],
  $row['comision_evaluadora'], $row['cargo'],
  $row['fecha_creacion'], $row['fecha_aprobacion']
  ];
  };
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
  	u.tipo_documento as evaluado_tipo_documento,
  	u.documento as evaluado_documento,
  	u.primer_nombre as evaluado_nombres, u.segundo_nombre as evaluado_segundo_nombre,
  	u.primer_apellido as evaluado_apellidos, u.segundo_apellido as evaluado_segundo_apellido,
  	u.denominacion_empleo as evaluado_cargo,
  	u.codigo_empleo as evaluado_codigo,
  	u.grado_empleo as evaluado_grado,
  	u.nivel as evaluado_nivel,
  	u.proposito_principal_empleo as evaluado_proposito,
  	u.dependencia_id as evaluado_dependencia_id,
  	d.nombre as evaluado_dependencia,
  	e.nombre as entidad_nombre,
  	p.nombre as periodo_nombre, p.fecha_inicio as periodo_fecha_inicio, p.fecha_fin as periodo_fecha_fin,
  	ev.tipo_documento as evaluador_tipo_documento,
  	ev.primer_nombre as evaluador_nombres, ev.segundo_nombre as evaluador_segundo_nombre,
  	ev.primer_apellido as evaluador_apellidos, ev.segundo_apellido as evaluador_segundo_apellido,
  	ev.denominacion_empleo as evaluador_cargo,
  	ev.codigo_empleo as evaluador_codigo,
  	ev.grado_empleo as evaluador_grado,
  	ev.nivel as evaluador_nivel,
  	ev.proposito_principal_empleo as evaluador_proposito,
  	ev.documento as evaluador_documento,
  	dep_ev.nombre as evaluador_dependencia,
  	ce.tipo_documento as comision_tipo_documento,
  	ce.primer_nombre as comision_nombres, ce.segundo_nombre as comision_segundo_nombre,
  	ce.primer_apellido as comision_apellidos, ce.segundo_apellido as comision_segundo_apellido,
  	ce.denominacion_empleo as comision_cargo,
  	ce.codigo_empleo as comision_codigo,
  	ce.grado_empleo as comision_grado,
  	ce.nivel as comision_nivel,
  	ce.documento as comision_documento,
  	dep_ce.nombre as comision_dependencia,
  	tg.tipo_documento as testigo_tipo_documento,
  	tg.primer_nombre as testigo_nombres, tg.segundo_nombre as testigo_segundo_nombre,
  	tg.primer_apellido as testigo_apellidos, tg.segundo_apellido as testigo_segundo_apellido,
  	tg.documento as testigo_documento,
  	c.fecha_concertacion, c.fecha_testigo, c.estado, c.creado_en,
  	c.motivo_no_jefe, c.motivo_fijacion_unilateral, c.evaluador_no_jefe,
  	c.conformar_comision_evaluadora, c.tipo_concertacion
  	FROM concertaciones c
  	INNER JOIN usuarios u ON u.id = c.evaluado_id
  	LEFT JOIN entidades e ON e.id = u.entidad_id
  	LEFT JOIN dependencias d ON d.id = u.dependencia_id
  	LEFT JOIN periodos p ON p.id = c.periodo_id
  	LEFT JOIN usuarios ev ON ev.id = c.evaluador_id
  	LEFT JOIN dependencias dep_ev ON dep_ev.id = ev.dependencia_id
  	LEFT JOIN usuarios ce ON ce.id = c.comision_evaluador_id
  	LEFT JOIN dependencias dep_ce ON dep_ce.id = ce.dependencia_id
  	LEFT JOIN usuarios tg ON tg.id = c.testigo_id
  	WHERE c.id = ? AND c.eliminado_en IS NULL
  	");
  $stmt->execute([$id]);
  $concertacion = $stmt->fetch();
  if (!$concertacion) {
  ResponseHelper::error('Concertacion no encontrada', 404);
  }

   	// Paquete 1: leer funcionales de `compromisos` (ahora solo contiene tipo='funcional')
   	$stmtFunc = $pdo->prepare("
   	SELECT co.id, 'funcional' AS tipo, co.peso, co.descripcion,
   	NULL AS competencia_codigo, co.estado, co.calificacion,
   	co.propuesto_por_jefe_entidad, co.es_propuesto_evaluado, co.motivo_ajuste, co.fecha_ajuste,
   	co.observaciones_evaluador, co.observaciones_evaluado,
   	NULL AS impacto_aporta_compromisos, NULL AS impacto_excede_estipulado, NULL AS justificacion_excede,
   	NULL AS nivel_comportamental, NULL AS puntaje_comportamental, NULL AS frecuencia,
   	NULL AS conductas_json,
   	m.id AS meta_id, m.descripcion AS meta_descripcion, m.indicador AS meta_indicador
   	FROM compromisos co
   	LEFT JOIN metas m ON m.id = co.meta_id
   	WHERE co.concertacion_id = ? AND co.eliminado_en IS NULL AND co.tipo = 'funcional'
   	ORDER BY co.id
   	");
   	$stmtFunc->execute([$id]);
   	$funcionales = $stmtFunc->fetchAll();

    	// Paquete 2: leer comportamentales de `compromisos` con tipo = 'comportamental'
    	$stmtComp = $pdo->prepare("
    	SELECT cc.id, 'comportamental' AS tipo, cc.peso, cc.descripcion,
    	cc.competencia_codigo, cc.estado, cc.calificacion,
    	cc.propuesto_por_jefe_entidad, cc.es_propuesto_evaluado, NULL AS motivo_ajuste, NULL AS fecha_ajuste,
    	cc.observaciones_evaluador, cc.observaciones_evaluado,
    	cc.impacto_aporta_compromisos, cc.impacto_excede_estipulado, cc.justificacion_excede,
    	cc.nivel_comportamental, cc.puntaje_comportamental, cc.frecuencia,
    	cc.conductas_json,
    	NULL AS meta_id, NULL AS meta_descripcion, NULL AS meta_indicador
    	FROM compromisos cc
    	WHERE cc.concertacion_id = ? AND cc.eliminado_en IS NULL AND cc.tipo = 'comportamental'
    	ORDER BY cc.id
    	");
   	$stmtComp->execute([$id]);
   	$comportamentales = $stmtComp->fetchAll();

  // Combinar manteniendo el orden por tipo (funcionales primero)
  $compromisos = array_merge($funcionales, $comportamentales);

  $codigosCompetencia = [];
  foreach ($compromisos as $c) {
    if (!empty($c['competencia_codigo']) && !in_array($c['competencia_codigo'], $codigosCompetencia, true)) {
      $codigosCompetencia[] = $c['competencia_codigo'];
    }
  }
  $competenciasMeta = [];
  $conductasPorCodigo = [];
  if (!empty($codigosCompetencia)) {
    $placeholders = implode(',', array_fill(0, count($codigosCompetencia), '?'));
    $stmtC = $pdo->prepare("SELECT id, competencia_codigo, texto, orden FROM conductas WHERE competencia_codigo IN ({$placeholders}) AND activo = 1 ORDER BY competencia_codigo, orden");
    $stmtC->execute($codigosCompetencia);
    foreach ($stmtC->fetchAll() as $cond) {
      $conductasPorCodigo[$cond['competencia_codigo']][] = $cond;
    }

    $stmtCompMeta = $pdo->prepare("SELECT codigo, nombre, decreto, descripcion FROM competencias WHERE codigo IN ({$placeholders})");
    $stmtCompMeta->execute($codigosCompetencia);
    foreach ($stmtCompMeta->fetchAll() as $cmp) {
      $competenciasMeta[$cmp['codigo']] = $cmp;
    }
  }

  foreach ($compromisos as &$c) {
    $codigo = $c['competencia_codigo'] ?? null;
    $c['conductas'] = ($codigo && isset($conductasPorCodigo[$codigo])) ? $conductasPorCodigo[$codigo] : [];
    if ($codigo && isset($competenciasMeta[$codigo])) {
      $c['competencia_nombre'] = $competenciasMeta[$codigo]['nombre'];
      $c['competencia_decreto'] = $competenciasMeta[$codigo]['decreto'];
    }
  }
  unset($c);

  return ['concertacion' => $concertacion, 'compromisos' => $compromisos];
  }

public function datosEvaluacionPdf(int $id): array
  {
  $pdo = Database::getInstance();

  	$stmt = $pdo->prepare("
  	SELECT ev.*,
  	u.tipo_documento as evaluado_tipo_documento,
  	u.documento as evaluado_documento,
  	u.primer_nombre as evaluado_nombres, u.primer_apellido as evaluado_apellidos,
  	u.segundo_nombre as evaluado_segundo_nombre, u.segundo_apellido as evaluado_segundo_apellido,
  	u.denominacion_empleo as evaluado_cargo,
  	u.codigo_empleo as evaluado_codigo,
  	u.grado_empleo as evaluado_grado,
  	u.nivel as evaluado_nivel,
  	u.proposito_principal_empleo as evaluado_proposito,
  	u.email as evaluado_email,
  	d.nombre as evaluado_dependencia,
  	e.nombre as entidad_nombre,
  	p.nombre as periodo_nombre, p.fecha_inicio as periodo_fecha_inicio, p.fecha_fin as periodo_fecha_fin,
  	evr.tipo_documento as evaluador_tipo_documento,
  	evr.primer_nombre as evaluador_nombres, evr.segundo_nombre as evaluador_segundo_nombre,
  	evr.primer_apellido as evaluador_apellidos, evr.segundo_apellido as evaluador_segundo_apellido,
  	evr.denominacion_empleo as evaluador_cargo,
  	evr.codigo_empleo as evaluador_codigo,
  	evr.grado_empleo as evaluador_grado,
  	evr.nivel as evaluador_nivel,
  	evr.documento as evaluador_documento,
  	dep_ev.nombre as evaluador_dependencia
  	FROM evaluaciones ev
  	INNER JOIN usuarios u ON u.id = ev.evaluado_id
  	LEFT JOIN periodos p ON p.id = ev.periodo_id
  	LEFT JOIN dependencias d ON d.id = u.dependencia_id
  	LEFT JOIN entidades e ON e.id = u.entidad_id
  	LEFT JOIN usuarios evr ON evr.id = ev.evaluador_id
  	LEFT JOIN dependencias dep_ev ON dep_ev.id = evr.dependencia_id
  	WHERE ev.id = ? AND ev.eliminado_en IS NULL
  	");
  $stmt->execute([$id]);
  $evaluacion = $stmt->fetch();
  if (!$evaluacion) {
  ResponseHelper::error('Evaluacion no encontrada', 404);
  }

   	// Paquete 1: funcionales de `compromisos`
   	$stmtFunc = $pdo->prepare("
   	SELECT co.id, co.descripcion AS nombre, 'funcional' AS tipo, co.peso,
   	co.calificacion, NULL AS frecuencia, NULL AS nivel_comportamental, NULL AS puntaje_comportamental,
   	NULL AS impacto_aporta_compromisos, NULL AS impacto_excede_estipulado, NULL AS justificacion_excede,
   	co.observaciones_evaluador, co.observaciones_evaluado,
   	NULL AS competencia_codigo, NULL AS conductas_json, co.descripcion,
   	co.propuesto_por_jefe_entidad,
   	m.id AS meta_id, m.descripcion AS meta_descripcion, m.indicador AS meta_indicador
   	FROM compromisos co
   	INNER JOIN evaluaciones ev ON ev.concertacion_id = co.concertacion_id
   	LEFT JOIN metas m ON m.id = co.meta_id
   	WHERE ev.id = ? AND co.eliminado_en IS NULL AND co.tipo = 'funcional'
   	ORDER BY co.id
   	");
   	$stmtFunc->execute([$id]);
   	$funcionales = $stmtFunc->fetchAll();

    	// Paquete 2: comportamentales de `compromisos` con tipo = 'comportamental'
    	$stmtComp = $pdo->prepare("
    	SELECT cc.id, cc.descripcion AS nombre, 'comportamental' AS tipo, cc.peso,
    	cc.calificacion, cc.frecuencia, cc.nivel_comportamental, cc.puntaje_comportamental,
    	cc.impacto_aporta_compromisos, cc.impacto_excede_estipulado, cc.justificacion_excede,
    	cc.observaciones_evaluador, cc.observaciones_evaluado,
    	cc.competencia_codigo, cc.conductas_json, cc.descripcion,
    	cc.propuesto_por_jefe_entidad,
    	NULL AS meta_id, NULL AS meta_descripcion, NULL AS meta_indicador
    	FROM compromisos cc
    	INNER JOIN evaluaciones ev ON ev.concertacion_id = cc.concertacion_id
    	WHERE ev.id = ? AND cc.eliminado_en IS NULL AND cc.tipo = 'comportamental'
    	ORDER BY cc.id
    	");
   	$stmtComp->execute([$id]);
   	$comportamentales = $stmtComp->fetchAll();

   	$detalles = array_merge($funcionales, $comportamentales);

  $codigosCompetencia = [];
  foreach ($detalles as $d) {
    if (!empty($d['competencia_codigo']) && !in_array($d['competencia_codigo'], $codigosCompetencia, true)) {
      $codigosCompetencia[] = $d['competencia_codigo'];
    }
  }
  $competenciasMeta = [];
  $conductasPorCodigo = [];
  if (!empty($codigosCompetencia)) {
    $placeholders = implode(',', array_fill(0, count($codigosCompetencia), '?'));
    $stmtC = $pdo->prepare("SELECT id, competencia_codigo, texto, orden FROM conductas WHERE competencia_codigo IN ({$placeholders}) AND activo = 1 ORDER BY competencia_codigo, orden");
    $stmtC->execute($codigosCompetencia);
    foreach ($stmtC->fetchAll() as $cond) {
      $conductasPorCodigo[$cond['competencia_codigo']][] = $cond;
    }

    $stmtCompMeta = $pdo->prepare("SELECT codigo, nombre, decreto, descripcion FROM competencias WHERE codigo IN ({$placeholders})");
    $stmtCompMeta->execute($codigosCompetencia);
    foreach ($stmtCompMeta->fetchAll() as $cmp) {
      $competenciasMeta[$cmp['codigo']] = $cmp;
    }
  }
  foreach ($detalles as &$d) {
    $codigo = $d['competencia_codigo'] ?? null;
    $d['conductas'] = ($codigo && isset($conductasPorCodigo[$codigo])) ? $conductasPorCodigo[$codigo] : [];
    if ($codigo && isset($competenciasMeta[$codigo])) {
      $d['competencia_nombre'] = $competenciasMeta[$codigo]['nombre'];
      $d['competencia_decreto'] = $competenciasMeta[$codigo]['decreto'];
    }
  }
  unset($d);

  return ['evaluacion' => $evaluacion, 'detalles' => $detalles];
  }

  public function generarExcelConcertacionesAprobadas(int $periodoId, string $semestre = 'primer_semestre'): string
   {
   $data = $this->concertacionesAprobadas($periodoId, $semestre);
   $periodoNombre = !empty($data) ? $data[0]['periodo'] : 'Periodo #' . $periodoId;
   $semestreLabel = $semestre === 'primer_semestre' ? 'Primer Semestre' : 'Segundo Semestre';

  $escudo = '';
  $paths = [
  dirname(__DIR__, 2) . '/public/escudo.png',
  dirname(__DIR__, 2) . '/public/escudo.jpg',
  dirname(__DIR__, 2) . '/public/escudo.jpeg',
  ];
  foreach ($paths as $path) {
  if (is_file($path) && is_readable($path)) {
  $imgData = base64_encode((string) file_get_contents($path));
  $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
  $mime = $ext === 'png' ? 'image/png' : ($ext === 'jpg' || $ext === 'jpeg' ? 'image/jpeg' : 'image/png');
  $escudo = '<img src="data:' . $mime . ';base64,' . $imgData . '" width="70" height="70" alt="Escudo Carepa" />';
  break;
  }
  }

  $rows = '';
  foreach ($data as $r) {
  $rows .= '<tr>
  <td>' . htmlspecialchars((string)($r['periodo'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
  <td>' . htmlspecialchars((string)($r['evaluado_documento'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
  <td align="center">' . ((int)($r['compromisos_funcionales'] ?? 0)) . '</td>
  <td align="center">' . htmlspecialchars((string)($r['peso_comportamentales'] ?? '0'), ENT_QUOTES, 'UTF-8') . '</td>
  <td>' . htmlspecialchars((string)($r['metas_institucionales'] ?? '-'), ENT_QUOTES, 'UTF-8') . '</td>
  <td>' . htmlspecialchars((string)($r['evaluador_documento'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
  <td>' . htmlspecialchars((string)($r['evaluador_nombre'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
  <td>' . htmlspecialchars((string)($r['comision_evaluadora'] ?? 'Sin comision'), ENT_QUOTES, 'UTF-8') . '</td>
  <td>' . htmlspecialchars((string)($r['cargo'] ?? '-'), ENT_QUOTES, 'UTF-8') . '</td>
  <td>' . htmlspecialchars(substr((string)($r['fecha_creacion'] ?? ''), 0, 10), ENT_QUOTES, 'UTF-8') . '</td>
  <td>' . htmlspecialchars(substr((string)($r['fecha_aprobacion'] ?? ''), 0, 10), ENT_QUOTES, 'UTF-8') . '</td>
  </tr>';
  }

  $fecha = date('d/m/Y H:i');

  return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
  <meta charset="UTF-8">
  <style>
  body { font-family: Calibri, Arial, sans-serif; margin: 20px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header img { vertical-align: middle; }
  .header h1 { color: #003366; font-size: 18pt; margin: 5px 0; font-weight: bold; }
  .header h2 { color: #003366; font-size: 14pt; margin: 5px 0; }
  .header .subtitle { color: #CE1126; font-size: 11pt; margin: 5px 0; font-weight: bold; }
  table { border-collapse: collapse; width: 100%; font-size: 9pt; }
  th { background-color: #003366; color: #FFFFFF; padding: 6px 4px; border: 1px solid #003366; text-align: center; font-weight: bold; }
  td { padding: 4px; border: 1px solid #999; vertical-align: top; }
  tr:nth-child(even) { background-color: #F2F6FA; }
  .footer { text-align: right; margin-top: 15px; font-size: 8pt; color: #666; border-top: 1px solid #003366; padding-top: 5px; }
  </style>
  </head>
  <body>
  <div class="header">
  ' . $escudo . '
  <h1>ALCALDIA DE CAREPA</h1>
  <h2>Secretaria de Educacion y Cultura</h2>
  <div class="subtitle">REPORTE DE CONCERTACIONES APROBADAS - {$semestreLabel}</div>
  <div style="font-size:10pt;color:#003366;margin-top:5px;">Periodo: {$periodoNombre}</div>
  </div>
  <table>
  <thead>
  <tr>
  <th>Periodo</th>
  <th>Documento evaluado</th>
  <th>Compromisos funcionales</th>
  <th>Peso % comportamental</th>
  <th>Metas institucionales</th>
  <th>Documento evaluador</th>
  <th>Nombre evaluador</th>
  <th>Comision evaluadora</th>
  <th>Cargo</th>
  <th>Fecha creacion</th>
  <th>Fecha aprobacion</th>
  </tr>
  </thead>
  <tbody>
  ' . $rows . '
  </tbody>
  </table>
  <div class="footer">Generado el ' . $fecha . ' - Sistema de Evaluacion del Desempeno Laboral</div>
  </body>
  </html>';
  }
}
