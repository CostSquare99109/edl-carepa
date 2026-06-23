# Auditoría y Rediseño UX/UI Integral — EDL Carepa

**Producto:** Sistema de Evaluación del Desempeno Laboral — Alcaldía de Carepa
**Versión del documento:** 1.0
**Alcance:** Roles Administrador, Evaluador, Evaluado y Comisión Evaluadora
**Stack actual:** React 19 + Vite + TypeScript + Tailwind 3 + React Router 7 + Recharts + Sonner (frontend) · PHP 8.2 (API propia, no Laravel) + JWT + MySQL + DOMPDF + PHPMailer (backend)

> Documento ejecutivo que cubre las 10 fases y los 23 entregables solicitados, integrado con los hallazgos ya levantados en `FASE3_GAPS.md` (auditoría funcional previa) y `INFORME_TECNICO_ANALISIS_CNSC.md`.

---

## 1. Resumen ejecutivo

EDL Carepa es un sistema de gestión de evaluación del desempeño laboral para una entidad pública municipal. Tiene tres (en realidad cuatro con la Comisión Evaluadora) roles diferenciados, un backend PHP sólido con JWT, un frontend en React 19 y una paleta institucional definida (azul `#0A2B5E`, rojo `#C4282B`, verde `#1E5A3C`).

El sistema **funciona**, pero la experiencia de usuario es la de un producto técnico, no la de un SaaS moderno:

- **Navegación dependiente de Sidebar plano** sin organización por flujo de trabajo.
- **Flujos de evaluación con pasos largos y campos ambiguos** (etiquetas como "Documento" en vez de "Nombre de usuario").
- **Inconsistencia visual entre módulos**: algunos con `DataTable` rico, otros con tablas HTML crudas.
- **Sin microinteracciones**: feedback inmediato, loaders esqueleto, toasts contextuales solo en algunos módulos.
- **Responsive incompleto**: muchos formularios y tablas no están optimizados para móvil.
- **Accesibilidad**: se usa Material Icons (font, no SVG) y no hay roles ARIA en navegación.

El rediseño propuesto busca **reducir la complejidad cognitiva, llevar cualquier función crítica a máximo 3 clics, modernizar la capa visual sin romper la lógica de negocio existente, y sentar las bases de un Design System corporativo reutilizable**.

---

## 2. Auditoría completa del sistema actual

### 2.1 Inventario de pantallas y módulos

| Módulo | Rol(es) | Pantallas frontend | Estado actual |
|---|---|---|---|
| Autenticación | Todos | Login, CambioForzadoPassword, NuevaContrasena, VerificarCodigo, SelectRolePage | Funcional, etiquetas a corregir |
| Inicio / Dashboard | Todos | Dashboard.tsx (compartido) | Mixto, denso, no responsive |
| Entidades | Admin | Admin/AdminHome?, Entidades/* | Solo admin |
| Dependencias | Admin | AdminDependencias, DependenciaList | CRUD básico, falta cambio de estado |
| Usuarios | Admin | AdminUsuarios, CargaUsuarios | Formulario incompleto (faltan 15+ campos según CNSC) |
| Movilidad | Admin | MovilidadList | Sin vista frontend dedicada |
| Períodos | Admin | Periodos/* | Solo lectura, etapas EDL |
| Metas | Admin / Evaluador | Metas/* | Falta vínculo con Dependencia |
| Concertaciones | Evaluador / Evaluado | Concertaciones/* | Flujo incompleto: falta "Proponer compromisos" para evaluado |
| Compromisos | Evaluador / Evaluado | Compromisos/* | Falta frontend para "Compromisos de Mejoramiento" |
| Evaluaciones | Evaluador / Comisión | Evaluaciones/PanelEvaluador | Módulo crítico con lógica incompleta (faltan dropdowns de tipo, motivo, escalas) |
| Evidencias | Evaluador / Evaluado | Evidencias/* | Diseño equivocado: es tabla de archivos cuando debería ser solo descriptiva |
| Ausentismos | Evaluador | Ausentismos/* | **No existe frontend** (gap crítico C6) |
| Carga Masiva | Admin | Admin/CargaUsuarios.tsx | **Incompleto** (gap crítico C7) |
| Reportes | Admin / Evaluador | Reportes/* | Funcional, sin exportar a Excel/CSV visible |
| Notificaciones | Todos | Shared/NotificationBell | Funcional, pero sin centro de notificaciones |
| Configuración | Admin | Admin/AdminConfiguracion | Básico |

### 2.2 Problemas detectados (organizados por severidad)

#### Críticos (bloquean la experiencia mínima viable)

| ID | Problema | Evidencia | Impacto |
|---|---|---|---|
| P-C1 | Etiqueta "Documento" en login cuando debe ser "Nombre de usuario" | `Login.tsx` | Confusión para nuevos usuarios (CNSC) |
| P-C2 | PanelEvaluador incompleto: faltan tipo de evaluación, motivo, escalas, pesos 85/15 | `Evaluaciones/PanelEvaluador.tsx` | El evaluador no puede finalizar evaluaciones correctamente |
| P-C3 | Evidencias diseñadas como upload de archivos, pero el proceso es solo descriptivo | `Evidencias/EvidenciaList.tsx` + `FASE3_GAPS.md` (C1) | Rompe el flujo legal de evidencias |
| P-C4 | Sin frontend para Ausentismos, Carga Masiva, Compromisos de Mejoramiento, Proponer Compromisos del evaluado | Carpetas ausentes en `pages/` | Funcionalidades críticas inaccesibles |
| P-C5 | Evaluado no puede proponer compromisos cuando el evaluador omite la concertación | `FASE3_GAPS.md` (C4) | Rompe el derecho del evaluado |

#### Altos (afectan significativamente la productividad)

| ID | Problema | Evidencia | Impacto |
|---|---|---|---|
| P-A1 | Formulario de Usuarios incompleto: faltan género, ubicación, teléfonos, nivel, naturaleza, etc. | `Admin/AdminUsuarios.tsx` + `FASE3_GAPS.md` (A2) | Datos faltantes para reportes CNSC |
| P-A2 | Sin cambio de estado en Dependencias (activar/inactivar) | `Admin/AdminDependencias.tsx` | Dependencias mal gestionadas |
| P-A3 | Flujo de Comisión Evaluadora incompleto (aprobar/rechazar con retroalimentación) | `Evaluaciones/PanelEvaluador.tsx` | Evaluaciones no quedan en firme |
| P-A4 | Sin Design System: cada componente redefine colores, espaciados, tipografía | Inspección de `components/Shared/` | Inconsistencia visual sistémica |
| P-A5 | Sidebar plano sin agrupamiento por tarea: muchos items sueltos | `components/Layout/Sidebar.tsx` | Carga cognitiva alta |
| P-A6 | Sin microinteracciones: cambios de estado sin feedback visual inmediato, sin skeletons | Inspección transversal | Sensación de lentitud percibida |
| P-A7 | Mensajes del sistema no estandarizados | Dispersión de literales en backend/frontend | Inconsistencia y desconfianza |

#### Medios (mejoras de UX)

| ID | Problema | Impacto |
|---|---|---|
| P-M1 | Sin filtros avanzados persistentes en tablas grandes | Búsqueda lenta |
| P-M2 | Sin exportar reportes a Excel/CSV desde la UI | Trabajo manual post-export |
| P-M3 | Responsive incompleto: tablas largas no scrollean bien en móvil | Datos inaccesibles desde celular |
| P-M4 | Sin historial de cambios visible para el evaluado | Falta de transparencia |
| P-M5 | Notificaciones: campana sin panel dedicado | El usuario no las revisa |
| P-M6 | Sin ayuda contextual (tooltips) en campos complejos | Errores en formularios |

#### Bajos (cosméticos / detalles)

| ID | Problema |
|---|---|
| P-B1 | Footer genérico en login ("SEDEL — CNSC") en lugar de marca institucional |
| P-B2 | Selector de rol con etiquetas inconsistentes |
| P-B3 | Espaciados irregulares entre tarjetas del dashboard |

---

## 3. Matriz de criticidad

| Severidad | Cantidad | Esfuerzo total estimado | Prioridad de atención |
|---|---|---|---|
| Críticos (P-C*) | 5 | 12-16 días | Sprint 1-2 (inmediato) |
| Altos (P-A*) | 7 | 14-20 días | Sprint 2-4 |
| Medios (P-M*) | 6 | 6-10 días | Sprint 4-6 |
| Bajos (P-B*) | 3 | 1-2 días | Backlog de pulido |

**Total estimado para llegar a "SaaS moderno":** 33-48 días-hombre con un diseñador + un frontend + apoyo backend para endpoints faltantes.

---

## 4. Plan de rediseño (resumen ejecutivo)

| Fase | Objetivo | Entregables | Sprint |
|---|---|---|---|
| F1 | Corregir gaps críticos funcionales | Login labels, PanelEvaluador completo, Evidencias reescritas, 4 páginas nuevas | 1-2 |
| F2 | Design System base | Tokens, componentes primitivos (Button, Input, Select, Table, Modal, Card, Badge, Alert) | 2-3 |
| F3 | Rediseño de layouts por rol | AdminHome, EvaluadorHome, EvaluadoHome con dashboards especializados | 3-4 |
| F4 | Microinteracciones y feedback | Skeletons, toasts contextuales, transiciones, confirmaciones elegantes | 4 |
| F5 | Accesibilidad y responsive | ARIA, contraste, navegación por teclado, mobile-first en tablas y formularios | 5 |
| F6 | Productividad | Filtros avanzados, exportación Excel/CSV, plantillas, atajos | 6 |
| F7 | Pulido y métricas | Tests E2E de flujos, métricas de éxito, ajustes finales | 7 |

---

## 5. Nueva arquitectura de información

### Principios rectores

1. **Cada usuario entra a su "Home"**, no a un dashboard genérico.
2. **Cualquier función crítica en máximo 3 clics** desde el Home.
3. **Menú agrupado por tarea del usuario**, no por entidad técnica.
4. **Los flujos principales (evaluar, concertar, aprobar) tienen su propio módulo con estados visibles**.
5. **Información jerarquizada**: lo urgente arriba, lo informativo abajo.

### Estructura de navegación propuesta

#### Rol Administrador (Jefe de Personal)

- **Inicio (AdminHome)** — dashboard ejecutivo.
- **Configuración** (entorno, no gestión diaria):
  - Entidades
  - Dependencias
  - Períodos (solo lectura)
  - Parámetros (escalas, pesos, plazos)
  - Carga masiva de usuarios
- **Gestión de personas**:
  - Usuarios
  - Movilidad
- **Seguimiento del proceso EDL**:
  - Evaluaciones (vista global con filtros)
  - Compromisos de Mejoramiento (supervisión)
  - Reportes
  - Auditoría
- **Notificaciones**

#### Rol Evaluador

- **Inicio (EvaluadorHome)** — bandeja de trabajo.
- **Concertar** (compromisos):
  - Concertar compromisos
  - Por aprobar (propuestos por evaluado)
  - Ajustar concertados
  - Fijación unilateral (15+3 días)
- **Evaluar**:
  - Panel del Evaluador (bandeja de evaluaciones)
  - Mis evaluaciones
- **Evidencias**:
  - Registrar evidencia
  - Mis evidencias
- **Mejoramiento**:
  - Compromisos de Mejoramiento
- **Reportes**:
  - Mis reportes
- **Notificaciones**

#### Rol Evaluado

- **Inicio (EvaluadoHome)** — su estado, sus pendientes.
- **Mis compromisos**:
  - Propuestos (los que envié al evaluador)
  - Concertados (los que el evaluador aprobó)
  - Por aprobar (cuando aplica)
- **Proponer compromisos** (cuando el evaluador omite).
- **Mis evaluaciones**:
  - Ver mis evaluaciones
  - Consulta funcionario
- **Mis evidencias**.
- **Notificaciones**.

#### Rol Comisión Evaluadora

- **Inicio (ComisionHome)** — evaluaciones pendientes de aprobar.
- **Aprobar/Rechazar evaluaciones** (flujo dedicado).
- **Reportes** (vista de comisión).
- **Notificaciones**.

---

## 6. Nuevo sistema de navegación

### Cambios clave respecto al actual

1. **Sidebar agrupado por secciones**, con colapsables por defecto y badges de pendientes (ej: `Concertar (3)`, `Evaluar (5)`).
2. **Header global**: logo + búsqueda global + campana de notificaciones + perfil con menú desplegable (cambiar contraseña, cerrar sesión).
3. **Breadcrumbs persistentes** debajo del header, salvo en Home.
4. **Botón flotante contextual** (FAB) en Home del evaluador: "Nueva evaluación" si hay pendientes.
5. **Tabs dentro de cada módulo** cuando aplica (ej: Evaluaciones → Pendientes | En proceso | Completadas | Por aprobar).
6. **Acciones masivas en tablas**: checkbox + barra de acciones flotante inferior.

### Estados visibles

Cada item del menú puede tener:

- Badge numérico (cantidad de pendientes).
- Indicador de "nuevo" (primera vez).
- Estado deshabilitado con tooltip explicativo (ej: "No hay período activo").

---

## 7. Nuevo diseño — Rol Administrador

### AdminHome (dashboard ejecutivo)

**Estructura visual (de arriba abajo):**

1. **Saludo + resumen del día**: "Buenos días, [nombre]. Hoy hay X evaluaciones por vencer."
2. **Fila 1 — KPIs globales (4 tarjetas grandes)**:
   - Evaluaciones completadas (vs meta del período).
   - Evaluaciones pendientes.
   - Usuarios activos.
   - Cumplimiento del período activo (% con anillo de progreso).
3. **Fila 2 — Gráficos lado a lado**:
   - Evaluaciones por estado (pie).
   - Progreso por dependencia (barras horizontales, top 10).
4. **Fila 3 — Alertas prioritarias (lista con severidad)**:
   - Dependencias sin concertación vencida.
   - Evaluadores sin evaluaciones iniciadas.
   - Período por cerrar.
5. **Fila 4 — Actividad reciente (timeline compacto)**.
6. **Fila 5 — Accesos rápidos (grid de 6)**:
   - Carga masiva, Usuarios, Dependencias, Períodos, Reportes, Configuración.

**Componentes:** `KpiCard`, `ProgressRing`, `BarChart`, `PieChart`, `AlertList`, `ActivityFeed`, `QuickAccessGrid`.

### Panel de productividad (sub-AdminHome)

- Atajos personalizados (favoritos).
- Acciones masivas recientes.
- Centro de notificaciones completo.

---

## 8. Nuevo diseño — Rol Evaluador

### EvaluadorHome (bandeja de trabajo)

**Estructura:**

1. **Header de contexto**: "Período activo: [nombre]. Vence en X días."
2. **Fila 1 — Bandeja priorizada en columnas (estilo Kanban compacto)**:
   - **Por vencer** (rojo): evaluaciones con plazo crítico.
   - **En proceso** (amarillo).
   - **Listas para enviar** (verde).
3. **Fila 2 — Compromisos pendientes (tabla compacta)**:
   - Evaluado | Tipo | Estado | Acción rápida "Concertar".
4. **Fila 3 — Evidencias recientes del período**.
5. **FAB "Nueva evaluación"** flotante abajo a la derecha.

**Optimizaciones de flujo:**

- Filtros persistentes en URL.
- Comparación lado a lado de evaluaciones previas.
- Autoguardado en formularios largos.
- Validación inline en cada campo, no al final.

---

## 9. Nuevo diseño — Rol Evaluado

### EvaluadoHome (mi estado)

**Estructura:**

1. **Saludo personalizado**: "Hola, [nombre]. Tu proceso va [X]% completo este período."
2. **Línea de tiempo del proceso EDL** (horizontal, con etapas del Acuerdo 617 de 2018):
   - Concertación ✓ → Seguimiento ● → Eval. Parcial 1 ○ → Calif. Parcial 1 ○ → Eval. Parcial 2 ○ → Calif. Definitiva ○
3. **Tarjeta grande**: "Tu última evaluación" — calificación, escala (Sobresaliente / Satisfactorio / No Satisfactorio), fecha, link al detalle.
4. **Pendientes del evaluado (lista con CTA directa)**:
   - "Tienes 2 compromisos por aceptar."
   - "Tienes 1 evaluación para revisar."
5. **Recordatorios** (calendario simple).
6. **Centro de ayuda** (enlaces a guías rápidas y FAQ).

**Tono visual:** más amigable, menos denso, con mensajes tranquilizadores ("Aún estás a tiempo", "Excelente progreso").

---

## 10. Design System corporativo

### 10.1 Tokens

#### Paleta de colores (extensión de la institucional actual)

| Token | HEX | Uso |
|---|---|---|
| `--inst-azul-900` | `#0A2B5E` | Header, títulos primarios |
| `--inst-azul-700` | `#1A4480` | Botones primarios hover |
| `--inst-azul-500` | `#3B6BB5` | Botones primarios |
| `--inst-rojo-700` | `#C4282B` | Errores, alertas críticas |
| `--inst-verde-700` | `#1E5A3C` | Éxito, completados |
| `--inst-verde-500` | `#3B8C66` | Confirmaciones |
| `--neutral-50` | `#F9FAFB` | Fondos |
| `--neutral-100` | `#F3F4F6` | Fondos secundarios |
| `--neutral-300` | `#D1D5DB` | Bordes |
| `--neutral-700` | `#374151` | Texto principal |
| `--neutral-900` | `#111827` | Títulos |
| `--warning-500` | `#F59E0B` | Alertas medias |
| `--info-500` | `#3B82F6` | Información |

#### Tipografía

- **Sans-serif primaria:** Inter (sustituye si no se carga a system-ui).
- **Tamaños (escala 1.250):** xs 12px, sm 14px, base 16px, lg 18px, xl 20px, 2xl 24px, 3xl 30px, 4xl 36px.
- **Pesos:** regular 400, medium 500, semibold 600, bold 700.
- **Line-height:** tight 1.25 (títulos), normal 1.5 (cuerpo), relaxed 1.625 (legibilidad).

#### Espaciados (múltiplos de 4px)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

#### Radios

`sm 4px, md 8px, lg 12px, xl 16px, full 9999px`

#### Sombras (3 niveles)

- `--shadow-sm`: tarjetas.
- `--shadow-md`: dropdowns, popovers.
- `--shadow-lg`: modales.

#### Grid

12 columnas en desktop, gutter 24px. Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536.

### 10.2 Componentes primitivos (a construir en `frontend/src/components/ui/`)

| Componente | Variantes | Notas |
|---|---|---|
| `Button` | primary, secondary, ghost, danger, icon-only, loading | 3 tamaños (sm, md, lg) |
| `Input` | text, number, password, search, error | Con label, helper text, error |
| `Select` | single, multi, searchable | Basado en headless UI accesible |
| `Textarea` | con contador de caracteres | |
| `Checkbox` | con label e indeterminate | |
| `RadioGroup` | vertical/horizontal | |
| `DatePicker` | con rango | Localizado es-CO |
| `Switch` | con label | |
| `Card` | default, interactive (hover), elevated | |
| `Modal` | sm, md, lg, fullscreen | Con focus trap y cierre con ESC |
| `Drawer` | right, left | Para filtros en móvil |
| `Tabs` | underline, pills | |
| `Tooltip` | top, bottom, left, right | |
| `Toast` (extiende Sonner) | success, error, warning, info | |
| `Badge` | neutral, success, warning, danger, info | Con punto opcional |
| `Alert` | banner inline | Dismissible |
| `Avatar` | con iniciales o imagen | |
| `Skeleton` | text, circle, card, table-row | |
| `ProgressRing` | con etiqueta central | |
| `ProgressBar` | lineal, con label | |
| `Breadcrumb` | con ícono de inicio | |
| `Pagination` | numérica + simple | |
| `EmptyState` | con ilustración simple y CTA | |
| `DataTable` | con filtros, sort, paginación, acciones masivas, exportar | |
| `Stat` | tarjeta KPI | |
| `Timeline` | horizontal y vertical | |
| `Stepper` | para flujos multi-paso | |

---

## 11. Componentes reutilizables

### Lista completa de componentes a crear

1. `Button` (con estados loading/disabled/icon-only).
2. `Input`, `Textarea`, `Select`, `DatePicker`, `Checkbox`, `RadioGroup`, `Switch`.
3. `Card`, `Badge`, `Alert`, `Avatar`.
4. `Modal`, `Drawer`, `Tooltip`, `Toast`.
5. `Tabs`, `Breadcrumb`, `Stepper`, `Pagination`.
6. `Skeleton`, `ProgressRing`, `ProgressBar`, `Stat`.
7. `Timeline`, `EmptyState`.
8. `DataTable` (composición de los anteriores).
9. `KanbanColumn` (para EvaluadorHome).
10. `AlertList`, `ActivityFeed`, `QuickAccessGrid`.
11. `RoleGuard` (HOC/ruta protegida por rol).
12. `Layout` unificado por rol (`AdminLayout`, `EvaluatorLayout`, `EvaluatedLayout`, `CommissionLayout`).

---

## 12. Mejoras de accesibilidad

| Criterio WCAG | Acción concreta | Prioridad |
|---|---|---|
| 1.1.1 Non-text content | Reemplazar `Material Icons` (font) por SVG inline con `<title>` | Alta |
| 1.3.1 Info and relationships | Roles ARIA en `Sidebar`, `Tabs`, `Modal`, `DataTable` | Alta |
| 1.4.3 Contrast | Verificar contraste mínimo 4.5:1 en texto, 3:1 en UI | Alta |
| 1.4.11 Non-text contrast | Bordes de inputs con contraste suficiente | Media |
| 2.1.1 Keyboard | Navegación completa por teclado (Tab/Shift+Tab/Enter/ESC) | Alta |
| 2.4.3 Focus order | Orden lógico de foco en todos los flujos | Alta |
| 2.4.7 Focus visible | Foco visible con outline de 2px en color institucional | Alta |
| 3.3.1 Error identification | Errores en formularios con texto + ícono + aria-describedby | Alta |
| 3.3.2 Labels | Labels asociados a inputs (no placeholders) | Alta |
| 4.1.2 Name, role, value | Roles ARIA correctos en widgets custom | Alta |

Adicional: pruebas con NVDA (Windows) y VoiceOver (macOS/iOS) en los flujos principales.

---

## 13. Mejoras responsive

### Estrategia

**Mobile-first** en todos los componentes nuevos. Los existentes se migran gradualmente.

### Patrones por componente

| Componente | Desktop | Tablet | Móvil |
|---|---|---|---|
| Sidebar | Fijo a la izquierda | Colapsable | Drawer con hamburger |
| DataTable | Tabla completa | Tabla completa con scroll horizontal | Card list apilada + botón "Ver" |
| Formularios | 2 columnas | 2 columnas | 1 columna full width |
| Dashboard | Grid 4+4+2 | Grid 2+2+2 | Stack vertical |
| Modales | Centrados, max 600px | Centrados, max 500px | Bottom sheet full width |
| Charts | 2 columnas | 1 columna | 1 columna, altura mínima 240px |

### Acciones táctiles

- Botones mínimo 44×44 px.
- Inputs con altura 48 px en móvil.
- Swipe en cards de Kanban (opcional, mejora la experiencia).
- Pull-to-refresh en bandejas.

---

## 14. Mejoras de productividad

### Autocompletado

- **Evaluador → evaluado**: al escribir el documento, autocompletar nombre y dependencia desde el backend.
- **Compromisos**: plantillas predefinidas por nivel (Directivo, Asesor, Profesional, Técnico, Asistencial).
- **Evidencias**: descripción con snippets reutilizables.

### Acciones masivas

- Aprobar/rechazar varias evaluaciones a la vez (Comisión).
- Cambiar estado de varios usuarios (Admin).
- Reasignar varios compromisos.

### Atajos de teclado (sólo desktop)

- `g + e`: ir a Evaluar.
- `g + c`: ir a Concertar.
- `n`: nueva evaluación (en EvaluadorHome).
- `/`: foco en búsqueda global.
- `?`: ayuda de atajos.

### Flujos simplificados

- **Evaluación 1er paso → tipo y motivo → 2do paso → calificar funcionales → 3ro → calificar comportamentales → 4to → resumen y enviar.** Stepper visible siempre.
- **Concertación**: agrupar por evaluado, mostrar cuántos compromisos lleva, validar peso = 100% en vivo.
- **Carga masiva**: wizard (1 descargar plantilla → 2 subir → 3 previsualizar errores → 4 confirmar).

### Plantillas

- Plantillas de compromisos por dependencia.
- Plantillas de evidencias por período.
- Plantillas de notificación masiva.

### Operaciones inteligentes

- **Cálculo automático** de nota final (85% funcionales + 15% comportamentales) con preview en vivo.
- **Detección de cuellos de botella**: "Tienes 12 evaluaciones sin iniciar, te quedan 8 días" (warning contextual).
- **Recordatorios automáticos** a evaluadores con 3 días de anticipación al vencimiento.

---

## 15. Microinteracciones

| Momento | Animación |
|---|---|
| Carga inicial de página | Skeletons por 200-400 ms |
| Hover en botones | Cambio de color 150 ms + ligero scale 1.02 |
| Click en botón | Ripple suave 200 ms |
| Toast (éxito/error) | Slide-in desde arriba a la derecha, 250 ms |
| Modal | Fade-in backdrop 200 ms + slide-up contenido 250 ms |
| Cambio de tab | Crossfade 150 ms |
| Validación de campo | Borde rojo aparece con shake suave si hay error tras submit |
| Actualización de gráfico | Recharts con `isAnimationActive` (800 ms) |
| Drag & drop (Kanban) | Sombra elevada + opacidad 0.8 en el origen |
| Cambio de estado en línea de tiempo | Pulso suave + cambio de color |

**Reglas:** ninguna animación debe superar 400 ms, todas respetan `prefers-reduced-motion`.

---

## 16. Quick Wins (implementación inmediata, 1-2 días cada uno)

| ID | Quick win | Esfuerzo |
|---|---|---|
| QW-1 | Cambiar etiquetas Login ("Nombre de usuario") + footer institucional | 0.5 día |
| QW-2 | Agregar badges numéricos en Sidebar con conteos en vivo | 1 día |
| QW-3 | Estandarizar toasts con Sonner en todos los `fetch` (reemplazar alerts) | 1 día |
| QW-4 | Empty states en todas las tablas (cuando no hay datos) | 0.5 día |
| QW-5 | Skeleton loaders en Dashboard y tablas principales | 1 día |
| QW-6 | Breadcrumbs en todas las pantallas (excepto Home) | 0.5 día |
| QW-7 | Tooltips en íconos del Sidebar y botones de acción | 0.5 día |
| QW-8 | Botón "Volver arriba" en tablas largas | 0.25 día |
| QW-9 | Página "Próximamente" elegante para módulos pendientes | 0.25 día |
| QW-10 | Mensajes de error estandarizados (texto único por tipo) | 0.5 día |

**Total quick wins: ~6 días.**

---

## 17. Roadmap de implementación por fases

### Sprint 1 (semana 1-2): Estabilización crítica

- Login labels (QW-1).
- Reescribir Evidencias como descriptiva.
- Crear Compromisos de Mejoramiento (frontend).
- Crear Proponer Compromisos (evaluado).
- Quick wins QW-2 a QW-10.

### Sprint 2 (semana 3-4): Gaps críticos faltantes

- Crear Ausentismos frontend.
- Crear Carga Masiva wizard.
- Reescribir PanelEvaluador con dropdowns y escalas completas.
- Crear Movilidad frontend.

### Sprint 3 (semana 5-6): Design System base

- Crear `components/ui/` con todos los primitivos.
- Documentar en Storybook (opcional) o MDX.
- Migrar 3 componentes existentes como prueba (Button, Input, Modal).

### Sprint 4 (semana 7-8): Layouts por rol

- AdminHome rediseñado.
- EvaluadorHome (bandeja Kanban).
- EvaluadoHome (timeline).
- ComisionHome.

### Sprint 5 (semana 9-10): Accesibilidad y responsive

- ARIA, foco visible, navegación por teclado.
- Refactor de tablas para móvil (card list).
- Refactor de formularios (1 columna en móvil).

### Sprint 6 (semana 11-12): Productividad

- Filtros avanzados persistentes.
- Exportación Excel/CSV.
- Atajos de teclado.
- Plantillas.

### Sprint 7 (semana 13-14): Pulido y métricas

- Tests E2E con Playwright de los flujos principales.
- Métricas de éxito (ver sección 22).
- Ajustes finales de UX.

---

## 18. Mockups descriptivos de cada pantalla

A continuación, descripciones textuales (mockups descriptivos) de las pantallas clave. Para los mockups visuales de alta fidelidad se recomienda una herramienta como Figma, tomando este documento como brief.

### 18.1 Login

```
+--------------------------------------------------+
|                                                  |
|                  [ESCUDO CAREPA]                 |
|                                                  |
|             EDL Carepa — Alcaldía                |
|                                                  |
|   Nombre de usuario                              |
|   [_______________________________]              |
|                                                  |
|   Contraseña                  [👁]               |
|   [_______________________________]              |
|                                                  |
|   ( ) Recordarme                                 |
|                                                  |
|        [        Acceder        ]                 |
|                                                  |
|   ¿Olvidó su contraseña?                         |
|                                                  |
|   ──────────────────────────────────────────     |
|   EDL Carepa — Alcaldía de Carepa                |
+--------------------------------------------------+
```

### 18.2 AdminHome

```
+----------------------------------------------------------------------+
| [Logo] EDL Carepa            🔍 Buscar...      🔔(3)   [Avatar ▾]   |
+--------+-------------------------------------------------------------+
| INICIO  | Hola, [Nombre]. Hoy hay 3 evaluaciones por vencer.        |
| CONFIG  |                                                             |
| └ Entid.| ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             |
| └ Depen.| │ 87%     │ │ 12      │ │ 245     │ │ 38      │             |
| └ Perío.| │ Período │ │ Pendien.│ │ Usuarios│ │ Compl.  │             |
| GESTIÓN | └─────────┘ └─────────┘ └─────────┘ └─────────┘             |
| └ Usuar.|                                                             |
| └ Movili.| ┌─────────────────┐ ┌─────────────────┐                    |
| SEGUIM.  | │  [PieChart]     │ │  [BarChart]     │                    |
| └ Evaluac| │  Por estado     │ │  Por dependenc. │                    |
| └ Compro.| └─────────────────┘ └─────────────────┘                    |
| └ Report.|                                                             |
| NOTIFIC. | ⚠ Alertas prioritarias (3)                                  |
|          | • Dep. Planeación sin concertación vencida                |
|          | • 5 evaluadores sin evaluaciones iniciadas                |
|          |                                                             |
|          | 🕒 Actividad reciente                                      |
|          | • 10:42 [usuario X] aprobó concertación [Y]               |
|          |                                                             |
|          | ⚡ Accesos rápidos                                          |
|          | [Carga masiva] [Usuarios] [Dependencias]                   |
|          | [Períodos]      [Reportes] [Configuración]                  |
+--------+-------------------------------------------------------------+
```

### 18.3 EvaluadorHome (bandeja)

```
+----------------------------------------------------------------------+
| Período activo: "2025-1". Vence en 8 días.            [+ Evaluar]   |
+----------------------------------------------------------------------+
| POR VENCER (3)  | EN PROCESO (5)  | LISTAS (2)                       |
| ┌─────────────┐ | ┌─────────────┐ | ┌─────────────┐                   |
| │ J. Pérez    │ | │ A. López    │ | │ M. Ruiz     │                   |
| │ Vence hoy   │ | │ Falta comp. │ | │ Listo para  │                   |
| │ [Evaluar]   │ | │ [Continuar] │ | │ [Enviar]    │                   |
| └─────────────┘ | └─────────────┘ | └─────────────┘                   |
+----------------------------------------------------------------------+
| COMPROMISOS PENDIENTES (4)                                            |
| Evaluado | Tipo | Estado | Acción                                     |
| ...                                                                |
+----------------------------------------------------------------------+
| EVIDENCIAS RECIENTES (5)                                              |
+----------------------------------------------------------------------+
```

### 18.4 EvaluadoHome

```
+----------------------------------------------------------------------+
| Hola, [Nombre]. Tu proceso va 60% este período.                     |
+----------------------------------------------------------------------+
| TIMELINE                                                             |
| ✓ Concertación  ● Seguimiento  ○ Eval. Parcial 1  ○ ...  ○ Calif.   |
+----------------------------------------------------------------------+
| TU ÚLTIMA EVALUACIÓN                                                  |
| ┌─────────────────────────────┐                                      |
| │ Calificación: 87            │  Escala: Satisfactorio               |
| │ Período: 2024-2             │  [Ver detalle]                       |
| └─────────────────────────────┘                                      |
+----------------------------------------------------------------------+
| PENDIENTES PARA TI (2)                                                |
| • Tienes 2 compromisos por aceptar.   [Revisar →]                     |
| • Tienes 1 evaluación para revisar.  [Revisar →]                     |
+----------------------------------------------------------------------+
| AYUDA                                                                 |
| • ¿Cómo funciona la evaluación?                                       |
| • ¿Qué pasa si no estoy de acuerdo?                                  |
+----------------------------------------------------------------------+
```

### 18.5 Panel del Evaluador (flujo de evaluación)

```
+----------------------------------------------------------------------+
| Paso 1 de 4: Configurar evaluación                                   |
+----------------------------------------------------------------------+
| Tipo de evaluación: [Evaluación 1er Semestre ▾]                      |
| Motivo (si parcial eventual): [__________]                           |
| Fechas de la evaluación: [dd/mm/aaaa] - [dd/mm/aaaa]                 |
|                                                                      |
|                                              [ Cancelar ] [ Sgte → ] |
+----------------------------------------------------------------------+

+----------------------------------------------------------------------+
| Paso 2 de 4: Calificar compromisos funcionales (85%)                 |
+----------------------------------------------------------------------+
| # | Compromiso                       | Peso | Calificación (1-100)   |
| 1 | [texto...]                       |  30% | [______]               |
| 2 | [texto...]                       |  40% | [______]               |
| 3 | [texto...]                       |  30% | [______]               |
|                                                                      |
| Total pesos: 100% ✓ | Suma calif.: __ |                              |
|                                                                      |
|                                  [ ← Atrás ] [ Sgte → ]               |
+----------------------------------------------------------------------+

(continúa con paso 3 comportamentales, paso 4 resumen con escalas)
```

---

## 19. Lista de componentes a crear

(Listado completo en sección 11. Resumen: 26 primitivos + 5 compuestos + 4 layouts.)

**Componentes de infraestructura:**
- `RoleGuard` (protección por rol).
- `ErrorBoundary` mejorado (con UI de recuperación).
- `PageHeader` (título + breadcrumb + acciones).
- `EmptyState` (con ilustración y CTA).
- `ConfirmDialog` (modal de confirmación reutilizable).

---

## 20. Lista de componentes a eliminar / deprecar

- **`components/Shared/DataTable.tsx`** versión actual → reemplazado por `DataTable` nuevo en `components/ui/`.
- **`NotificationBell` actual** → migrado a `components/ui/NotificationBell` con panel dedicado.
- **`AppHeader` actual** → reemplazado por `Header` en layout unificado por rol.
- **Tablas HTML crudas** dispersas en `pages/*` → todas pasan por `DataTable`.
- **`Card` ad-hoc** con clases Tailwind sueltas → reemplazado por `Card` del Design System.

---

## 21. Lista de componentes a fusionar

- `AdminHome` + `AdminDashboard` → un solo `AdminHome`.
- `DependenciaList` + `AdminDependencias` → un solo `AdminDependencias` con tabs.
- `MovilidadList` → integrar como tab en `AdminUsuarios` o como submenú.
- `CambioForzadoPassword`, `NuevaContrasena`, `VerificarCodigo` → refactor a un único componente `PasswordFlow` con variantes.

---

## 22. Indicadores de éxito posteriores al rediseño

### Cuantitativos

| KPI | Baseline (estimado) | Meta | Forma de medición |
|---|---|---|---|
| Tiempo promedio para completar una evaluación | TBD (medir antes) | -40% | Logs de timestamps |
| Clics para función crítica | 5-7 | ≤ 3 | Análisis de flujo manual + pruebas de usabilidad |
| Tasa de error en formularios (reintentos) | TBD | -50% | Telemetry de validación |
| Evaluaciones completadas a tiempo | TBD | +30% | Reporte de cumplimiento |
| Tickets de soporte relacionados con UI | TBD | -60% | Mesa de ayuda |
| Adopción móvil (sesiones desde celular) | TBD | +25% | Analytics |
| Tasa de aprobación de evaluaciones (Comisión) en primer intento | TBD | +40% | Auditoría |

### Cualitativos

- NPS del usuario interno (administrador/evaluador/evaluado): medir trimestralmente.
- Test de usabilidad moderado con 5 usuarios por rol (antes y después).

---

## 23. Estimación del impacto esperado

### Usabilidad

- Reducción estimada de carga cognitiva: **alta** (agrupación por tarea, badges contextuales, búsqueda global).
- Accesibilidad WCAG 2.1 nivel AA: **cumplimiento verificable**.

### Velocidad operativa

- Evaluaciones más rápidas por mejor feedback y autocompletado: **-30 a -50%** del tiempo.
- Reducción de clics en tareas frecuentes: **de 5-7 a 2-3** en 80% de los casos.

### Satisfacción del usuario

- Mensajes más claros, microinteracciones, mobile-first: impacto esperado **alto en satisfacción**.
- Reducción de errores por validación inline: impacto **alto**.

### Reducción de errores

- Validación inline + tooltips + campos agrupados: **-40 a -60%** de errores en formularios críticos.

---

## Anexo A — Notas de implementación técnica

### Cómo migrar sin romper la lógica

1. **No tocar backend** en quick wins.
2. Para componentes del Design System: crear en `components/ui/` y migrar **un consumidor a la vez** (PR por componente).
3. Para layouts por rol: crear como wrapper que internamente sigue usando el `Layout` actual, y migrar páginas en lotes.
4. **Feature flags** simples por URL (`?v2=1`) si se requiere coexistencia temporal.

### Pruebas

- Unitarias: Vitest + React Testing Library para primitivos.
- E2E: Playwright para flujos críticos (login → evaluar → enviar).
- Accesibilidad: axe-core en CI.

### Métricas de rendimiento

- Lighthouse ≥ 90 en performance y accesibilidad para las Home de cada rol.
- LCP ≤ 2.5 s en 4G simulado.
- Bundle inicial ≤ 250 KB gzip.

---

## Anexo B — Decisiones que requieren validación del director

1. **Marca**: ¿se mantiene "EDL Carepa — Alcaldía de Carepa" como naming, o se renombra?
2. **Color principal**: ¿se mantiene el azul institucional o se ajusta el matiz?
3. **Tipografía**: ¿Inter (recomendada) o se prefiere una fuente del sistema (`system-ui`)?
4. **Plazo**: ¿se acepta el roadmap de 7 sprints (14 semanas) o se necesita un corte más corto?
5. **Stack del Design System**: ¿Tailwind + Headless UI (lo más rápido) o Radix UI (más accesibilidad)?
6. **Internacionalización**: ¿el sistema sigue sólo en español (es-CO)?
7. **Móvil**: ¿hay usuarios que usen la app predominantemente desde celular?

---

**Fin del documento.**
