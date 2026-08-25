-- M007_sync_usuarios_nivel.sql
-- GENERADO por tests/generar_m007.py desde la BD viva. NO editar a mano;
-- regenerar con: python3 tests/generar_m007.py
-- Scope: POBLACION A = 25 usuarios con vinculo vigente cuyo
--   usuarios.nivel difiere de cargos_manual.nivel (24 asistencial->tecnico + 1 directivo->profesional).
-- Fuente de verdad: cargos_manual (catálogo normativo Decreto 159/2024);
--   usuarios.nivel es copia materializada (ver docs/auditoria/
--   investigacion-r1-usuarios-nivel.md Q1/Q10).
-- POBLACION B (sin vinculo vigente, incluidos 186 y 273 TEST): INTACTA por
--   diseño; su nivel NO es derivable automaticamente del catalogo.
-- Inmutabilidad: solo cambia usuarios.nivel (+ actualizado_en por ON UPDATE
--   CURRENT_TIMESTAMP del esquema; metadato, no dato de negocio).
-- Rollback: valores previos registrados en este archivo (guardas) y en el
--   informe; inverso: restaurar nivel_previo por usuario_id.

DELIMITER $$

DROP PROCEDURE IF EXISTS m007_sync_usuarios_nivel $$
CREATE PROCEDURE m007_sync_usuarios_nivel()
BEGIN
  DECLARE v_afectadas INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Imagen previa de la POBLACION B para demostrar inmutabilidad (V4)
  CREATE TEMPORARY TABLE m007_b AS
    SELECT u.id, u.nivel FROM usuarios u
    WHERE u.eliminado_en IS NULL
      AND NOT EXISTS (SELECT 1 FROM usuario_cargo_manual x
                       WHERE x.usuario_id=u.id AND x.vigente=1);

  -- P1: poblacion canonica exacta
  IF (SELECT COUNT(*) FROM usuarios u
      JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1
      JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
       AND cm.eliminado_en IS NULL
      WHERE u.eliminado_en IS NULL AND NOT(u.nivel<=>cm.nivel)) <> 25 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P1: poblacion canonica != 25';
  END IF;
  -- P2/P3: distribucion 24+1
  IF (SELECT COUNT(*) FROM usuarios u
      JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1
      JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
       AND cm.eliminado_en IS NULL
      WHERE u.eliminado_en IS NULL
        AND u.nivel='asistencial' AND cm.nivel='tecnico') <> 24 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P2: asistencial->tecnico != 24';
  END IF;
  IF (SELECT COUNT(*) FROM usuarios u
      JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1
      JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
       AND cm.eliminado_en IS NULL
      WHERE u.eliminado_en IS NULL
        AND u.nivel='directivo' AND cm.nivel='profesional') <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P3: directivo->profesional != 1';
  END IF;
  -- P4: ningun usuario con multiples vinculos vigentes
  IF EXISTS (SELECT 1 FROM usuario_cargo_manual WHERE vigente=1
             GROUP BY usuario_id HAVING COUNT(*)>1) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P4: usuario con multiples cargos vigentes';
  END IF;
  -- P5: ningun vinculo vigente hacia cargo eliminado
  IF EXISTS (SELECT 1 FROM usuario_cargo_manual ucm
             JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
              AND cm.eliminado_en IS NOT NULL
             WHERE ucm.vigente=1) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 P5: vinculo vigente a cargo eliminado';
  END IF;

  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=56 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=15
    SET u.nivel='profesional'
   WHERE u.id=13 AND u.nivel='directivo'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=15 AND c.eliminado_en IS NULL
                    AND c.nivel='profesional');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=66 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=23 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=68 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=25 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=77 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=37 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=83 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=45 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=88 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=50 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=89 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=51 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=103 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=67 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=105 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=69 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=108 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=72 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=109 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=73 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=110 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=74 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=120 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=86 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=125 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=92 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=129 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=97 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=131 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=99 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=138 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=108 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=155 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=128 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=164 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=139 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=171 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=159 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=172 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=160 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=175 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=174 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=177 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=177 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=179 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=33
    SET u.nivel='tecnico'
   WHERE u.id=183 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=33 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();
  UPDATE usuarios u
    JOIN usuario_cargo_manual ucm
      ON ucm.id=14 AND ucm.usuario_id=u.id AND ucm.vigente=1
     AND ucm.cargo_manual_id=4
    SET u.nivel='tecnico'
   WHERE u.id=147 AND u.nivel='asistencial'
     AND EXISTS (SELECT 1 FROM cargos_manual c
                  WHERE c.id=4 AND c.eliminado_en IS NULL
                    AND c.nivel='tecnico');
  SET v_afectadas = v_afectadas + ROW_COUNT();

  -- V1: afecto exactamente las 25 filas
  IF v_afectadas <> 25 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 V1: filas afectadas != 25';
  END IF;
  -- V2: poblacion A queda 100%% sincronizada
  IF EXISTS (SELECT 1 FROM usuarios u
             JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id
              AND ucm.vigente=1
             JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
              AND cm.eliminado_en IS NULL
             WHERE u.eliminado_en IS NULL AND NOT(u.nivel<=>cm.nivel)) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 V2: quedan desincronizados en poblacion A';
  END IF;
  -- V3: los ids del scope tienen exactamente el nivel de su cargo
  IF EXISTS (SELECT 1 FROM usuarios u
             JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id
              AND ucm.vigente=1
             JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id
             WHERE u.id IN (13,23,25,37,45,50,51,67,69,72,73,74,86,92,97,99,108,128,139,159,160,174,177,183,147) AND NOT(u.nivel<=>cm.nivel)) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 V3: id del scope con nivel incorrecto';
  END IF;
  -- V4: poblacion B INTACTA (ni un cambio)
  IF EXISTS (SELECT 1 FROM m007_b t JOIN usuarios u ON u.id=t.id
             WHERE NOT(u.nivel<=>t.nivel)) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'M007 V4: poblacion B fue modificada';
  END IF;
  DROP TEMPORARY TABLE m007_b;

  COMMIT;
END $$
CALL m007_sync_usuarios_nivel() $$
DROP PROCEDURE IF EXISTS m007_sync_usuarios_nivel $$
DELIMITER ;

-- Verificacion post-migracion:
--   source tests/auditoria_usuarios.sql   -> Q-CANONICA debe dar 0 filas
-- POSTERIOR OBLIGATORIO: regenerar database/full_dump.sql (un reload del
-- dump antiguo reintroduciria el drift; el seed actual lo contiene).
