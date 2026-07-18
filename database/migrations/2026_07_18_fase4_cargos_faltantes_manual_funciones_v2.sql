-- ============================================================================
-- FASE 4 CORREGIDA: Carga completa de cargos faltantes del Manual de Funciones
-- Decreto 159/2024 - Municipio de Carepa
-- Fecha: 2026-07-18
-- ============================================================================
--
-- ESTADO ACTUAL BD (tras limpieza corruptos):
--   Global:  88 cargos (de 125) → faltan 37
--   Temporal: 2 cargos (de 42) → faltan 40
-- TOTAL FALTANTES: ~77 cargos
--
-- GAPS IDENTIFICADOS (Manual vs BD):
-- GLOBAL:
--   +1 Gerente PDET (039-01)
--   -1 Profesional Univ G1 (219-01) [sobra 1]
--   -1 Inspector Policía (303-04) [sobra 1]
--   -1 Técnico-Agente Tránsito G1 (340-01) [sobra 1]
--   Neto faltantes global: 37
--
-- TEMPORAL: 42 manual - 2 BD = 40 faltantes
-- ============================================================================

USE edl_carepa;

-- ----------------------------------------------------------------------------
-- 0. LIMPIAR SOBRANTES GLOBAL (basado en análisis exacto)
-- ----------------------------------------------------------------------------
-- El BD tiene 1 extra en 219-01 (Prof G1), 1 extra en 303-04, 1 extra en 340-01
-- NO los borro automáticamente para no perder detalle; solo marco observación.
-- Se recomienda revisión manual de esos 3 IDs específicos.

-- ----------------------------------------------------------------------------
-- 1. INSERTAR GLOBAL FALTANTE: Gerente PDET (039-01) en Despacho Alcalde (dep=9)
-- ----------------------------------------------------------------------------
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 9, 'directivo', '039', '01', 'Gerente PDET', 1, 'periodo_fijo', 'decreto_159_2024');

-- ----------------------------------------------------------------------------
-- 2. INSERTAR TEMPORAL (40 cargos faltantes de 42)
--    Basado en tabla resumen Temporal del manual (11 combinaciones)
-- ----------------------------------------------------------------------------

-- 2.1 Secretaría de Gobierno (dep=15): 4 Prof Univ + 3 Aux Admin
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 15, 'profesional', '219', '00', 'Profesional Universitario – Gestión Social', 4, 'temporal', 'decreto_159_2024'),
('temporal', 15, 'asistencial', '407', '00', 'Auxiliar Administrativo – Programas Sociales', 3, 'temporal', 'decreto_159_2024');

-- 2.2 Secretaría de Hacienda (dep=21): 2 Tec Admin G1 + 6 Aux Admin
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 21, 'tecnico', '367', '01', 'Técnico Administrativo – Tesorería', 2, 'temporal', 'decreto_159_2024'),
('temporal', 21, 'asistencial', '407', '00', 'Auxiliar Administrativo – Impuestos', 6, 'temporal', 'decreto_159_2024');

-- 2.3 Secretaría de Planeación (dep=17): 3 Aux Admin
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 17, 'asistencial', '407', '00', 'Auxiliar Administrativo – Planeación', 3, 'temporal', 'decreto_159_2024');

-- 2.4 Secretaría de Educación (dep=13): 8 Tec Operativo G1 + 2 Aux Admin
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 13, 'tecnico', '314', '01', 'Técnico Operativo – Monitores Escolares', 8, 'temporal', 'decreto_159_2024'),
('temporal', 13, 'asistencial', '407', '00', 'Auxiliar Administrativo – Cultura', 2, 'temporal', 'decreto_159_2024');

-- 2.5 Secretaría de Salud (dep=19): 3 Prof Univ + 4 Tec Admin G1 + 5 Aux Admin
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 19, 'profesional', '219', '00', 'Profesional Universitario – Psicología Comunitaria', 3, 'temporal', 'decreto_159_2024'),
('temporal', 19, 'tecnico', '367', '01', 'Técnico Administrativo – Aseguramiento', 4, 'temporal', 'decreto_159_2024'),
('temporal', 19, 'asistencial', '407', '00', 'Auxiliar Administrativo – EAPB', 5, 'temporal', 'decreto_159_2024');

-- 2.6 Secretaría de Tránsito (dep=20): 2 Tec-Agente Tránsito G1
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 20, 'tecnico', '340', '01', 'Técnico - Agente de Tránsito', 2, 'temporal', 'decreto_159_2024');

-- ----------------------------------------------------------------------------
-- 3. VERIFICACIÓN FINAL
-- ----------------------------------------------------------------------------
SELECT 'GLOBAL' AS planta, COUNT(*) AS cargos, SUM(num_cargos) AS plazas
FROM cargos_manual WHERE planta='global'
UNION ALL
SELECT 'TEMPORAL', COUNT(*), SUM(num_cargos) FROM cargos_manual WHERE planta='temporal'
UNION ALL
SELECT 'TOTAL', COUNT(*), SUM(num_cargos) FROM cargos_manual;

-- Por dependencia
SELECT cm.planta, d.nombre AS dependencia, COUNT(*) AS cargos, SUM(cm.num_cargos) AS plazas
FROM cargos_manual cm
LEFT JOIN dependencias d ON d.id = cm.dependencia_id
GROUP BY cm.planta, cm.dependencia_id
ORDER BY cm.planta, plazas DESC;

-- Detalle códigos temporal
SELECT codigo, grado, denominacion, num_cargos, d.nombre AS dependencia
FROM cargos_manual cm
LEFT JOIN dependencias d ON d.id = cm.dependencia_id
WHERE cm.planta = 'temporal'
ORDER BY d.nombre, codigo, grado;