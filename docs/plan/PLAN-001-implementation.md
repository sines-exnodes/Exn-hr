# PLAN-001: Exn-Hr Implementation Plan

**Created**: 2026-03-18
**Author**: team-lead
**Seed**: SEED-001
**Requirement**: REQ-001-exn-hr.md
**Timeline**: 14-16 weeks (7-8 sprints x 2 weeks)
**Status**: Draft

---

## Architecture Overview

```
                    +-----------------+
                    |   PostgreSQL    |
                    +--------+--------+
                             |
                    +--------+--------+
                    | GoLang/Gin API  |
                    |  (Backend API)  |
                    +---+--------+----+
                        |        |
              +---------+        +---------+
              |                            |
     +--------+--------+       +-----------+---------+
     | NextJS Web Admin |       | Flutter Mobile App  |
     | (Admin/CEO/HR)   |       | (Employee/Leader)   |
     +------------------+       +---------------------+
```

**Three independent codebases communicating via REST API.**

| Component | Tech | Repository Path | Agent |
|-----------|------|-----------------|-------|
| Backend API | GoLang + Gin + GORM + PostgreSQL | `backend/` | backend-dev |
| Web Admin | NextJS + TypeScript + Tailwind | `web/` | web-dev |
| Mobile App | Flutter + Dart | `mobile/` | mobile-dev |

---

## Module Dependency Graph

```
Auth & RBAC (M1)
    |
    +---> Organization (M2) --- Department, Team, Employee
    |         |
    |         +---> Attendance (M3) --- check-in/out, GPS+WiFi
    |         |
    |         +---> Leave Management (M4) --- requests, balance, approval
    |         |
    |         +---> Overtime (M5) --- requests, approval
    |         |
    |         +---> Employee Profile (M6) --- CRUD, personal info
    |
    +---> Notifications (M7) --- push notifications (depends on M4, M5)
    |
    +---> Salary (M8) --- depends on M3, M4, M5, M6
    |
    +---> Reports & Dashboard (M9) --- depends on ALL above
```

**Critical Path**: M1 -> M2 -> M3/M4/M5 (parallel) -> M8 -> M9

---

## Sprint Plan

### Sprint 1 (Weeks 1-2): Foundation & Auth

**Goal**: Project scaffolding, database schema, authentication system.

| Task ID | Title | Agent | Dependencies | Done When |
|---------|-------|-------|-------------|-----------|
| T-001 | Scaffold GoLang/Gin project with GORM, JWT middleware, project structure | backend-dev | none | API server runs, health check endpoint works |
| T-002 | Scaffold NextJS project with TypeScript, Tailwind, auth context, layout | web-dev | none | Web app runs, login page renders |
| T-003 | Scaffold Flutter project with Dio, Provider/Riverpod, project structure | mobile-dev | none | App compiles, login screen renders |
| T-004 | Design and implement full PostgreSQL schema (all entities from REQ-001 Section 4) | backend-dev | T-001 | All tables created via GORM migration, relationships correct |
| T-005 | Implement Auth API: POST /auth/login, POST /auth/logout, JWT token generation, middleware | backend-dev | T-004 | Login/logout works, JWT validated on protected routes |
| T-006 | Implement RBAC: Role model, permission middleware, role-based route guards | backend-dev | T-005 | Routes protected by role, unauthorized access returns 403 |
| T-007 | Implement User management API: CRUD /users, activate/deactivate | backend-dev | T-006 | Admin can create/manage user accounts |
| T-008 | Web: Login page, auth context, JWT storage, protected route wrapper | web-dev | T-002 | User can log in, token persisted, redirect on unauthorized |
| T-009 | Mobile: Login screen, auth service, JWT secure storage, auto-logout | mobile-dev | T-003 | User can log in on mobile, token stored securely |

**Parallelization**: T-001, T-002, T-003 run in parallel (scaffolding). T-008/T-009 can start once their respective scaffolds are done and API contract for /auth/login is defined.

**Definition of Done**: All three platforms scaffold complete. User can log in via web and mobile. RBAC middleware functional on backend.

---

### Sprint 2 (Weeks 3-4): Organization Structure & Employee Management

**Goal**: Department/Team/Employee CRUD, org hierarchy, leader assignment.

| Task ID | Title | Agent | Dependencies | Done When |
|---------|-------|-------|-------------|-----------|
| T-010 | API: CRUD /departments, /teams (with leader assignment), /employees | backend-dev | T-007 | Full CRUD for org entities, team-leader constraint enforced |
| T-011 | API: Employee profile CRUD with team assignment, basic salary, insurance salary fields | backend-dev | T-010 | Employee linked to team, salary fields settable |
| T-012 | Web: Department & Team management pages (list, create, edit, delete, assign leader) | web-dev | T-008, T-010 | Admin can manage org structure via web |
| T-013 | Web: Employee management pages (list with search/filter, create, edit, view profile) | web-dev | T-008, T-011 | Admin can CRUD employees, assign to teams |
| T-014 | Mobile: Employee profile screen (view + edit personal info) | mobile-dev | T-009, T-011 | Employee can view/update own profile on mobile |

**Parallelization**: T-010/T-011 sequential on backend. T-012/T-013 can start as soon as API contracts are defined (mock data until API ready). T-014 starts after mobile auth + employee API.

**Definition of Done**: Full org structure manageable via web. Employee profiles editable. Leader assignment works with 1-leader-per-team constraint.

---

### Sprint 3 (Weeks 5-6): Attendance Module

**Goal**: Attendance check-in/out with GPS+WiFi verification, office config, attendance history.

| Task ID | Title | Agent | Dependencies | Done When |
|---------|-------|-------|-------------|-----------|
| T-015 | API: Office location config CRUD (/office-locations, /approved-wifi) | backend-dev | T-007 | Admin can configure GPS coordinates + WiFi list |
| T-016 | API: Attendance check-in/out (/attendance) with GPS+WiFi validation logic | backend-dev | T-015, T-011 | Check-in validates GPS range + WiFi SSID, records timestamp |
| T-017 | API: Attendance history/report endpoints (filter by date, team, employee) | backend-dev | T-016 | Attendance records queryable with filters |
| T-018 | Web: Office location configuration page (set GPS, WiFi list) | web-dev | T-012, T-015 | Admin can configure office location and WiFi |
| T-019 | Web: Attendance management page (view attendance table, filters by month/team/employee) | web-dev | T-013, T-017 | HR/Admin can view and filter attendance records |
| T-020 | Mobile: Check-in/out screen with real-time GPS status + WiFi detection | mobile-dev | T-014, T-016 | Employee can check in/out, GPS+WiFi verified |
| T-021 | Mobile: Attendance history screen (personal attendance records) | mobile-dev | T-020 | Employee can view own attendance history |

**Parallelization**: T-015 -> T-016 -> T-017 sequential on backend. Web and mobile can develop UI in parallel using API contracts.

**Definition of Done**: Employee can check in/out on mobile with GPS+WiFi verification. Admin configures office location. HR views attendance reports on web.

---

### Sprint 4 (Weeks 7-8): Leave Management Module

**Goal**: Leave requests with 2-level approval, leave balance, paid/unpaid logic.

| Task ID | Title | Agent | Dependencies | Done When |
|---------|-------|-------|-------------|-----------|
| T-022 | API: Leave balance management (/leave-balance) — init 12 days/year, track usage | backend-dev | T-011 | Leave balance auto-created per employee per year |
| T-023 | API: Leave request CRUD (/leave-requests) with auto paid/unpaid categorization | backend-dev | T-022 | Requests auto-categorized based on remaining balance |
| T-024 | API: Leave approval workflow — Leader L1, HR L2, status transitions | backend-dev | T-023 | 2-level approval works, status tracked per level |
| T-025 | API: HR convert unpaid->paid leave, yearly balance reset (cron/manual) | backend-dev | T-024 | HR can convert leave type, yearly reset works |
| T-026 | Web: Leave management page (list requests, filter by status, HR approve L2) | web-dev | T-019, T-024 | HR can view all leave requests, approve/reject L2 |
| T-027 | Web: Leave balance overview (all employees, remaining days) | web-dev | T-026, T-022 | HR sees leave balance for all employees |
| T-028 | Mobile: Leave request form (auto-show paid/unpaid, select dates, reason) | mobile-dev | T-021, T-023 | Employee can submit leave request |
| T-029 | Mobile: Leave request list with status tracking (pending/approved/rejected) | mobile-dev | T-028 | Employee sees own leave requests and statuses |
| T-030 | Mobile: Leave balance display on leave screen | mobile-dev | T-029, T-022 | Employee sees remaining leave days |
| T-031 | Mobile: Leader approval screen — approve/reject team leave requests (L1) | mobile-dev | T-030, T-024 | Leader can approve/reject from mobile |

**Parallelization**: Backend T-022->T-023->T-024->T-025 sequential. Web and mobile develop in parallel once API contracts defined.

**Definition of Done**: Full leave workflow functional. Employee submits on mobile, Leader approves L1 on mobile, HR approves L2 on web. Balance tracking works.

---

### Sprint 5 (Weeks 9-10): Overtime Module & Allowances

**Goal**: OT requests with 2-level approval, allowance management, bonus/advance tracking.

| Task ID | Title | Agent | Dependencies | Done When |
|---------|-------|-------|-------------|-----------|
| T-032 | API: OT request CRUD (/ot-requests) with date, hours, reason | backend-dev | T-011 | OT requests created with proper validation |
| T-033 | API: OT approval workflow — Leader L1, CEO L2, status transitions | backend-dev | T-032 | 2-level OT approval works, only CEO-approved counted for salary |
| T-034 | API: Allowance CRUD (/allowances) — custom name+amount, assign to employees | backend-dev | T-011 | Admin creates custom allowances, assigns to employees |
| T-035 | API: Bonus CRUD (/bonuses) — KPI, project, commission types | backend-dev | T-011 | Bonuses recorded per employee per month |
| T-036 | API: Salary advance CRUD (/salary-advances) | backend-dev | T-011 | Salary advances recorded and tracked |
| T-037 | Web: OT management page (list requests, filter, CEO approve L2) | web-dev | T-026, T-033 | CEO can view and approve OT requests on web |
| T-038 | Web: Allowance management page (create/edit/delete allowances, assign to employees) | web-dev | T-013, T-034 | Admin manages custom allowances via web |
| T-039 | Web: Bonus and salary advance management pages | web-dev | T-013, T-035, T-036 | Admin records bonuses and advances |
| T-040 | Mobile: OT request form and list with status tracking | mobile-dev | T-031, T-032 | Employee submits OT, sees status |
| T-041 | Mobile: Leader OT approval screen (L1) | mobile-dev | T-040, T-033 | Leader approves/rejects OT from mobile |

**Parallelization**: T-032/T-033 sequential. T-034, T-035, T-036 independent, can run in parallel. Web and mobile work in parallel.

**Definition of Done**: Full OT workflow functional. Allowances configurable. Bonuses/advances tracked. CEO approves OT on web, Leader on mobile.

---

### Sprint 6 (Weeks 11-12): Salary Calculation & Payslip

**Goal**: Monthly salary calculation engine, payslip generation, salary management.

| Task ID | Title | Agent | Dependencies | Done When |
|---------|-------|-------|-------------|-----------|
| T-042 | API: Salary calculation engine — compute net salary for all employees for a month | backend-dev | T-017, T-025, T-033, T-034, T-035, T-036 | Salary = basic + allowances + OT(x1.5) + bonuses - advances - BHXH(8%) - BHYT(1.5%) - BHTN(1%) |
| T-043 | API: Salary record storage and payslip endpoints (/salary) | backend-dev | T-042 | Calculated salary stored, individual payslip retrievable |
| T-044 | API: Batch salary calculation endpoint (calculate for all employees at once) | backend-dev | T-043 | HR triggers batch calculation for entire company |
| T-045 | Web: Salary configuration page (set basic salary, insurance salary per employee) | web-dev | T-038, T-011 | Admin configures salary components per employee |
| T-046 | Web: Monthly payroll calculation page (trigger batch calc, review results) | web-dev | T-045, T-044 | HR runs payroll calculation, reviews salary table |
| T-047 | Web: Payroll summary table (all employees, all components, totals) | web-dev | T-046 | Complete payroll overview with itemized breakdown |
| T-048 | Mobile: Payslip screen (view monthly salary breakdown, all components) | mobile-dev | T-041, T-043 | Employee views itemized payslip on mobile |

**Parallelization**: Backend T-042->T-043->T-044 sequential (core calculation). Web salary config (T-045) can start early. Mobile payslip (T-048) once API ready.

**Definition of Done**: Salary formula correctly calculates net salary. HR can run batch payroll. Employees view payslips on mobile. All components (basic, allowances, OT, bonuses, deductions) itemized.

---

### Sprint 7 (Weeks 13-14): Reports, Dashboard & Notifications

**Goal**: All report types, dashboard metrics, push notifications.

| Task ID | Title | Agent | Dependencies | Done When |
|---------|-------|-------|-------------|-----------|
| T-049 | API: Report endpoints — payroll summary, attendance, leave, employee list | backend-dev | T-044, T-017, T-025 | Report data endpoints return filtered, aggregated data |
| T-050 | API: D02-TS social insurance report generation | backend-dev | T-049 | D02-TS format data generated per Vietnamese regulation |
| T-051 | API: OT report, HR movement report endpoints | backend-dev | T-049 | OT and movement data available for reporting |
| T-052 | API: Dashboard metrics endpoint (/dashboard) — headcount, attendance rate, leave util, OT hours | backend-dev | T-049 | Dashboard data aggregated and returned |
| T-053 | API: Notification service — create, list, mark-as-read (/notifications) | backend-dev | T-006 | Notifications created on approval events, retrievable |
| T-054 | API: FCM push notification integration | backend-dev | T-053 | Push notifications sent to mobile devices |
| T-055 | Web: Dashboard page with key metrics, charts, recent activities | web-dev | T-047, T-052 | Dashboard displays headcount, attendance, leave, OT metrics |
| T-056 | Web: Report pages — payroll, attendance, leave, employee list, D02-TS, OT, HR movement | web-dev | T-055, T-049, T-050, T-051 | All reports viewable and filterable |
| T-057 | Web: Report export (PDF/Excel) | web-dev | T-056 | Reports exportable to PDF and Excel |
| T-058 | Web: Notification center (list, badge count, mark as read) | web-dev | T-055, T-053 | Notification bell with unread count, notification list |
| T-059 | Mobile: Notification list screen + push notification handling | mobile-dev | T-048, T-054 | Employee receives push notifications, views in-app list |
| T-060 | Mobile: Home screen with quick actions, today's status, pending count | mobile-dev | T-059, T-052 | Home screen shows check-in status, pending requests |

**Parallelization**: Backend reports (T-049-T-052) can partially parallelize. Notifications (T-053/T-054) independent track. Web and mobile consume APIs in parallel.

**Definition of Done**: All 7+ report types functional. Dashboard shows live metrics. Push notifications work end-to-end. Export to PDF/Excel works.

---

### Sprint 8 (Weeks 15-16): Integration Testing, Polish & Hardening

**Goal**: End-to-end testing, bug fixes, performance, UI polish, deployment preparation.

| Task ID | Title | Agent | Dependencies | Done When |
|---------|-------|-------|-------------|-----------|
| T-061 | Backend: API integration tests — auth, RBAC, all CRUD operations | backend-dev | T-054 | All API endpoints tested with positive and negative cases |
| T-062 | Backend: Salary calculation unit tests — all formula combinations | backend-dev | T-061 | Salary formula verified with edge cases (0 OT, no allowances, etc.) |
| T-063 | Backend: Leave/OT approval workflow integration tests | backend-dev | T-062 | Full approval flow tested end-to-end |
| T-064 | Backend: Yearly leave balance reset job | backend-dev | T-063 | Cron job resets balances Jan 1, verified with tests |
| T-065 | Web: End-to-end testing of all management flows | web-dev | T-058 | All web pages functional, no broken flows |
| T-066 | Web: UI polish, responsive design, error handling, loading states | web-dev | T-065 | Polished UI with proper error/loading states |
| T-067 | Mobile: End-to-end testing of all employee/leader flows | mobile-dev | T-060 | All mobile screens functional, no broken flows |
| T-068 | Mobile: UI polish, error handling, offline graceful degradation | mobile-dev | T-067 | Polished mobile UX |
| T-069 | Backend: API documentation (Swagger/OpenAPI) | backend-dev | T-064 | All endpoints documented |
| T-070 | Deployment: Docker setup, environment configs, deployment scripts | backend-dev | T-069 | All services containerized and deployable |

**Definition of Done**: All critical flows tested end-to-end. No P0/P1 bugs. Deployment-ready.

---

## Summary Timeline

| Sprint | Weeks | Focus | Key Deliverables |
|--------|-------|-------|-----------------|
| S1 | 1-2 | Foundation & Auth | Scaffolding, DB schema, login, RBAC |
| S2 | 3-4 | Organization & Employees | Dept/Team/Employee CRUD, org hierarchy |
| S3 | 5-6 | Attendance | GPS+WiFi check-in, office config, history |
| S4 | 7-8 | Leave Management | Leave requests, 2-level approval, balance |
| S5 | 9-10 | Overtime & Allowances | OT requests, custom allowances, bonuses |
| S6 | 11-12 | Salary & Payslip | Salary engine, batch calc, payslip |
| S7 | 13-14 | Reports & Notifications | All reports, dashboard, push notifications |
| S8 | 15-16 | Testing & Polish | Integration tests, UI polish, deployment |

---

## Agent Workload Distribution

| Agent | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 |
|-------|----|----|----|----|----|----|----|----|
| backend-dev | Scaffold, DB, Auth, RBAC, Users | Org CRUD, Employee CRUD | Office config, Attendance API | Leave balance, requests, approval | OT API, Allowances, Bonuses, Advances | Salary engine, batch calc | Reports, Dashboard, Notifications, FCM | Tests, cron job, docs, Docker |
| web-dev | Scaffold, Login page | Dept/Team pages, Employee pages | Office config page, Attendance page | Leave mgmt, balance overview | OT mgmt, Allowance mgmt, Bonus pages | Salary config, Payroll calc, Summary | Dashboard, Reports, Export, Notifications | E2E testing, UI polish |
| mobile-dev | Scaffold, Login screen | Profile screen | Check-in/out, History | Leave request/list/balance, Leader approval | OT request/list, Leader OT approval | Payslip screen | Notifications, Home screen | E2E testing, UI polish |

---

## Risk Mitigation

| Risk | Mitigation | Sprint Impact |
|------|-----------|---------------|
| Salary formula bugs | Extensive unit tests in S6, reconciliation test data | S6, S8 |
| GPS spoofing | WiFi dual-verification mandatory, log all verification data | S3 |
| D02-TS format unclear | Research Vietnamese regulation early in S7, template-based generation | S7 |
| API contract drift | Define contracts before each sprint, shared type definitions | All |
| Sprint overrun | S8 is buffer sprint — can absorb 2 weeks of overrun from earlier sprints | S8 |

---

## API Contract Strategy

Since this project has a separate GoLang backend (not NextJS API routes), the contract sync approach is:

1. **Before each sprint**: team-lead defines API contracts (request/response shapes) in a shared specification
2. **Backend-dev** implements the GoLang/Gin endpoints matching the contract
3. **Web-dev** and **mobile-dev** consume the API using the defined contracts
4. **During development**: frontend teams can use mock data matching contracts while backend builds real endpoints
5. **Contract documentation**: Maintained in Apidog or equivalent, with TypeScript types for web and Dart models for mobile

---

## Key Architectural Decisions

1. **Separate codebases**: Backend (Go), Web (NextJS), Mobile (Flutter) — not a monorepo NextJS fullstack
2. **JWT authentication**: Stateless tokens, refresh token rotation
3. **GORM for ORM**: Go's standard ORM for PostgreSQL
4. **Batch salary calculation**: Not real-time — HR triggers monthly calculation
5. **Insurance deduction rates**: Hardcoded per Vietnamese law (BHXH 8%, BHYT 1.5%, BHTN 1% employee portion)
6. **Vietnamese language only**: All UI in Vietnamese for MVP
7. **No TNCN**: Personal income tax explicitly excluded from salary calculation
8. **Fixed OT multiplier**: 1.5x regardless of day type — simplifies calculation significantly

---

## Task Count Summary

| Sprint | Backend | Web | Mobile | Total |
|--------|---------|-----|--------|-------|
| S1 | 7 | 2 | 2 | 11 |
| S2 | 2 | 2 | 1 | 5 |
| S3 | 3 | 2 | 2 | 7 |
| S4 | 4 | 2 | 4 | 10 |
| S5 | 5 | 3 | 2 | 10 |
| S6 | 3 | 3 | 1 | 7 |
| S7 | 6 | 4 | 2 | 12 |
| S8 | 4 | 2 | 2 | 8 |
| **Total** | **34** | **20** | **16** | **70** |
