<img src="docs/escudo.png" alt="Escudo Carepa" width="120" align="right">

# EDL Carepa — Evaluación del Desempeño Laboral

Sistema integral de **Evaluación del Desempeño Laboral** para la **Alcaldía de Carepa, Antioquia, Colombia**. Plataforma web que gestiona el ciclo completo de evaluación de servidores públicos conforme al **Acuerdo CNSC 617 de 2018** y normativa colombiana vigente.

---

## 📋 Descripción

EDL Carepa automatiza y digitaliza todas las etapas del proceso de evaluación del desempeño de funcionarios públicos: desde la concertación de compromisos funcionales y comportamentales, pasando por el seguimiento mediante evidencias, hasta la calificación parcial y definitiva con aprobación de la comisión evaluadora y retroalimentación.

### Funcionalidades clave

- **Autenticación segura** con JWT, bloqueo automático por intentos fallidos y recuperación de contraseña vía correo electrónico.
- **Control de acceso granular** con 3 roles base, 51 permisos y 84 asignaciones rol-permiso.
- **Concertación de compromisos** funcionales y comportamentales con pesos porcentuales (máximo 100 % por evaluación).
- **Fijación unilateral** de compromisos por parte del evaluador cuando no hay acuerdo.
- **Evaluaciones parciales** (semestrales/eventuales) y **definitivas** con aprobación de comisión evaluadora.
- **Seguimiento con evidencias** — los evaluados pueden cargar soportes durante el período.
- **Carga masiva** de usuarios, compromisos, evaluaciones y cursos desde archivos.
- **Notificaciones en tiempo real** con sondeo cada 30 segundos y notificaciones por correo electrónico.
- **Auditoría completa** de todas las operaciones de creación, actualización y eliminación (CUD).
- **Eliminación suave (soft delete)** en todas las tablas operacionales.
- **Panel de control** con indicadores, gráficos y resúmenes por rol.
- **Generación de reportes** en PDF con escudo institucional.
- **Identidad visual institucional** (colores, tipografía, escudo).
- **Cabeceras de seguridad HTTP** (CSP, X-Frame-Options, HSTS, etc.).
- **Protección CSRF** y **limitación de tasa (rate limiting)**.

---

## 🏗️ Tecnologías

| Capa        | Tecnologías                                                                 |
|-------------|-----------------------------------------------------------------------------|
| **Frontend**  | TypeScript 5.8, React 19, React Router 7, TailwindCSS 3, Vite 6, sonner (toast notifications) |
| **Backend**   | PHP 8.2+, arquitectura MVC personalizada (Controller → Service → Repository), Firebase JWT, PHPMailer, Dompdf |
| **Base de datos** | MariaDB 10.6+ / MySQL 8.0+, charset utf8mb4_unicode_ci                    |
| **Arquitectura** | API REST stateless, SPA (Single Page Application) con autenticación JWT  |

---

## 📁 Estructura del proyecto

```
edl-carepa/
├── backend/                    # API REST en PHP
│   ├── public/                 # Punto de entrada (index.php, router.php)
│   ├── src/
│   │   ├── Config/             # Configuración (base de datos, cors, jwt)
│   │   ├── Controller/         # Controladores (Auth, Compromiso, Evaluacion, etc.)
│   │   ├── Helper/             # Utilidades (MailHelper, PdfHelper)
│   │   ├── Middleware/         # Middleware (Auth, CSRF, RateLimit, SecurityHeaders)
│   │   ├── Model/              # Modelos (Usuario, Compromiso, Evaluacion, etc.)
│   │   ├── Repository/         # Acceso a datos (BaseRepository, repositorios específicos)
│   │   ├── Router/             # Enrutador personalizado
│   │   └── Service/            # Lógica de negocio (Auth, Compromiso, Evaluacion, etc.)
│   ├── storage/                # Almacenamiento local (sesiones, caché)
│   ├── uploads/                # Archivos subidos por usuarios
│   ├── var/                    | Archivos temporales generados
│   ├── .env                    # Variables de entorno (producción)
│   ├── .env.example            # Plantilla de variables de entorno
│   └── composer.json           # Dependencias PHP
│
├── frontend/                   # SPA en React
│   ├── public/                 # Archivos públicos estáticos
│   ├── src/
│   │   ├── components/         # Componentes React reutilizables
│   │   │   ├── Layout/         # Layout, Sidebar
│   │   │   ├── Shared/         # AppHeader, NotificationBell
│   │   │   └── ui/             # Card, DataTable, Tabs
│   │   ├── contexts/           # Contextos de React (AuthContext)
│   │   ├── lib/                # Utilidades (auth.ts, api.ts, mensajesCNSC.ts)
│   │   ├── pages/              # Páginas/vistas por módulo
│   │   │   ├── Admin/          # Administración (usuarios, dependencias, configuración)
│   │   │   ├── Compromisos/    # Compromisos funcionales y comportamentales
│   │   │   ├── Concertaciones/ # Concertación de evaluaciones
│   │   │   ├── Evaluaciones/   # Evaluación, comisión evaluadora
│   │   │   ├── Evidencias/     # Carga y gestión de evidencias
│   │   │   └── ...             # Login, Dashboard, Perfil, Reportes, etc.
│   │   └── styles/             # Definiciones de colores institucionales
│   ├── dist/                   # Compilado de producción
│   ├── .env                    # Variables de entorno del frontend
│   ├── package.json            # Dependencias Node.js
│   ├── tailwind.config.js      # Configuración de TailwindCSS
│   ├── tsconfig.json           # Configuración de TypeScript
│   └── vite.config.ts          # Configuración de Vite
│
├── database/                   # Esquemas y migraciones SQL
│   ├── schema.sql              # Esquema completo de la base de datos
│   ├── seeds.sql               # Datos de prueba
│   ├── seed_usuarios.sql       # Usuarios de prueba
│   ├── migration_*.sql         # Migraciones incrementales
│
├── cnsc/                       # Documentación técnica CNSC
│   ├── 00-indice-maestro.md    # Índice maestro de documentación
│   ├── 16-glosario-cnsc.md     # Glosario de términos
│   ├── 17-endpoints-api.md     # Documentación de endpoints
│   ├── 18-arquitectura.md      # Documentación de arquitectura
│   └── AUDITORIA-DIRIGIDA-2026-06-22.md
│
├── docs/                       # Documentación general y recursos
│   ├── assets/                 # Recursos estáticos
│   ├── escudo.png              # Escudo institucional de Carepa
│   ├── 404.html                # Página 404 personalizada
│   └── index.html              # Página de inicio institucional
│
├── tests/                      # Pruebas automatizadas
│   ├── api_test.py             # Pruebas de API con pytest
│   ├── flow_test.py            # Pruebas de flujo completo
│   └── run_tests.php           # Script de ejecución de pruebas
│
├── assign_roles.py             # Script de asignación masiva de roles
├── migrate_usuarios.py         # Script de migración de usuarios
├── fijacion_methods.php        # Métodos de fijación unilateral
├── new_method.php              # Nuevos métodos del sistema
├── test_api.py                 # Pruebas de API adicionales
├── test_endpoints.sh           # Pruebas de endpoints en shell
├── FASE3_GAPS.md               # Brechas identificadas — Fase 3
└── README.md                   # Este archivo
```

---

## ⚙️ Requisitos del sistema

| Requisito          | Versión mínima |
|-------------------|----------------|
| PHP               | 8.2            |
| Composer          | 2.5            |
| Node.js           | 20 LTS         |
| npm               | 10             |
| MariaDB / MySQL   | 10.6 / 8.0     |
| Extensión PHP     | `pdo_mysql`, `mbstring`, `gd`, `xml`, `zip`, `openssl` |

---

## 🚀 Instalación

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

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env con los valores correctos
nano .env
```

Variables de entorno principales:

| Variable                | Descripción                                   | Ejemplo                          |
|------------------------|-----------------------------------------------|----------------------------------|
| `DB_HOST`              | Host de la base de datos                      | `127.0.0.1`                      |
| `DB_NAME`              | Nombre de la base de datos                    | `edl_carepa`                     |
| `DB_USER`              | Usuario de la base de datos                   | `root`                           |
| `DB_PASS`              | Contraseña de la base de datos                |                                  |
| `JWT_SECRET`           | Secreto para firmar tokens JWT (≥ 32 caracteres) | `cambia_esto_por_un_secreto_seguro` |
| `MAIL_HOST`            | Servidor SMTP para correos                    | `smtp.gmail.com`                 |
| `MAIL_USER`            | Usuario SMTP                                  |                                  |
| `MAIL_PASS`            | Contraseña SMTP (app-password recomendada)    |                                  |

```bash
# Instalar dependencias de PHP
composer install

# Iniciar servidor de desarrollo
php -S localhost:8000 -t public/
```

### 4. Configurar el frontend

```bash
cd frontend

# Instalar dependencias de Node.js
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend se abrirá en `http://localhost:5173` y se comunicará con el backend en `http://localhost:8000`.

### 5. Usuarios de prueba

| Usuario      | Contraseña  | Rol               |
|-------------|-------------|-------------------|
| `admin`     | `Admin123!` | Administrador     |
| `evaluador` | `Eval123!`  | Evaluador         |
| `evaluado`  | `Eval123!`  | Evaluado          |

---

## 🔧 Uso

### Roles del sistema

1. **Administrador**: gestión de usuarios, dependencias, períodos, parámetros del sistema, notificaciones y configuración general.
2. **Evaluador (jefe)**: concertación y fijación de compromisos, evaluación de funcionarios, seguimiento de evidencias, calificaciones.
3. **Evaluado (funcionario)**: propuesta de compromisos, carga de evidencias, consulta de evaluaciones y retroalimentación.

### Flujo de trabajo típico

1. **Configuración inicial**: el administrador crea entidades, dependencias, períodos de evaluación y usuarios con sus roles.
2. **Concertación de compromisos**: evaluador y evaluado acuerdan compromisos funcionales (metas) y comportamentales (competencias) con pesos porcentuales.
3. **Seguimiento**: durante el período, el evaluado carga evidencias de cumplimiento.
4. **Evaluación parcial/definitiva**: el evaluador califica los compromisos; la comisión evaluadora aprueba las calificaciones.
5. **Retroalimentación**: el evaluado recibe los resultados y puede registrar comentarios.
6. **Reportes**: generación de reportes en PDF con el escudo institucional.

---

## 🧪 Pruebas

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

## 🛠️ Comandos útiles

```bash
# Construir frontend para producción
cd frontend && npm run build

# Vista previa de la compilación de producción
cd frontend && npm run preview

# Iniciar backend con puerto personalizado
php -S 0.0.0.0:8080 -t backend/public/

# Resetear contraseña de administrador
php backend/reset_admin.php
```

---

## 🤝 Contribución

1. Haz un fork del repositorio.
2. Crea una rama para tu característica (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -m 'feat: añade nueva funcionalidad'`).
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

Por favor, asegúrate de que las pruebas existentes sigan pasando y añade pruebas para las nuevas funcionalidades.

---

## 📄 Licencia

Este proyecto es de carácter institucional para la **Alcaldía de Carepa, Antioquia**. Todos los derechos reservados.

---

## 👤 Autor

**CostSquare99109**

---

## 📞 Soporte

Para reportar problemas o solicitar ayuda, abre un issue en el repositorio de GitHub.

---

<p align="center">
  <sub>Hecho con ❤️ para los servidores públicos de Carepa, Antioquia, Colombia 🇨🇴</sub>
</p>
