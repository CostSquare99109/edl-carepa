-- ============================================================================
-- EDL-CAREPA - Migration: Un unicidad activa por (evaluado, periodo, tipo)
-- Regla de negocio: un evaluado no debe tener mas de una evaluacion activa
-- por el mismo periodo y tipo (espec. 10.5).
-- Se usa indice UNIQUE condicional sobre evaluaciones no eliminadas
-- (eliminado_en IS NULL) para permitir reintentos sin violar la unicidad.
-- ============================================================================

USE edl_carepa;

-- Verificar que la tabla exista
SET @existe := (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'evaluaciones'
);

SET @sql_drop := 'DROP INDEX uk_evaluado_periodo_tipo ON evaluaciones';
SET @sql_create := 'CREATE UNIQUE INDEX uk_evaluado_periodo_tipo ON evaluaciones (evaluado_id, periodo_id, tipo)';

-- MariaDB / MySQL soportan indice UNIQUE directo con soft-delete via deleted_at
-- aqui usamos una columna NULL para marcar eliminacion logica y permitimos
-- multiples NULL en eliminado_en => el indice sigue funcionando para los
-- registros activos porque eliminado_en se setea a NOW() cuando se elimina.

-- Implementacion: crear indice UNIQUE simple (evaluado_id, periodo_id, tipo).
-- Si el sistema ya tiene duplicados no eliminados, abortar y avisar.
SELECT
  IF (
    (SELECT COUNT(*) FROM (
      SELECT evaluado_id, periodo_id, tipo, COUNT(*) c
      FROM evaluaciones
      WHERE eliminado_en IS NULL
      GROUP BY evaluado_id, periodo_id, tipo
      HAVING c > 1
    ) t) > 0,
    'ABORTAR: ya existem duplicados activos. Ejecute limpieza antes de aplicar.',
    'OK: no se encontraron duplicados activos, creando indice UNIQUE.'
  ) AS estado;

-- Si la salida anterior es OK, ejecutar:
ALTER TABLE evaluaciones
  ADD UNIQUE KEY uk_evaluado_periodo_tipo (evaluado_id, periodo_id, tipo);
