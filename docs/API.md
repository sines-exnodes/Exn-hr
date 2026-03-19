# Exn-Hr API Documentation

**Base URL**: `http://localhost:8080/api/v1`
**Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`)
**Content-Type**: `application/json`

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "total": 50,
  "page": 1,
  "size": 20
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Roles & Permissions

| Role     | Code       | Description                              |
|----------|------------|------------------------------------------|
| Admin    | `admin`    | Full system access, manages config       |
| CEO      | `ceo`      | Approves OT (2nd stage), views reports   |
| HR       | `hr`       | Manages employees, approves leave (2nd)  |
| Leader   | `leader`   | Approves leave/OT (1st stage) for team   |
| Employee | `employee` | Basic access: attendance, leave, OT      |

---

## 1. Authentication

### 1.1 Login
**`POST /auth/login`** — Public

Authenticates user and returns JWT token.

**Request:**
```json
{
  "email": "admin@exn.vn",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "admin@exn.vn",
      "role": "admin",
      "is_active": true
    }
  },
  "message": "Login successful"
}
```

**Errors:**
- `401` — Invalid email or password
- `401` — Account is deactivated

**Flow:**
1. Validate email format and password length (min 6)
2. Look up user by email
3. Check `is_active` flag
4. Verify password hash (bcrypt)
5. Generate JWT token (HS256, configurable expiry, default 24h)
6. Return token + user profile

---

### 1.2 Get Current User
**`GET /auth/me`** — All authenticated

Returns the current authenticated user's info.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@exn.vn",
    "role": "admin",
    "is_active": true
  }
}
```

---

### 1.3 Change Password
**`POST /auth/change-password`** — All authenticated

**Request:**
```json
{
  "old_password": "admin123",
  "new_password": "newSecure456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- `400` — Current password is incorrect
- `400` — New password too short (min 6)

**Flow:**
1. Verify old password against stored hash
2. Hash new password with bcrypt
3. Update user record

---

## 2. Employees

### 2.1 Get My Profile
**`GET /employees/me`** — All authenticated

Returns current user's employee profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "user_id": 2,
    "full_name": "John Doe",
    "phone": "0901234567",
    "address": "123 Street",
    "dob": "1990-01-15",
    "gender": "male",
    "join_date": "2024-01-01",
    "position": "Developer",
    "team_id": 1,
    "basic_salary": 15000000,
    "insurance_salary": 8000000,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-06-01T00:00:00Z",
    "user": {
      "id": 2,
      "email": "john@exn.vn",
      "role": "employee",
      "is_active": true
    },
    "team": {
      "id": 1,
      "name": "Backend Team",
      "department_id": 1
    }
  }
}
```

---

### 2.2 List Employees
**`GET /employees`** — Admin, HR, CEO, Leader

**Query Parameters:**

| Param         | Type   | Description                        |
|---------------|--------|------------------------------------|
| `team_id`     | uint   | Filter by team                     |
| `department_id` | uint | Filter by department               |
| `role`        | string | Filter by role                     |
| `search`      | string | Search by name or email            |
| `page`        | int    | Page number (default: 1)           |
| `size`        | int    | Page size (default: 20)            |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "full_name": "John Doe",
      "phone": "0901234567",
      "position": "Developer",
      "team_id": 1,
      "basic_salary": 15000000,
      "insurance_salary": 8000000,
      "user": { "id": 1, "email": "john@exn.vn", "role": "employee", "is_active": true }
    }
  ],
  "total": 25,
  "page": 1,
  "size": 20
}
```

---

### 2.3 Get Employee by ID
**`GET /employees/:id`** — All authenticated

**Response (200):** Same as employee object in 2.1

---

### 2.4 Create Employee
**`POST /employees`** — Admin, HR

Creates both user account and employee profile.

**Request:**
```json
{
  "email": "jane@exn.vn",
  "password": "password123",
  "role": "employee",
  "full_name": "Jane Smith",
  "phone": "0907654321",
  "address": "456 Avenue",
  "dob": "1992-05-20",
  "gender": "female",
  "join_date": "2024-03-01",
  "position": "Designer",
  "team_id": 1,
  "basic_salary": 18000000,
  "insurance_salary": 10000000
}
```

**Validation:**
- `email` — required, valid email format
- `password` — required, min 6 characters
- `role` — required, one of: `admin`, `ceo`, `hr`, `leader`, `employee`
- `full_name` — required

**Response (201):** Employee object with user data

**Flow:**
1. Hash password (bcrypt)
2. Create User record with email + role
3. Create Employee profile linked to user
4. Return combined employee + user data

---

### 2.5 Update Employee
**`PUT /employees/:id`** — Admin, HR

All fields are optional (partial update).

**Request:**
```json
{
  "full_name": "Jane Updated",
  "position": "Senior Designer",
  "basic_salary": 20000000,
  "insurance_salary": 12000000,
  "team_id": 2,
  "is_active": false
}
```

**Response (200):** Updated employee object

---

### 2.6 Get Employee Allowances
**`GET /employees/:id/allowances`** — Admin, HR

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 2,
      "allowance_id": 1,
      "amount": 500000,
      "allowance": {
        "id": 1,
        "name": "Transport",
        "description": "Monthly transport allowance"
      }
    }
  ]
}
```

---

### 2.7 Set Employee Allowance
**`POST /employees/:id/allowances`** — Admin, HR

Assigns or updates an allowance amount for an employee.

**Request:**
```json
{
  "allowance_id": 1,
  "amount": 500000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Allowance set successfully"
}
```

---

### 2.8 Delete Employee Allowance
**`DELETE /employees/:id/allowances/:allowance_id`** — Admin, HR

**Response (200):**
```json
{
  "success": true,
  "message": "Allowance removed"
}
```

---

## 3. Departments

### 3.1 List Departments
**`GET /departments`** — Admin, HR, CEO

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Engineering",
      "description": "Engineering Department",
      "teams": [
        { "id": 1, "name": "Backend Team", "department_id": 1 }
      ]
    }
  ]
}
```

---

### 3.2 Get Department
**`GET /departments/:id`** — Admin, HR, CEO

**Response (200):** Single department object with teams

---

### 3.3 Create Department
**`POST /departments`** — Admin only

**Request:**
```json
{
  "name": "Engineering",
  "description": "Engineering Department"
}
```

**Response (201):** Created department object

---

### 3.4 Update Department
**`PUT /departments/:id`** — Admin only

**Request:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response (200):** Updated department object

---

### 3.5 Delete Department
**`DELETE /departments/:id`** — Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Department deleted"
}
```

---

## 4. Teams

### 4.1 List Teams
**`GET /teams`** — Admin, HR, CEO, Leader

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Backend Team",
      "department_id": 1,
      "leader_id": 5,
      "department": { "id": 1, "name": "Engineering" },
      "leader": { "id": 5, "full_name": "Team Lead" },
      "members": [ ... ]
    }
  ]
}
```

---

### 4.2 Get Team
**`GET /teams/:id`** — Admin, HR, CEO, Leader

**Response (200):** Single team object with department, leader, members

---

### 4.3 Create Team
**`POST /teams`** — Admin, HR

**Request:**
```json
{
  "name": "Backend Team",
  "department_id": 1,
  "leader_id": 5
}
```

**Validation:**
- `name` — required
- `department_id` — required, must exist
- `leader_id` — optional, employee ID

**Response (201):** Created team object

---

### 4.4 Update Team
**`PUT /teams/:id`** — Admin, HR

**Request:**
```json
{
  "name": "Updated Team",
  "department_id": 2,
  "leader_id": 10
}
```

**Response (200):** Updated team object

---

### 4.5 Delete Team
**`DELETE /teams/:id`** — Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Team deleted"
}
```

---

## 5. Attendance

### 5.1 Check In
**`POST /attendance/check-in`** — All authenticated

Employee checks in with GPS coordinates and optional WiFi.

**Request:**
```json
{
  "latitude": 10.762622,
  "longitude": 106.660172,
  "wifi_ssid": "EXN-Office"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": 2,
    "check_in_time": "2026-03-19T08:30:00Z",
    "check_out_time": null,
    "gps_lat": 10.762622,
    "gps_lng": 106.660172,
    "wifi_ssid": "EXN-Office",
    "status": "checked_in"
  }
}
```

**Errors:**
- `400` — Already have an active check-in
- `400` — Location not within approved office area or WiFi network
- `404` — Employee profile not found

**Flow:**
1. Look up employee by authenticated user ID
2. Check for existing active check-in today → reject if exists
3. **Location validation** (must match at least one):
   - WiFi SSID matches any approved WiFi across all office locations
   - GPS coordinates within `radius_meters` of any office location (Haversine formula)
4. Create attendance record with status `checked_in`

---

### 5.2 Check Out
**`POST /attendance/check-out`** — All authenticated

**Request:**
```json
{
  "latitude": 10.762622,
  "longitude": 106.660172,
  "wifi_ssid": "EXN-Office"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": 2,
    "check_in_time": "2026-03-19T08:30:00Z",
    "check_out_time": "2026-03-19T17:30:00Z",
    "status": "checked_out"
  }
}
```

**Errors:**
- `400` — No active check-in found
- `400` — Location not within approved area

**Flow:**
1. Find active check-in for employee
2. Validate location (same as check-in)
3. Set `check_out_time` and status to `checked_out`

---

### 5.3 Get My Today's Attendance
**`GET /attendance/today`** — All authenticated

**Response (200):** Today's attendance record (or 404 if none)

---

### 5.4 List Attendance Records
**`GET /attendance`** — Admin, HR, CEO, Leader

**Query Parameters:**

| Param         | Type   | Description                     |
|---------------|--------|---------------------------------|
| `employee_id` | uint   | Filter by employee              |
| `start_date`  | string | Start date (YYYY-MM-DD)         |
| `end_date`    | string | End date (YYYY-MM-DD)           |
| `page`        | int    | Page number (default: 1)        |
| `size`        | int    | Page size (default: 20)         |

**Response (200):** Paginated attendance records

---

### 5.5 Get Office Locations
**`GET /attendance/office-locations`** — All authenticated

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "HQ Office",
      "latitude": 10.762622,
      "longitude": 106.660172,
      "radius_meters": 200,
      "approved_wifis": [
        { "id": 1, "ssid": "EXN-Office", "bssid": "AA:BB:CC:DD:EE:FF", "office_location_id": 1 }
      ]
    }
  ]
}
```

---

### 5.6 Create Office Location
**`POST /attendance/office-locations`** — Admin only

**Request:**
```json
{
  "name": "Branch Office",
  "latitude": 21.027763,
  "longitude": 105.834160,
  "radius_meters": 150
}
```

**Response (201):** Created office location object

---

### 5.7 Add Approved WiFi
**`POST /attendance/approved-wifi`** — Admin only

**Request:**
```json
{
  "ssid": "EXN-Office-5G",
  "bssid": "11:22:33:44:55:66",
  "office_location_id": 1
}
```

**Response (201):** Created WiFi object

---

### 5.8 Delete Approved WiFi
**`DELETE /attendance/approved-wifi/:id`** — Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Approved WiFi deleted"
}
```

---

## 6. Leave Management

### 6.1 Create Leave Request
**`POST /leave`** — All authenticated

**Request:**
```json
{
  "type": "paid",
  "start_date": "2026-04-01",
  "end_date": "2026-04-02",
  "days": 2,
  "reason": "Personal leave"
}
```

**Validation:**
- `type` — required, one of: `paid`, `unpaid`
- `start_date` / `end_date` — required
- `days` — required, min 0.5

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": 2,
    "type": "paid",
    "start_date": "2026-04-01",
    "end_date": "2026-04-02",
    "days": 2,
    "reason": "Personal leave",
    "leader_status": "pending",
    "hr_status": "pending",
    "overall_status": "pending"
  }
}
```

**Flow:**
1. Look up employee profile
2. For `paid` type: check leave balance (12 days/year, no carry-over)
3. Create leave request with all statuses = `pending`
4. Notify team leader (if employee has a team with leader assigned)

---

### 6.2 List Leave Requests
**`GET /leave`** — All authenticated

**Query Parameters:**

| Param         | Type   | Description                     |
|---------------|--------|---------------------------------|
| `employee_id` | uint   | Filter by employee              |
| `status`      | string | Filter by overall status        |
| `type`        | string | Filter by type (paid/unpaid)    |
| `year`        | int    | Filter by year                  |
| `page`        | int    | Page number (default: 1)        |
| `size`        | int    | Page size (default: 20)         |

**Response (200):** Paginated leave requests

---

### 6.3 Get Leave Request
**`GET /leave/:id`** — All authenticated

**Response (200):** Single leave request with employee info

---

### 6.4 Get Leave Balance
**`GET /leave/balance`** — All authenticated

Returns current year's leave balance. Creates balance record if not exists.

**Query Parameters:**

| Param  | Type | Description                      |
|--------|------|----------------------------------|
| `year` | int  | Year (default: current year)     |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": 2,
    "year": 2026,
    "total_days": 12,
    "used_days": 3,
    "remaining_days": 9
  }
}
```

---

### 6.5 Leader Approve/Reject Leave
**`POST /leave/:id/leader-approve`** — Leader, Admin

**First stage** of 2-level approval.

**Request:**
```json
{
  "status": "approved",
  "comment": "Approved"
}
```

**Validation:**
- `status` — required, one of: `approved`, `rejected`

**Response (200):** Updated leave request

**Flow:**
1. Verify leave request exists and `leader_status == pending`
2. If `rejected` → set `overall_status = rejected`
3. If `approved` → `overall_status` stays `pending` (awaits HR)
4. Notify employee of leader's decision
5. If approved → notify all HR users for second-stage review

---

### 6.6 HR Approve/Reject Leave
**`POST /leave/:id/hr-approve`** — HR, Admin

**Second stage** of 2-level approval. Leader must approve first.

**Request:**
```json
{
  "status": "approved",
  "comment": "Final approval"
}
```

**Response (200):** Updated leave request

**Flow:**
1. Verify `leader_status == approved` (reject if not)
2. Verify `hr_status == pending`
3. Set `hr_status` and `overall_status` to the decision
4. If approved AND type is `paid` → deduct from leave balance
5. Notify employee of final decision

---

### 6.7 Cancel Leave Request
**`DELETE /leave/:id`** — Request owner only

**Errors:**
- `400` — Cannot cancel approved leave
- `403` — Can only cancel own requests

**Response (200):**
```json
{
  "success": true,
  "message": "Leave request cancelled"
}
```

---

## 7. Overtime

### 7.1 Create Overtime Request
**`POST /overtime`** — All authenticated

**Request:**
```json
{
  "date": "2026-04-01",
  "start_time": "18:00",
  "end_time": "21:00",
  "hours": 3,
  "reason": "Urgent deployment"
}
```

**Validation:**
- `date`, `start_time`, `end_time` — required
- `hours` — required, min 0.5

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": 2,
    "date": "2026-04-01",
    "start_time": "18:00",
    "end_time": "21:00",
    "hours": 3,
    "reason": "Urgent deployment",
    "leader_status": "pending",
    "ceo_status": "pending",
    "overall_status": "pending"
  }
}
```

**Flow:**
1. Look up employee profile
2. Create OT request with all statuses = `pending`
3. Notify team leader

---

### 7.2 List Overtime Requests
**`GET /overtime`** — All authenticated

**Query Parameters:**

| Param         | Type   | Description                     |
|---------------|--------|---------------------------------|
| `employee_id` | uint   | Filter by employee              |
| `status`      | string | Filter by overall status        |
| `month`       | int    | Filter by month                 |
| `year`        | int    | Filter by year                  |
| `page`        | int    | Page number (default: 1)        |
| `size`        | int    | Page size (default: 20)         |

**Response (200):** Paginated OT requests

---

### 7.3 Get Overtime Request
**`GET /overtime/:id`** — All authenticated

**Response (200):** Single OT request with employee info

---

### 7.4 Leader Approve/Reject OT
**`POST /overtime/:id/leader-approve`** — Leader, Admin

**First stage** of 2-level approval.

**Request:**
```json
{
  "status": "approved",
  "comment": "OK"
}
```

**Response (200):** Updated OT request

**Flow:**
1. Verify `leader_status == pending`
2. If `rejected` → set `overall_status = rejected`
3. If `approved` → notify all CEO users for second-stage approval
4. Notify employee

---

### 7.5 CEO Approve/Reject OT
**`POST /overtime/:id/ceo-approve`** — CEO, Admin

**Second stage**. Leader must approve first.

**Request:**
```json
{
  "status": "approved",
  "comment": "Final OK"
}
```

**Response (200):** Updated OT request

**Flow:**
1. Verify `leader_status == approved`
2. Verify `ceo_status == pending`
3. Set `ceo_status` and `overall_status`
4. Notify employee of final decision

---

### 7.6 Cancel Overtime Request
**`DELETE /overtime/:id`** — Request owner only

**Errors:**
- `400` — Cannot cancel approved OT
- `403` — Can only cancel own requests

**Response (200):**
```json
{
  "success": true,
  "message": "Overtime request cancelled"
}
```

---

## 8. Salary / Payroll

### 8.1 Run Payroll
**`POST /salary/run-payroll`** — Admin, HR

Calculates and saves salary records for all active employees for a given month.

**Request:**
```json
{
  "month": 3,
  "year": 2026
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "employee_id": 2,
      "full_name": "John Doe",
      "basic_salary": 15000000,
      "insurance_salary": 8000000,
      "total_allowances": 500000,
      "ot_hours": 6,
      "ot_rate": 108173.08,
      "total_ot_pay": 649038.46,
      "total_bonus": 2000000,
      "bhxh": 640000,
      "bhyt": 120000,
      "bhtn": 80000,
      "total_deductions": 840000,
      "salary_advance": 0,
      "net_salary": 17309038.46
    }
  ]
}
```

**Flow:**
1. Fetch all active employees (skip `is_active = false`)
2. For each employee, compute:
   - **Basic salary**: from employee profile
   - **Total allowances**: sum of assigned employee allowances
   - **OT pay**: sum of approved OT hours × hourly rate
     - Hourly rate = `basic_salary / 26 days / 8 hours × 1.5`
   - **Total bonus**: sum of bonuses for the month (KPI, project, commission)
   - **Deductions** (based on `insurance_salary`):
     - BHXH (Social Insurance): 8%
     - BHYT (Health Insurance): 1.5%
     - BHTN (Unemployment Insurance): 1%
   - **Salary advance**: sum of advances for the month
   - **Net salary** = basic + allowances + OT + bonus - deductions - advance
3. Upsert salary record (draft status)
4. Notify each employee

---

### 8.2 List Salary Records
**`GET /salary`** — Admin, HR, CEO

**Query Parameters:**

| Param         | Type   | Description                     |
|---------------|--------|---------------------------------|
| `month`       | int    | Filter by month                 |
| `year`        | int    | Filter by year                  |
| `page`        | int    | Page number (default: 1)        |
| `size`        | int    | Page size (default: 20)         |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 2,
      "month": 3,
      "year": 2026,
      "basic_salary": 15000000,
      "total_allowances": 500000,
      "total_ot_pay": 649038.46,
      "total_bonus": 2000000,
      "total_deductions": 840000,
      "salary_advance": 0,
      "net_salary": 17309038.46,
      "status": "draft",
      "employee": { "id": 2, "full_name": "John Doe" }
    }
  ],
  "total": 25,
  "page": 1,
  "size": 20
}
```

---

### 8.3 Get My Salary
**`GET /salary/me`** — Admin, HR, CEO

Returns own salary for a given month/year.

**Query Parameters:** `month`, `year`

---

### 8.4 Get Employee Salary
**`GET /salary/employee/:employee_id`** — Admin, HR, CEO

**Query Parameters:** `month`, `year`

**Response (200):** Single salary record

---

### 8.5 Confirm Salary Record
**`POST /salary/:id/confirm`** — Admin only

Changes salary record status from `draft` to `confirmed`.

**Response (200):**
```json
{
  "success": true,
  "message": "Salary record confirmed"
}
```

---

### 8.6 List Allowance Types
**`GET /salary/allowance-types`** — Admin, HR, CEO

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Transport", "description": "Monthly transport allowance" },
    { "id": 2, "name": "Meal", "description": "Daily meal allowance" }
  ]
}
```

---

### 8.7 Create Allowance Type
**`POST /salary/allowance-types`** — Admin only

**Request:**
```json
{
  "name": "Phone",
  "description": "Phone bill allowance"
}
```

**Response (201):** Created allowance type

---

### 8.8 Delete Allowance Type
**`DELETE /salary/allowance-types/:id`** — Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Allowance type deleted"
}
```

---

### 8.9 Add Bonus
**`POST /salary/bonuses`** — Admin, HR

**Request:**
```json
{
  "employee_id": 2,
  "month": 3,
  "year": 2026,
  "type": "kpi",
  "amount": 2000000,
  "description": "Q1 KPI bonus"
}
```

**Validation:**
- `type` — required (e.g., `kpi`, `project`, `commission`)
- `month` — 1-12
- `amount` — required

**Response (201):** Created bonus object

---

### 8.10 Add Salary Advance
**`POST /salary/advances`** — Admin, HR

**Request:**
```json
{
  "employee_id": 2,
  "month": 3,
  "year": 2026,
  "amount": 5000000,
  "reason": "Emergency"
}
```

**Response (201):** Created salary advance (auto-approved)

---

## 9. Notifications

### 9.1 List Notifications
**`GET /notifications`** — All authenticated

Returns notifications for the current user.

**Query Parameters:**

| Param     | Type   | Description                      |
|-----------|--------|----------------------------------|
| `is_read` | bool   | Filter by read status            |
| `type`    | string | Filter by type (leave/ot/salary/attendance) |
| `page`    | int    | Page number (default: 1)         |
| `size`    | int    | Page size (default: 20)          |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "title": "Leave Request Update",
      "body": "Your leave request has been approved by your team leader",
      "type": "leave",
      "is_read": false,
      "reference_id": 5,
      "reference_type": "leave_request",
      "created_at": "2026-03-19T10:30:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "size": 20
}
```

---

### 9.2 Get Unread Count
**`GET /notifications/unread-count`** — All authenticated

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### 9.3 Mark Notification as Read
**`PATCH /notifications/:id/read`** — All authenticated

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 9.4 Mark All as Read
**`PATCH /notifications/read-all`** — All authenticated

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Health Check

### `GET /health` — Public

**Response (200):**
```json
{
  "status": "ok",
  "service": "exn-hr-api"
}
```

---

## Business Flow Summary

### Leave Approval Flow (2-level)
```
Employee → Submit Leave Request (status: pending/pending/pending)
         → Notify Leader
Leader   → Approve (leader_status: approved, overall: pending)
         → Notify Employee + Notify HR
     OR  → Reject (leader_status: rejected, overall: rejected)
         → Notify Employee
HR       → Approve (hr_status: approved, overall: approved)
         → Deduct from leave balance (if paid)
         → Notify Employee
     OR  → Reject (hr_status: rejected, overall: rejected)
         → Notify Employee
```

### Overtime Approval Flow (2-level)
```
Employee → Submit OT Request (status: pending/pending/pending)
         → Notify Leader
Leader   → Approve (leader_status: approved, overall: pending)
         → Notify Employee + Notify CEO
     OR  → Reject (leader_status: rejected, overall: rejected)
         → Notify Employee
CEO      → Approve (ceo_status: approved, overall: approved)
         → Notify Employee
     OR  → Reject (ceo_status: rejected, overall: rejected)
         → Notify Employee
```

### Payroll Calculation Formula
```
Net Salary = Basic Salary
           + Total Allowances (sum of all assigned allowance amounts)
           + OT Pay (approved_ot_hours × basic / 26 / 8 × 1.5)
           + Total Bonus (sum of all bonuses for the month)
           - Insurance Deductions:
               BHXH = insurance_salary × 8%
               BHYT = insurance_salary × 1.5%
               BHTN = insurance_salary × 1%
           - Salary Advance (sum of advances for the month)
```

### Attendance Check-in/out Rules
- GPS must be within `radius_meters` of any configured office location (Haversine formula)
- OR WiFi SSID must match any approved WiFi network
- Cannot check-in twice (must check-out first)
- Cannot check-out without active check-in
