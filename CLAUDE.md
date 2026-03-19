# Exn-Hr — Internal HR Management System

## Project Overview
Internal HR management system for a small company (<50 employees).
- **Backend**: GoLang + Gin + GORM + PostgreSQL
- **Web Admin**: NextJS + TypeScript + Tailwind CSS
- **Mobile App**: Flutter + Dart (Ennam Flutter Base architecture)

## Monorepo Structure
```
exn-hr/
├── backend/          # Go/Gin REST API
├── web/              # NextJS web admin (Admin, CEO, HR)
├── mobile/           # Flutter mobile app (Employee, Leader)
├── docs/             # Requirements, plans, design specs
├── design/           # .pen design files
└── shared/           # Shared API contracts (TypeScript types)
```

## Tech Stack Details

### Backend (Go/Gin) — `backend/`
- **Framework**: Gin
- **ORM**: GORM
- **Database**: PostgreSQL
- **Auth**: JWT (access token)
- **Architecture**: Flat & simple — handlers → services → repositories → models
- **Port**: 8080

### Web Admin (NextJS) — `web/`
- **Framework**: NextJS 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React hooks + SWR for data fetching
- **Port**: 3000

### Mobile App (Flutter) — `mobile/`
- **Framework**: Flutter
- **Architecture**: Clean Architecture (UI → Domain ← Data)
- **State Management**: Cubit (flutter_bloc)
- **DI**: GetIt
- **Routing**: GoRouter
- **Networking**: Dio + CachedApiExecutor
- **MUST follow**: ARCHITECTURE.md patterns exactly

## Coding Conventions

### Go Backend
- Use standard Go project layout
- Handler functions: `func (h *Handler) GetEmployees(c *gin.Context)`
- Service layer for business logic, repository layer for DB
- Error responses: `{"error": "message", "code": "ERROR_CODE"}`
- Use environment variables for config (.env)
- GORM auto-migration for development

### NextJS Web
- App Router with file-based routing
- Server components by default, "use client" only when needed
- API calls via SWR hooks
- Tailwind for all styling
- Components in `src/components/`, pages in `src/app/`

### Flutter Mobile
- Follow ARCHITECTURE.md strictly
- Clean Architecture: data/domain/ui per feature
- Freezed for models, Either for error handling
- GetIt for DI, GoRouter for navigation
- Cubit + immutable state with Equatable

## API Design
- RESTful JSON API
- Base URL: `http://localhost:8080/api/v1`
- Auth: `Authorization: Bearer <jwt_token>`
- Pagination: `?page=1&size=10`
- Response format:
```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

## Roles (5)
Admin, CEO, HR, Leader, Employee

## Key Business Rules
- Leave: 12 days/year, no carry-over, 2-level approval (Leader → HR)
- OT: fixed x1.5, 2-level approval (Leader → CEO)
- Attendance: GPS + WiFi verification
- Insurance salary: admin manual input per employee
- Allowances: admin creates custom types freely
- No TNCN calculation in system

## Git Conventions
- Branch: `feature/<module>-<description>`, `fix/<description>`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- PR required for main branch
