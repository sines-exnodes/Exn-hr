# Exn-Hr Screen Inventory

**Status**: Draft
**Created**: 2026-03-18
**Reference**: `docs/requirements/REQ-001-exn-hr.md`
**Total Screens**: 48 (Web: 24, Mobile: 24)

---

## Overview

This document catalogs every screen in the Exn-Hr system across both platforms.
Screens are grouped by functional module with platform, target roles, and key UI elements listed.

### Platform Legend

| Platform | Technology | Target Roles |
|----------|-----------|--------------|
| **Web** | NextJS | Admin, CEO, HR |
| **Mobile** | Flutter | Employee, Leader (+ HR as employee) |

### Role Legend

| Code | Role | Platforms |
|------|------|-----------|
| **A** | Admin | Web |
| **C** | CEO | Web, Mobile |
| **H** | HR | Web (management), Mobile (as employee) |
| **L** | Leader | Mobile |
| **E** | Employee | Mobile |

---

## 1. Authentication

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 1.1 | Web Login | Web | Email + password login for admin portal | Email input, password input, "Forgot password?" link, login button, app logo | A, C, H |
| 1.2 | Mobile Login | Mobile | Email + password login for mobile app | Email input, password input, "Forgot password?" link, login button, app logo | E, L, H |
| 1.3 | Forgot Password - Request | Web + Mobile | Enter email to receive reset link | Email input, submit button, back to login link | All |
| 1.4 | Reset Password | Web + Mobile | Set new password from reset link | New password input, confirm password input, submit button, password strength indicator | All |

**Total: 4 screens**

---

## 2. Dashboard & Home

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 2.1 | Web Dashboard | Web | HR metrics overview with key indicators | Headcount card, attendance rate card, leave utilization card, OT summary card, recent activities list, quick action buttons | A, C, H |
| 2.2 | Mobile Home | Mobile | Employee daily hub with quick actions | Check-in/out button (large CTA), today's attendance status, pending requests count badges, greeting with employee name, quick navigation cards (Leave, OT, Payslip) | E, L, H |

**Total: 2 screens**

---

## 3. Organization Management (Web only)

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 3.1 | Department List | Web | View and manage all departments | Data table (name, description, team count, employee count), search bar, "Add Department" button, edit/delete actions per row | A, H |
| 3.2 | Department Form | Web | Create or edit a department (modal or side panel) | Name input, description textarea, save/cancel buttons | A, H |
| 3.3 | Team List | Web | View and manage all teams | Data table (name, department, leader name, member count), filter by department, "Add Team" button, edit/delete actions | A, H |
| 3.4 | Team Form | Web | Create or edit a team | Name input, department dropdown, leader select (employee search), save/cancel buttons | A, H |
| 3.5 | Team Detail | Web | View team members and manage assignments | Team info header (name, department, leader), member list table, "Add Member" button, remove member action, member search/filter | A, H |

**Total: 5 screens**

---

## 4. Employee Management

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 4.1 | Employee List | Web | Browse and search all employees | Data table (name, email, team, position, status), search bar, filters (team, status, department), "Add Employee" button, row click to detail, pagination | A, H |
| 4.2 | Employee Create Form | Web | Add a new employee with full profile | Multi-section form: personal info (name, email, phone, DOB, gender, address), work info (team, position, join date), salary config (basic salary, insurance salary), account creation (auto-generates login), save/cancel | A, H |
| 4.3 | Employee Detail / Edit | Web | View and edit complete employee profile | Tabbed layout: Profile tab (personal + work info), Salary tab (basic salary, insurance salary, allowances list, bonuses), Attendance tab (recent records summary), Leave tab (balance + recent requests). Edit mode toggle. | A, H |
| 4.4 | Employee Allowance Assignment | Web | Manage allowances assigned to an employee (sub-view of Employee Detail) | Assigned allowances list with amounts, "Add Allowance" button, allowance select dropdown, amount input, remove action | A, H |

**Total: 4 screens**

---

## 5. Attendance

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 5.1 | Check-in/out | Mobile | GPS + WiFi verified attendance recording | Large check-in/out button, GPS status indicator (in range / out of range), WiFi status indicator (connected to approved network / not connected), current time display, today's check-in time (if already checked in) | E, L, H |
| 5.2 | Attendance History | Mobile | Personal attendance log | Monthly calendar view with color-coded days (present, absent, late), list view below calendar showing daily records (check-in time, check-out time, duration), month selector | E, L, H |
| 5.3 | Attendance Report | Web | Company-wide attendance data for HR | Data table (employee name, team, date, check-in, check-out, duration, status), filters (date range, team, employee, status), export button (Excel/PDF), summary stats at top | A, H |
| 5.4 | Office Location Config | Web | Configure GPS coordinates and radius | Map display with draggable pin, latitude/longitude inputs, radius slider (meters), "Save Location" button, current config display | A |
| 5.5 | WiFi Config | Web | Manage approved WiFi networks | WiFi list table (SSID, BSSID, office location), "Add WiFi" button, delete action, form: SSID input, BSSID input, office location dropdown | A |

**Total: 5 screens**

---

## 6. Leave Management

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 6.1 | Leave Request Form | Mobile | Submit a new leave request | Date range picker (start, end), auto-calculated days count, leave type badge (auto: paid/unpaid based on balance), remaining balance display, reason textarea, submit button | E, L, H |
| 6.2 | My Leave Requests | Mobile | List of personal leave requests with status | List of request cards (date range, type, status badge: pending/approved/rejected), filter tabs (All, Pending, Approved, Rejected), pull-to-refresh | E, L, H |
| 6.3 | Leave Request Detail | Mobile | Full details of a single leave request | Date range, days count, leave type, reason, approval timeline (Leader status, HR status), status badges per approval level | E, L, H |
| 6.4 | Leave Balance | Mobile | Current leave balance summary | Visual balance display (used vs remaining, circular or bar chart), total days, used days, remaining days, leave history summary by type | E, L, H |
| 6.5 | Leave Approval List (Leader) | Mobile | Pending leave requests from team members for Leader approval | List of pending request cards (employee name, avatar, date range, days, type), approve/reject action buttons per card, filter by status | L |
| 6.6 | Leave Approval Detail (Leader) | Mobile | Review and approve/reject a single leave request | Employee info, date range, days, type, reason, leave balance context, approve button, reject button with reason input | L |
| 6.7 | Leave Management | Web | HR-level leave management with level-2 approval | Data table (employee, date range, type, days, leader status, HR status), filter tabs (Pending HR Approval, All), approve/reject actions, search by employee | H |
| 6.8 | Leave Exception (Unpaid to Paid) | Web | Convert unpaid leave to paid leave | Leave request detail view, current type badge (unpaid), "Convert to Paid" button, confirmation dialog with reason input, updated balance preview | H |

**Total: 8 screens**

---

## 7. Overtime (OT)

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 7.1 | OT Request Form | Mobile | Submit an overtime request | Date picker, start time picker, end time picker, auto-calculated hours, reason textarea, submit button | E, L, H |
| 7.2 | My OT Requests | Mobile | List of personal OT requests with status | List of request cards (date, hours, status badge: pending/approved/rejected), filter tabs (All, Pending, Approved, Rejected), pull-to-refresh | E, L, H |
| 7.3 | OT Request Detail | Mobile | Full details of a single OT request | Date, time range, hours, reason, approval timeline (Leader status, CEO status), calculated OT pay preview (hours x 1.5 rate) | E, L, H |
| 7.4 | OT Approval List (Leader) | Mobile | Pending OT requests from team for Leader approval | List of pending cards (employee name, date, hours, reason preview), approve/reject actions per card, filter by status | L |
| 7.5 | OT Approval Detail (Leader) | Mobile | Review and approve/reject a single OT request | Employee info, date, time range, hours, reason, approve button, reject button with reason input | L |
| 7.6 | OT Approval (CEO) | Web | CEO-level OT approval (level 2) | Data table (employee, date, hours, reason, leader status, CEO status), filter tabs (Pending CEO Approval, All), approve/reject actions, bulk approve option | C |
| 7.7 | OT Management | Web | Full OT management view for HR/Admin | Data table (employee, team, date, hours, leader status, CEO status, calculated pay), filters (date range, team, employee, status), summary stats, export button | A, H |

**Total: 7 screens**

---

## 8. Salary Management

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 8.1 | Payslip View | Mobile | Monthly payslip with itemized breakdown | Month selector, net salary (large, prominent), breakdown sections: Basic Salary, Allowances (itemized list), OT Pay, Bonuses (itemized by type), Deductions (BHXH, BHYT, BHTN itemized), Advances, download/share option | E, L, H |
| 8.2 | Salary Config (per Employee) | Web | Configure salary components for an employee (tab within Employee Detail 4.3) | Basic salary input, insurance salary input, effective date, salary history log | A, H |
| 8.3 | Allowance Management | Web | CRUD for custom allowance types | Data table (allowance name, description, assigned employee count), "Create Allowance" button, edit/delete actions, form: name input, description, amount | A |
| 8.4 | Bonus & Advance Management | Web | Record bonuses and salary advances | Tabs: Bonuses / Advances. Bonus form (employee, month, type: KPI/project/commission, amount, description). Advance form (employee, month, amount, reason). List view with filters. | A, H |
| 8.5 | Monthly Payroll Calculation | Web | Trigger and review monthly payroll for all employees | Month/year selector, "Calculate Payroll" button, progress indicator, calculation status per employee, error/warning list, "Confirm & Lock" button | A, H |
| 8.6 | Payroll Summary Table | Web | View calculated payroll for all employees | Data table (employee, basic, allowances, OT, bonuses, deductions, advances, net), totals row, filters (month, team), export button (Excel/PDF), drill-down to individual detail | A, H |

**Total: 6 screens**

---

## 9. Reports (Web only)

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 9.1 | Attendance Report | Web | Detailed attendance analytics | Date range picker, team filter, summary cards (avg attendance rate, late count, absent count), data table with daily breakdown, chart (attendance trend), export button | A, H |
| 9.2 | Leave Report | Web | Leave usage analytics | Date range picker, team filter, summary cards (total leave days, paid vs unpaid ratio), data table (employee, used, remaining, type breakdown), chart, export | A, H |
| 9.3 | Payroll Summary Report | Web | Salary disbursement documentation | Month selector, summary cards (total payroll, avg salary, total deductions), data table matching payroll format, company totals, export PDF/Excel | A, H |
| 9.4 | BHXH D02-TS Report | Web | Vietnamese social insurance report template | Month/quarter selector, auto-populated D02-TS format table, employee insurance data, print-ready layout, export to official template format | A, H |
| 9.5 | OT Report | Web | Overtime analytics and cost tracking | Date range picker, team filter, summary cards (total OT hours, total OT cost, avg OT per employee), data table (employee, hours, cost), chart, export | A, H |
| 9.6 | HR Movement Report | Web | Employee join/leave/transfer tracking | Date range picker, summary cards (new hires, terminations, transfers), data table (employee, event type, date, department/team change), export | A, H |

**Total: 6 screens**

---

## 10. Notifications

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 10.1 | Notification List | Mobile | Push notification inbox | Notification cards (icon by type, title, body preview, timestamp, read/unread indicator), pull-to-refresh, tap to navigate to related item, "Mark all as read" action | E, L, H |
| 10.2 | Notification Center | Web | Web notification panel | Dropdown panel from header bell icon (with unread badge count), notification list (type icon, title, body, timestamp, read/unread), "Mark all as read", "View all" link to full page, click to navigate | A, C, H |

**Total: 2 screens**

---

## 11. Profile & Settings

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 11.1 | My Profile | Mobile | View and edit personal information | Avatar, full name, email (read-only), phone, address, DOB, gender, "Edit" button, save/cancel in edit mode | E, L, H |
| 11.2 | Change Password | Mobile | Update account password | Current password input, new password input, confirm password input, password strength indicator, submit button | E, L, H |
| 11.3 | Mobile Settings | Mobile | App-level settings | Notification preferences toggle, language (future), about/version info, logout button | E, L, H |

**Total: 3 screens**

---

## 12. Web Layout & Navigation (Shared)

| # | Screen Name | Platform | Description | Key UI Elements | Roles |
|---|-------------|----------|-------------|-----------------|-------|
| 12.1 | Web Sidebar Layout | Web | Persistent layout shell for all web pages | Sidebar navigation (collapsible): Dashboard, Employees, Organization, Attendance, Leave, OT, Salary, Reports (expandable), Settings. Header bar: app logo, notification bell, user avatar dropdown (profile, change password, logout) | A, C, H |

**Total: 1 screen (layout component)**

---

## Screen Count Summary

| Module | Web | Mobile | Total |
|--------|-----|--------|-------|
| 1. Authentication | 2 | 2 | 4 |
| 2. Dashboard & Home | 1 | 1 | 2 |
| 3. Organization | 5 | 0 | 5 |
| 4. Employee Management | 4 | 0 | 4 |
| 5. Attendance | 3 | 2 | 5 |
| 6. Leave Management | 2 | 6 | 8 |
| 7. Overtime | 2 | 5 | 7 |
| 8. Salary | 5 | 1 | 6 |
| 9. Reports | 6 | 0 | 6 |
| 10. Notifications | 1 | 1 | 2 |
| 11. Profile & Settings | 0 | 3 | 3 |
| 12. Web Layout | 1 | 0 | 1 |
| **Total** | **32** | **21** | **53** |

> Note: Some screens serve as sub-views or modals within parent screens (e.g., 3.2 Department Form as modal within 3.1, 8.2 Salary Config as tab within 4.3 Employee Detail). Actual standalone page count is approximately 45.

---

## Navigation Map

### Web Admin Navigation Structure

```
Sidebar
├── Dashboard (2.1)
├── Organization
│   ├── Departments (3.1) → Department Form (3.2)
│   └── Teams (3.3) → Team Form (3.4) → Team Detail (3.5)
├── Employees (4.1) → Create (4.2) / Detail (4.3) → Allowances (4.4)
├── Attendance
│   ├── Report (5.3)
│   └── Settings → Office Location (5.4) / WiFi Config (5.5)
├── Leave Management (6.7) → Exception (6.8)
├── OT Management (7.7)
│   └── CEO Approval (7.6) [CEO role only]
├── Salary
│   ├── Allowances (8.3)
│   ├── Bonuses & Advances (8.4)
│   ├── Payroll Calculation (8.5)
│   └── Payroll Summary (8.6)
├── Reports
│   ├── Attendance (9.1)
│   ├── Leave (9.2)
│   ├── Payroll Summary (9.3)
│   ├── BHXH D02-TS (9.4)
│   ├── OT (9.5)
│   └── HR Movement (9.6)
└── Header: Notifications (10.2) | Profile Dropdown
```

### Mobile App Navigation Structure

```
Bottom Navigation
├── Home (2.2) → Check-in/out (5.1)
├── Requests
│   ├── Leave → My Requests (6.2) → Detail (6.3) / New Request (6.1)
│   │         → Balance (6.4)
│   └── OT → My Requests (7.2) → Detail (7.3) / New Request (7.1)
├── Approvals [Leader only]
│   ├── Leave Approvals (6.5) → Detail (6.6)
│   └── OT Approvals (7.4) → Detail (7.5)
├── Payslip (8.1)
└── Profile (11.1) → Change Password (11.2) / Settings (11.3)

Top bar: Notifications (10.1)
```

---

## Role-Based Screen Access Matrix

| Screen | Admin | CEO | HR | Leader | Employee |
|--------|-------|-----|-----|--------|----------|
| **Web Screens** | | | | | |
| Web Login (1.1) | Y | Y | Y | - | - |
| Dashboard (2.1) | Y | Y | Y | - | - |
| Department List/Form (3.1-3.2) | Y | - | Y | - | - |
| Team List/Form/Detail (3.3-3.5) | Y | - | Y | - | - |
| Employee List/Create/Detail (4.1-4.4) | Y | - | Y | - | - |
| Attendance Report (5.3) | Y | - | Y | - | - |
| Office/WiFi Config (5.4-5.5) | Y | - | - | - | - |
| Leave Management (6.7-6.8) | - | - | Y | - | - |
| OT Approval CEO (7.6) | - | Y | - | - | - |
| OT Management (7.7) | Y | - | Y | - | - |
| Salary/Payroll (8.2-8.6) | Y | - | Y | - | - |
| All Reports (9.1-9.6) | Y | - | Y | - | - |
| Notification Center (10.2) | Y | Y | Y | - | - |
| **Mobile Screens** | | | | | |
| Mobile Login (1.2) | - | - | Y | Y | Y |
| Home (2.2) | - | - | Y | Y | Y |
| Check-in/out (5.1) | - | - | Y | Y | Y |
| Attendance History (5.2) | - | - | Y | Y | Y |
| Leave Requests (6.1-6.4) | - | - | Y | Y | Y |
| Leave Approval (6.5-6.6) | - | - | - | Y | - |
| OT Requests (7.1-7.3) | - | - | Y | Y | Y |
| OT Approval (7.4-7.5) | - | - | - | Y | - |
| Payslip (8.1) | - | - | Y | Y | Y |
| Notifications (10.1) | - | - | Y | Y | Y |
| Profile/Settings (11.1-11.3) | - | - | Y | Y | Y |

---

## Design Priority Order (Suggested)

For phased design work, the recommended order based on user flow criticality:

| Priority | Screens | Rationale |
|----------|---------|-----------|
| **P0 - Core Flow** | 1.1-1.2 (Login), 2.1-2.2 (Dashboard/Home), 5.1-5.2 (Check-in), 12.1 (Web Layout) | Foundation screens used daily by all users |
| **P1 - Primary Features** | 6.1-6.8 (Leave), 7.1-7.7 (OT), 4.1-4.3 (Employee CRUD) | Core business workflows |
| **P2 - Salary & Reports** | 8.1-8.6 (Salary), 9.1-9.6 (Reports) | Monthly operations, complex data displays |
| **P3 - Supporting** | 3.1-3.5 (Organization), 10.1-10.2 (Notifications), 11.1-11.3 (Profile), 5.3-5.5 (Attendance web) | Admin setup and secondary features |
