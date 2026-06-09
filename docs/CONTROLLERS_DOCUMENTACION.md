# DOCUMENTACION DE CONTROLLERS PHP - EDL-CAREPA

## Resumen General

- **Total controllers:** 21
- **Patron arquitectonico:** Controller -> Service -> Repository (en algunos casos acceso directo a DB via PDO)
- **Helpers comunes:** ResponseHelper, SanitizerHelper, ValidatorHelper, AuthMiddleware, CsrfHelper, PdfHelper
- **Paginacion estandar:** parametros `pagina` (default 1) y `por_pagina` (default 20)
- **Soft delete:** uso de campo `eliminado_en` en la mayoria de tablas
- **Entrada JSON:** `json_decode(file_get_contents('php://input'), true)`
- **Sanitizacion:** `SanitizerHelper::sanitizeArray()` en todos los inputs

---

## 1. AuthController

**Archivo:** `backend/src/Controller/AuthController.php`
**Dependencias:** AuthService, ResponseHelper, SanitizerHelper, ValidatorHelper, AuthMiddleware, CsrfHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| POST | `login()` | No | documento=required, password=required |
| POST | `registro()` | No | documento=required, tipo_documento=required, nombres=required, apellidos=required, email=required\|email, password=required\|min:8 |
| POST | `logout()` | Si | (ninguna) |
| POST | `recuperar()` | No | email=required\|email |
| POST | `verificarCodigo()` | No | codigo=required |
| PUT | `resetPassword($token)` | No | password=required\|min:8 |
| GET | `perfil()` | Si | (ninguna) |
| PUT | `actualizarPerfil()` | Si | (ninguna en controller, delega al service) |
| PUT | `cambiarPassword()` | Si | password_actual=required, password_nueva=required\|min:8 |
| POST | `refreshToken()` | No (pero requiere Bearer token) | Token en header Authorization: Bearer {token} |
| GET | `csrfToken()` | No | (ninguna) |
| PUT | `cambiarRol()` | Si | rol_codigo=required |

### Reglas de negocio
- Login requiere documento + password
- Registro minimo 8 caracteres para password, email valido
- Recuperacion de password envia codigo al correo
- Reset password via token con minimo 8 caracteres
- Cambio de password requiere password actual y nueva (min 8)
- Cambio de rol activo requiere autenticacion y codigo de rol valido
- Refresh token extrae Bearer token del header Authorization

---

## 2. CompromisoController

**Archivo:** `backend/src/Controller/CompromisoController.php` (607 lineas - EL MAS GRANDE)
**Dependencias:** CompromisoService, ResponseHelper, SanitizerHelper, AuthMiddleware, Database (PDO directo)

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros: estado, evaluador_id, responsable_id. Paginado. |
| GET | `buscarEvaluado()` | Si | documento=required (query param), periodo_id opcional |
| GET | `competenciasComportamentales()` | Si | (ninguna) |
| POST | `guardarFuncional()` | Si | evaluacion_id=required, descripcion=required, peso=required (0-100) |
| DELETE | `eliminarFuncional($id)` | Si | Solo el evaluador que creo el compromiso puede eliminarlo |
| DELETE | `eliminarComportamental($id)` | Si | Solo el evaluador que creo el compromiso puede eliminarlo |
| PUT | `aceptarEvaluado($id)` | Si | Solo responsable_id puede aceptar; estado debe ser 'propuesto' o 'aprobado' |
| PUT | `rechazarEvaluado($id)` | Si | Solo responsable_id puede rechazar; estado debe ser 'propuesto' o 'aprobado'; observaciones_evaluado=required |
| POST | `guardarComportamental()` | Si | evaluacion_id=required, competencias=required (array 3-5 elementos) |
| GET | `listarPorEvaluacion($evaluacionId)` | Si | (ninguna) |
| POST | `confirmarConcertacion($evaluacionId)` | Si | Verificacion compleja (ver reglas abajo) |
| POST | `enviar()` | Si | evaluacion_id=required, tipo=required (funcional/comportamental), descripcion=required, evaluador_id=required |
| PUT | `aprobar($id)` | Si | peso=required (0-100) |
| PUT | `rechazar($id)` | Si | (ninguna, observaciones opcional) |
| GET | `resumenPesos($evaluacionId)` | Si | (ninguna) |
| GET | `pendientesAprobacion()` | Si | Paginado |
| PUT | `actualizar($id)` | Si | (delegado al service) |
| PUT | `calificar($id)` | Si | puntaje=required (0-100) |
| PUT | `devolver($id)` | Si | observaciones_evaluador=required |

### Reglas de negocio criticas
- **Compromisos funcionales:** maximo 5 por evaluacion, peso entre 0 y 100
- **Compromisos comportamentales:** minimo 3, maximo 5 competencias
- **Confirmacion de concertacion requiere:**
  - Minimo 1 compromiso funcional, maximo 5
  - Suma de pesos funcionales debe ser EXACTAMENTE 100
  - Minimo 3 compromisos comportamentales, maximo 5
  - Solo el evaluador de la evaluacion puede confirmar
  - Al confirmar, la evaluacion cambia a estado 'concertacion' con fecha_concertacion = CURDATE()
- **Busqueda de evaluado:** mapea tipo_vinculacion a nivel (planta->Directivo, contrato->Asesor, provisional->Tecnico, encargo->Asesor, comision->Profesional)
- **Eliminacion:** soft delete (SET eliminado_en = NOW())
- **Eliminar comportamental:** tambien elimina registro en tabla compromiso_comportamental
- **Aceptacion/Rechazo evaluado:** solo si estado es 'propuesto' o 'aprobado'; rechazo requiere observaciones obligatorias
- **Envio de compromiso por evaluado:** estado se establece como 'propuesto'
- **Aprobacion por evaluador:** requiere asignar peso (0-100)
- **Devolucion:** requiere observaciones obligatorias del evaluador
- **Calificacion:** puntaje entre 0 y 100

---

## 3. MenuController

**Archivo:** `backend/src/Controller/MenuController.php`
**Dependencias:** ResponseHelper, AuthMiddleware, Database (PDO directo)

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `obtener()` | Si | (ninguna) |

### Reglas de negocio
- Genera menu dinamico segun rol activo del usuario
- **Rol admin:** Inicio, Usuarios, Entidades, Dependencias, Periodos, Evaluaciones, Aprobar Compromisos, Evidencias, Parametros, Reportes, Auditoria
- **Rol evaluador:** Inicio, Compromisos y Competencias, Evidencias, Compromisos de mejoramiento, Evaluar
- **Rol evaluado:** Inicio, Compromisos y Competencias, Evidencias, Ver Evaluaciones
- **Roles personalizados:** consulta permisos desde BD (rol_permiso -> permisos), mapea modulos a items de menu
- Cada item de menu incluye: label, icon, ruta, permisos (array de codigos)

---

## 4. CompetenciaController

**Archivo:** `backend/src/Controller/CompetenciaController.php`
**Dependencias:** CompetenciaRepository, ResponseHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtro opcional: decreto (query param) |
| GET | `decretos()` | Si | (ninguna) |

### Reglas de negocio
- Listado de competencias comportamentales (Decreto 2539/2005 y 815/2018)
- Filtrable por decreto
- Devuelve lista de decretos disponibles

---

## 5. ReporteController

**Archivo:** `backend/src/Controller/ReporteController.php`
**Dependencias:** ReporteService, ResponseHelper, SanitizerHelper, PdfHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `concertacion()` | Si | Filtros via query params |
| GET | `evaluaciones()` | Si | Filtros via query params |
| GET | `funcionario($id)` | Si | (ninguna) |
| GET | `resumen()` | Si | periodo_id=required |
| GET | `porEntidad($id)` | Si | periodo_id=required |
| GET | `porDependencia($id)` | Si | periodo_id=required |
| GET | `compromisos()` | Si | Filtros via query params |
| GET | `descargarExcel($tipo)` | Si | tipo en URL; filtros via query params |
| GET | `pdfConcertacion($id)` | Si | (ninguna) |
| GET | `pdfEvaluacion($id)` | Si | (ninguna) |

### Reglas de negocio
- Genera reportes de concertacion, evaluaciones, funcionario, resumen general
- Reportes por entidad y por dependencia requieren periodo_id obligatorio
- Exportacion CSV con headers de descarga (Content-Type: text/csv, Content-Disposition)
- Generacion de PDFs de concertacion y evaluacion usando PdfHelper
- Nombre de archivo CSV: `reporte_{tipo}_{fecha}.csv`

---

## 6. CompromisoMejoramientoController

**Archivo:** `backend/src/Controller/CompromisoMejoramientoController.php`
**Dependencias:** CompromisoMejoramientoService, ResponseHelper, SanitizerHelper, AuthMiddleware

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| POST | `crear($concertacionId)` | Si | motivo=required, aspecto_corregir=required, acciones_mejoramiento=required |
| GET | `listar($concertacionId)` | Si | Paginado. Filtros adicionales via query params. |
| GET | `ver($id)` | Si | (ninguna) |
| PUT | `actualizar($id)` | Si | (delegado al service) |
| PUT | `seguimiento($id)` | Si | (delegado al service) |
| PUT | `completar($id)` | Si | (ninguna) |

### Reglas de negocio
- Motivos validos: 'nivel_no_satisfactorio', 'nivel_satisfactorio', 'solicitud_evaluado'
- Asociado a una concertacion (concertacionId en URL)
- Puede vincularse a un compromiso existente (compromiso_id opcional)
- Seguimiento y completacion son operaciones especializadas del service

---

## 7. MovilidadController

**Archivo:** `backend/src/Controller/MovilidadController.php`
**Dependencias:** MovilidadService, ResponseHelper, SanitizerHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| GET | `ver($id)` | Si | (ninguna) |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| DELETE | `eliminar($id)` | Si | (ninguna en controller) |

### Reglas de negocio
- CRUD estandar para movilidad de funcionarios
- Validaciones delegadas al service layer

---

## 8. AusentismoController

**Archivo:** `backend/src/Controller/AusentismoController.php`
**Dependencias:** AusentismoService, ResponseHelper, SanitizerHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| GET | `ver($id)` | Si | (ninguna) |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| DELETE | `eliminar($id)` | Si | (ninguna en controller) |

### Reglas de negocio
- CRUD estandar para registro de ausentismos
- Estructura identica a MovilidadController (patron CRUD generico)

---

## 9. EntidadController

**Archivo:** `backend/src/Controller/EntidadController.php`
**Dependencias:** EntidadService, ResponseHelper, SanitizerHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| GET | `ver($id)` | Si | (ninguna) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| DELETE | `eliminar($id)` | Si | (ninguna en controller) |
| GET | `jefes($id)` | Si | (ninguna) |
| GET | `dependencias($id)` | Si | (ninguna) |
| PUT | `habilitar($id)` | Si | (ninguna) |

### Reglas de negocio
- CRUD de entidades con operaciones adicionales
- `jefes($id)`: lista los jefes asociados a una entidad
- `dependencias($id)`: lista las dependencias de una entidad
- `habilitar($id)`: habilita una entidad (cambio de estado)

---

## 10. EvaluacionController

**Archivo:** `backend/src/Controller/EvaluacionController.php`
**Dependencias:** EvaluacionService, CompromisoService, ResponseHelper, SanitizerHelper, AuthMiddleware

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| GET | `ver($id)` | Si | (ninguna) |
| PUT | `calificar($id)` | Si | (validaciones delegadas al service) |
| GET | `compromisos($id)` | Si | (ninguna) |
| POST | `crearCompromiso($id)` | Si | Usa CompromisoService->crear() |
| POST | `crearParcial($id)` | Si | (validaciones delegadas al service) |
| PUT | `calificarDefinitiva($id)` | Si | (validaciones delegadas al service) |
| PUT | `aprobarComision($id)` | Si | (validaciones delegadas al service) |
| GET | `pendientesCalificar()` | Si | Paginado |

### Reglas de negocio
- Gestiona el ciclo completo de evaluacion de desempeño
- **crearCompromiso:** crea un compromiso asociado a una evaluacion/concertacion
- **crearParcial:** crea una evaluacion parcial a partir de una existente
- **calificarDefinitiva:** calificacion final de la evaluacion
- **aprobarComision:** aprobacion por Comision Evaluadora
- **pendientesCalificar:** lista evaluaciones pendientes de calificacion
- Usa CompromisoService directamente para crear compromisos dentro de evaluaciones

---

## 11. UsuarioController

**Archivo:** `backend/src/Controller/UsuarioController.php`
**Dependencias:** UsuarioService, AuthService, ResponseHelper, SanitizerHelper, AuthMiddleware

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| GET | `ver($id)` | Si | (ninguna) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| DELETE | `eliminar($id)` | Si | (ninguna en controller) |
| PUT | `restablecerPassword($id)` | Si | (ninguna) |
| PUT | `asignarRoles($id)` | Si | roles=required (array), entidad_id opcional |

### Reglas de negocio
- CRUD de usuarios con operaciones administrativas
- **restablecerPassword:** genera password temporal via AuthService, la devuelve en la respuesta
- **asignarRoles:** asigna multiples roles a un usuario, opcionalmente asociados a una entidad
- Validacion: roles debe ser un arreglo no vacio

---

## 12. EvidenciaController

**Archivo:** `backend/src/Controller/EvidenciaController.php`
**Dependencias:** EvidenciaService, ResponseHelper, SanitizerHelper, AuthMiddleware

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| POST | `registrar()` | Si | concertacion_id=required, descripcion=required |
| POST | `subir()` | Si | Alias de registrar() |
| GET | `ver($id)` | Si | (ninguna) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| PUT | `verificar($id)` | Si | Alias de actualizar() |

### Reglas de negocio
- Evidencias vinculadas a concertaciones
- `subir()` es alias de `registrar()`
- `verificar()` es alias de `actualizar()` - la verificacion se maneja como una actualizacion especial

---

## 13. ConcertacionController

**Archivo:** `backend/src/Controller/ConcertacionController.php`
**Dependencias:** ConcertacionService, ResponseHelper, SanitizerHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| GET | `ver($id)` | Si | (ninguna) |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| PUT | `fijarCompromisos($id)` | Si | (ninguna en controller) |
| GET | `compromisos($id)` | Si | (ninguna) |

### Reglas de negocio
- Gestiona concertaciones (acuerdos entre evaluador y evaluado)
- **fijarCompromisos:** el evaluador fija/consolida los compromisos de una concertacion
- **compromisos:** lista compromisos asociados a una concertacion

---

## 14. DashboardController

**Archivo:** `backend/src/Controller/DashboardController.php`
**Dependencias:** Database (PDO directo), ResponseHelper, AuthMiddleware, NotificacionService

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `resumen()` | Si | (ninguna) |
| GET | `adminStats()` | Si | (ninguna) |
| GET | `actividad()` | Si | Paginado: por_pagina (max 50), pagina |

### Reglas de negocio
- **resumen():** devuelve conteos de entidades, usuarios, evaluaciones, periodos activos, notificaciones no leidas, compromisos pendientes de aprobacion (si tiene rol evaluador/jefe/admin), compromisos enviados por el usuario
- **adminStats():** estadisticas detalladas para panel admin: evaluados activos, evaluadores registrados, evaluaciones completadas/pendientes, progreso por dependencia (top 10), periodo activo, evaluaciones recientes (8), entidades activas
- **actividad():** registro de auditoria paginado (tabla auditoria)
- Acceso directo a BD (no usa Service layer) con queries complejas
- Evaluaciones pendientes: estados 'pendiente','concertacion','en_proceso'
- Evaluaciones completadas: estados 'calificada','aprobada_comision','cerrada'
- Permisos para aprobar compromisos: roles evaluador, jefe_entidad, jefe_dependencia, admin

---

## 15. CargaMasivaController

**Archivo:** `backend/src/Controller/CargaMasivaController.php`
**Dependencias:** CargaMasivaService, ResponseHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `historial()` | Si | Paginado |
| POST | `usuarios()` | Si | Archivo en $_FILES['archivo'] |
| POST | `concertaciones()` | Si | Archivo en $_FILES['archivo'] |
| POST | `evaluaciones()` | Si | Archivo en $_FILES['archivo'] |
| POST | `cursos()` | Si | Archivo en $_FILES['archivo'] |

### Reglas de negocio
- Carga masiva via archivos subidos ($_FILES)
- Tipos de carga: usuarios, concertaciones, evaluaciones, cursos
- Cada carga devuelve un carga_id para seguimiento
- Historial de cargas previas

---

## 16. ConsultaFuncionarioController

**Archivo:** `backend/src/Controller/ConsultaFuncionarioController.php`
**Dependencias:** Database (PDO directo), ResponseHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `consultar($documento)` | Si | documento en URL |

### Reglas de negocio
- Consulta rapida de funcionario por numero de documento
- Devuelve: id, documento, tipo_documento, nombres, apellidos, email, cargo, estado, entidad_nombre, dependencia_nombre
- Incluye roles del funcionario (via join usuario_rol -> roles)
- Solo consulta usuarios no eliminados (eliminado_en IS NULL)
- Error 404 si no encuentra el funcionario

---

## 17. DependenciaController

**Archivo:** `backend/src/Controller/DependenciaController.php`
**Dependencias:** DependenciaService, ResponseHelper, SanitizerHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| GET | `ver($id)` | Si | (ninguna) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| DELETE | `eliminar($id)` | Si | (ninguna en controller) |

### Reglas de negocio
- CRUD estandar de dependencias
- Limpia parametros de paginacion/orden de los filtros antes de enviar al service (pagina, por_pagina, orden, direccion, page, per_page)

---

## 18. MetaController

**Archivo:** `backend/src/Controller/MetaController.php`
**Dependencias:** MetaService, ResponseHelper, SanitizerHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| GET | `ver($id)` | Si | (ninguna) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| GET | `evidencias($id)` | Si | (ninguna) |
| POST | `crearConcertacion($id)` | Si | (validaciones delegadas al service) |

### Reglas de negocio
- CRUD de metas con relaciones
- **evidencias($id):** lista evidencias asociadas a una meta
- **crearConcertacion($id):** crea una concertacion a partir de una meta

---

## 19. NotificacionController

**Archivo:** `backend/src/Controller/NotificacionController.php`
**Dependencias:** NotificacionRepository, ResponseHelper, AuthMiddleware

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Paginado. Solo notificaciones del usuario autenticado. |
| PUT | `marcarLeida($id)` | Si | Solo puede marcar sus propias notificaciones |

### Reglas de negocio
- Lista notificaciones del usuario autenticado (user['id'])
- Marcar como leida verifica pertenencia al usuario
- Usa Repository directamente (no Service)

---

## 20. ParametroController

**Archivo:** `backend/src/Controller/ParametroController.php`
**Dependencias:** Database (PDO directo), ResponseHelper, SanitizerHelper, AuditoriaService, AuthMiddleware

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | (ninguna) |
| GET | `verPorClave($clave)` | Si | (ninguna) |
| POST/PUT | `upsert()` | Si | clave=required, valor=required |
| PUT | `actualizarMasivo()` | Si | parametros=required (array de objetos con clave+valor) |
| DELETE | `eliminar($id)` | Si | (ninguna) |

### Reglas de negocio
- **upsert:** si la clave ya existe, actualiza; si no, crea. Tipo default: 'texto'
- **actualizarMasivo:** upsert masivo con transaccion (beginTransaction/commit/rollBack). Usa ON DUPLICATE KEY UPDATE
- **eliminar:** elimina fisicamente (DELETE, no soft delete) y registra en auditoria
- **auditoria:** todas las operaciones registran en AuditoriaService (crear, actualizar, actualizar_masivo, eliminar)
- **verPorClave:** error 404 si no encuentra el parametro
- Acceso directo a BD (no usa Service layer)

---

## 21. PeriodoController

**Archivo:** `backend/src/Controller/PeriodoController.php`
**Dependencias:** PeriodoService, ResponseHelper, SanitizerHelper

### Endpoints

| Metodo | Funcion | Autenticacion | Validaciones |
|--------|---------|---------------|--------------|
| GET | `listar()` | Si | Filtros via query params, paginado |
| POST | `crear()` | Si | (validaciones delegadas al service) |
| GET | `ver($id)` | Si | (ninguna) |
| PUT | `actualizar($id)` | Si | (validaciones delegadas al service) |
| GET | `metas($id)` | Si | Paginado |
| GET | `evaluaciones($id)` | Si | Paginado |

### Reglas de negocio
- CRUD de periodos evaluativos
- **metas($id):** lista metas asociadas a un periodo
- **evaluaciones($id):** lista evaluaciones asociadas a un periodo

---

## RESUMEN DE DEPENDENCIAS POR CAPA

### Services usados por los Controllers
| Service | Controllers que lo usan |
|---------|------------------------|
| AuthService | AuthController, UsuarioController |
| CompromisoService | CompromisoController, EvaluacionController |
| CompromisoMejoramientoService | CompromisoMejoramientoController |
| ConcertacionService | ConcertacionController |
| EvaluacionService | EvaluacionController |
| EvidenciaService | EvidenciaController |
| EntidadService | EntidadController |
| DependenciaService | DependenciaController |
| MovilidadService | MovilidadController |
| AusentismoService | AusentismoController |
| UsuarioService | UsuarioController |
| PeriodoService | PeriodoController |
| MetaService | MetaController |
| ReporteService | ReporteController |
| CargaMasivaService | CargaMasivaController |
| NotificacionService | DashboardController |
| AuditoriaService | ParametroController |

### Repositories usados directamente
| Repository | Controller |
|------------|-----------|
| CompetenciaRepository | CompetenciaController |
| NotificacionRepository | NotificacionController |

### Controllers con acceso directo a PDO (sin Service)
| Controller | Tablas consultadas directamente |
|------------|-------------------------------|
| CompromisoController | compromisos, evaluaciones, compromiso_comportamental, competencias_comportamentales, usuarios, dependencias, periodos |
| DashboardController | entidades, usuarios, evaluaciones, periodos, compromisos, dependencias, usuario_rol, roles, auditoria |
| ConsultaFuncionarioController | usuarios, entidades, dependencias, usuario_rol, roles |
| ParametroController | parametros |

### Helpers usados
| Helper | Uso |
|--------|-----|
| ResponseHelper | Todos los controllers - formato uniforme de respuesta JSON |
| SanitizerHelper | Casi todos los controllers - sanitizacion de inputs |
| ValidatorHelper | Solo AuthController - validacion declarativa de campos |
| AuthMiddleware | Controllers con autenticacion - obtiene usuario actual |
| CsrfHelper | Solo AuthController - generacion de token CSRF |
| PdfHelper | Solo ReporteController - generacion de PDFs |

### Estados de evaluacion identificados
- pendiente
- concertacion
- en_proceso
- calificada
- aprobada_comision
- cerrada

### Estados de compromiso identificados
- propuesto
- aprobado
- aceptado_evaluado
- rechazado_evaluado

### Tipos de vinculacion (mapeo a nivel)
| tipo_vinculacion | nivel |
|-----------------|-------|
| planta | Directivo |
| contrato | Asesor |
| provisional | Tecnico |
| encargo | Asesor |
| comision | Profesional |
| (default) | Tecnico |

### Estados de periodo identificados
- configuracion
- concertacion
- seguimiento
- evaluacion
- calificacion
