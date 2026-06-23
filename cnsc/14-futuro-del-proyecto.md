# 🚀 14 — Futuro del Proyecto EDL Carepa (Hoja de Ruta)

> **Propósito:** Este documento es la **hoja de ruta consolidada** hacia donde debe ir el proyecto EDL Carepa, derivada **exclusivamente** de las 26 transcripciones oficiales de la CNSC y cruzada con los hallazgos del proyecto documentados en `../FASE3_GAPS.md`.
>
> No es una lista de deseos: cada ítem está respaldado por una transcripción específica que se puede consultar en [`13-trazabilidad-con-proyecto.md`](./13-trazabilidad-con-proyecto.md).

---

## 1. Visión

> *"El aplicativo EDL es una herramienta ágil y oportuna para que evaluados y evaluadores den cumplimiento a las fases establecidas y llevar un control eficiente de la evaluación del desempeño laboral."* — CNSC, `EntérateCNSC_5_pasos...md`.

**Visión del proyecto EDL Carepa:** ser el aplicativo de evaluación del desempeño laboral **más usable, trazable y alineado al marco normativo colombiano** entre todas las entidades territoriales que adoptan el Sistema Tipo de la CNSC.

Esto significa:

1. **Cumplir 100% con el Acuerdo 617 de 2018 y su Anexo Técnico.**
2. **Generar valor operativo real** para el jefe de personal, evaluadores y evaluados de la Alcaldía de Carepa.
3. **Ser mantenible y extensible** a futuro (multientidad si Carepa lo requiere).
4. **Tener trazabilidad normativa** de cada decisión técnica (lo que hoy aporta esta carpeta `cnsc/`).

## 2. Principios rectores

Derivados del espíritu de las transcripciones CNSC:

| # | Principio | Fuente CNSC |
|---|---|---|
| 1 | **Permanente, sistemático, estructurado y participativo.** | `Evaluación_del_Desempeño_Laboral_-_Qué_es_la_EDL.md` [05:40–05:58] |
| 2 | **Herramienta de gestión basada en juicios objetivos.** | `Generalidades_EDL.md` [00:05–00:20] |
| 3 | **El aplicativo debe ser amigable, flexible y en tiempo real.** | `Nuevo_Sistema_Tipo_EDL.md` [01:09–01:15] |
| 4 | **Bilateralidad en la concertación.** | `Tutorial_EDL_APP_Concertación_de_Compromisos.md` [04:25–04:46] |
| 5 | **Aprobación por Comisión Evaluadora para firmeza.** | `Tutorial_EDL_APP_Realización_Aprobación_Evaluaciones_Rol_de_.md` [05:18–05:26] |
| 6 | **Notificación personal + recursos formales.** | `Usos_escalas_y_consecuencias_de_EDL.md` [06:50–07:18] |
| 7 | **Evidencias descriptivas, no archivos.** | `Tutorial_EDL_APP_-_Registro_de_evidencias_y_compromisos_de_m.md` [02:24–02:30] |

## 3. Roadmap por fases

### FASE 0 — Estabilización crítica (1 semana)

**Objetivo:** que el sistema funcione end-to-end sin romperse en lo más básico.

| # | Cambio | Esfuerzo | Prioridad | Trazabilidad |
|---|---|---|---|---|
| 0.1 | Corregir `Database.php`: `\Pdo\Mysql::ATTR_FOUND_ROWS` → `PDO::MYSQL_ATTR_FOUND_ROWS` | 5 min | 🔴 Crítica | Bug P1 — `INFORME_TECNICO_ANALISIS_CNSC.md` |
| 0.2 | Corregir conflicto de rutas: registrar `/evaluaciones/pendientes-calificar` ANTES de `/evaluaciones/{id}` | 10 min | 🔴 Crítica | Bug P2 |
| 0.3 | Completar modelos `Evaluacion.php` y `Compromiso.php` con propiedades faltantes | 30 min | 🔴 Crítica | Bug P3 |
| 0.4 | Unificar variable JWT: `JWT_EXPIRATION` → `JWT_EXPIRACION_MINUTOS` | 10 min | 🔴 Crítica | Bug P4 |
| 0.5 | Agregar ruta para `AdminConfiguracion` en `App.tsx` | 5 min | 🔴 Crítica | Bug P5 |
| 0.6 | Cambiar etiqueta "Documento" → "Nombre de usuario" en Login | 5 min | 🔴 Crítica | Gap C5 |
| 0.7 | Agregar ESLint + Prettier al frontend | 2h | 🟡 Alta | Mejora calidad |

**Entregable FASE 0:** sistema que arranca, login funciona, evaluaciones no caen en runtime.

---

### FASE 1 — Modelo de datos y roles (1-2 semanas)

**Objetivo:** sentar las bases para todos los flujos CNSC.

| # | Cambio | Esfuerzo | Prioridad | Trazabilidad |
|---|---|---|---|---|
| 1.1 | Agregar campos faltantes a tabla `usuarios` (género, ubicación, naturaleza, etc.) | 4h | 🔴 Crítica | Brecha B4 |
| 1.2 | Crear rol `jefe_personal` con permisos específicos | 2h | 🔴 Crítica | Brecha B2 |
| 1.3 | Crear rol `cargador` para contratistas | 1h | 🔴 Crítica | Brecha B3 |
| 1.4 | Crear rol `comision_evaluadora` (LNR que aprueba) | 2h | 🔴 Crítica | Brecha B2 / Rol CNSC |
| 1.5 | Agregar tipo `extraordinaria` al enum `evaluaciones.tipo` | 1h | 🔴 Crítica | Brecha B8 |
| 1.6 | Distinguir `primer_semestre` y `segundo_semestre` como tipos | 1h | 🟡 Alta | Inconsistencia I3 |
| 1.7 | Crear tabla `compromisos_mejoramiento` (separada, no tipo) | 4h | 🔴 Crítica | Brecha B5 |
| 1.8 | Agregar `tipo_concertacion` a `compromisos` o `evaluaciones` | 1h | 🟡 Alta | Brecha B14 |
| 1.9 | Agregar `motivo_no_jefe_inmediato` a `evaluaciones` | 30 min | 🟡 Alta | Brecha B15 |
| 1.10 | Crear tabla `calificacion_comportamental` con `frecuencia` enum | 3h | 🟡 Alta | Brecha B16 |
| 1.11 | Crear tabla `preguntas_validacion` con justificación ≥40 chars | 2h | 🟡 Alta | Brecha B16 |
| 1.12 | Agregar columna `dependencia_id` a `metas` (si no existe) | 1h | 🟡 Alta | Brecha B9 |
| 1.13 | Crear tabla `historial_evaluadores` para auditoría | 2h | 🟢 Media | Lineamiento cambio admin |
| 1.14 | Crear `ausentismos` con validación `>30 días` y tipo de vinculación | 2h | 🟡 Alta | Inconsistencia I5 |

**Entregable FASE 1:** modelo de datos alineado al Acuerdo 617/2018 con roles CNSC completos.

---

### FASE 2 — Flujos centrales EDL (2-3 semanas)

**Objetivo:** implementar los flujos críticos que el Acuerdo 617 exige.

| # | Cambio | Esfuerzo | Prioridad | Trazabilidad |
|---|---|---|---|---|
| 2.1 | Implementar aprobación/rechazo de compromisos por el evaluado | 6h | 🔴 Crítica | Brecha B1 / Gap C4 |
| 2.2 | Crear página `ProponerCompromisos.tsx` (evaluado) | 8h | 🔴 Crítica | Gap C4 |
| 2.3 | Crear página `CompromisosMejoramiento.tsx` (evaluador) | 8h | 🔴 Crítica | Gap C2 |
| 2.4 | Reescribir `PanelEvaluador.tsx` con dropdowns, escalas, validación | 16h | 🔴 Crítica | Gap C3 / Hallazgo P-C2 |
| 2.5 | Implementar lógica de aprobación/rechazo por Comisión Evaluadora | 8h | 🔴 Crítica | Brecha B2 / Flujo CNSC |
| 2.6 | Validar rangos de compromisos (1-5 funcional anual, 1-3 prueba, 3-5 comportamental) | 4h | 🟡 Alta | Inconsistencias I6, I7 |
| 2.7 | Implementar validación `ausentismo >30 días` y tipo de vinculación | 2h | 🟡 Alta | Inconsistencia I5 |
| 2.8 | Crear página `Ausentismos/AusentismoList.tsx` | 6h | 🔴 Crítica | Gap C6 |
| 2.9 | Implementar notificaciones personales (calificación definitiva) | 4h | 🟡 Alta | Flujo CNSC §7 (doc 07) |
| 2.10 | Implementar workflow de notificaciones para evaluaciones parciales | 4h | 🟡 Alta | Flujo CNSC §7 |

**Entregable FASE 2:** flujos CNSC críticos funcionando, evidencia verificable con casos de prueba.

---

### FASE 3 — Administración y reportes (2 semanas)

**Objetivo:** dar al jefe de personal las herramientas que necesita.

| # | Cambio | Esfuerzo | Prioridad | Trazabilidad |
|---|---|---|---|---|
| 3.1 | Instalar DOMPDF o mPDF, generar PDF de concertación | 8h | 🔴 Crítica | Brecha B6 |
| 3.2 | Generar PDF de evaluación definitiva | 8h | 🔴 Crítica | Brecha B6 |
| 3.3 | Generar PDF desde "Ver evaluaciones" en módulo de usuarios | 4h | 🟡 Alta | Brecha B11 |
| 3.4 | Instalar PhpSpreadsheet, exportar reportes a Excel | 6h | 🟡 Alta | Brecha B7 |
| 3.5 | Implementar endpoint `restaurar-password` por admin | 2h | 🟡 Alta | Brecha B10 |
| 3.6 | Crear modal "Administrar roles" en `AdminUsuarios.tsx` | 4h | 🟡 Alta | Brecha B12 |
| 3.7 | Crear wizard `CargaUsuarios.tsx` (descargar → subir → preview → confirmar) | 12h | 🔴 Crítica | Gap C7 |
| 3.8 | Integrar Movilidad como sub-pestaña de Usuarios | 6h | 🟡 Alta | Brecha B17 |
| 3.9 | Implementar "Cambiar estado" de Dependencias con validación de usuarios | 4h | 🟡 Alta | Brecha B13 |
| 3.10 | Hacer visibles los 8 reportes en módulo del Jefe de Personal | 8h | 🟡 Alta | Flujo CNSC §8 (doc 11) |
| 3.11 | Mejorar formulario `AdminUsuarios.tsx` con todos los campos CNSC | 12h | 🟡 Alta | Brecha B4 / Hallazgo A2 |

**Entregable FASE 3:** jefe de personal con herramientas completas de gestión y reportes.

---

### FASE 4 — Calidad, UX y accesibilidad (2-3 semanas)

**Objetivo:** llevar el sistema de "funcional" a "profesional".

| # | Cambio | Esfuerzo | Prioridad | Trazabilidad |
|---|---|---|---|---|
| 4.1 | Implementar Design System base (tokens, componentes primitivos) | 16h | 🟡 Alta | `REDISENO_UX_UI_AUDITORIA.md` §10 |
| 4.2 | Crear 26 componentes UI primitivos | 24h | 🟡 Alta | Mismo |
| 4.3 | Rediseñar AdminHome, EvaluadorHome, EvaluadoHome, ComisionHome | 24h | 🟡 Alta | Mismo §7-9 |
| 4.4 | Implementar microinteracciones (skeletons, toasts, animaciones) | 12h | 🟢 Media | Mismo §15 |
| 4.5 | Accesibilidad WCAG 2.1 nivel AA (ARIA, foco, contraste) | 16h | 🟡 Alta | Mismo §12 |
| 4.6 | Refactor responsive (mobile-first en DataTable, formularios) | 16h | 🟡 Alta | Mismo §13 |
| 4.7 | Quick Wins (QW-1 a QW-10) | 32h | 🟢 Media | Mismo §16 |
| 4.8 | Estandarizar mensajes del sistema con literales CNSC | 4h | 🟢 Media | `INFORME_TECNICO_ANALISIS_CNSC.md` §M4 |
| 4.9 | Implementar refresh token JWT y aviso previo a expiración | 4h | 🟢 Media | `INFORME_TECNICO_ANALISIS_CNSC.md` FASE 4 |
| 4.10 | Reemplazar `window.location.href` por React Router en 401 | 2h | 🟢 Media | Mismo |
| 4.11 | Eliminar colores hardcoded, usar tokens institucionales | 4h | 🟢 Media | Mismo |
| 4.12 | Unificar modelo de roles (RoleSelector / AdminUsuarios / ProtectedRoute) | 4h | 🟢 Media | Mismo |

**Entregable FASE 4:** sistema profesional, accesible, responsive, con Design System reutilizable.

---

### FASE 5 — Productividad, búsqueda, automatización (2 semanas)

**Objetivo:** llevar el sistema a "SaaS moderno".

| # | Cambio | Esfuerzo | Prioridad | Trazabilidad |
|---|---|---|---|---|
| 5.1 | Autocompletado de evaluado por documento (cascada con dependencia) | 8h | 🟢 Media | `REDISENO_UX_UI_AUDITORIA.md` §14 |
| 5.2 | Plantillas de compromisos por nivel (Directivo, Asesor, etc.) | 8h | 🟢 Media | Mismo |
| 5.3 | Acciones masivas en tablas (aprobar varias evaluaciones, etc.) | 12h | 🟢 Media | Mismo |
| 5.4 | Atajos de teclado (`g+e`, `g+c`, `n`, `/`, `?`) | 8h | 🟢 Baja | Mismo |
| 5.5 | Filtros avanzados persistentes en URL | 8h | 🟢 Media | Mismo |
| 5.6 | Cálculo automático de nota final con preview en vivo | 4h | 🟢 Media | Mismo |
| 5.7 | Detección de cuellos de botella (ej. "12 evaluaciones sin iniciar, 8 días restantes") | 8h | 🟢 Media | Mismo |
| 5.8 | Recordatorios automáticos a evaluadores (3 días antes del vencimiento) | 8h | 🟢 Media | Mismo |
| 5.9 | Wizard de primera evaluación guiado | 8h | 🟢 Media | `Tutorial_para_la_realización_de_la_primera_evaluación_parcia.md` |
| 5.10 | Búsqueda global en el header | 12h | 🟢 Media | `REDISENO_UX_UI_AUDITORIA.md` |

**Entregable FASE 5:** sistema con productividad comparable a SaaS modernos.

---

### FASE 6 — Robustez, observabilidad, multi-año (continuo)

**Objetivo:** preparar el sistema para uso intensivo y evolución.

| # | Cambio | Esfuerzo | Prioridad | Trazabilidad |
|---|---|---|---|---|
| 6.1 | Tests E2E con Playwright de flujos críticos | 24h | 🟡 Alta | `REDISENO_UX_UI_AUDITORIA.md` Anexo A |
| 6.2 | Tests unitarios con Vitest + RTL para primitivos | 16h | 🟢 Media | Mismo |
| 6.3 | Tests de accesibilidad con axe-core en CI | 8h | 🟢 Media | Mismo |
| 6.4 | Logging estructurado (JSON) + correlación por request | 8h | 🟢 Media | Buenas prácticas |
| 6.5 | Métricas de uso (eventos básicos sin PII) | 12h | 🟢 Baja | `REDISENO_UX_UI_AUDITORIA.md` §22 |
| 6.6 | Soporte multi-año (consultar histórico de períodos anteriores) | 16h | 🟢 Baja | Madurez |
| 6.7 | Soporte multi-entidad (si Carepa lo requiere) | 40h | 🟢 Baja | Madurez |
| 6.8 | Integración con SUIT (Sistema Único de Información de Trámites) | 40h | ⚪ Futura | Alineación nacional |
| 6.9 | Integración con SIGEP (Sistema de Información del Empleo Público) | 40h | ⚪ Futura | Alineación nacional |
| 6.10 | Dashboard ejecutivo para el Alcalde/Secretario | 16h | 🟢 Media | Visibilidad alta dirección |

**Entregable FASE 6:** sistema listo para producción intensiva y crecimiento orgánico.

---

## 4. Estimación total

| Fase | Duración | Esfuerzo |
|---|---|---|
| FASE 0 — Estabilización | 1 semana | ~3 horas |
| FASE 1 — Modelo de datos y roles | 1-2 semanas | ~25 horas |
| FASE 2 — Flujos centrales EDL | 2-3 semanas | ~64 horas |
| FASE 3 — Administración y reportes | 2 semanas | ~72 horas |
| FASE 4 — Calidad, UX, accesibilidad | 2-3 semanas | ~164 horas |
| FASE 5 — Productividad | 2 semanas | ~84 horas |
| FASE 6 — Robustez (continuo) | Continuo | ~220+ horas |
| **TOTAL MVP (Fases 0-3)** | **6-8 semanas** | **~164 horas** |
| **TOTAL Profesional (Fases 0-5)** | **10-13 semanas** | **~412 horas** |

## 5. Criterios de aceptación por fase

| Fase | Criterio |
|---|---|
| FASE 0 | ✅ Login funciona sin errores 500. ✅ Las 5 rutas críticas responden. |
| FASE 1 | ✅ Migración corre limpia. ✅ Los 5 roles CNSC existen y tienen permisos correctos. |
| FASE 2 | ✅ Un evaluador puede hacer un ciclo completo (concertar → calificar → aprobar) sin errores. ✅ Un evaluado puede aceptar/rechazar compromisos. |
| FASE 3 | ✅ El jefe de personal puede generar los 8 reportes y exportarlos a Excel. ✅ Los PDFs de concertación y evaluación se descargan correctamente. |
| FASE 4 | ✅ Lighthouse ≥ 90 en performance y accesibilidad. ✅ Bundle inicial ≤ 250 KB gzip. ✅ LCP ≤ 2.5 s en 4G simulado. |
| FASE 5 | ✅ Una evaluación completa toma ≤ 5 minutos (línea base: 10-15 min). ✅ Clics para función crítica ≤ 3 (línea base: 5-7). |
| FASE 6 | ✅ 80%+ de cobertura en flujos críticos. ✅ 0 issues críticos de axe-core. ✅ Logs estructurados en producción. |

## 6. Decisiones de producto (estado al 2026-06-22)

> **Convención:** ✅ Decidido · ⚠️ Decidido con condiciones · 🔶 Pendiente validación final del director.

| # | Decisión | Opciones | **Decisión tomada** | Justificación |
|---|---|---|---|---|
| D1 | **Evidencias: carga de archivos o solo descriptivo** | A. Solo descriptivo (alineado CNSC) / **B. Híbrido (recomendado)** / C. Solo archivos (status quo) | ✅ **B (híbrido)** | La CNSC exige descriptivo (texto). Carepa necesita soportar archivos físicos escaneados (actas firmadas). Solución: textarea principal obligatorio + upload opcional. Se documenta como divergencia intencional. |
| D2 | **Periodos editables o no** | A. Solo lectura (CNSC) / B. Editable (status quo) | ✅ **B (editable para Carepa)** | Carepa es una sola entidad territorial. Permitir edición da flexibilidad operativa al Jefe de Personal para corregir fechas de períodos atípicos. Se documenta como decisión local con justificación. |
| D3 | **Color principal** | A. Azul institucional Carepa `#0A2B5E` / B. Azul CNSC `#0056b3` | ✅ **A (azul Carepa)** | Identidad institucional consolidada. Tokens ya definidos en `tailwind.config.js`. Cambio masivo evitable. |
| D4 | **Tipografía** | A. Inter (recomendada) / B. system-ui | ⚠️ **A con fallback a system-ui** | Inter si está disponible (mejor consistencia visual), system-ui como fallback automático. Sin costo, sin font-loading bloqueante. |
| D5 | **Naming** | A. "EDL Carepa — Alcaldía de Carepa" (status quo) / B. Otro | ✅ **A** | Mantener. Ya está consolidado en uso y en la documentación. |
| D6 | **Plazo** | A. MVP en 8 semanas / B. Profesional en 13 semanas / C. Otro | ⚠️ **Híbrido: 8 semanas MVP + iteración continua** | MVP en 8 semanas (Fases 0-3) con release a producción. Mejoras profesionales (Fases 4-6) entran en iteraciones mensuales posteriores. Esto evita parálisis por perfección. |
| D7 | **Design System stack** | A. Tailwind + Headless UI (rápido) / B. Radix UI (más accesible) | ✅ **B (Radix UI)** | Mejor accesibilidad por defecto (cumple WCAG 2.1 AA), menos código custom para foco/ARIA/keys. El proyecto ya tiene 10 componentes primitivos en `components/ui/`, migrar a Radix es viable. |
| D8 | **Internacionalización** | A. Solo es-CO / B. Multi-idioma | ✅ **A (solo es-CO)** | Una entidad territorial colombiana. Sin justificación para multi-idioma. |
| D9 | **Mobile-first** | A. Sí, 80% móvil / B. Desktop-first con responsive | ⚠️ **B por ahora, A como meta** | El proyecto actual está desktop-first. Refactor mobile-first requiere reescritura de tablas y formularios (Fase 4.6 del roadmap). Decisión operativa: priorizar estabilidad desktop primero, mobile en sprint posterior. |

### 6.1 Decisiones que requieren validación final del director

Estas 3 (D4, D6, D9) tienen defaults razonables pero el director puede cambiarlas:

- **D4** → cambiar a "solo system-ui" ahorra ~50KB de font loading.
- **D6** → cambiar a "13 semanas profesionales" si hay presupuesto de UI dedicado.
- **D9** → cambiar a mobile-first si hay evidencia de uso móvil significativo.

### 6.2 Cómo registrar las decisiones

Todas estas decisiones se reflejan en:
- Este documento (`14-futuro-del-proyecto.md`).
- `docs/DECISIONES_PRODUCTO.md` (recomendado crear en proyecto, no en `cnsc/`).
- Commit con mensaje claro en git.

## 7. Riesgos identificados

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | **CNSC publica instructivo de transición de administración** sin estar alineados | Media | Alto | Esta carpeta `cnsc/` permite reaccionar rápido. |
| R2 | **Cambio normativo** (nuevo Acuerdo o Decreto que modifique el 617/2018) | Media | Alto | Suscribirse a comunicaciones oficiales de la CNSC. |
| R3 | **Multientidad** — Carepa decide gestionar otras entidades | Baja | Alto | FASE 6.7 cubre el caso. |
| R4 | **Datos heredados** incompatibles con el nuevo modelo | Alta | Medio | Script de migración validado con datos reales antes de Fase 1. |
| R5 | **Resistencia al cambio** de usuarios actuales | Alta | Medio | Capacitación + quick wins visibles tempranos (QW-1 a QW-5). |
| R6 | **Presupuesto** para PhpSpreadsheet, DOMPDF, Playwright | Baja | Bajo | Librerías open source, sin costo de licencia. |
| R7 | **Multientidad jurídica**: SUIT, SIGEP, etc. | Baja | Alto | FASE 6.8 y 6.9 contemplan el escenario. |
| R8 | **Auditoría externa** que pida trazabilidad normativa | Alta | Medio | Carpeta `cnsc/` resuelve esto 100%. |

## 8. Métricas de éxito (12 meses post-implementación)

| KPI | Baseline estimado | Meta | Fuente de medición |
|---|---|---|---|
| Tiempo promedio evaluación completa | 10-15 min | 5 min | Logs de timestamps |
| Clics para función crítica | 5-7 | ≤ 3 | Análisis de flujo + pruebas |
| Evaluaciones completadas a tiempo | TBD | +30% | Reporte de cumplimiento |
| Tasa de error en formularios | TBD | -50% | Telemetría de validación |
| Tickets de soporte UI | TBD | -60% | Mesa de ayuda |
| Adopción móvil (sesiones desde celular) | TBD | +25% | Analytics |
| Tasa de aprobación de evaluaciones en primer intento (Comisión) | TBD | +40% | Auditoría |
| NPS usuarios internos | TBD | ≥ 30 | Encuesta trimestral |
| Cobertura de tests E2E de flujos críticos | 0% | ≥ 80% | CI |
| Lighthouse accessibility | TBD | ≥ 90 | CI |

## 9. Próximos pasos concretos

### Esta semana (2026-06-22 → 2026-06-29)

1. ✅ **Decisiones de producto D1-D9 registradas** en §6 con defaults justificados.
2. ✅ **Auditoría dirigida** iniciada: leer contenido de los 22 archivos prioritarios (`13-trazabilidad-con-proyecto.md` §5).
3. ⏭️ **Ejecutar FASE 0** completa (los 5 bugs críticos + etiqueta Login). Asignar owner.
4. ⏭️ **Iniciar FASE 1** en paralelo: agregar campos a tabla `usuarios` y crear los 5 roles CNSC.
5. ⏭️ **Asignar owners** a cada fase (un dev backend, un dev frontend, un revisor).
6. ⏭️ **Configurar CI** con tests E2E (aunque sea 1 happy path por flujo).
7. ⏭️ **Sprint planning** cada lunes con este roadmap como referencia.

### Hitos

| Hito | Fecha objetivo | Criterio |
|---|---|---|
| H0 — Estabilización | 2026-06-29 | Login funciona sin errores 500. Las 5 rutas críticas responden. |
| H1 — Modelo de datos y roles | 2026-07-13 | Migración corre limpia. 5 roles CNSC existen. |
| H2 — Flujos centrales EDL | 2026-08-03 | Ciclo completo concertar → calificar → aprobar funciona. |
| H3 — Administración y reportes | 2026-08-17 | Los 8 reportes generan + exportan Excel + PDF individuales. |
| H4 — MVP a producción | 2026-08-31 | Release tag `v0.1.0` con Fases 0-3 completas. |

## 10. Cómo este roadmap se conecta con esta carpeta `cnsc/`

| Necesito saber... | Voy a... |
|---|---|
| ¿Qué dijo la CNSC sobre X? | Leo el documento correspondiente (01-12). |
| ¿Qué brecha/inconsistencia/gap del proyecto cubre X? | Leo [`13-trazabilidad-con-proyecto.md`](./13-trazabilidad-con-proyecto.md). |
| ¿Qué dijo la CNSC sobre el campo Y del formulario? | Leo el tutorial específico + tabla de campos en [`11-modulo-jefe-personal.md`](./11-modulo-jefe-personal.md). |
| ¿Cómo hago una consulta a la CNSC? | Tengo los enlaces en [`15-enlaces-y-referencias.md`](./15-enlaces-y-referencias.md) (próximo archivo). |
| ¿Cuál es el orden de ataque? | Esta hoja de ruta (§3). |
| ¿Qué decisión de producto necesito validar? | §6. |
| ¿Cuál es el riesgo si no hago esto? | §7. |

**Esta carpeta no es solo documentación: es el manual de operación del proyecto EDL Carepa derivado de la CNSC.**