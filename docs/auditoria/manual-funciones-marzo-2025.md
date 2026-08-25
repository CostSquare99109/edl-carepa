# Auditoría EDL-Carepa — Manuales de Funciones Marzo 2025

> **Rama**: `audit/manual-funciones-marzo-2025` · **Fecha**: 2026-08-24 · **Estado**: SOLO DIAGNÓSTICO (no se implementaron cambios funcionales)

---

## 1. Resumen ejecutivo

Se auditó el sistema EDL-Carepa (backend PHP MVC + frontend React + MySQL) contra los dos manuales oficiales de funciones (Planta Global y Planta Temporal, "Marzo 2025", Anexo 01 del Decreto 159 de 2024). Los manuales son la fuente normativa; el código y la BD solo evidencian el estado actual.

**Cifras clave**:

| Indicador | Valor |
|---|---:|
| Empleos normativos (Global 125 + Temporal 42) | **167** |
| Empleos en BD (`cargos_manual` vigentes, suma `num_cargos`) | **167** ✓ agregado |
| Claves (planta,código,grado) con MATCH completo | **3** |
| Claves con MATCH PARCIAL | **24** (162 empleos) |
| Empleos con nivel jerárquico incorrecto en BD | **≈ 24** |
| Competencias normativas únicas en manuales | **24** |
| Competencias en BD | **14** (11 alineadas, 3 sin respaldo) |
| Competencias del manual FALTANTES en BD | **13** (incl. *Transparencia*, común formal) |
| Conductas de comunes conformes al manual | **0 de 4** (textos genéricos distintos) |
| Objetos BD inexistentes referenciados por el código | **4** (errores SQL latentes) |

**Conclusión general**: el agregado de la planta cuadra (167=167), pero la calidad dato a dato es baja: niveles jerárquicos mal asignados, grados redistribuidos, dependencias duplicadas/corruptas, catálogo de competencias incompleto y conductas que no corresponden al manual. Además hay 4 referencias a objetos BD inexistentes que rompen flujos en producción.

---

## 2. Fuentes de verdad

1. `storage/emulated/0/edl/Manual de Funciones Planta Global - Marzo 2025.docx` (705 KB, 1.997 bloques extraídos)
2. `storage/emulated/0/edl/Manual de Funciones Planta Temporal - Marzo 2025.docx` (301 KB, 523 bloques)

Ambos se declaran «Anexo 01 – Decreto No. 159 de 2024 (septiembre de 2024)»; la etiqueta «Marzo 2025» no aparece en el texto interno (anomalía documental, ver §6). Transcripciones íntegras en `aux/modelo_planta_global.md` y `aux/modelo_planta_temporal.md`.

**Prevalencia aplicada**: MANUALES > CÓDIGO > BD > SUPUESTOS.

## 3. Metodología

1. Extracción DOCX→texto (stdlib Python, párrafos + tablas con orden preservado).
2. Lectura completa de ambos documentos y construcción de modelo normativo estructurado (2 subagentes, transcripción literal).
3. Auditoría de código (1 subagente): rastreo UI→endpoint→servicio→repositorio→BD, con `archivo:línea`.
4. Auditoría de BD (1 subagente): esquema, catálogos, duplicados, huérfanos (solo SELECT).
5. Comparación determinista manual↔BD por clave `(planta, código, grado)` con normalización de tildes/plural/erratas documentales (script en `/tmp`, conservando valores originales en el informe).
6. Clasificación con las 9 categorías exigidas. Ninguna ausencia documental se trató como «debe eliminarse» (Fase 8).

## 4. Estructura de Planta Global (normativa)

- **125 empleos** en 10 dependencias: Despacho (6), Gobierno y Participación Ciudadana (10), Hacienda (17), Planeación OTV (16), Educación y Cultura (9), Salud y Protección Social (17), Tránsito y Transporte (16), General y Servicios Administrativos (20), Agricultura y Medio Ambiente (9), Infraestructura Física (5).
- Niveles: Directivo (N=0), Asesor (N=1), Profesional (N=2), Técnico (N=3), Asistencial (N=4).
- Códigos de grupo: 005 Alcalde · 009 Director Financiero · 020 Secretario (9) · 039 Gerente C.Interno/PDET · 091 Tesorero · 115 Jefe Prensa · 202 Comisario · 219 PU (25) · 303 Insp. Policía · 312 Insp. Tránsito · 314 Téc. Operativo (8) · 340 Agente Tránsito (8) · 367 Téc. Administrativo (38) · 407 Auxiliar (25) · 438 Secretaria Ejecutiva · 470 Aux. Servicios Generales · 477 Celador.
- 100 fichas individuales (agrupan 125 empleos), ~1.716 funciones esenciales.
- **Anomalías del propio manual**: códigos no únicos (identificador real = denominación+código+grado); Gerente PDET grado 00 vs G=1; auxiliares de Salud con grado «0»; erratas «SECRETERÍA», «Trasparente»; 15+ fichas con competencias de otro nivel; ficha Alcalde sin competencias; texto duplicado Gobierno↔Inspección; ninguna ficha define competencias funcionales.

## 5. Estructura de Planta Temporal (normativa)

- **42 empleos** en 6 dependencias: Gobierno 7, Hacienda 8, Planeación 3, Educación 10, Salud 12, Tránsito 2.
- Composición: PU 219 (7, grado 0), Téc. Administrativo 367 (6, grado 1), Téc. Operativo 314 (8, grado 1), Agente Tránsito 340 (2, grado 1), Auxiliar 407 (19, grado 0).
- 21 fichas (cobertura 100 %). Niveles: Profesional 7, Técnico 16, Asistencial 19.
- **Anomalías del propio manual**: 20/21 fichas declaran naturaleza «Carrera Administrativa» siendo planta temporal; grados escritos «0/00/1/01»; dependencias con nombres inconsistentes entre tabla y fichas.

## 6. Comparación Global vs Temporal

| Aspecto | Global | Temporal |
|---|---|---|
| Empleos | 125 | 42 |
| Comunes formales | 4 (con *Transparencia*) | 4 (idénticas) |
| Set «comunes» usado en fichas | 6, **sin Transparencia** | 6, sin Transparencia (7 fichas además omiten *Compromiso con la organización*) |
| Comportamentales Profesional | Aporte técnico-profesional, Comunicación efectiva, Gestión de procedimientos, Instrumentación de decisiones | Mayoría usa set de Técnico («Confiabilidad Técnica Disciplina Responsabilidad»); solo 1 ficha usa el set canónico |
| Comportamentales Técnico/Asistencial | 3 y 3 específicas por nivel | Mismo set replicado para ambos niveles (contradice «mínimas por nivel») |
| Competencias funcionales | No definidas | No definidas |
| Naturaleza declarada | Mixta (LN, carrera, periodo) | 20/21 «Carrera Administrativa» (incoherente con temporalidad) |

**Regla**: los datos de ambos manuales NO deben fusionarse sin conservar el origen `PLANTA_GLOBAL`/`PLANTA_TEMPORAL` (la BD sí lo hace con `cargos_manual.planta` ✓).

## 7. Auditoría de cargos (matriz)

Metodología: 66 filas normativas vs 127 filas BD, comparadas por `(planta, código, grado)` con normalización de plural/erratas. Detalle completo en `/tmp/comparacion_cargos.json` (regenerable con script de auditoría).

**Resultado**: 3 MATCH · 24 MATCH PARCIAL (162 empleos) · 1 FALTA (2 empleos) · 0 NO RESPALDADAS · 0 DUPLICADOS por clave.

### 7.1 MATCH (EXISTE_Y_COINCIDE)
| Clave | Cargo | Empleos |
|---|---|---|
| global/005/03 | Alcalde | 1 |
| global/039/02 | Gerente de Control Interno | 1 |
| global/202/02 | Comisario de Familia | 1 |

### 7.2 Nivel jerárquico incorrecto en BD (CONTRADICE_EL_MANUAL)
| Clave | Cargo | Nivel manual | Nivel BD | Empleos |
|---|---|---|---|---:|
| global/312/03 | Inspector de Tránsito | técnico (3) | **asistencial** | 1 |
| global/340/01 | Agente de Tránsito g1 | técnico (3) | **asistencial** | 7 |
| global/340/02 | Agente de Tránsito g2 | técnico (3) | **asistencial** | 1 |
| global/367/03 | Téc. Adm. Gestión Documental | técnico (3) | **asistencial** | 1 |
| temporal/314/01 | Téc. Operativo Monitores | técnico (3) | **asistencial** | 8 |
| temporal/340/01 | Agente de Tránsito | técnico (3) | **asistencial** | 2 |

Total ≈ 20 empleos con nivel erróneo + los detectados en fichas del manual (§4). El nivel determina competencias comportamentales (cuando exista la regla), por lo que es dato maestro crítico.

### 7.3 Grados redistribuidos (DATO_INCORRECTO)
| Código | Manual | BD |
|---|---|---|
| 219 PU grado 2 | **10** | **4** |
| 219 PU grado 1 | **15** | **21** |
| 367 TA grado 4 | **1** | **4** |
| 367 TA grado 2 | **36** | **33** |
| 407 Aux grado 2 | **23** | **25** (absorbe los 2 de grado 0 de Salud) |
| 407 Aux grado 0 (Salud) | **2** | **0** (FALTA como grado 0) |

### 7.4 Denominaciones (MATCH PARCIAL mayormente legítimo)
La BD enriquece el genérico del manual con la denominación de la ficha («Secretario de Despacho – Gobierno», «PU – Coordinador»). Esto es **deseable** pero debe validarse contra las fichas. **Corruptas** (DATO_INCORRECTO, truncado de seed):
- `cargos_manual` id 43: «…y Persuasivo.» (debería ser «PU – Cobro Coactivo y Persuasivo»)
- id 91: «…Comisaria de» (truncado)
- «Secretario de Despacho – Planeación,» y «– Transito y» (truncados)

### 7.5 Dependencias (DATO_INCORRECTO/DUPLICADO)
- Manual: 10 dependencias. BD: **18**, porque sub-unidades se modelaron como dependencias (Comisaria, Comunicaciones, Control Interno, Inspección, Jurídica, Sisbén, Tesorería).
- **Duplicidad funcional**: DEP-012 y DEP-013 son dos «Secretaría de Planeación…».
- Erratas: DEP-016 «Secretaria**,** de Hacienda»; «Oficina de Juridica»; «Transito» sin tilde en varias.
- Gerente PDET (039/01): manual lo ubica en **Planeación**; BD en **Despacho del Alcalde** (CONTRADICE).
- Inspector de Policía (303): manual en **Gobierno**; BD en **Inspección** (CONTRADICE — coherente con el texto duplicado del manual, REQUIERE_VALIDACION).

### 7.6 Naturaleza del cargo (REQUIERE_VALIDACION)
- BD global: 100 carrera + 13 LN-remoción + 3 periodo_fijo. Los 3 periodo_fijo son Alcalde, **Gerente de Control Interno y Gerente PDET** — los dos últimos como «periodo fijo» carece de respaldo visible en el manual (sus fichas deben validarse).
- BD temporal: 9 «temporal» + 2 «carrera». El manual temporal declara 20/21 fichas como «Carrera Administrativa» (anomalía interna del manual). Ninguna de las dos partes es consistente: **REQUIERE_VALIDACION** humana.

## 8. Auditoría de dependencias

Ver §7.5. Adicionalmente: solo **1 de 18** dependencias tiene `jefe_id` en BD, lo que impacta la regla de negocio «evaluador = jefe de dependencia». 37 usuarios activos (17 %) sin dependencia ni cargo asignado.

## 9. Auditoría de competencias (Fase 6 — rigurosa)

### 9.1 Inventario comparado

| Categoría | Manual (Global=Temporal) | BD (`competencias`) | Diagnóstico |
|---|---|---|---|
| Comunes formales | Orientación a resultados; Orientación al usuario y al ciudadano; **Transparencia**; Compromiso con la organización | ORI_RES ✓; ORI_USU ✓; **— FALTA**; CMP_ORG ✓ | 3 EXISTE_Y_COINCIDE + 1 FALTA_IMPLEMENTAR |
| «Comunes» de fichas | + Aprendizaje continuo; Trabajo en equipo; Adaptación al cambio | APR_CONT ✓; TRB_EQP ✓; ADP_CAM ✓ | 3 EXISTE (nombres con tilde inconsistente: «Adaptacion», «Orientacion») |
| Comportamentales Directivo/Asesor (7) | Visión estratégica; Liderazgo efectivo; Planeación; Toma de decisiones; Gestión del desarrollo de las personas; Pensamiento Sistémico; Resolución de conflictos | TOM_DEC ✓; LIDER ≈ «Liderazgo»; PLANE ≈ «Planeación y organización»; 4 FALTAN | 1 coincide + 2 parciales + 4 FALTA |
| Comportamentales Profesional (4) | Aporte técnico-profesional; Comunicación efectiva; Gestión de procedimientos; Instrumentación de decisiones | APR_TEC ≈; COM_EFEC ✓; 2 FALTAN | 2 coinciden + 2 FALTA |
| Comportamentales Técnico (3) | Confiabilidad; Disciplina; Responsabilidad | **ninguna** | 3 FALTA |
| Comportamentales Asistencial (3) | Manejo de la información; Relaciones interpersonales; Colaboración | **ninguna** | 3 FALTA |
| Solo en BD (sin respaldo manual) | — | Conocimiento del entorno; Iniciativa; Pensamiento estratégico | 3 EXISTE_PERO_NO_ESTA_RESPALDADO (provienen del D. 2539/2005, no del manual Carepa) |

**Totales**: manuales 24 únicas → BD cubre 11 (8 exactas + 3 variantes de nombre) · **13 FALTAN** · 3 sin respaldo.

### 9.2 Conductas asociadas (CONTRADICE_EL_MANUAL / DATO_INCORRECTO)

El manual transcribe conductas literales para las 4 comunes (p. ej. Orientación a resultados: «Cumple con oportunidad en función de estándares, objetivos y metas… Asume la responsabilidad por su resultado…»). La BD tiene 5 conductas por competencia (70 total) pero con **textos genéricos propios que no corresponden al literal del manual** (verificado en `conductas` para ORI_RES: «Alcanza los objetivos propuestos con calidad y en los tiempos establecidos», etc.). Impacto: la valoración de compromisos comportamentales se hace sobre conductas que no son la norma.

### 9.3 Asignación por nivel (FALTA_IMPLEMENTAR)

El código referencia `competencias_comunes_map` y la vista `v_competencias_por_nivel` (`CompetenciaRepository.php:36-59`) que **no existen en la BD**; el flujo principal del evaluador (`ConcertarCompromisos.tsx:877` → `GET /competencias/por-nivel`) falla silenciosamente. No hay tabla que asocie nivel jerárquico → competencias comportamentales.

### 9.4 Confusión de categorías

El sistema solo maneja compromisos `tipo='comportamental'` + `competencia_codigo`; no distingue común vs comportamental por nivel (las trata igual), y las «funcionales» no existen ni en manual ni en sistema (vacío compartido, AMBIGUO/REQUIERE_VALIDACION). No se detectó conversión indebida función→competencia en código (cero hardcode de nombres en BE/FE ✓).

## 10. Auditoría de funciones esenciales

- Manual: ~1.716 funciones en 100 fichas (Global) + fichas Temporal.
- Sistema: EAV `cargos_manual_detalle` (564 filas) con secciones funciones/contribuciones/conocimientos/competencias/requisitos I–VIII por cargo.
- **DATO_INCORRECTO (seed corrupto)**: competencias del manual concatenadas sin separadores en el EAV (el modal de FE no puede partirlas); textos «COMPETENCIAS COMPORTAMENTALES» incrustados dentro de secciones de funciones/conocimientos; denominaciones truncadas.
- Cobertura: 142 cargos sembrados vs 167 empleos normativos; las fichas multi-cargo del manual (p. ej. TA Programas Sociales ×8) están representadas por denominación específica, lo que explica parte de la diferencia de filas.

## 11. Auditoría de criterios de desempeño (contribuciones individuales)

Presentes en el EAV por cargo (sección contribuciones). Sin reglas de cálculo asociadas. El manual las define por ficha; no se detectó comparación automatizada 1:1 (volumen); se recomienda validación muestral al implementar (REQUIERE_VALIDACION).

## 12. Auditoría de conocimientos

- El código referencia `conocimientos_catalogo` y `cargos_manual_conocimientos` que **no existen** (`CargoManualRepository.php:107-118`); `GET /cargos-manual/{id}` ejecuta siempre `conocimientos()` (`CargoManualService.php:37`) → **riesgo de error SQL en el detalle de ficha** (FALTA_IMPLEMENTAR / BUG).
- BD tiene `nucleos_basicos_conocimiento` (55 NBC) ✓ para requisitos académicos, pero los conocimientos del perfil viven como texto libre en el EAV.

## 13. Auditoría de requisitos académicos

- `cargos_manual_requisitos` existe **estructurada pero vacía (0 filas)**; los requisitos reales (título + NBC + experiencia) están como texto libre en el EAV (requisitos I–VIII).
- NBC/SNIES: manual define 8 áreas; BD 55 núcleos (catálogo SNIES amplio) — compatible, sin mapeo a cargos.
- **FALTA_IMPLEMENTAR**: modelo relacional requisito↔cargo (título, NBC, tipo experiencia, años).

## 14. Auditoría de experiencia

Ídem §13: texto libre en EAV. El manual usa la tipología del D. 785/2005 (profesional/relacionada/laboral/docente) documentada en el marco conceptual; el sistema no tipifica experiencia (no hay campos). FALTA_IMPLEMENTAR (P2: solo si se requiere validación de requisitos en UI).

## 15. Auditoría de base de datos

Motor MariaDB/MySQL, 43 tablas (modelo nuevo con FKs + legacy `funcionarios/responsables/tbl_cargo/tbl_detalle_cargo/ext_dependencias` sin uso en código).

**Integridad**: 0 huérfanos en el modelo nuevo ✓. Legacy roto (153/262 responsables con `id_tbl_cargo=0`) pero sin impacto funcional.

**Problemas de datos**:
| ID | Problema | Evidencia |
|---|---|---|
| BD-01 | `parametros.jwt_secret` = placeholder «cambiar_esto_por_un_secret_seguro…» expuesto vía ParametroController | P1 seguridad |
| BD-02 | Asignación vigente a cargo eliminado: `usuario_cargo_manual.id=20` → usuario 186 → cargo 91 (soft-deleted, denominación truncada) | DATO_INCORRECTO |
| BD-03 | Datos de prueba en producción: `codigo='TEST-001'`, meta «XD», usuarios «Test» | DATO_INCORRECTO |
| BD-04 | Duplicados exactos: «Agente de Tránsito» ×2; «Auxiliar Adm. Asistente» ×9 (guion `-` vs `–` rompe dedup) | DATO_DUPLICADO |
| BD-05 | Tildes/erratas: «Adaptacion», «Orientacion», «Secretaria, de Hacienda», «Transito», «Juridica» | DATO_INCORRECTO |
| BD-06 | 15 filas soft-deleted en cargos_manual (127 vigentes de 142) | informativo |
| BD-07 | 1/18 dependencias con jefe_id | FALTA_IMPLEMENTAR (regla evaluador-jefe) |
| BD-08 | 37 usuarios sin cargo/dependencia | DATO_INCOMPLETO |

## 16. Auditoría de backend

- Flujo correcto Controller→Service→Repository, soft-delete respetado, sin hardcode de competencias ✓.
- **4 objetos BD inexistentes referenciados** (ver §9.3, §12) — máximo riesgo operativo.
- Cálculo normativo duplicado FE/BE: fórmula (puntos−4)/11×100, umbrales 90/65, ponderación 85/15, valoración de conductas 4/7/10/13 — presentes en `EvaluacionService.php` y duplicados en `EvaluarPage.tsx` (riesgo de divergencia).
- `parametros.peso_funcionales/comportamentales` existen pero el cálculo lee ENV (`EvaluacionService.php:300-301`) — parámetros muertos.
- Regla CNSC mín-3/máx-5 competencias validada solo en frontend; backend acepta cualquier cantidad.

## 17. Auditoría de frontend

- `Indice.tsx`/`Ficha.tsx` (ManualFunciones) consumen `/cargos-manual*` correctamente; solo lectura (sin CRUD) — el manual no exige gestión, FALTA solo si se requiere administración.
- `AdminUsuarios.tsx:85-97` hardcodea 5 niveles (omite **asistente**) y 3 de 6 naturalezas → inconsistente con catálogos BD (CONTRADICE el modelo de datos propio; el manual usa los 5 niveles).
- Duplicación de lógica de cálculo/escalas en `EvaluarPage.tsx` (ver §16).

## 18. Reglas actualmente incorrectas

1. `GET /competencias/por-nivel` y `GET /cargos-manual/{id}` dependen de objetos BD inexistentes (§9.3, §12).
2. Niveles jerárquicos erróneos en ~20 empleos (§7.2) — contaminan cualquier regla futura por nivel.
3. Conductas de competencias comunes no conformes al manual (§9.2).
4. Hardcode de niveles/naturalezas en AdminUsuarios (§17).
5. Ponderación 85/15 leída de ENV en vez de `parametros` (§16) — sin respaldo normativo del manual (el manual no define ponderaciones; AMBIGUO, pero la duplicidad FE/BE sí es defecto técnico).

## 19. Requisitos faltantes (FALTA_IMPLEMENTAR)

1. Competencia común **Transparencia** (+ sus conductas literales).
2. 12 competencias comportamentales por nivel (§9.1) y su matriz nivel→competencias.
3. Conductas literales del manual para las 4 comunes.
4. Tablas `competencias_comunes_map`, `v_competencias_por_nivel`, `conocimientos_catalogo`, `cargos_manual_conocimientos` (o refactor del código que las referencia).
5. Modelo relacional de requisitos (título/NBC/experiencia) — hoy texto libre.
6. Corrección de niveles/grados/dependencias del catálogo de cargos (§7).
7. Jefes de dependencia (17 faltantes).

## 20. Funcionalidades no respaldadas por los manuales (EXISTE_PERO_NO_ESTA_RESPALDADO)

| Funcionalidad | Dónde | Por qué no aparece | Recomendación |
|---|---|---|---|
| Competencias CON_ENT, INICIAT, PEN_EST | `competencias` | Provienen del D. 2539/2005, no del manual Carepa | Mantener como catálogo técnico; **no usar como regla normativa** sin validación |
| Módulos evaluación/compromisos/mejoramiento/evidencias/ausentismos/movilidad/metas | backend completo | El manual define perfiles, no procesos de evaluación | Mantener: son el objeto del sistema (CNSC), fuera del alcance de los manuales |
| Tablas legacy (funcionarios, responsables, tbl_cargo…) | BD | Migración anterior | Plan de retiro; no eliminar sin validación |
| Naturaleza «periodo_fijo» para Gerentes C.Interno/PDET | cargos_manual | Manual no lo explicita claramente | REQUIERE_VALIDACION |
| Enriquecimiento de denominaciones (– Gobierno, – SISBEN…) | cargos_manual | Las fichas sí las soportan; la tabla agregada no | Mantener (mejora), corregir las corruptas |

## 21. Funcionalidades que NO deben eliminarse sin validación

- Todo lo listado en §20.
- Filas soft-deleted de `cargos_manual` (15): pueden ser historial de vinculación (`usuario_cargo_manual` referencia cargos borrados — BD-02).
- Dependencias «extra» (Comisaria, Inspección, Sisbén…): pueden ser estructura real vigente no descrita en el manual.
- Set de competencias 2539/2005: base legal vigente para comportamentales por nivel.

## 22. Cambios que DEBEN IMPLEMENTARSE (DEBE_IMPLEMENTARSE)

Ver backlog §25 (P0-1…P2-2). Resumen: corregir datos maestros (niveles, grados, dependencias, denominaciones truncadas), completar catálogo de competencias con las 13 faltantes + conductas literales de comunes, crear los 4 objetos BD faltantes (o refactor), matriz nivel→comportamentales, modelo de requisitos, jefes de dependencia.

## 23. Cambios que NO deben implementarse (NO_DEBE_QUEDAR_COMO_REGLA)

1. No usar «Pensamiento estratégico» como equivalente de «Pensamiento Sistémico» (conceptos distintos del manual Directivo).
2. No replicar el set «Confiabilidad/Disciplina/Responsabilidad» a niveles que el manual no le asigna (error del propio manual Temporal §6 — no debe institucionalizarse en código).
3. No tomar las conductas genéricas actuales como norma (reemplazar por literales del manual).
4. No marcar planta temporal como «Carrera Administrativa» aunque 20/21 fichas del manual lo digan (contradice la naturaleza temporal declarada; pendiente de resolución documental).

## 24. Cambios que REQUIEREN VALIDACIÓN (REQUIERE_VALIDACION)

1. Naturaleza de Gerente C.Interno/PDET (¿periodo_fijo o libre_nombramiento?).
2. Ubicación del Inspector de Policía (Gobierno vs Inspección — texto duplicado del manual).
3. Grado de auxiliares de Salud (manual dice 0; BD 2) y Gerente PDET (00 vs 1).
4. Distribución de grados PU 219 (10/15 vs 4/21) y TA 367 (1/1/36 vs 4/?/33): ¿error del manual o de la seed?
5. Denominaciones enriquecidas de la BD: validar una a una contra las 100 fichas.
6. Dependencias «extra» de la BD (¿estructura real vigente?).
7. Competencias funcionales: vacías en manual y sistema (¿se definirán?).
8. Ponderación 85/15 y umbrales 90/65: el manual no los define (vienen de CNSC; validar contra rúbrica oficial).

## 25. Backlog priorizado

> **NOTA (fase de validación)**: este backlog fue posteriormente clasificado en las secciones **§33 (aprobado)** y **§34 (bloqueado)** tras resolver los puntos de §24. En caso de duda, prevalecen §33/§34.

| ID | Título | Prio | Fuente | Estado actual | Esperado | Archivos/BD | Complejidad | Riesgo |
|---|---|---|---|---|---|---|---|---|
| P0-1 | Corregir nivel jerárquico en ~20 empleos | P0 | Manual §7.2 | nivel erróneo | nivel según manual | BD cargos_manual | Baja | Medio (reglas por nivel) |
| P0-2 | Crear 4 objetos BD inexistentes o refactor de repos | P0 | — (bug) | SQL falla | consultas operativas | CompetenciaRepository, CargoManualRepository, BD | Media | Alto (flujos principales) |
| P0-3 | Corregir denominaciones truncadas/corruptas (ids 43, 91, Secretarios) | P0 | Fichas manuales | texto truncado | denominación completa | BD cargos_manual | Baja | Bajo |
| P0-4 | Resolver duplicidad Planeación DEP-012/013 y «Secretaria, de Hacienda» | P0 | Manual §4 | 2 dependencias | 1 canónica | BD dependencias + FK | Media | Medio |
| P1-1 | Agregar Transparencia + 12 comportamentales faltantes con conductas literales | P1 | Manual §2-3 | 14 competencias | 24-27 | BD competencias/conductas | Media | Medio |
| P1-2 | Reemplazar conductas genéricas de las 4 comunes por literales del manual | P1 | Manual §2 | textos propios | literales | BD conductas | Baja | Medio (evaluaciones históricas) |
| P1-3 | Matriz nivel jerárquico → competencias comportamentales (BD + endpoint) | P1 | Manual §3 | no existe | regla por nivel | BD nueva tabla + CompetenciaRepository | Media | Medio |
| P1-4 | Corregir grados 219/367/407 según validación (§24.4) | P1 | Manual §7.3 | redistribuidos | según manual | BD cargos_manual | Baja | Medio |
| P1-5 | Asignar jefes de 17 dependencias | P1 | Regla evaluador-jefe | 1/18 | 18/18 | BD dependencias.jefe_id | Media | Medio |
| P1-6 | Corregir hardcode de niveles/naturalezas en AdminUsuarios | P1 | §17 | listas fijas | catálogo BD | AdminUsuarios.tsx | Baja | Bajo |
| P2-1 | Modelo relacional de requisitos (título, NBC, experiencia) | P2 | Manual fichas | texto libre EAV | tablas + carga | BD + CargoManualRepository | Alta | Medio |
| P2-2 | Unificar cálculo 85/15 y escalas en backend único (leer `parametros`) | P2 | §16 | duplicado FE/BE | fuente única | EvaluacionService, EvaluarPage | Media | Alto (regresión) |
| P2-3 | Regla CNSC min-3/max-5 también en backend | P2 | CNSC | solo FE | validación BE | EvaluacionService | Baja | Bajo |
| P2-4 | Normalizar tildes/erratas de catálogos (competencias, dependencias) | P2 | §BD-05 | inconsistentes | consistentes | BD | Baja | Bajo |
| P2-5 | Limpiar datos TEST y asignación a cargo eliminado (BD-02/03) | P2 | — | basura | limpio | BD | Baja | Bajo |
| P3-1 | Rotar `jwt_secret` y retirar del API de parámetros | P3* | seguridad | placeholder | secreto real | BD parametros, ParametroController | Baja | Bajo (*urgente igualmente) |
| P3-2 | Plan de retiro del esquema legacy | P3 | §15 | sin uso | archivado | BD legacy | Media | Bajo |
| P3-3 | Validar 1:1 denominaciones enriquecidas vs 100 fichas | P3 | §24.5 | parcial | validado | BD | Media | Bajo |

**Dependencias**: P0-1 → P1-3 (la matriz por nivel exige niveles correctos). P1-1 → P1-2 → P1-3 (catálogo antes de asignación). P0-4 → P1-5 (jefes sobre dependencias canónicas). P1-4 requiere §24.4. P2-2 requiere congelar regla con negocio.

## 26. Plan de implementación por fases (propuesta, NO ejecutada)

1. **FASE A — Datos maestros de cargos**: correcciones P0-1/P0-3/P0-4/P1-4 vía migración SQL idempotente + regeneración de `full_dump.sql`. Pruebas: conteos por (planta,código,grado) = manual.
2. **FASE B — Catálogo de competencias**: P1-1/P1-2 (INSERT de competencias+conductas literales; UPDATE de conductas de comunes preservando historial con nueva versión). Pruebas: 24 competencias, conductas = literales.
3. **FASE C — Reglas por nivel**: P1-3 + P0-2 (crear tabla `competencias_por_nivel`, vista/consulta de comunes, reparar `conocimientos*`). Pruebas: endpoint `/competencias/por-nivel` responde por nivel.
4. **FASE D — Backend reglas**: P2-2/P2-3/P1-6. Pruebas: unitarias de cálculo, validación CNSC en API.
5. **FASE E — Frontend**: ajustar AdminUsuarios, modal de competencias (separadores), visualización de conductas. Pruebas: flujo de concertación E2E.
6. **FASE F — Requisitos y jefes**: P2-1/P1-5.
7. **FASE G — Regresión**: `bash tests/run_all.sh` + flujo manual de evaluación completa.

## 27. Plan de migraciones de BD (borrador, requiere aprobación)

- `M001_fix_niveles_cargos.sql` — UPDATE nivel por id según §7.2.
- `M002_fix_denominaciones.sql` — UPDATE denominaciones truncadas.
- `M003_merge_planeacion.sql` — reasignar FKs DEP-012→DEP-013 (o inversa, según validación) y soft-delete de la duplicada.
- `M004_competencias_faltantes.sql` — INSERT Transparencia + 12 comportamentales + conductas literales.
- `M005_conductas_comunes.sql` — versionar conductas de las 4 comunes.
- `M006_competencias_por_nivel.sql` — CREATE TABLE + seed según manual §3.
- `M007_objetos_faltantes.sql` — crear `conocimientos_catalogo`, `cargos_manual_conocimientos`, `competencias_comunes_map`, `v_competencias_por_nivel` (o alternativa acordada).
- `M008_limpieza.sql` — datos TEST, BD-02.
Cada migración: transacción, reversible (backup previo), y regeneración de `database/full_dump.sql` al final.

## 28. Plan de pruebas

1. **Datos**: script de conteo (planta,código,grado) BD = manual (167 empleos; tabla §7).
2. **Catálogo**: 24 competencias con conductas ≥ manual; comunes con literales exactos (diff de texto).
3. **API**: `/competencias/por-nivel` por los 5 niveles; `/cargos-manual/{id}` sin error SQL; `/cargos-manual/conteos` por planta.
4. **Flujo**: concertación con competencias del nivel correcto; min-3/max-5 rechazado en BE; cálculo 85/15 idéntico FE/BE.
5. **Regresión**: `bash tests/run_all.sh` verde.

## 29. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Cambiar nivel de cargos altera evaluaciones históricas | Alta | Alto | Migración versionada; no recalcular pasados |
| Reemplazo de conductas rompe compromisos existentes (FK texto) | Media | Alto | Versionar conductas, no borrar |
| Merge de dependencias rompe FKs masivas | Media | Alto | Reasignar FKs primero, soft-delete después |
| Divergencia FE/BE de cálculo al unificar | Media | Alto | Tests de paridad numérica |
| El manual mismo contiene errores (grados 0, niveles mal rotulados) | Alta | Medio | Lista §24 al negocio antes de migrar |
| `jwt_secret` placeholder | — | Crítico seguridad | Rotar ya (independiente de esta auditoría) |

## 30. Matriz de trazabilidad (extracto; completa en aux/)

| ID | Fuente DOCX | Sección/Página | Requisito | Estado actual | Archivo/BD | Estado | Acción |
|---|---|---|---|---|---|---|---|
| T-01 | Global, tabla planta discriminada | §1.1 | Inspector Tránsito N=3 técnico | BD `nivel='asistencial'` | cargos_manual (312/03) | CONTRADICE | M001 |
| T-02 | Global §2 tabla comunes | «Transparencia» | Competencia común | No existe | competencias | FALTA | M004 |
| T-03 | Global §2 | Conductas literales comunes | Conductas de evaluación | Textos genéricos propios | conductas (ORI_RES…) | CONTRADICE | M005 |
| T-04 | Global §3 Directivo | 7 comportamentales | Set por nivel | 4 faltan, sin matriz | competencias + repos inexistente | FALTA_PARCIAL | M004+M006 |
| T-05 | Global §1.1 | Gerente PDET en Planeación | dependencia_id | Despacho del Alcalde | cargos_manual 039/01 | CONTRADICE | M001 |
| T-06 | Global ficha PU Cobro Coactivo | Denominación completa | «…y Persuasivo.» truncada | cargos_manual id 43 | DATO_INCORRECTO | M002 |
| T-07 | Temporal §2 | 42 empleos, grados 0/1 | SUM=42 ✓; grados 0→2 | cargos_manual temporal | MATCH_PARCIAL | M001/validación |
| T-08 | Global §3 Técnico | Confiabilidad, Disciplina, Responsabilidad | No existen | competencias | FALTA | M004 |
| T-09 | Código CompetenciaRepository.php:36-59 | — | v_competencias_por_nivel | Vista inexistente | BD | FALTA (bug) | M007 |
| T-10 | Código CargoManualRepository.php:107-118 | — | conocimientos_catalogo | Tablas inexistentes | BD | FALTA (bug) | M007 |
| T-11 | Manual (ausencia) | — | Módulos evaluación CNSC | Implementados | backend | EXISTE_PERO_NO_RESPALDADO | Mantener |
| T-12 | Global §1.1 vs §1 agregada | Grados PU 219 | 10 g2 / 15 g1 | 4/21 | cargos_manual | DATO_INCORRECTO | Validar §24.4 → M001 |

## 31. Conclusión

El sistema implementa correctamente la **arquitectura** del dominio (planta global/temporal separadas, EAV de fichas, catálogos con FK, sin hardcode de competencias en lógica), pero la **calidad de los datos maestros** y la **fidelidad al contenido normativo** son insuficientes: ~12 % de los empleos tienen nivel erróneo, faltan 13 de 24 competencias normativas (incluida una común formal), las conductas de las comunes no son las del manual, y existen 4 referencias a objetos BD inexistentes que rompen flujos en uso. Ninguna funcionalidad debe eliminarse automáticamente; el 100 % de los «no respaldados» son técnicos/administrativos legítimos o requieren validación. El backlog P0 (4 ítems) es ejecutable de inmediato tras aprobar las validaciones de §24.

---

### Anexos (archivos auxiliares de esta auditoría)

- `aux/modelo_planta_global.md` — transcripción estructurada íntegra del manual Global (5.523 líneas)
- `aux/modelo_planta_temporal.md` — ídem Temporal (908 líneas)
- `aux/auditoria_codigo.md` — inventario de endpoints, reglas con archivo:línea, tablas
- `aux/auditoria_bd.md` — esquema, catálogos, duplicados, integridad

---

## 32. Validación pre-implementación

> Fase ejecutada tras aprobar el diagnóstico. Resuelve con evidencia de los DOCX los puntos de §24. La extracción DOCX no conserva paginación del Word; las citas se referencian por tabla/ficha (ubicación exacta en los anexos). No se ejecutó ningún UPDATE/INSERT/DELETE ni migración.

### 32.1 Hallazgo de seguridad — INDEPENDIENTE Y URGENTE (fuera del alcance normativo)

`parametros.jwt_secret` contiene el placeholder «cambiar_esto_por_un_secret_seguro…» y es legible vía API de parámetros. **No proviene de los manuales ni lo afectan**: es un defecto de configuración. Acción recomendada inmediata (P3-1, aprobado en §33): rotar el secreto en el servidor y excluirlo del endpoint. No se modificó nada en esta fase.

### 32.2 Resolución de los puntos de §24

| ID | Punto | Evidencia DOCX | Estado BD/Código | Decisión | ¿Requiere aprobación? | Impacto |
|---|---|---|---|---|---|---|
| V-01a | Naturaleza Gerente de Control Interno | FICHA 02: «Naturaleza del cargo: **Periodo Fijo**», Jefe: Alcalde municipal | `periodo_fijo` | **RESUELTO: BD correcta.** No modificar | No | Ninguno |
| V-01b | Naturaleza/dependencia/grado Gerente PDET | FICHA 61: «Naturaleza: **Libre Nombramiento y Remoción**», «Dependencia: **Secretaría de Planeación, Ordenamiento Territorial y Vivienda**», «Grado: 00» (errata; tabla de planta §1 dice G=1) | `periodo_fijo`, dependencia **Despacho del Alcalde**, grado 01 | **RESUELTO:** naturaleza → `libre_nombramiento_remocion`; dependencia → Planeación; grado se mantiene 01 (la ficha «00» contradice la tabla agregada del propio manual y 00 no es grado de la serie) | No (resuelto documentalmente) | M001 (ampliar): 1 UPDATE naturaleza + 1 UPDATE dependencia |
| V-02 | Grados PU código 219 | **El manual se contradice**: tabla agregada §1 = 4 g2 / 21 g1; tabla discriminada §1.1 = 10 g2 / 15 g1 (ambas suman 25) | 4 g2 / 21 g1 (coincide con la agregada) | **NO RESOLUBLE DOCUMENTALMENTE** (autocontradicción) | **SÍ** | Bloquea corrección de grados en M001 para 219 |
| V-03 | Grados TA código 367 | Ídem: agregada §1 = 4 g4 / 1 g3 / 33 g2; discriminada §1.1 = 1 g4 / 1 g3 / 36 g2 (ambas suman 38) | 4 g4 / 1 g3 / 33 g2 (coincide con la agregada) | **NO RESOLUBLE DOCUMENTALMENTE** | **SÍ** | Bloquea M001 para 367 |
| V-04 | Grados Aux código 407 | Agregada §1 = **25 g2**; discriminada §1.1 = 23 g2 + 2 con grado «0» (Salud) — el «0» no existe en la serie de grados usada | 25 g2 | **RESUELTO: BD correcta.** El «0» de la discriminada es errata (la tabla agregada y el total aritmético la desmienten). Documentar errata; no «corregir» el manual | No | Ninguno (cierra el «FALTA» 407/00 de §7.3) |
| V-05 | Ubicación Inspector de Policía (303) | FICHA 10: «Dependencia: **Secretaría de Gobierno y Participación Ciudadana**», «Jefe: Secretario de Gobierno…» | dependencia **DEP-005 Inspección** | **RESUELTO:** reasignar el cargo 303 a la dependencia Secretaría de Gobierno (la ficha y la tabla discriminada coinciden; la fila «Inspección» de la BD carece de respaldo para este cargo) | No (resuelto) | M001: 1 UPDATE dependencia. La dependencia «Inspección» NO se elimina (ver V-09) |
| V-06 | Denominaciones 1:1 | 107 denominaciones únicas en fichas; cotejo automatizado: **119 exactas**, 6 truncadas en BD con texto completo en ficha (ids 3→«Jefe oficina de Prensa y Comunicaciones», 16→«PU – Gestión de Talento Humano», 17→«PU – Seguridad y Salud en el Trabajo (SST)», 43→«PU – Cobro Coactivo y Persuasivo», 44→«PU – Manejo de Datos» (FICHA 51), 47→«Auxiliar Administrativo – Asistente Tesorería», 64→«PU – Infraestructura Física - OOPPMM»), 1 variante respaldada por tabla de planta (id 108 «Inspector de Policía 3a a 6a Categoría» = §1 agregada) | 126/127 con respaldo; 7 truncadas | **RESUELTO:** corregir las 7 truncadas con el texto literal de la ficha; id 108 se mantiene | No | M002 (lista cerrada de 7 UPDATE) |
| V-07 | Ponderación 85/15 y umbrales 90/65 | **AUSENTE en ambos DOCX** (búsqueda de «pondera/porcentaje/peso/85» sin resultados normativos) | ENV (`EvaluacionService.php:300-301`) + duplicado en `EvaluarPage.tsx`; `parametros.peso_*` muertos | **NO RESOLUBLE CON LOS MANUALES** (es metodología CNSC, no del manual). La unificación técnica de fuente (P2-2) SÍ puede ejecutarse **sin alterar valores**; el valor 85/15 queda congelado | **SÍ** (solo el valor; no la unificación) | P2-2 aprobado con restricción |
| V-08 | Naturaleza de la planta temporal | Título/acto: «temporal»; pero 20/21 fichas dicen «Carrera Administrativa» (solo Monitores «Temporal») | 9 filas `temporal` + 2 `carrera` | **NO RESOLUBLE** (autocontradicción del manual; requiere acto administrativo) | **SÍ** | Bloquea cualquier UPDATE de naturaleza en temporal |
| V-09 | Dependencias «extra» de la BD (Comisaria, Comunicaciones, Control Interno, Inspección, Jurídica, Sisbén, Tesorería; 18 vs 10 del manual) | El manual describe funciones por dependencia, **no es un organigrama cerrado**; no prohíbe unidades adicionales | 18 dependencias activas | **NO RESOLUBLE DOCUMENTALMENTE** (requiere organigrama/acto vigente). No crear ni eliminar dependencias | **SÍ** | Bloquea P0-4 (merge Planeación) y retiro de dependencias; P1-5 parcial |
| V-10 | Competencias funcionales | Declaradas en el marco conceptual («…conforman las competencias laborales») pero **ninguna ficha las define** | No existen en el sistema | **MANTENER VACÍO.** No inventar competencias funcionales; documentado como vacío normativo compartido | SÍ (decisión de negocio futura) | Ninguno (no-action) |

### 32.3 Resumen de resoluciones

- **Resueltos documentalmente (6)**: V-01a, V-01b, V-04, V-05, V-06, y el componente técnico de V-07 (unificación sin cambio de valor).
- **Siguen bloqueados (4)**: V-02, V-03 (autocontradicción de grados en el manual), V-08 (naturaleza temporal), V-09 (organigrama) + V-10 (no-action).
- **Datos que NO deben modificarse hasta aprobación humana**: grados de cargos 219 y 367 (`cargos_manual.grado`); campo `naturaleza` de los 11 cargos temporales; creación/eliminación/fusión de dependencias; valores de ponderación 85/15 y umbrales 90/65.

## 33. Backlog aprobado para implementación

Ítems que pueden ejecutarse **sin ninguna decisión pendiente** (la evidencia DOCX o la naturaleza técnica los respalda por completo):

| ID | Título | Categoría | Clase (§32) | Notas de ejecución |
|---|---|---|---|---|
| P0-1 | Corregir nivel jerárquico en ~20 empleos (312, 340 g1/g2, 367/03, temporal 314/01 y 340/01) | Datos maestros | A | Respaldo: tablas de planta N=3 + fichas (p. ej. FICHA 10 «Nivel: Técnico»). Precede a P1-3 |
| P0-2 | Crear 4 objetos BD inexistentes o refactor de repositorios | Bug técnico / Arquitectura | A | `competencias_comunes_map`, `v_competencias_por_nivel`, `conocimientos_catalogo`, `cargos_manual_conocimientos` |
| P0-3 | Corregir 7 denominaciones truncadas con texto literal de fichas | Datos maestros | A | Lista cerrada en V-06 (absorbe P3-3) |
| P1-7 (nuevo) | Gerente PDET: naturaleza → `libre_nombramiento_remocion` y dependencia → Planeación; Inspector de Policía → Secretaría de Gobierno | Datos maestros | A | Resuelto por V-01b y V-05 |
| P1-1 | Agregar *Transparencia* + 12 competencias comportamentales con conductas | Normativo | A | Respaldo: §2-3 de ambos manuales |
| P1-2 | Reemplazar conductas de las 4 comunes por literales del manual | Normativo | A | Con versionado (no borrar) |
| P1-3 | Matriz nivel jerárquico → competencias comportamentales | Normativo | A | Después de P0-1 y P1-1 |
| P1-6 | Eliminar hardcode de niveles/naturalezas en `AdminUsuarios.tsx` | Bug técnico | A | Usar catálogos BD |
| P2-1 | Modelo relacional de requisitos (título, NBC, experiencia) | Arquitectura/BD | A | Fuente: secciones requisitos de las 121 fichas |
| P2-2 | Unificar cálculo 85/15 en backend (fuente única) | Arquitectura | A **con restricción** | NO alterar valores (V-07); solo eliminar duplicación FE/BE |
| P2-3 | Validación CNSC min-3/max-5 en backend | Bug técnico | A | |
| P2-4 | Normalizar tildes/erratas de catálogos («Adaptacion», «Orientacion», «Secretaria, de Hacienda», «Transito», «Juridica») | Datos maestros | A | Textos correctos según manuales |
| P2-5 | Limpiar datos TEST y asignación a cargo eliminado (BD-02/03) | Datos maestros | A | Verificar dependencias antes del soft-delete |
| P3-1 | **SEGURIDAD**: rotar `jwt_secret` y excluirlo del API de parámetros | Seguridad | A | **Urgente e independiente de los manuales** |

## 34. Backlog bloqueado por validación

| ID | Título | Bloqueado por | Qué se necesita para desbloquear |
|---|---|---|---|
| P1-4 | Corregir grados 219 y 367 | V-02, V-03 (autocontradicción del manual: agregada vs discriminada) | Acto administrativo o aclaración de Talentos Humanos: ¿cuál tabla prevalece? |
| P0-4 | Resolver duplicidad Planeación DEP-012/013 | V-09 (organigrama) | Confirmar cuál estructura es la vigente y a dónde se reasignan FKs (cargos, usuarios, evaluaciones) |
| P1-5 | Asignar jefes de las 17 dependencias | V-09 + datos orgánicos | Las fichas dan el «Cargo del Jefe Inmediato» (derivable), pero la asignación a usuarios reales requiere validación; 37 usuarios sin cargo agravan el riesgo |
| P3-2 | Retiro del esquema legacy | Investigación | Verificar que ningún proceso externo (reportes, ETL, respaldos) consuma `funcionarios/responsables/tbl_cargo*` |
| — | Naturaleza de los 11 cargos temporales | V-08 | Acto administrativo que resuelva la contradicción «temporal vs Carrera Administrativa» |
| — | Valor de ponderación 85/15 y umbrales | V-07 | Confirmación contra metodología CNSC vigente (no está en los manuales) |
| — | Competencias funcionales | V-10 | Decisión de negocio: definir o dejar vacío permanentemente |

### Clasificación completa de los 18 ítems originales

- **A (implementable ya)**: P0-1, P0-2, P0-3, P1-1, P1-2, P1-3, P1-6, P2-1, P2-2*, P2-3, P2-4, P2-5, P3-1, P3-3 (absorbido en P0-3) + nuevo P1-7.
- **B (depende de §32/§24)**: P1-4 (V-02/V-03), P0-4 (V-09).
- **C (investigación adicional)**: P1-5 (organigrama + usuarios), P3-2 (consumidores legacy).
- **D (contradice DOCX, no implementar)**: ninguno como ítem; aplican las prohibiciones de §23 (no equiparar PEN_EST≡Pensamiento Sistémico, no replicar set técnico a otros niveles, no usar conductas genéricas como norma).

### Categorización de problemas

- **Normativos/funcionales**: competencias faltantes (13), conductas no conformes, matriz por nivel inexistente, ponderación sin fuente normativa, naturaleza temporal ambigua.
- **Datos maestros**: niveles (~20 empleos), grados 219/367 (bloqueados), 7 denominaciones truncadas, duplicidad Planeación, erratas de catálogos, datos TEST, jefes de dependencia.
- **Arquitectura/BD**: 4 objetos inexistentes, requisitos en texto libre (EAV), esquema legacy, cálculo duplicado FE/BE, `parametros.peso_*` muertos.
- **Bugs técnicos**: `GET /competencias/por-nivel` y `GET /cargos-manual/{id}` fallan por objetos ausentes; regla CNSC solo en FE; hardcode de catálogos en AdminUsuarios.
- **Seguridad (independiente)**: `jwt_secret` placeholder expuesto — rotación urgente, sin relación con los manuales.

---

## 35. Implementación Fase A-D

> Ejecución controlada del backlog aprobado en §33. Migraciones en `database/migrations/`, aplicadas al servidor local y consolidadas en `database/full_dump.sql` regenerado. Backup previo: `/tmp/backup_pre_faseABCD_20260824.sql` (1.97 MB).

| Ítem | Cambio realizado | Evidencia | Archivos | BD | Migración | Pruebas | Resultado |
|---|---|---|---|---|---|---|---|
| P0-2 | Creados `competencias_comunes_map` (seed 6 comunes de fichas), `conocimientos_catalogo`, `cargos_manual_conocimientos` (vacíos — sin inventar datos), tabla base `competencias_por_nivel` y vista `v_competencias_por_nivel` (columnas exactas que consume `ConcertarCompromisos.tsx`) | `CompetenciaRepository.php:36-59`, `CargoManualRepository.php:95-118` | — | 4 objetos nuevos + 6 filas seed map | M001 | GET `/competencias/por-nivel`, `/comunes`, `/cargos-manual/1` → 200 sin error SQL | ✅ |
| P3-1 | Eliminada fila muerta `parametros.jwt_secret` (placeholder); blacklist de claves sensibles en `ParametroController` (listar/ver/upsert/masivo); JWT real sigue en `.env` (52 chars, gitignored, sin cambio → sin ruptura de sesiones) | `JwtHelper.php:16` usa ENV, no BD | `ParametroController.php` | parametros −1 fila | M002 | Login OK; `/parametros` sin jwt_secret; `/parametros/jwt_secret` → 403 protegido | ✅ |
| P0-1 | Nivel `asistencial`→`tecnico` en 6 filas (ids 22, 33, 34, 36, 92, 95): Inspector de Tránsito, Agentes de Tránsito g1/g2 global y temporal, Téc. Adm. Gestión Documental, Monitores (~20 empleos) | Tablas de planta N=3 + FICHAS 10/36 y ficha Monitores | — | cargos_manual 6 UPDATE con guardas | M003 | Verificación por id; conteos de planta inalterados (167 empleos) | ✅ |
| P0-3 | 7 denominaciones truncadas → texto literal de ficha (ids 3, 16, 17, 43, 44, 47, 64; lista cerrada V-06, incluido el punto final literal de «…Persuasivo.») | Fichas del Global (líneas 324-3954 del modelo) | — | cargos_manual 7 UPDATE con guardas | M003 | Verificación por id | ✅ |
| P1-7 | Gerente PDET (id 96): naturaleza→`libre_nombramiento_remocion`, dependencia→Planeación DEP-012 (id 17, la que ya aloja 15 cargos; DEP-013 intacta). Inspector de Policía (id 108): dependencia→Gobierno (id 15) + jefe_inmediato literal de FICHA 10 | FICHA 61 y FICHA 10 | — | cargos_manual 2 UPDATE con guardas | M003 | DEP-013 existe aún; naturaleza temporal sin cambios | ✅ |
| P1-1 | 13 competencias nuevas: TRANSP (con definición literal del manual) + 12 comportamentales SIN conductas (el manual no las transcribe; no se inventaron) | Global §2 y §3 | — | competencias +13 (27 total) | M004 | COUNT y SELECT de verificación | ✅ |
| P1-2 | Conductas de las 4 comunes reemplazadas por literales del manual con versionado: 15 genéricas `activo=0` (no borradas), 18 literales insertadas (4+5+5+4) | Global §2 (tabla de comunes) | — | conductas | M004 | 73 activas; compromisos históricos usan snapshot `conductas_json` (sin FK) — sin impacto | ✅ |
| P1-3 | Matriz nivel→comportamentales: directivo=7, asesor=7, profesional=4, técnico=3, asistencial=3. `nombre_json` preserva el literal del manual cuando difiere del catálogo (p. ej. «Liderazgo efectivo», «Aporte técnico-profesional»); NO se equipó Pensamiento estratégico≡Sistémico | Global §3.1-3.5 | — | competencias_por_nivel 24 filas | M004 | `/competencias/por-nivel?nivel=tecnico` → [Confiabilidad, Disciplina, Responsabilidad]; `profesional` → 4 | ✅ |
| P1-6 | Catálogos de niveles/naturalezas en AdminUsuarios ahora se cargan de `/catalogos/niveles` y `/catalogos/naturalezas` con fallback local completo (6 naturalezas vs 3 anteriores) | `AdminUsuarios.tsx:85-97` (hardcode) | `AdminUsuarios.tsx` | — (usa endpoints existentes) | — | `tsc` 0 errores en el archivo; build OK | ✅ |
| P2-2 | Fuente única de lectura: 7 puntos ahora leen `parametros` → ENV → default vía `ParametroHelper` (pesos 85/15, umbrales 90/65, min/max compromisos). **Valores sin cambio** (V-07 respetado). Efecto configurado: `max_compromisos_funcionales` pasa de ENV-default 3 al valor administrado 5 | `EvaluacionService.php:300-301,352-353`; `CompromisoService.php:342+`; `CompromisoComportamentalService.php:472,529` | `ParametroHelper.php` (nuevo), 3 servicios | — (lectura) | — | php -l OK; suites 9/9 PASS | ✅ |
| P2-3 | Regla CNSC min/max ahora efectiva en backend desde `parametros` (min_func=1 configurado, max=5, min_comp=3, max_comp=5) en crear/limites/firmar | `validarLimites`/`validarCompromisosAntesDeFirmar` | 2 servicios | — | — | Suites de validación PASS (23 OK) | ✅ |
| P2-4 | Tildes/erratas: 4 competencias («Adaptación al cambio», «Orientación a resultados», «Orientación al usuario y al ciudadano», «Aporte técnico-profesional») + 3 dependencias («Secretaría de Hacienda», «Oficina Jurídica», «Secretaría de Tránsito y Transporte») | Manuales + regla ortográfica; sin renombrados estructurales | — | competencias, dependencias | M005 | SELECT de verificación | ✅ |
| P2-5 | BD-02: asignación vigente (id 20, usuario 186) hacia cargo 91 soft-deleted desactivada (`vigente=0`, sin borrar). Los datos TEST/«XD» reportados ya no existen en la BD actual (verificado) | Auditoría BD §BD-02/03 | — | usuario_cargo_manual 1 UPDATE | M005 | 0 asignaciones vigentes a cargos borrados | ✅ |
| P2-1 | **Estructura verificada completa** (tabla `cargos_manual_requisitos` + repo + service + endpoint exponen `requisitos: []`). El poblamiento desde texto libre del EAV se difiere: parsear 121 fichas sin inventar datos exige validación humana ficha a ficha | `CargoManualService.php:36` | — | — (ya existía) | — | `/cargos-manual/1` retorna requisitos/conocimientos sin error | ✅ (parcial declarado) |

**Pruebas globales**: `php tests/run_tests.php` 34 OK/0 FAIL · `bash tests/run_all.sh` 9/9 suites PASS · `tsc --noEmit` 0 errores en archivos modificados (errores preexistentes en tests FE del baseline, no relacionados) · `npm run build` OK (39.6s) · Integridad BD: 0 huérfanos (cargos→dependencia, matriz→nivel, matriz→competencia, conductas→competencia) · `full_dump.sql` regenerado (1.99 MB, incluye los 4 objetos y datos corregidos).

## 36. Elementos bloqueados y preservados (NO modificados)

Verificado por consulta directa tras la implementación:

| Elemento bloqueado | Estado preservado |
|---|---|
| Grados 219 (V-02) | 21 empleos g01 + 4 g02 — intactos |
| Grados 367 (V-03) | 33 g02 + 1 g03 + 4 g04 (empleos) — intactos (solo cambió NIVEL de 1 fila 367/03, aprobado en P0-1; grado sin cambio) |
| Merge Planeación DEP-012/013 (P0-4, V-09) | Ambas dependencias existen; DEP-013 con 0 cargos; no se fusionó ni eliminó nada |
| Organigrama / dependencias extra (V-09) | Las 18 dependencias permanecen; no se crearon ni eliminaron |
| Jefes de las 17 dependencias (P1-5) | Sin cambios (solo se fijó `jefe_inmediato` del cargo 303 según FICHA 10, aprobado en P1-7) |
| Naturaleza de los 11 cargos temporales (V-08) | 9 `temporal` + 2 `carrera_administrativa` — intactos |
| Ponderación 85/15 y umbrales 90/65 (V-07) | Valores idénticos; solo cambió la fuente de lectura (parametros→ENV→default) |
| Competencias funcionales (V-10) | Siguen sin definirse; no se creó ninguna |
| Competencias sin respaldo (CON_ENT, INICIAT, PEN_EST) | Presentes, sin uso normativo nuevo |
| Esquema legacy (`funcionarios`, `responsables`, `tbl_cargo*`) | Intacto |
| Filas soft-deleted de `cargos_manual` (15) | Intactas |
| Módulos CNSC de evaluación | Intactos y operativos |

**Declaración de conformidad**: el sistema NO es «100 % conforme» a los manuales. Quedan pendientes los elementos de §34 (grados 219/367, organigrama, jefaturas, naturaleza temporal, ponderación normativa, competencias funcionales) que requieren decisión humana fuera del alcance documental, además de la regresión completa en ambiente de pruebas.

---

## 37. Auditoría post-implementación

> Fase E (post-f351cec). Objetivo: verificar correspondencia con los DOCX y ausencia de regresiones. **Ninguna discrepancia nueva fue corregida automáticamente.**

**Veredicto**: Fases A-D implementadas y verificadas; conformidad normativa final pendiente.

### 37.1 Nuevo hallazgo — BUG P1: creación de compromisos sobre evaluaciones en estado terminal

- **Evidencia**: `POST /compromisos-comportamentales` con `evaluacion_id=10` (estado `calificada`) creó el compromiso id 37; `POST /compromisos/funcional` con la misma evaluación creó el id 39. Ambos fueron soft-eliminados en la limpieza de la prueba.
- **Causa**: `CompromisoService::validarPropuestaPermitida()` (línea 370) solo se invoca en el flujo `enviar()` (línea 145); los flujos `crear()` (funcional, línea 51) y `CompromisoComportamentalService::crear()` no la llaman.
- **Impacto**: permite alterar el paquete de compromisos de una evaluación ya calificada (integridad del proceso CNSC).
- **Clasificación**: P1 (funcional). **NO corregido en esta fase** (instrucción expresa: documentar primero). Artefactos de prueba eliminados (ids 37, 38, 39 con `eliminado_en`).

### 37.2 Hallazgo menor — respuesta engañosa de `PUT /compromisos/{id}`

El endpoint genérico `actualizar` respondió «Compromiso funcional actualizado» aunque ignoró el campo `calificacion` (requiere `PUT /compromisos/{id}/calificar` con `puntaje`). Clasificación: P3 (UX/API). Documentado, sin cambio.

### 37.3 Efecto colateral legítimo de la regresión

La evaluación 24 (evaluado 12, concertación 3) pasó de `pendiente` a `calificada` (82.31, satisfactorio) al completar el flujo E2E en la BD local de desarrollo. Es el resultado esperado de la prueba; los artefactos de prueba intermedios fueron limpiados.

## 38. Auditoría de competencias nuevas (13, 1:1 contra DOCX)

| # | Código BD | Nombre BD | Nombre exacto DOCX | Origen DOCX (ubicación en modelo) | Tipo | Nivel | Definición | Conductas | Veredicto |
|---|---|---|---|---|---|---|---|---|---|
| 1 | TRANSP | Transparencia | Transparencia | Global §2 tabla comunes (línea 136 del modelo; ídem Temporal §4) | Común | Todos | ✓ literal del manual | 5 literales ✓ | **MATCH EXACTO** |
| 2 | VIS_EST | Visión estratégica | Visión estratégica | Global §3.1 (línea 154) y §3.2 (167) | Comportamental | Directivo/Asesor | ✗ (manual no define) | 0 (manual no trae) | **MATCH EXACTO** (nombre; sin definición por diseño) |
| 3 | GEST_DES_PER | Gestión del desarrollo de las personas | ídem | Global §3.1 (158) / §3.2 (171) | Comportamental | Directivo/Asesor | ✗ | 0 | **MATCH EXACTO** |
| 4 | PEN_SIS | Pensamiento Sistémico | Pensamiento Sistémico | Global §3.1 (159) | Comportamental | Directivo/Asesor | ✗ | 0 | **MATCH EXACTO** (no se equiparó con «Pensamiento estratégico» PEN_EST) |
| 5 | RES_CON | Resolución de conflictos | ídem | Global §3.1 (160) | Comportamental | Directivo/Asesor | ✗ | 0 | **MATCH EXACTO** |
| 6 | GEST_PRO | Gestión de procedimientos | ídem | Global §3.3 (182); fichas PU (605, 651) | Comportamental | Profesional | ✗ | 0 | **MATCH EXACTO** |
| 7 | INS_DEC | Instrumentación de decisiones | ídem | Global §3.3 (183) | Comportamental | Profesional | ✗ | 0 | **MATCH EXACTO** |
| 8 | CONFI | Confiabilidad | «Confiabilidad (Técnica)» | Global §3.4 (193) | Comportamental | Técnico | ✗ | 0 | **MATCH PARCIAL** (nombre: el manual añade el paréntesis «(Técnica)» en el consolidado; en fichas aparece «Confiabilidad Técnica») |
| 9 | DISC | Disciplina | Disciplina | Global §3.4 (194) | Comportamental | Técnico | ✗ | 0 | **MATCH EXACTO** |
| 10 | RESP | Responsabilidad | Responsabilidad | Global §3.4 (195) | Comportamental | Técnico | ✗ | 0 | **MATCH EXACTO** |
| 11 | MAN_INF | Manejo de la información | ídem | Global §3.5 (201) | Comportamental | Asistencial | ✗ | 0 | **MATCH EXACTO** |
| 12 | REL_INT | Relaciones interpersonales | ídem | Global §3.5 (202) | Comportamental | Asistencial | ✗ | 0 | **MATCH EXACTO** |
| 13 | COLAB | Colaboración | ídem | Global §3.5 (203) | Comportamental | Asistencial | ✗ | 0 | **MATCH EXACTO** |

**Resumen**: 12 MATCH EXACTO · 1 MATCH PARCIAL (CONFI, variante de nombre documentada) · **0 NO RESPALDADAS · 0 REQUIERE VALIDACIÓN**. Las 12 comportamentales se insertaron sin definición ni conductas porque el manual solo las enlista (no transcribe definiciones ni conductas por nivel): **no se inventó nada**. Migración: M004. Registro: tabla `competencias` (27 total). La matriz `competencias_por_nivel` (24 filas) replica exactamente los conjuntos §3.1-3.5.

## 39. Explicación de cargos «127 vs endpoint 200»

**No existen 200 registros.** El «200» es el **código de estado HTTP 200 (OK)** de `GET /cargos-manual/{id}`, no un conteo. Evidencia:

- `curl -o /dev/null -w "%{http_code}" /cargos-manual/1` → `200` (HTTP estándar de éxito).
- El propio endpoint de listado reporta `total: 127`; `/cargos-manual/conteos` reporta `total_cargos: 127` (116 global + 11 temporal).
- Matemática de filas: 142 filas totales en `cargos_manual` − 15 soft-deleted (`eliminado_en IS NOT NULL`, filtrado por `listarManual`) = **127 vigentes**.
- Empleos normativos: `SUM(num_cargos)` = 125 global + 42 temporal = **167** (los 127 filas agrupan plazas multi-cargo).
- No hay JOIN que multiplique filas: `listarManual`/`buscarPorId` usan `LEFT JOIN dependencias` 1:1 (0 duplicados verificados).

**Conclusión**: 127 filas = 167 empleos = 167 empleos normativos de los manuales. Sin hallazgo.

## 40. Auditoría M001-M005

| M | Objetivo | Tablas | Insertados | Modificados | Desactivados | Guards | Rollback | Evidencia DOCX | Riesgo residual |
|---|---|---|---|---|---|---|---|---|---|
| M001 | 4 objetos BD + vista | competencias_comunes_map, conocimientos_catalogo, cargos_manual_conocimientos, competencias_por_nivel, v_competencias_por_nivel | 6 (map) | 0 | 0 | IF NOT EXISTS / CREATE OR REPLACE; FKs RESTRICT | Sí (DROP documentado en el archivo; sin datos preexistentes tocados) | §2/§3 (set de 6 comunes de fichas) | Bajo: tablas de conocimientos vacías por diseño |
| M002 | Retirar jwt_secret expuesto | parametros | 0 | 0 (1 DELETE acotado con LIKE placeholder) | — | WHERE clave+valor placeholder | Sí (INSERT inverso documentado) | — (seguridad, fuera de DOCX) | Bajo |
| M003 | P0-1+P0-3+P1-7 | cargos_manual | 0 | 15 (6 nivel + 7 denominación + 2 P1-7) | 0 | Cada UPDATE con id+valores esperados (0 filas = alarma) | Sí (valores previos registrados en el informe §35) | Tablas de planta N=3; FICHAS 02/10/36/51/61 y literales de fichas | Bajo |
| M004 | P1-1+P1-2+P1-3 | competencias, conductas, competencias_por_nivel | 13+18+24 | 0 | 15 conductas genéricas (activo=0, NO borradas) | INSERT limpios; UPDATE acotado por codigo+activo | Sí (desactivar nuevas, reactivar 15) | §2 (conductas literales) y §3.1-3.5 (conjuntos por nivel) | Medio: compromisos futuros usarán las literales (esperado) |
| M005 | P2-4+P2-5 | competencias, dependencias, usuario_cargo_manual | 0 | 8 (4 nombres + 3 nombres dep + 1 vigente=0) | 0 (vigente=0 no es borrado) | WHERE id+valor exacto | Sí | Ortografía del manual («Secretaría de Hacienda», etc.) | Bajo |

**Bloqueados intactos tras M001-M005** (verificado por consulta): grados 219 (21/4) y 367 (33/1/4) · DEP-012/DEP-013 sin fusionar · 18 dependencias · jefaturas · naturaleza temporal (9 temporal + 2 carrera) · pesos 85/15 · umbrales 90/65 · competencias funcionales vacías · legacy · soft-deleted (15).

## 41. Regresión E2E (BD local de desarrollo)

| # | Paso | Resultado |
|---|---|---|
| 1 | Login (documento+password) | ✅ token + csrf emitidos |
| 2 | Multi-rol: `PUT /auth/rol` {rol_codigo} | ✅ nuevo token con rolActivo=evaluador (nota: el campo es `rol_codigo`, no `rol`) |
| 3 | Evaluado con cargo/nivel | ✅ usuario 12 → cargo nivel `profesional` |
| 4 | Periodo | ✅ periodo 1 activo (2026-2027, fase concertación) |
| 5 | Concertación 3 (2 funcionales + 3 comportamentales) | ✅ existente, `pendiente` |
| 6 | Competencias por nivel (matriz nueva) | ✅ profesional → [APR_TEC, COM_EFEC, GEST_PRO, INS_DEC]; técnico → [CONFI, DISC, RESP] |
| 7 | Aprobación bilateral (`/concertaciones/3/aprobar-pendientes`) | ✅ 5 compromisos aprobados |
| 8 | Fijación (`/concertaciones/3/fijar`) con CNSC desde `parametros` | ✅ estado `concertada` (2 func ≥ min 1 ≤ 5; 3 comp ≥ min 3 ≤ 5) |
| 9 | Calificación funcionales (`/compromisos/{id}/calificar`, puntaje 0-100) | ✅ 80 y 90 persistidos |
| 10 | Calificación comportamentales (`/compromisos-comportamentales/{id}/calificar`, escala 4-15) | ✅ 12, 10, 14 persistidos |
| 11 | Definitiva (`/evaluaciones/24/definitiva`) | ✅ **notaFunc 71.40** = (80×60+90×40)/100 × 0.85 · **notaComp 10.91** = ((12−4)/11)×100 × 0.15 · **total 82.31 → satisfactorio** (>65, <90) |
| 12 | Persistencia y consultas | ✅ evaluaciones, compromisos, concertaciones consistentes; 0 huérfanos |

**Fórmula verificada contra código**: `EvaluacionService.php:346` implementa exactamente la subescala 4-15 → 0-100 y la ponderación 85/15 (Acuerdo 617/2018, comentario en línea 899). Umbrales 90/65 sin cambio.

## 42. Riesgos residuales

| ID | Riesgo | Clase | Estado |
|---|---|---|---|
| R-1 | BUG P1: crear compromisos (funcional y comportamental) sobre evaluaciones `calificada` — guardia `validarPropuestaPermitida` no invocada en `crear()` | Funcional | **Nuevo, documentado, sin corregir** (requiere fix en `CompromisoService::crear` + `CompromisoComportamentalService::crear`) |
| R-2 | EAV seed corrupto: competencias concatenadas sin separador (p. ej. fila 262 del dump) — el modal FE no puede partirlas | Datos | Pendiente (fuera del backlog aprobado) |
| R-3 | Labels `decreto='815'` sin respaldo DOCX (el manual nunca cita 815/2018) — ver §43.1 | Datos/validación | Requiere validación |
| R-4 | 42/127 cargos vigentes (33 %) sin sección de requisitos en EAV | Datos | Poblamiento diferido (P2-1) |
| R-5 | Rotación del JWT_SECRET real en producción | Seguridad/infra | Pendiente (operación de infraestructura) |
| R-6 | `PUT /compromisos/{id}` responde «actualizado» ignorando `calificacion` | API/UX | P3 documentado |
| R-7 | Elementos §34 bloqueados (grados 219/367, organigrama, jefaturas, naturaleza temporal, ponderación normativa, competencias funcionales) | Normativo | Esperan decisión humana |

## 43. Recomendación para producción

1. **NO desplegar aún**: corregir primero el BUG P1 (R-1) — es un fix pequeño (2 llamadas a `validarPropuestaPermitida`) pero debe pasar por el mismo control (propuesta → aprobación → implementación → prueba).
2. Ejecutar las migraciones M001-M005 en orden contra una copia de producción y repetir la regresión §41 allí.
3. Rotar `JWT_SECRET` en el servidor (operación de infraestructura; el código ya es seguro) y confirmar que `GET /parametros` no expone claves (verificado en código).
4. Validar con Talentos Humanos los puntos §34 antes de cualquier migración de grados/organigrama.
5. Reparar el EAV de competencias (R-2) como siguiente ítem de datos maestros.
6. Después de eso, y solo con la regresión completa verde en staging, declarar conformidad operativa (la conformidad normativa 100 % sigue sujeta a §34).

### 43.1 APR_TEC / decreto 815 (E8) — veredicto: REQUIERE VALIDACIÓN

- **A. ¿El DOCX respalda 2539 inequívocamente?** Parcial: el manual cita el D.2539/2005 (arts. 6-8) como marco de las comportamentales por nivel y ubica «Aporte técnico-profesional» en el nivel Profesional; pero **nunca etiqueta competencias individuales con un decreto**.
- **B. ¿El 815 proviene de fuente histórica válida?** Es metadata del seed original (verificado en el dump del commit base 5871949: `('APR_TEC','Aporte tecnico profesional','Contribución especializada…','815/2018')`). El D.815/2018 modifica formalmente el D.2539/2005, por lo que ambos pertenecen al mismo marco; pero **el DOCX no cita el 815 en ninguna parte** (0 menciones en ambos documentos).
- **C/D. ¿Versiones distintas o validación?** La columna `decreto` es metadata informativa del catálogo (la FE la muestra como badge), no una regla del manual. **Decisión: NO cambiar el dato**; validar con el área normativa si la etiqueta debe unificarse a 2539 (marco citado por el manual) o conservarse como referencia al marco vigente modificado. Mientras tanto es solo display, sin efecto en reglas.

### 43.2 Cobertura de requisitos (E9 / P2-1) — estadísticas

| Métrica | Valor |
|---|---|
| Cargos vigentes | 127 |
| Con `requisitos_estudio` en EAV | 80 (63 %) — Global 78/116 (67 %), Temporal 2/11 (18 %) |
| Con `requisitos_experiencia` en EAV | 88 filas de detalle (todas mencionan años) |
| Con NBC explícito en el texto | 39 |
| Sin ninguna sección de requisitos | 42 (33 %) |
| Filas en tabla estructurada `cargos_manual_requisitos` | 0 |
| Parseables automáticamente con confianza | Parcial: patrones regulares presentes («NBC X. Título de…», «años»), pero formatos heterogéneos entre fichas → **se requiere revisión humana ficha a ficha**; el poblamiento automático masivo se rechaza por riesgo de inventar datos |

---

## 44. Corrección BUG P1 — Inmutabilidad de evaluaciones calificadas

**Causa raíz**: `validarPropuestaPermitida()` (duplicada en `CompromisoService` y `CompromisoComportamentalService`) solo se invocaba en el flujo `enviar()`. Los flujos `crear()`, `actualizar()`, `eliminar()`, `calificar()`, `aprobar/rechazar/devolver()`, `guardar()` (bulk) y las escrituras SQL directas del `CompromisoController` operaban sin verificar el estado de la evaluación.

**Solución — regla centralizada**: nuevo helper `backend/src/Helper/EvaluacionInmutabilidad.php` con la lista de estados terminales **idéntica a la preexistente** (`calificada, cerrada, anulada, aprobada_comision, rechazada_comision` — no se inventaron estados), resolución compromiso→concertación→evaluación (relación inversa: `evaluaciones.concertacion_id`), mensajes coherentes con el guard original y HTTP 400 (el mismo código que ya usaba la guardia).

**24 puntos de aplicación** (todos los que mutan compromisos):

| Archivo | Puntos protegidos |
|---|---|
| `CompromisoService.php` | crear, actualizar, eliminar, calificar, aprobar, rechazar, devolver + dedup de `validarPropuestaPermitida` |
| `CompromisoComportamentalService.php` | crear, guardar (bulk), actualizar, eliminar, calificar, aprobar, rechazar, devolver + dedup |
| `ConcertacionService.php` | aprobarPendientes, rechazarPendientes (bulk) |
| `CompromisoController.php` | aceptarEvaluado, rechazarEvaluado, confirmarConcertacion (enviar), aceptarConcertacionEvaluado, rechazarConcertacionEvaluado (escrituras SQL directas detectadas en la auditoría de rutas alternativas) |

**Excepciones intencionales documentadas** (no son bypass): `PUT /evaluaciones/{id}/guardar` permite re-apertura de evaluaciones finalizadas por diseño (comentario explícito en el código, no muta compromisos); `calificacion-manual` es la vía de anulación administrativa exenta de CSRF por diseño.

**Pruebas** (`tests/test_inmutabilidad.py`, nuevo): **13/13 OK** — A (crear en mutable ✓), B (comportamental en mutable ✓), C/D (crear en calificada → rechazado 400 «La evaluacion esta calificada»), E (PUT en calificada → rechazado), F/F2 (DELETE en calificada → rechazado), G (PUT en mutable → éxito real), H1/H2 (calificar: permitido en mutable, bloqueado en calificada), más la **reproducción exacta del escenario de Fase E** (evaluación 10 calificada → ahora rechazado en ambos tipos). Fixtures autolimpiables (evaluación 25 y compromisos asociados soft-deleted; evaluaciones originales 10/24 intactas).

## 45. Corrección BUG P3 — PUT compromisos

- **Antes**: `PUT /compromisos/{id}` con `calificacion` (campo no permitido) filtraba todo, no actualizaba nada y respondía **«Compromiso funcional actualizado»** (éxito falso, HTTP 200).
- **Ahora**: (1) si la evaluación está terminal → 400 con mensaje de inmutabilidad; (2) si no queda ningún campo válido tras el filtro → **422 «Sin campos validos para actualizar»** (nunca afirma éxito sin efecto). Mismo tratamiento en el comportamental.
- HTTP 400/422: códigos ya empleados por el proyecto (guardias de estado y validación respectivamente); no se inventó un estándar nuevo.

## 46. Matriz final de mutabilidad por estado (estados reales del sistema)

Estados de evaluación observados en código/BD: `pendiente`, `en_proceso`, `calificada`, `cerrada`, `anulada`, `aprobada_comision`, `rechazada_comision`. Los 5 últimos son terminales (lista preexistente, ahora centralizada).

| Operación | pendiente | en_proceso | calificada | cerrada/anulada/aprobada_comision/rechazada_comision |
|---|---|---|---|---|
| Crear compromiso (funcional/comportamental/bulk) | ✅ | ✅ | ❌ 400 | ❌ 400 |
| Editar compromiso | ✅ | ✅ | ❌ 400 | ❌ 400 |
| Eliminar compromiso | ✅ | ✅ | ❌ 400 | ❌ 400 |
| Calificar compromiso | — (requiere concertada) | ✅ | ❌ 400 | ❌ 400 |
| Aprobar/rechazar/devolver compromiso | ✅ (flujo concertación) | ✅ | ❌ 400 | ❌ 400 |
| Enviar / Confirmar concertación | ✅ | ✅ | ❌ 400 | ❌ 400 |
| Fijar | ✅ (con CNSC min/max) | — | — | — |
| Calificar evaluación (PUT) | ✅ → en_proceso | ✅ | — | — |
| Calificación definitiva | — (requiere concertada) | ✅ → calificada | — | — |
| Re-apertura administrativa (`/guardar`) | ✅ | ✅ | ✅ (excepción intencional documentada) | ✅ |
| Anular | ✅ | ✅ | ✅ | ❌ 409 (ya firme) |

---

## 47. Staging

**Commit desplegado**: `07d0b91` (candidato aprobado en Fase F). Sin push.

**Entorno de staging simulado** (no existe servidor remoto de staging; se construyó uno aislado en la máquina local):

| Componente | Valor |
|---|---|
| BD staging | `edl_carepa_staging` (MariaDB 12.3.2), creada desde el dump del commit base `5871949` = estado «producción sin migrar» (43 tablas, 142 filas cargos_manual, 14 competencias, 167 empleos) |
| Servidor | `php -S localhost:8001` (PHP 8.5.1) con ENV sobrescritas: `DB_NAME=edl_carepa_staging`, `JWT_SECRET` propio de staging (64 hex, generado aleatorio, **distinto del de dev**, solo en el proceso, nunca en Git) |
| Frontend | Sin cambios (build verificado) |
| Node | v24.17.0 |

### 47.1 Backup

- Pre-carga: dump baseline `5871949` (1.95 MB) — se neutralizó la directiva sandbox `/*M!999999*/` de MariaDB y una línea de warning de deprecation capturada dentro del dump histórico (hallazgo menor de reproducibilidad: los dumps históricos no cargan sin esa limpieza).
- Post-carga: `/tmp/backup_staging_postcarga_20260824_211024.sql` (1.95 MB) — **legibilidad verificada** cargándolo en una BD desechable (43/43 tablas).

### 47.2 Migraciones (estado inicial: C — sin migrar)

M001→M005 aplicadas en orden, todas limpias. Estado final verificado:

| Verificación | Resultado |
|---|---|
| 4 tablas nuevas + vista | 5/5 |
| `competencias_comunes_map` | 6 |
| `competencias_por_nivel` | 24 (7/7/4/3/3) |
| `competencias` / `conductas` | 27 · 73 activas / 15 históricas |
| `parametros.jwt_secret` | 0 (eliminado por M002) |
| Niveles corregidos (P0-1) | 6/6 |
| Denominaciones (P0-3) | 7/7 |
| Gerente PDET / Inspector (P1-7) | LN-Remoción+DEP-012 · Gobierno |
| **Huérfanos** | **0** (cargos→dep, matriz→competencia) |
| **Empleos** | **167** |

**Conclusión**: las migraciones son **reproducibles desde baseline**: el estado final de staging es idéntico al de desarrollo.

### 47.3 JWT staging

Login emite token firmado con el secreto de staging ✓ · **token de dev (:8000) RECHAZADO en staging (:8001)** (aislamiento criptográfico real) ✓ · token inválido → rechazado ✓ · sin token → rechazado ✓ · fail-fast si falta la variable (verificado en Fase E) ✓. Ningún secreto en Git (`.env` ignorado; secreto staging solo en el proceso).

### 47.4 Regresión E2E completa en staging

login → multi-rol → aprobación bilateral c3 (5 compromisos) → fijación (CNSC min/max desde `parametros`) → calificación funcionales (80/90, escala 0-100) → calificación comportamentales (12/10/14, escala 4-15) → definitiva → **71.40 + 10.91 = 82.31 satisfactorio** — idéntico al esperado matemáticamente y al obtenido en dev. Matriz por nivel operativa (`asistencial` → [Colaboración, Manejo de la información, Relaciones interpersonales]).

### 47.5 Regresión de inmutabilidad (A-I) en staging

`API_BASE=http://localhost:8001 tests/test_inmutabilidad.py` → **13/13 OK**: A ✓, B ✓, C ✓ 400, D ✓ 400, E ✓ 400 (sin éxito falso), F/F2 ✓ 400, G ✓, H1 ✓, H2 ✓ 400, + reproducción del BUG P1 original rechazada. Ídem en dev (13/13).

**Rutas alternativas**: `cargas_masivas` sin referencias en código (tabla muerta); no existen endpoints bulk/import que escriban compromisos fuera de los 24 puntos protegidos.

**Excepciones de diseño verificadas en staging**: `PUT /evaluaciones/24/guardar` sobre calificada → permitido y **reabre a `en_proceso` preservando las notas** (71.40/10.91/82.31) — comportamiento de re-apertura documentado en código (`$actualizar['estado']='en_proceso'`). `calificacion-manual` exenta de CSRF por diseño, sin cambios.

### 47.6 Pruebas automatizadas (baseline registrado)

| Suite | Resultado |
|---|---|
| `tests/test_inmutabilidad.py` (dev) | **13 OK / 0 FAIL** |
| `tests/test_inmutabilidad.py` (staging) | **13 OK / 0 FAIL** |
| `php tests/run_tests.php` | **34 OK / 0 FAIL** |
| `bash tests/run_all.sh` | **9/9 suites PASS** |
| `npm run build` | OK (27.8s) |
| `tsc --noEmit` | errores preexistentes del baseline sin cambios (archivos de test FE y páginas ajenas; ningún archivo FE modificado en Fases E-F) |

### 47.7 Datos de prueba

Todos los artefactos de staging y dev creados para la regresión fueron **soft-deleted y verificados en 0 activos**; las evaluaciones originales (10, 24) permanecen en su estado post-flujo legítimo. Ningún dato normativo contaminado.

### 47.8 Observaciones

1. **Umbrales 90/65**: existían ya como filas en `parametros` (ambas BD) con los mismos valores; `ParametroHelper` ahora los lee de allí **sin cambio de comportamiento** (corrige la imprecisión de fases anteriores que los describía como «solo ENV»).
2. **Reproducibilidad de dumps**: los dumps históricos del repo incluyen una línea de warning y la directiva sandbox de MariaDB que impiden cargarlos directamente (documentado en 47.1) — P3 de infraestructura.
3. **R-2 (EAV corrupto)**: confirmado también en staging (heredado del baseline); permanece en backlog de datos maestros, sin mezclar con §34.

## 48. Estado de preparación para producción

**Requisitos técnicos (cumplidos en staging)**: migraciones reproducibles ✓ · 0 huérfanos ✓ · E2E verde ✓ · suites 9/9 + 13/13 ✓ · build OK ✓ · cálculo 85/15 y subescala 4-15 verificados ✓.

**Requisitos de seguridad (pendientes)**: rotar `JWT_SECRET` de producción (operación de infraestructura; el código ya es seguro) · verificar TLS/CORS del entorno real · confirmar que `GET /parametros` no expone claves en el despliegue real (blindado en código, verificado en staging).

**Requisitos normativos (pendientes, §34 — bloqueados por decisión humana)**: grados 219/367 (autocontradicción del manual) · fusión DEP-012/013 · jefaturas de 17 dependencias · naturaleza de planta temporal · competencias funcionales (vacío normativo) · etiqueta de decreto de APR_TEC.

**Backlog técnico previo a producción (recomendado)**: R-2 EAV corrupto de competencias en `cargos_manual_detalle` (determinar si es histórico o de migración; afecta datos de fichas) · P3 reproducibilidad de dumps · P3 respuesta de `PUT /compromisos/{id}` ya corregida.

**Veredicto**: **STAGING APROBADO**. Producción NO declarada. La conformidad normativa 100 % sigue sujeta a §34. Cadena requerida: STAGING OK ✓ → E2E OK ✓ → JWT producción rotado ⏳ → revisión final de seguridad ⏳ → decisiones humanas §34 ⏳ → auditoría final ⏳.

---

## 49. Hardening de seguridad

Clasificación global Fase H: **🟡 PASS CON OBSERVACIONES** — ninguna vulnerabilidad de inyección ni bypass de la regla de inmutabilidad; 2 hallazgos de diseño que requieren decisión humana (H-02, H-05); configuración de desarrollo que debe cambiarse en producción.

### 49.1 Configuración (H1)

| Ítem | Estado | Acción para producción |
|---|---|---|
| `JWT_SECRET` | OK — 52 chars reales en `.env` (gitignored, verificado con `git check-ignore`) | Rotar (§50) |
| `DB_PASS` | ⚠ VACÍO (aceptable solo en dev local) | Credenciales dedicadas con password |
| `APP_DEBUG` / `APP_ENV` | ⚠ `1` / `development` | `0` / `production` |
| `display_errors` / `log_errors` | ⚠ runtime `1` / `0` | Invertir en producción (php.ini) |
| `CORS_ORIGIN` | ✓ allowlist sin wildcard (el middleware soporta `*` si se configura — no hacerlo) | Mantener allowlist estricta |
| SecurityHeaders | ✓ CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, no-store | Mantener |
| Manejador global de errores | ✓ nunca expone trazas/SQL; mensaje institucional + HTTP 500; detalle solo a log | Mantener |
| Logs vía HTTP | ✓ NO accesibles: `backend/backend.log` está fuera de `public/`; `/backend.log` sirve el SPA; path traversal bloqueado (router sanitiza `..`) | Mantener |
| Secretos hardcodeados en código | ✓ ninguno (grep limpio) | Mantener |
| `.env.example` | ✓ sin secretos reales | Mantener |
| Frontend | ⚠ `VITE_API_URL=/api/v1` (proxy dev) | URL real en el build de producción |

## 50. Auditoría JWT

- **Configuración**: `backend/.env` → `Env::require('JWT_SECRET')` (`JwtHelper.php:16`). Fail-fast si falta.
- **Inyección en producción**: variable de entorno del servicio PHP (php-fpm env / unit file). Nunca en Git ni en BD (M002 + blacklist).
- **Reload**: reiniciar el servicio PHP tras el cambio; `getenv` se lee por proceso, sin caché persistente.
- **Tokens antiguos**: quedan inválidos inmediatamente (JWT stateless, sin revocación) → todos los usuarios re-inician sesión; coordinar ventana.
- **Procedimiento de rotación (NO ejecutado)**:
  1. ANTES: backup del `.env` (`cp .env .env.bak-fecha`, permisos 600); ventana de mantenimiento.
  2. CAMBIO: generar secreto fuera de Git (`php -r 'echo bin2hex(random_bytes(32));'`) e inyectarlo en el entorno del servicio; nunca vía API (blacklist lo impide) ni en el repo.
  3. DESPUÉS: restart + health check (login + `/auth/csrf`).
  4. VALIDACIÓN: login nuevo OK; token anterior rechazado; E2E mínimo.
  5. ROLLBACK: restaurar `.env.bak-fecha` y reiniciar (tokens del secreto nuevo quedan inválidos → re-login).

## 51. Auditoría de autenticación/autorización

Pruebas controladas contra staging (:8001):

| Prueba | Resultado |
|---|---|
| Endpoint sin JWT | ✅ «Token de autenticacion requerido» |
| JWT inválido | ✅ «Token invalido o expirado» |
| Token de dev en staging | ✅ rechazado (aislamiento por secreto) |
| `parametros.editar` sin permiso | ✅ 403 (incluso admin_carepa en este despliegue) |
| Blacklist sensibles (12 casos unit: jwt_secret/JWT_SECRET/token_secret/auth_secret/secret/api_key/mail_password/db_password…) | ✅ todas BLOQUEADAS; legítimas (peso_*, umbral_*, intentos_*) permitidas |
| Anti-IDOR por propiedad | ✅ `CompromisoController:479` filtra `evaluador_id = :uid` para no-admin |
| Guardia inmutabilidad (control positivo) | ✅ DELETE sobre compromiso de evaluación calificada → 400 «La evaluacion esta calificada.» |

### 51.1 HALLAZGO H-02 (ALTO — decisión de diseño, NO corregido)

**El login asigna automáticamente el rol de mayor privilegio como `rolActivo`** (`AuthService.php:63-72`: prioridad `jefe_personal > admin_carepa > comision_evaluadora > jefe_dependencia > evaluador > evaluado`). Un usuario multi-rol (p. ej. `evaluado` + `admin_carepa`) obtiene poder de superadministrador en cada request sin selección explícita: la UI pide elegir rol, la API no lo exige.

- Reproducción: login de usuario con `admin_carepa` → token con `rolActivo=admin_carepa` → `GET /usuarios`, `GET /parametros`, calificar, eliminar compromisos: permitidos (verificado en staging).
- Impacto: el compromiso de credenciales de un usuario multi-rol expone el rol máximo sin fricción; el mínimo privilegio no aplica por defecto.
- Nota: la guardia de inmutabilidad NO fue burlada — el DELETE de prueba ocurrió sobre una evaluación previamente reabierta a `en_proceso` por `/guardar` (excepción de diseño). Control positivo posterior: DELETE sobre evaluación `calificada` → 400.
- Recomendación (decisión humana): exigir `rolActivo=null` en login para multi-rol (403 «Sin rol activo» hasta `PUT /auth/rol`), o documentar formalmente el riesgo aceptado.

### 51.2 HALLAZGO H-05 (MEDIO — decisión de diseño, NO corregido)

`calificarDefinitiva` no valida estado previo: una evaluación `calificada` puede **recalcularse** (`PUT /evaluaciones/{id}/definitiva`; verificado: recalificó la eval 10 con resultado idéntico 88.98 — sin daño porque los compromisos no cambiaron). La inmutabilidad protege los compromisos, no la recalificación. Puede ser intencional (recalificación CNSC tras comisión). Recomendación: definir estado/permiso requerido para recalificar.

## 52. Auditoría SQL e input

| Patrón SQL dinámico | Ubicaciones | Veredicto |
|---|---|---|
| `LIMIT {$porPagina} OFFSET {$offset}` | UsuarioController, MovilidadRepository, CargoManualRepository, BaseRepository | ✅ `(int)` cast + clamp 1-50, o parámetros tipados `int` |
| `ORDER BY {$var}` | 0 ocurrencias | ✅ |
| LIKE con input | siempre `bindValue`/parametrizado | ✅ |
| WHERE condicional propietario/admin | CompromisoController:479 | ✅ placeholders `:uid1/:uid2` |

**Sin inyección SQL identificada.** Input: `SanitizerHelper::sanitizeArray` en controllers; rangos validados en servicio (`puntaje` 0-100, `calificacion` 4-15, `peso` 0-100, `por_pagina` 1-50, enums con `in_array`, `motivo_ajuste` lista cerrada).

## 53. Preparación de producción

Cambios requeridos SOLO en el entorno de despliegue (no en el repo): `APP_DEBUG=0`, `APP_ENV=production`, `display_errors=0`/`log_errors=1`, `DB_PASS` dedicado, `CORS_ORIGIN` dominio real, `VITE_API_URL` real en build FE, rotación `JWT_SECRET` (§50). Checklist completo en §55.

## 54. R-2 EAV corrupto (documentado, NO corregido)

- **Ubicación**: `cargos_manual_detalle`, sección `competencias`.
- **Afectados**: **74 de 75** filas con `comunes[0]` conteniendo las 6 competencias **concatenadas en un solo string** (JSON sintácticamente válido, semánticamente corrupto). Ejemplo literal: «Aprendizaje continúo Orientación a resultados Orientación al usuario y al ciudadano Compro…». 1 fila correcta.
- **Naturaleza**: defecto del seed original (no de migración); heredado por staging.
- **Impacto**: la sección «competencias» de la ficha (UI ManualFunciones) no puede separar competencias en esas 74 fichas. **NO afecta el flujo de evaluación** (usa `competencias`, `competencias_por_nivel`, `conductas`).
- **Clasificación**: P2 — datos maestros, independiente de §34.
- **Estrategia de reparación propuesta (futura, requiere aprobación)**: re-poblar la sección desde los modelos normativos de `docs/auditoria/aux/` (que tienen las listas correctas por ficha) con validación humana por muestra; no parsear el texto corrupto.

## 55. Checklist de despliegue y rollback

### PRE-DEPLOY
- [ ] Backup completo de BD de producción (`mysqldump`, verificar legibilidad cargando en BD desechable)
- [ ] Backup del `.env` de producción (permisos 600, fuera del repo)
- [ ] Verificar estado de migraciones en producción (esperado: C — sin migrar) y aplicar M001→M005 en orden
- [ ] Variables: `APP_DEBUG=0`, `APP_ENV=production`, `DB_*` dedicadas con password, `CORS_ORIGIN` dominio real, `UPLOAD_DIR` fuera de `public/`
- [ ] php.ini: `display_errors=0`, `log_errors=1`
- [ ] `JWT_SECRET` nuevo generado fuera de Git e inyectado en el entorno (§50)
- [ ] Build FE con `VITE_API_URL` de producción
- [ ] Permisos de BD: usuario dedicado sin DDL tras migrar

### DEPLOY
- [ ] Código exacto: commit `07d0b91` (rama `audit/manual-funciones-marzo-2025`) — o el commit aprobado al momento
- [ ] Migraciones M001-M005 ejecutadas y verificadas (objetos, conteos §47.2)
- [ ] Restart del servicio PHP

### POST-DEPLOY
- [ ] Health check: login + `GET /auth/csrf`
- [ ] JWT: token nuevo válido; token previo rechazado
- [ ] E2E mínimo: concertación → fijar → calificar → definitiva en una evaluación de prueba
- [ ] Inmutabilidad: crear compromiso sobre evaluación calificada → 400
- [ ] `GET /parametros` sin claves sensibles
- [ ] Logs sin errores fatales; BD sin huérfanos; conteos de planta (167 empleos)

### ROLLBACK
- [ ] Código: volver al commit/versión previa y reiniciar
- [ ] BD: restaurar backup pre-deploy (o ejecutar las secciones REVERSIBILIDAD de M001-M005 si solo se revierten objetos)
- [ ] Configuración: restaurar `.env.bak-fecha`
- [ ] JWT: restaurar secreto anterior y reiniciar (re-login general)

### Cadena hacia producción
H OK ✓ → revisión humana de seguridad ⏳ → rotación JWT_SECRET ⏳ → resolución §34 por Talento Humano ⏳ → decisión final de despliegue ⏳ → auditoría post-producción ⏳.

### §34 — confirmación
Permanece 🔒 BLOQUEADO e intacto: grados 219 (21/4) y 367 (33/1/4) · DEP-012/DEP-013 sin fusionar · organigrama (18 dependencias) · jefaturas pendientes · naturaleza temporal (9+2) · 85/15 · 90/65 · competencias funcionales vacías · P2-1 sin poblar · APR_TEC/815 REQUIERE VALIDACIÓN.

---

## 56. Corrección H-02 — Selección de rol con mínimo privilegio

**Causa raíz**: `AuthService::login` auto-asignaba el rol de mayor privilegio (`jefe_personal > admin_carepa > …`) como `rolActivo` para usuarios multi-rol. Además, **dos fallbacks** convertían `null` en un rol real: `JwtHelper.php:40` (`$rolActivo ?? ($roles[0] ?? null)`) y `AuthMiddleware.php:65` (idéntico) — por eso el claim del JWT siempre terminaba con un rol activo.

**Solución (3 archivos)**:

| Archivo | Cambio |
|---|---|
| `AuthService.php` | Login: 1 rol → se activa automáticamente; multi-rol → `rolActivo = null` (selección explícita exigida) |
| `JwtHelper.php` | Eliminado fallback `roles[0]`: el claim `rol_activo` respeta `null` |
| `AuthMiddleware.php` | Eliminado fallback `roles[0]`: `rol_activo` null permanece null → `PermissionMiddleware` responde 403 «Sin rol activo» hasta selección |

**Autoridad del backend**: `cambiarRolActivo` ya validaba pertenencia (`in_array` contra roles de BD → 403 «El usuario no tiene asignado el rol X») — no se puede fabricar rol desde el frontend. Sin roles nuevos, sin estados nuevos.

**Frontend sin cambios**: `Login.tsx` ya enruta multi-rol a `/seleccionar-rol` por `roles.length > 1` (independiente del backend); `SelectRolePage` → `PUT /auth/rol` establece el rol real. El rol local de `AuthContext` (localStorage) es solo display; la autoridad es el claim del token.

**Pruebas H-02 (dev y staging)**:

| Caso | dev | staging |
|---|---|---|
| A. Un rol → login correcto con rol activo | ✅ | ✅ (admin_carepa en staging) |
| B. Multi-rol → `rolActivo` null (respuesta y claim JWT) | ✅ null/null | ✅ null/null |
| C. Seleccionar rol permitido → OK + token nuevo | ✅ | ✅ |
| D. Seleccionar rol ajeno → 403 «El usuario no tiene asignado el rol…» | ✅ | ✅ (demostrado: `admin_carepa` rechazado a LUSELY) |
| E. Fabricar rol por payload | ✅ imposible (backend valida contra BD) | ✅ |
| F. `evaluado+admin_carepa` NO entra como admin | ✅ (rolActivo null; `GET /usuarios` → denegado) | ✅ |
| G. Endpoint administrativo sin rol activo → denegado | ✅ | ✅ |

## 57. Corrección H-05 — Recalificación bloqueada

**Investigación de callers**: `calificarDefinitiva` tiene 2 invocadores: el endpoint `PUT /evaluaciones/{id}/definitiva` (permiso `evaluaciones.evaluar`) y el método interno `finalizar()` — que **ya exige estado `en_proceso`** antes de llamarlo, por lo que la guardia no lo afecta. **No existe flujo administrativo legítimo de recalificación por este endpoint**; la vía administrativa explícita y auditada es `calificacionManual` (exenta de CSRF por diseño, bloquea estados en firme `cerrada/aprobada_comision/anulada`, registra en `AuditoriaService`) — se mantiene como única vía.

**Solución**: guardia centralizada reutilizada (sin duplicar lógica): `\App\Helper\EvaluacionInmutabilidad::asegurarMutable($id, 'recalificar')` al inicio de `calificarDefinitiva` + nuevo mensaje `'recalificar' => 'No se puede recalificar la evaluacion. La evaluacion esta %s.'` en el helper. Primer pase (pendiente/en_proceso) → permitido; re-invocación sobre `calificada`/terminales → 400.

**Pruebas H-05**:

| Caso | dev | staging |
|---|---|---|
| Recalificar evaluación `calificada` → 400 «No se puede recalificar la evaluacion. La evaluacion esta calificada.» | ✅ (eval 10) | ✅ (eval 24) |
| `finalizar` (caller interno) intacto | ✅ (suites) | ✅ (E2E mínimo) |
| `calificacionManual` (vía administrativa) sin cambio | ✅ (suites) | — |

## 58. Regresión final

| Suite / prueba | Resultado |
|---|---|
| `php tests/run_tests.php` | **35 OK / 0 FAIL** (34 previos + 1 nuevo «Selección de rol»; adaptación justificada: el test operaba sin rol seleccionado confiando en el auto-asignado que H-02 elimina — ahora selecciona `admin_carepa` explícitamente vía `PUT /auth/rol`, igual que el frontend real; se amplió `api()` para enviar `X-CSRF-Token`) |
| `bash tests/run_all.sh` | **9/9 PASS** |
| `tests/test_inmutabilidad.py` (dev) | **13/13** |
| `tests/test_inmutabilidad.py` (staging) | **13/13** |
| `tsc --noEmit` / `npm run build` | Sin archivos FE modificados (errores preexistentes del baseline) / **build OK** (32s) |
| H-02 A-G (dev + staging) | ✅ tabla §56 |
| H-05 (dev + staging) | ✅ tabla §57 |
| JWT / parámetros / IDOR / SQL / CORS / headers | ✅ controles de Fase H re-ejecutados sin cambios |
| Fixtures | **0 activos** en dev y staging (soft-deleted y verificados) |
| Evaluaciones originales | 10 y 24 `calificada` en ambos entornos, intactas |
| Bloqueados | §34, R-2, 219/367, DEP-012/013, organigrama, jefaturas, naturaleza temporal, 85/15, 90/65, competencias funcionales, P2-1, APR_TEC/815 — **sin cambios** |

**Nota de compatibilidad**: los tokens emitidos antes de H-02 conservan su `rol_activo` original (claim presente); el cambio solo afecta a **nuevos logins** multi-rol, que deberán seleccionar rol — exactamente el flujo que la UI ya implementa.

---

## 59. Pre-Producción Final

**Fecha**: cierre de la fase J. **Commit candidato a producción: `c42d357`** (HEAD de `audit/manual-funciones-marzo-2025`).

### 59.1 GIT (J1)

- Working tree: sin cambios en código (solo `.pids/*.pid` de runtime y archivos untracked preexistentes ajenos al proyecto, nunca tocados).
- HEAD = `c42d357` — candidato exacto ✓.
- Diff `07d0b91 → c42d357`: 8 archivos — exclusivamente H-02/H-05 (`AuthService`, `AuthMiddleware`, `JwtHelper`, `EvaluacionService`, `EvaluacionInmutabilidad`), tests (`run_tests.php` adaptación justificada, `test_inmutabilidad.py` parametrización `API_BASE`) y documentación. Sin secretos, sin cambios no documentados.
- **Sin push** (la rama `audit/manual-funciones-marzo-2025` no existe en el remoto; 9 commits locales) · sin reset · historial lineal intacto.

### 59.2 Tests finales (J2) — ejecución de cierre

| Suite | Resultado |
|---|---|
| `php tests/run_tests.php` | **35 OK / 0 FAIL** |
| `bash tests/run_all.sh` | **9/9 PASS** |
| `tests/test_inmutabilidad.py` (dev) | **13 OK / 0 FAIL** |
| `tests/test_inmutabilidad.py` (staging) | **13 OK / 0 FAIL** |
| `npm run build` | ✅ (48.9s) |
| `tsc --noEmit` | Solo errores preexistentes del baseline (9 archivos: tests FE y páginas nunca modificadas en Fases A-J) |

Errores baseline: declarados, no ocultos.

### 59.3 Staging (J3)

Código servido desde el árbol del candidato. Spot-check de cierre: H-02 B (`rolActivo` null/claim null) ✓ · endpoint admin sin rol → denegado ✓ · cambio de rol → OK ✓ · H-05 recalificación → 400 ✓ · **fixtures activos: 0** ✓ · evaluaciones originales 10/24 `calificada` ✓.

### 59.4 Migraciones para producción (J4) — secuencia preparada, NO ejecutada

Estado esperado de producción: C (sin migrar, baseline `5871949`-equivalente). Secuencia exacta:

```
1. mysqldump <prod> > backup_pre_deploy_<fecha>.sql          # backup
2. mysql <prod> < database/migrations/M001_p0_2_objetos_faltantes.sql
3. mysql <prod> < database/migrations/M002_p3_1_jwt_parametro.sql
4. mysql <prod> < database/migrations/M003_p0_1_p0_3_p1_7_datos_maestros.sql
5. mysql <prod> < database/migrations/M004_p1_1_p1_2_p1_3_competencias.sql
6. mysql <prod> < database/migrations/M005_p2_4_p2_5_normalizacion.sql
7. Verificación: 5 objetos · matriz 24 · competencias 27 · conductas 73/15 ·
   jwt_secret=0 · 6 niveles · 7 denominaciones · PDET/Inspector · 0 huérfanos · 167 empleos
```

Reproducibilidad demostrada en staging (§47.2): estado final idéntico. Rollback documentado dentro de cada archivo M* y en §55.

### 59.5 Backup de producción (J5) — procedimiento, NO ejecutado

- **Comando**: `mariadb-dump --single-transaction --routines --triggers <BD_PROD> > backup_pre_deploy_<fecha>.sql`
- **Ubicación**: fuera del docroot, permisos 600, retención según política municipal.
- **Tamaño esperado**: orden de magnitud del dataset actual ≈ 2 MB comprimible (el de staging: 1.95 MB); medir el real al ejecutar.
- **Legibilidad**: cargar en BD desechable y contar tablas (método validado en G2/G5: 43/43).
- **Restauración**: `mysql <BD_PROD> < backup.sql` tras `CREATE DATABASE`; tiempo estimado: segundos-minutos según tamaño (en staging: < 5 s).
- **Nota P3**: si el dump de producción se genera con `mysqldump` reciente puede incluir la directiva sandbox `/*M!999999*/` — al restaurar, neutralizar esa línea (hallazgo documentado en §47.1).

### 59.6 JWT producción (J6) — NO rotado

Ubicación, inyección, reload, invalidación de tokens, validación y rollback: procedimiento completo en **§50**. El secreto actual de producción debe tratarse como comprometido-hasta-rotar (placeholder histórico documentado). Nunca imprimir valores.

### 59.7 R-2 y §34 (J6)

- **R-2**: documentado (§54), P2, 74/75 filas EAV, **no afecta el flujo E2E validado** (usa tablas relacionales, no el EAV). Separado de §34. Reparación futura con aprobación.
- **§34 verificado intacto al cierre** (staging): 219 = 21/4 · 367 = 33/1/4 · DEP-012/013 presentes sin fusionar · 17 dependencias sin jefatura (sin cambio) · naturaleza temporal 2+9 · competencias funcionales vacías · pesos 85 · umbrales 90/65 · APR_TEC/815 intacto.

## 60. Go/No-Go

| Área | Veredicto | Condición / evidencia |
|---|---|---|
| Código (candidato `c42d357`) | 🟢 GO | Working tree limpio; diff = H-02/H-05 + tests + docs |
| Tests | 🟢 GO | 35/0 · 9/9 · 13/13 · 13/13 · build OK · tsc solo baseline |
| Staging | 🟢 GO | Aprobado (G), re-validado (I) y spot-check de cierre (J) |
| Migraciones | 🟢 GO | M001-M005 reproducibles desde baseline; secuencia §59.4 |
| Backup | 🟢 GO | Procedimiento + verificación de legibilidad validados (§59.5) |
| Rollback | 🟢 GO | Documentado (§55): código, BD, config, JWT |
| Seguridad | 🟡 CONDITIONAL | H-02/H-05 resueltos; **rotación JWT_SECRET de producción pendiente** (§50); revisión humana de seguridad final pendiente |
| R-2 | 🟡 CONDITIONAL | P2 documentado; no bloquea el flujo validado; reparación futura aprobable |
| §34 | 🟡 CONDITIONAL | 🔒 Bloqueado e intacto; **requiere decisión de Talento Humano** (grados 219/367, organigrama, jefaturas, naturaleza temporal, ponderación normativa, competencias funcionales, APR_TEC/815) |
| Producción | ❌ NO ejecutada | Ningún comando contra producción fue emitido |

## Veredicto final

**READY FOR PRODUCTION — CONDITIONAL** ✅

Todos los requisitos **técnicos** están verdes: código candidato probado, suites completas en verde, staging aprobado, migraciones reproducibles, backup/rollback definidos, seguridad hardenizada (H-02/H-05/P1/P3 resueltos y verificados).

Las **condiciones explícitas** antes del despliegue real son externas al código:
1. **Rotación de `JWT_SECRET`** de producción (procedimiento §50, operación de infraestructura).
2. **Revisión humana de seguridad** final sobre este informe.
3. **Resolución de §34** por Talento Humano (no bloquea el deploy técnico, pero define la conformidad normativa).
4. Ejecución del checklist §55 en la ventana de despliegue.
5. Auditoría post-producción.

**NO se declara «producción aprobada» ni «conformidad normativa 100 %».**
