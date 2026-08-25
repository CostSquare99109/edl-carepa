-- M006_p0_1_residuo_niveles.sql
-- GENERADO por tests/generar_m006.py desde la BD viva. NO editar IDs a mano;
-- regenerar con: python3 tests/generar_m006.py
-- Scope ESTRICTO: cargos_manual.nivel de 23 filas vivas / 24 empleos
--   367/02: 17 filas / 18 empleos (id 76 tiene num_cargos=2)
--   367/04: 3 filas / 3 empleos
--   314/02: 3 filas / 3 empleos
-- Fuente normativa: manual-funciones-marzo-2025.md:51 (Tecnico N=3),
-- tabla agregada SS1 + discriminada SS1.1 + 23/23 fichas dicen Tecnico.
-- NO modifica: usuarios, num_cargos, grado, denominaciones ni planta
-- (hallazgos R1-R7 se tramitan por separado).
-- Rollback: los valores previos son nivel='asistencial'; ver ROLLBACK.md al pie.

DELIMITER $$

DROP PROCEDURE IF EXISTS m006_residuo_niveles $$
CREATE PROCEDURE m006_residuo_niveles()
BEGIN
  DECLARE v_afectadas INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- P1: poblacion canonica exacta
  IF (SELECT COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL AND nivel='asistencial' AND ((codigo='367' AND grado IN ('02','04')) OR (codigo='314' AND grado='02'))) <> 23 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 P1: poblacion canonica != 23 filas';
  END IF;
  -- P2: empleos esperados
  IF (SELECT COALESCE(SUM(num_cargos),0) FROM cargos_manual WHERE eliminado_en IS NULL AND nivel='asistencial' AND ((codigo='367' AND grado IN ('02','04')) OR (codigo='314' AND grado='02'))) <> 24 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 P2: empleos de la poblacion != 24';
  END IF;
  -- P3: ningun asistencial fuera del alcance conocido
  IF EXISTS (SELECT 1 FROM cargos_manual WHERE eliminado_en IS NULL
             AND nivel='asistencial'
             AND codigo NOT IN ('367','314','407','438','470','477')) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 P3: asistencial fuera del alcance';
  END IF;

  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=4 AND codigo='314' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=37 AND codigo='314' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=69 AND codigo='314' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=8 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=9 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=21 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=23 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=35 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=56 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=57 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=58 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=59 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=60 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=65 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=75 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=76 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=77 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=79 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=86 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=87 AND codigo='367' AND grado='02'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=20 AND codigo='367' AND grado='04'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=74 AND codigo='367' AND grado='04'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE cargos_manual SET nivel='tecnico'
       WHERE id=78 AND codigo='367' AND grado='04'
         AND planta='global' AND nivel='asistencial'
         AND eliminado_en IS NULL;
  SET v_afectadas = v_afectadas + ROW_COUNT();

  -- V1: afecto exactamente las 23 filas
  IF v_afectadas <> 23 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 V1: filas afectadas != 23';
  END IF;
  -- V2: grupos objetivo quedan homogeneos en tecnico
  IF EXISTS (SELECT 1 FROM cargos_manual WHERE eliminado_en IS NULL
             AND codigo IN ('367','314') AND nivel <> 'tecnico') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M006 V2: queda nivel != tecnico en 367/314';
  END IF;
  -- V3/V4: nada mas cambia (totales globales intactos)
  IF (SELECT COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL) <> 127 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'M006 V3: total filas vivas != 127';
  END IF;
  IF (SELECT COALESCE(SUM(num_cargos),0) FROM cargos_manual
      WHERE eliminado_en IS NULL) <> 167 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'M006 V4: total empleos != 167';
  END IF;

  COMMIT;
END $$
-- Ejecucion inmediata dentro del mismo script:
CALL m006_residuo_niveles() $$
DROP PROCEDURE IF EXISTS m006_residuo_niveles $$
DELIMITER ;

-- Verificacion post-migracion (fuera de la transaccion):
-- SELECT codigo, grado, GROUP_CONCAT(DISTINCT nivel) FROM cargos_manual
--   WHERE eliminado_en IS NULL AND codigo IN ('367','314')
--   GROUP BY codigo, grado;                       -> todo 'tecnico'
-- POSTERIOR OBLIGATORIO: regenerar database/full_dump.sql para evitar
-- divergencia entre BD y artefacto versionado (un reload del dump antiguo
-- REINTRODUCIRIA los niveles asistenciales).

-- ROLLBACK manual (si se hubiera hecho COMMIT y se desea revertir):
--   UPDATE cargos_manual SET nivel='asistencial'
--   WHERE id IN (/* los mismos 23 ids */)
--     AND codigo IN ('367','314') AND nivel='tecnico'
--     AND eliminado_en IS NULL;
