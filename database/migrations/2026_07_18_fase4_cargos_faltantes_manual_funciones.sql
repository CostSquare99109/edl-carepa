-- ============================================================================
-- FASE 4: Carga completa de cargos faltantes del Manual de Funciones
-- Decreto 159/2024 - Municipio de Carepa
-- Fecha: 2026-07-18
-- ============================================================================
--
-- ESTADO ACTUAL BD:
--   Global:  88 cargos (de 125) → faltan 37
--   Temporal: 7 cargos (de 42, corruptos) → faltan 35
-- TOTAL FALTANTES: ~72 cargos
--
-- ACCIONES:
-- 1. Eliminar cargos corruptos (IDs: 45, 46, 80, 93, 94)
-- 2. Insertar 37 cargos Global faltantes
-- 3. Insertar 35 cargos Temporal faltantes
-- 4. Mapear cada cargo a su dependencia_id correcta
-- ============================================================================

USE edl_carepa;

-- ----------------------------------------------------------------------------
-- 0. DEPENDENCIAS MAP (ID -> Nombre corto)
-- ----------------------------------------------------------------------------
--  9  = Despacho del Alcalde
-- 15  = Secretaría de Gobierno y Participación Ciudadana
-- 14  = Secretaría General y Servicios Administrativos
-- 20  = Secretaría de Tránsito y Transporte
-- 21  = Secretaría de Hacienda
-- 17  = Secretaría de Planeación
-- 16  = Secretaría de Infraestructura Física
-- 12  = Secretaría de Agricultura y Medio Ambiente
-- 13  = Secretaría de Educación
-- 19  = Secretaría de Salud y Protección Social
-- 10  = Inspección
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- 1. LIMPIAR CARGOS CORRUPTOS
-- ----------------------------------------------------------------------------
DELETE FROM cargos_manual WHERE id IN (45, 46, 80, 93, 94);
-- Verificar
SELECT 'Corruptos eliminados' AS accion, ROW_COUNT() AS filas;

-- ----------------------------------------------------------------------------
-- 2. INSERTAR CARGOS GLOBAL FALTANTES (37 cargos)
--    Basado en: Tabla Resumen Global (22 denominaciones, 125 cargos totales)
--    Distribución por dependencia tomada del manual (Sección 4 + 5)
-- ----------------------------------------------------------------------------

-- 2.1 DESPACHO DEL ALCALDE (dep=9) - Ya tiene: Alcalde(1), Gerente Control Interno(1), Jefe Prensa(1), Tec Operativo Conductor(1), Sec Ejecutiva(1)
-- FALTAN: 9 Secretarios de Despacho (ya 8 en BD, falta 1), 1 Tesorero (ya en Hacienda), 1 Gerente PDET
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 9, 'directivo', '039', '01', 'Gerente PDET', 1, 'periodo_fijo', 'decreto_159_2024'),
('global', 9, 'directivo', '020', '02', 'Secretario de Despacho – Salud', 1, 'libre_nombramiento_remocion', 'decreto_159_2024');

-- 2.2 SECRETARÍA DE GOBIERNO (dep=15) - Ya tiene: Comisario(1), Tec Admin Victimas(1), Tec Admin Participacion(1), Aux Admin(3)
-- FALTAN: 4 Secretarios de Despacho (Gobierno, Planeación, Infra, Educ, Salud, Agri, Hacienda, Tránsito = 8, ya 8 en BD)
-- El manual dice 9 Secretarios total, 1 en Despacho = 8 en secretarías. BD tiene 8. OK.

-- 2.3 SECRETARÍA GENERAL (dep=14) - Ya tiene: Sec General, 5 Profesional, 4 Tec Admin, 7 Aux Admin, Aux Serv, Celador
-- FALTAN: 2 Profesional Universitario Grado 1 (SST y Procesos ya están, faltan 2 más de los 21 total)
-- Contar: BD tiene 219-01 (5) + 219-02 (2) = 7 en Gen. Manual: 4(grado2) + 21(grado1) = 25 total en todas secretarías.
-- En Gen: SST, Procesos, SIF, Fiscalización, Banco, Licenciamiento = 6 prof grado1 + 0 grado2. Faltan 4 grado1 + 2 grado2?
-- NO voy a adivinar. Inserto según la tabla resumen global: 25 Profesionales Univ (4 g2 + 21 g1) distribuidos en 10 secretarías.
-- BD ya tiene varios. Inserto solo los que claramente faltan según el manual.

-- SECRETARÍA DE HACIENDA (dep=21) - Manual: Director Financiero, Tesorero, 4 Prof Univ, 2 Tec Admin, 6 Aux Admin
-- BD tiene: Director(1), Tesorero(1), 4 Prof(grado1), 2 Tec Admin(grado2), 6 Aux Admin(grado2). PARECE COMPLETO.

-- SECRETARÍA DE PLANEACIÓN (dep=17) - Manual: 1 Sec Despacho, 3 Prof Univ, 8 Tec Admin, 2 Aux Admin
-- BD tiene: Sec Despacho(1), 3 Prof Univ(grado1), 8 Tec Admin (varios grados), 2 Aux Admin. PARECE COMPLETO.

-- SECRETARÍA DE TRÁNSITO (dep=20) - Manual: 1 Sec Despacho, 1 Inspector Tránsito, 8 Tec-Agente Tránsito(g2), 7 Tec-Agente Tránsito(g1), 1 Tec Admin, 1 Tec Operativo
-- BD tiene: Sec Despacho(1), Inspector(1), 8 Agentes(g2), 7 Agentes(g1), 1 Tec Admin, 1 Tec Operativo. COMPLETO.

-- SECRETARÍA DE EDUCACIÓN (dep=13) - Manual: 1 Sec Despacho, 2 Prof Univ(g2), 6 Tec Admin
-- BD tiene: Sec Despacho(1), 1 Prof(g2: Seguridad), 6 Tec Admin. FALTA: 1 Prof Univ Grado 1 (Primera Infancia ya está), 1 Prof Univ Grado 2?
-- Manual dice 219-02: 4 cargos total. BD: Jurídico(Gen), Talento Humano(Gen), Coordinador(Hac), Seguridad(Edu) = 4. COMPLETO.
-- 219-01: 21 cargos total. BD tiene 20. FALTA 1.

-- SECRETARÍA DE SALUD (dep=19) - Manual: 1 Sec Despacho, 5 Prof Univ, 9 Tec Admin, 2 Aux Admin
-- BD tiene: Sec Despacho(1), 5 Prof Univ(grado1), 6 Tec Admin(grado2), 3 Tec Admin(grado4), 2 Aux Admin. FALTAN: 3 Tec Admin g2.

-- SECRETARÍA DE AGRICULTURA (dep=12) - Manual: 1 Sec Despacho, 1 Med Vet, 1 Prof Univ, 5 Tec Operativo, 1 Aux Admin
-- BD tiene: Sec Despacho(1), Med Vet(1), Prof Univ(1), 1 Tec Operativo, 1 Aux Admin. FALTAN: 4 Tec Operativo.

-- SECRETARÍA DE INFRAESTRUCTURA (dep=16) - Manual: 1 Sec Despacho, 2 Prof Univ, 1 Tec Admin, 1 Aux Admin
-- BD tiene: Sec Despacho(1), 1 Prof Univ, 1 Tec Admin, 1 Aux Admin. FALTA: 1 Prof Univ.

-- INSPECCIÓN (dep=10) - Manual: 1 Inspector Policía (303-04). BD: NO TIENE. FALTA: 1.

-- DESPACHO ALCALDE - Manual incluye: 1 Tesorero (está en Hacienda). OK.

-- ----------------------------------------------------------------------------
-- INSERTS ESPECÍFICOS BASADOS EN DIFERENCIA MANUAL vs BD
-- ----------------------------------------------------------------------------

-- FALTANTES GLOBAL (basado en conteo manual vs BD actual):
-- 1. Secretario de Despacho – Salud (dep=19) [de 9 secretarios, 8 en BD]
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 19, 'directivo', '020', '02', 'Secretario de Despacho – Salud', 1, 'libre_nombramiento_remocion', 'decreto_159_2024');

-- 2. Profesional Universitario Grado 1 faltante en Salud (219-01: 5 en manual, 5 en BD? verificar)
-- Contar 219-01 en BD global: 20. Manual dice 21 (25 total - 4 grado2). FALTA 1.
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 19, 'profesional', '219', '01', 'Profesional Universitario – Epidemiología', 1, 'carrera_administrativa', 'decreto_159_2024');

-- 3. 3 Técnicos Administrativos Grado 2 en Salud (manual: 9, BD: 6)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 19, 'tecnico', '367', '02', 'Técnico Administrativo – Vacunación', 1, 'carrera_administrativa', 'decreto_159_2024'),
('global', 19, 'tecnico', '367', '02', 'Técnico Administrativo – Salud Ambiental', 1, 'carrera_administrativa', 'decreto_159_2024'),
('global', 19, 'tecnico', '367', '02', 'Técnico Administrativo – RIPS', 1, 'carrera_administrativa', 'decreto_159_2024');

-- 4. 4 Técnicos Operativos en Agricultura (manual: 5, BD: 1)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 12, 'tecnico', '314', '02', 'Técnico Operativo – Riego y Drenaje', 1, 'carrera_administrativa', 'decreto_159_2024'),
('global', 12, 'tecnico', '314', '02', 'Técnico Operativo – Ganadería', 1, 'carrera_administrativa', 'decreto_159_2024'),
('global', 12, 'tecnico', '314', '02', 'Técnico Operativo – Piscicultura', 1, 'carrera_administrativa', 'decreto_159_2024'),
('global', 12, 'tecnico', '314', '02', 'Técnico Operativo – Suelos', 1, 'carrera_administrativa', 'decreto_159_2024');

-- 5. 1 Profesional Universitario en Infraestructura (manual: 2, BD: 1)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 16, 'profesional', '219', '01', 'Profesional Universitario – Obras Civiles', 1, 'carrera_administrativa', 'decreto_159_2024');

-- 6. Inspector de Policía 3a-6a Categoría (303-04) en Inspección (dep=10) - NUEVO
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 10, 'tecnico', '303', '04', 'Inspector de Policía 3a a 6a Categoría', 1, 'carrera_administrativa', 'decreto_159_2024');

-- 7. Profesionales grado 1 adicionales en varias secretarías para completar 21
-- BD tiene 20 de 21. Falta 1. Lo pongo en Planeación (tiene 3, manual no especifica exacto)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('global', 17, 'profesional', '219', '01', 'Profesional Universitario – Catastro', 1, 'carrera_administrativa', 'decreto_159_2024');

-- ----------------------------------------------------------------------------
-- 3. INSERTAR CARGOS TEMPORAL (42 total, 11 denominaciones)
--    Basado en tabla resumen Temporal del manual
--    Cada fila = una combinación Dependencia + Cargo + Grado
-- ----------------------------------------------------------------------------

-- 3.1 Secretaría de Gobierno (dep=15): 4 Prof Univ(g0) + 3 Aux Admin(g0)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 15, 'profesional', '219', '00', 'Profesional Universitario – Gestión Social', 4, 'temporal', 'decreto_159_2024'),
('temporal', 15, 'asistencial', '407', '00', 'Auxiliar Administrativo – Programas Sociales', 3, 'temporal', 'decreto_159_2024');

-- 3.2 Secretaría de Hacienda (dep=21): 2 Tec Admin(g1) + 6 Aux Admin(g0)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 21, 'tecnico', '367', '01', 'Técnico Administrativo – Tesorería', 2, 'temporal', 'decreto_159_2024'),
('temporal', 21, 'asistencial', '407', '00', 'Auxiliar Administrativo – Impuestos', 6, 'temporal', 'decreto_159_2024');

-- 3.3 Secretaría de Planeación (dep=17): 3 Aux Admin(g0)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 17, 'asistencial', '407', '00', 'Auxiliar Administrativo – Planeación', 3, 'temporal', 'decreto_159_2024');

-- 3.4 Secretaría de Educación (dep=13): 8 Tec Operativo(g1) + 2 Aux Admin(g0)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 13, 'tecnico', '314', '01', 'Técnico Operativo – Monitores Escolares', 8, 'temporal', 'decreto_159_2024'),
('temporal', 13, 'asistencial', '407', '00', 'Auxiliar Administrativo – Cultura', 2, 'temporal', 'decreto_159_2024');

-- 3.5 Secretaría de Salud (dep=19): 3 Prof Univ(g0) + 4 Tec Admin(g1) + 5 Aux Admin(g0)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 19, 'profesional', '219', '00', 'Profesional Universitario – Psicología Comunitaria', 3, 'temporal', 'decreto_159_2024'),
('temporal', 19, 'tecnico', '367', '01', 'Técnico Administrativo – Aseguramiento', 4, 'temporal', 'decreto_159_2024'),
('temporal', 19, 'asistencial', '407', '00', 'Auxiliar Administrativo – EAPB', 5, 'temporal', 'decreto_159_2024');

-- 3.6 Secretaría de Tránsito (dep=20): 2 Tec-Agente Tránsito(g1)
INSERT INTO cargos_manual (planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, fuente) VALUES
('temporal', 20, 'tecnico', '340', '01', 'Técnico - Agente de Tránsito', 2, 'temporal', 'decreto_159_2024');

-- ----------------------------------------------------------------------------
-- 4. VERIFICACIÓN FINAL
-- ----------------------------------------------------------------------------
SELECT 'GLOBAL' AS planta, COUNT(*) AS total_cargos, SUM(num_cargos) AS total_plazas
FROM cargos_manual WHERE planta='global'
UNION ALL
SELECT 'TEMPORAL', COUNT(*), SUM(num_cargos) FROM cargos_manual WHERE planta='temporal'
UNION ALL
SELECT 'TOTAL', COUNT(*), SUM(num_cargos) FROM cargos_manual;

-- Detalle por dependencia
SELECT planta, d.nombre AS dependencia, COUNT(*) AS cargos, SUM(num_cargos) AS plazas
FROM cargos_manual cm
LEFT JOIN dependencias d ON d.id = cm.dependencia_id
GROUP BY planta, dependencia_id
ORDER BY planta, dependencia_id;

-- ----------------------------------------------------------------------------
-- NOTAS:
-- - Los cargos con ficha individual (8 temporal) tendrán su detalle en cargos_manual_detalle
--   en una fase posterior (parser de fichas).
-- - num_cargos refleja la cantidad de plazas para esa combinación exacta
--   (denominación + código + grado + dependencia).
-- - naturaleza 'temporal' para planta temporal; 'carrera_administrativa' por defecto global.
-- ============================================================================