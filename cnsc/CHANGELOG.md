# 📋 CHANGELOG — Carpeta `cnsc/`

> Bitácora de cambios de esta carpeta de documentación.
> Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

---

## [1.2.0] — 2026-06-22

### 🎯 Decisiones de producto D1-D9

Las 9 decisiones de producto que estaban pendientes en `14-futuro-del-proyecto.md` §6 fueron tomadas con defaults justificados. Ver `14-futuro-del-proyecto.md` §6 para justificación completa.

- ✅ D1 — Evidencias: **híbrido** (descriptivo + archivo opcional)
- ✅ D2 — Periodos: **editable** para Carepa (unientidad)
- ✅ D3 — Color: azul Carepa `#0A2B5E`
- ⚠️ D4 — Tipografía: Inter con fallback system-ui
- ✅ D5 — Naming: "EDL Carepa — Alcaldía de Carepa"
- ⚠️ D6 — Plazo: MVP 8 semanas + iteración continua
- ✅ D7 — Design System: Radix UI
- ✅ D8 — i18n: solo es-CO
- ⚠️ D9 — Mobile-first: desktop por ahora, mobile en sprint posterior

D4, D6 y D9 quedan con nota para validación final del director.

### 🔍 Auditoría dirigida completada

Se inspeccionaron los 22 archivos prioritarios. Resultado: **el proyecto está mucho más maduro de lo que sugería FASE3_GAPS.md**. Los 5 bugs críticos P1-P5 están resueltos. La mayoría de gaps C1-C7 también. Las brechas B1, B6, B7, B10, B12 están cubiertas por el backend.

Resultado completo documentado en nuevo archivo `AUDITORIA-DIRIGIDA-2026-06-22.md`.

### 🔴 Hallazgos críticos de la auditoría

1. **A3 / Brecha B13** — `DependenciaController.cambiarEstado()` NO implementado. Pendiente crear endpoint con validación de usuarios asociados.
2. **M4** — `frontend/src/lib/mensajesCNSC.ts` referencia **Resolución 1760 de 2010** (norma derogada) en vez del **Acuerdo 617 de 2018** (vigente). Pendiente actualización.

### 🟡 Hallazgo histórico importante

Los archivos `docs/INFORME_TECNICO_ANALISIS_CNSC.md`, `docs/REDISENO_UX_UI_AUDITORIA.md`, `docs/CONTROLLERS_DOCUMENTACION.md` aparecen **borrados del working tree** (git los marca como `deleted`) pero **no se ha commiteado el borrado**. La auditoría se basó solo en archivos verificables en el working tree + `FASE3_GAPS.md` + git history.

---

## [1.1.0] — 2026-06-22

### 🔧 Corrección crítica en `13-trazabilidad-con-proyecto.md`

**Problema detectado:** durante la primera pasada, el documento referenciaba tres archivos previos (`INFORME_TECNICO_ANALISIS_CNSC.md`, `REDISENO_UX_UI_AUDITORIA.md`, `CONTROLLERS_DOCUMENTACION.md`) que **no existen físicamente** en el proyecto. El único documento de auditoría previo verificable es `FASE3_GAPS.md`.

Además, varios archivos marcados como "faltantes" en el documento original **ya existen** en el proyecto (gracias a trabajo previo del equipo de desarrollo):

- `frontend/src/pages/Compromisos/CompromisosMejoramiento.tsx` ✅ existe
- `frontend/src/pages/Compromisos/ProponerCompromisos.tsx` ✅ existe
- `frontend/src/pages/Compromisos/AjustarCompromisos.tsx` ✅ existe
- `frontend/src/pages/Compromisos/AprobarCompromisos.tsx` ✅ existe
- `frontend/src/pages/Compromisos/FijacionUnilateral.tsx` ✅ existe
- `frontend/src/pages/Compromisos/MisCompromisos.tsx` ✅ existe
- `frontend/src/pages/Compromisos/VerCompromisosPropuestos.tsx` ✅ existe
- `frontend/src/pages/Ausentismos/AusentismoList.tsx` ✅ existe
- `frontend/src/pages/Admin/CargaUsuarios.tsx` ✅ existe
- `frontend/src/pages/Evaluaciones/ComisionEvaluadora.tsx` ✅ existe
- `frontend/src/lib/mensajesCNSC.ts` ✅ existe
- `database/migration_evidencias_descriptivas.sql` ✅ existe

**El proyecto EDL Carepa está más maduro de lo que sugería `FASE3_GAPS.md`.**

### Cambios en `13-trazabilidad-con-proyecto.md`

- Agregada **sección 0** con inventario real verificado del proyecto (25 controllers PHP, 44 páginas TSX, 9 archivos SQL).
- Reemplazadas las acciones "crear archivo nuevo" por **auditorías dirigidas** sobre archivos existentes.
- Removidas las referencias a documentos inexistentes.
- Agregada tabla maestra de auditoría con **22 acciones concretas** priorizadas.
- Conclusión explícita: el proyecto está más cerca del MVP funcional de lo que sugería el gap doc.

### Cambios relacionados

- `00-indice-maestro.md`: ajustada la descripción de `13-trazabilidad-con-proyecto.md` y de "Sobre las transcripciones fuente".
- `14-futuro-del-proyecto.md`: ajustada la nota sobre documentos previos.

---

## [1.0.0] — 2026-06-22

### 🎉 Creación inicial de la carpeta `cnsc/`

**Motivación:** las 26 transcripciones oficiales de la CNSC estaban dispersas en `/data/data/com.termux/files/home/Projects/TI-Carepa/transcripciones_cnsc/` sin un orden navegable ni un cruce con los hallazgos previos del proyecto EDL Carepa. Esta carpeta los consolida.

### ✅ Agregado

#### Documentos temáticos consolidados (derivados de las 26 transcripciones)

- **`00-indice-maestro.md`** — punto de entrada, mapa de la carpeta, navegación.
- **`01-generalidades-y-marco-normativo.md`** — definición de EDL, Acuerdo 617/2018, sistema tipo, fases, consecuencias, recursos, marco normativo completo.
- **`02-roles-y-actores.md`** — los 5 roles del aplicativo CNSC (Jefe de Personal, Evaluador, Evaluado, Cargador, Comisión Evaluadora), asignación automática según naturaleza del cargo, capacidades por rol.
- **`03-periodos-y-etapas.md`** — período anual, períodos de prueba, etapas, evaluaciones parciales eventuales, calificación por omisión (33%), notificaciones.
- **`04-flujo-concertacion.md`** — bilateralidad, plazos 15+3, estructura del compromiso (verbo+objeto+condición), tipos de concertación (concertada/fijada), Comisión Evaluadora, ajuste, propuestas del evaluado.
- **`05-flujo-evaluacion-y-calificacion.md`** — 4 tipos de evaluación, escalas funcionales (1-100) y comportamentales (4-6/7-9/10-12/13-15), preguntas de validación, escala final (Sobresaliente/Satisfactorio/No Satisfactorio), estado pendiente/aprobada/rechazada.
- **`06-evaluacion-parcial-eventual.md`** — 5 causales, razones de separación temporal, plazos 10 días hábiles, excepciones, tratamiento en período de prueba.
- **`07-evaluacion-definitiva.md`** — 5 pasos, factor de ajuste para Sobresaliente (95-99% requiere 2 factores, 100% requiere 1 factor), notificación personal, recursos, calificación mínima por omisión.
- **`08-evidencias.md`** — diseño descriptivo (NO archivos), campos del formulario, listado, permisos de edición, decisión de producto pendiente (alinear / mantener / híbrido).
- **`09-compromisos-de-mejoramiento.md`** — campos del formulario, listado, permisos, decisión arquitectónica crítica (crear tabla separada).
- **`10-modulo-evaluado.md`** — proponer, aceptar/rechazar, ver concertaciones, capacidades resumidas.
- **`11-modulo-jefe-personal.md`** — los 8 módulos del Jefe de Personal (períodos, dependencias, metas, usuarios, ausentismos, evaluaciones, reportes, cargue masivo), lógica condicional del formulario de creación.
- **`12-cambio-administracion.md`** — lineamientos CNSC para transiciones de gobierno, decisiones técnicas, supuestos Carepa.
- **`13-trazabilidad-con-proyecto.md`** — **pieza más importante**: mapea las 18 brechas (B1-B18), 7 inconsistencias (I1-I7), 7 gaps críticos (C1-C7) y 5 hallazgos UX críticos (P-C1 a P-C5) del proyecto contra las transcripciones CNSC específicas que los justifican. **Cobertura 100%.**
- **`14-futuro-del-proyecto.md`** — hoja de ruta consolidada en 7 fases (0-6), criterios de aceptación, estimación de esfuerzo, decisiones de producto pendientes, riesgos, métricas de éxito, próximos pasos.
- **`15-enlaces-y-referencias.md`** — los 26 videos con URLs, marco normativo colombiano completo (Constitución, Leyes, Decretos, Acuerdos CNSC), Anexo Técnico, sistemas de información relacionados, glosario.

### 🔒 Lo que NO se hizo (y por qué)

| Acción NO realizada | Razón |
|---|---|
| **Mover, renombrar o eliminar transcripciones originales** | Las transcripciones son evidencia primaria. Esta carpeta las referencia, no las reemplaza. |
| **Modificar archivos del proyecto** (`backend/`, `frontend/`, `database/`, `test_*.py`) | Esta carpeta es **documentación**, no código. Los cambios de código van en PRs separados, validados por el equipo. |
| **Sobreescribir `INFORME_TECNICO_ANALISIS_CNSC.md`, `FASE3_GAPS.md`, `REDISENO_UX_UI_AUDITORIA.md`** | Estos documentos ya contienen análisis valiosos. `13-trazabilidad-con-proyecto.md` los referencia y los complementa con timestamp literal de cada transcripción. |
| **Implementar código** (páginas faltantes, endpoints, migraciones) | Eso es trabajo de Fase 0-3 (ver `14-futuro-del-proyecto.md`). Esta carpeta solo documenta. |
| **Tomar decisiones de producto** (D1-D9 en `14-futuro-del-proyecto.md`) | Esas decisiones requieren validación del director. |
| **Comprometer** cambios a git | No se solicitó. La carpeta es nueva y debe ser revisada antes de commitear. |
| **Instalar dependencias** (DOMPDF, PhpSpreadsheet, Playwright) | Cambios al `composer.json` y `package.json` requieren validación del equipo. |

### 📊 Métricas

| Métrica | Valor |
|---|---|
| **Archivos `.md` creados** | 16 (00-15 + CHANGELOG) |
| **Tamaño total** | ~125 KB |
| **Transcripciones fuente analizadas** | 26 / 26 = 100% |
| **Brechas funcionales trazadas** | 18 / 18 = 100% |
| **Inconsistencias trazadas** | 7 / 7 = 100% |
| **Gaps críticos trazados** | 7 / 7 = 100% |
| **Hallazgos UX críticos trazados** | 5 / 5 = 100% |
| **Decisiones de producto identificadas** | 9 |
| **Riesgos identificados** | 8 |
| **Fases del roadmap** | 7 (Fase 0-6) |

### 🎯 Próxima versión (1.1.0)

Cuando se ejecuten las Fases 0-3 del roadmap:

- Actualizar `13-trazabilidad-con-proyecto.md` con timestamps reales de cierre de cada brecha.
- Agregar `docs/implementacion/` con bitácora de implementación.
- Vincular commits y PRs a cada brecha resuelta.
- Captura de pantallas del antes/después por flujo.
- Métricas de uso reales (tiempo de evaluación, clics por flujo, etc.).

---

## Convención de versiones

- **MAJOR** (X.0.0): cambios incompatibles o reorganización mayor.
- **MINOR** (0.X.0): nueva documentación o secciones.
- **PATCH** (0.0.X): correcciones, typos, links rotos.

---

## Cómo contribuir

1. Editar el documento afectado.
2. Actualizar este `CHANGELOG.md` con la entrada correspondiente.
3. Mantener el formato y nivel de detalle consistente con el resto.
4. Pedir revisión antes de commitear (PR review).