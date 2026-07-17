# 🛣️ 17 — Referencia de Endpoints API (Backend EDL Carepa)

> **Propósito:** Mapa completo de los **endpoints HTTP** del backend, derivado directamente del archivo fuente `backend/public/index.php` (verificado en commit actual).
>
> **Base URL:** `/api/v1`
> **Autenticación:** `Authorization: Bearer <jwt>` excepto rutas públicas.
> **Formato:** JSON en request y response.
> **Prefijo común:** Todas las rutas cuelgan del prefijo `/api/v1`.

---

## 📋 Tabla de contenidos

1. [Autenticación (público)](#1-autenticación-público)
2. [Consulta de Funcionario (público)](#2-consulta-de-funcionario-público)
3. [Sesión y perfil](#3-sesión-y-perfil)
4. [Menú y notificaciones](#4-menú-y-notificaciones)
5. [Dashboard](#5-dashboard)
6. [Parámetros del sistema](#6-parámetros-del-sistema)
7. [Usuarios](#7-usuarios)
8. [Entidades](#8-entidades)
9. [Dependencias](#9-dependencias)
10. [Períodos](#10-períodos)
11. [Metas](#11-metas)
12. [Concertaciones](#12-concertaciones)
13. [Evaluaciones](#13-evaluaciones)
14. [Compromisos](#14-compromisos)
15. [Compromisos de Mejoramiento](#15-compromisos-de-mejoramiento)
16. [Evidencias](#16-evidencias)
17. [Ausentismos](#17-ausentismos)
18. [Movilidades](#18-movilidades)
19. [Reportes](#19-reportes)
20. [Carga masiva](#20-carga-masiva)
21. [Competencias](#21-competencias)

---

## 1. Autenticación (público)

> **No requieren JWT.** Prefijo: `/api/v1/auth`.

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| POST | `/auth/login` | `AuthController::login` | público | Inicia sesión con documento + contraseña. Devuelve JWT. |
| POST | `/auth/registro` | `AuthController::registro` | público | Auto-registro inicial de un usuario. |
| POST | `/auth/recuperar` | `AuthController::recuperar` | público | Inicia recuperación de contraseña (envía código al email). |
| POST | `/auth/verificar-codigo` | `AuthController::verificarCodigo` | público | Verifica código de recuperación. |
| PUT | `/auth/recuperar/{token}` | `AuthController::resetPassword` | público | Restablece contraseña con token válido. |

**Campos esperados en `/auth/login`:**
```json
{ "documento": "52987634", "password": "..." }
```

---

## 2. Consulta de Funcionario (público)

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/consulta-funcionario/{documento}` | `ConsultaFuncionarioController::consultar` | público | Consulta pública del estado de evaluación de un funcionario (sin auth). |

---

## 3. Sesión y perfil

> **Requieren JWT.** Prefijo: `/api/v1/auth`.

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| POST | `/auth/logout` | `AuthController::logout` | auth | Cierra sesión. |
| GET | `/auth/perfil` | `AuthController::perfil` | auth | Devuelve perfil del usuario autenticado. |
| PUT | `/auth/perfil` | `AuthController::actualizarPerfil` | auth | Actualiza datos personales. |
| PUT | `/auth/password` | `AuthController::cambiarPassword` | auth | Cambia la contraseña (con contraseña actual). |
| PUT | `/auth/forzar-password` | `AuthController::forzarCambioPassword` | auth | Cambio forzado en primer login. |
| PUT | `/auth/rol` | `AuthController::cambiarRol` | auth | Cambia el rol activo (usuarios multi-rol). |
| POST | `/auth/refresh` | `AuthController::refreshToken` | auth | Renueva el token JWT. |
| GET | `/auth/csrf` | `AuthController::csrfToken` | auth | Genera un token CSRF. |

---

## 4. Menú y notificaciones

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/menu` | `MenuController::obtener` | auth | Devuelve menú dinámico según rol/permisos. |
| GET | `/notificaciones` | `NotificacionController::listar` | auth | Lista notificaciones del usuario. |
| PUT | `/notificaciones/{id}/leer` | `NotificacionController::marcarLeida` | auth | Marca una notificación como leída. |

---

## 5. Dashboard

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/resumen` | `DashboardController::resumen` | auth | Resumen ejecutivo (KPIs principales). |
| GET | `/dashboard/admin-stats` | `DashboardController::adminStats` | auth | Estadísticas para admin. |
| GET | `/dashboard/periodo-activo` | `DashboardController::periodoActivo` | auth | Período actualmente activo. |
| GET | `/dashboard/actividad` | `DashboardController::actividad` | auth | Feed de actividad reciente. |

---

## 6. Parámetros del sistema

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/parametros` | `ParametroController::listar` | `parametros.listar` | Lista todos los parámetros. |
| GET | `/parametros/{clave}` | `ParametroController::verPorClave` | `parametros.listar` | Devuelve un parámetro por clave. |
| POST | `/parametros` | `ParametroController::upsert` | `parametros.editar` | Crea/actualiza un parámetro. |
| PUT | `/parametros/masivo` | `ParametroController::actualizarMasivo` | `parametros.editar` | Actualización masiva. |
| PUT | `/parametros/{id}` | `ParametroController::upsert` | `parametros.editar` | Actualiza por id. |
| DELETE | `/parametros/{id}` | `ParametroController::eliminar` | `parametros.editar` | Elimina parámetro. |

---

## 7. Usuarios

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/usuarios` | `UsuarioController::listar` | `usuarios.listar` | Lista paginada. |
| POST | `/usuarios` | `UsuarioController::crear` | `usuarios.crear` | Crea un usuario. |
| GET | `/usuarios/buscar-global` | `UsuarioController::buscarGlobal` | `usuarios.listar` | Búsqueda global (autocomplete). |
| GET | `/usuarios/{id}` | `UsuarioController::ver` | `usuarios.listar` | Detalle de un usuario. |
| PUT | `/usuarios/{id}` | `UsuarioController::actualizar` | `usuarios.editar` | Actualiza un usuario. |
| DELETE | `/usuarios/{id}` | `UsuarioController::eliminar` | `usuarios.editar` | Soft-delete. |
| PUT | `/usuarios/{id}/restablecer-password` | `UsuarioController::restablecerPassword` | `usuarios.restablecer` | Resetea password (admin). |
| PUT | `/usuarios/{id}/roles` | `UsuarioController::asignarRoles` | `usuarios.editar` | Asigna uno o varios roles. |

---

## 8. Entidades

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/entidades` | `EntidadController::listar` | `entidades.listar` | Lista entidades. |
| POST | `/entidades` | `EntidadController::crear` | `entidades.crear` | Crea entidad. |
| GET | `/entidades/{id}` | `EntidadController::ver` | `entidades.listar` | Detalle. |
| PUT | `/entidades/{id}` | `EntidadController::actualizar` | `entidades.editar` | Actualiza. |
| DELETE | `/entidades/{id}` | `EntidadController::eliminar` | `entidades.eliminar` | Soft-delete. |
| GET | `/entidades/{id}/jefes` | `EntidadController::jefes` | `entidades.listar` | Jefes de la entidad. |
| GET | `/entidades/{id}/dependencias` | `EntidadController::dependencias` | `dependencias.listar` | Dependencias de la entidad. |
| PUT | `/entidades/{id}/habilitar` | `EntidadController::habilitar` | `entidades.habilitar` | Habilita/inhabilita entidad. |

---

## 9. Dependencias

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dependencias` | `DependenciaController::listar` | `dependencias.listar` | Lista paginada. |
| POST | `/dependencias` | `DependenciaController::crear` | `dependencias.crear` | Crea dependencia. |
| GET | `/dependencias/{id}` | `DependenciaController::ver` | `dependencias.listar` | Detalle. |
| PUT | `/dependencias/{id}` | `DependenciaController::actualizar` | `dependencias.editar` | Actualiza. |
| DELETE | `/dependencias/{id}` | `DependenciaController::eliminar` | `dependencias.editar` | Soft-delete. |
| PUT | `/dependencias/{id}/estado` | `DependenciaController::cambiarEstado` | `dependencias.editar` | Cambia estado (activa/inactiva). |

> **Regla CNSC:** no se permite inactivar dependencia con usuarios activos asociados (HTTP 422).

---

## 10. Períodos

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/periodos` | `PeriodoController::listar` | `periodos.listar` | Lista períodos. |
| POST | `/periodos` | `PeriodoController::crear` | `periodos.crear` | Crea período. |
| GET | `/periodos/{id}` | `PeriodoController::ver` | `periodos.listar` | Detalle. |
| PUT | `/periodos/{id}` | `PeriodoController::actualizar` | `periodos.editar` | Actualiza. |
| GET | `/periodos/{id}/metas` | `PeriodoController::metas` | `metas.listar` | Metas del período. |
| GET | `/periodos/{id}/evaluaciones` | `PeriodoController::evaluaciones` | `evaluaciones.listar` | Evaluaciones del período. |

---

## 11. Metas

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/metas` | `MetaController::listar` | `metas.listar` | Lista metas. |
| POST | `/metas` | `MetaController::crear` | `metas.crear` | Crea meta. |
| GET | `/metas/{id}` | `MetaController::ver` | `metas.listar` | Detalle. |
| PUT | `/metas/{id}` | `MetaController::actualizar` | `metas.editar` | Actualiza. |
| GET | `/metas/{id}/evidencias` | `MetaController::evidencias` | `evidencias.listar` | Evidencias asociadas. |

---

## 12. Concertaciones

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/concertaciones` | `ConcertacionController::listar` | `concertaciones.listar` | Lista concertaciones. |
| POST | `/concertaciones` | `ConcertacionController::crear` | `concertaciones.crear` | Crea concertación. |
| GET | `/concertaciones/{id}` | `ConcertacionController::ver` | `concertaciones.listar` | Detalle. |
| PUT | `/concertaciones/{id}` | `ConcertacionController::actualizar` | `concertaciones.crear` | Actualiza. |
| PUT | `/concertaciones/{id}/fijar` | `ConcertacionController::fijarCompromisos` | `concertaciones.crear` | Fijación unilateral. |
| GET | `/concertaciones/{id}/compromisos` | `ConcertacionController::compromisos` | `compromisos.listar` | Compromisos de la concertación. |
| GET | `/concertaciones/{id}/validar-compromisos` | `CompromisoController::validarAntesDeFirmar` | `compromisos.listar` | Validación previa. |
| POST | `/concertaciones/{id}/compromisos` | `CompromisoController::crear` | `compromisos.crear` | Crea compromiso. |
| POST | `/concertaciones/{id}/compromisos-mejoramiento` | `CompromisoMejoramientoController::crear` | `mejoramiento.crear` | Crea compromiso de mejoramiento. |
| GET | `/concertaciones/{id}/compromisos-mejoramiento` | `CompromisoMejoramientoController::listar` | `mejoramiento.listar` | Lista mejoramientos. |

---

## 13. Evaluaciones

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/evaluaciones` | `EvaluacionController::listar` | `evaluaciones.listar` | Lista evaluaciones. |
| POST | `/evaluaciones` | `EvaluacionController::crear` | `evaluaciones.crear` | Crea evaluación. |
| GET | `/evaluaciones/pendientes-calificar` | `EvaluacionController::pendientesCalificar` | `evaluaciones.evaluar` | Evaluaciones pendientes del evaluador. ⚠️ **Orden importante**: esta ruta debe ir **antes** de `/evaluaciones/{id}` en el router. |
| GET | `/evaluaciones/{id}` | `EvaluacionController::ver` | `evaluaciones.listar` | Detalle. |
| PUT | `/evaluaciones/{id}` | `EvaluacionController::calificar` | `evaluaciones.evaluar` | Califica (parcial o semestral). |
| GET | `/evaluaciones/{id}/compromisos` | `EvaluacionController::compromisos` | `compromisos.listar` | Compromisos de la evaluación. |
| POST | `/evaluaciones/{id}/parcial` | `EvaluacionController::crearParcial` | `evaluaciones.crear` | Crea evaluación parcial eventual o calificación extraordinaria (Art. 6 Acuerdo 617/2018). Valida motivo obligatorio + ≤180 días. |
| PUT | `/evaluaciones/{id}/definitiva` | `EvaluacionController::calificarDefinitiva` | `evaluaciones.evaluar` | Calificación definitiva. |
| PUT | `/evaluaciones/{id}/comision` | `EvaluacionController::aprobarComision` | `evaluaciones.comision` | Aprobación por Comisión Evaluadora. |

---

## 14. Compromisos

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/compromisos` | `CompromisoController::listar` | `compromisos.listar` | Lista. |
| GET | `/compromisos/buscar-evaluado` | `CompromisoController::buscarEvaluado` | `compromisos.listar` | Búsqueda por evaluado. |
| GET | `/compromisos/competencias-comportamentales` | `CompromisoController::competenciasComportamentales` | `compromisos.listar` | Catálogo de competencias. |
| POST | `/compromisos/enviar` | `CompromisoController::enviar` | `compromisos.enviar` | Enviar al evaluado para aceptación. |
| POST | `/compromisos/funcional` | `CompromisoController::guardarFuncional` | `compromisos.crear` | Guardar funcional. |
| POST | `/compromisos/comportamental` | `CompromisoController::guardarComportamental` | `compromisos.crear` | Guardar comportamental. |
| DELETE | `/compromisos/funcional/{id}` | `CompromisoController::eliminarFuncional` | `compromisos.editar` | Eliminar funcional. |
| DELETE | `/compromisos/comportamental/{id}` | `CompromisoController::eliminarComportamental` | `compromisos.editar` | Eliminar comportamental. |
| PUT | `/compromisos/{id}/aceptar-evaluado` | `CompromisoController::aceptarEvaluado` | `compromisos.aceptar` | Aceptar (evaluado). |
| PUT | `/compromisos/{id}/rechazar-evaluado` | `CompromisoController::rechazarEvaluado` | `compromisos.aceptar` | Rechazar (evaluado). |
| PUT | `/evaluaciones/{id}/aceptar-concertacion` | `CompromisoController::aceptarConcertacionEvaluado` | `compromisos.enviar` | Aceptar concertación (evaluado). |
| PUT | `/evaluaciones/{id}/rechazar-concertacion` | `CompromisoController::rechazarConcertacionEvaluado` | `compromisos.enviar` | Rechazar concertación (evaluado). |
| GET | `/compromisos/evaluacion/{id}` | `CompromisoController::listarPorEvaluacion` | `compromisos.listar` | Lista por evaluación. |
| PUT | `/compromisos/confirmar-concertacion/{id}` | `CompromisoController::confirmarConcertacion` | `compromisos.crear` | Confirmar concertación. |
| GET | `/compromisos/pendientes` | `CompromisoController::pendientesAprobacion` | `compromisos.aprobar` | Pendientes de aprobación. |
| GET | `/compromisos/propuestos-evaluado` | `CompromisoController::propuestosPorEvaluado` | `compromisos.listar` | Propuestos por el evaluado. |
| PUT | `/compromisos/{id}/aprobar` | `CompromisoController::aprobar` | `compromisos.aprobar` | Aprobar (evaluador). |
| PUT | `/compromisos/{id}/rechazar` | `CompromisoController::rechazar` | `compromisos.aprobar` | Rechazar (evaluador). |
| PUT | `/compromisos/{id}/devolver` | `CompromisoController::devolver` | `compromisos.devolver` | Devolver con observaciones. |
| PUT | `/compromisos/{id}/calificar` | `CompromisoController::calificar` | `evaluaciones.evaluar` | Calificar compromiso. |
| GET | `/compromisos/{id}/pesos` | `CompromisoController::resumenPesos` | `compromisos.listar` | Resumen de pesos. |
| PUT | `/compromisos/{id}` | `CompromisoController::actualizar` | `compromisos.editar` | Actualizar. |

---

## 15. Compromisos de Mejoramiento

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/compromisos-mejoramiento` | `CompromisoMejoramientoController::listarGlobal` | `mejoramiento.listar` | Lista global. |
| GET | `/compromisos-mejoramiento/{id}` | `CompromisoMejoramientoController::ver` | `mejoramiento.listar` | Detalle. |
| PUT | `/compromisos-mejoramiento/{id}` | `CompromisoMejoramientoController::actualizar` | `mejoramiento.editar` | Actualizar. |
| POST | `/compromisos-mejoramiento/{id}/seguimiento` | `CompromisoMejoramientoController::seguimiento` | `mejoramiento.editar` | Registrar seguimiento. |
| PUT | `/compromisos-mejoramiento/{id}/completar` | `CompromisoMejoramientoController::completar` | `mejoramiento.editar` | Marcar completado. |

---

## 16. Evidencias

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/evidencias` | `EvidenciaController::listar` | `evidencias.listar` | Lista. |
| POST | `/evidencias` | `EvidenciaController::registrar` | `evidencias.crear` | Registrar evidencia (sistema descriptivo - sin archivos). |
| GET | `/evidencias/{id}` | `EvidenciaController::ver` | `evidencias.listar` | Detalle. |
| PUT | `/evidencias/{id}` | `EvidenciaController::actualizar` | `evidencias.editar` | Actualizar. |

> **Regla CNSC:** las evidencias son **descriptivas**, no se suben archivos. Campos: compromiso, descripción, ubicación, observación.

---

## 17. Ausentismos

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/ausentismos` | `AusentismoController::listar` | `ausentismos.listar` | Lista. |
| POST | `/ausentismos` | `AusentismoController::crear` | `ausentismos.crear` | Crear. |
| GET | `/ausentismos/{id}` | `AusentismoController::ver` | `ausentismos.listar` | Detalle. |
| PUT | `/ausentismos/{id}` | `AusentismoController::actualizar` | `ausentismos.editar` | Actualizar. |
| DELETE | `/ausentismos/{id}` | `AusentismoController::eliminar` | `ausentismos.editar` | Eliminar. |

> **Validación:** si la separación supera **30 días calendario** → genera evaluación parcial eventual.

---

## 18. Movilidades

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/movilidades` | `MovilidadController::listar` | `movilidades.listar` | Lista. |
| POST | `/movilidades` | `MovilidadController::crear` | `movilidades.crear` | Crear. |
| GET | `/movilidades/{id}` | `MovilidadController::ver` | `movilidades.listar` | Detalle. |
| PUT | `/movilidades/{id}` | `MovilidadController::actualizar` | `movilidades.editar` | Actualizar. |
| DELETE | `/movilidades/{id}` | `MovilidadController::eliminar` | `movilidades.editar` | Eliminar. |
| PUT | `/movilidades/{id}/ejecutar` | `MovilidadController::ejecutar` | `movilidades.ejecutar` | Ejecutar movimiento. |

---

## 19. Reportes

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/reportes/concertacion` | `ReporteController::concertacion` | `reportes.generar` | Reporte de concertaciones. |
| GET | `/reportes/evaluaciones` | `ReporteController::evaluaciones` | `reportes.generar` | Reporte de evaluaciones. |
| GET | `/reportes/funcionario/{id}` | `ReporteController::funcionario` | `reportes.generar` | Reporte individual. |
| GET | `/reportes/resumen` | `ReporteController::resumen` | `reportes.generar` | Resumen ejecutivo. |
| GET | `/reportes/entidad/{id}` | `ReporteController::porEntidad` | `reportes.generar` | Por entidad. |
| GET | `/reportes/dependencia/{id}` | `ReporteController::porDependencia` | `reportes.generar` | Por dependencia. |
| GET | `/reportes/compromisos` | `ReporteController::compromisos` | `reportes.generar` | Compromisos. |
| GET | `/reportes/excel/{tipo}` | `ReporteController::descargarExcel` | `reportes.generar` | Descargar Excel. |
| GET | `/reportes/concertacion-pdf/{id}` | `ReporteController::pdfConcertacion` | `reportes.generar` | PDF de concertación. |
| GET | `/reportes/evaluacion-pdf/{id}` | `ReporteController::pdfEvaluacion` | `reportes.generar` | PDF de evaluación. |

---

## 20. Carga masiva

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| POST | `/cargas/usuarios` | `CargaMasivaController::usuarios` | `cargas.ejecutar` | Carga masiva de usuarios. |
| POST | `/cargas/concertaciones` | `CargaMasivaController::concertaciones` | `cargas.ejecutar` | Carga masiva de concertaciones. |
| POST | `/cargas/evaluaciones` | `CargaMasivaController::evaluaciones` | `cargas.ejecutar` | Carga masiva de evaluaciones. |
| POST | `/cargas/cursos` | `CargaMasivaController::cursos` | `cargas.ejecutar` | Carga masiva de cursos. |
| GET | `/cargas` | `CargaMasivaController::historial` | `cargas.listar` | Historial de cargas. |
| GET | `/cargas/plantilla-usuarios` | `CargaMasivaController::plantillaUsuarios` | `cargas.ejecutar` | Plantilla Excel de usuarios. |

---

## 21. Competencias

| Método | Endpoint | Controller | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/competencias` | `CompetenciaController::listar` | `compromisos.listar` | Lista de competencias (catálogo CNSC). |
| GET | `/competencias/decretos` | `CompetenciaController::decretos` | `compromisos.listar` | Decretos que regulan las competencias. |

---

## 📊 Resumen numérico

| Módulo | Endpoints | Permisos requeridos |
|---|---:|---:|
| Auth (público) | 5 | 0 (público) |
| Auth (sesión) | 8 | auth |
| Consulta funcionario | 1 | 0 (público) |
| Menú + Notificaciones | 3 | auth |
| Dashboard | 4 | auth |
| Parámetros | 6 | `parametros.*` |
| Usuarios | 8 | `usuarios.*` |
| Entidades | 8 | `entidades.*` / `dependencias.*` |
| Dependencias | 6 | `dependencias.*` |
| Períodos | 6 | `periodos.*` |
| Metas | 5 | `metas.*` |
| Concertaciones | 10 | `concertaciones.*` / `compromisos.*` / `mejoramiento.*` |
| Evaluaciones | 9 | `evaluaciones.*` / `compromisos.*` |
| Compromisos | 21 | `compromisos.*` / `evaluaciones.evaluar` |
| Mejoramiento | 5 | `mejoramiento.*` |
| Evidencias | 4 | `evidencias.*` |
| Ausentismos | 5 | `ausentismos.*` |
| Movilidades | 6 | `movilidades.*` |
| Reportes | 10 | `reportes.generar` |
| Carga masiva | 6 | `cargas.*` |
| Competencias | 2 | `compromisos.listar` |
| **TOTAL** | **138** | — |

> **Verificación:** el conteo de 138 endpoints corresponde al commit `51c0bd6` de la rama `main`. La cantidad puede crecer al agregarse nuevos módulos.

---

## 🔒 Permisos del sistema

El sistema implementa **control de acceso basado en roles (RBAC)** con:

- **3 roles base** del sistema.
- **51 permisos** granulares.
- **84 asignaciones** rol-permisión.

Middleware de aplicación: `App\Middleware\PermissionMiddleware::check($permisoCodigo)`. Ver `backend/src/Middleware/PermissionMiddleware.php`.

---

**Versión:** 1.0.0 (2026-06-22)
