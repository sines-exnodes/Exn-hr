# Exn-Hr — Internal HR Management System

Internal HR management system for small companies (<50 employees). Handles employee management, attendance tracking, leave & overtime approvals, payroll calculation, and reporting.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Go 1.23 + Gin + GORM + PostgreSQL |
| **Web Admin** | NextJS 15 + TypeScript + Tailwind CSS |
| **Mobile App** | Flutter + Dart (Clean Architecture) |
| **Database** | PostgreSQL 16 (Docker) |
| **Design** | Pencil (.pen) — 28 screens, 2 themes |

## Monorepo Structure

```
exn-hr/
├── backend/           # Go/Gin REST API (port 8080)
│   ├── cmd/server/    # Entry point + seeder
│   ├── internal/
│   │   ├── config/    # Environment config
│   │   ├── dto/       # Request/Response DTOs
│   │   ├── handlers/  # HTTP handlers (controllers)
│   │   ├── middleware/ # Auth + RBAC
│   │   ├── models/    # GORM models
│   │   ├── repositories/ # Database operations
│   │   └── services/  # Business logic
│   └── pkg/utils/     # JWT, password hashing
├── web/               # NextJS web admin (port 3000)
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/ # UI + Layout components
│       ├── hooks/     # Custom React hooks
│       ├── lib/       # API client, auth, utils
│       └── types/     # TypeScript interfaces
├── mobile/            # Flutter mobile app
│   └── lib/
│       ├── config/    # DI setup
│       ├── core/      # Network, routing, themes, storage
│       ├── features/  # Clean Architecture per feature
│       └── shared/    # Shared widgets + entities
├── docs/              # API docs, requirements
├── pencil-new.pen     # UI design file (28 screens)
└── docker-compose.yml # PostgreSQL database
```

## Quick Start

### Prerequisites
- [Go 1.22+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/)
- [Flutter 3.16+](https://flutter.dev/)
- [Docker](https://www.docker.com/)

### 1. Start Database

```bash
docker compose up -d
```

### 2. Run Backend

```bash
cd backend
cp .env.example .env
go run cmd/server/main.go
```

API available at `http://localhost:8080/api/v1`

Default admin account is auto-seeded on first boot.

### 3. Run Web Admin

```bash
cd web
npm install
npm run dev
```

Web admin at `http://localhost:3000`

### 4. Run Mobile App

```bash
cd mobile
flutter pub get
flutter run
```

## Roles & Access

| Role | Platform | Permissions |
|------|----------|-------------|
| **Admin** | Web | Full system access, manage employees, config |
| **CEO** | Web | Dashboard, approve OT (step 2), reports |
| **HR** | Web + App | Approve leave (step 2), payroll, reports |
| **Leader** | App | Approve leave & OT (step 1), team view |
| **Employee** | App | Check-in, request leave/OT, view payslip |

## Key Features

### Attendance
- GPS location + WiFi SSID verification
- Check-in/check-out tracking
- Weekly/monthly history with status badges

### Leave Management
- 12 days/year per employee (no carry-over)
- 2-level approval: Employee → Leader → HR
- Paid leave / Unpaid leave / Convert unpaid → paid

### Overtime (OT)
- Fixed rate x1.5
- 2-level approval: Employee → Leader → CEO
- Auto-calculated in payroll

### Payroll
- Formula: `Base Salary + Allowances + OT + Bonus - Insurance - Advances`
- Insurance deductions on `insurance_salary`:
  - BHXH: 8%
  - BHYT: 1.5%
  - BHTN: 1%
- No TNCN (personal income tax) calculation
- Custom allowance types (admin creates freely)

### Organization
- Departments with multiple teams
- Team leaders assignment
- Employee assignment to teams

## API Overview

Base URL: `http://localhost:8080/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| GET | `/me` | Current user profile |
| GET/POST | `/departments` | Departments CRUD |
| GET/POST | `/teams` | Teams CRUD |
| GET/POST | `/employees` | Employees CRUD |
| POST | `/attendance/check-in` | Check-in with GPS+WiFi |
| POST | `/attendance/check-out` | Check-out |
| GET/POST | `/leave` | Leave requests |
| PUT | `/leave/:id/approve` | Approve/reject leave |
| GET/POST | `/overtime` | OT requests |
| PUT | `/overtime/:id/approve` | Approve/reject OT |
| POST | `/salary/run` | Run monthly payroll |
| GET | `/salary/payslips` | Get payslips |
| GET | `/notifications` | User notifications |

All protected endpoints require `Authorization: Bearer <jwt_token>`.

## Environment Variables

```env
# Server
PORT=8080
GIN_MODE=debug

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=exnhr
DB_PASSWORD=exnhr_secret
DB_NAME=exn_hr
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY_HOURS=24
```

## Design

Design file: `pencil-new.pen` (open with [Pencil](https://pencil.elpass.com/))

- **28 screens** (14 web + 12 mobile + 2 design system)
- **13 reusable components** (buttons, inputs, badges, nav items)
- **2 themes**: Green (default) + Dark Blue
- Fonts: Space Grotesk (headings) + Inter (body)

## License

Private — Internal use only.
