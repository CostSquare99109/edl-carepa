# EDL Carepa

Sistema de Evaluacion del Desempeno Laboral para la Alcaldia de Carepa, Antioquia, Colombia. Plataforma web que gestiona el ciclo completo de evaluacion de servidores publicos: concertacion de compromisos funcionales y comportamentales, seguimiento mediante evidencias, calificacion parcial y definitiva, aprobacion por comision evaluadora, y retroalimentacion.

## Features

- JWT authentication with automatic lockout after failed attempts and password recovery via email
- Granular access control: 3 base roles, 51 permissions, 84 role-permission assignments
- Functional and behavioral commitment negotiation with percentage weights (max 100% per evaluation)
- Partial (semester/eventual) and final evaluations with evaluation commission approval
- Bulk upload of users, commitments, evaluations, and courses from files
- Real-time notifications with 30-second polling
- Full audit trail of all CUD operations
- Institutional visual identity (colors, typography, coat of arms)
- Global soft delete across all operational tables
- HTTP security headers (CSP, X-Frame-Options, HSTS, etc.)

## Tech Stack

- **Frontend:** TypeScript 5.8, React 19, TailwindCSS 3, Vite 6
- **Backend:** PHP 8.2+, custom MVC framework (Controller-Service-Repository), Firebase JWT, PHPMailer
- **Database:** MariaDB 10.6+ / MySQL 8.0+
- **Architecture:** REST API, three-layer backend, SPA frontend

## Installation

```bash
# Clone the repository
git clone https://github.com/CostSquare99109/edl-carepa.git
cd edl-carepa

# Database setup
mysql -u root -p < database/schema.sql
mysql -u root -p edl_carepa < database/seeds.sql
mysql -u root -p edl_carepa < database/migration_edl_carepa.sql

# Backend setup
cd backend
cp .env.example .env
composer install
php -S localhost:8000 -t public/

# Frontend setup
cd ../frontend
npm install
npm run dev
```

## Author

CostSquare99109
