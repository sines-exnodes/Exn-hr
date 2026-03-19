# REQ-001: Exn-Hr — He thong Quan ly Nhan su Noi bo

**Status**: Draft
**Created**: 2026-03-18
**Author**: business-analyst
**Seed**: `docs/requirements/seeds/SEED-001.yaml`

---

## 1. Context & Background

Exn-Hr la he thong quan ly nhan su noi bo danh cho cong ty startup/SME quy mo nho (duoi 50 nhan vien, 1 chi nhanh). Day la du an greenfield, single-tenant, khong co he thong cu nao truoc do.

**Van de can giai quyet:**
- Quan ly cham cong, nghi phep, lam them gio (OT) bang thu cong hoac khong co he thong
- Tinh luong phuc tap voi nhieu thanh phan (phu cap, thuong, khau tru theo luat VN)
- Quy trinh duyet nghi phep va OT chua co he thong hoa
- Khong co dashboard tong quan ve nhan su

**Giai phap:** Xay dung he thong HR toan dien voi 3 platform:
- **Web Admin** (NextJS): Quan ly toan bo he thong
- **Backend API** (GoLang/Gin): Xu ly logic nghiep vu
- **Mobile App** (Flutter): Cham cong, xem luong, gui yeu cau

**Timeline:** 14-16 tuan cho MVP.

---

## 2. User Stories

### US-01: Authentication
- As an **employee**, I want to log in with email + password, so that I can access the system with my account.
- As an **admin**, I want to manage user accounts (create, deactivate), so that only authorized people access the system.

### US-02: Organization Management
- As an **admin**, I want to create and manage departments and teams, so that the company structure is reflected in the system.
- As an **admin**, I want to assign a leader to each team, so that the approval workflow works correctly.
- As an **admin**, I want to assign employees to teams, so that reporting lines are clear.

### US-03: Attendance
- As an **employee**, I want to check in/out via mobile app with GPS + WiFi verification, so that my attendance is recorded accurately.
- As an **admin**, I want to configure office location (GPS coordinates + radius) and approved WiFi networks, so that attendance verification works correctly.
- As an **HR**, I want to view attendance reports, so that I can track employee punctuality.

### US-04: Leave Management
- As an **employee**, I want to submit leave requests, so that I can take time off with proper approval.
- As a **leader**, I want to approve/reject leave requests from my team (level 1), so that team workload is managed.
- As an **HR**, I want to give final approval on leave requests (level 2), so that leave policies are enforced.
- As an **HR**, I want to convert unpaid leave to paid leave (exception), so that special cases can be handled.
- As an **employee**, I want to see my remaining leave balance, so that I know how many days I have left.

### US-05: Overtime (OT)
- As an **employee**, I want to submit OT requests, so that my extra work hours are compensated.
- As a **leader**, I want to approve/reject OT requests from my team (level 1), so that OT is controlled.
- As a **CEO**, I want to give final approval on OT requests (level 2), so that OT costs are authorized.

### US-06: Salary Management
- As an **admin/HR**, I want to configure salary components for each employee (basic salary, insurance salary, allowances), so that payroll is accurate.
- As an **admin**, I want to create custom allowances (name + amount) and assign them to employees, so that compensation is flexible.
- As an **admin/HR**, I want to record bonuses (KPI, project, commission) and salary advances, so that all salary components are tracked.
- As an **admin/HR**, I want the system to calculate deductions (BHXH, BHYT, BHTN) automatically based on Vietnamese law, so that compliance is ensured. (Note: TNCN is NOT calculated in the system)
- As an **employee**, I want to view my monthly payslip on the mobile app, so that I can verify my salary.

### US-07: Notifications
- As an **employee**, I want to receive push notifications for approval status changes, so that I stay informed.
- As a **leader/HR/CEO**, I want to receive push notifications when requests need my approval, so that I can respond promptly.

### US-08: Reports
- As an **HR/Admin**, I want to generate payroll summary reports, so that salary disbursement is documented.
- As an **HR/Admin**, I want to generate attendance and leave reports, so that I can monitor workforce availability.
- As an **HR/Admin**, I want to generate statutory reports (D02-TS for BHXH, 05/QTT-TNCN for tax), so that regulatory compliance is met.
- As an **HR/Admin**, I want a dashboard overview, so that I can see key HR metrics at a glance.

### US-09: Employee Profile
- As an **employee**, I want to view and update my personal information via mobile app, so that my records are current.
- As an **admin/HR**, I want to manage employee profiles (CRUD), so that employee data is maintained.

---

## 3. Acceptance Criteria

### US-01: Authentication

- **Given** a user with valid email and password, **when** they submit login credentials, **then** they are logged in and receive a session/token.
- **Given** a deactivated account, **when** login is attempted, **then** access is denied.

### US-02: Organization Management

- **Given** an admin, **when** they create a department with teams, **then** the hierarchy Department > Team is established.
- **Given** a team, **when** a leader is assigned, **then** exactly 1 leader exists for that team.
- **Given** an employee, **when** assigned to a team, **then** they belong to exactly 1 team (previous assignment removed if any).

### US-03: Attendance

- **Given** an employee within GPS range AND connected to approved WiFi, **when** they check in via mobile app, **then** attendance is recorded with timestamp and verification data.
- **Given** an employee outside GPS range OR not on approved WiFi, **when** they attempt to check in, **then** check-in is rejected with a clear error message.
- **Given** an admin, **when** they configure office location and WiFi list, **then** the configuration applies to all subsequent attendance checks.

### US-04: Leave Management

- **Given** an employee with remaining paid leave, **when** they submit a leave request, **then** it is categorized as paid leave and sent to Leader for level-1 approval.
- **Given** an employee with 0 remaining paid leave, **when** they submit a leave request, **then** it is automatically categorized as unpaid leave.
- **Given** a Leader approves a leave request (level 1), **when** approval is submitted, **then** the request is forwarded to HR for level-2 approval.
- **Given** HR, **when** they convert an unpaid leave to paid leave, **then** the leave type is changed and leave balance is adjusted.
- **Given** a new year begins, **when** the system resets leave balances, **then** each employee receives 12 paid leave days. Unused days from previous year do NOT carry over.

### US-05: Overtime (OT)

- **Given** an employee submits an OT request, **when** submitted, **then** it goes to Leader for level-1 approval.
- **Given** a Leader approves an OT request, **when** approved, **then** it goes to CEO for level-2 approval.
- **Given** CEO approves an OT request, **when** approved, **then** OT hours are marked as eligible for salary calculation at 1.5x multiplier.
- **Given** an OT request not yet approved by CEO, **when** salary is calculated, **then** the OT hours are NOT included.
- **Given** any type of OT (weekday, weekend, holiday), **when** multiplier is applied, **then** the rate is always 1.5x (no differentiation).

### US-06: Salary Management

- **Given** an employee with all salary components configured, **when** monthly salary is calculated, **then** net salary = basic salary + allowances + OT pay + bonuses - advances - BHXH - BHYT - BHTN. (TNCN is NOT calculated in system)
- **Given** an admin creates a custom allowance with name and amount, **when** assigned to an employee, **then** it appears in their salary calculation.
- **Given** insurance salary is set for an employee, **when** BHXH/BHYT/BHTN are calculated, **then** they are based on the insurance salary (not total income).
- **Given** an employee views their payslip, **when** displayed, **then** all components (base, allowances, bonuses, deductions) are itemized.

### US-07: Notifications

- **Given** a leave/OT request status changes, **when** updated, **then** the requester receives a push notification.
- **Given** a new request needs approval, **when** submitted, **then** the approver receives a push notification.

### US-08: Reports

- **Given** HR requests a payroll summary, **when** generated for a period, **then** all employees' salary components are listed in a tabular format.
- **Given** HR requests D02-TS report, **when** generated, **then** it follows the official Vietnamese social insurance D02-TS template format.
- **Given** HR requests 05/QTT-TNCN report, **when** generated, **then** it follows the official Vietnamese PIT settlement template format.
- **Given** a user with dashboard access, **when** they open the dashboard, **then** key metrics (headcount, attendance rate, leave utilization, OT hours) are displayed.

### US-09: Employee Profile

- **Given** an employee, **when** they update their personal information via mobile app, **then** changes are saved and visible to HR/Admin.
- **Given** an admin/HR, **when** they create a new employee profile, **then** the employee is assigned an account and can log in.

---

## 4. Domain Model

| Entity | New/Modified | Key Fields | Relationships |
|--------|-------------|------------|---------------|
| User | New | id, email, password_hash, otp_secret, is_active, role_id | belongs to Role, has one Employee |
| Role | New | id, name (admin/ceo/hr/leader/employee), level, permissions[] | has many Users |
| Employee | New | id, user_id, full_name, phone, address, dob, gender, join_date, team_id, position, insurance_salary, basic_salary | belongs to User, belongs to Team, has many LeaveRequests, has many OTRequests, has many AttendanceRecords, has many EmployeeAllowances |
| Department | New | id, name, description | has many Teams |
| Team | New | id, name, department_id, leader_id | belongs to Department, has one Leader (Employee), has many Employees |
| AttendanceRecord | New | id, employee_id, check_in_time, check_out_time, gps_lat, gps_lng, wifi_ssid, status | belongs to Employee |
| OfficeLocation | New | id, name, latitude, longitude, radius_meters | standalone config |
| ApprovedWiFi | New | id, ssid, bssid, office_location_id | belongs to OfficeLocation |
| LeaveRequest | New | id, employee_id, type (paid/unpaid), start_date, end_date, days, reason, leader_status, hr_status, overall_status | belongs to Employee |
| LeaveBalance | New | id, employee_id, year, total_days, used_days, remaining_days | belongs to Employee |
| OvertimeRequest | New | id, employee_id, date, start_time, end_time, hours, reason, leader_status, ceo_status, overall_status | belongs to Employee |
| SalaryRecord | New | id, employee_id, month, year, basic_salary, total_allowances, total_ot_pay, total_bonus, total_deductions, net_salary, status | belongs to Employee |
| Allowance | New | id, name, description, is_position_based | has many EmployeeAllowances |
| EmployeeAllowance | New | id, employee_id, allowance_id, amount | belongs to Employee, belongs to Allowance |
| Bonus | New | id, employee_id, month, year, type (kpi/project/commission), amount, description | belongs to Employee |
| SalaryAdvance | New | id, employee_id, month, year, amount, reason, status | belongs to Employee |
| Notification | New | id, user_id, title, body, type, is_read, reference_id, reference_type | belongs to User |

---

## 5. API Contracts

> Chi tiet API contracts se duoc dinh nghia trong Apidog sau khi team-lead decompose tasks.
> Duoi day la danh sach cac nhom API can thiet:

| Group | Methods | Base Path | Notes |
|-------|---------|-----------|-------|
| Auth | POST | /api/auth/login, /api/auth/verify-otp, /api/auth/logout | Email+Password+OTP flow |
| Users | CRUD | /api/users | Admin manages user accounts |
| Employees | CRUD | /api/employees | Employee profile management |
| Departments | CRUD | /api/departments | Department management |
| Teams | CRUD | /api/teams | Team management, leader assignment |
| Attendance | POST, GET | /api/attendance | Check-in/out, attendance history |
| Office Config | CRUD | /api/office-locations, /api/approved-wifi | Admin configures GPS + WiFi |
| Leave Requests | CRUD | /api/leave-requests | Submit, approve/reject (2-level) |
| Leave Balance | GET | /api/leave-balance | View remaining leave days |
| OT Requests | CRUD | /api/ot-requests | Submit, approve/reject (2-level) |
| Salary | GET, POST | /api/salary | Salary calculation, payslip |
| Allowances | CRUD | /api/allowances | Custom allowance management |
| Bonuses | CRUD | /api/bonuses | KPI, project, commission bonuses |
| Salary Advance | CRUD | /api/salary-advances | Advance salary management |
| Reports | GET | /api/reports/* | All report endpoints |
| Dashboard | GET | /api/dashboard | Dashboard metrics |
| Notifications | GET, PUT | /api/notifications | List, mark as read |

---

## 6. UI/UX Requirements

### Web Admin (NextJS) — Target: Admin, CEO, HR

> Web la giao dien quan ly tong the. HR + CEO + Admin su dung web de quan ly nhan su, tinh luong, xem bao cao.

- **Login Screen**: Email + password form.
- **Dashboard**: Tong quan nhan su — headcount, attendance rate, leave utilization, OT summary, recent activities.
- **Employee Management**: CRUD danh sach nhan vien, filter/search, view chi tiet profile.
- **Organization Structure**: Quan ly Department va Team, assign leader, assign employees.
- **Attendance Management**: Xem bang cham cong, filter theo thang/team/nhan vien. Cau hinh office location va WiFi.
- **Leave Management**: Danh sach leave requests, filter theo status. HR duyet cap 2. Chuyen doi unpaid → paid.
- **OT Management**: Danh sach OT requests, filter theo status. CEO duyet cap 2.
- **Salary Management**: Cau hinh luong co ban, insurance salary, allowances cho tung nhan vien. Tinh luong hang thang cho TOAN BO nhan vien. Xem bang luong tong hop.
- **Reports**: Cac bao cao theo Section 2 US-08. Export PDF/Excel.
- **Notifications**: Notification center voi badge count.

### Mobile App (Flutter) — Target: Employee, Leader (+ HR as employee)

> App danh cho nhan vien va leader. HR cung co the dung app nhu mot nhan vien binh thuong (cham cong, xem luong, xin phep). Cac chuc nang quan ly (tinh luong, bao cao) chi co tren Web.

- **Login Screen**: Email + password.
- **Home Screen**: Quick actions (check-in/out), today's attendance status, pending requests count.
- **Attendance**: Check-in/out button voi GPS + WiFi verification. Attendance history.
- **Leave Request**: Form tao yeu cau nghi phep. Danh sach requests voi status. Leave balance display.
- **OT Request**: Form tao yeu cau OT. Danh sach requests voi status.
- **Payslip**: Xem phieu luong hang thang, chi tiet cac thanh phan.
- **Profile**: Xem va cap nhat thong tin ca nhan.
- **Notifications**: Danh sach thong bao push, mark as read.
- **Leader Approval** (Leader only): Duyet/tu choi leave requests va OT requests cua team.

### Key Interactions

- Check-in/out hien thi real-time GPS status va WiFi connection status truoc khi cho phep.
- Approval workflow hien thi trang thai tung buoc (pending → leader approved → HR/CEO approved).
- Leave request tu dong hien thi loai (paid/unpaid) dua tren leave balance hien tai.
- Payslip hien thi itemized breakdown cua tat ca thanh phan luong.

---

## 7. Business Rules

| Rule ID | Description | Example |
|---------|-------------|---------|
| BR-001 | Moi nhan vien thuoc dung 1 team | NV A thuoc Team BE, khong the thuoc dong thoi Team FE |
| BR-002 | Moi team co dung 1 Leader | Team BE co 1 Leader, neu doi Leader thi Leader cu mat quyen |
| BR-003 | Nghi phep co luong: 12 ngay/nam | NV co 12 ngay paid leave moi nam duong lich |
| BR-004 | Het phep co luong → tu dong nghi khong luong | NV da dung het 12 ngay, lan thu 13 tu dong la unpaid |
| BR-005 | HR co the chuyen unpaid → paid (exception) | NV co ly do dac biet, HR duyet chuyen thanh paid leave |
| BR-006 | Duyet nghi phep 2 cap: Employee → Leader → HR | Leader duyet cap 1, HR duyet cap 2 |
| BR-007 | Duyet OT 2 cap: Employee → Leader → CEO | Leader duyet cap 1, CEO duyet cap 2 |
| BR-008 | He so OT co dinh x1.5, khong phan biet ngay | Lam OT ngay thuong, cuoi tuan, le deu x1.5 |
| BR-009 | OT chi tinh vao luong sau khi CEO duyet | OT chua duoc CEO duyet se khong xuat hien trong bang luong |
| BR-010 | Luong dong BHXH do Admin nhap rieng | Luong BHXH = 5tr, tong thu nhap = 15tr — BHXH tinh tren 5tr |
| BR-011 | Phu cap linh hoat: Admin tu tao ten + so tien | Admin tao "Phu cap xang xe" = 500k, gan cho NV A |
| BR-012 | Cham cong yeu cau GPS + WiFi dong thoi | NV phai o dung vi tri VAN PHAI ket noi WiFi VP moi check-in duoc |
| BR-013 | Khau tru theo luat Viet Nam | BHXH 8%, BHYT 1.5%, BHTN 1% (phan NV). TNCN KHONG tinh trong he thong |
| BR-015 | Phep nam khong carry-over | Nam nao xai nam do, het nam phep con lai bi mat |
| BR-016 | App: Employee + Leader (+ HR nhu NV). Web: Admin + CEO + HR (quan ly) | HR dung app de cham cong/xem luong nhu NV, dung web de quan ly |
| BR-017 | Authentication chi can Email + Password | Khong can 2FA, he thong noi bo don gian |
| BR-014 | RBAC theo role + module | Leader co the xem cham cong team minh nhung khong xem luong |

---

## 8. Technical Considerations

- **Dependencies**:
  - GoLang/Gin framework cho backend API
  - NextJS cho web admin
  - Flutter cho mobile app
  - PostgreSQL cho database
  - Push notification service (FCM hoac tuong tu)
  - OTP service (TOTP hoac SMS-based)

- **Migrations**:
  - Toan bo schema moi (greenfield) — khong co migration tu he thong cu
  - Can thiet ke schema tu dau voi cac entities o Section 4

- **Performance**:
  - Quy mo nho (<50 NV) — khong co yeu cau performance dac biet
  - Salary calculation co the chay batch hang thang
  - Dashboard co the dung cached/aggregated data

- **Security**:
  - Email + Password authentication (no 2FA for MVP)
  - RBAC enforcement o API level
  - GPS + WiFi verification cho attendance
  - Salary data la sensitive — chi NV xem luong cua minh, HR/Admin xem tat ca
  - API authentication via JWT hoac tuong tu (team-lead quyet dinh)

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ~~Thue TNCN~~ | N/A | N/A | TNCN khong tinh trong he thong (da loai bo theo yeu cau) |
| Mau bao cao D02-TS, 05/QTT-TNCN thay doi theo nam | Low | Medium | Thiet ke report template co the cap nhat, tach biet logic va template |
| GPS spoofing tren mobile | Medium | Medium | Ket hop WiFi verification, co the them device fingerprint sau |
| Account security (no 2FA) | Low | Low | He thong noi bo, quy mo nho — Email + Password du dung. Co the them 2FA sau neu can |
| Scope creep tu future modules | Medium | High | Giu nghiem out-of-scope list, tach biet module architecture |
| Tinh toan luong sai | Low | High | Unit test ky cho moi salary component, reconciliation report |

---

## 10. Out of Scope

Cac tinh nang sau KHONG nam trong MVP nay va se duoc xem xet trong cac phien ban sau:

- **Project Management module** — da xac nhan la future scope, khong phai MVP
- **Multi-branch support** — hien tai chi 1 chi nhanh, mo rong sau khi can
- **External integrations** — khong tich hop ERP, phan mem ke toan, hay he thong ben ngoai nao
- **Biometric attendance** — chi GPS + WiFi cho MVP, van tay/khuon mat la future
- **Multi-language** — chi tieng Viet cho MVP
- **Recruitment/Hiring module** — khong co quy trinh tuyen dung trong MVP
- **Performance review module** — chi co KPI bonus, khong co he thong danh gia hieu suat day du
- **Training/Development module** — khong co quan ly dao tao
- **Leave carry-over** — da xac nhan: KHONG carry-over, nam nao xai nam do
- **Complex OT rules** — khong phan biet he so OT theo ngay thuong/cuoi tuan/le (co dinh x1.5)
- **Employee self-service beyond profile** — NV chi cap nhat thong tin ca nhan, khong tu tao tai khoan

---

## Quality Checklist

- [x] Every User Story has at least 1 Acceptance Criteria
- [x] Every entity in Domain Model is referenced in User Stories
- [x] Business Rules cover edge cases (empty states, limits, permissions)
- [x] Out of Scope is explicit — no ambiguity about what's NOT included
- [x] No implementation details in requirements (what, not how)
- [x] Status is set to "Draft" until user approves
