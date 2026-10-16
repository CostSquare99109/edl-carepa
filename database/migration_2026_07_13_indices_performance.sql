-- ============================================================================
-- Migración: Índices de performance para listados y filtros principales
-- Fecha: 2026-07-13
-- Impacto esperado: 10-50x más rápido en listados con WHERE + ORDER BY
--
-- Notas:
--   * Todas las tablas usan soft-delete (`eliminado_en` IS NULL). Incluimos
--     `eliminado_en` en los índices compuestos para que el filtro se evalúe
--     sin tocar la tabla.
--   * Idempotente: usa ADD INDEX IF NOT EXISTS (MariaDB 10.0.2+).
--   * Nombres de columnas verificados contra `information_schema.COLUMNS`
--     en edl_carepa_test antes de aplicar.
-- ============================================================================

-- ----- evaluaciones: tabla más caliente (listados + dashboard) -------------
ALTER TABLE evaluaciones
  ADD INDEX IF NOT EXISTS idx_eval_periodo_estado     (periodo_id, estado, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_eval_evaluado_periodo   (evaluado_id, periodo_id, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_eval_evaluador_periodo  (evaluador_id, periodo_id, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_eval_tipo_estado        (tipo, estado, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_eval_nivel              (nivel_resultado, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_eval_creado_en          (creado_en);

-- ----- compromisos: FK-heavy + UNION ALL de Paquetes 1 y 2 -----------------
ALTER TABLE compromisos
  ADD INDEX IF NOT EXISTS idx_comp_concertacion_tipo  (concertacion_id, tipo, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_comp_estado             (estado, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_comp_competencia        (competencia_codigo, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_comp_meta               (meta_id, eliminado_en);

-- ----- concertaciones -------------------------------------------------------
ALTER TABLE concertaciones
  ADD INDEX IF NOT EXISTS idx_conc_evaluado_periodo   (evaluado_id, periodo_id, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_conc_evaluador          (evaluador_id, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_conc_periodo_estado     (periodo_id, estado, eliminado_en);

-- ----- evidencias: NO tiene evaluacion_id, se indexa por compromiso_id -----
ALTER TABLE evidencias
  ADD INDEX IF NOT EXISTS idx_evid_compromiso         (compromiso_id, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_evid_registrado_fecha   (registrado_por, creado_en);

-- ----- metas: usa funcionario_id (no usuario_id) ---------------------------
ALTER TABLE metas
  ADD INDEX IF NOT EXISTS idx_meta_periodo_funcionario (periodo_id, funcionario_id, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_meta_periodo_estado      (periodo_id, estado, eliminado_en);

-- ----- usuarios ------------------------------------------------------------
ALTER TABLE usuarios
  ADD INDEX IF NOT EXISTS idx_usuario_dependencia     (dependencia_id, eliminado_en),
  ADD INDEX IF NOT EXISTS idx_usuario_nombre          (primer_apellido, primer_nombre);

-- ----- dependencias ---------------------------------------------------------
ALTER TABLE dependencias
  ADD INDEX IF NOT EXISTS idx_dep_entidad             (entidad_id, eliminado_en);

-- ----- periodos -------------------------------------------------------------
ALTER TABLE periodos
  ADD INDEX IF NOT EXISTS idx_periodo_estado_activo   (estado, fecha_inicio);

-- ----- notificaciones: usa `leida` (tinyint), no `leida_en` ----------------
ALTER TABLE notificaciones
  ADD INDEX IF NOT EXISTS idx_notif_usuario_leida     (usuario_id, leida, creado_en);

-- ----- sesiones (login / refresh token): columnas reales --------------------
ALTER TABLE sesiones
  ADD INDEX IF NOT EXISTS idx_sesion_usuario_activa   (usuario_id, revocada, fecha_expiracion);

-- ----- recuperaciones: usa `utilizado` (no `usado_en`) --------------------
ALTER TABLE recuperaciones
  ADD INDEX IF NOT EXISTS idx_recuperaciones_usuario  (usuario_id, utilizado);

-- ----- ausentismos: usa funcionario_id + motivo (no tiene columna `tipo`) ----
ALTER TABLE ausentismos
  ADD INDEX IF NOT EXISTS idx_ausen_funcionario_motivo (funcionario_id, motivo, fecha_inicio);

-- ----- movilidades: tabla real es `movilidades` (plural) ------------------
ALTER TABLE movilidades
  ADD INDEX IF NOT EXISTS idx_mov_funcionario_fecha   (funcionario_id, fecha_movimiento),
  ADD INDEX IF NOT EXISTS idx_mov_estado_fecha        (estado, fecha_movimiento);

-- ----- solicitudes_cambio_evaluador (no `solicitudes_cambio`) ------------
ALTER TABLE solicitudes_cambio_evaluador
  ADD INDEX IF NOT EXISTS idx_sce_evaluado_estado     (evaluado_id, estado, creado_en),
  ADD INDEX IF NOT EXISTS idx_sce_evaluador_actual    (evaluador_actual_id, estado);
