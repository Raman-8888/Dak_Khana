# DakExport Architecture

## Tech Stack
- **Backend:** Laravel 11 (PHP 8.2+)
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** PostgreSQL (via Docker)
- **Real-time:** Laravel Reverb / SSE (Future implementation)
- **Storage:** S3 / Supabase Storage wrapper

## Pattern
- **Repository Pattern:** Used for data access abstraction (`app/Repositories`).
- **Service Layer:** Houses core business logic (`app/Services`).
- **API Versioning:** All routes under `v1/`.

## Key Services
- `FraudDetectionService`: Handles rules and scoring for export requests.
- `PricingService`: Calculates costs based on zones and weights.
- `TrackingService`: Manages shipment logs and status updates.
