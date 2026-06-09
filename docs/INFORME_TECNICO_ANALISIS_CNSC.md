# INFORME TECNICO: Analisis del Documento de Referencia CNSC vs Proyecto EDL-Carepa

## Fecha: Junio 2026

---

## 1. RESUMEN EJECUTIVO

Se analizo el documento "Documentacion Funcional y Tecnica de la EDL APP" (extraido de videos tutoriales oficiales de la CNSC) y se cruza con el estado actual del proyecto EDL-Carepa. El documento define la plataforma de referencia del CNSC para la Evaluacion del Desempeno Laboral en Colombia (Acuerdo 6176 de 2018).

**Resultado:** El proyecto EDL-Carepa implementa parcialmente la funcionalidad descrita en el documento de referencia. Se identificaron **18 brechas funcionales** (cosas que el documento exige pero el proyecto no tiene), **7 inconsistencias** (cosas implementadas de forma diferente) y **5 problemas criticos heredados** (bugs del codigo actual que impiden cumplir los flujos del documento).

---

## 2. ANALISIS DEL DOCUMENTO DE REFERENCIA

### 2.1 Proposito General

La EDL APP es la plataforma oficial de la CNSC para gestionar el ciclo completo de la Evaluacion del Desempeno Laboral de servidores publicos en Colombia, conforme al Acuerdo 6176 de 2018. El sistema cubre: creacion de usuarios, concertacion de compromisos, seguimiento mediante evidencias, evaluaciones parciales y definitivas, aprobacion por comision evaluadora, y generacion de reportes.

### 2.2 Roles del Sistema (segun documento CNSC)

| Rol | Descripcion | Permiso clave |
|-----|-------------|---------------|
| **Jefe de Personal** | Administrador principal de la entidad. Crea dependencias, metas, usuarios, ausentismos. Asigna roles. | CRUD completo de usuarios, dependencias, metas, ausentismos, reportes |
| **Evaluador** | Concerta compromisos, registra evidencias, califica desempeño. Asignado por defecto si la naturaleza del cargo es "Libre Nombramiento" o "Gerencia Publica" | Concertar, evaluar, calificar |
| **Evaluado** | Servidor publico evaluado. Puede proponer compromisos si el evaluador no lo hace. Debe aprobar o rechazar compromisos concertados. Asignado por defecto si la naturaleza es "Carrera Administrativa" | Proponer compromisos, aprobar/rechazar concertacion |
| **Cargador** | Rol de apoyo para contratistas. Carga informacion, registra metas y ausentismos | Carga de datos, metas, ausentismos |
| **Comision Evaluadora** | Servidor de Libre Nombramiento y Remocion. Aprueba o rechaza evaluaciones realizadas por el evaluador | Aprobar/rechazar evaluaciones |

### 2.3 Modulos del Sistema (segun documento CNSC)

1. **Inicio** - Cambio de contraseña
2. **Periodos** - Visualizacion informativa de etapas del proceso EDL
3. **Dependencias** - CRUD por Jefe de Personal (nombre + codigo, activo/inactivo, validacion de usuarios asociados)
4. **Metas** - CRUD por Jefe de Personal (periodo + dependencia + descripcion)
5. **Usuarios** - CRUD completo con sub-pestanas: Tabla, Crear/Editar, Movilidad
6. **Ausentismos** - Registro de periodos no evaluables >30 dias
7. **Compromisos y Competencias** - Concertacion (evaluador), Propuesta (evaluado), Aprobacion mutua
8. **Evidencias** - Registro descriptivo (sin archivos adjuntos segun CNSC)
9. **Compromisos de Mejoramiento** - Acciones correctivas derivadas del seguimiento
10. **Evaluaciones y Calificacion** - Parciales (semestrales/eventuales) y definitivas, con aprobacion de comision
11. **Cargue Masivo** - Plantillas para registro masivo de usuarios

### 2.4 Flujos de Trabajo Clave

**Concertacion de Compromisos:**
1. Evaluador ingresa compromisos funcionales (1-5, con peso %) y comportamentales (3-5 competencias)
2. Evaluado VE y ACEPTA o RECHAZA los compromisos (aprobacion mutua)
3. Si el evaluador no actua, el evaluado puede proponer; el evaluador luego acepta o rechaza

**Evaluacion:**
1. Evaluador califica compromisos funcionales (1-100)
2. Evaluador califica compromisos comportamentales (escala de frecuencia: Nunca, Algunas veces, Frecuentemente, Siempre)
3. Preguntas de validacion: "Las conductas favorecieron el logro?" y "Las conductas permitieron exceder el resultado?"
4. Comision Evaluadora aprueba o rechaza la evaluacion

**Tipos de evaluacion:** Parcial Eventual, Primer Semestre, Segundo Semestre, Calificacion Extraordinaria

---

## 3. BRECHAS FUNCIONALES (lo que falta)

### PRIORIDAD ALTA - Impiden flujos centrales del sistema

**B1. El Evaluado no puede aprobar/rechazar compromisos concertados**
- Documento: El evaluado ingresa a "Ver compromisos por aprobar" y puede "Aceptar compromisos" o "Rechazar compromisos"
- Estado actual: El evaluado solo puede PROPOSER compromisos (via /compromisos/enviar). No existe endpoint ni pantalla para que el evaluado acepte o rechace los compromisos ingresados por el evaluador. El flujo de concertacion es unilateral: evaluador aprueba y ya.
- Impacto: Violacion del principio de bilateralidad del Acuerdo 6176. La concertacion debe ser mutua.
- Solucion: Crear endpoint PUT /api/v1/compromisos/{id}/aceptar-evaluado y PUT /api/v1/compromisos/{id}/rechazar-evaluado. Crear pantalla en MisCompromisos.tsx con seccion "Compromisos por aprobar". Modificar flujo: cuando el evaluador confirma compromisos, estos quedan en estado "concertado_pendiente_aprobacion" hasta que el evaluado los acepte o rechace.

**B2. No existe el rol "Jefe de Personal"**
- Documento: Rol principal de administracion de la entidad. CRUD de dependencias, metas, usuarios, ausentismos, reportes, asignacion de roles.
- Estado actual: El sistema usa "admin" como superadministrador global. No existe "Jefe de Personal" como rol que administra una entidad especifica.
- Impacto: El modelo de roles no refleja la estructura funcional del CNSC. Un "admin" global no es equivalente a un "Jefe de Personal" que solo gestiona su entidad.
- Solucion: Crear rol "jefe_personal" en seeds.sql con permisos especificos (entidades.listar/crear/editar, dependencias.*, metas.*, usuarios.*, ausentismos.*, reportes.*). Restringir alcance por entidad via TenantMiddleware. Actualizar RoleSelector.tsx.

**B3. No existe el rol "Cargador"**
- Documento: Rol de apoyo para contratistas. Carga informacion, registra metas y ausentismos.
- Estado actual: No existe. Los contratistas se crean como "evaluado" sin campos diferenciados.
- Impacto: No se puede asignar el rol correcto a contratistas que deben cargar datos sin ser evaluados.
- Solucion: Crear rol "cargador" en seeds.sql con permisos: cargas.ejecutar, cargas.listar, metas.crear, ausentismos.crear.

**B4. Faltan campos en el formulario de creacion de usuarios**
- Documento exige: Genero, Ubicacion (departamento + municipio), Confirmacion de email, Telefono 2, "Es contratista?" (condicional), Nivel, Naturaleza del cargo, Tipo de nombramiento, Denominacion del empleo, Codigo del empleo, Proposito principal del empleo, "Es evaluador y susceptible de evaluacion?", Periodo de prueba (condicional con fecha de posesion), Fecha de inicio del periodo si no inicio el 1 de febrero, Motivo del cambio.
- Estado actual: La tabla usuarios tiene: documento, tipo_documento, nombres, apellidos, email, telefono, cargo, grado, tipo_vinculacion, fecha_vinculacion. Faltan: genero, departamento, municipio, telefono2, confirmacion_email, es_contratista, nivel, naturaleza_cargo, tipo_nombramiento, denominacion_empleo, codigo_empleo, proposito_empleo, es_evaluador_evaluable, periodo_prueba, fecha_posesion, fecha_inicio_periodo, motivo_cambio.
- Impacto: No se puede registrar un usuario con los datos que exige el CNSC. La informacion laboral condicional es fundamental para determinar el rol automatico (evaluador vs evaluado).
- Solucion: Alter tabla usuarios agregando campos. Actualizar Usuario.php, UsuarioRepository.php, UsuarioService.php, AuthController (registro). Actualizar formulario de creacion en frontend (AdminUsuarios.tsx o nueva pagina). Implementar logica condicional del formulario.

**B5. No existe el modulo "Compromisos de Mejoramiento"**
- Documento: Modulo separado donde el evaluador registra acciones correctivas derivadas del seguimiento. Campos: Compromiso o competencia asociada, Motivo, Aspecto a corregir, Acciones de mejoramiento, Observacion.
- Estado actual: No existe tabla, modelo, repository, service, controller ni pagina para compromisos de mejoramiento. La migracion migration_edl_carepa.sql convierte compromisos tipo "mejoramiento" a "funcional" (los elimina como tipo separado).
- Impacto: Funcionalidad requerida por el CNSC completamente ausente. Las acciones de mejoramiento son parte del ciclo de seguimiento.
- Solucion: Crear tabla compromisos_mejoramiento (id, evaluacion_id, compromiso_id, motivo, aspecto_corregir, acciones_mejoramiento, observaciones, creado_por, timestamps). Crear modelo, repository, service, controller. Crear pagina en frontend.

**B6. No se pueden generar/descargar documentos en PDF**
- Documento: El sistema permite descargar formularios de concertacion y evaluacion en formato PDF para archivo y notificacion.
- Estado actual: No existe generacion de PDF en ningun modulo. No hay libreria de PDF instalada (no Dompdf, no mPDF, no FPDF en composer.json).
- Impacto: No se puede formalizar ni archivar documentalmente ninguna concertacion ni evaluacion. Requisito esencial del proceso.
- Solucion: Instalar Dompdf o mPDF via composer. Crear ReporteService::generarPDFConcertacion() y ReporteService::generarPDFFvaluacion(). Crear endpoints GET /api/v1/reportes/concertacion/{id}/pdf y GET /api/v1/reportes/evaluacion/{id}/pdf.

**B7. No existe exportacion a Excel de reportes**
- Documento: Los reportes de evaluaciones y calificaciones pueden exportarse a Excel.
- Estado actual: No hay libreria de Excel instalada. ReporteController solo devuelve JSON.
- Impacto: No se puede extraer informacion para analisis externo ni cumplimiento de requerimientos de archivo.
- Solucion: Instalar PhpSpreadsheet via composer. Implementar endpoints de exportacion en ReporteController.

**B8. No existe "Calificacion Extraordinaria" como tipo de evaluacion**
- Documento: Tipos de evaluacion incluyen "Calificacion Extraordinaria" ademas de Parcial Eventual, Primer Semestre, Segundo Semestre.
- Estado actual: El enum evaluaciones.tipo solo tiene: parcial_semestral, parcial_eventual, definitiva. No existe "extraordinaria".
- Impacto: No se puede registrar un tipo de evaluacion que el CNSC contempla.
- Solucion: Agregar 'extraordinaria' al enum evaluaciones.tipo en schema.sql y migracion ALTER. Actualizar frontend y backend.

### PRIORIDAD MEDIA - Funcionalidad parcial o deficiente

**B9. El modulo de Metas esta incompleto**
- Documento: Las metas son creadas por el Jefe de Personal y se asocian a un Periodo + Dependencia. Son el insumo para los compromisos funcionales.
- Estado actual: Las metas existen pero se crean por funcionario (metas.funcionario_id), no por dependencia. No tienen campo de dependencia directa. El flujo del CNSC es: Jefe de Personal crea meta para la dependencia -> Evaluador asocia compromiso funcional a esa meta.
- Supuesto: El modelo actual (metas por funcionario) puede ser una adaptacion deliberada para Carepa, pero diverge del flujo CNSC.
- Solucion: Agregar dependencia_id a la tabla metas. Permitir creacion por Jefe de Personal. Modificar el flujo de compromisos funcionales para que se asocien a metas de la dependencia, no a metas individuales.

**B10. No existe la funcionalidad "Restaurar password" por parte del admin**
- Documento: El Jefe de Personal puede "Restaurar password" de un usuario desde la tabla de usuarios.
- Estado actual: No existe endpoint para que un administrador resetee la contraseña de otro usuario. Solo existe recuperacion automatica por correo.
- Impacto: El administrador no puede ayudar a usuarios que no tienen acceso a correo.
- Solucion: Crear endpoint PUT /api/v1/usuarios/{id}/restaurar-password que genere una contraseña temporal y la envie por correo o la muestre en pantalla.

**B11. No existe la funcionalidad "Ver evaluaciones" en formato PDF desde el modulo de usuarios**
- Documento: Desde la tabla de usuarios, el Jefe de Personal puede "Ver evaluaciones" y descargar resultados en PDF.
- Estado actual: No existe esta opcion en la tabla de usuarios del frontend.
- Impacto: El administrador no tiene acceso directo a los resultados evaluativos de un funcionario.
- Solucion: Agregar boton "Ver evaluaciones" en AdminUsuarios.tsx que abra un listado de evaluaciones del usuario con opcion de descarga PDF.

**B12. No existe la funcionalidad "Administrar roles" desde la tabla de usuarios**
- Documento: El Jefe de Personal puede "Administrar roles" (asignar perfiles) desde la tabla de usuarios.
- Estado actual: AdminUsuarios.tsx permite crear usuarios pero no tiene boton dedicado para administrar roles de un usuario existente.
- Impacto: La gestion de roles no es accesible desde la interfaz de administracion de usuarios.
- Solucion: Agregar modal "Administrar roles" en AdminUsuarios.tsx con checkboxes para asignar/remover roles. Crear endpoint PUT /api/v1/usuarios/{id}/roles.

**B13. No existe "Cambiar estado" de dependencias con validacion de usuarios asociados**
- Documento: Una dependencia solo puede inactivarse si no tiene usuarios asociados.
- Estado actual: DependenciaController permite eliminar (soft delete) pero no "cambiar estado" activo/inactivo con validacion de usuarios.
- Impacto: Se puede inactivar una dependencia que tiene usuarios activos, rompiendo integridad.
- Solucion: Agregar endpoint PUT /api/v1/dependencias/{id}/estado. Validar que no tenga usuarios con dependencia_id = esa dependencia antes de inactivar.

**B14. No existe la seleccion de tipo de concertacion**
- Documento: El evaluador debe elegir entre "Concertacion por parte del evaluador y el evaluado" o "Fijados por el evaluador".
- Estado actual: No existe campo ni logica para el tipo de concertacion. Todos los compromisos se registran igual.
- Impacto: No se distingue si los compromisos fueron concertados bilateralmente o impuestos unilateralmente por el evaluador. Esto afecta el proceso de reclamacion.
- Solucion: Agregar campo tipo_concertacion (enum: 'concertada', 'fijada') a la tabla evaluaciones o compromisos. Incluir selector en el formulario de concertacion.

**B15. No existe la configuracion de Comision Evaluadora en la concertacion**
- Documento: Al concertar, el evaluador puede marcar si se conforma una Comision Evaluadora y seleccionar al integrante (Servidor de Libre Nombramiento y Remocion). Tambien puede indicar si no es el jefe inmediato y el motivo.
- Estado actual: El campo es_comision_evaluadora existe en la tabla evaluaciones pero no hay interfaz para configurarlo durante la concertacion. Tampoco existe campo para "motivo si no es jefe inmediato".
- Impacto: No se puede configurar la comision evaluadora en el momento de la concertacion, que es cuando el CNSC lo requiere.
- Solucion: Agregar campo motivo_no_jefe_inmediato a tabla evaluaciones. En el formulario de concertacion, agregar checkbox para comision evaluadora + selector de integrante + campo motivo si no es jefe inmediato.

**B16. No existe escala de frecuencia para calificacion comportamental**
- Documento: La calificacion de compromisos comportamentales usa una escala de frecuencia (Nunca, Algunas veces, Frecuentemente, Siempre) con preguntas de validacion ("Las conductas favorecieron el logro?", "Las conductas permitieron exceder el resultado?").
- Estado actual: Los compromisos comportamentales se califican igual que los funcionales (puntaje numerico 1-100). No existe escala de frecuencia ni preguntas de validacion.
- Impacto: La calificacion comportamental no sigue el instrumento del CNSC. Se pierde la granularidad de la escala de frecuencia.
- Solucion: Crear tabla calificacion_comportamental (id, compromiso_id, conducta, frecuencia enum, creado_en). Modificar el flujo de calificacion para compromisos comportamentales. Agregar preguntas de validacion con justificacion.

**B17. No existe la funcionalidad "Movilidad" como subpestana de usuarios**
- Documento: El modulo de usuarios tiene una subpestana "Movilidad" para trasladar servidores entre entidades.
- Estado actual: Existe una tabla movilidades y un MovilidadController, pero no hay interfaz en AdminUsuarios.tsx para movilizar usuarios. Movilidad es un modulo separado, no una subpestana de usuarios.
- Impacto: El flujo de movilidad no esta integrado con la gestion de usuarios como lo define el CNSC.
- Solucion: Integrar la funcionalidad de movilidad como subpestana dentro del modulo de usuarios. Buscar usuario inactivo, seleccionar "Movilizar", completar datos de destino.

**B18. No existe "Cambio de contraseña" como modulo de Inicio**
- Documento: La pestana Inicio permite al usuario cambiar su contraseña.
- Estado actual: Existe endpoint PUT /api/v1/auth/password pero no hay pantalla de Inicio dedicada con esta funcion. El cambio de contraseña no esta accesible desde una pestana visible del menu.
- Impacto: El usuario no tiene un lugar claro y visible para cambiar su contraseña.
- Solucion: Agregar seccion de cambio de contraseña en el perfil del usuario o en la pagina de inicio del Dashboard.

---

## 4. INCONSISTENCIAS (lo que esta diferente)

**I1. Modelo de roles diferente**
- Documento CNSC: Jefe de Personal, Evaluador, Evaluado, Cargador, Comision Evaluadora (5 roles)
- Proyecto: admin, evaluador, evaluado (3 roles base) + admin_entidad, admin_carepa, comision_evaluadora (3 roles en migracion, sin activar)
- Divergencia: "Jefe de Personal" no existe. "Cargador" no existe. "admin" equivale parcialmente a Jefe de Personal pero es global, no por entidad.

**I2. Las evidencias permiten carga de archivos**
- Documento CNSC: "No se permite la carga de archivos adjuntos. El registro es unicamente descriptivo."
- Proyecto: EvidenciaService permite subir archivos (PDF, DOC, XLS, JPG, PNG) con tamaño maximo configurable.
- Divergencia: El proyecto MEJORA al CNSC permitiendo archivos adjuntos, pero esto contradice la documentacion oficial. Parece una decision deliberada de Carepa.
- Recomendacion: Mantener la carga de archivos (es superior), pero documentar la diferencia con el CNSC.

**I3. Tipos de evaluacion diferentes**
- Documento CNSC: Parcial Eventual, Primer Semestre, Segundo Semestre, Calificacion Extraordinaria
- Proyecto: parcial_semestral, parcial_eventual, definitiva
- Divergencia: No se distingue entre primer y segundo semestre. No existe "extraordinaria". "definitiva" no es un tipo en el CNSC, es el resultado de la calificacion anual.

**I4. Los periodos no son editables por el Jefe de Personal**
- Documento CNSC: "Los periodos son definidos por la CNSC (Acuerdo 617 de 2018) y no pueden ser editados por el Jefe de Personal"
- Proyecto: PeriodoController permite crear y editar periodos.
- Divergencia: Los periodos deberian ser de solo lectura para la entidad, definidos centralmente.
- Recomendacion: Restringir la creacion/edicion de periodos solo para admin_carepa o un rol de nivel central.

**I5. Ausentismos: falta validacion de >30 dias**
- Documento CNSC: "Periodos no evaluables superiores a 30 dias para funcionarios de carrera administrativa o en periodo de prueba"
- Proyecto: AusentismoController permite crear ausentismos sin validar la duracion ni el tipo de vinculacion.
- Divergencia: No se valida que el ausentismo sea >30 dias ni que el funcionario sea de carrera administrativa.

**I6. Numero de compromisos funcionales sin limite**
- Documento CNSC: "Minimo 1, maximo 5 compromisos funcionales para el periodo anual"
- Proyecto: No existe validacion de cantidad minima ni maxima de compromisos por evaluacion.
- Divergencia: Se pueden crear 0 compromisos o mas de 5.

**I7. Numero de compromisos comportamentales sin limite**
- Documento CNSC: "Se seleccionan entre 3 y 5 competencias comportamentales"
- Proyecto: No existe validacion de rango 3-5 para compromisos comportamentales.

---

## 5. PROBLEMAS CRITICOS HEREDADOS (bugs del codigo actual)

Estos problemas impiden que los flujos del documento CNSC funcionen correctamente incluso si se implementan las brechas:

**P1. Database.php usa constante inexistente** - `\Pdo\Mysql::ATTR_FOUND_ROWS` no existe. La correcta es `PDO::MYSQL_ATTR_FOUND_ROWS`. Fatal Error en runtime.

**P2. Conflicto de rutas en evaluaciones** - GET /evaluaciones/pendientes-calificar nunca se alcanza porque /evaluaciones/{id} captura "pendientes-calificar" como ID.

**P3. Modelos PHP incompletos** - Evaluacion y Compromiso no tienen todas las propiedades que usan sus Services y Controllers.

**P4. Variable JWT inconsistente** - .env.example define JWT_EXPIRATION (segundos), JwtHelper lee JWT_EXPIRACION_MINUTOS (minutos).

**P5. Ruta AdminConfiguracion huerfana** - El archivo existe pero no tiene ruta en App.tsx.

---

## 6. PLAN DE CAMBIOS PRIORIZADO

### FASE 0: Correcciones criticas (antes de agregar funcionalidad)

| # | Cambio | Impacto | Esfuerzo estimado |
|---|--------|---------|-------------------|
| P1 | Corregir `Database.php`: `\Pdo\Mysql::ATTR_FOUND_ROWS` -> `PDO::MYSQL_ATTR_FOUND_ROWS` | Sin esto, la BD no conecta | 5 min |
| P2 | Corregir conflicto de rutas: registrar `/evaluaciones/pendientes-calificar` ANTES de `/evaluaciones/{id}` en index.php | Sin esto, endpoint no funciona | 10 min |
| P3 | Completar modelos Evaluacion.php y Compromiso.php con propiedades faltantes | Sin esto, datos se pierden en fromArray/toArray | 30 min |
| P4 | Unificar variable JWT: renombrar en .env.example a JWT_EXPIRACION_MINUTOS, actualizar documentacion | Sin esto, configuracion errada | 10 min |
| P5 | Agregar ruta para AdminConfiguracion en App.tsx | Sin esto, pagina no es accesible | 5 min |

### FASE 1: Modelo de datos y roles (fundacion para todo lo demas)

| # | Cambio | Dependencia | Esfuerzo estimado |
|---|--------|-------------|-------------------|
| B4 | Agregar campos faltantes a tabla usuarios (genero, departamento, municipio, naturaleza_cargo, tipo_nombramiento, denominacion_empleo, codigo_empleo, proposito_empleo, es_contratista, es_evaluador_evaluable, periodo_prueba, fecha_posesion, motivo_cambio, etc.) | Ninguna | 4h |
| B2 | Crear rol "jefe_personal" en seeds.sql con permisos especificos | B4 (campos de usuario) | 2h |
| B3 | Crear rol "cargador" en seeds.sql | Ninguna | 1h |
| B8 | Agregar tipo "extraordinaria" al enum evaluaciones.tipo | Ninguna | 1h |
| I3 | Distinguir primer semestre de segundo semestre (agregar semestre al enum o campo) | Ninguna | 1h |
| B14 | Agregar campo tipo_concertacion a tabla evaluaciones/compromisos | Ninguna | 1h |
| B15 | Agregar campo motivo_no_jefe_inmediato a tabla evaluaciones | Ninguna | 30 min |

### FASE 2: Flujos centrales del proceso EDL

| # | Cambio | Dependencia | Esfuerzo estimado |
|---|--------|-------------|-------------------|
| B1 | Implementar aprobacion/rechazo de compromisos por el evaluado | FASE 1 | 6h |
| B5 | Crear modulo Compromisos de Mejoramiento (tabla, modelo, repo, service, controller, frontend) | FASE 1 | 8h |
| B16 | Implementar escala de frecuencia para calificacion comportamental | B1 (compromisos) | 6h |
| I5 | Validar ausentismos >30 dias y tipo de vinculacion | B4 (campos usuario) | 2h |
| I6-I7 | Validar limites de compromisos (1-5 funcionales, 3-5 comportamentales) | B1 | 2h |
| B13 | Cambio de estado de dependencias con validacion de usuarios | Ninguna | 2h |

### FASE 3: Funcionalidad de administracion y reportes

| # | Cambio | Dependencia | Esfuerzo estimado |
|---|--------|-------------|-------------------|
| B6 | Generacion de PDF para concertaciones y evaluaciones (instalar Dompdf) | B1 | 8h |
| B7 | Exportacion a Excel de reportes (instalar PhpSpreadsheet) | Ninguna | 6h |
| B10 | Restaurar password por admin | Ninguna | 2h |
| B11 | Ver evaluaciones en PDF desde modulo de usuarios | B6 | 3h |
| B12 | Administrar roles desde tabla de usuarios | B2 | 3h |
| B17 | Integrar movilidad como subpestana de usuarios | Ninguna | 3h |
| B18 | Modulo de cambio de contraseña visible en Inicio | Ninguna | 1h |
| I4 | Restringir edicion de periodos solo a rol central | B2 | 1h |

### FASE 4: Mejoras de calidad y UX

| # | Cambio | Esfuerzo estimado |
|---|--------|-------------------|
| Corregir colores hardcoded en Admin (#003366 -> inst-azul) | 2h |
| Eliminar ruta duplicada /evaluar vs /panel-evaluador | 30 min |
| Unificar modelo de roles (RoleSelector vs AdminUsuarios vs ProtectedRoute) | 2h |
| Implementar refresh token o aviso previo a expiracion JWT | 4h |
| Redireccion 401 via React Router en vez de window.location.href | 2h |
| Corregir hash links en Dashboard -> usar Link de React Router | 1h |
| Agregar ESLint + Prettier al frontend | 2h |
| Actualizar .env.example con todas las variables | 30 min |
| Eliminar password real de .env.example | 5 min |
| Actualizar .gitignore | 30 min |
| Corregir nombre workflow CI/CD | 5 min |

---

## 7. RESUMEN DE IMPACTO

| Categoria | Cantidad | Criticidad |
|-----------|----------|------------|
| Brechas funcionales (B) | 18 | Alta (8), Media (10) |
| Inconsistencias (I) | 7 | Alta (2), Media (5) |
| Problemas criticos heredados (P) | 5 | Alta (todas) |
| **Total de cambios requeridos** | **30** | |

### Tiempos estimados

| Fase | Duracion estimada |
|------|-------------------|
| FASE 0: Correcciones criticas | 1 hora |
| FASE 1: Modelo de datos y roles | 10 horas |
| FASE 2: Flujos centrales EDL | 26 horas |
| FASE 3: Administracion y reportes | 27 horas |
| FASE 4: Calidad y UX | 16 horas |
| **Total** | **80 horas** |

---

## 8. RECOMENDACIONES FINALES

1. **Ejecutar FASE 0 inmediatamente.** Los 5 bugs criticos impiden que el sistema funcione correctamente en produccion, independientemente de las mejoras funcionales.

2. **Priorizar B1 (aprobacion bilateral de compromisos).** Es la brecha mas critica desde el punto de vista normativo. El Acuerdo 6176 exige concertacion bilateral. El flujo actual donde el evaluador aprueba y el evaluado no tiene voz viola el espiritu del proceso.

3. **Priorizar B4 (campos de usuario).** Sin los campos correctos en la tabla usuarios, no se puede implementar la logica condicional que determina automaticamente el rol (evaluador vs evaluado segun naturaleza del cargo), ni los flujos de periodo de prueba, ni la informacion de ubicacion.

4. **Decision sobre evidencias:** El proyecto permite carga de archivos (mejor que el CNSC). Mantener esta mejora pero documentarla como divergencia intencional.

5. **Decision sobre periodos:** Si Carepa es la unica entidad usuaria, los periodos pueden ser editables por admin. Si se planea multientidad, restringir a nivel central.

6. **No implementar todo de una vez.** Seguir el orden de fases. Cada fase construye sobre la anterior. FASE 1 es prerequisito de FASE 2 y FASE 3.

7. **Supuestos marcados:** Los items B9 (metas por dependencia vs por funcionario) e I2 (carga de archivos en evidencias) son decisiones de diseno que requieren confirmacion del equipo antes de implementar.
