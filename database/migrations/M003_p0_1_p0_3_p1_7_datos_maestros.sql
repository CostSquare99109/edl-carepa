-- M003 — FASE B: P0-1 (niveles) + P0-3 (denominaciones V-06) + P1-7 (Gerente PDET / Inspector de Policía)
-- Fuente: Manuales Marzo 2025 (tablas de planta N=3 + fichas 02/10/61 y textos literales de fichas).
-- Cada UPDATE lleva guardas de valor esperado: si algo no coincide, afecta 0 filas (señal de alerta).
-- NO toca: grados de 219/367, naturaleza temporal, dependencia DEP-013, jefaturas pendientes.

-- ===== P0-1: nivel jerárquico asistencial -> tecnico (respaldado por tablas de planta Nivel=3 y fichas) =====
UPDATE cargos_manual SET nivel='tecnico' WHERE id=33 AND codigo='312' AND grado='03' AND nivel='asistencial'; -- FICHA 36: Técnico Operativo – Inspector de Transito (Nivel Técnico)
UPDATE cargos_manual SET nivel='tecnico' WHERE id=34 AND codigo='340' AND grado='02' AND nivel='asistencial'; -- planta §1.1: TECNICO -AGENTE DE TRANSITO N=3
UPDATE cargos_manual SET nivel='tecnico' WHERE id=36 AND codigo='340' AND grado='01' AND nivel='asistencial';
UPDATE cargos_manual SET nivel='tecnico' WHERE id=22 AND codigo='367' AND grado='03' AND nivel='asistencial'; -- Téc. Adm. Gestión Documental (N=3)
UPDATE cargos_manual SET nivel='tecnico' WHERE id=92 AND codigo='314' AND grado='01' AND nivel='asistencial' AND planta='temporal'; -- FICHA Monitores (Nivel Técnico)
UPDATE cargos_manual SET nivel='tecnico' WHERE id=95 AND codigo='340' AND grado='01' AND nivel='asistencial' AND planta='temporal';

-- ===== P0-3: denominaciones truncadas -> texto literal de la ficha (lista cerrada V-06) =====
UPDATE cargos_manual SET denominacion='Jefe oficina de Prensa y Comunicaciones' WHERE id=3 AND denominacion='Comunicaciones';
UPDATE cargos_manual SET denominacion='Profesional Universitario – Gestión de Talento Humano' WHERE id=16 AND denominacion='Talento Humano';
UPDATE cargos_manual SET denominacion='Profesional Universitario –Seguridad y Salud en el Trabajo (SST)' WHERE id=17 AND denominacion='Salud en el Trabajo (SST)';
UPDATE cargos_manual SET denominacion='Profesional Universitario – Cobro Coactivo y Persuasivo.' WHERE id=43 AND denominacion='y Persuasivo.';
UPDATE cargos_manual SET denominacion='Profesional Universitario – Manejo de Datos' WHERE id=44 AND denominacion='Datos';
UPDATE cargos_manual SET denominacion='Auxiliar Administrativo – Asistente Tesorería' WHERE id=47 AND denominacion='Tesorería';
UPDATE cargos_manual SET denominacion='Profesional Universitario– Infraestructura Física - OOPPMM' WHERE id=64 AND denominacion='Profesional Universitario– Infraestructura';

-- ===== P1-7: correcciones documentalmente resueltas (FICHA 61 y FICHA 10) =====
-- Gerente PDET: naturaleza Libre Nombramiento y Remoción + dependencia Planeación (DEP-012, la que ya
-- aloja los 15 cargos de Planeación; NO se fusiona ni elimina DEP-013 — P0-4 sigue bloqueado).
UPDATE cargos_manual SET naturaleza='libre_nombramiento_remocion', dependencia_id=17
 WHERE id=96 AND codigo='039' AND grado='01' AND planta='global' AND naturaleza='periodo_fijo' AND denominacion='Gerente PDET';
-- Inspector de Policía: dependencia Secretaría de Gobierno (id 15) + jefe según FICHA 10.
UPDATE cargos_manual SET dependencia_id=15, jefe_inmediato='Secretario de Gobierno y Participación Ciudadana'
 WHERE id=108 AND codigo='303' AND grado='04' AND planta='global' AND dependencia_id=10;

-- ===== Verificación de datos BLOQUEADOS (debe devolver los valores originales) =====
-- Grados 219 vigentes por grado (esperado: 4 en 02, 21 en 01 — SIN cambio):
-- SELECT grado, COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL AND codigo='219' AND planta='global' GROUP BY grado;
-- Grados 367 (esperado: 4 en 04, 1 en 03, 33 en 02 — SIN cambio):
-- SELECT grado, COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL AND codigo='367' AND planta='global' GROUP BY grado;
-- DEP-013 intacta: SELECT id, nombre FROM dependencias WHERE id=18; -- sigue existiendo
