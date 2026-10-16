# Auditoría de código — Dominio "Manual de Funciones y Competencias Laborales"

> Sistema: EDL Carepa (Evaluación del Desempeño Laboral, Alcaldía de Carepa).
> Alcance: cómo está implementado HOY todo lo relacionado con cargos/empleos, manual de funciones, competencias, requisitos, dependencias, niveles y naturaleza del cargo.
> Modo: solo lectura. Rutas relativas a la raíz del repo. Evidencia como `ruta:línea`. `full_dump.sql` = `database/full_dump.sql`.
> Fecha de auditoría: 2026-08-24.

---

## 1. Visión general del dominio y arquitectura

El dominio normativo se implementa en dos bloques:

1. **Catálogo normativo (solo lectura)** — el Manual de Funciones (Decreto 159 de 2024) vive íntegramente en la BD (`cargos_manual` + `cargos_manual_detalle`), se expone vía API para consulta/PDF y se consume desde `frontend/src/pages/ManualFunciones/*`. No existe UI ni endpoints CRUD para crear/editar cargos del manual (solo lectura + asignación a usuarios).
2. **Vinculación con la evaluación** — competencias (catálogo `competencias`) y conductas (catálogo `conductas`) alimentan los compromisos comportamentales (tabla `compromisos`, `tipo='comportamental'`, columna `competencia_codigo`), que se califican en escala CNSC 4–15 y ponderan 85/15 en la nota definitiva.

Patrón backend: `Controller -> Service -> Repository -> PDO` (ej.: `backend/src/Controller/CargoManualController.php:17-21` → `backend/src/Service/CargoManualService.php:17-22` → `backend/src/Repository/CargoManualRepository.php:8-10`). Router propio secuencial por regex en `backend/public/index.php`.

---

## 2. Cargos / empleos / manual de funciones

### 2.1 Modelo de datos

| Tabla | CREATE | Rol | Columnas clave |
|---|---|---|---|
| `cargos_manual` | full_dump.sql:2921 | Cabecera de cada empleo | `planta enum('global','temporal')`, `dependencia_id` FK→`dependencias`, `nivel varchar(20)` (directivo/asesor/profesional/tecnico/asistencial/asistente), `codigo varchar(10)` "Código DAFP", `grado varchar(10)` "Grado salarial 01-04", `denominacion`, `num_cargos`, `naturaleza enum(6 valores)`, `jefe_inmediato`, `proposito_principal text`, `fuente` default `'decreto_159_2024'`, soft-delete `eliminado_en` |
| `cargos_manual_detalle` | full_dump.sql:3110 | Secciones I–VIII de la ficha (EAV) | `cargo_manual_id` FK ON DELETE CASCADE; `seccion enum('identificacion','proposito','funciones','contribuciones','conocimientos','competencias','requisitos_estudio','requisitos_experiencia','requisitos')`; `contenido longtext` "JSON array o texto según sección"; `orden` |
| `cargos_manual_requisitos` | full_dump.sql:3708 | Requisitos estructurados (**0 filas**) | `nivel_educativo enum(bachiller..doctorado)`, `nbc_id` FK→NBC, `titulo_requerido`, `tarjeta_profesional`, `experiencia_meses`, `experiencia_tipo enum(profesional,relacionada,laboral,docente)` |
| `usuario_cargo_manual` | full_dump.sql:8712 | Asignación usuario↔cargo | UNIQUE `(usuario_id, vigente)`; `vigente tinyint default 1`; `asignado_por`; seed 188 filas |

### 2.2 Campos efectivos de un cargo (ficha)

- **Cabecera** (`cargos_manual`): planta, dependencia, nivel, código DAFP, grado, denominación, nº plazas, naturaleza, jefe inmediato, propósito principal, fuente — SELECT en `CargoManualRepository.php:72-77`.
- **Detalle EAV** (`cargos_manual_detalle.seccion`): identificación (I), propósito (II), funciones (III), contribuciones (IV), conocimientos (V), competencias (VI), requisitos_estudio (VII), requisitos_experiencia (VIII); leído por `CargoManualRepository::detalle()` (:83-93). Contenido: JSON-array (funciones/contribuciones/conocimientos), texto libre (propósito/requisitos) u objeto `{comunes:[], nivel:[]}` para competencias.
- **Adjuntos en Service**: `CargoManualService::ver()` agrega `detalle`, `requisitos` y `conocimientos` (`backend/src/Service/CargoManualService.php:29-39`).

### 2.3 Origen de los datos

- **BD semilla**: 142 cargos en `INSERT INTO cargos_manual VALUES` (full_dump.sql:2955) con `fuente='decreto_159_2024'`; 564 filas de detalle (full_dump.sql:3131). Todo el texto normativo (funciones, propósitos, requisitos) es texto semilla en BD, no JSON/hardcode en código.
- Sin pantallas CRUD del catálogo; permiso `cargos_manual.admin` existe (full_dump.sql:5913) pero ninguna ruta lo usa.

### 2.4 Flujo UI → endpoint → servicio → repositorio → BD

**Índice del manual**
1. UI: `frontend/src/pages/ManualFunciones/Indice.tsx:88` → `GET /cargos-manual?pagina&por_pagina&planta&nivel&naturaleza&buscar`; catálogos :102-103 → `/cargos-manual/catalogos` y `/conteos`.
2. Rutas: `backend/public/index.php:135-137` y `:143` (fijas antes de `{id}`).
3. Controller: `CargoManualController::listar()` (:23-31), `conteos()` (:57-60), `catalogos()` (:62-65).
4. Service: `listar()` (:24-27); catálogos leen directamente `niveles_jerarquicos`, `naturalezas_cargo`, `nucleos_basicos_conocimiento` (:95-136).
5. Repository: `listarManual()` filtros+paginación (:16-68); `conteos()` subconsultas (:161-175).

**Ficha**
1. UI: `Ficha.tsx:63` → `GET /cargos-manual/{id}`; PDF `Ficha.tsx:79` (fetch blob). Rutas React `App.tsx:108-109`.
2. Controller: `ver()` (`CargoManualController.php:33-40`), `pdf()` (:46-55).
3. PDF: `ReporteManualService::fichaHtml()` (`backend/src/Service/ReporteManualService.php:25-170`): títulos I–VIII (:35-45), listas JSON, tabla requisitos, heredoc HTML con variables precalculadas (:89-98), Dompdf vía `PdfHelper`.

**Asignación cargo↔usuario**
1. UI: `frontend/src/components/CargoManualCard.tsx:36` y `CargoManualTooltip.tsx:48` → `GET /usuarios/{id}/cargo-manual`.
2. Rutas anidadas ANTES de `/usuarios/{id}`: `index.php:130-131` (`GET/POST`, permisos `cargos_manual.ver`/`cargos_manual.asignar` definidos en full_dump.sql:5912-5914).
3. Controller: `cargoDeUsuario()` (:83-90); `asignar()` (:92-103).
4. Service: `CargoManualService::asignar()` (:41-83): `jefe_dependencia` solo asigna cargos de su dependencia (:55-61); tras insertar sincroniza `usuarios.nivel`/`usuarios.naturaleza` con UPDATE directo y try/catch silencioso (:66-75).
5. Repository: `cargoDeUsuario()` JOIN `vigente=1` (:120-133); `asignarUsuario()` transaccional desactiva la anterior e inserta la nueva (:135-159).

---

## 3. Competencias

### 3.1 Definición (BD, no hardcode)

- Tabla `competencias` (full_dump.sql:3745): PK `codigo varchar(60)`, `nombre`, `descripcion`, `decreto varchar(20) DEFAULT '815'`. Seed **14 competencias** (full_dump.sql:3761): `ADP_CAM Adaptacion al cambio`, `APR_CONT Aprendizaje continuo`, `APR_TEC Aporte tecnico profesional`, `CMP_ORG Compromiso con la organización`, `COM_EFEC Comunicación efectiva`, `CON_ENT Conocimiento del entorno`, `INICIAT Iniciativa`, `LIDER Liderazgo`, `ORI_RES Orientacion a resultados`, `ORI_USU Orientacion al usuario y al ciudadano`, `PEN_EST Pensamiento estratégico`, `PLANE Planeación y organización`, `TOM_DEC Toma de decisiones`, `TRB_EQP Trabajo en equipo`. Etiquetadas por decreto: `815/2018` (comunes CNSC) o `2539/2005` (por nivel).
- Tabla `conductas` (full_dump.sql:4016): FK `competencia_codigo`→`competencias.codigo` ON DELETE CASCADE (`fk_conducta_competencia`), `texto`, `orden`, `activo`. Seed **70 conductas** (~5 por competencia; ej. ORI_USU ids 1–5, full_dump.sql:4038).
- Repositorio: `backend/src/Repository/CompetenciaRepository.php` — `listarTodas()` :14, `listarPorDecreto()` :21, `decretosDisponibles()` :28, `comunes()` :36 (**consulta tabla `competencias_comunes_map` inexistente en el dump**), `porNivel()` :48 (**consulta vista `v_competencias_por_nivel` inexistente**), `niveles()` :61.
- Endpoint duplicado del catálogo: `CompromisoComportamentalController::competenciasComportamentales()` (`backend/src/Controller/CompromisoComportamentalController.php:177-182`) consulta `competencias` directamente (mismo dato que `GET /competencias`; expuesto en DOS rutas: index.php:223 y :255).

### 3.2 Categorías y asignación

- **Comunes vs por nivel**: separación conceptual por columna `decreto`. Los métodos "Fase 2" (`comunes()`/`porNivel()`) pretendían modelarla con objetos BD inexistentes (ver §10).
- **Cargo→competencias**: NO hay tabla relacional; vive como texto en `cargos_manual_detalle.seccion='competencias'` con JSON `{comunes:[], nivel:[]}`. En el seed los nombres vienen concatenados en UN solo string con espacios simples (fila `(7,2,'competencias',...)` tras full_dump.sql:3131). El FE intenta re-partirlos con regex `\s{2,}|\n` (`DetallesCargoModal.tsx:69,72`) → no divide nombres con espacio simple.
- **Evaluación→competencias**: al concertar, el jefe elige competencias y se crean filas en `compromisos` con `tipo='comportamental'` + `competencia_codigo` (FK lógica, sin constraint, full_dump.sql:3827+). FE: `ConcertarCompromisos.tsx:168` (`GET /competencias`) y :877 (`GET /competencias/por-nivel?nivel=` — endpoint roto, §10). BE: `CompromisoComportamentalService::crear()` (`backend/src/Service/CompromisoComportamentalService.php:54-116`) exige `competencia_codigo` (:64-67), resuelve `descripcion` desde el nombre de la competencia (:90-100), `peso` default 1 (:107); `guardar()` masivo :118-180.
- **Conductas en calificación**: JOIN a `conductas` por `competencia_codigo AND activo=1` en `CompromisoComportamentalRepository.php:184-191`; la valoración se persiste como JSON en `compromisos.conductas_json` (`CompromisoComportamentalService::calificar()` :395-417, :440-442). PDFs también resuelven conductas/competencias por código (`backend/src/Service/ReporteService.php:447-473` y `:563-588`).

### 3.3 Hardcodeo de nombres de competencias

Grep "Liderazgo/Orientación/Trabajo en equipo/Transparencia/etc.":
- Backend: cero ocurrencias en lógica. Catálogo correctamente en BD.
- Frontend: cero ocurrencias en `frontend/src`. Solo nota informativa textual "Decreto 2539 de 2005 / Decreto 815 de 2018" en `ConcertarCompromisos.tsx:867`.

---

## 4. Requisitos (estudio/experiencia)

- Modelo estructurado `cargos_manual_requisitos` (nivel educativo, NBC, título, tarjeta profesional, experiencia meses/tipo): **tabla vacía**, sin INSERT en el dump.
- Modelo realmente usado: texto libre en `cargos_manual_detalle` (`requisitos_estudio`, `requisitos_experiencia`) — semillas pobladas para todos los cargos; mostrados como tab VII/VIII (`DetallesCargoModal.tsx:54,106-133`) y en PDF (`ReporteManualService.php:42-44`).
- Sin formularios de edición (solo lectura). Catálogo NBC de apoyo: `nucleos_basicos_conocimiento` (55 filas, full_dump.sql:5676), expuesto en `GET /catalogos/nbc` (index.php:141; `CargoManualService::catalogosNbc()` :124-136).

---

## 5. Dependencias y niveles jerárquicos

- **Dependencias**: `dependencias` (full_dump.sql:4754): `entidad_id` FK, `codigo` DEP-001…, `nombre`, `jefe_id` FK→usuarios SET NULL, `estado activa/inactiva`, soft-delete. Seed **18 filas** de una sola entidad (full_dump.sql:4780). CRUD rutas index.php:158,161-166; `DependenciaService.php:19-96`.
- **Niveles jerárquicos**: `niveles_jerarquicos` (full_dump.sql:5549) con `orden`. Seed **5 niveles** (full_dump.sql:5565): directivo(1), asesor(2), profesional(3), tecnico(4), asistencial(5). El ENUM de `cargos_manual.nivel`/`usuarios.nivel` contempla además `asistente`, que NO está en el catálogo semilla.
- Exposición: `GET /catalogos/niveles` (index.php:139) y `GET /niveles-jerarquicos` (index.php:320 → `CompetenciaRepository::niveles()`).
- Uso funcional del nivel: filtro del catálogo de competencias (roto) y etiquetado en reportes/búsquedas (`EvaluacionService.php:778-785`).

---

## 6. Naturaleza del cargo / planta global vs temporal

- **SÍ distingue planta global vs temporal** en dos planos:
  - Catálogo: `cargos_manual.planta enum('global','temporal')`; filtro de listado (`CargoManualRepository.php:21-24`); conteo separado `planta_global`/`planta_temporal` (:165-167). Seed con ambas plantas (IDs 89–95 temporal, full_dump.sql:2955+). Badge FE `PlantaBadge.tsx:65-68`.
  - Vinculación: `usuarios.tipo_nombramiento enum(... 'encargo_planta_global','encargo_planta_temporal', ...)` (full_dump.sql:9229+); opciones FE `AdminUsuarios.tsx:99-107`.
- **Naturaleza**: `naturalezas_cargo` (full_dump.sql:5513) — seed 6 registros (full_dump.sql:5530): `carrera_administrativa`, `libre_nombramiento`, `libre_nombramiento_gerencia_publica`, `libre_nombramiento_remocion`, `periodo_fijo` (`requiere_periodo=1`), `temporal` (`es_carrera=0`). API `GET /catalogos/naturalezas` (index.php:140). Badge FE `NaturalezaBadge.tsx:13-19,27-58`.
- Al asignar cargo manual se copian nivel y naturaleza al usuario (`CargoManualService.php:66-75`).
- Tablas legacy del sistema antiguo, en BD pero SIN uso en backend/src: `tbl_cargo` (full_dump.sql:8487, 20 filas), `tbl_detalle_cargo` (:8536, 146 filas), `funcionarios` (:5084, 214 filas), `encargos` (:4811), `ext_dependencias` (:5037).

---

## 7. Reglas de negocio embebidas (IFs/switches, rangos, ponderaciones)

| # | Regla | Evidencia | Detalle |
|---|---|---|---|
| R1 | Ponderación 85/15 funcional/comportamental | `EvaluacionService.php:300-301` (ENV con defaults duros), aplicada en :315 y :346; duplicada con literales en `calcularNotaDefinitiva()` :905-906 | "Acuerdo 617 de 2018" |
| R2 | Escala comportamental 4–15 → %: `((puntaje-4)/11)*100` | `EvaluacionService.php:346`; duplicada FE `EvaluarPage.tsx:368` | |
| R3 | Umbrales finales: ≥90 sobresaliente, >65 satisfactorio, ≤65 no satisfactorio | `EvaluacionService.php:352-355` (ENV `UMBRAL_SOBRESALIENTE`/`UMBRAL_SATISFACTORIO`); banda ALTO/MEDIO/BAJO dura :909-918; FE `EvaluarPage.tsx:378-382` | |
| R4 | Bandas CNSC: ≥13 muy_alto, ≥10 alto, ≥7 aceptable, <7 bajo | `CompromisoComportamentalService.php:420-428`; consolidación por evaluación `EvaluacionService.php:335-342` | |
| R5 | Calificación comportamental válida solo 4–15 | `CompromisoComportamentalService.php:355-360` | Mensaje cita rangos 4-6/7-9/10-12/13-15 |
| R6 | Cumplimiento comportamental: ≥4 cumplido, <4 incumplido | `CompromisoComportamentalService.php:419` | |
| R7 | Impacto aporta ∈ {si, moderadamente, no}; excede ∈ {si, no}; justificación "excede" mín. 40 caracteres (global y por conducta) | `CompromisoComportamentalService.php:378-393,395-406` | |
| R8 | Calificación funcional 0–100; ≥65 cumplido | `CompromisoService.php:325-330,332` | |
| R9 | Pesos funcionales individuales en (0,100] y suma exactamente 100 al aprobar | `CompromisoService.php:253-263` | Duplicado FE `ConcertarCompromisos.tsx:489-491` |
| R10 | Máx. compromisos funcionales = 3 (ENV `MAX_COMPROMISOS_FUNCIONALES(_PRUEBA)`) | `CompromisoService.php:342-368` | FE replica max 3 (`ConcertarCompromisos.tsx:388,485-487,796`) y min 1 (:481) |
| R11 | Min/máx funcionales antes de firmar (ENV min=1) | `CompromisoService.php:446-475` | |
| R12 | Comportamentales: mínimo 3, máximo 5 | SOLO FE `ConcertarCompromisos.tsx:422,429-436,493-494,887`; BE solo exige array no vacío (`CompromisoComportamentalController.php:66-70`) | Sin refuerzo de servidor |
| R13 | Valoración conductas: nunca=4, algunas_veces=7, frecuentemente=10, siempre=13; promedio simple | FE `EvaluarPage.tsx:59-64,342-347`; espejo `evaluacionConstantes.ts:21-26`; obligatoriedad total `EvaluarPage.tsx:472-482` | |
| R14 | Fechas 2º semestre: inicio ≥01-08, fin ≤31-01 año siguiente | `EvaluacionService.php:880-887`; duplicado FE `EvaluarPage.tsx:384-397` (año derivado del nombre del periodo) | |
| R15 | Jefe de dependencia solo asigna cargos de su dependencia | `CargoManualService.php:55-61` | |
| R16 | Fallback duro a 'Técnico' para nivel desconocido en búsquedas | `EvaluacionService.php:778-785` (`match ... default => 'Técnico'`) | |
| R17 | Estados habilitados para calificar; estado de evaluación asociada bloquea nuevas calificaciones | `CompromisoService.php:321`, `CompromisoComportamentalService.php:351,362-376` | |

Nota: las ponderaciones/rangos NO varían por nivel/cargo/grado/dependencia en el código actual; el nivel solo filtra catálogo de competencias (roto) y etiqueta reportes.

---

## 8. Inventario de endpoints del dominio (backend/public/index.php)

### Manual de funciones
| Método | Ruta | Controller@método | Propósito |
|---|---|---|---|
| GET | `/cargos-manual` (:135) | CargoManualController@listar | Lista paginada con filtros planta/nivel/naturaleza/búsqueda |
| GET | `/cargos-manual/conteos` (:136) | @conteos | Conteos agregados del manual |
| GET | `/cargos-manual/catalogos` (:137) | @catalogos | Niveles+naturalezas+NBC en una llamada (sin permiso declarado) |
| GET | `/catalogos/niveles` (:139) | @catalogosNiveles | Catálogo niveles jerárquicos |
| GET | `/catalogos/naturalezas` (:140) | @catalogosNaturalezas | Catálogo naturalezas de cargo |
| GET | `/catalogos/nbc` (:141) | @catalogosNbc | Núcleos básicos de conocimiento (filtro por área) |
| GET | `/cargos-manual/{id}/pdf` (:142) | @pdf | PDF de la ficha (Dompdf) |
| GET | `/cargos-manual/{id}` (:143) | @ver | Ficha completa (cabecera+detalle+requisitos+conocimientos) |
| GET | `/usuarios/{id}/cargo-manual` (:130) | @cargoDeUsuario | Cargo vigente del usuario |
| POST | `/usuarios/{id}/cargo-manual` (:131) | @asignar | Asignar cargo a usuario (permiso `cargos_manual.asignar`) |

### Competencias y conductas
| Método | Ruta | Controller@método | Propósito |
|---|---|---|---|
| GET | `/competencias` (:316) | CompetenciaController@listar | Lista catálogo (filtro opcional `?decreto=`; ignora `por_pagina`) |
| GET | `/competencias/decretos` (:317) | @decretos | Distinct de decretos |
| GET | `/competencias/comunes` (:318) | @comunes | **Roto**: tabla `competencias_comunes_map` no existe |
| GET | `/competencias/por-nivel` (:319) | @porNivel | **Roto**: vista `v_competencias_por_nivel` no existe |
| GET | `/niveles-jerarquicos` (:320) | @niveles | Catálogo niveles (orden jerárquico) |
| GET | `/compromisos/competencias-comportamentales` (:223) | CompromisoComportamentalController@competenciasComportamentales | Catálogo competencias (duplicado de /competencias) |
| GET | `/compromisos-comportamentales/competencias` (:255) | ídem | Duplicado de la anterior |

### Compromisos funcionales (consumen el dominio: peso, calificación)
| Método | Ruta | Controller@método | Propósito |
|---|---|---|---|
| POST/PUT/GET/DELETE | `/compromisos*` (:221-241) | CompromisoController@* | CRUD/aprobar/calificar compromisos funcionales 0–100 con pesos que suman 100 |
| GET | `/compromisos/{id}/pesos` (:240) | @resumenPesos | Suma actual de pesos |

### Compromisos comportamentales (competencia_codigo + escala 4–15)
| Método | Ruta | Controller@método | Propósito |
|---|---|---|---|
| GET | `/compromisos-comportamentales` (:252) | CompComportamentalController@listar | Listado con filtros por rol |
| POST | `/compromisos-comportamentales` (:253) | @crear | Crear uno (requiere `competencia_codigo`) |
| POST | `/compromisos-comportamentales/enviar` (:254) | @enviar | Enviar a aprobación |
| GET | `/compromisos-comportamentales/pendientes` (:256) | @pendientesAprobacion | Bandeja de aprobación |
| POST | `/compromisos-comportamentales/guardar` (:257) | @guardar | Guardado masivo desde concertación |
| GET | `/compromisos-comportamentales/evaluacion/{id}` (:258) | @listarPorEvaluacion | Lista con conductas asociadas |
| GET/PUT/DELETE | `/compromisos-comportamentales/{id}` (:259-261) | @ver/@actualizar/@eliminar | Detalle, edición, soft-delete |
| PUT | `/compromisos-comportamentales/{id}/aprobar|rechazar|devolver` (:262-264) | @aprobar/@rechazar/@devolver | Flujo de aprobación |
| PUT | `/compromisos-comportamentales/{id}/calificar` (:265) | @calificar | Calificación CNSC 4–15 + nivel + conductas_json |
| GET | `/compromisos-comportamentales/{id}/pesos` (:266) | @resumenPesos | Suma pesos comportamentales |
| POST | `/concertaciones/{id}/compromisos-comportamentales/validar` (:267) | @validarAntesDeFirmar | Validación pre-firma |

### Dependencias
| Método | Ruta | Controller@método | Propósito |
|---|---|---|---|
| GET | `/entidades/{id}/dependencias` (:158) | EntidadController@dependencias | Dependencias por entidad |
| GET/POST | `/dependencias` (:161-162) | DependenciaController@listar/@crear | CRUD |
| GET/PUT/DELETE | `/dependencias/{id}` (:163-165) | @ver/@actualizar/@eliminar | CRUD (soft-delete) |
| PUT | `/dependencias/{id}/estado` (:166) | @cambiarEstado | Activa/inactiva |

---

## 9. Inventario de tablas BD relevantes (database/full_dump.sql)

| Tabla | CREATE | INSERT (línea) | Filas seed | Uso en backend |
|---|---|---|---|---|
| `cargos_manual` | :2921 | :2955 | 142 | CargoManualRepository — núcleo del manual |
| `cargos_manual_detalle` | :3110 | :3131 | 564 | Ídem (secciones I–VIII EAV) |
| `cargos_manual_requisitos` | :3708 | — | **0** | Se consulta (`requisitos()`), siempre vacía |
| `usuario_cargo_manual` | :8712 | :8738 | 188 | Asignación usuario↔cargo vigente |
| `competencias` | :3745 | :3761 | 14 | CompetenciaRepository + servicios de compromisos/PDF |
| `conductas` | :4016 | :4038 | 70 | JOIN por competencia_codigo en calificación y PDFs |
| `dependencias` | :4754 | :4780 | 18 | DependenciaRepository/CargoManualRepository |
| `niveles_jerarquicos` | :5549 | :5565 | 5 | Catálogo niveles |
| `naturalezas_cargo` | :5513 | :5530 | 6 | Catálogo naturalezas |
| `nucleos_basicos_conocimiento` | :5658 | :5676 | 55 | Catálogo NBC |
| `compromisos` | :3827 | (transaccional, ~36) | — | Funcionales + comportamentales (`tipo`, `competencia_codigo`, `conductas_json`, `nivel_comportamental`) |
| `evaluaciones` | :4889 | (datos) | — | Notas y `nivel_resultado` |
| `parametros` | :5744 | :5764 | 14 | Incluye `peso_funcionales=85`/`peso_comportamentales=15` (**no leídos por el código**) |
| Legacy sin uso BE: `funcionarios` :5084 (214), `tbl_cargo` :8487 (20), `tbl_detalle_cargo` :8536 (146), `encargos` :4811 (4), `ext_dependencias` :5037 | | | | Solo BD |

Objetos referenciados por código pero AUSENTES del dump: tabla `competencias_comunes_map`, vista `v_competencias_por_nivel`, tablas `conocimientos_catalogo` y `cargos_manual_conocimientos`.

---

## 10. Puntos sospechosos

1. **[CRÍTICO] Referencias a objetos BD inexistentes**:
   - `CompetenciaRepository::comunes()` → `competencias_comunes_map` (:36-46) y `porNivel()` → `v_competencias_por_nivel` (:48-59). El FE llama `GET /competencias/por-nivel?nivel=` en el flujo principal de concertación (`ConcertarCompromisos.tsx:877`); falla silenciosamente (catch en :881) y el modal abre sin datos.
   - `CargoManualRepository::conocimientos()` → `cargos_manual_conocimientos` + `conocimientos_catalogo` (:107-118); invocado SIEMPRE por `CargoManualService::ver()` (:37). `GET /cargos-manual/{id}` y su PDF dependen de tablas ausentes del dump → riesgo de error SQL en producción si la BD real = dump.
2. **[ALTO] Duplicación de cálculo normativo FE/BE**: pesos 85/15, fórmula (p−4)/11·100, umbrales 90/65, fechas 2º semestre y valoración de conductas están duplicados entre `EvaluacionService.php` y `EvaluarPage.tsx` (ver §7). Riesgo de divergencia; además `EvaluarPage.tsx:121-122` usa literales propios en vez de `evaluacionConstantes.ts:28-31`.
3. **[ALTO] Parámetros muertos**: `parametros.peso_funcionales=85` y `peso_comportamentales=15` (full_dump.sql:5764+) existen como configuración editable vía API (`/parametros`, index.php:116-121), pero `calificarDefinitiva()` lee ENV (`PESO_FUNCIONALES/PESO_COMPORTAMENTALES`, EvaluacionService.php:300-301): cambiar el parámetro en BD NO cambia el cálculo.
4. **[ALTO] Regla CNSC solo en frontend**: mínimo 3 / máximo 5 competencias comportamentales se valida únicamente en `ConcertarCompromisos.tsx`; el backend acepta cualquier cantidad no vacía.
5. **[MEDIO] Datos normativos corruptos en semilla**:
   - Competencias del manual concatenadas en un string con espacios simples (§3.2) → el modal FE muestra un blob ilegible.
   - Denominaciones truncadas/cortadas en `cargos_manual` ("y Persuasivo.", "Datos", "Secretario(a) de Despacho – General y de", IDs 43-44, 52...).
   - Textos "COMPETENCIAS COMPORTAMENTALES" dentro de secciones `funciones`/`conocimientos` (ej. cargo 10, full_dump.sql:~3300).
   - `competencias.decreto` default `'815'` vs seeds `'815/2018'`: filtro por decreto inconsistente.
6. **[MEDIO] Inconsistencias de catálogos FE vs BD**:
   - `AdminUsuarios.tsx:85-97`: NIVELES omite `asistente` (presente en enums BD); NATURALEZAS lista solo 3 de las 6 de `naturalezas_cargo` (faltan libre_nombramiento_remocion, periodo_fijo, temporal) mientras `usuarios.naturaleza` enum tiene 5 (sin 'temporal') — tres fuentes desalineadas.
   - `Indice.tsx:49-55` duplica colores/etiquetas de nivel ya definidos en `NivelBadge.tsx`.
   - `AjustarCompromisos.tsx:114` envía `?por_pagina=100` a `/competencias`, endpoint sin paginación.
7. **[MEDIO] Duplicación de endpoints/catálogos**: `/competencias` vs `/compromisos/competencias-comportamentales` vs `/compromisos-comportamentales/competencias` (tres rutas, mismo dato; index.php:223,255,316). `/cargos-manual/catalogos` (:137) sin permiso mientras sus variantes granulares sí lo exigen (:139-141).
8. **[BAJO] Nombres que sugieren normativa embebida**: `fuente='decreto_159_2024'` hardcodeado también en el HTML del PDF (`ReporteManualService.php:153`); textos legales en `MensajesCNSC.php:12-16` (Resolución 1760/2010) — centralizado, OK, pero acoplado a texto legal.
9. **[BAJO] Sincronización parcial usuario↔cargo**: al asignar cargo se copian `nivel`/`naturaleza` a `usuarios` pero NO `denominacion_empleo`/`codigo_empleo`/`grado_empleo` (`CargoManualService.php:66-75`); el resto del sistema evalúa sobre los campos de `usuarios` (AuthService.php:130-135), no sobre `usuario_cargo_manual`. El UPDATE fallido se traga en try/catch vacío.
10. **[BAJO] `cargos_manual_requisitos` estructurada pero nunca poblada**: los requisitos reales viven como texto libre; la estructura normalizada es deuda muerta que igualmente se consulta en cada `ver()` y PDF.

---
*Fin del documento.*
