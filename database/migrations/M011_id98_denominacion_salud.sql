-- ============================================================================
-- M011_id98_denominacion_salud.sql
-- Renombre con respaldo FICHA 92 (Manual Global Marzo 2025, modelo @4852 aprox).
--
-- APROBACION USUARIO 2026-08-25: id 98 aprobado con evidencia ESTRUCTURAL
--   (codigo 020 + grado 02 + dependencia exacta dep-19 + patron de truncamiento
--   identico a casos M008). NOTA REGISTRADA A PEDIDO DEL USUARIO: esta evidencia
--   NO es literaria — no existe EAV previo de este cargo para contraste palabra
--   por palabra. Si en el futuro aparece contenido EAV para este cargo que no
--   calce con lo esperado de la FICHA 92, revisar con mas cuidado que un caso
--   ya corroborado por texto.
--
-- IMPORTANTE: sin USE. Aplicar SOLO via database/migrations/aplicar_migracion.sh
-- ============================================================================
START TRANSACTION;

UPDATE cargos_manual
   SET denominacion='Secretario de Despacho – Salud y Protección social'
 WHERE id=98 AND eliminado_en IS NULL AND codigo='020' AND grado='02'
   AND dependencia_id=19
   AND denominacion='Secretario de Despacho – Salud';

SELECT ROW_COUNT() AS filas_renombradas_esperado_1;
SELECT id, CHAR_LENGTH(denominacion) AS len_50, denominacion FROM cargos_manual WHERE id=98;

COMMIT;

-- ROLLBACK:
-- UPDATE cargos_manual SET denominacion='Secretario de Despacho – Salud' WHERE id=98;
