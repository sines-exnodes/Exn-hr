#!/bin/bash
# ============================================================
# Exn-Hr Sample Data Seed Script
# Calls APIs to populate a realistic dataset for development
# ============================================================

# Ensure UTF-8 encoding on Windows
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

BASE="http://localhost:8080/api/v1"
set -e

# Helper: POST/GET/PUT/PATCH/DELETE with token (charset=utf-8 for Vietnamese)
post()  { curl -s -X POST   "$BASE$1" -H "Content-Type: application/json; charset=utf-8" -H "Authorization: Bearer $TOKEN" --data-raw "$2"; }
get()   { curl -s -X GET    "$BASE$1" -H "Authorization: Bearer $TOKEN"; }
put()   { curl -s -X PUT    "$BASE$1" -H "Content-Type: application/json; charset=utf-8" -H "Authorization: Bearer $TOKEN" --data-raw "$2"; }
patch() { curl -s -X PATCH  "$BASE$1" -H "Content-Type: application/json; charset=utf-8" -H "Authorization: Bearer $TOKEN" --data-raw "$2"; }
del()   { curl -s -X DELETE "$BASE$1" -H "Authorization: Bearer $TOKEN"; }

echo "============================================"
echo "  Exn-Hr — Seeding Sample Data"
echo "============================================"
echo ""

# ============================================================
# 1. LOGIN AS ADMIN
# ============================================================
echo ">>> [1/12] Login as Admin..."
LOGIN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exn.vn","password":"admin123"}')
TOKEN=$(echo $LOGIN | python -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || \
        echo $LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
echo "   Admin token acquired."
echo ""

# ============================================================
# 2. CREATE DEPARTMENTS
# ============================================================
echo ">>> [2/12] Creating Departments..."
post "/departments" '{"name":"Ban Giám đốc","description":"Ban lãnh đạo công ty"}'         > /dev/null
post "/departments" '{"name":"Phòng Kỹ thuật","description":"Phát triển phần mềm"}'        > /dev/null
post "/departments" '{"name":"Phòng Nhân sự","description":"Quản lý nhân sự & tuyển dụng"}' > /dev/null
post "/departments" '{"name":"Phòng Kinh doanh","description":"Kinh doanh & marketing"}'   > /dev/null
echo "   4 departments created."
echo ""

# ============================================================
# 3. CREATE EMPLOYEES (various roles)
# ============================================================
echo ">>> [3/12] Creating Employees..."

# CEO
post "/employees" '{
  "email":"ceo@exn.vn","password":"password123","role":"ceo",
  "full_name":"Nguyen Van CEO","phone":"0901000001","address":"Q1, HCM",
  "dob":"1978-05-15","gender":"male","join_date":"2020-01-01","position":"CEO",
  "basic_salary":50000000,"insurance_salary":20000000
}' > /dev/null

# HR Manager
post "/employees" '{
  "email":"hr@exn.vn","password":"password123","role":"hr",
  "full_name":"Tran Thi HR","phone":"0901000002","address":"Q3, HCM",
  "dob":"1985-08-20","gender":"female","join_date":"2021-03-01","position":"HR Manager",
  "basic_salary":30000000,"insurance_salary":15000000
}' > /dev/null

# Tech Leader
post "/employees" '{
  "email":"leader.tech@exn.vn","password":"password123","role":"leader",
  "full_name":"Le Van Leader","phone":"0901000003","address":"Q7, HCM",
  "dob":"1988-11-10","gender":"male","join_date":"2021-06-01","position":"Tech Lead",
  "basic_salary":35000000,"insurance_salary":18000000
}' > /dev/null

# Sales Leader
post "/employees" '{
  "email":"leader.sales@exn.vn","password":"password123","role":"leader",
  "full_name":"Pham Thi Sales Lead","phone":"0901000004","address":"Q10, HCM",
  "dob":"1990-02-28","gender":"female","join_date":"2022-01-01","position":"Sales Lead",
  "basic_salary":30000000,"insurance_salary":15000000
}' > /dev/null

# Backend Dev 1
post "/employees" '{
  "email":"dev1@exn.vn","password":"password123","role":"employee",
  "full_name":"Hoang Minh Dev","phone":"0901000005","address":"Binh Thanh, HCM",
  "dob":"1995-04-12","gender":"male","join_date":"2022-06-01","position":"Backend Developer",
  "basic_salary":20000000,"insurance_salary":10000000
}' > /dev/null

# Frontend Dev
post "/employees" '{
  "email":"dev2@exn.vn","password":"password123","role":"employee",
  "full_name":"Nguyen Thi Frontend","phone":"0901000006","address":"Thu Duc, HCM",
  "dob":"1996-07-25","gender":"female","join_date":"2022-09-01","position":"Frontend Developer",
  "basic_salary":18000000,"insurance_salary":9000000
}' > /dev/null

# Mobile Dev
post "/employees" '{
  "email":"dev3@exn.vn","password":"password123","role":"employee",
  "full_name":"Tran Van Mobile","phone":"0901000007","address":"Go Vap, HCM",
  "dob":"1997-01-30","gender":"male","join_date":"2023-01-01","position":"Mobile Developer",
  "basic_salary":18000000,"insurance_salary":9000000
}' > /dev/null

# QA/Tester
post "/employees" '{
  "email":"qa@exn.vn","password":"password123","role":"employee",
  "full_name":"Vo Thi QA","phone":"0901000008","address":"Q5, HCM",
  "dob":"1994-09-18","gender":"female","join_date":"2022-03-01","position":"QA Tester",
  "basic_salary":16000000,"insurance_salary":8000000
}' > /dev/null

# Designer
post "/employees" '{
  "email":"designer@exn.vn","password":"password123","role":"employee",
  "full_name":"Le Thi Design","phone":"0901000009","address":"Q2, HCM",
  "dob":"1996-12-05","gender":"female","join_date":"2023-03-01","position":"UI/UX Designer",
  "basic_salary":17000000,"insurance_salary":8500000
}' > /dev/null

# Sales 1
post "/employees" '{
  "email":"sales1@exn.vn","password":"password123","role":"employee",
  "full_name":"Nguyen Van Sales","phone":"0901000010","address":"Q4, HCM",
  "dob":"1993-06-22","gender":"male","join_date":"2022-08-01","position":"Sales Executive",
  "basic_salary":15000000,"insurance_salary":7500000
}' > /dev/null

# Sales 2
post "/employees" '{
  "email":"sales2@exn.vn","password":"password123","role":"employee",
  "full_name":"Pham Van Sales2","phone":"0901000011","address":"Q6, HCM",
  "dob":"1995-03-14","gender":"male","join_date":"2023-05-01","position":"Sales Executive",
  "basic_salary":15000000,"insurance_salary":7500000
}' > /dev/null

# HR Staff
post "/employees" '{
  "email":"hr.staff@exn.vn","password":"password123","role":"employee",
  "full_name":"Dao Thi HR Staff","phone":"0901000012","address":"Q8, HCM",
  "dob":"1998-10-08","gender":"female","join_date":"2024-01-01","position":"HR Staff",
  "basic_salary":13000000,"insurance_salary":6500000
}' > /dev/null

echo "   12 employees created (CEO, HR, 2 Leaders, 8 Staff)."
echo ""

# ============================================================
# 4. CREATE TEAMS & ASSIGN LEADERS
# ============================================================
echo ">>> [4/12] Creating Teams..."

# Get employee IDs — Admin=emp1, CEO=emp2, HR=emp3, TechLead=emp4, SalesLead=emp5
# Employees: dev1=emp6, dev2=emp7, dev3=emp8, qa=emp9, designer=emp10, sales1=emp11, sales2=emp12, hrstaff=emp13

# Backend Team (dept=2 Engineering, leader=emp4 TechLead)
post "/teams" '{"name":"Backend Team","department_id":2,"leader_id":4}' > /dev/null

# Frontend Team (dept=2 Engineering, leader=emp4 TechLead)
post "/teams" '{"name":"Frontend Team","department_id":2,"leader_id":4}' > /dev/null

# Sales Team (dept=4 Kinh doanh, leader=emp5 SalesLead)
post "/teams" '{"name":"Sales Team","department_id":4,"leader_id":5}' > /dev/null

# HR Team (dept=3 Nhân sự, no leader for now)
post "/teams" '{"name":"HR Team","department_id":3}' > /dev/null

echo "   4 teams created."
echo ""

# ============================================================
# 5. ASSIGN EMPLOYEES TO TEAMS
# ============================================================
echo ">>> [5/12] Assigning Employees to Teams..."

# Backend Team (id=1): dev1=emp6, dev3=emp8
put "/employees/6" '{"team_id":1}'  > /dev/null
put "/employees/8" '{"team_id":1}'  > /dev/null

# Frontend Team (id=2): dev2=emp7, qa=emp9, designer=emp10
put "/employees/7" '{"team_id":2}'  > /dev/null
put "/employees/9" '{"team_id":2}'  > /dev/null
put "/employees/10" '{"team_id":2}' > /dev/null

# Sales Team (id=3): sales1=emp11, sales2=emp12
put "/employees/11" '{"team_id":3}' > /dev/null
put "/employees/12" '{"team_id":3}' > /dev/null

# HR Team (id=4): hrstaff=emp13
put "/employees/13" '{"team_id":4}' > /dev/null

# Leaders assigned to their own teams
put "/employees/4" '{"team_id":1}' > /dev/null
put "/employees/5" '{"team_id":3}' > /dev/null

echo "   10 employees assigned to teams."
echo ""

# ============================================================
# 6. OFFICE LOCATIONS & APPROVED WIFI
# ============================================================
echo ">>> [6/12] Setting up Office Locations..."

post "/attendance/office-locations" '{
  "name":"Trụ sở chính - Q1 HCM",
  "latitude":10.762622,"longitude":106.660172,"radius_meters":200
}' > /dev/null

post "/attendance/office-locations" '{
  "name":"Chi nhánh Hà Nội",
  "latitude":21.027763,"longitude":105.834160,"radius_meters":150
}' > /dev/null

post "/attendance/approved-wifi" '{"ssid":"EXN-Office-5G","bssid":"AA:BB:CC:11:22:33","office_location_id":1}' > /dev/null
post "/attendance/approved-wifi" '{"ssid":"EXN-Office-2.4G","bssid":"AA:BB:CC:44:55:66","office_location_id":1}' > /dev/null
post "/attendance/approved-wifi" '{"ssid":"EXN-HN-5G","bssid":"DD:EE:FF:11:22:33","office_location_id":2}' > /dev/null

echo "   2 office locations + 3 WiFi networks configured."
echo ""

# ============================================================
# 7. ALLOWANCE TYPES & ASSIGN TO EMPLOYEES
# ============================================================
echo ">>> [7/12] Creating Allowance Types..."

post "/salary/allowance-types" '{"name":"Phụ cấp xăng xe","description":"Phụ cấp đi lại hàng tháng"}'       > /dev/null
post "/salary/allowance-types" '{"name":"Phụ cấp ăn trưa","description":"Phụ cấp bữa trưa hàng ngày"}'       > /dev/null
post "/salary/allowance-types" '{"name":"Phụ cấp điện thoại","description":"Phụ cấp cước điện thoại"}'        > /dev/null
post "/salary/allowance-types" '{"name":"Phụ cấp chức vụ","description":"Phụ cấp dành cho vị trí quản lý"}'   > /dev/null

echo "   4 allowance types created."
echo ""

echo ">>> [7b/12] Assigning Allowances to Employees..."

# CEO: all allowances
post "/employees/2/allowances" '{"allowance_id":1,"amount":1000000}' > /dev/null
post "/employees/2/allowances" '{"allowance_id":2,"amount":500000}'  > /dev/null
post "/employees/2/allowances" '{"allowance_id":3,"amount":500000}'  > /dev/null
post "/employees/2/allowances" '{"allowance_id":4,"amount":3000000}' > /dev/null

# HR Manager
post "/employees/3/allowances" '{"allowance_id":1,"amount":500000}'  > /dev/null
post "/employees/3/allowances" '{"allowance_id":2,"amount":500000}'  > /dev/null
post "/employees/3/allowances" '{"allowance_id":4,"amount":2000000}' > /dev/null

# Tech Leader
post "/employees/4/allowances" '{"allowance_id":1,"amount":500000}'  > /dev/null
post "/employees/4/allowances" '{"allowance_id":2,"amount":500000}'  > /dev/null
post "/employees/4/allowances" '{"allowance_id":3,"amount":300000}'  > /dev/null
post "/employees/4/allowances" '{"allowance_id":4,"amount":2000000}' > /dev/null

# Sales Leader
post "/employees/5/allowances" '{"allowance_id":1,"amount":800000}'  > /dev/null
post "/employees/5/allowances" '{"allowance_id":2,"amount":500000}'  > /dev/null
post "/employees/5/allowances" '{"allowance_id":4,"amount":1500000}' > /dev/null

# Dev employees: transport + lunch
for EMP_ID in 6 7 8 9 10; do
  post "/employees/$EMP_ID/allowances" '{"allowance_id":1,"amount":500000}' > /dev/null
  post "/employees/$EMP_ID/allowances" '{"allowance_id":2,"amount":500000}' > /dev/null
done

# Sales: transport + phone
for EMP_ID in 11 12; do
  post "/employees/$EMP_ID/allowances" '{"allowance_id":1,"amount":800000}' > /dev/null
  post "/employees/$EMP_ID/allowances" '{"allowance_id":2,"amount":500000}' > /dev/null
  post "/employees/$EMP_ID/allowances" '{"allowance_id":3,"amount":500000}' > /dev/null
done

# HR Staff
post "/employees/13/allowances" '{"allowance_id":1,"amount":500000}' > /dev/null
post "/employees/13/allowances" '{"allowance_id":2,"amount":500000}' > /dev/null

echo "   Allowances assigned to all employees."
echo ""

# ============================================================
# 8. ATTENDANCE RECORDS (check-in/out as various employees)
# ============================================================
echo ">>> [8/12] Creating Attendance Records..."

checkin_as() {
  local email=$1
  local lat=$2
  local lng=$3
  local wifi=$4

  local login_resp=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"password123\"}")
  local emp_token=$(echo $login_resp | python -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || \
                    echo $login_resp | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

  # Check in
  curl -s -X POST "$BASE/attendance/check-in" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $emp_token" \
    -d "{\"latitude\":$lat,\"longitude\":$lng,\"wifi_ssid\":\"$wifi\"}" > /dev/null

  # Check out
  curl -s -X POST "$BASE/attendance/check-out" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $emp_token" \
    -d "{\"latitude\":$lat,\"longitude\":$lng,\"wifi_ssid\":\"$wifi\"}" > /dev/null
}

# Several employees check in/out today
checkin_as "dev1@exn.vn"         10.762622 106.660172 "EXN-Office-5G"
checkin_as "dev2@exn.vn"         10.762622 106.660172 "EXN-Office-5G"
checkin_as "dev3@exn.vn"         10.762622 106.660172 "EXN-Office-2.4G"
checkin_as "qa@exn.vn"           10.762622 106.660172 "EXN-Office-5G"
checkin_as "designer@exn.vn"     10.762622 106.660172 "EXN-Office-5G"
checkin_as "leader.tech@exn.vn"  10.762622 106.660172 "EXN-Office-5G"
checkin_as "sales1@exn.vn"       10.762622 106.660172 "EXN-Office-2.4G"

echo "   7 attendance records created (check-in + check-out)."
echo ""

# ============================================================
# 9. LEAVE REQUESTS (various statuses)
# ============================================================
echo ">>> [9/12] Creating Leave Requests..."

login_get_token() {
  local email=$1
  local pwd=${2:-password123}
  local resp=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$pwd\"}")
  echo $resp | python -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || \
  echo $resp | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])"
}

# Get tokens for various roles
TOKEN_LEADER=$(login_get_token "leader.tech@exn.vn")
TOKEN_HR=$(login_get_token "hr@exn.vn")
TOKEN_CEO=$(login_get_token "ceo@exn.vn")
TOKEN_DEV1=$(login_get_token "dev1@exn.vn")
TOKEN_DEV2=$(login_get_token "dev2@exn.vn")
TOKEN_DEV3=$(login_get_token "dev3@exn.vn")
TOKEN_QA=$(login_get_token "qa@exn.vn")
TOKEN_SALES1=$(login_get_token "sales1@exn.vn")

# Leave 1: Dev1 — Fully approved (paid, 2 days)
LEAVE1=$(curl -s -X POST "$BASE/leave" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_DEV1" \
  -d '{"type":"paid","start_date":"2026-03-25","end_date":"2026-03-26","days":2,"reason":"Việc gia đình"}')
LEAVE1_ID=$(echo $LEAVE1 | python -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || \
            echo $LEAVE1 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$BASE/leave/$LEAVE1_ID/leader-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_LEADER" \
  -d '{"status":"approved"}' > /dev/null
curl -s -X POST "$BASE/leave/$LEAVE1_ID/hr-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_HR" \
  -d '{"status":"approved"}' > /dev/null

# Leave 2: Dev2 — Leader approved, HR pending (paid, 1 day)
LEAVE2=$(curl -s -X POST "$BASE/leave" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_DEV2" \
  -d '{"type":"paid","start_date":"2026-04-01","end_date":"2026-04-01","days":1,"reason":"Khám sức khoẻ"}')
LEAVE2_ID=$(echo $LEAVE2 | python -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || \
            echo $LEAVE2 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$BASE/leave/$LEAVE2_ID/leader-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_LEADER" \
  -d '{"status":"approved"}' > /dev/null

# Leave 3: Dev3 — Pending leader approval (paid, 3 days)
curl -s -X POST "$BASE/leave" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_DEV3" \
  -d '{"type":"paid","start_date":"2026-04-07","end_date":"2026-04-09","days":3,"reason":"Du lịch cùng gia đình"}' > /dev/null

# Leave 4: QA — Rejected by leader (unpaid, 5 days)
LEAVE4=$(curl -s -X POST "$BASE/leave" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_QA" \
  -d '{"type":"unpaid","start_date":"2026-04-14","end_date":"2026-04-18","days":5,"reason":"Nghỉ dài ngày"}')
LEAVE4_ID=$(echo $LEAVE4 | python -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || \
            echo $LEAVE4 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$BASE/leave/$LEAVE4_ID/leader-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_LEADER" \
  -d '{"status":"rejected"}' > /dev/null

# Leave 5: Dev1 — another approved leave (paid, 0.5 day)
LEAVE5=$(curl -s -X POST "$BASE/leave" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_DEV1" \
  -d '{"type":"paid","start_date":"2026-02-10","end_date":"2026-02-10","days":0.5,"reason":"Nửa ngày khám bệnh"}')
LEAVE5_ID=$(echo $LEAVE5 | python -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || \
            echo $LEAVE5 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$BASE/leave/$LEAVE5_ID/leader-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_LEADER" \
  -d '{"status":"approved"}' > /dev/null
curl -s -X POST "$BASE/leave/$LEAVE5_ID/hr-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_HR" \
  -d '{"status":"approved"}' > /dev/null

echo "   5 leave requests created (2 approved, 1 half-approved, 1 pending, 1 rejected)."
echo ""

# ============================================================
# 10. OVERTIME REQUESTS (various statuses)
# ============================================================
echo ">>> [10/12] Creating Overtime Requests..."

# OT 1: Dev1 — Fully approved (3h)
OT1=$(curl -s -X POST "$BASE/overtime" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_DEV1" \
  -d '{"date":"2026-03-15","start_time":"18:00","end_time":"21:00","hours":3,"reason":"Deploy production hotfix"}')
OT1_ID=$(echo $OT1 | python -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || \
         echo $OT1 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$BASE/overtime/$OT1_ID/leader-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_LEADER" \
  -d '{"status":"approved"}' > /dev/null
curl -s -X POST "$BASE/overtime/$OT1_ID/ceo-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_CEO" \
  -d '{"status":"approved"}' > /dev/null

# OT 2: Dev1 — Fully approved (2h)
OT2=$(curl -s -X POST "$BASE/overtime" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_DEV1" \
  -d '{"date":"2026-03-20","start_time":"19:00","end_time":"21:00","hours":2,"reason":"Sprint deadline"}')
OT2_ID=$(echo $OT2 | python -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || \
         echo $OT2 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$BASE/overtime/$OT2_ID/leader-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_LEADER" \
  -d '{"status":"approved"}' > /dev/null
curl -s -X POST "$BASE/overtime/$OT2_ID/ceo-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_CEO" \
  -d '{"status":"approved"}' > /dev/null

# OT 3: Dev2 — Leader approved, CEO pending (4h)
OT3=$(curl -s -X POST "$BASE/overtime" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_DEV2" \
  -d '{"date":"2026-03-22","start_time":"18:00","end_time":"22:00","hours":4,"reason":"Database migration"}')
OT3_ID=$(echo $OT3 | python -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || \
         echo $OT3 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$BASE/overtime/$OT3_ID/leader-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_LEADER" \
  -d '{"status":"approved"}' > /dev/null

# OT 4: Dev3 — Pending (2h)
curl -s -X POST "$BASE/overtime" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_DEV3" \
  -d '{"date":"2026-03-25","start_time":"18:00","end_time":"20:00","hours":2,"reason":"Bug fixing"}' > /dev/null

# OT 5: QA — Rejected by leader (3h)
OT5=$(curl -s -X POST "$BASE/overtime" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_QA" \
  -d '{"date":"2026-03-18","start_time":"18:00","end_time":"21:00","hours":3,"reason":"Testing regression"}')
OT5_ID=$(echo $OT5 | python -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || \
         echo $OT5 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

curl -s -X POST "$BASE/overtime/$OT5_ID/leader-approve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_LEADER" \
  -d '{"status":"rejected"}' > /dev/null

echo "   5 OT requests (2 approved, 1 half-approved, 1 pending, 1 rejected)."
echo ""

# ============================================================
# 11. BONUSES & SALARY ADVANCES
# ============================================================
echo ">>> [11/12] Adding Bonuses & Salary Advances..."

# Switch back to admin token
TOKEN=$(login_get_token "admin@exn.vn" "admin123")

# Bonuses for March 2026
post "/salary/bonuses" '{"employee_id":6,"month":3,"year":2026,"type":"kpi","amount":2000000,"description":"KPI Q1 đạt 100%"}'           > /dev/null
post "/salary/bonuses" '{"employee_id":7,"month":3,"year":2026,"type":"kpi","amount":1500000,"description":"KPI Q1 đạt 90%"}'             > /dev/null
post "/salary/bonuses" '{"employee_id":8,"month":3,"year":2026,"type":"project","amount":1000000,"description":"Bonus dự án mobile app"}' > /dev/null
post "/salary/bonuses" '{"employee_id":11,"month":3,"year":2026,"type":"commission","amount":3000000,"description":"Hoa hồng deal Q1"}'   > /dev/null
post "/salary/bonuses" '{"employee_id":4,"month":3,"year":2026,"type":"kpi","amount":3000000,"description":"KPI team lead Q1"}'            > /dev/null

# Salary advance
post "/salary/advances" '{"employee_id":8,"month":3,"year":2026,"amount":3000000,"reason":"Ứng lương tháng 3"}'   > /dev/null
post "/salary/advances" '{"employee_id":12,"month":3,"year":2026,"amount":5000000,"reason":"Ứng lương khẩn cấp"}' > /dev/null

echo "   5 bonuses + 2 salary advances created."
echo ""

# ============================================================
# 12. RUN PAYROLL
# ============================================================
echo ">>> [12/12] Running Payroll for March 2026..."

PAYROLL=$(post "/salary/run-payroll" '{"month":3,"year":2026}')
PAYROLL_COUNT=$(echo $PAYROLL | python -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null || \
                echo $PAYROLL | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))")

echo "   Payroll computed for $PAYROLL_COUNT employees."

# Confirm a few salary records
post "/salary/1/confirm" '' > /dev/null 2>&1
post "/salary/2/confirm" '' > /dev/null 2>&1
post "/salary/3/confirm" '' > /dev/null 2>&1

echo "   3 salary records confirmed."
echo ""

# ============================================================
# SUMMARY
# ============================================================
echo "============================================"
echo "  SEED DATA COMPLETE!"
echo "============================================"
echo ""
echo "  Accounts (password: password123):"
echo "  ─────────────────────────────────"
echo "  admin@exn.vn        (admin)    pwd: admin123"
echo "  ceo@exn.vn          (ceo)"
echo "  hr@exn.vn           (hr)"
echo "  leader.tech@exn.vn  (leader)   → Backend/Frontend Team"
echo "  leader.sales@exn.vn (leader)   → Sales Team"
echo "  dev1@exn.vn         (employee) → Backend Team"
echo "  dev2@exn.vn         (employee) → Frontend Team"
echo "  dev3@exn.vn         (employee) → Backend Team"
echo "  qa@exn.vn           (employee) → Frontend Team"
echo "  designer@exn.vn     (employee) → Frontend Team"
echo "  sales1@exn.vn       (employee) → Sales Team"
echo "  sales2@exn.vn       (employee) → Sales Team"
echo "  hr.staff@exn.vn     (employee) → HR Team"
echo ""
echo "  Data:"
echo "  ─────"
echo "  4 Departments / 4 Teams"
echo "  2 Office Locations / 3 WiFi Networks"
echo "  4 Allowance Types"
echo "  7 Attendance Records"
echo "  5 Leave Requests (mixed statuses)"
echo "  5 OT Requests (mixed statuses)"
echo "  5 Bonuses / 2 Salary Advances"
echo "  Payroll: March 2026 (13 employees)"
echo "  Notifications: auto-generated from all flows"
echo ""
