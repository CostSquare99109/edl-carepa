# Plan Rediseño EDL Carepa — Open Design

> **Proyecto**: Evaluación del Desempeño Laboral — Alcaldía de Carepa (CNSC 617/2018)
> **Stack**: React 19 + Vite 6 + TypeScript + Tailwind v3
> **Design system**: Open Design "Professional" + craft rules
> **Fecha**: 2026-08-08

## Contexto

El sistema EDL Carepa ya funciona. Tiene 152+ endpoints, 20+ páginas, auth JWT, RBAC, PDFs, todo. El problema NO es funcionalidad — es **calidad visual**. El diseño actual cumple pero tiene tells de AI-slop que lo hacen ver genérico:

- `ROLE_COLORS` usa `indigo-100`, `purple-100`, `sky-100` (pecados #1 anti-AI-slop)
- KPI cards usan `text-purple-700` sin连接 con paleta institucional
- Tipografía Mix entre `Inter` y `Montserrat` sin escala clara
- No hay consistencia de elevación/bordes/sombras

## Paleta institucional Carepa

| Token | Valor | Uso |
|-------|-------|-----|
| `--accent` | `#0A2B5E` (azul institucional) | CTA, headers, foco |
| `--accent-on` | `#FFFFFF` | Texto sobre azul |
| `--accent-secondary` | `#F9B233` (amarillo) | CTA secundario, badges |
| `--danger` | `#DC2626` (rojo) | Errores, acciones destructivas |
| `--success` | `#16A34A` | Estados de éxito |
| `--warn` | `#D97706` | Advertencias |
| `--bg` | `#F8FAFC` | Fondo general |
| `--surface` | `#FFFFFF` | Cards, paneles |
| `--fg` | `#0F172A` | Texto principal |
| `--fg-2` | `#334155` | Texto secundario |
| `--muted` | `#64748B` | Texto terciario, hints |
| `--border` | `#E2E8F0` | Bordes |
| `--border-soft` | `#F1F5F9` | Bordes sutiles |

## Craft rules aplicadas

1. **anti-AI-slop**: Eliminar indigo/purple/sky de `ROLE_COLORS`. Usar `--accent` y neutrales.
2. **color discipline**: Neutrales 70-90%, accent máx 2 usos visibles por pantalla.
3. **typography**: Escala 1.25, Inter body + Montserrat display, line-height 1.5 body / 1.1 display.
4. **motion**: 150-250ms default, `prefers-reduced-motion` respetado.
5. **laws-of-UX**: Proximidad (8-16-24-32), similitud consistente, región común.

## Fases

### Fase 1 — Tokens y tailwind config (base)
**Archivos**: `frontend/tailwind.config.js`, `frontend/src/index.css`

- [ ] Mapear tokens Open Design a `tailwind.config.js` (spacing 4/8/12/16/24/32, radius sm/md/lg/pill, shadow flat/ring/raised, motion fast/base)
- [ ] Actualizar `index.css` con `:root` tokens del design system professional adaptados a Carepa
- [ ] Eliminar `indigo`, `purple`, `sky` de `ROLE_COLORS` → reemplazar con neutrales + `--accent`
- [ ] Unificar clases `.edl-btn-*`, `.edl-card`, `.edl-input` con tokens nuevos
- [ ] Tipografía: Inter 400/500/600/700 body + Montserrat 600/700/800 display
- [ ] Sho tokens de animación: `--motion-fast: 150ms`, `--motion-base: 240ms`

**Verificación**: `npm run build` sin warnings. Tailwind genera tokens correctos.

### Fase 2 — Layout y navegación (shell)
**Archivos**: `Layout.tsx`, `Sidebar.tsx`, `AppHeader.tsx`

- [ ] Sidebar: fondo `--surface`, borde `--border`, item activo `--accent` fondo + `--accent-on` texto
- [ ] Header: backdrop-blur al hacer scroll, sombra `--elev-ring` sutil
- [ ] Items sidebar: iconos Material Symbols monoline, gap 8px, padding 12px
- [ ] Collapse/expand: transición `--motion-base` width
- [ ] Mobile drawer: overlay `rgba(0,0,0,0.4)` + transición slide `--motion-base`
- [ ] Perfil dropdown: animación `--motion-fast`, borde `--border`

**Verificación**: Navegación responsive. Sidebar expande/colapsa smooth.

### Fase 3 — Login y auth pages (primera impresión)
**Archivos**: `Login.tsx`, `SelectRolePage.tsx`, `CambioForzadoPassword.tsx`, `VerificarCodigo.tsx`, `NuevaContrasena.tsx`

- [ ] Login: surface plano (no gradiente), card centrada con `--elev-raised`
- [ ] Escudo con ring sutil `--border`, no halo tricolor (es institucional, no festivo)
- [ ] Inputs: focus-visible con `--focus-ring` (4px, 0.22 opacity)
- [ ] Botón primary `--accent`, secondary outline `--border`
- [ ] SelectRolePage: cards de rol con hover `--surface-warm`, icono monoline
- [ ] Eliminar `edl-divider` doble (azul + amarillo) → un solo divisor sutil `--border`

**Verificación**: Login se ve serio, gubernamental, confiable.

### Fase 4 — Dashboard (KPIs y resumen)
**Archivos**: `Dashboard.tsx`

- [ ] KPI cards: `--surface`, borde `--border`, `--elev-ring` sin left-border-accent (pecado #5)
- [ ] Iconos KPI: `currentColor` con `--accent`, no `text-purple-700`
- [ ] Números: Montserrat 700, `--fg`, tabular-nums
- [ ] Labels: `--muted`, 12px uppercase tracking 0.1em (eyebrow style)
- [ ] Tabla actividad reciente: zebra `--border-soft`, hover `--surface-warm`
- [ ] Notificaciones: badge `--accent` para no-leídas, `--muted` para leídas

**Verificación**: Dashboard se ve como panel de control gubernamental, no template SaaS.

### Fase 5 — Páginas de evaluación (core del negocio)
**Archivos**: `EvaluarPage.tsx`, `VerEvaluaciones.tsx` (si existe), páginas Evaluaciones/

- [ ] Stepper de evaluación: pasos circulares con `--accent` activo, `--border` inactivo
- [ ] Tabla de competencias: headers `--muted` uppercase, filas hover `--surface-warm`
- [ ] Badges de estado: semánticos (`--success`, `--warn`, `--danger`), no decorativos
- [ ] Botones de acción: primary `--accent` guardar, secondary outline cancelar
- [ ] Progress bar: `--accent` sobre `--border-soft`

**Verificación**: Flujo evaluación claro, sin distracciones visuales.

### Fase 6 — Compromisos y evidencias
**Archivos**: `ConcertarCompromisos.tsx`, `MisCompromisos.tsx`, `EvidenciasEvaluado.tsx`

- [ ] Cards de compromiso: `--surface`, borde `--border`, header con título + estado badge
- [ ] Lista de evidencias: grid de thumbnails con hover scale 1.02, borde `--border`
- [ ] Upload area: dashed `--border`, hover `--accent` borde + `--surface-warm` fondo
- [ ] Estados: badges semánticos (Pendiente `--warn`, Aprobado `--success`, Rechazado `--danger`)

**Verificación**: Compromisos legibles, evidencias navegables.

### Fase 7 — Manual de Funciones
**Archivos**: `ManualFunciones/` páginas, `CargoManualCard.tsx`, `NivelBadge.tsx`, etc.

- [ ] Cards de cargo: layout limpio, jerarquía title → nivel badge → descripción
- [ ] Badges: `--accent` para nivel, `--muted` para naturaleza, sin `indigo/purple`
- [ ] Tabla de cargos: zebra, hover, sortable headers
- [ ] Filtros: Select con `--accent` focus, inputs limpios

**Verificación**: Catálogo de cargos navegable y profesional.

### Fase 8 — Componentes UI base
**Archivos**: `ui/Button.tsx`, `ui/Card.tsx`, `ui/Input.tsx`, `ui/Modal.tsx`, etc.

- [ ] Button: variantes primary/secondary/danger/outline/ghost con tokens nuevos
- [ ] Card: `--surface` + `--border` + `--elev-ring`, sin left-border-accent
- [ ] Input: focus `--focus-ring`, borde `--border`, error `--danger`
- [ ] Modal: overlay `rgba(0,0,0,0.5)`, panel `--surface` + `--elev-raised`, animación `--motion-base`
- [ ] DataTable: headers `--muted`, zebra `--border-soft`, hover `--surface-warm`
- [ ] Tabs: activo `--accent` underline, inactivo `--muted`
- [ ] Tooltip: `--fg` fondo + `--surface` texto (dark tooltip) o `--surface` + `--border`

**Verificación**: Componentes base consistentes con tokens.

### Fase 9 — Admin y configuración
**Archivos**: `Admin/` páginas, `Entidades/`, `Periodos/`, `Usuarios/`

- [ ] Tablas admin: misma estructura que Fase 4
- [ ] Formularios: labels `--fg-2`, inputs con `--focus-ring`
- [ ] Acciones destructivas: `--danger` explícito, no rojo genérico
- [ ] Títulos de página: `heading-display` Montserrat 700, `--fg`

**Verificación**: Admin consistente con resto del sistema.

### Fase 10 — PDFs y reportes
**Archivos**: `ReporteService.php`, `PdfHelper.php` (backend)

- [ ] PDFs: mantener escudo, limpiar tipografía, alinear con tokens institucionales
- [ ] Headers PDF: azul institucional + amarillo acento (no genérico)
- [ ] Tablas en PDF: zebra, bordes sutiles, padding 8px
- [ ] Footer PDF: municipio + fecha + página

**Verificación**: PDFs se ven como documentos oficiales, no genéricos.

## Orden de ejecución

1. **Fase 1** (tokens) → base de todo, sin breaking changes
2. **Fase 8** (UI components) → componentes base actualizados
3. **Fase 2** (layout) → shell visible en toda la app
4. **Fase 3** (login) → primera impresión
5. **Fase 4** (dashboard) → pantalla principal
6. **Fases 5-7** (evaluación, compromisos, manual) → core del negocio
7. **Fases 9-10** (admin, PDFs) → pulido final

## Lo que NO se toca

- **Backend PHP**: cero cambios. El rediseño es solo frontend + PDFs.
- **Lógica de negocio**: no se modifica auth, RBAC, endpoints, validaciones.
- **Estructura de BD**: sin migraciones.
- **API contracts**: los endpoints siguen iguales.

## Verificación final

- [ ] `npm run build` sin warnings
- [ ] Build size CSS < 50KB, JS < 300KB
- [ ] Lighthouse > 90 en performance, accessibility
- [ ] 0 hex values fuera de `:root` (tokens only)
- [ ] 0 `indigo`, `purple`, `sky` en todo el frontend
- [ ] `prefers-reduced-motion` respeta todas las animaciones
- [ ] Login responsive (móvil + desktop)
- [ ] Dashboard responsive
- [ ] Sidebar expande/colapsa sin glitches
