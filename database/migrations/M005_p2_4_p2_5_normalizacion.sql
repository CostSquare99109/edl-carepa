-- M005 — FASE D: P2-4 (normalización de tildes/erratas en catálogos) + P2-5 (limpieza BD-02)
-- P2-4: ortografía según manuales y regla general de tildes; NO cambia nombres de dependencias
-- más allá de erratas evidentes (no es reorganización del organigrama — V-09 sigue bloqueado).
-- P2-5: la asignación vigente a un cargo soft-deleted (usuario_cargo_manual id=20, usuario 186,
-- cargo 91 borrado) se desactiva (vigente=0) — no se borra nada (trazabilidad preservada).

-- ===== P2-4: competencias (tildes; el manual escribe 'Adaptación', 'Orientación', 'Aporte técnico-profesional') =====
UPDATE competencias SET nombre='Adaptación al cambio' WHERE codigo='ADP_CAM' AND nombre='Adaptacion al cambio';
UPDATE competencias SET nombre='Orientación a resultados' WHERE codigo='ORI_RES' AND nombre='Orientacion a resultados';
UPDATE competencias SET nombre='Orientación al usuario y al ciudadano' WHERE codigo='ORI_USU' AND nombre='Orientacion al usuario y al ciudadano';
UPDATE competencias SET nombre='Aporte técnico-profesional' WHERE codigo='APR_TEC' AND nombre='Aporte tecnico profesional';

-- ===== P2-4: dependencias (erratas evidentes) =====
UPDATE dependencias SET nombre='Secretaría de Hacienda' WHERE id=21 AND nombre='Secretaria, de Hacienda';
UPDATE dependencias SET nombre='Oficina Jurídica' WHERE id=11 AND nombre='Oficina de Juridica';
UPDATE dependencias SET nombre='Secretaría de Tránsito y Transporte' WHERE id=20 AND nombre='Secretaría de Transito y Transporte';

-- ===== P2-5: BD-02 — desactivar asignación vigente hacia cargo eliminado =====
UPDATE usuario_cargo_manual ucm
SET ucm.vigente = 0
WHERE ucm.id = 20 AND ucm.vigente = 1
  AND EXISTS (SELECT 1 FROM cargos_manual cm WHERE cm.id = ucm.cargo_manual_id AND cm.eliminado_en IS NOT NULL);
