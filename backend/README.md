# Exn-Hr Backend API

GoLang + Gin REST API for the Exn-Hr HR Management System.

## Setup

1. Install Go 1.22+: https://go.dev/dl/
2. Install PostgreSQL
3. Copy `.env.example` to `.env` and update values
4. Run: `go mod tidy`
5. Run: `go run cmd/server/main.go`
6. API available at: http://localhost:8080

## Project Structure

```
backend/
├── cmd/server/main.go       # Entry point, routes, DI wiring
├── internal/
│   ├── config/              # Database & env config
│   ├── middleware/           # Auth JWT, RBAC role check
│   ├── models/              # GORM models (DB tables)
│   ├── dto/                 # Request/Response structs
│   ├── handlers/            # HTTP handlers (controllers)
│   ├── services/            # Business logic
│   └── repositories/        # Database queries
├── pkg/utils/               # JWT, password helpers
├── migrations/              # SQL migrations (future)
└── go.mod
```

## Flow: Request → Handler → Service → Repository → DB

## Default Admin
- Email: admin@exn.vn
- Password: admin123

## API Endpoints (Sprint 1)
- `POST /api/v1/auth/login` — Login with email/password
- `GET /api/v1/auth/me` — Get current user (requires JWT)
- `GET /health` — Health check
