# 🚀 DakExport API (Backend)

The backend subsystem for DakExport is a high-performance REST API built with **Laravel 11**. It handles business logic, security, data persistence, and external service integrations.

## 🗝 Key Features
- **Sanctum Auth**: Secure token-based authentication with role-based middleware.
- **Service-Repository Pattern**: Clean separation of concerns for scalable business logic.
- **Multi-Database Support**: PostgreSQL for relational data and MongoDB for high-volume logs.
- **Fraud Engine**: Integrated rules engine for scoring export requests.
- **Supabase Integration**: Handles document storage (PDFs) and optional Postgres fallback.

## 🛠 Tech Stack Details
- **Framework**: Laravel 11.x
- **PHP Version**: 8.2+
- **Primary DB**: PostgreSQL / SQLite
- **Secondary DB**: MongoDB Atlas
- **Caching**: Redis
- **Testing**: PHPUnit / Pest

## 🏗 Directory Overview
- `app/Http/Controllers/Api/V1`: Versioned API controllers.
- `app/Services`: Business logic implementation (Pricing, Fraud, Notifications).
- `app/Repositories`: Data access layer abstraction.
- `database/migrations`: Relational schema definitions.
- `routes/api.php`: Versioned API endpoints (Customer, Agent, Admin, Ops).

## 🚀 Local Development

1. **Install dependencies**
   ```bash
   composer install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Update your DB_CONNECTION and MONGODB_URI
   ```

3. **Initialize Database**
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   ```

4. **Run Server**
   ```bash
   php artisan serve
   ```

## 📡 API Versioning
All API endpoints are prefixed with `/api/v1/`.
- `/v1/public`: Open endpoints (Tracking, Pricing).
- `/v1/auth`: Security & Session management.
- `/v1/customer`: Export requests & Documents.
- `/v1/agent`: Task management for delivery personnel.
- `/v1/admin`: System-wide oversight.

## 🧪 Testing
Run the test suite via PHPUnit:
```bash
php artisan test
```
