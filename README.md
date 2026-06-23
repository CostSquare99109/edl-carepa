<img src="docs/escudo.png" alt="Escudo de Carepa" width="120" align="right">

# EDL Carepa — Evaluación del Desempeño Laboral

**Repositorio privado** — Acceso restringido al equipo de desarrollo y a la Alcaldía de Carepa.

Sistema integral de **Evaluación del Desempeño Laboral (EDL)** para la **Alcaldía de Carepa, Antioquia, Colombia**. Plataforma web que automatiza y digitaliza el ciclo completo de evaluación de servidores públicos, dando cumplimiento al **Acuerdo CNSC 617 de 2018** y la normativa colombiana vigente en materia de gestión del talento humano en el sector público.

---

## Objetivos

- **Automatizar** el proceso de evaluación del desempeño laboral de los funcionarios públicos de la Alcaldía de Carepa.
- **Digitalizar** la concertación de compromisos funcionales y comportamentales entre evaluadores y evaluados.
- **Facilitar** el seguimiento y la calificación mediante evidencias descriptivas durante los periodos de evaluación.
- **Garantizar** la trazabilidad y la transparencia mediante un sistema de auditoría completo.
- **Generar** reportes institucionales en PDF con la identidad visual oficial del municipio.
- **Cumplir** con los lineamientos de la CNSC (Comisión Nacional del Servicio Civil) y el Acuerdo 617 de 2018.

---

## Descripción

EDL Carepa gestiona todas las etapas del proceso de evaluación del desempeño de funcionarios públicos:

1. **Concertación de compromisos** — Evaluador y evaluado acuerdan compromisos funcionales (metas institucionales) y comportamentales (competencias) con asignación de pesos porcentuales.
2. **Fijación unilateral** — Si no hay acuerdo tras 15 días, el evaluador fija los compromisos unilateralmente con testigo.
3. **Seguimiento** — El evaluado registra evidencias descriptivas de cumplimiento durante el periodo.
4. **Evaluación parcial** — Calificaciones al primer semestre, segundo semestre o evaluación eventual.
5. **Evaluación definitiva** — Calificación final aprobada por la Comisión Evaluadora.
6. **Compromisos de mejoramiento** — Planes de mejora cuando los resultados son insatisfactorios o aceptables.
7. **Reportes** — Generación de reportes en PDF con el escudo institucional de Carepa.

### Funcionalidades clave

- **Autenticación segura** con JWT, bloqueo automático por 5 intentos fallidos y recuperación de contraseña mediante código de 6 dígitos por correo electrónico.
- **Control de acceso granular (RBAC)** con 6 roles, 51 permisos y 84 asignaciones rol-permiso.
- **Soporte multirol**: un usuario puede tener múltiples roles y cambiar entre ellos sin cerrar sesión.
- **Menú dinámico** adaptado al rol activo del usuario.
- **Carga masiva** de usuarios, concertaciones, evaluaciones y cursos desde archivos CSV/Excel.
- **Notificaciones en tiempo real** con sondeo cada 30 segundos y notificaciones por correo electrónico.
- **Auditoría completa** de todas las operaciones de creación, actualización y eliminación (CUD) con captura de estado anterior y nuevo.
- **Eliminación suave (soft delete)** en todas las tablas operacionales.
- **Protección CSRF** mediante tokens por sesión.
- **Limitación de tasa (rate limiting)** por dirección IP.
- **Cabeceras de seguridad HTTP** (CSP, X-Frame-Options, HSTS, X-Content-Type-Options).
- **Generación de reportes PDF** con dompdf e identidad institucional.
- **Identidad visual institucional** (colores, tipografía, escudo) conforme a la imagen del municipio de Carepa.

---

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | TypeScript 5.8, React 19.1, React Router 7.6, TailwindCSS 3.4, Vite 6.3, sonner 2.0 |
| **Backend** | PHP 8.2+, MVC personalizado (Controller → Service → Repository), Firebase JWT, PHPMailer 7.1, Dompdf 3.1, PDO |
| **Base de datos** | MariaDB 10.6+ / MySQL 8.0+, charset utf8mb4_unicode_ci |
| **Arquitectura** | API REST stateless con autenticación JWT, SPA (Single Page Application) |
| **Infraestructura** | Servidor Apache/Nginx con mod_rewrite, PHP-FPM |

---

## Estructura del proyecto

```
edl-carepa/
├── backend/                        # API REST en PHP (MVC personalizado)
│   ├── public/
│   │   └── index.php               # Punto de entrada único y definición de rutas
│   ├── src/
│   │   ├── Config/                 # Configuración (Base de datos, entorno, CORS)
│   │   ├── Controller/             # 21 controladores (Auth, Compromiso, Evaluacion, etc.)
│   │   ├── Helper/                 # 11 utilidades (JWT, PDF, Mail, Excel)
│   │   ├── Middleware/             # 7 middlewares (Autenticación, CSRF, RateLimit, Seguridad)
│   │   ├── Model/                  # 15 modelos de dominio
│   │   ├── Repository/            # 18 repositorios de acceso a datos
│   │   ├── Router/                 # Enrutador HTTP personalizado
│   │   └── Service/               # 17 servicios con lógica de negocio
│   ├── storage/                    # Almacenamiento local (sesiones, caché)
│   ├── uploads/                    # Archivos subidos por usuarios
│   ├── var/                        # Archivos temporales generados
│   ├── .env                        # Variables de entorno (producción)
│   ├── .env.example                # Plantilla de variables de entorno
│   └── composer.json               # Dependencias PHP
│
├── frontend/                       # SPA en React
│   ├── public/
│   │   └── escudo.png              # Escudo institucional
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/             # Layout principal y Sidebar dinámico
│   │   │   ├── Shared/             # Componentes compartidos (RoleSelector, NotificationBell)
│   │   │   └── ui/                 # Biblioteca de componentes UI (Button, Card, DataTable, Tabs, Modal, etc.)
│   │   ├── contexts/               # Contextos de React (AuthContext, ToastContext)
│   │   ├── lib/                    # Utilidades: cliente HTTP (api.ts), autenticación (auth.ts), mensajes CNSC
│   │   ├── pages/                  # 40+ páginas organizadas por módulo
│   │   │   ├── Admin/              # Administración (usuarios, dependencias, periodos, configuración)
│   │   │   ├── Compromisos/        # Compromisos funcionales y comportamentales (10 páginas)
│   │   │   ├── Concertaciones/     # Concertación de evaluaciones
│   │   │   ├── Evaluaciones/       # Panel evaluador, comisión evaluadora
│   │   │   ├── Evidencias/         # Gestión de evidencias descriptivas
│   │   │   ├── Ausentismos/        # Control de ausentismos >30 días
│   │   │   ├── Metas/              # Gestión de metas institucionales
│   │   │   ├── Reportes/           # Reportes y estadísticas
│   │   │   └── ...                 # Login, Dashboard, Perfil, ConsultaFuncionario, etc.
│   │   └── styles/                 # Paleta de colores institucionales (colors.ts)
│   ├── dist/                       # Compilado de producción (generado con `npm run build`)
│   ├── .env                        # Variables de entorno del frontend
│   ├── package.json                # Dependencias Node.js
│   ├── tailwind.config.js          # Configuración de TailwindCSS con colores institucionales
│   ├── tsconfig.json               # Configuración de TypeScript
│   └── vite.config.ts              # Configuración de Vite (proxy API incluido)
│
├── database/                       # Esquemas y migraciones SQL
│   ├── schema.sql                  # Esquema completo de la base de datos (16 tablas)
│   ├── seeds.sql                   # Datos semilla (roles, permisos, asignaciones)
│   ├── seed_usuarios.sql           # Usuarios de prueba
│   └── migration_*.sql             # 6 migraciones incrementales
│
├── cnsc/                           # Documentación técnica alineada con la CNSC
│   ├── 00-indice-maestro.md        # Índice maestro de documentación técnica
│   ├── 01-15-*.md                  # 15 capítulos de documentación técnica
│   ├── 16-glosario-cnsc.md         # Glosario de términos CNSC
│   ├── 17-endpoints-api.md         # Documentación completa de la API (138 endpoints)
│   ├── 18-arquitectura.md          # Documentación de arquitectura del sistema
│   ├── AUDITORIA-DIRIGIDA-2026-06-22.md  # Auditoría de código dirigida
│   └── CHANGELOG.md                # Registro de cambios del proyecto
│
├── docs/                           # Documentación general y recursos gráficos
│   ├── assets/                     # Recursos estáticos
│   ├── escudo.png                  # Escudo institucional de Carepa
│   ├── 404.html                    # Página 404 personalizada
│   └── index.html                  # Página de inicio informativa
│
├── tests/                          # Pruebas automatizadas
│   ├── api_test.py                 # Pruebas de API con pytest
│   ├── flow_test.py                # Pruebas de flujo completo
│   └── run_tests.php               # Script para ejecutar pruebas PHP
│
├── .github/workflows/              # Pipelines de CI/CD (GitHub Actions)
├── assign_roles.py                 # Script de asignación masiva de roles
├── migrate_usuarios.py             # Script de migración de usuarios
├── fijacion_methods.php            # Métodos auxiliares para fijación unilateral
├── new_method.php                  # Métodos complementarios del sistema
├── test_api.py                     # Pruebas de API adicionales
├── test_endpoints.sh               # Pruebas de endpoints en shell script
├── FASE3_GAPS.md                   # Brechas identificadas para la Fase 3 del proyecto
├── .gitignore                      # Archivos ignorados por Git
└── README.md                       # Este archivo
```

---

## Requisitos del sistema

| Requisito | Versión mínima |
|-----------|----------------|
| PHP | 8.2 |
| Composer | 2.5 |
| Node.js | 20 LTS |
| npm | 10 |
| MariaDB / MySQL | 10.6 / 8.0 |
| Extensiones PHP | pdo_mysql, mbstring, gd, xml, zip, openssl, json, fileinfo |
| Servidor web | Apache 2.4+ (mod_rewrite) o Nginx 1.24+ |

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/CostSquare99109/edl-carepa.git
cd edl-carepa
```

### 2. Configurar la base de datos

```bash
# Crear la base de datos
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS edl_carepa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Cargar el esquema completo
mysql -u root -p edl_carepa < database/schema.sql

# Cargar datos semilla (roles, permisos y asignaciones)
mysql -u root -p edl_carepa < database/seeds.sql

# (Opcional) Cargar usuarios de prueba
mysql -u root -p edl_carepa < database/seed_usuarios.sql

# Aplicar migraciones en orden
mysql -u root -p edl_carepa < database/migration_edl_carepa.sql
mysql -u root -p edl_carepa < database/migration_conductas.sql
mysql -u root -p edl_carepa < database/migration_evaluacion_campo_cnsz.sql
mysql -u root -p edl_carepa < database/migration_evidencias_descriptivas.sql
mysql -u root -p edl_carepa < database/migration_notificaciones_evaluacion_id.sql
mysql -u root -p edl_carepa < database/migration_competencias_comportamentales.sql
```

### 3. Configurar el backend

```bash
cd backend
cp .env.example .env
nano .env   # Editar las variables según el entorno
composer install
php -S localhost:8000 -t public/
```

#### Variables de entorno del backend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `APP_ENV` | Entorno de ejecución | `development` / `production` |
| `APP_DEBUG` | Modo depuración | `true` / `false` |
| `APP_TIMEZONE` | Zona horaria | `America/Bogota` |
| `APP_API_URL` | URL pública de la API | `http://localhost:8000` |
| `APP_FRONTEND_URL` | URL del frontend (para CORS) | `http://localhost:5173` |
| `DB_HOST` | Host de la base de datos | `127.0.0.1` |
| `DB_PORT` | Puerto de la base de datos | `3306` |
| `DB_NAME` | Nombre de la base de datos | `edl_carepa` |
| `DB_USER` | Usuario de base de datos | `root` |
| `DB_PASS` | Contraseña de base de datos | *(vacío en desarrollo)* |
| `DB_SOCKET` | Socket de MySQL (opcional) | `/tmp/mysql.sock` |
| `JWT_SECRET` | Secreto para JWT (mín. 32 caracteres) | `cambia_esto_por_un_secreto_seguro` |
| `JWT_EXPIRACION_MINUTOS` | Duración del token JWT | `120` |
| `INTENTOS_LOGIN_MAXIMOS` | Intentos antes de bloqueo | `5` |
| `PASSWORD_LONGITUD_MINIMA` | Longitud mínima de contraseña | `8` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:5173` |
| `MAIL_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `MAIL_PORT` | Puerto SMTP | `587` |
| `MAIL_USER` | Usuario SMTP | *(correo institucional)* |
| `MAIL_PASS` | Contraseña SMTP (app-password) | *(generada desde Gmail)* |
| `MAIL_FROM` | Dirección remitente | `noreply@carepa-antioquia.gov.co` |
| `MAIL_FROM_NAME` | Nombre del remitente | `EDL-Carepa` |

### 4. Configurar el frontend

```bash
cd frontend
cp .env.example .env
# Editar VITE_API_URL si es necesario (por defecto: http://localhost:8000/api/v1)
npm install
npm run dev
```

El frontend se abrirá en `http://localhost:5173`. El archivo `vite.config.ts` incluye un proxy que redirige las peticiones `/api` al backend en `http://localhost:8000`.

### 5. Usuarios de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `Admin123!` | Administrador |
| `evaluador` | `Eval123!` | Evaluador |
| `evaluado` | `Eval123!` | Evaluado |

---

## Uso

### Roles del sistema

1. **Administrador** (`admin`) — Acceso total al sistema: gestión de usuarios, dependencias, periodos de evaluación, parámetros del sistema, notificaciones masivas y configuración general.
2. **Evaluador / Jefe** (`evaluador`) — Concertación y fijación de compromisos, evaluación de funcionarios a cargo, seguimiento de evidencias, calificación parcial y definitiva.
3. **Evaluado / Funcionario** (`evaluado`) — Propuesta de compromisos, carga de evidencias descriptivas, consulta de evaluaciones y retroalimentación.
4. **Comisión Evaluadora** (`comision_evaluadora`) — Aprobación de evaluaciones definitivas y revisión de casos especiales.
5. **Administrador de Entidad** (`admin_entidad`) — Administración a nivel de una entidad específica.
6. **Administrador Carepa** (`admin_carepa`) — Superadministrador con alcance municipal.

### Flujo de trabajo típico

1. **Configuración inicial**: el administrador crea entidades, dependencias, periodos de evaluación y usuarios con sus roles correspondientes.
2. **Concertación de compromisos**: evaluador y evaluado acuerdan compromisos funcionales (metas institucionales con peso porcentual) y comportamentales (competencias con nivel esperado).
3. **Seguimiento**: durante el periodo de evaluación, el evaluado registra evidencias descriptivas que respaldan el cumplimiento de cada compromiso.
4. **Evaluación parcial**: al finalizar cada semestre (o en evaluación eventual), el evaluador califica los compromisos.
5. **Evaluación definitiva**: al cierre del periodo, se calcula la calificación definitiva; la Comisión Evaluadora la revisa y aprueba.
6. **Retroalimentación**: el evaluado recibe los resultados, puede registrar comentarios y, si aplica, se generan compromisos de mejoramiento.
7. **Reportes**: generación de reportes en PDF con el escudo institucional y datos consolidados por entidad, dependencia o funcionario.

---

## Pruebas

```bash
# Pruebas de API con Python (requiere pytest y requests)
python tests/api_test.py

# Pruebas de flujo completo
python tests/flow_test.py

# Pruebas de endpoints con shell script
bash test_endpoints.sh

# Pruebas con PHP
php tests/run_tests.php
```

---

## Comandos útiles

```bash
# Construir frontend para producción
cd frontend && npm run build

# Vista previa de la compilación de producción
cd frontend && npm run preview

# Iniciar backend con puerto personalizado
php -S 0.0.0.0:8080 -t backend/public/

# Iniciar backend con router personalizado (para desarrollo)
php -S 0.0.0.0:8000 -t backend/public/ backend/public/router.php

# Restablecer contraseña de administrador
php backend/reset_admin.php

# Asignar roles masivamente desde archivo CSV
python assign_roles.py
```

---

## API REST

La API expone **138 endpoints** documentados en `cnsc/17-endpoints-api.md`. Los principales grupos de endpoints son:

| Grupo | Endpoints | Descripción |
|-------|-----------|-------------|
| `auth/*` | 10 | Autenticación, registro, recuperación de contraseña, perfil, roles |
| `usuarios/*` | 8 | CRUD de usuarios, búsqueda global, roles |
| `entidades/*` | 8 | CRUD de entidades, dependencias por entidad |
| `dependencias/*` | 6 | CRUD de dependencias |
| `periodos/*` | 6 | CRUD de periodos de evaluación |
| `metas/*` | 5 | CRUD de metas institucionales |
| `concertaciones/*` | 10 | Concertación de compromisos, fijación unilateral |
| `evaluaciones/*` | 9 | Evaluaciones parciales, definitivas, comisión |
| `compromisos/*` | 21 | Compromisos funcionales y comportamentales |
| `evidencias/*` | 4 | Gestión de evidencias descriptivas |
| `reportes/*` | 10 | Reportes en PDF, Excel y JSON |
| `ausentismos/*` | 5 | CRUD de ausentismos |
| `movilidades/*` | 6 | CRUD de movilidad de funcionarios |

Todas las respuestas utilizan el formato JSON. Los endpoints protegidos requieren el header `Authorization: Bearer <token>`.

---

## Contribución

Este es un **repositorio privado** de la Alcaldía de Carepa. El acceso está restringido al equipo de desarrollo autorizado y a la entidad contratante.

### Para contribuidores autorizados

1. Crear una rama a partir de `main` con el formato `feature/<nombre-de-la-funcionalidad>` o `fix/<nombre-de-la-correccion>`.
2. Realizar los cambios siguiendo los estándares de codificación del proyecto:
   - **PHP**: seguir el patrón Controller → Service → Repository.
   - **TypeScript/React**: utilizar componentes funcionales con hooks, Tipado estricto y seguir la estructura de carpetas existente.
   - **SQL**: todas las migraciones deben ser archivos SQL incrementales en `database/`.
3. Asegurarse de que las pruebas existentes continúen funcionando.
4. Actualizar la documentación en `cnsc/` si los cambios afectan la API o la arquitectura.
5. Crear un Pull Request hacia `main` y solicitar revisión.

### Estándares de codificación

- **PHP**: PSR-12 (estilo de codificación), tipado estricto (`declare(strict_types=1)`), PHPDoc en métodos públicos.
- **TypeScript**: strict mode, interfaces para props, componentes con nombre exportado.
- **SQL**: nombres en minúsculas con snake_case, claves foráneas con `fk_<tabla_origen>_<tabla_destino>`.

---

## Licencia

Este proyecto es de carácter institucional para la **Alcaldía de Carepa, Antioquia**. Todos los derechos reservados.

El código fuente, la documentación asociada y los recursos gráficos (incluyendo el escudo institucional) son de uso exclusivo del equipo de desarrollo autorizado y de la entidad contratante. No está permitida su distribución, modificación o uso sin autorización expresa de la Alcaldía de Carepa.

---

## Autor

**Jhon Fredy Montalvo Cuadrado** — *@CostSquare99109*

Desarrollador principal y arquitecto del sistema.

---

## Soporte

Para reportar problemas, solicitar cambios o resolver dudas técnicas:

- **Repositorio**: [github.com/CostSquare99109/edl-carepa](https://github.com/CostSquare99109/edl-carepa) (acceso privado)
- **Issues**: abrir un issue en el repositorio privado de GitHub
- **Contacto directo**: a través del autor principal

---

*EDL Carepa — Evaluación del Desempeño Laboral — Alcaldía de Carepa, Antioquia — 2026*
