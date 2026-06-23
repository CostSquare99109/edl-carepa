# 👔 11 — Módulo del Jefe de Personal

> **Fuentes CNSC:** `Tutorial_EDL_APP_Rol_Jefe_de_Personal.md` (iUCPi5pzK98), `Tutorial_EDL_APP_Creación_de_Usuarios.md` (tn3MqQAvfoE), `Tutorial_EDL_APP_-_Dependencias.md` (GGvBMgYkbsY), `Tutorial_EDL_APP_-_Metas.md` (U4jkXFNNtZI).

---

## 1. Login y navegación del jefe de personal

> *"Para ingresar al aplicativo de la app, la CNSC le habilitará al jefe de personal o a quien haga sus veces un usuario y contraseña que corresponderá al número de documento de identidad, los cuales deberán ser digitados en los campos dispuestos para ello en la pantalla de ingreso del aplicativo. Al ingresar, asegúrese de seleccionar el rol Jefe de Personal en caso de contar con más de un rol."*

## 2. Pestañas / Módulos

| # | Módulo | Descripción |
|---|---|---|
| 1 | **Inicio** | Cambiar contraseña. |
| 2 | **Períodos** | Solo lectura (informativo). |
| 3 | **Dependencias** | Crear, editar, cambiar estado. |
| 4 | **Metas** | Crear por dependencia, editar, cambiar estado. |
| 5 | **Usuarios** | Tabla / Crear-Editar / Movilidad. |
| 6 | **Ausentismos** | Registrar períodos no evaluables >30 días. |
| 7 | **Evaluaciones y Calificación** | Reportes. |
| 8 | **Cargue Masivo** | Plantilla Excel. |

## 3. Períodos (informativo)

> *"En él podrá visualizar los períodos activos y las fechas definidas para el desarrollo de cada una de las etapas del proceso de evaluación del desempeño laboral: concertación de compromisos, seguimiento, evaluación parcial primer semestre, calificación parcial primer semestre, evaluación parcial segundo semestre y calificación definitiva."*

> *"Los períodos son definidos antes de iniciar el proceso de evaluación según el Acuerdo 617 de 2018 y serán registrados en el aplicativo por la Comisión Nacional del Servicio Civil, por lo tanto, éstos no podrán ser editados y se consideran de carácter informativo."*

## 4. Dependencias

### 4.1 Crear dependencia

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| **Nombre de la dependencia** | Input | Sí | Debe corresponder con el acto administrativo de estructura de la entidad o resoluciones internas de trabajo. |
| **Código de la dependencia** | Input | Sí | Asignado por la entidad para identificar la dependencia. |

### 4.2 Tabla de dependencias

| Columna | Descripción |
|---|---|
| Código | Identificador. |
| Nombre | Texto. |
| Estado | Activo / Inactivo. |
| Editar | Acción para modificar datos. |
| Cambiar estado | Acción para activar/inactivar. |

> *"Adicionalmente podrá editar la información diligenciada a través del botón Editar o por medio del botón Cambiar estado, modificar de estado Activo a Inactivo. Caso en el cual es preciso resaltar que éstas sólo podrán ser inactivadas cuando no tengan usuarios asociados a ella."*

### 4.3 Validación al cambiar estado

> *"Las dependencias sólo podrán ser inactivadas cuando no tengan usuarios asociados a ella."*

## 5. Metas

### 5.1 Crear meta

| Campo | Tipo | Obligatorio | Restricciones |
|---|---|---|---|
| **Período** | Lista desplegable | Sí | Período a evaluar. |
| **Dependencia** | Lista desplegable | Sí | Solo dependencias activas (creadas en el paso anterior). |
| **Meta** | Textarea | Sí | Mínimo **50 caracteres**, máximo **1000 caracteres**. |

### 5.2 Tabla de metas

| Columna | Descripción |
|---|---|
| Período | Período seleccionado. |
| Meta | Texto. |
| Dependencia | Dependencia asociada. |
| Estado | Activo / Inactivo. |
| Editar | Modificar la meta. |
| Cambiar estado | Activar/inactivar la meta. |

> *"Para la creación de una meta deberá seleccionar la información correspondiente al campo período que se refiere al período a evaluar, dependencia donde se desplegará la lista con las dependencias que fueron creadas en la pantalla anterior y que se encuentran activas, también deberá diligenciar el campo meta cuyos caracteres deberán ser mínimo 50 y máximo 1000, y posteriormente dar clic en el botón Guardar."*

### 5.3 Mensaje al guardar

> *"Generando así un mensaje indicando que la creación de la meta se realizó correctamente, confirmando el registro de la información en el listado de metas ubicado en la parte derecha de la pantalla."*

## 6. Usuarios

### 6.1 Tres sub-pestañas

| Sub-pestaña | Función |
|---|---|
| **Tabla de usuarios** | Búsqueda y acciones por usuario. |
| **Crear o Editar** | Alta de nuevos usuarios / modificación de existentes. |
| **Movilidad** | Traslado de usuarios entre entidades. |

### 6.2 Tabla de usuarios — acciones por usuario

Una vez buscado un usuario por documento, se habilitan las siguientes acciones:

| Acción | Función |
|---|---|
| **Detalle** | Visualizar datos básicos del usuario. |
| **Editar** | Modificar datos del usuario. |
| **Cambiar de estado** | Inactivar o activar el usuario. |
| **Restaurar password** | Restablecer contraseña. |
| **Administrar roles** | Asignar al usuario los roles que le correspondan. |
| **Ver evaluaciones** | Visualizar evaluaciones del funcionario en un período + descarga PDF. |

### 6.3 Crear usuario — campos (resumido)

**Información personal:**
- Tipo de documento
- Número de documento
- Género
- Primer nombre
- Segundo nombre
- Primer apellido
- Segundo apellido
- Departamento donde se ubica el cargo
- Municipio donde se ubica el cargo
- Correo
- Confirmar correo
- Teléfono 1
- Teléfono 2

**Lógica condicional: ¿Es contratista?**

```
¿Es contratista?
├── SÍ  →  Rol automático: CARGADOR
│         (funciones de apoyo: dependencias, metas, ausentismos)
│
└── NO  →  Se habilitan los campos del empleo:
           - Nivel (Directivo / Asesor / Profesional / Técnico / Asistencial)
           - Naturaleza del cargo (Carrera Administrativa / Libre Nombramiento /
             Libre Nombramiento-GP / otros)
               • Libre Nombramiento o LN-GP → rol automático: EVALUADOR
               • Carrera Administrativa → rol automático: EVALUADO
           - Tipo de nombramiento
           - Dependencia
           - ¿Es evaluador y susceptible de evaluación? (Sí/No)
               • Si Sí: dependencia del evaluado responsable
           - Denominación del empleo
           - Código del empleo
           - Grado del empleo
           - ¿Está en período de prueba? (Sí/No)
               • Si Sí: diligenciar fecha de posesión + propósito principal
           - ¿El período de evaluación inició el 1° de febrero? (Sí/No)
               • Si Sí: propósito principal del empleo
               • Si No: fecha de inicio del período + motivo
                 (terminación período de prueba / terminación vacancia temporal /
                  regreso de vacaciones / regreso de incapacidad / regreso de un
                  encargo / regreso de comisión de servicios / regreso de licencia /
                  suspensión del ejercicio del cargo / otro) + propósito principal
```

### 6.4 Movilidad de usuarios

> *"En la opción Movilidad cuenta con un campo para la búsqueda de los servidores en estado inactivo con el fin de moverlos de una entidad a otra."*

Pasos:
1. Digitar número de documento del servidor.
2. Clic en "Buscar".
3. Verificar el servidor visualizado.
4. Seleccionar "Movilizar usuario".
5. Confirmar la acción.

## 7. Ausentismos

### 7.1 Cuándo aplica

> *"Deberá ingresar los periodos no evaluables superiores a 30 días que han tenido los funcionarios de carrera administrativa o período de prueba durante el período de evaluación."*

### 7.2 Flujo

```
1. Buscar al evaluado (por documento) → clic "Buscar"
2. Habilita opciones:
   • Ingresar registro de ausentismo
   • Listar ausentismos
3. "Ingresar registro de ausentismo":
   → Seleccionar motivo (incapacidad / comisión / encargo / suspensión /
     licencias / vacaciones / otro)
   → Fecha de inicio
   → Fecha de fin
   → Observación (opcional)
   → Botón "Crear registro"
4. "Listar ausentismos": ventana con todos los ausentismos registrados,
   opción "Detalle" para editar fechas/observaciones
```

### 7.3 Validación

> Las ausentismos deben ser **>30 días** y corresponder a funcionarios de **carrera administrativa o período de prueba**.

## 8. Evaluaciones y Calificación (Reportes)

> *"Permite generar los reportes necesarios para realizar el seguimiento al proceso de evaluación del desempeño laboral."*

### 8.1 Reportes disponibles

Al seleccionar período + tipo de reporte:

| # | Reporte |
|---|---|
| 1 | Reportes de concertaciones aprobadas |
| 2 | Reportes de concertaciones rechazadas |
| 3 | Reporte de concertaciones creadas y pendientes de aprobación |
| 4 | Reporte de concertaciones ajustadas |
| 5 | Reporte de nuevas concertaciones |
| 6 | Reporte de evaluados pendientes por concertación |
| 7 | Reporte de evaluaciones por entidad |
| 8 | Reporte de evaluaciones anuladas por entidad |

> *"Una vez se seleccione el tipo de reporte que se requiere, deberá dar clic en 'Generar reporte' y de esta forma en pantalla se mostrará el reporte correspondiente, el cual podrá ser exportado a Excel para los fines pertinentes."*

### 8.2 Exportación

- Los reportes se pueden **exportar a Excel**.
- No hay exportación a PDF desde este módulo (los PDF se generan individualmente por evaluación desde "Ver evaluaciones").

## 9. Cargue Masivo de Usuarios

### 9.1 Flujo

```
1. Descargar plantilla de carga de usuarios (enlace dispuesto)
2. Diligenciar la plantilla
3. "Seleccionar archivo"
4. "Enviar archivo" → carga al sistema
```

> *"Para información adicional consulte el instructivo de cargue masivo de usuarios el cual se encuentra publicado en la página de la CNSC."*

### 9.2 Recomendación de UI

El sistema ideal debe mostrar:
- **Vista previa** de las filas a cargar (con resaltado de errores).
- **Reporte de errores** por fila (documento duplicado, campo requerido vacío, etc.).
- **Confirmación** antes de procesar.
- **Log de carga** exitoso con conteo (X creados, Y actualizados, Z con error).

## 10. Resumen de responsabilidades del jefe de personal

> *"Para adelantar la evaluación de desempeño laboral es necesario que el jefe de personal o administrador de la entidad cree todos los usuarios evaluadores y evaluados que intervengan en el proceso."*

El jefe de personal es responsable de:
1. Crear usuarios (evaluadores, evaluados, cargadores).
2. Asignar roles.
3. Restaurar contraseñas.
4. Crear y mantener dependencias.
5. Crear y mantener metas por dependencia.
6. Registrar ausentismos >30 días.
7. Generar reportes.
8. Hacer carga masiva.
9. Coordinar la conformación de Comisiones Evaluadoras (con el jefe de talento humano).
10. Capacitar a evaluadores y evaluados.
11. Comunicar los resultados para planes de estímulos y bienestar.

## 11. Mensajes literales esperados

| Acción | Mensaje |
|---|---|
| Crear dependencia | *"La creación de la dependencia se realizó correctamente."* |
| Cambiar estado dependencia con usuarios | *"No se puede inactivar la dependencia porque tiene usuarios asociados."* |
| Crear meta | *"La creación de la meta se realizó correctamente."* |
| Cambiar estado meta | *"La actualización de la meta se realizó correctamente."* |
| Crear usuario | *"La creación del registro se realizó correctamente."* |
| Restaurar password | *"La contraseña fue restaurada. Se ha enviado al correo del usuario."* |
| Movilidad | *"La movilidad del usuario se realizó correctamente."* |
| Generar reporte | *"El reporte fue generado exitosamente."* |