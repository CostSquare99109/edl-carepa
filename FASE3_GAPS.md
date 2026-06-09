# FASE 3: Alineacion Proyecto vs Documentacion - Lista de Gaps

## RESUMEN EJECUTIVO

Tras leer 3 veces cada uno de los 14 archivos .md de documentacion y comparar
con el estado actual del proyecto edl-carepa, se identifican los siguientes gaps
organizados por prioridad (CRITICO > ALTO > MEDIO > BAJO).

---

## GAPS CRITICOS (bloquean funcionamiento basico del sistema)

### C1. Modulo de Evidencias - Disenio incorrecto
**Doc ref:** video_03, video_12
**Estado actual:** EvidenciaList.tsx muestra tabla de archivos (nombre_archivo,
tipo_mime, tamaño_bytes). Endpoint /evidencias parece diseñado para upload de archivos.
**Lo que dice la doc:** "No se cargara ningun tipo de archivo al aplicativo EDL APP".
Solo se registra: Compromiso/competencia, Descripcion, Ubicacion (fisica o link),
Observacion. Busqueda por periodo + documento evaluado. El formulario debe tener:
- Select: Periodo
- Input: Documento evaluado + Buscar
- Select: Compromiso o competencia (filtra los concertados)
- Textarea: Descripcion
- Input: Ubicacion (fisica o virtual)
- Textarea: Observacion (opcional)
- Tabla de historial con opcion Editar
**Archivos afectados:**
- frontend/src/pages/Evidencias/EvidenciaList.tsx (REESCRIBIR)
- backend/src/Controller/EvidenciaController.php (VERIFICAR/AJUSTAR)
- backend/src/Service/EvidenciaService.php (VERIFICAR)
- backend/src/Repository/EvidenciaRepository.php (VERIFICAR)
- BD: tabla evidencias (puede necesitar ajuste de columnas)

### C2. Modulo de Compromisos de Mejoramiento - Falta pagina frontend
**Doc ref:** video_03, video_12
**Estado actual:** Existe CompromisoMejoramientoController con rutas backend,
pero NO existe pagina frontend para este modulo.
**Lo que dice la doc:** Modulo "Compromisos de Mejoramiento" con formulario:
- Select: Periodo
- Input: Documento evaluado + Buscar
- Select: Compromiso o competencia
- Textarea: Motivo
- Textarea: Aspecto a corregir
- Textarea: Acciones de mejoramiento
- Textarea: Observacion
- Tabla historial con Editar
**Archivos afectados:**
- NUEVO: frontend/src/pages/Compromisos/CompromisosMejoramiento.tsx
- frontend/src/App.tsx (agregar ruta)
- backend/src/Controller/CompromisoMejoramientoController.php (VERIFICAR)

### C3. Modulo Evaluar - PanelEvaluador vs doc CNSC
**Doc ref:** video_06, video_09, video_11, video_12, video_13
**Estado actual:** PanelEvaluador.tsx tiene logica basica de calificacion pero:
1. Falta dropdown "Tipo de evaluacion" con opciones:
   - Evaluacion Parcial Eventual
   - Evaluacion 1er Semestre
   - Evaluacion 2do Semestre
   - Calificacion Extraordinaria
2. Falta dropdown "Motivo" cuando es Parcial Eventual
3. Falta dropdown "Razon" cuando motivo es separacion temporal
4. Falta Datepicker "Ingrese las fechas de la evaluacion"
5. Falta boton "Comenzar evaluacion"
6. Calificacion comportamental: Falta escala de frecuencia correcta:
   NUNCA / ALGUNAS VECES / FRECUENTEMENTE / SIEMPRE
7. Falta pregunta de aporte con 3 opciones: SI / NO / MODERADAMENTE
8. Falta validacion de justificacion minimo 40 caracteres
9. Falta resumen con Nota Funcionales, Nota Comportamentales, Escala, Definitiva
10. Pesos: Funcionales 85%, Comportamentales 15%
**Archivos afectados:**
- frontend/src/pages/Evaluaciones/PanelEvaluador.tsx (REESCRIBIR gran parte)
- backend/src/Controller/EvaluacionController.php (VERIFICAR endpoints)
- backend/src/Service/EvaluacionService.php (VERIFICAR logica de notas)

### C4. Flujo Evaluado - Propuesta de compromisos
**Doc ref:** video_07
**Estado actual:** No existe vista para que el evaluado proponga compromisos
cuando el evaluador omite la concertacion. Solo existe VerCompromisosPropuestos
para verlos, no para crearlos.
**Lo que dice la doc:** El evaluado debe poder:
1. Seleccionar "Proponer compromisos" en Compromisos y Competencias
2. Ingresar compromisos funcionales y comportamentales
3. Guardar propuesta completa
4. El evaluador luego los acepta o rechaza
**Archivos afectados:**
- NUEVO: frontend/src/pages/Compromisos/ProponerCompromisos.tsx
- frontend/src/App.tsx (agregar ruta)
- backend/src/Controller/CompromisoController.php (VERIFICAR endpoint)
- frontend/src/pages/Compromisos/CompromisosYCompetencias.tsx (agregar opcion para evaluado)

### C5. Login - Etiquetas incorrectas
**Doc ref:** video_02, video_05, video_06, video_08, video_12
**Estado actual:** Login usa "Documento" y "Contrasena"
**Lo que dice la doc:** Las etiquetas deben ser:
- "Nombre de usuario" (no "Documento")
- "Contrasena"
- Boton: "Acceder" (ya correcto)
**Nota:** Esto es etiqueta visual, el campo sigue siendo documento como login.
**Archivos afectados:**
- frontend/src/pages/Login.tsx (cambiar etiquetas)

### C6. Modulo Ausentismos - Falta pagina frontend
**Doc ref:** video_04
**Estado actual:** Existe AusentismoController con rutas backend,
pero NO existe pagina frontend para ausentismos.
**Lo que dice la doc:** Registro de periodos no evaluables >30 dias:
- Busqueda por documento
- Motivo: Incapacidad, Comision, Encargo, Suspension, Licencias, Vacaciones, Otros
- Fecha inicio, Fecha fin, Observaciones
**Archivos afectados:**
- NUEVO: frontend/src/pages/Ausentismos/AusentismoList.tsx
- frontend/src/App.tsx (agregar ruta)
- frontend/src/components/Layout/Sidebar.tsx (agregar menu)

### C7. Carga Masiva de Usuarios - Falta pagina frontend
**Doc ref:** video_04
**Estado actual:** Existe CargaMasivaController con rutas backend,
pero NO existe pagina frontend para carga masiva.
**Lo que dice la doc:**
1. Descarga de plantilla Excel
2. Seleccion de archivo
3. Boton "Enviar archivo"
**Archivos afectados:**
- NUEVO: frontend/src/pages/Admin/CargaUsuarios.tsx
- frontend/src/App.tsx (agregar ruta)

---

## GAPS ALTOS (afectan funcionalidad significativa)

### A1. Modulo de Metas - Falta vinculo con Dependencia
**Doc ref:** video_04, video_01
**Estado actual:** MetaList.tsx existe pero no asocia meta con dependencia.
**Lo que dice la doc:** Metas deben tener: Periodo, Dependencia, Descripcion.
El secretario de educacion fija una meta para todos los servidores.
**Archivos afectados:**
- frontend/src/pages/Metas/MetaList.tsx (agregar campo Dependencia)
- backend/src/Controller/MetaController.php (VERIFICAR)
- BD: tabla metas (verificar columna dependencia_id)

### A2. Modulo Usuarios (Admin) - Campos faltantes segun doc
**Doc ref:** video_08
**Estado actual:** AdminUsuarios.tsx tiene formulario basico: tipo_doc, documento,
nombres, apellidos, email, cargo, password, roles, estado.
**Lo que dice la doc:** El formulario completo debe tener:
- Genero (Hombre/Mujer)
- Departamento y Municipio (con dependencia)
- Telefono 1 y Telefono 2
- Confirmar correo (validacion coincidencia)
- Es contratista? (Si/No)
- Si No: Nivel (Directivo/Asesor/Profesional/Tecnico/Asistencial)
- Naturaleza (Carrera Administrativa/Libre Nombramiento/etc)
- Tipo nombramiento (Periodo de prueba/Provisionalidad/etc)
- Dependencia
- Es evaluador? (Si/No)
- Si Si: Dependencia encargada de evaluacion
- Denominacion empleo
- Codigo empleo
- Grado empleo
- Esta en periodo de prueba? (Si/No)
- Si Si: Fecha de posesion
- Empezo el 1 de febrero? (Si/No)
- Si No: Fecha inicio diferente + Motivo
- Proposito principal del empleo (textarea)
**Archivos afectados:**
- frontend/src/pages/Admin/AdminUsuarios.tsx (expansion significativa)
- backend/src/Controller/UsuarioController.php (VERIFICAR campos)
- BD: tabla usuarios (puede necesitar columnas nuevas)

### A3. Modulo Dependencias - Falta cambio de estado
**Doc ref:** video_02
**Estado actual:** AdminDependencias.tsx existe.
**Lo que dice la doc:** Ademas de CRUD, necesita:
- Funcion "Cambiar estado" (Activar/Inactivar)
- Validacion: dependencia solo puede pasar a Inactivo si no tiene usuarios asociados
- Modal de confirmacion para cambio de estado
**Archivos afectados:**
- frontend/src/pages/Admin/AdminDependencias.tsx (VERIFICAR/agregar)
- backend/src/Controller/DependenciaController.php (VERIFICAR endpoint)

### A4. Modulo Periodos - Falta pagina informativa
**Doc ref:** video_04
**Estado actual:** PeriodoList.tsx existe con CRUD basico.
**Lo que dice la doc:** La pestana "Periodos" debe ser INFORMATIVA (solo lectura).
Muestra las etapas EDL segun Acuerdo 617 de 2018:
- Concertacion de compromisos
- Seguimiento
- Evaluacion parcial 1er sem
- Calificacion parcial 1er sem
- Evaluacion parcial 2do sem
- Calificacion definitiva
**Archivos afectados:**
- frontend/src/pages/Periodos/PeriodoList.tsx (VERIFICAR si es solo lectura)

### A5. Evaluaciones - Aprobacion por Comision Evaluadora
**Doc ref:** video_11
**Estado actual:** PanelEvaluador tiene boton de aprobar para comision, pero
el flujo es muy basico.
**Lo que dice la doc:**
- La comision evaluadora cambia su rol a "Comision Evaluadora"
- Busca evaluado, ve evaluaciones
- Puede APROBAR o RECHAZAR
- Si rechaza, el evaluador debe reingresar y corregir
- "Hasta tanto la Comision Evaluadora no apruebe las evaluaciones,
  estas no quedaran en firme"
**Archivos afectados:**
- frontend/src/pages/Evaluaciones/PanelEvaluador.tsx (mejorar flujo comision)
- backend/src/Controller/EvaluacionController.php (VERIFICAR logica rechazo)

### A6. Escalas de Calificacion - Logica de negocio faltante
**Doc ref:** video_14
**Estado actual:** No existe logica de escalas ni consecuencias.
**Lo que dice la doc:**
- Funcionales: 85% de la calificacion total
- Comportamentales: 15% de la calificacion total
- Escala comportamental: Bajo (4-6), Aceptable (7-9), Alto (10-12), Muy Alto (13-15)
- Escala final:
  - Sobresaliente: >= 90%
  - Satisfactorio: > 65% y < 90%
  - No Satisfactorio: <= 65%
- Consecuencias segun escala (encargos, retiro, etc.)
**Archivos afectados:**
- backend/src/Service/EvaluacionService.php (agregar logica)
- frontend/src/pages/Evaluaciones/PanelEvaluador.tsx (mostrar escala)
- BD: posible nueva tabla parametros_escala

### A7. Menu del Evaluado - Opciones faltantes
**Doc ref:** video_07, video_12
**Estado actual:** MenuController ya tiene opciones para evaluado, pero falta
la opcion "Proponer compromisos" y la pagina asociada.
**Lo que dice la doc:** Evaluado debe ver en Compromisos y Competencias:
- Proponer compromisos
- Ver compromisos concertados
- Ver compromisos por aprobar
**Archivos afectados:**
- backend/src/Controller/MenuController.php (VERIFICAR opciones evaluado)
- frontend/src/pages/Compromisos/CompromisosYCompetencias.tsx (agregar vista evaluado)

---

## GAPS MEDIOS (mejoras de UX o reglas menores)

### M1. Cambio de contraseña en Inicio
**Doc ref:** video_04, video_12
**Lo que dice la doc:** En pestana "Inicio", boton "Cambiar contraseña" con
formulario: nueva contraseña + confirmar. Ya existe ruta PUT /auth/password.
**Verificar:** Si ya esta implementado en Dashboard.tsx

### M2. Movilidad de Usuarios
**Doc ref:** video_04
**Estado actual:** Existe MovilidadController con rutas backend, sin pagina frontend.
**Archivos afectados:**
- NUEVO: frontend/src/pages/Admin/MovilidadUsuarios.tsx (o integrar en AdminUsuarios)

### M3. Generacion de PDF de concertacion
**Doc ref:** video_05, video_07
**Estado actual:** Existe ruta /reportes/concertacion-pdf/{id}
**Verificar:** Si el frontend tiene boton de descarga PDF en VerCompromisos

### M4. Mensajes del sistema - Estandarizar
**Doc ref:** todos los videos
**Lo que dice la doc:** Mensajes literales especificos:
- "Se registró la concertación de compromisos correctamente."
- "Se aceptaron los compromisos correctamente."
- "La creación de la evaluación se realizó correctamente."
- "La creación de la evidencia se realizó correctamente."
- "La creación del compromiso de mejoramiento se realizó correctamente."
- "El peso de los compromisos debe ser igual a 100"
- etc.
**Verificar:** Que los mensajes del backend/frontend coincidan con los literales

### M5. Compromisos Funcionales - Validacion periodo de prueba
**Doc ref:** video_10
**Lo que dice la doc:**
- Funcionales (Anual): Min 1, Max 5
- Funcionales (Prueba): Min 1, Max 3
- Comportamentales: Min 3, Max 5
**Verificar:** Si la validacion distingue anual vs prueba

### M6. Concertacion fallida - Fijacion unilateral
**Doc ref:** video_10
**Lo que dice la doc:** Si pasan 15 dias sin acuerdo, evaluador tiene 3 dias
para fijar compromisos unilateralmente. Requiere firma de testigo.
**Verificar:** Si el flujo de "Fijados por el evaluador" esta completo

### M7. Checkbox "Es propuesto por el jefe de la entidad"
**Doc ref:** video_07, video_12
**Lo que dice la doc:** En el modal de compromisos comportamentales, cada
competencia seleccionada debe tener un checkbox "Es propuesto por el jefe
de la entidad?".
**Verificar:** Si ConcertarCompromisos.tsx ya lo tiene (columna
es_propuesto_jefe en BD existe)

---

## GAPS BAJOS (cosmetico o mejoras futuras)

### B1. Paleta de colores - Ajustes menores
**Doc ref:** multiples
**Nota:** Los colores institucionales ya estan configurados (#0A2B5E, #C4282B, #1E5A3C).
La doc CNSC usa azul #0056b3. Se mantiene la paleta de Carepa.

### B2. Selector de Rol - Etiquetas
**Doc ref:** video_02, video_11
**Lo que dice la doc:** Opciones: "EVALUADOR", "EVALUADO", "COMISION EVALUADORA",
"JEFE DE PERSONAL (ADMINISTRADOR ENTIDAD)"
**Verificar:** Si los labels coinciden

### B3. Footer/login - Detalles visuales
**Doc ref:** video_02
**Lo que dice la doc:** Footer: "SEDEL elaborado por CNSC"
**Nota:** Adaptar a "EDL Carepa - Alcaldia de Carepa"

---

## PLAN DE EJECUCION (priorizado)

1. C1 - Reescribir Evidencias (CRITICO)
2. C2 - Crear Compromisos de Mejoramiento (CRITICO)
3. C5 - Corregir etiquetas Login (CRITICO - rapido)
4. C4 - Crear Propuesta Compromisos Evaluado (CRITICO)
5. C6 - Crear Ausentismos (CRITICO)
6. C7 - Crear Carga Masiva (CRITICO)
7. C3 - Mejorar PanelEvaluador (CRITICO - grande)
8. A6 - Escalas de calificacion (ALTO)
9. A2 - Expandir formulario Usuarios (ALTO)
10. A3 - Cambio estado Dependencias (ALTO)
11. A5 - Flujo Comision Evaluadora (ALTO)
12. A7 - Menu evaluado + Proponer (ALTO)
13. A1 - Metas con Dependencia (ALTO)
14. M1-M7 - Gaps medios
15. B1-B3 - Gaps bajos
