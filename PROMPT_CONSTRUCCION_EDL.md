# PROMPT MAESTRO — Construir EDL Carepa desde cero (BD + Backend + Frontend)

> **Objetivo:** Que un agente IA construya, desde un directorio vacío y SIN copiar el repositorio original, el sistema completo de Evaluación del Desempeño Laboral de la Alcaldía de Carepa (Antioquia, Colombia): base de datos, API REST y SPA React.
>
> **Instrucción de uso:** Copiar este documento completo como prompt inicial (o como especificación de referencia en la sesión). Seguir estrictamente cada sección. No inventar literales, no cambiar el stack, no agregar frameworks.

---

## 0. Rol y forma de trabajo

Eres un ingeniero de software senior full-stack. Construirás el sistema **EDL Carepa** en 3 fases en este orden:

1. **Fase 1 — Base de datos** (MariaDB/MySQL): script SQL único `database/full_dump.sql` con esquema + seeds + datos de prueba.
2. **Fase 2 — Backend** (PHP 8.2, MVC propio sin framework): API REST en `backend/`.
3. **Fase 3 — Frontend** (React 19 + TypeScript estricto + Vite + Tailwind): SPA en `frontend/`.

Reglas transversales:

- Todo archivo PHP inicia con `declare(strict_types=1);` y sigue PSR-12, con PHPDoc en métodos públicos.
- Todo el SQL usa `snake_case`, charset `utf8mb4`, collation `utf8mb4_unicode_ci`.
- Variables de dominio en español (`nombre`, `documento`, `compromisos`); clases y métodos técnicos en inglés (`UsuarioRepository::buscarPorDocumento`).
- Nunca `DELETE` físico: todas las tablas operacionales tienen `eliminado_en DATETIME NULL` (soft delete) y los repositorios SIEMPRE filtran `WHERE eliminado_en IS NULL`.
- No hay migraciones incrementales: cualquier cambio de esquema regenera `database/full_dump.sql` completo.
- Los mensajes al usuario son literales CNSC, nunca inventados (ver sección 8).
- No exponer secretos: `.env` en `.gitignore`, nunca en commits.

---

## 1. Contexto del negocio y normativa

**EDL Carepa** automatiza el ciclo anual de Evaluación del Desempeño Laboral de los servidores públicos de carrera administrativa del municipio de Carepa, conforme al **Acuerdo CNSC 617 de 2018** (Sistema Tipo de la EDL, vigente desde 01-02-2019).

Marco normativo:

- **Acuerdo 617 de 2018** + Anexo Técnico: regula el proceso completo (concertación, seguimiento, evaluación parcial, calificación definitiva).
- **Decreto 1083 de 2015**: régimen de carrera administrativa y EDL.
- **Decreto 2539 de 2005** y **Decreto 815 de 2018**: competencias comportamentales y sus conductas.
- **Resolución 1760 de 2010** (CNSC): referencias usadas en los mensajes literales del sistema.

### 1.1 Las cuatro fases del ciclo

```
Concertación (compromisos) → Seguimiento (evidencias) → Evaluaciones parciales → Calificación definitiva
```

### 1.2 Reglas de dominio núcleo (NO negociables)

**Concertación:**

- Plazo: los compromisos se concertan dentro de los **15 días hábiles** siguientes al inicio del período (o de la posesión en período de prueba).
- Si vencen los 15 días sin acuerdo: el evaluador fija unilateralmente en los **3 días hábiles** siguientes y pide firma de **testigo** de empleo igual o superior.
- Si el evaluador omite: el evaluado tiene **3 días hábiles** para remitir **propuesta propia**; sin consenso, el evaluador fija.
- El evaluado puede reclamar ante la **Comisión de Personal** en **2 días hábiles**.
- Cantidad de compromisos **funcionales**: mínimo 1, máximo 5 (período anual); mínimo 1, máximo 3 (período de prueba).
- Cantidad de compromisos **comportamentales**: mínimo 3, máximo 5 (siempre).
- Estructura de cada compromiso funcional: `verbo + objeto + condición de resultado`.
- Cada compromiso funcional lleva **peso porcentual**; la suma de pesos funcionales debe ser **100%**.
- Pesos globales: **funcionales 85%**, **comportamentales 15%** de la calificación total.
- Tipos de concertación: `concertacion_bilateral` o `fijados_evaluador` (unilateral).
- Ajuste de compromisos concertados, con motivos válidos: cambios de planes/metas, separación temporal >30 días, asignación de funciones, cambio de empleo por traslado/reubicación, decisión de la Comisión de Personal.

**Evaluación (4 tipos):**

| Tipo | Período que cubre |
|---|---|
| `parcial_eventual` | Causal del Acuerdo 617: cambio de evaluador, separación temporal >30 días, traslado, período de prueba en otro empleo, etc. Motivo obligatorio. No puede exceder 180 días. |
| `parcial_primer_semestre` | 01-02 a 31-07 del año en curso. |
| `parcial_segundo_semestre` | 01-08 a 31-01 del año siguiente (validación de fechas estricta). |
| `calificacion_extraordinaria` | Ordenada por el jefe de la entidad por desempeño deficiente (mínimo 3 meses desde la última calificación definitiva). |

**Escalas de calificación:**

- **Funcionales:** cada compromiso se califica de **1 a 100** (enteros). Nota funcional = promedio ponderado por peso de cada compromiso.
- **Comportamentales:** cada conducta se valora con frecuencia: `nunca` (4 pts), `algunas_veces` (7), `frecuentemente` (10), `siempre` (13). Niveles: bajo (4-6), aceptable (7-9), alto (10-12), muy alto (13-15).
- Por cada competencia, además se responden **2 preguntas de validación**: (1) ¿Las conductas aportaron al logro de los compromisos? (`si`/`moderadamente`/`no`); (2) ¿Superaron los compromisos? (`si`/`no` — si responde `si`, **justificación de mínimo 40 caracteres** obligatoria).
- **Calificación definitiva:** `nota_funcional × 0.85 + nota_comportamental × 0.15`, redondeada a 2 decimales.
- **Escala definitiva:** `>= 90` → **sobresaliente**; `> 65 y < 90` → **satisfactorio**; `<= 65` → **no_satisfactorio**. (Bandas internas: ALTO/MEDIO/BAJO.)
- Toda evaluación calificada debe ser **aprobada por la Comisión Evaluadora** antes de quedar en firme; si la rechaza, el evaluador la reingresa y corrige.
- El evaluado cuenta con **3 días hábiles** para manifestar disconformidad tras la calificación.

**Evidencias:** son **descriptivas** (compromiso, descripción, ubicación, observación). No se suben archivos obligatoriamente (híbrido: descripción + archivo opcional).

**Ausentismos:** si la separación supera **30 días calendario**, genera evaluación parcial eventual; solo aplica a servidores de carrera administrativa o en período de prueba (Decreto 815/2018, art. 36).

**Compromisos de mejoramiento:** para resultados no satisfactorios (o a solicitud del evaluado); tienen seguimientos y pueden completarse.

**Movilidades:** cambios de dependencia/entidad de funcionarios, con acto administrativo, estado y ejecución.

**Cambio de evaluador:** solicitudes del evaluado con motivos (retiro del empleado responsable, impedimento, recusación), decididas por el jefe de personal; historial de evaluadores por concertación.

---

## 2. Stack tecnológico (FIJO — no introducir frameworks nuevos)

| Capa | Tecnología | Versión |
|---|---|---|
| Backend | PHP (sin framework, MVC propio) | 8.2+ |
| JWT | firebase/php-jwt | 6.11 |
| Correo | phpmailer/phpmailer | 7.1 |
| PDF | dompdf/dompdf | 3.1 |
| SQL | PDO (pdo_mysql, prepared statements) | nativo |
| Frontend | React | 19.1 |
| TypeScript | strict: true | 5.8 |
| Router FE | react-router-dom | 7.6 |
| Bundler | Vite | 6.3 |
| Estilos | TailwindCSS | 3.4 |
| Toasts | sonner | 2.0 |
| BD | MariaDB | 10.6+ (también MySQL 8.0+) |

Extensiones PHP requeridas: `pdo_mysql`, `mbstring`, `gd`, `xml`, `zip`, `openssl`, `json`, `fileinfo`.

---

## 3. Fase 1 — Base de datos

Crear **un solo archivo** `database/full_dump.sql` (esquema + seeds + datos de prueba, generado como dump completo de la BD `edl_carepa`).

### 3.1 Convenciones

- Motor InnoDB, charset `utf8mb4`, collation `utf8mb4_unicode_ci`.
- Timestamps: `creado_en DATETIME NOT NULL DEFAULT current_timestamp()`, `actualizado_en ... ON UPDATE current_timestamp()`, `eliminado_en DATETIME NULL`.
- FK: `CONSTRAINT fk_<tabla_origen>_<tabla_destino> FOREIGN KEY (...) REFERENCES ...`.
- Índices: `idx_<campo>`; claves únicas `uk_<descripcion>`.
- Enums validados a nivel de aplicación Y base de datos.

### 3.2 Tablas (esquema completo)

**Núcleo:**

- `usuarios` — documento (único con tipo_documento), tipo_documento ENUM('CC','CE','PA','TI','RC','DIP','NIT'), genero, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email (único), email_confirmado, telefono1, telefono2, password_hash (bcrypt), estado ENUM('activo','inactivo','bloqueado'), intentos_fallidos, bloqueado_hasta, ultimo_acceso, entidad_id FK, dependencia_id FK, es_contratista, nivel ENUM('directivo','asesor','profesional','tecnico','asistencial','asistente'), naturaleza ENUM('carrera_administrativa','libre_nombramiento','libre_nombramiento_gerencia_publica','libre_nombramiento_remocion','periodo_fijo'), tipo_nombramiento ENUM('hecho_en_carrera','periodo_de_prueba','provisional','encargo_planta_global','encargo_planta_temporal','encargo_vacancia_definitiva','encargo_vacancia_temporal'), denominacion_empleo, codigo_empleo, grado_empleo, es_evaluador_y_evaluado, dependencia_evaluacion_id FK, en_periodo_prueba, fecha_posesion, proposito_principal_empleo, evaluacion_inicio_febrero, debe_cambiar_password, fecha_inicio_evaluacion, motivo_fecha_inicio_diferente ENUM('terminacion_periodo_prueba','terminacion_vacancia_temporal','regreso_vacaciones','regreso_incapacidad','regreso_encargo','regreso_comision_servicios','regreso_licencia','suspension_ejercicio_cargo','otro').
- `entidades` — codigo, nombre, tipo, nit, municipio, departamento, estado.
- `dependencias` — entidad_id FK, codigo, nombre, jefe_id FK (usuarios), estado.
- `periodos` — nombre, anio, fecha_inicio, fecha_fin, estado ENUM('configuracion','concertacion','seguimiento','evaluacion','calificacion','cerrado'), fecha_inicio_concertacion, fecha_fin_concertacion, fecha_inicio_seguimiento, fecha_fin_seguimiento, fecha_inicio_evaluacion, fecha_fin_evaluacion, fecha_inicio_calificacion, fecha_fin_calificacion.
- `metas` — periodo_id FK, dependencia_id FK, funcionario_id FK, evaluador_id FK, tipo, descripcion, peso, indicador, meta_numerica, unidad_medida, estado.
- `concertaciones` — periodo_id FK, evaluador_id FK, evaluado_id FK, tipo_concertacion ENUM('concertacion_bilateral','fijados_evaluador'), testigo_id FK, fecha_testigo, evaluador_no_jefe, motivo_no_jefe ENUM('retiro_empleado_responsable','impedimento','recusacion'), motivo_fijacion_unilateral ENUM('no_conformidad_evaluado','vencimiento_plazo_sin_firma','negativa_concertar','omision_evaluador','otro'), estado ENUM('pendiente','concertada','propuesta_evaluado','aprobada_evaluado','rechazada_evaluado','fijada'), observaciones, fecha_concertacion, fecha_limite_concertacion.
- `evaluaciones` — periodo_id FK, evaluado_id FK, evaluador_id FK, concertacion_id FK, tipo ENUM('parcial_primer_semestre','parcial_segundo_semestre','parcial_eventual','calificacion_extraordinaria'), motivo_parcial_eventual ENUM('cambio_evaluador','lapso_ultima_evaluacion','periodo_prueba_otro_empleo','separacion_temporal_mas_30_dias','cambio_empleo_traslado'), motivo_extraordinaria, evaluador_no_jefe, motivo_no_jefe ENUM('retiro_empleado_responsable','impedimento','recusacion'), fecha_inicio, fecha_fin, nota_funcionales DECIMAL(5,2), nota_comportamentales DECIMAL(5,2), calificacion_definitiva DECIMAL(5,2), nivel_resultado ENUM('sobresaliente','satisfactorio','no_satisfactorio'), estado ENUM('pendiente','en_proceso','calificada','aprobada_comision','rechazada_comision','cerrada','anulada'), es_comision_evaluadora, comision_evaluadora_id FK, fecha_evaluacion, fecha_calificacion, fecha_concertacion, observaciones, motivo_anulacion, cumplio_compromisos ENUM('si','moderadamente','no'), aporte_adicional ENUM('si','no'), descripcion_aporte, justificacion, creado_por. UNIQUE `(evaluado_id, periodo_id, tipo)`.
- `compromisos` — concertacion_id FK, tipo ENUM('funcional','comportamental'), meta_id FK, descripcion, peso DECIMAL(5,2), competencia_codigo FK (competencias), propuesto_por_jefe_entidad, propuesto_por_secretario_educacion, es_propuesto_evaluado, estado ENUM('propuesto','pendiente_aprobacion','aprobado','devuelto','rechazado','en_progreso','cumplido','incumplido'), calificacion DECIMAL(5,2), frecuencia ENUM('nunca','algunas_veces','frecuentemente','siempre'), nivel_comportamental ENUM('bajo','aceptable','alto','muy_alto'), puntaje_comportamental DECIMAL(5,2), impacto_aporta_compromisos ENUM('si','moderadamente','no'), impacto_excede_estipulado ENUM('si','no'), justificacion_excede, observaciones_evaluador, observaciones_evaluado, conductas_json JSON, motivo_ajuste ENUM('cambios_planes_metas','separacion_temporal_30_dias','asignacion_funciones','cambio_empleo_traslado_reubicacion','decision_comision_personal'), fecha_ajuste, resultado_esperado, medio_verificacion.
- `compromisos_mejoramiento` — concertacion_id FK, compromiso_id FK, registrado_por FK, motivo ENUM('nivel_no_satisfactorio','nivel_satisfactorio','solicitud_evaluado'), aspecto_corregir, acciones_mejoramiento, observacion.
- `compromiso_mejoramiento_seguimientos` — compromiso_mejoramiento_id FK, registrado_por FK, avance, observacion, evidencia_descripcion, evidencia_archivo, evidencia_tipo, evidencia_tamano, fecha_seguimiento.
- `evidencias` — concertacion_id FK, compromiso_id FK, periodo_id FK, registrado_por FK, compromiso_competencia, descripcion, ubicacion, archivo_nombre, archivo_mime, archivo_path, archivo_tamano, download_token, download_token_expires, observacion, tipo.
- `ausentismos` — funcionario_id FK, motivo ENUM('incapacidad','comision','encargo','suspension','licencias','vacaciones','otro'), fecha_inicio, fecha_fin, dias, observaciones, estado.
- `movilidades` — funcionario_id FK, tipo, entidad_origen_id, dependencia_origen_id, entidad_destino_id, dependencia_destino_id, fecha_movimiento, acto_administrativo, observaciones, estado.
- `notificaciones` — usuario_id FK, titulo, mensaje, tipo, evaluacion_id, leida.
- `solicitudes_cambio_evaluador` — evaluado_id FK, evaluador_actual_id FK, evaluador_sugerido_id FK, motivo, descripcion, estado, nuevo_evaluador_id, decision_comentario, decidido_por.
- `historial_evaluadores` — concertacion_id FK, evaluador_anterior_id FK, evaluador_nuevo_id FK, motivo, solicitud_id.
- `parametros` — clave (única), valor, tipo, descripcion.
- `encargos` — dependencia_a, responsable_a, responsable_e, fecha_inicio, fecha_salida, id_decreto, fecha_creacion, hora.

**Catálogos CNSC:**

- `competencias` — codigo (PK, ej. 'competencias_...'), nombre, descripcion, decreto ENUM('2539','815'). Seed con las competencias comunes: Aprendizaje continuo, Orientación a resultados, Orientación al usuario y al ciudadano, Compromiso con la organización, Trabajo en equipo, Adaptación al cambio; y específicas por nivel (Directivo: Visión estratégica, Liderazgo efectivo, Planeación, Toma de decisiones, Gestión del desarrollo de las personas, Pensamiento sistémico, Resolución de conflictos; Profesional: Aporte técnico-profesional, Comunicación efectiva, Gestión de procedimientos, Instrumentación de decisiones; Técnico: Confiabilidad técnica, Disciplina, Responsabilidad; Asistencial: Manejo de la información, Relaciones interpersonales, Colaboración).
- `conductas` — competencia_codigo FK, texto, orden, activo. Seed con las conductas de cada competencia según Decreto 2539/2005 y 815/2018.
- `niveles_jerarquicos` — codigo (PK, sin tildes: `directivo`, `asesor`, `profesional`, `tecnico`, `asistencial`, `asistente`), nombre, descripcion, orden.
- `naturalezas_cargo` — codigo, nombre, descripcion, requiere_periodo, es_carrera.

**RBAC:**

- `roles` — codigo (único), nombre, descripcion. Seed: `evaluador`, `evaluado`, `admin_carepa`, `jefe_dependencia`, `cargador`.
- `permisos` — codigo (único), nombre, modulo, descripcion. Seed con **51 permisos granulares** (nombres tipo `entidades.listar`, `entidades.crear`, `entidades.editar`, `entidades.eliminar`, `dependencias.listar|crear|editar`, `usuarios.listar|crear|editar|cargar`, `periodos.listar|crear|editar`, `metas.listar|crear|editar`, `concertaciones.listar|crear|cargar`, `evaluaciones.listar|crear|evaluar`, `compromisos.listar|crear|editar|enviar|aprobar|aceptar|devolver`, `mejoramiento.listar|crear|editar`, `evidencias.listar|crear|editar|verificar`, `ausentismos.listar|crear|editar`, `movilidades.listar|crear|editar|ejecutar`, `reportes.generar`, `cargas.listar|ejecutar`, `parametros.listar|editar`, `auditoria.ver`, `jefe_personal.solicitudes`, `cargos_manual.ver|asignar`, `catalogos.nbc.ver`, `dashboard.ver`, etc.). `admin_carepa` recibe TODOS los permisos.
- `rol_permiso` — rol_id FK, permiso_id FK, creado_en.
- `usuario_rol` — usuario_id FK, rol_id FK, entidad_id FK, creado_en. PK compuesta (usuario_id, rol_id).

**Seguridad y sesión:**

- `sesiones` — usuario_id FK, token_hash (sha256 del JWT, único), ip_address, user_agent, fecha_expiracion, revocada.
- `csrf_tokens` — token, expiracion, utilizado, creado_en, utilizado_en.
- `rate_limits` — bucket_key, count, reset_at, creado_en, actualizado_en.
- `recuperaciones` — usuario_id FK, token, fecha_expiracion, utilizado, creado_en.

**Auditoría:**

- `auditoria` — usuario_id, accion (login, logout, crear, actualizar, eliminar, cambiar_rol...), entidad, registro_id, datos_anteriores JSON, datos_nuevos JSON, ip_address, user_agent, creado_en. Toda operación CUD registra antes/después.

**Manual de Funciones (módulo de cargos):**

- `catalogo_naturaleza_cargo` — id, nombre, etiqueta.
- `clases_empleo` — id (CLS-001...CLS-118), codigo, grado, denominacion, nivel, requisitos_estudio, requisitos_experiencia, nivel_educativo_minimo ENUM('bachiller','tecnico','tecnologico','profesional','especializacion'), horas_curso_minimo, anios_experiencia DECIMAL(4,2), tipo_experiencia ENUM('ninguna','relacionada','profesional','docente').
- `catalogo_conocimientos_basicos` — id (CON-001...CON-213), nombre.
- `clases_empleo_conocimientos` — clase_empleo_id, conocimiento_id, orden (N:N).
- `cargos` — id (GLO-XXX/TEM-XXX), clase_empleo_id FK, dependencia_id FK (dependencias existente), naturaleza_cargo_id FK, planta ENUM('global','temporal'), codigo, grado, denominacion, nivel, cargo_jefe_inmediato, no_cargos.
- `cargo_funciones_esenciales` — cargo_id FK, texto, orden.
- `cargo_contribuciones_individuales` — cargo_id FK, texto, orden.
- `competencias_comunes` — id (COM-01...COM-06), nombre.
- `competencias_comportamentales` — nivel FK (niveles_jerarquicos.codigo), nombre, orden.
- `cargos_manual` — planta, dependencia_id FK, nivel, codigo, grado, denominacion, num_cargos, naturaleza, jefe_inmediato, proposito_principal, fuente.
- `cargos_manual_detalle` — cargo_manual_id FK, seccion, contenido, orden.
- `cargos_manual_requisitos` — cargo_manual_id FK, nivel_educativo, nbc_id, titulo_requerido, tarjeta_profesional, experiencia_meses, experiencia_tipo.
- `usuario_cargo_manual` — usuario_id FK, cargo_manual_id FK, fecha_asignacion, vigente, asignado_por, observaciones.
- `nucleos_basicos_conocimiento` — area_conocimiento, nbc, descripcion.

**Importación heredada / carga masiva:**

- `cargas_masivas` — usuario_id FK, tipo, nombre_archivo, ruta_archivo, registros_total, registros_exitosos, registros_fallidos, estado, resultado_detalle.
- `funcionarios`, `ext_dependencias`, `responsables`, `tbl_cargo`, `tbl_detalle_cargo` (tablas heredadas de un sistema anterior, usadas por migraciones; conservarlas para compatibilidad).

### 3.3 Seeds obligatorios

1. **Roles** (5): evaluador, evaluado, admin_carepa, jefe_dependencia, cargador.
2. **Permisos** (51) + **rol_permiso** (84 asignaciones): evaluador con permisos de concertar, evaluar, aprobar, evidencias, mejoramiento, compromisos; evaluado con permisos de consulta, proponer, aceptar/rechazar, evidencias propias; admin_carepa con todo; jefe_dependencia con gestión de usuarios de su dependencia; cargador con carga masiva.
3. **Usuarios de prueba** (contraseña de todos: `12345678`, hash bcrypt `$2y$12$...`):

| Documento | Nombre | Roles |
|---|---|---|
| `admin` | Admin Principal | `admin_carepa` |
| `43141896` | LUSELY OREJUELA | `evaluador`, `jefe_dependencia` |
| `1040353165` | YEISON ROMANA | `evaluado`, `admin_carepa` |

   Más 200+ usuarios de ejemplo distribuidos en dependencias, con email, cargo, nivel, naturaleza, tipo de nombramiento.
4. **Parámetros del sistema** en `parametros`: `PESO_FUNCIONALES` (85), `PESO_COMPORTAMENTALES` (15), umbrales (90 / 65), longitudes mínimas, etc.
5. **Compromisos/competencias/conductas** del catálogo CNSC (sección 1.2).
6. Al menos 1 entidad (Alcaldía de Carepa), 10-12 dependencias realistas (Despacho del Alcalde, Secretaría de Gobierno, Secretaría de Hacienda, Secretaría de Educación, Secretaría de Salud, Oficina de Control Interno, etc.), 1 período con etapas, metas de ejemplo, y un set mínimo de concertaciones/evaluaciones/compromisos/evidencias para que las pruebas de flujo funcionen.

---

## 4. Fase 2 — Backend PHP (MVC propio)

### 4.1 Estructura de carpetas

```
backend/
├── public/
│   ├── index.php          # Entry point único: bootstrap + registro de rutas + dispatch
│   ├── router.php         # Router para el servidor embebido (php -S)
│   └── escudo.png         # Escudo institucional (se embebe en PDFs)
├── src/
│   ├── Config/            # Database.php (PDO singleton), Env.php
│   ├── Controller/        # 1 controller por módulo (~21)
│   ├── Service/           # Lógica de negocio (~17-21)
│   ├── Repository/        # Acceso SQL (~18-19, todos heredan BaseRepository)
│   ├── Model/             # Modelos de dominio (opcionales; ~15)
│   ├── Helper/            # Jwt, Pdf, Mail, Csrf, Response, Sanitizer, Validator, Upload, Ip, MensajesCNSC, HttpException
│   ├── Middleware/        # Cors, SecurityHeaders, RateLimit, Auth, Permission, Csrf, Tenant
│   └── Router/            # Router.php (dispatcher regex secuencial)
├── uploads/               # Archivos subidos
├── storage/               # Sesiones/cache locales
├── var/                   # Logs y temporales
├── .env.example
└── composer.json          # PSR-4: App\ -> src/, firebase/php-jwt, phpmailer, dompdf
```

### 4.2 Entry point (`public/index.php`)

- `set_exception_handler`, `set_error_handler`, `register_shutdown_function`: NINGÚN error 500 muestra trazas/SQL/rutas al usuario; siempre responde `{"code":"02","message":"Error interno del servidor. Contacte al administrador.","data":null}` y registra el detalle en `error_log`.
- Cargar `Env` y definir timezone `APP_TIMEZONE` (America/Bogota).
- Instanciar `Database` (falla de BD durante bootstrap → respuesta institucional 500).
- `CorsMiddleware::handle()` antes del dispatch; OPTIONS responde sin pasar.
- **SPA fallback**: si la URI no empieza con `/api`, servir `frontend/dist/index.html` si existe.
- Registrar ~140 rutas bajo el grupo `/api/v1` (orden de declaración CRÍTICO: rutas fijas antes que paramétricas).
- Grupo externo con middleware: `[CorsMiddleware::class, SecurityHeadersMiddleware::class, RateLimitMiddleware::class]`; grupo interno (autenticado): `[AuthMiddleware::class, CsrfMiddleware::class]`.
- Permiso por ruta: opción `['permiso:<codigo>']`.

### 4.3 Router (`Router.php`)

- Registro por método: `get/post/put/delete($path, [Controller::class, 'metodo'], [middleware/permisos])`.
- `group($prefix, $callback, $middleware)` apila prefijos y middlewares.
- Patrón regex por ruta: `#^/api/v1/...$#` con grupos nombrados `(?P<id>[^/]+)`; dispatch **secuencial** (primera coincidencia gana).
- Middleware en cadena: strings `'permiso:xxx'` → `PermissionMiddleware::check('xxx')`; clases → `$mw::handle()`.
- **Auto-cast de parámetros**: los valores del regex son strings; al invocar el método del controller, usar reflexión para castear a la firma (`int`, `float`, `bool`), para no romper con `strict_types=1`.
- Errores: `HttpException` → `ResponseHelper::error($e->getMessage(), $e->getCode())`; `\Throwable` → log + 500 genérico (detalle solo si `APP_DEBUG=true`).
- 404: `Ruta no encontrada: METHOD /uri...`.

### 4.4 Cadena de middlewares (orden estricto)

```
Cors → SecurityHeaders → RateLimit → Auth → Permission → Csrf (mutaciones) → Tenant
```

| Middleware | Comportamiento |
|---|---|
| `Cors` | Headers CORS según `CORS_ORIGIN`; preflight OPTIONS responde 204. |
| `SecurityHeaders` | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. |
| `RateLimit` | Por IP (`IpHelper`), tabla `rate_limits`; límites configurados por bucket (ej. auth: 5/min, general: 120/min); 429 al exceder. |
| `Auth` | Extrae token de `Authorization: Bearer` **o** de `?token=` (query param, usado por descargas). Valida JWT (`JwtHelper::validate`), verifica la sesión activa en `sesiones` por hash sha256 del token (no revocada, no expirada). Expone `AuthMiddleware::$user` = {id, documento, roles, entidad_id, dependencia_id, rol_activo}. |
| `Permission` | `check($permisoCodigo)`: valida `rol_activo` del JWT (NO la lista completa de roles) contra `rol_permiso` + `permisos`. 403 si no tiene. |
| `Csrf` | Solo mutaciones (POST/PUT/DELETE, excepto rutas públicas de auth y `PUT /evaluaciones/{id}/calificacion-manual`). Valida `X-CSRF-Token` contra `csrf_tokens`; falla → 419 `Token CSRF invalido o expirado`. |
| `Tenant` | Filtro multientidad por `entidad_id` (hoy Carepa = 1; infraestructura lista). |

### 4.5 Formato de respuesta y códigos (ResponseHelper)

```json
{ "code": "01", "message": "...", "data": {} }
```

| Código | HTTP | Significado |
|---|---|---|
| `01` | 200/201 | OK |
| `02` | 500 | Error general del servidor |
| `42` | 422 | Error de validación (mensaje + `data` con detalles) |
| `43` | 401 | No autorizado |
| `44` | 403 | Prohibido (permiso denegado) |
| `45` | 404 | No encontrado |
| `419` | 419 | CSRF inválido/expirado |

Helpers: `success(data, message, httpCode)`, `error(message, httpCode, data)`, `serverError()`, `validationError(array)`, `notFound()`, `unauthorized()`, `forbidden()`, `paginated(items, total, page, perPage)` → `{items, total, page, per_page, total_pages}`.

### 4.6 JWT (`JwtHelper`)

- HS256, secreto `JWT_SECRET` (mínimo 32 chars) desde `.env`.
- Expiración `JWT_EXPIRACION_MINUTOS` (default 120 min).
- Payload: `{iat, exp, sub (user id), documento, roles[], entidad_id, dependencia_id, rol_activo}`.
- `rol_activo` viaja en el token y es la fuente de verdad para permisos y menú.

### 4.7 Patrón Controller → Service → Repository (con ejemplos)

```php
// Controller (validación de input, sanitización, delegar; NUNCA tocar BD)
class AusentismoController {
    public function listar(): void {
        $filtros = SanitizerHelper::sanitizeArray($_GET);
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        ResponseHelper::success($this->service->listar($filtros, $pagina, $porPagina));
    }
    public function crear(): void {
        $input = SanitizerHelper::sanitizeArray(json_decode(file_get_contents('php://input'), true) ?: []);
        ResponseHelper::success(['id' => $this->service->crear($input)], 'Ausentismo registrado', 201);
    }
}

// Service (reglas de negocio, permisos de datos por rol, auditoría)
class AusentismoService {
    public function crear(array $datos): int {
        // validar requeridos, motivos válidos, regla >30 días (solo carrera/período de prueba)
        // $id = $this->repo->crear($datos);
        // AuditoriaService::registrar('crear', 'ausentismos', $id, null, $datos);
    }
}

// Repository (solo SQL preparado; SIEMPRE filtrar eliminado_en IS NULL)
class AusentismoRepository extends BaseRepository {
    protected string $table = 'ausentismos';
    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array { /* COUNT + SELECT con JOIN, LIMIT ? OFFSET ? */ }
}
```

`BaseRepository` provee: `listar($filtros, $pagina, $porPagina, $orden, $direccion)` (LIKE por campo, paginación), `buscarPorId`, `crear` (retorna lastInsertId), `actualizar`, `eliminar` (soft: `SET eliminado_en = NOW()`), `buscarPorCampo`, `existe`, `getPdo`. Guardar campos sensibles (`id`, `eliminado_en`, `creado_en`, `actualizado_en`).

`Database` (singleton PDO): `PDO::ATTR_ERRMODE => EXCEPTION`, `ATTR_DEFAULT_FETCH_MODE => ASSOC`, `ATTR_EMULATE_PREPARES => false`, `MYSQL_ATTR_FOUND_ROWS => true` (resolver la constante de forma compatible PHP 8.2→8.5: `\Pdo\Mysql::ATTR_FOUND_ROWS` o `PDO::MYSQL_ATTR_FOUND_ROWS`). Soporte de socket (`DB_SOCKET`) y puerto. `Database::transaction(callable)` para operaciones atómicas. **Nota crítica:** PDO retorna columnas DECIMAL como strings — todo cálculo debe convertir a float antes de operar.

`AuditoriaService::registrar($accion, $entidad, $registroId, $datosAnteriores, $datosNuevos)` en cada creación/actualización/eliminación.

### 4.8 Helpers

- `SanitizerHelper` — sanitizar strings y arrays recursivamente.
- `ValidatorHelper` — reglas `required`, longitudes, formatos; error 422 con detalles.
- `MailHelper` — PHPMailer SMTP; si `MAIL_USER`/`MAIL_PASS` vacíos → retorna `false` sin excepción (dev sin SMTP).
- `UploadHelper` — subida de archivos (evidencias opcionales) con validación de MIME y tamaño.
- `IpHelper` — IP del cliente para rate limit y auditoría.
- `HttpException` — excepción con código HTTP.
- `MensajesCNSC` — literales (sección 8).
- `PdfHelper` — DOMpdf; embeber `escudo.png` en base64 dentro del HTML; pre-calcular TODAS las expresiones PHP ANTES del heredoc e interpolar solo `{$variables}`; NO usar `position: fixed` para headers/footers (header inline al inicio, footer inline al final).

### 4.9 API REST — lista completa de endpoints

Prefijo común `/api/v1`. Públicos: login, registro, recuperar, recuperar-por-documento, verificar-codigo, reset password (`PUT /auth/recuperar/{token}`), `GET /consulta-funcionario/{documento}`. El resto requiere JWT; mutaciones requieren además `X-CSRF-Token`.

```
POST   /auth/login                              [público]
POST   /auth/registro                           [público]
POST   /auth/recuperar                          [público]
POST   /auth/recuperar-por-documento            [público]
POST   /auth/verificar-codigo                   [público]
PUT    /auth/recuperar/{token}                  [público]
POST   /auth/refresh
GET    /consulta-funcionario/{documento}        [público]
POST   /auth/logout
GET    /auth/perfil
PUT    /auth/perfil
PUT    /auth/password
PUT    /auth/forzar-password
PUT    /auth/rol
GET    /auth/csrf
GET    /menu
GET    /notificaciones
PUT    /notificaciones/{id}/leer
GET    /dashboard/resumen
GET    /dashboard/admin-stats
GET    /dashboard/periodo-activo
GET    /dashboard/actividad
GET    /dashboard/evaluado
GET    /parametros                              [parametros.listar]
GET    /parametros/{clave}                      [parametros.listar]
POST   /parametros                              [parametros.editar]
PUT    /parametros/masivo                       [parametros.editar]
PUT    /parametros/{id}                         [parametros.editar]
DELETE /parametros/{id}                         [parametros.editar]
GET    /usuarios                                [usuarios.listar]
POST   /usuarios                                [usuarios.crear]
GET    /usuarios/buscar-global                  [usuarios.listar]
GET    /usuarios/evaluadores-por-dependencia    [compromisos.listar]
GET    /usuarios/evaluadores-buscar             [compromisos.listar]
GET    /usuarios/jefe-dependencia               [compromisos.listar]
GET    /usuarios/{id}/cargo-manual              [cargos_manual.ver]        (antes de /usuarios/{id})
POST   /usuarios/{id}/cargo-manual              [cargos_manual.asignar]
GET    /cargos-manual                           [cargos_manual.ver]
GET    /cargos-manual/conteos                   [cargos_manual.ver]        (antes de /cargos-manual/{id})
GET    /cargos-manual/catalogos                 []
GET    /catalogos/niveles                       [cargos_manual.ver]
GET    /catalogos/naturalezas                   [cargos_manual.ver]
GET    /catalogos/nbc                           [catalogos.nbc.ver]
GET    /cargos-manual/{id}/pdf                  [cargos_manual.ver]
GET    /cargos-manual/{id}                      [cargos_manual.ver]
GET    /usuarios/{id}                           [usuarios.listar]
PUT    /usuarios/{id}                           [usuarios.editar]
DELETE /usuarios/{id}                           [usuarios.editar]
PUT    /usuarios/{id}/restablecer-password      [usuarios.restablecer]
PUT    /usuarios/{id}/roles                     [usuarios.editar]
GET    /entidades                               [entidades.listar]
POST   /entidades                               [entidades.crear]
POST   /entidades/con-jefe-personal             [entidades.crear]
GET    /entidades/{id}                          [entidades.listar]
PUT    /entidades/{id}                          [entidades.editar]
DELETE /entidades/{id}                          [entidades.eliminar]
GET    /entidades/{id}/jefes                    [entidades.listar]
GET    /entidades/{id}/dependencias             [dependencias.listar]
PUT    /entidades/{id}/habilitar                [entidades.habilitar]
GET    /dependencias                            [dependencias.listar]
POST   /dependencias                            [dependencias.crear]
GET    /dependencias/{id}                       [dependencias.listar]
PUT    /dependencias/{id}                       [dependencias.editar]
DELETE /dependencias/{id}                       [dependencias.editar]
PUT    /dependencias/{id}/estado                [dependencias.editar]
GET    /periodos                                [periodos.listar]
POST   /periodos                                [periodos.crear]
GET    /periodos/{id}                           [periodos.listar]
PUT    /periodos/{id}                           [periodos.editar]
GET    /periodos/{id}/metas                     [metas.listar]
GET    /periodos/{id}/evaluaciones              [evaluaciones.listar]
GET    /metas                                   [metas.listar]
POST   /metas                                   [metas.crear]
GET    /metas/{id}                              [metas.listar]
PUT    /metas/{id}                              [metas.editar]
DELETE /metas/{id}                              [metas.editar]
GET    /metas/{id}/evidencias                   [evidencias.listar]
GET    /concertaciones                          [concertaciones.listar]
POST   /concertaciones                          [concertaciones.crear]
GET    /concertaciones/pendientes-aprobacion    [compromisos.aprobar]      (antes de /concertaciones/{id})
PUT    /concertaciones/{id}/aprobar-pendientes  [compromisos.aprobar]
PUT    /concertaciones/{id}/rechazar-pendientes [compromisos.aprobar]
GET    /concertaciones/{id}                     [concertaciones.listar]
PUT    /concertaciones/{id}                     [concertaciones.crear]
PUT    /concertaciones/{id}/fijar               [concertaciones.crear]
GET    /concertaciones/{id}/compromisos         [compromisos.listar]
GET    /concertaciones/{id}/verificar-fijacion  [compromisos.listar]
PUT    /concertaciones/{id}/fijar-unilateral    [concertaciones.crear]
GET    /concertaciones/{id}/validar-compromisos [compromisos.listar]
POST   /concertaciones/{id}/compromisos         [compromisos.crear]
POST   /concertaciones/{id}/compromisos-mejoramiento  [mejoramiento.crear]
GET    /concertaciones/{id}/compromisos-mejoramiento  [mejoramiento.listar]
POST   /concertaciones/{id}/compromisos-comportamentales/validar  [compromisos.listar]
GET    /evaluaciones                            [evaluaciones.listar]
POST   /evaluaciones                            [evaluaciones.crear]
POST   /evaluaciones/iniciar                    [compromisos.enviar]
GET    /evaluaciones/pendientes-calificar       [evaluaciones.evaluar]     (antes de /evaluaciones/{id})
GET    /evaluaciones/buscar-evaluado            [evaluaciones.evaluar]
GET    /evaluaciones/mias                       [evaluaciones.listar]
GET    /evaluaciones/mias/historial             [evaluaciones.listar]
GET    /evaluaciones/evaluador/evaluados        [evaluaciones.evaluar]
GET    /evaluaciones/evaluado/{id}/previas      [evaluaciones.listar]
GET    /evaluaciones/evaluado/{id}/primer-semestre-existe  [evaluaciones.evaluar]
GET    /evaluaciones/{id}                       [evaluaciones.listar]
GET    /evaluaciones/{id}/evaluaciones-previas  [evaluaciones.listar]
POST   /evaluaciones/{id}/parcial               [evaluaciones.crear]
PUT    /evaluaciones/{id}                       [evaluaciones.evaluar]
GET    /evaluaciones/{id}/compromisos           [compromisos.listar]
PUT    /evaluaciones/{id}/definitiva            [evaluaciones.evaluar]
PUT    /evaluaciones/{id}/comision              [evaluaciones.comision]
PUT    /evaluaciones/{id}/guardar               [evaluaciones.evaluar]
PUT    /evaluaciones/{id}/solicitar-revision    [evaluaciones.evaluar]
PUT    /evaluaciones/{id}/finalizar             [evaluaciones.evaluar]
PUT    /evaluaciones/{id}/anular                [evaluaciones.evaluar]
PUT    /evaluaciones/{id}/calificacion-manual   [evaluaciones.evaluar]
GET    /compromisos                             [compromisos.listar]
GET    /compromisos/buscar-evaluado             [compromisos.listar]
GET    /compromisos/competencias-comportamentales [compromisos.listar]
POST   /compromisos/enviar                      [compromisos.enviar]
POST   /compromisos/funcional                   [compromisos.crear]
DELETE /compromisos/funcional/{id}              [compromisos.editar]
PUT    /compromisos/{id}/aceptar-evaluado       [compromisos.aceptar]
PUT    /compromisos/{id}/rechazar-evaluado      [compromisos.aceptar]
PUT    /evaluaciones/{id}/aceptar-concertacion  [compromisos.enviar]
PUT    /evaluaciones/{id}/rechazar-concertacion [compromisos.enviar]
GET    /compromisos/evaluacion/{id}             [compromisos.listar]
PUT    /compromisos/confirmar-concertacion/{id} [compromisos.crear]
GET    /compromisos/pendientes                  [compromisos.aprobar]
GET    /compromisos/propuestos-evaluado         [compromisos.listar]
GET    /compromisos/mis-compromisos             [compromisos.listar]
PUT    /compromisos/{id}/aprobar                [compromisos.aprobar]
PUT    /compromisos/{id}/rechazar               [compromisos.aprobar]
PUT    /compromisos/{id}/devolver               [compromisos.devolver]
PUT    /compromisos/{id}/calificar              [evaluaciones.evaluar]
GET    /compromisos/{id}/pesos                  [compromisos.listar]
PUT    /compromisos/{id}                        [compromisos.editar]
GET    /compromisos-mejoramiento                [mejoramiento.listar]
GET    /compromisos-mejoramiento/{id}           [mejoramiento.listar]
PUT    /compromisos-mejoramiento/{id}           [mejoramiento.editar]
POST   /compromisos-mejoramiento/{id}/seguimiento [mejoramiento.editar]
PUT    /compromisos-mejoramiento/{id}/completar [mejoramiento.editar]
GET    /compromisos-comportamentales            [compromisos.listar]
POST   /compromisos-comportamentales            [compromisos.crear]
POST   /compromisos-comportamentales/enviar     [compromisos.enviar]
GET    /compromisos-comportamentales/competencias [compromisos.listar]
GET    /compromisos-comportamentales/pendientes [compromisos.aprobar]
POST   /compromisos-comportamentales/guardar    [compromisos.crear]
GET    /compromisos-comportamentales/evaluacion/{id} [compromisos.listar]
GET    /compromisos-comportamentales/{id}       [compromisos.listar]
PUT    /compromisos-comportamentales/{id}       [compromisos.editar]
DELETE /compromisos-comportamentales/{id}       [compromisos.editar]
PUT    /compromisos-comportamentales/{id}/aprobar  [compromisos.aprobar]
PUT    /compromisos-comportamentales/{id}/rechazar [compromisos.aprobar]
PUT    /compromisos-comportamentales/{id}/devolver [compromisos.devolver]
PUT    /compromisos-comportamentales/{id}/calificar [evaluaciones.evaluar]
GET    /compromisos-comportamentales/{id}/pesos [compromisos.listar]
GET    /evidencias                              [evidencias.listar]
POST   /evidencias                              [evidencias.crear]
GET    /evidencias/plantilla-carga              [evidencias.crear]
POST   /evidencias/carga-masiva                 [evidencias.crear]
GET    /evidencias/{id}/download-url            [evidencias.listar]
GET    /evidencias/archivo/{id}                 (auth, sin permiso; descarga con ?token=)
GET    /evidencias/compromisos-evaluado         [evidencias.listar]
GET    /evaluadores/mis-evaluados               [evidencias.listar]
GET    /evidencias/{id}                         [evidencias.listar]
PUT    /evidencias/{id}                         [evidencias.editar]
DELETE /evidencias/{id}                         [evidencias.editar]
GET    /ausentismos                             [ausentismos.listar]
POST   /ausentismos                             [ausentismos.crear]
GET    /ausentismos/{id}                        [ausentismos.listar]
PUT    /ausentismos/{id}                        [ausentismos.editar]
DELETE /ausentismos/{id}                        [ausentismos.editar]
GET    /movilidades                             [movilidades.listar]
POST   /movilidades                             [movilidades.crear]
GET    /movilidades/{id}                        [movilidades.listar]
PUT    /movilidades/{id}                        [movilidades.editar]
DELETE /movilidades/{id}                        [movilidades.editar]
PUT    /movilidades/{id}/ejecutar               [movilidades.ejecutar]
POST   /solicitudes-cambio                      [compromisos.enviar]
GET    /solicitudes-cambio/mis-solicitudes      [compromisos.listar]
GET    /solicitudes-cambio/pendientes-jefe      [jefe_personal.solicitudes]
PUT    /solicitudes-cambio/{id}/decidir         [jefe_personal.solicitudes]
GET    /reportes/concertacion                   [reportes.generar]
GET    /reportes/evaluaciones                   [reportes.generar]
GET    /reportes/funcionario/{id}               [reportes.generar]
GET    /reportes/resumen                        [reportes.generar]
GET    /reportes/entidad/{id}                   [reportes.generar]
GET    /reportes/dependencia/{id}               [reportes.generar]
GET    /reportes/compromisos                    [reportes.generar]
GET    /reportes/concertaciones-aprobadas       [reportes.generar]
GET    /reportes/tipo/{tipo}                    [reportes.generar]
GET    /reportes/excel/concertaciones-aprobadas [reportes.generar]
GET    /reportes/excel/{tipo}                   [reportes.generar]
GET    /reportes/concertacion-pdf/{id}          [evaluaciones.listar]
GET    /reportes/evaluacion-pdf/{id}            [evaluaciones.listar]
GET    /competencias                            [compromisos.listar]
GET    /competencias/decretos                   [compromisos.listar]
GET    /competencias/comunes                    [compromisos.listar]
GET    /competencias/por-nivel                  [compromisos.listar]
GET    /niveles-jerarquicos                     [compromisos.listar]
```

### 4.10 Reglas de negocio que deben vivir en los Services (resumen ejecutable)

1. **Auth**: login con bloqueo tras 5 intentos fallidos (`INTENTOS_LOGIN_MAXIMOS`), estado `bloqueado` + `bloqueado_hasta`; si `debe_cambiar_password` → forzar cambio en primer login; recuperación por código de 6 dígitos por correo (tabla `recuperaciones`); login crea sesión en `sesiones`; logout revoca; refresh rota token; `cambiarRol` regenere el JWT con el nuevo `rol_activo` y devuelva también un CSRF fresco.
2. **Concertación**: al crear, calcular `fecha_limite_concertacion` (15 días hábiles desde inicio del período o posesión); validar rangos de compromisos por tipo de período; validar suma de pesos funcionales = 100; fijación unilateral con testigo y motivo; flujo de estados `pendiente → concertada → propuesta_evaluado → aprobada_evaluado / rechazada_evaluado → fijada`; `pendientesAprobacion` lista concertaciones que requieren aprobación.
3. **Compromisos**: guardar funcionales (con meta, peso, descripción) y comportamentales (con competencia_codigo y conductas JSON); estados `propuesto → pendiente_aprobacion → aprobado / devuelto / rechazado`; enviar al evaluado; aceptar/rechazar por evaluado; aprobar/rechazar/devolver por evaluador; `resumenPesos` por compromiso.
4. **Evaluación**: crear según tipo con validaciones de fechas (2.º semestre: inicio >= 01-08 del año del período y fin <= 31-01 del año siguiente; parcial eventual: motivo obligatorio y ≤ 180 días); `existeEvaluacionPrimerSemestre` habilita la del 2.º; guardar borrador (`estado en_proceso`); calificar compromisos (funcional 1-100, comportamental con frecuencia→puntaje 4/7/10/13 y preguntas de validación + justificación ≥40 caracteres si `aporte_adicional=si`... ver nota: justificación exigida cuando la respuesta a "superación" es afirmativa); `calificarDefinitiva` aplica 85/15, escala ≥90 sobresaliente / >65 satisfactorio / ≤65 no satisfactorio, setea `nivel_resultado`, `fecha_calificacion`; comisión aprueba/rechaza; anular con motivo; `finalizar`; `calificacion-manual` (excepción CSRF).
5. **Mejoramiento**: crear con motivo; seguimientos con avance; completar.
6. **Evidencias**: descriptivas; descarga con token firmado (`?token=` JWT); carga masiva con plantilla CSV/Excel.
7. **Ausentismos**: regla >30 días (solo carrera/período de prueba → 422 si no) y dispara evaluación parcial eventual.
8. **Movilidades**: CRUD + `ejecutar` que aplica el cambio de dependencia al usuario.
9. **Cambio de evaluador**: solicitud del evaluado, decisión del jefe de personal, registro en `historial_evaluadores`, actualización del `evaluador_id` en la concertación/evaluación.
10. **Reportes**: agregados por concertación, evaluaciones, funcionario, entidad, dependencia; Excel (concertaciones aprobadas y por tipo); PDF de concertación y de evaluación incluyendo las conductas de cada compromiso (JOIN a `conductas` por `competencia_codigo`).
11. **Dashboard**: resumen por rol (KPIs evaluador: pendientes de calificar, concertaciones; admin: usuarios, dependencias, periodos; evaluado: mis evaluaciones, estado).
12. **Menú**: dinámico por `rol_activo` (Inicio siempre; evaluador: Compromisos y Competencias, Evidencias, Mejoramiento, Evaluar, Evaluaciones, Reportes, Perfil; evaluado: Compromisos y Competencias (ver/mis), Evidencias propias, Evaluaciones mías; jefe_dependencia: Períodos, Metas, Usuarios, Ausentismos, Evaluaciones y Calificación, Solicitudes cambio evaluador; admin_carepa: Usuarios, Dependencias, Periodos, Evaluaciones, Aprobar compromisos, Evidencias, Parametros, Reportes, Auditoría, Manual de Funciones, Solicitudes cambio evaluador).
13. **Consulta pública de funcionario**: endpoint sin auth que devuelve el estado de evaluación de un documento.

### 4.11 Seguridad backend (obligatorio)

- JWT HS256 con expiración; sesión server-side en `sesiones` (token_hash sha256) para revocación.
- Passwords bcrypt (`password_hash`).
- 100% prepared statements PDO (cero concatenación de SQL con input).
- `SanitizerHelper` antes de procesar input; `ValidatorHelper` para requeridos/formato.
- CSRF por sesión en toda mutación (419).
- Rate limit por IP (auth más estricto).
- Headers de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).
- CORS restringido a `CORS_ORIGIN`.
- Errores 500 genéricos sin trazas.
- `?token=` aceptado solo en GET de descarga (evidencias/archivo, pdfs, excel).

---

## 5. Fase 3 — Frontend React

### 5.1 Configuración base

- `vite.config.ts`: plugin react, alias `@` → `./src`, `server.port = 5174` (fuente de verdad), `host: true`, proxy `/api` → `http://localhost:8000` (sin rewrite), manualChunks vendor-react/vendor-ui.
- `tsconfig.json`: `strict: true`, alias `@/*` → `./src/*`.
- `tailwind.config.js`: extender colores institucionales (azul Carepa `#0A2B5E`).
- `.env`: `VITE_API_URL=/api/v1`, `VITE_BASE=/`.
- `package.json`: react 19, react-dom 19, react-router-dom 7.6, sonner 2; dev: typescript 5.8, vite 6.3, tailwind 3.4, vitest 4 (jsdom), @testing-library/*.

### 5.2 Estructura

```
frontend/src/
├── main.tsx                  # bootstrap + Router + AuthProvider + sonner Toaster
├── App.tsx                   # Rutas (~40) con ProtectedRoute y RoleExcludedRoute
├── index.css                 # Tailwind + globales
├── styles/colors.ts          # Paleta institucional (azul Carepa #0A2B5E)
├── contexts/
│   ├── AuthContext.tsx       # token/usuario/roles/rolActivo/menu en estado + localStorage
│   └── ToastContext.tsx      # sistema de toasts (sonner)
├── lib/
│   ├── api.ts                # cliente HTTP (JWT + CSRF + auto-refresh + retry 419)
│   ├── auth.ts               # tipos y authApi (login, perfil, menu, cambiarRol, cambiarPassword)
│   ├── mensajesCNSC.ts       # literales CNSC del frontend
│   ├── evaluacionConstantes.ts
│   └── hooks/                # useCalculoEvaluacion, useContadores, ...
├── components/
│   ├── Layout/               # Layout.tsx + Sidebar.tsx (menú dinámico)
│   ├── Shared/               # AppHeader, NotificationBell, RoleSelector, Loader, DataTable
│   └── ui/                   # Button, Card, Input, Select, Modal, Tabs, Tooltip, Skeleton, EmptyState, DataTable
└── pages/                    # ~44 páginas por módulo
```

### 5.3 `lib/api.ts` (comportamiento exacto)

- `API_BASE = import.meta.env.VITE_API_URL || '/api/v1'`.
- `headers()`: `Content-Type: application/json` (si hay body), `Authorization: Bearer <edl_token>`, `X-CSRF-Token <edl_csrf>`.
- `request<T>(method, path, body)`:
  - Parsear siempre `{code, message, data}`; si `code !== '01'` → `throw new Error(message)`.
  - **CSRF expirado (419 o mensaje con "csrf")**: obtener token fresco (`GET /auth/csrf`), reintentar UNA vez.
  - **401**: intentar `POST /auth/refresh` con el token actual; si éxito, reintentar; si falla, limpiar `localStorage` (edl_token, edl_user, edl_rol_activo, edl_csrf) y `window.location.href = '/login'`.
  - Tras cada mutación exitosa (POST/PUT/DELETE/PATCH): pre-fetch CSRF fresco en background para evitar 419 encadenados.
- `postFormData`/`putFormData` para archivos (con CSRF y reintento análogo).
- `downloadUrl(path)`: agrega `?token=<jwt>` (endpoints de descarga).

### 5.4 `AuthContext` (comportamiento exacto)

- Estado inicial desde `localStorage`: `edl_token`, `edl_user`, `edl_rol_activo`.
- Al montar con token: cargar en paralelo `GET /auth/perfil` + `GET /menu`; si no hay rol guardado, tomar el primero de la lista de roles.
- `login(documento, password)`: `POST /auth/login` → guarda token, usuario, rol_activo; si `debe_cambiar_password` → flag `edl_forzar_cambio` y redirige a `/cambio-forzado-password`; luego carga menú y obtiene CSRF.
- `cambiarRol(codigo)`: `PUT /auth/rol {rol_codigo}` → guarda nuevo `rol_activo`, token y csrf si vienen; recarga `GET /menu`.
- `logout()`: llama `POST /auth/logout` (best-effort) y limpia localStorage y estado.
- `localStorage` keys: `edl_token`, `edl_user`, `edl_rol_activo`, `edl_csrf`, `edl_forzar_cambio`.

### 5.5 Enrutado y protección (`App.tsx`)

- Componentes `ProtectedRoute` (sin token → `/login`) y `RoleExcludedRoute` (excluye roles explícitos, ej. `admin_carepa` no ve módulos de gestión; redirige a `/dashboard`).
- Rutas públicas: `/login`, `/verificar-codigo`, `/nueva-contraseña`.
- Rutas principales bajo `<Route path="/dashboard" element={<ProtectedRoute><Layout/></ProtectedRoute>}>`: index (Dashboard), admin, usuarios, admin-usuarios, periodos, dependencias, admin-dependencias, metas, concertaciones, evaluaciones, admin-evaluaciones, evidencias, mis-evidencias, reportes, admin-reportes, notificaciones, configuracion, parametros, consulta-funcionario, manual-funciones, manual-funciones/:id, compromisos-y-competencias, compromisos/mios, compromisos/concertar, compromisos/concertar/:evaluacionId, compromisos/ver/:evaluacionId, compromisos/propuestos/:evaluacionId, compromisos/ajustar/:evaluacionId, compromisos/aprobar, compromisos/mejoramiento, compromisos/proponer, compromisos/fijacion-unilateral, compromisos/solicitudes-cambio, admin-compromisos, ausentismos, movilidad, evaluar, comision-evaluadora, evaluaciones/ver, evaluaciones/ver/:evaluacionId, perfil.
- Lazy-loading (`lazy` + `Suspense` con Loader) para páginas pesadas; eager: Login, VerificarCodigo, NuevaContrasena, CambioForzadoPassword, SelectRolePage, Dashboard, Perfil.

### 5.6 Páginas clave (comportamiento esperado)

- **Login**: documento + contraseña; error amable; redirección según `debe_cambiar_password` y número de roles (1 → dashboard, varios → `/seleccionar-rol`).
- **Dashboard**: KPIs según rol activo (periodo activo, pendientes de calificar, concertaciones, mis evaluaciones, actividad reciente).
- **CompromisosYCompetencias** (evaluador): busca evaluado por documento → botones Concertar / Ver concertados / Ver propuestos por evaluado / Ajustar / Buscar rechazados.
- **ConcertarCompromisos**: selección de período; checkboxes "Es Comisión Evaluadora" + integrante, "No es jefe inmediato" + motivo; ingreso de compromisos funcionales (meta + texto verbo/objeto/condición + peso, validación suma=100) y comportamentales (catálogo, marcar "propuesto por jefe de entidad"); tipo de concertación; confirmar; esperar aceptación del evaluado.
- **MisCompromisos** (evaluado): ver compromisos pendientes de aceptar, aceptar/rechazar, proponer compromisos (si el evaluador omitió), bandejas por evaluación (vigentes / rechazados / cerrados en cards separadas).
- **EvaluarPage** (evaluador): seleccionar período → buscar evaluado → elegir tipo de evaluación (con causales para parcial eventual) → calificar funcionales (1-100) → calificar comportamentales (frecuencias por conducta + 2 preguntas + justificación ≥40 caracteres cuando aplica, columna "Calificado" cambia al completar) → guardar.
- **VerEvaluaciones**: detalle, notas (usar función `formatearNota`/`formatearPuntaje` que coaccione a número porque la API devuelve DECIMAL como string), PDF, anular, comisión.
- **ComisionEvaluadora**: bandeja de evaluaciones por aprobar/rechazar.
- **PanelEvaluador**: pendientes de calificar por tipo y período.
- **Reportes**: filtros por entidad/dependencia/funcionario/periodo; exportar PDF/Excel.
- **Manual de Funciones**: índice de cargos con acordeones (propósito, funciones, requisitos, competencias), ficha de cargo con tooltip de competencias en el flujo de concertación, PDF de la ficha.
- **Evidencias**: registrar evidencia descriptiva (compromiso, descripción, ubicación, observación) + archivo opcional.
- **Admin (Usuarios/Dependencias/Periodos/Compromisos/Evaluaciones/Reportes/Notificaciones/Configuración)**: CRUD con tablas, modales, carga masiva CSV/Excel con plantilla descargable.
- **Perfil**: datos personales, cambio de contraseña, rol activo.

### 5.7 UI/UX

- Paleta institucional: azul Carepa `#0A2B5E` (en `styles/colors.ts` y Tailwind config).
- Componentes primitivos reutilizables en `components/ui/` (Button, Card, Input, Select, Modal, Tabs, Tooltip, Skeleton, EmptyState, DataTable).
- Toasts con `sonner`; loader institucional en `Shared/Loader`.
- Sidebar dinámico: renderiza `menu[]` devuelto por `GET /menu` (label, icon, ruta).
- `RoleSelector` en el header para cambiar rol activo sin cerrar sesión.
- `NotificationBell` con sondeo periódico.
- Nombres de componentes exportados (no default exports, salvo páginas que lo requieran); interfaces para props.
- Estado de carga/error explícito en todas las páginas; mensajes literales CNSC en `mensajesCNSC.ts`.

---

## 6. Mensajes literales CNSC (usar textuales; nunca inventar)

Backend en `MensajesCNSC.php`, frontend en `mensajesCNSC.ts`. Algunos obligatorios:

- "Se registró la concertación de compromisos correctamente."
- "El peso de los compromisos debe ser igual a 100."
- "Se aceptaron los compromisos correctamente." / "Se rechazaron los compromisos correctamente."
- "La creación de la evaluación se realizó correctamente." / "Se registró la evaluación correctamente."
- "Se ha registrado el acta de concertación de compromisos y competencias para el funcionario X, conforme a lo establecido en la Resolución 1760 de 2010."
- "La concertación de compromisos y competencias del funcionario X ha sido aprobada. De acuerdo con el artículo 34 de la Resolución 1760 de 2010, el evaluado cuenta con tres (3) días hábiles para manifestar su no conformidad."
- "Se procede con la fijación unilateral de compromisos y competencias para el funcionario X, conforme al artículo 33 de la Resolución 1760 de 2010, dado que no se logró acuerdo en la concertación."
- "Se ha calificado la evaluación del desempeño laboral del funcionario X. La calificación definitiva es N%, correspondiente al nivel Y. Conforme al artículo 48 de la Resolución 1760 de 2010, el evaluado cuenta con tres (3) días hábiles para manifestar su disconformidad."
- "La Comisión de Evaluación y Desempeño ha aprobado la evaluación del funcionario X con calificación definitiva N%, nivel Y."
- "La Comisión de Evaluación y Desempeño ha rechazado la evaluación del funcionario X. Se realizará una nueva evaluación conforme al artículo 51 de la Resolución 1760 de 2010."
- "Se ha registrado un compromiso de mejoramiento para el funcionario X, con motivo: M. Conforme al artículo 62 de la Resolución 1760 de 2010, el funcionario deberá cumplir las acciones de mejoramiento dentro del período establecido."
- "Se ha abierto el período de evaluación P. De acuerdo con la Resolución 1760 de 2010, todos los servidores públicos sujetos a evaluación deben participar en el proceso."
- "Se ha cerrado el período de evaluación P. Las evaluaciones pendientes serán calificadas con base en la información disponible."
- Errores de seguridad: "Token de autenticacion requerido", "Token invalido o expirado", "Sesion revocada o invalida", "Token CSRF invalido o expirado", "Error interno del servidor. Contacte al administrador."

---

## 7. Documentación a entregar (junto al código)

1. `README.md` — visión, stack, instalación (BD → backend → frontend), configuración `.env`, usuarios de prueba, ejecución, despliegue.
2. `AGENTS.md` — convenciones y gotchas para agentes IA (resumen de este documento).
3. `cnsc/17-endpoints-api.md` — referencia de todos los endpoints.
4. `cnsc/18-arquitectura.md` — arquitectura (capas, ADRs, diagramas).
5. `backend/.env.example` — todas las variables: `APP_ENV`, `APP_DEBUG`, `APP_TIMEZONE=America/Bogota`, `APP_API_URL`, `APP_FRONTEND_URL`, `UPLOAD_DIR`, `DB_HOST`, `DB_PORT`, `DB_NAME=edl_carepa`, `DB_USER`, `DB_PASS`, `DB_SOCKET`, `JWT_SECRET` (≥32 chars), `JWT_EXPIRACION_MINUTOS=120`, `INTENTOS_LOGIN_MAXIMOS=5`, `PASSWORD_LONGITUD_MINIMA=8`, `CORS_ORIGIN`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`, `MAIL_FROM_NAME`, `PESO_FUNCIONALES=85`, `PESO_COMPORTAMENTALES=15`.
6. `frontend/.env` — `VITE_API_URL=/api/v1`, `VITE_BASE=/`.
7. `start.sh` / `start_backend.sh` — scripts de arranque (MySQL + PHP :8000 + Vite :5174, PIDs en `.pids/`, logs en `.logs/`).
8. `database/full_dump.sql` — el archivo único de BD.

---

## 8. Pruebas requeridas (suites a crear en `tests/`)

- `api_test.py` — pytest + requests contra la API (bootea su propio PHP server en `:8002`; NO debe haber otro backend en ese puerto): login, CRUD por módulo, RBAC (403), validaciones (422), auth (401).
- `flow_test.py` — flujo completo contra `:8000`: login evaluador → crear periodo/concertación → compromisos funcionales y comportamentales → enviar → aceptar evaluado → aprobar → crear evaluación → calificar → definitiva (verificar 85/15 y escala) → comisión aprueba → PDF.
- `run_tests.php` — pruebas unitarias PHP (Router, JwtHelper, BaseRepository, Sanitizer, Validator).
- `run_all.sh` — ejecuta todas las suites y resume PASS/FAIL por suite en `.logs/`.

---

## 9. Gotchas críticos (violarlos = sistema roto)

1. **Orden de rutas**: `/evaluaciones/pendientes-calificar` y `/cargos-manual/conteos` SIEMPRE antes de `/evaluaciones/{id}` y `/cargos-manual/{id}`. El router hace match secuencial por regex.
2. **PDO DECIMAL → string**: `toFixed()` falla sobre strings; en el frontend formatear con funciones que hagan `Number(valor)`; en backend con `formatoNumero($valor, 2)`.
3. **`Database.php`**: debe usar `PDO::MYSQL_ATTR_FOUND_ROWS` (o `\Pdo\Mysql::ATTR_FOUND_ROWS` en PHP 8.5+) para que `UPDATE` devuelva filas afectadas correctamente.
4. **Socket BD**: `.env.example` usa `/tmp/mysql.sock`; ajustable por entorno.
5. **`declare(strict_types=1)`** en todo PHP.
6. **Rol activo**: validar permisos contra `rol_activo` del JWT, jamás contra `roles[]`.
7. **CSRF**: cabecera `X-CSRF-Token` en toda mutación; el frontend rota el token tras cada mutación exitosa y reintenta una vez ante 419.
8. **Dompdf**: sin `position: fixed`; header solo en página 1 (inline), footer solo en última; todas las expresiones PHP resueltas antes del heredoc; `escudo.png` embebido en base64.
9. **SPA fallback**: el backend sirve `frontend/dist/index.html` para rutas no-`/api` (permite desplegar todo en un solo server).
10. **No frameworks nuevos**: solo las dependencias listadas en la sección 2.

---

## 10. Criterios de aceptación (Definition of Done)

- [ ] `database/full_dump.sql` restaura en MariaDB/MySQL limpio sin errores (`mysql edl_carepa < full_dump.sql`).
- [ ] Backend arranca con `php -S 0.0.0.0:8000 -t public/ public/router.php` y responde el formato `{code,message,data}`.
- [ ] Login funciona con los 3 usuarios de prueba (`12345678`); bloqueo tras 5 intentos; recuperación por código (o fallback sin SMTP configurado).
- [ ] Multi-rol: cambiar rol activo sin logout (`PUT /auth/rol`) regenera token y menú.
- [ ] Flujo de concertación completo funciona de punta a punta (evaluador → evaluado → aprobación, con validación de pesos = 100 y rangos de compromisos).
- [ ] Evaluación: 4 tipos, validación de fechas 2.º semestre, escalas, definitiva 85/15 con nivel correcto (sobresaliente/satisfactorio/no_satisfactorio), justificación ≥40 caracteres, comisión aprueba/rechaza.
- [ ] Soft delete en todas las tablas; auditoría registra CUD con antes/después.
- [ ] PDF de concertación y de evaluación generan (con conductas por competencia) sin errores de Dompdf.
- [ ] Todas las suites de prueba pasan (`bash tests/run_all.sh`).
- [ ] Frontend `npm run build` sin errores TypeScript strict; dev server en `:5174` con proxy `/api` → `:8000`.
- [ ] Las rutas del menú por rol no exponen páginas sin permiso (401/403 controlados).
- [ ] Sin secretos en el repo; `.env` en `.gitignore`.
