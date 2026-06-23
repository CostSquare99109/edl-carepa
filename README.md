<img src="docs/escudo.png" alt="Escudo de Carepa" width="120" align="right">

# EDL Carepa — Evaluacion del Desempeno Laboral

**Repositorio privado** — Acceso restringido al equipo de desarrollo y a la Alcaldia de Carepa.

Sistema integral de **Evaluacion del Desempeno Laboral** para la **Alcaldia de Carepa, Antioquia, Colombia**. Plataforma web que gestiona el ciclo completo de evaluacion de servidores publicos conforme al **Acuerdo CNSC 617 de 2018** y la normativa colombiana vigente.

---

## Descripcion

EDL Carepa automatiza y digitaliza todas las etapas del proceso de evaluacion del desempeno de funcionarios publicos: desde la concertacion de compromisos funcionales y comportamentales, pasando por el seguimiento mediante evidencias, hasta la calificacion parcial y definitiva con aprobacion de la comision evaluadora y retroalimentacion.

### Funcionalidades clave

- **Autenticacion segura** con JWT, bloqueo automatico por intentos fallidos y recuperacion de contrasena via correo electronico.
- **Control de acceso granular** con 3 roles base, 51 permisos y 84 asignaciones rol-permiso.
- **Concertacion de compromisos** funcionales y comportamentales con pesos porcentuales (maximo 100 % por evaluacion).
- **Fijacion unilateral** de compromisos por parte del evaluador cuando no hay acuerdo.
- **Evaluaciones parciales** (semestrales/eventuales) y **definitivas** con aprobacion de comision evaluadora.
- **Seguimiento con evidencias**: los evaluados pueden cargar soportes durante el periodo.
- **Carga masiva** de usuarios, compromisos, evaluaciones y cursos desde archivos.
- **Notificaciones en tiempo real** con sondeo cada 30 segundos y notificaciones por correo electronico.
- **Auditoria completa** de todas las operaciones de creacion, actualizacion y eliminacion (CUD).
- **Eliminacion suave (soft delete)** en todas las tablas operacionales.
- **Panel de control** con indicadores, graficos y resumenes por rol.
- **Generacion de reportes** en PDF con escudo institucional.
- **Identidad visual institucional** (colores, tipografia, escudo).
- **Cabeceras de seguridad HTTP** (CSP, X-Frame-Options, HSTS, etc.).
- **Proteccion CSRF** y **limitacion de tasa (rate limiting)**.

---

## Tecnologias

| Capa        | Tecnologias                                                               |
|-------------|---------------------------------------------------------------------------|
| **Frontend**  | TypeScript 5.8, React 19, React Router 7, TailwindCSS 3, Vite 6, sonner  |
| **Backend**   | PHP 8.2+, MVC personalizado (Controller-Service-Repository), Firebase JWT, PHPMailer, Dompdf |
| **Base de datos** | MariaDB 10.6+ / MySQL 8.0+, charset utf8mb4_unicode_ci                  |
| **Arquitectura** | API REST stateless, SPA con autenticacion JWT                           |

---

## Estructura del proyecto

```
edl-carepa/
├── backend/                    # API REST en PHP
│   ├── public/                 # Punto de entrada (index.php, router.php)
│   ├── src/
│   │   ├── Config/             # Configuracion (base de datos, cors, jwt)
│   │   ├── Controller/         # Controladores (Auth, Compromiso, Evaluacion, etc.)
│   │   ├── Helper/             # Utilidades (MailHelper, PdfHelper)
│   │   ├── Middleware/         # Middleware (Auth, CSRF, RateLimit, SecurityHeaders)
│   │   ├── Model/              # Modelos (Usuario, Compromiso, Evaluacion, etc.)
│   │   ├── Repository/         # Acceso a datos (BaseRepository y repositorios especificos)
│   │   ├── Router/             # Enrutador personalizado
│   │   └── Service/            # Logica de negocio (Auth, Compromiso, Evaluacion, etc.)
│   ├── storage/                # Almacenamiento local (sesiones, cache)
│   ├── uploads/                # Archivos subidos por usuarios
│   ├── var/                    # Archivos temporales generados
│   ├── .env                    # Variables de entorno (produccion)
│   ├── .env.example            # Plantilla de variables de entorno
│   └── composer.json           # Dependencias PHP
│
├── frontend/                   # SPA en React
│   ├── public/                 # Archivos publicos estaticos
│   ├── src/
│   │   ├── components/         # Componentes React reutilizables
│   │   │   ├── Layout/         # Layout, Sidebar
│   │   │   ├── Shared/         # AppHeader, NotificationBell
│   │   │   └── ui/             # Card, DataTable, Tabs
│   │   ├── contexts/           # Contextos de React (AuthContext)
│   │   ├── lib/                # Utilidades (auth.ts, api.ts, mensajesCNSC.ts)
│   │   ├── pages/              # Paginas/vistas por modulo
│   │   │   ├── Admin/          # Administracion (usuarios, dependencias, configuracion)
│   │   │   ├── Compromisos/    # Compromisos funcionales y comportamentales
│   │   │   ├── Concertaciones/ # Concertacion de evaluaciones
│   │   │   ├── Evaluaciones/   # Evaluacion, comision evaluadora
│   │   │   ├── Evidencias/     # Carga y gestion de evidencias
│   │   │   └── ...             # Login, Dashboard, Perfil, Reportes, etc.
│   │   └── styles/             # Definiciones de colores institucionales
│   ├── dist/                   # Compilado de produccion
│   ├── .env                    # Variables de entorno del frontend
│   ├── package.json            # Dependencias Node.js
│   ├── tailwind.config.js      # Configuracion de TailwindCSS
│   ├── tsconfig.json           # Configuracion de TypeScript
│   └── vite.config.ts          # Configuracion de Vite
│
├── database/                   # Esquemas y migraciones SQL
│   ├── schema.sql              # Esquema completo de la base de datos
│   ├── seeds.sql               # Datos de prueba
│   ├── seed_usuarios.sql       # Usuarios de prueba
│   ├── migration_*.sql         # Migraciones incrementales
│
├── cnsc/                       # Documentacion tecnica CNSC
│   ├── 00-indice-maestro.md    # Indice maestro de documentacion
│   ├── 16-glosario-cnsc.md     # Glosario de terminos
│   ├── 17-endpoints-api.md     # Documentacion de endpoints
│   ├── 18-arquitectura.md      # Documentacion de arquitectura
│   └── AUDITORIA-DIRIGIDA-2026-06-22.md
│
├── docs/                       # Documentacion general y recursos graficos
│   ├── assets/                 # Recursos estaticos
│   ├── escudo.png              # Escudo institucional de Carepa
│   ├── 404.html                # Pagina 404 personalizada
│   └── index.html              # Pagina de inicio institucional
│
├── tests/                      # Pruebas automatizadas
│   ├── api_test.py             # Pruebas de API con pytest
│   ├── flow_test.py            # Pruebas de flujo completo
│   └── run_tests.php           # Script de ejecucion de pruebas
│
├── assign_roles.py             # Script de asignacion masiva de roles
├── migrate_usuarios.py         # Script de migracion de usuarios
├── fijacion_methods.php        # Metodos de fijacion unilateral
├── new_method.php              # Nuevos metodos del sistema
├── test_api.py                 # Pruebas de API adicionales
├── test_endpoints.sh           # Pruebas de endpoints en shell
├── FASE3_GAPS.md               # Brechas identificadas - Fase 3
└── README.md                   # Este archivo
```

---

## Requisitos del sistema

| Requisito          | Version minima |
|--------------------|----------------|
| PHP                | 8.2            |
| Composer           | 2.5            |
| Node.js            | 20 LTS         |
| npm                | 10             |
| MariaDB / MySQL    | 10.6 / 8.0     |
| Extensiones PHP    | pdo_mysql, mbstring, gd, xml, zip, openssl |

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/CostSquare99109/edl-carepa.git
cd edl-carepa
```

### 2. Configurar la base de datos

```bash
# Crear la base de datos con el esquema completo
mysql -u root -p < database/schema.sql

# Cargar datos semilla (roles, permisos, usuarios de prueba)
mysql -u root -p edl_carepa < database/seeds.sql

# Aplicar migraciones pendientes
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
nano .env
```

Variables de entorno principales:

| Variable                | Descripcion                                 | Ejemplo                              |
|-------------------------|---------------------------------------------|--------------------------------------|
| `DB_HOST`               | Host de la base de datos                    | `127.0.0.1`                          |
| `DB_NAME`               | Nombre de la base de datos                  | `edl_carepa`                         |
| `DB_USER`               | Usuario de la base de datos                 | `root`                               |
| `DB_PASS`               | Contrasena de la base de datos              |                                      |
| `JWT_SECRET`            | Secreto para firmar tokens JWT (>= 32 caracteres) | `cambia_esto_por_un_secreto_seguro`  |
| `MAIL_HOST`             | Servidor SMTP para correos                  | `smtp.gmail.com`                     |
| `MAIL_USER`             | Usuario SMTP                                |                                      |
| `MAIL_PASS`             | Contrasena SMTP (app-password recomendada)  |                                      |

```bash
# Instalar dependencias de PHP
composer install

# Iniciar servidor de desarrollo
php -S localhost:8000 -t public/
```

### 4. Configurar el frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se abrira en `http://localhost:5173` y se comunicara con el backend en `http://localhost:8000`.

### 5. Usuarios de prueba

| Usuario      | Contrasena  | Rol               |
|-------------|-------------|-------------------|
| `admin`     | `Admin123!` | Administrador     |
| `evaluador` | `Eval123!`  | Evaluador         |
| `evaluado`  | `Eval123!`  | Evaluado          |

---

## Uso

### Roles del sistema

1. **Administrador**: gestion de usuarios, dependencias, periodos, parametros del sistema, notificaciones y configuracion general.
2. **Evaluador (jefe)**: concertacion y fijacion de compromisos, evaluacion de funcionarios, seguimiento de evidencias, calificaciones.
3. **Evaluado (funcionario)**: propuesta de compromisos, carga de evidencias, consulta de evaluaciones y retroalimentacion.

### Flujo de trabajo tipico

1. **Configuracion inicial**: el administrador crea entidades, dependencias, periodos de evaluacion y usuarios con sus roles.
2. **Concertacion de compromisos**: evaluador y evaluado acuerdan compromisos funcionales (metas) y comportamentales (competencias) con pesos porcentuales.
3. **Seguimiento**: durante el periodo, el evaluado carga evidencias de cumplimiento.
4. **Evaluacion parcial/definitiva**: el evaluador califica los compromisos; la comision evaluadora aprueba las calificaciones.
5. **Retroalimentacion**: el evaluado recibe los resultados y puede registrar comentarios.
6. **Reportes**: generacion de reportes en PDF con el escudo institucional.

---

## Pruebas

```bash
# Pruebas de API con Python
python tests/api_test.py

# Pruebas de flujo completo
python tests/flow_test.py

# Pruebas de endpoints con shell
bash test_endpoints.sh

# Pruebas con PHP
php tests/run_tests.php
```

---

## Comandos utiles

```bash
# Construir frontend para produccion
cd frontend && npm run build

# Vista previa de la compilacion de produccion
cd frontend && npm run preview

# Iniciar backend con puerto personalizado
php -S 0.0.0.0:8080 -t backend/public/

# Resetear contrasena de administrador
php backend/reset_admin.php
```

---

## Licencia

Este proyecto es de caracter institucional para la **Alcaldia de Carepa, Antioquia**. Todos los derechos reservados. El codigo fuente y la documentacion asociada son de uso exclusivo del equipo de desarrollo y de la entidad contratante.

---

## Autor

**CostSquare99109** - Jhon Fredy Montalvo Cuadrado

---

## Soporte

Para reportar problemas o solicitar ayuda, abrir un issue en el repositorio privado de GitHub o contactar al autor.
