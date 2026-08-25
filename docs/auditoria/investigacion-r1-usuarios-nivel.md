# INVESTIGACIÓN FORENSE R1/R8 — `usuarios.nivel` (pre-M007, solo lectura)

> Fecha: 2026-08-25 · HEAD base: `9869cee` · Estado: **investigación cerrada,
> migración M007 DISEÑADA pero NO autorizada ni ejecutada.**

## Respuestas a las 10 preguntas del encargo

### Q1. ¿Cuál es la fuente de verdad?
**`cargos_manual`**, el catálogo normativo del Decreto 159/2024, expuesto
solo-lectura por la API (`backend/public/index.php:130-143`, sin POST/PUT sobre
el catálogo). `usuarios.nivel` es una **copia materializada** que se propaga en
`POST /usuarios/{id}/cargo-manual` (`CargoManualService.php:66-75`) y que
además es editable directamente vía `PUT /usuarios/{id}`
(`UsuarioRepository` incluye `nivel` en campos actualizables) → **dos
escritores + cero propagación desde correcciones al catálogo = vector
estructural de drift**, confirmado por la evidencia cronológica (§Q9).

### Q2. ¿Cuántos usuarios están realmente desincronizados?
**25 exactamente**, definidos canónicamente por vínculo vigente
(`usuario_cargo_manual.vigente=1`), no por listas manuales:
24× `asistencial→tecnico` (23 vinculados al cargo 33 `312/03` + 1 al cargo 4
`314/02`, ambos ya corregidos por P0-1/M003/M006) + 1× `directivo→profesional`
(usuario 13 ↔ cargo 15 `219/02`). 22 activos, 3 inactivos (23, 50, 108).

### Q3. ¿Existen más casos además de los 24 iniciales?
Sí: **R8 (usuario 13)** dentro del alcance corregible, y una **población B
estructural aparte**: 38 usuarios sin vínculo vigente (36 con nivel NULL +
2 con nivel definido: usuario 186 real y usuario 273 TEST). Para B el nivel
esperado **no es derivable del catálogo** sin política de asignación → quedan
fuera de M007 y requieren decisión humana.

### Q4. ¿Cómo se relaciona cada usuario con su cargo vigente?
Tabla puente `usuario_cargo_manual(usuario_id, cargo_manual_id, vigente)`.
Estado actual: **187 vínculos vigentes = 187 usuarios distintos (1:1 exacto)**,
sin duplicados; 1 fila histórica `vigente=0`.

### Q5. ¿Usuarios históricos/inactivos a excluir?
- Único vínculo histórico: usuario 186→cargo 91 desactivado el 2026-08-24
  19:23:36 porque el cargo está soft-deleted — limpieza legítima, no error.
- Los 3 inactivos del alcance (23/50/108) **se incluyen** en M007: la
  integridad del dato no depende de si el usuario opera.
- Usuario 186 queda en B: su `nivel='profesional'` ya es consistente con su
  `codigo_empleo=219`; solo carece de vínculo (política de asignación, no sync).

### Q6. ¿Múltiples cargos o reasignaciones?
Ningún usuario con >1 vínculo vigente (query HAVING COUNT>1 → vacío).
Historial total: 1 sola reasignación (la de 186). No hay ambigüedad de mapeo.

### Q7. ¿Concertaciones/evaluaciones activas?
**Cero concertaciones y cero evaluaciones en CUALQUIER estado** para los 25.
Riesgo prospectivo: el periodo 2026-2027 ya está en estado `concertacion`;
al primer flujo real, estos usuarios recibirían competencias por nivel
incorrecto (`v_competencias_por_nivel`: asistencial=`MAN_INF,REL_INT,COLAB`
en lugar de técnico=`CONFI,DISC,RESP`; para el usuario 13, profesional en vez
de directivo).

### Q8. ¿Sync simple o excepciones?
**Sincronización simple sin excepciones dentro del alcance canónico (25)**:
la regla `usuarios.nivel := cargo_vigente.nivel` no admite override legítimo
conocido (0 contratistas activos; ningún caso justificado encontrado en
auditoría). La población B queda excluida por indeterminable, no por excepción.

### Q9. ¿Cómo impedir recurrencia?
1. **Auditor determinista** `tests/auditor_usuarios_nivel.py --mysql`
   (exit 2 mientras exista DESYNC) + `tests/auditoria_usuarios.sql`.
2. **Regla operativa**: toda migración futura que modifique
   `cargos_manual.nivel` debe ejecutar en el mismo cambio la resincronización
   verificada de copias materializadas (lección directa de P0-1/M003/M006).
3. Opcional futuro (requiere decisión, no implementado): trigger de
   sincronización o vista derivada; hoy se prefiere copia explícita + auditor.

### Q10. ¿Derivación automática del nivel?
**Sí, para usuarios CON vínculo vigente**: `usuarios.nivel :=
cargos_manual.nivel` vía el vínculo (diseño M007 abajo). Para usuarios SIN
vínculo **no es derivable** (38 casos) → requieren asignación manual. No se
propone refactor grande: la copia materializada se conserva por rendimiento y
simplicidad, con auditor obligatorio como red de seguridad.

## Origen del drift (cadena causal)
1. 17-jul: import legacy crea usuarios con `nivel` del sistema anterior
   (`migrate_usuarios.py:206-214`, p.ej. «Nivel 5 - Asistencial»), congelados
   desde entonces (`actualizado_en`=2026-07-17; auditoría: última
   actualización masiva 10:42:59).
2. El catálogo se corrige DESPUÉS por fases (P0-1/M003 el 24-ago 19:11;
   M006 hoy) **sin mecanismo de propagación** a las copias → drift creado
   por las propias correcciones correctas.
3. Ninguna validación post-migración preguntó «¿quedó alguien desincronizado?»
   hasta este análisis (defecto corregido con el auditor nuevo).

## Diseño propuesto M007 (NO EJECUTAR sin GO)
Mismo patrón transaccional probado en M006 (procedimiento + SIGNAL +
ROLLBACK): precondición P1 población canónica=25; UPDATE por id con guardas
`SET u.nivel=(SELECT cm.nivel ...)` cerrada por `ucm.id` + valores esperados;
postcondiciones V1 afectadas=25, V2 `Q-CANONICA` devuelve 0 filas, V3 totales
de usuarios inalterados (225 vivos); rollback documentado (valores previos:
24× 'asistencial', 1× 'directivo'). Regenerar dump tras GO. Impacto downstream:
concertación futura usará conjunto técnico/profesional correcto; sin efecto
retroactivo (compromisos guardan su propia competencia).

## Evidencia
- Consultas: población A/B, vínculos, historial, concertaciones, auditoría.
- Auditor: `python3 tests/auditor_usuarios_nivel.py --mysql` →
  `DESYNC 25 -> ids [13,23,25,37,45,50,51,67,69,72,73,74,86,92,97,99,108,128,
  139,147,159,160,174,177,183]`; RESUMEN ok=172 warn=28 error=25.
- Tests unitarios: `tests/test_auditor_usuarios_nivel.py` (8/8 PASS).
