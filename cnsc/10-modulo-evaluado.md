# 🙋 10 — Módulo del Evaluado

> **Fuentes CNSC:** `Tutorial_EDL_APP_-_Propuesta_de_compromisos_por_parte_del_Ev.md` (XlwaugRzxxw), `Tutorial_EDL_APP_Concertación_de_Compromisos.md`, `Tutorial_para_el_aplicativo_Sistema_Tipo_para_la_EDL.md`.

---

## 1. Login y navegación del evaluado

> *"Para ingresar, digite su nombre de usuario y contraseña en los campos dispuestos para ello en la pantalla de ingreso del aplicativo. Al ingresar, asegúrese de seleccionar el rol Evaluado, en caso de contar con más de un rol."*

## 2. Módulos accesibles por el evaluado

### 2.1 Inicio
- **Cambiar contraseña** (opcional, bajo responsabilidad del usuario).

### 2.2 Compromisos y Competencias
El evaluado tiene **tres opciones** en este módulo:

| # | Opción | Cuándo se usa |
|---|---|---|
| 1 | **Proponer compromisos** | Cuando el evaluador **omite** la concertación dentro de los 15 días hábiles. |
| 2 | **Ver compromisos concertados** | Cuando el evaluado ya aceptó/rechazó y quiere consultar. |
| 3 | **Ver compromisos por aprobar** | Cuando el evaluador registró compromisos y aún no fueron aprobados por el evaluado. |

## 3. Proponer compromisos (derecho del evaluado por omisión)

### 3.1 Cuándo aplica

> *"Para proponer los compromisos el evaluado deberá seleccionar el segundo módulo denominado Compromisos y Competencias, el cual habilitará las opciones: proponer compromisos, ver compromisos concertados, ver compromisos por aprobar."*

Cuando el evaluador OMITE la concertación dentro de los 15 días hábiles del inicio del período o de la posesión en período de prueba, el evaluado tiene derecho a **proponer** sus propios compromisos.

### 3.2 Flujo paso a paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Login como EVALUADO                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Módulo "Compromisos y Competencias"                          │
│    → Opción "Proponer compromisos"                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Seleccionar período de evaluación                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Ingresar compromisos funcionales (1 a 5 anual / 1 a 3 prueba)│
│    → Botón "Ingresar compromiso funcional"                      │
│    → Modal: meta + compromiso (verbo+objeto+condición) + peso  │
│    → Repetir N veces                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Ingresar compromisos comportamentales (3 a 5)                 │
│    → Botón "Ingresar compromiso comportamental"                 │
│    → Seleccionar competencia                                   │
│    → Si es propuesto por el jefe de la entidad: marcar checkbox │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Botón "Guardar" (o "Confirmar")                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. EVALUADOR revisa y ACEPTA o RECHAZA                         │
│    → Si rechaza: el evaluador debe registrar compromisos        │
│      con los ajustes correspondientes                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Si acepta: ambos ven "Ver concertaciones" + Descargar PDF    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Validaciones al proponer

| Regla | Mensaje |
|---|---|
| Período válido | *"El período seleccionado no es válido."* |
| Mínimo 1, máximo 5 funcionales (anual) | Mensaje indicando el rango. |
| Mínimo 1, máximo 3 funcionales (prueba) | Mensaje indicando el rango. |
| Mínimo 3, máximo 5 comportamentales | Mensaje indicando el rango. |
| Suma de pesos = 100% | *"El peso de los compromisos debe ser igual a 100."* |

### 3.4 Mensaje de confirmación

> *"Es preciso señalar que para finalizar el proceso el evaluador deberá ingresar desde su usuario para aceptar o rechazar los compromisos propuestos por el evaluado."*

## 4. Ver compromisos por aprobar (criterio CNSC)

> *"Una vez el evaluado selecciona esta opción se habilitarán en pantalla los compromisos registrados por el evaluador. Allí el evaluado deberá seleccionar entre las opciones Aceptar compromisos o Rechazar compromisos."*

### 4.1 Acciones disponibles

| Acción | Efecto |
|---|---|
| **Aceptar compromisos** | Confirma la concertación; ambos pueden ver "Ver concertaciones" + Descargar PDF. |
| **Rechazar compromisos** | El evaluador debe **registrar nuevamente** los compromisos a partir de la retroalimentación del evaluado. |

### 4.2 Mensaje al aceptar

> *"Se aceptaron los compromisos correctamente."*

### 4.3 Mensaje al rechazar

> *"Se rechazaron los compromisos correctamente."*

## 5. Ver compromisos concertados

Muestra los compromisos ya aceptados para el período, con la opción **Descargar PDF** que contiene toda la información registrada en la fase de concertación.

> *"Una vez aceptados, tanto el evaluador como el evaluado podrán ingresar a la opción Ver concertaciones, en la que evidenciará la concertación para el período señalado y la opción Descargar el PDF, en el cual se mostrará la información registrada en la primera fase del proceso de evaluación de desempeño laboral."*

## 6. Consulta de evaluaciones (para el evaluado)

> *"La información de la evaluación también se reflejará en el rol del evaluado con el propósito de comunicarla de acuerdo con lo establecido en la normatividad."*

El evaluado puede ver sus evaluaciones, idealmente:
- **Parciales semestrales** (comunicadas, sin recurso).
- **Definitiva** (notificada, con recurso).

## 7. Resumen de capacidades del evaluado

| Capacidad | Habilitada | Notas |
|---|:-:|---|
| Cambiar contraseña propia | ✅ | |
| Proponer compromisos (por omisión) | ✅ | Solo si el evaluador omitió la concertación. |
| Aceptar compromisos del evaluador | ✅ | Después de la concertación. |
| Rechazar compromisos del evaluador | ✅ | Activa retroalimentación. |
| Ver compromisos concertados | ✅ | Con opción de descarga de PDF. |
| Ver evaluaciones propias | ✅ | Parciales y definitivas. |
| Registrar evidencias propias | ⚠️ Depende | En el diseño CNSC no queda explícito si el evaluado puede; en el aplicativo actual de la CNSC el evaluado ve las evidencias pero no las registra. |
| Registrar compromisos de mejoramiento | ❌ | Solo el evaluador. |
| Concertar unilateralmente | ❌ | No aplica. |
| Aprobar/rechazar evaluaciones (Comisión) | ❌ | Solo Comisión Evaluadora. |