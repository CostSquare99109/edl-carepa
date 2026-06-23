# 📁 08 — Módulo de Evidencias

> **Fuentes CNSC:** `Tutorial_EDL_APP_-_Registro_de_evidencias_y_compromisos_de_m.md` (b8eOIVxvnZ8), `Tutorial_EDL_APP_Rol_Evaluador.md`, `Tutorial_para_el_aplicativo_Sistema_Tipo_para_la_EDL.md`, `Tutorial_para_la_realización_de_la_primera_evaluación_parcia.md`.

---

## 1. Definición

Las evidencias son los elementos de soporte que permiten demostrar el **cumplimiento o incumplimiento** de los compromisos concertados. Se registran durante toda la fase de **seguimiento**.

> *"Durante el período de evaluación podrá registrar la descripción de las evidencias que considere como soporte que permiten demostrar el cumplimiento o incumplimiento de los compromisos concertados establecidos en la fase inicial del proceso de evaluación."*

## 2. Diseño conceptual — **DESCRIPTIVO, sin archivos**

> *"Es importante precisar que el registro de evidencias es descriptivo y en ese sentido **no se cargará ningún tipo de archivo al aplicativo EDL APP**."*

> *"A partir de los seguimientos realizados durante el período de evaluación correspondiente."*

**Esto es un punto crítico y es una de las principales brechas funcionales detectadas en el proyecto EDL Carepa** (ver `13-trazabilidad-con-proyecto.md` → brecha B-C1).

| Atributo | Diseño CNSC | Diseño actual proyecto EDL Carepa |
|---|---|---|
| Tipo de registro | Descriptivo (texto) | Tabla de archivos (con `nombre_archivo`, `tipo_mime`, `tamaño_bytes`) |
| Carga de archivos | NO permitida | SÍ permitida (PDF, DOC, XLS, JPG, PNG) |
| Decisión recomendada | Adoptar diseño CNSC | **Decisión de producto**: ver recomendaciones |

## 3. Campos del formulario de registro

Para registrar una evidencia, el aplicativo presenta los siguientes campos:

| # | Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|---|
| 1 | **Período** | Lista desplegable | Sí | Período de evaluación con concertación vigente. |
| 2 | **Número de documento del evaluado** | Input + botón "Buscar evaluado" | Sí | Documento del evaluado. |
| 3 | **Compromiso o competencia** | Lista desplegable | Sí | Uno de los compromisos/competencias registrados en la concertación. |
| 4 | **Descripción** | Textarea | Sí | Descripción del elemento de documento o soporte correspondiente. |
| 5 | **Ubicación** | Input | Sí | Física o virtual donde se encuentra la evidencia (donde el evaluador podrá encontrarla). |
| 6 | **Observación** | Textarea | Opcional | Solo si hay lugar a ella. |

## 4. Listado de evidencias (panel derecho)

Una vez registrada la evidencia, en la parte derecha de la pantalla se muestra la información del evaluado y evaluador y el **listado de las evidencias creadas** con las siguientes columnas:

| Columna | Descripción |
|---|---|
| **Fecha de registro** | Cuándo se creó. |
| **Compromiso/competencia** | A qué compromiso/competencia se asocia. |
| **Descripción** | Texto descriptivo. |
| **Ubicación** | Física o virtual. |
| **Observación** | Texto opcional. |
| **Usuario que registró** | Persona que hizo el registro. |
| **Editar** | Acción habilitada únicamente para el servidor que registró la información. |

## 5. Permisos y edición

> *"La opción de editar se habilitará únicamente para el servidor que registró la información."*

## 6. Quién registra evidencias

Por defecto, las registra el **evaluador** (es quien hace seguimiento al cumplimiento). Sin embargo, dependiendo del diseño, podría permitirse también que el evaluado registre sus propias evidencias.

## 7. Mensajes literales esperados

- *"La creación de la evidencia se realizó correctamente."* (al guardar)
- *"El registro de evidencias es exitoso."* (confirmación)

## 8. Validación y reglas de negocio

| Regla | Mensaje esperado |
|---|---|
| Período debe tener concertación vigente | *"No existe concertación vigente para el período seleccionado."* |
| Compromiso debe pertenecer a la concertación del evaluado | *"El compromiso seleccionado no corresponde a la concertación del evaluado."* |
| Descripción no puede estar vacía | *"La descripción de la evidencia es obligatoria."* |
| Ubicación no puede estar vacía | *"La ubicación de la evidencia es obligatoria."* |

## 9. Recomendaciones de implementación (derivadas del análisis)

### 9.1 Si se decide alinear 100% con CNSC
- Reescribir `EvidenciaList.tsx` para que sea formulario descriptivo puro.
- Quitar el upload de archivos.
- Cambiar endpoint backend para no recibir `multipart/form-data`.
- Eliminar columnas `nombre_archivo`, `tipo_mime`, `tamaño_bytes` y `archivo_path` de la tabla `evidencias`.
- Mantener: `descripcion`, `ubicacion`, `observacion`, `compromiso_id`, `periodo_id`, `usuario_registra_id`, `fecha_registro`.

### 9.2 Si se decide mantener carga de archivos (decisión Carepa)
- Documentar explícitamente como **divergencia intencional** vs. CNSC.
- Mantener ambos campos: descriptivo + archivo adjunto.
- En el PDF de evaluación, mencionar el archivo adjunto como soporte.

### 9.3 Si se decide híbrido (recomendado)
- El campo principal es **descriptivo** (cumple CNSC).
- El archivo adjunto es **opcional** (mejora sobre CNSC).
- En UI: textarea principal + botón "Adjuntar archivo (opcional)".
- Esto satisface el principio CNSC y permite adjuntar cuando hay documentos escaneados.

## 10. Decisión de producto pendiente

Esta decisión (alinear / mantener / híbrido) **debe ser tomada por el equipo de Carepa** porque:
- El CNSC dice NO archivos.
- El proyecto actual permite archivos (decisión deliberada, probablemente porque en entidades públicas hay evidencias en físico: actas firmadas, oficios, etc.).
- Hay razones regulatorias y razones prácticas en ambas direcciones.