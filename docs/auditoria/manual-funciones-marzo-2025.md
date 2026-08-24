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
