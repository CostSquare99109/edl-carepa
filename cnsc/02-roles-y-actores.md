# 👥 02 — Roles y Actores del Sistema EDL

> **Fuentes CNSC:** `Generalidades_EDL.md`, `Tutorial_EDL_APP_Rol_Jefe_de_Personal.md`, `Tutorial_EDL_APP_Rol_Evaluador.md`, `Tutorial_EDL_APP_Concertación_de_Compromisos.md`, `Tutorial_EDL_APP_-_Propuesta_de_compromisos_por_parte_del_Ev.md`, `Tutorial_EDL_APP_Creación_de_Usuarios.md`, `Tutorial_EDL_APP_Realización_Aprobación_Evaluaciones_Rol_de_.md`.

---

## 1. Actores institucionales (no son roles del aplicativo, pero participan)

Según el Decreto 1083 de 2015 y el Acuerdo 617 de 2018, en el proceso intervienen los siguientes actores con responsabilidades diferenciadas:

| Actor | Responsabilidad principal |
|---|---|
| **CNSC** | Socializar el Sistema Tipo a través de los medios de divulgación que considere pertinentes. |
| **Jefe de la entidad** | Desarrollar el propio sistema de EDL; en el entretanto, adoptar el Sistema Tipo. |
| **Jefe de Planeación** (o quien haga sus veces) | Publicar a más tardar el **31 de enero** de cada año las metas por áreas o dependencias, así como los avances del año anterior. |
| **Jefe de Control Interno** (o quien haga sus veces) | Dar a conocer a los evaluadores el resultado de la evaluación de gestión por áreas/dependencias del año anterior (insumo para la concertación del siguiente período). |
| **Jefe de Unidad de Personal** (o quien haga sus veces) | Poner en funcionamiento el sistema; divulgar la normatividad; diseñar y administrar el programa de capacitación; conformar las Comisiones Evaluadoras cuando haya lugar; establecer planes de estímulos, capacitación y bienestar con base en resultados. |
| **Evaluados y Evaluadores** | Participar activamente en todas las fases; acordar compromisos de mejoramiento si aplica; presentar evidencias. |
| **Comisión de Personal** | Resolver en única instancia las reclamaciones de evaluados inconformes con los compromisos concertados. |

## 2. Roles del aplicativo EDL APP

### 2.1 👔 Jefe de Personal (Administrador de la entidad)

- **Asignación:** La CNSC le asigna un usuario y contraseña. Por defecto, el nombre de usuario es el número de documento de identidad.
- **Login:** en la pantalla de ingreso debe seleccionar el rol "Jefe de Personal" si tiene más de un rol.
- **Módulos accesibles:**
  1. **Inicio** → cambiar contraseña.
  2. **Períodos** → solo lectura (informativo; definidos por la CNSC, no editables).
  3. **Dependencias** → crear, editar, cambiar estado (activar/inactivar).
  4. **Metas** → crear por dependencia, cambiar estado.
  5. **Usuarios** → tabla / crear-editar / movilidad.
  6. **Ausentismos** → registrar períodos no evaluables >30 días.
  7. **Evaluaciones y Calificación** → reportes.
  8. **Cargue Masivo** → plantilla Excel.

> *"Los periodos son definidos antes de iniciar el proceso de evaluación según el Acuerdo 617 de 2018 y serán registrados en el aplicativo por la Comisión Nacional del Servicio Civil, por lo tanto, éstos no podrán ser editados y se consideran de carácter informativo."*

### 2.2 🧑‍💼 Evaluador

- **Asignación:** el sistema asigna automáticamente el rol cuando el jefe de personal crea al usuario con **naturaleza "Libre Nombramiento" o "Libre Nombramiento - Gerencia Pública"**.
- **Login:** debe seleccionar el rol "Evaluador".
- **Módulos accesibles:**
  1. **Inicio** → cambiar contraseña.
  2. **Compromisos y Competencias** → concertar, ver concertados, ver propuestos por el evaluado, ajustar concertados, ver evaluados con compromisos rechazados.
  3. **Evidencias** → registrar.
  4. **Compromisos de Mejoramiento** → registrar.
  5. **Evaluar** → calificar.

### 2.3 🧑‍🔧 Evaluado

- **Asignación:** el sistema asigna automáticamente el rol cuando el jefe de personal crea al usuario con **naturaleza "Carrera Administrativa"**.
- **Login:** debe seleccionar el rol "Evaluado".
- **Módulos accesibles:**
  1. **Inicio** → cambiar contraseña.
  2. **Compromisos y Competencias** → proponer (si aplica), ver concertados, ver por aprobar.
  3. **Mis evaluaciones** → consultar (en el módulo del evaluado).

> *"Para el periodo anual se deben ingresar mínimo uno y máximo cinco compromisos funcionales y para los compromisos comportamentales entre tres y cinco."*

### 2.4 👷 Cargador (contratistas)

- **Asignación:** cuando en la creación del usuario se selecciona **"¿Es contratista? = Sí"**, el aplicativo crea automáticamente un usuario con **rol "Cargador"**.
- **Funciones:** apoyar al Jefe de Personal en:
  - Carga de información.
  - Registro de dependencias y metas de la entidad.
  - Ingreso de ausentismos del período de evaluación.

### 2.5 ⚖️ Comisión Evaluadora

- **Integración:** jefe inmediato + evaluado + un **servidor de Libre Nombramiento y Remoción** (LNR).
- **Cuándo se conforma:**
  - Cuando el jefe inmediato es servidor de carrera administrativa provisional, **o**
  - Cuando se encuentra en período de prueba.
- **Cuándo se constituye:** al inicio del proceso de evaluación del desempeño laboral.
- **Cómo actúa:** como **un solo evaluador** hasta la culminación del proceso (calificación en firme).
- **Funciones principales:**
  - **Aprobar** o **rechazar** las evaluaciones registradas por el evaluador.
  - Hasta tanto la Comisión no apruebe, la evaluación **no queda en firme**.
  - Si rechaza, el evaluador debe reingresar y corregir.

> *"El servidor de Libre Nombramiento y Remoción que pertenece a la Comisión Evaluadora es quien aprueba o rechaza la evaluación realizada por el evaluador."*

### 2.6 📋 Otros roles mencionados en las transcripciones

| Rol | Mención | Notas |
|---|---|---|
| Administrador global | Implícito | Algunas entidades (multientidad) podrían requerir un rol de nivel central; no es típico en una sola entidad como Carepa. |
| Usuario con múltiples roles | Implícito | El aplicativo permite seleccionar entre los roles que tenga asignados el usuario en la pantalla de ingreso. |

## 3. Asignación automática de roles según naturaleza del cargo

```
┌────────────────────────────────┐
│ ¿Es contratista?               │
│   ├─ Sí  →  Rol: CARGADOR     │
│   └─ No  ↓                     │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ Naturaleza del cargo           │
│   ├─ Libre Nombramiento /      │
│   │  Libre Nombramiento-GP →   │
│   │   Rol: EVALUADOR           │
│   ├─ Carrera Administrativa →  │
│   │   Rol: EVALUADO            │
│   └─ Otros → Rol por defecto   │
│      (asignar manualmente)     │
└────────────────────────────────┘
```

> *"El aplicativo por defecto asigna el rol correspondiente. Cuando se seleccione como naturaleza la opción de Libre Nombramiento o Libre Nombramiento - Gerencia Pública, el sistema asigna el rol de Evaluador. Ahora bien, si se selecciona la opción de Carrera Administrativa, el aplicativo por defecto asigna el rol Evaluado."*

> *"Los roles adicionales deberán ser asignados por el jefe de personal en la tabla de usuarios seleccionando la opción Asignación de Roles."*

## 4. Resumen de capacidades por rol

| Capacidad | Jefe de Personal | Evaluador | Evaluado | Cargador | Comisión |
|---|:-:|:-:|:-:|:-:|:-:|
| Cambiar contraseña | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver períodos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear/editar dependencias | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear/editar metas | ✅ | ❌ | ❌ | ✅ | ❌ |
| Crear/editar usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Restaurar contraseña de usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Asignar roles a usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Registrar ausentismos | ✅ | ❌ | ❌ | ✅ | ❌ |
| Carga masiva de usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Concertar compromisos | ❌ | ✅ | ❌ | ❌ | ❌ |
| Proponer compromisos (por omisión) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Aceptar/rechazar compromisos | ❌ | ❌ | ✅ | ❌ | ❌ |
| Ajustar compromisos concertados | ❌ | ✅ | ❌ | ❌ | ❌ |
| Ver compromisos rechazados | ❌ | ✅ | ❌ | ❌ | ❌ |
| Registrar evidencias | ❌ | ✅ | ❌ | ❌ | ❌ |
| Registrar compromisos de mejoramiento | ❌ | ✅ | ❌ | ❌ | ❌ |
| Evaluar (calificar) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Aprobar/rechazar evaluación | ❌ | ❌ | ❌ | ❌ | ✅ |
| Ver evaluaciones | ✅ (de cualquier usuario) | ✅ (de sus evaluados) | ✅ (las propias) | ❌ | ✅ |
| Generar reportes | ✅ | ❌ | ❌ | ❌ | ❌ |
| Movilidad de usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |