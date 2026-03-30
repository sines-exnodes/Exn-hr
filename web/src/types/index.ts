// ============================================================
// Shared types for Exn-Hr Web Admin
// Synced with API.md — Base URL: http://localhost:8080/api/v1
// ============================================================

// ---- Generic API Response ----

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  size: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

// ---- Auth ----

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// ---- User ----

export type Role = "admin" | "ceo" | "hr" | "leader" | "employee";

export interface User {
  id: number;
  email: string;
  role: Role;
  is_active: boolean;
}

// ---- Employee ----

export interface Employee {
  id: number;
  user_id: number;
  full_name: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: "male" | "female";
  join_date: string;
  position: string;
  team_id?: number;
  basic_salary: number;
  insurance_salary: number;
  contract_type?:
    | "full_time"
    | "expat"
    | "probation"
    | "intern"
    | "collaborator"
    | "service_contract";
  number_of_dependents?: number;
  bank_account?: string;
  bank_name?: string;
  bank_holder_name?: string;
  payment_method?: "bank_transfer" | "cash";
  created_at: string;
  updated_at: string;
  user?: User;
  team?: Team;
}

export interface CreateEmployeeRequest {
  email: string;
  password: string;
  role: Role;
  full_name: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: "male" | "female";
  join_date: string;
  position: string;
  team_id?: number;
  basic_salary: number;
  insurance_salary: number;
  contract_type?:
    | "full_time"
    | "expat"
    | "probation"
    | "intern"
    | "collaborator"
    | "service_contract";
  number_of_dependents?: number;
  bank_account?: string;
  bank_name?: string;
  bank_holder_name?: string;
  payment_method?: "bank_transfer" | "cash";
}

export interface UpdateEmployeeRequest {
  full_name?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: "male" | "female";
  join_date?: string;
  position?: string;
  team_id?: number;
  /** Gửi true để gỡ nhân viên khỏi team (không thuộc phòng ban qua team nữa) */
  clear_team?: boolean;
  basic_salary?: number;
  insurance_salary?: number;
  is_active?: boolean;
  contract_type?:
    | "full_time"
    | "expat"
    | "probation"
    | "intern"
    | "collaborator"
    | "service_contract";
  number_of_dependents?: number;
  bank_account?: string;
  bank_name?: string;
  bank_holder_name?: string;
  payment_method?: "bank_transfer" | "cash";
}

// ---- Department ----

export interface Department {
  id: number;
  name: string;
  description?: string;
  teams?: Team[];
}

// ---- Team ----

export interface Team {
  id: number;
  name: string;
  department_id: number;
  leader_id?: number;
  department?: { id: number; name: string };
  leader?: { id: number; full_name: string };
  members?: Employee[];
}

// ---- Attendance ----

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  check_in_time?: string;
  check_out_time?: string;
  gps_lat?: number;
  gps_lng?: number;
  wifi_ssid?: string;
  status: "checked_in" | "checked_out";
  employee?: Employee;
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  wifi_ssid?: string;
}

export interface OfficeLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  approved_wifis?: ApprovedWifi[];
}

export interface ApprovedWifi {
  id: number;
  ssid: string;
  bssid?: string;
  office_location_id: number;
}

// ---- Leave ----

export type LeaveType = "paid" | "unpaid";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: number;
  employee_id: number;
  type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  leader_status: ApprovalStatus;
  hr_status: ApprovalStatus;
  overall_status: ApprovalStatus;
  leader_comment?: string;
  hr_comment?: string;
  created_at?: string;
  employee?: Employee;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

export interface ApproveRequest {
  status: "approved" | "rejected";
  comment?: string;
}

// ---- Overtime ----

export interface OvertimeRequest {
  id: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  reason: string;
  leader_status: ApprovalStatus;
  ceo_status: ApprovalStatus;
  overall_status: ApprovalStatus;
  leader_comment?: string;
  ceo_comment?: string;
  ot_type?: "normal" | "weekend" | "holiday";
  created_at?: string;
  employee?: Employee;
}

// ---- Salary / Payroll ----

export interface SalaryRecord {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  basic_salary: number;
  insurance_salary?: number;
  total_allowances: number;
  ot_hours?: number;
  ot_rate?: number;
  total_ot_pay: number;
  total_bonus: number;
  bhxh?: number;
  bhyt?: number;
  bhtn?: number;
  total_deductions: number;
  salary_advance: number;
  net_salary: number;
  standard_work_days?: number;
  actual_work_days?: number;
  ot_pay_normal?: number;
  ot_pay_weekend?: number;
  ot_pay_holiday?: number;
  parking_fee?: number;
  taxable_income?: number;
  personal_deduction?: number;
  dependent_deduction?: number;
  pit_amount?: number;
  union_fee_employee?: number;
  union_fee_employer?: number;
  prorated_salary?: number;
  employer_insurance_cost?: number;
  employer_bhxh?: number;
  employer_bhyt?: number;
  employer_bhtn?: number;
  employer_tnnn?: number;
  total_employer_cost?: number;
  status: "draft" | "confirmed";
  payment_date?: string;
  employee?: Employee;
}

export interface RunPayrollRequest {
  month: number;
  year: number;
  standard_work_days: number;
}

// ---- Allowance ----

export interface AllowanceType {
  id: number;
  name: string;
  description?: string;
  is_taxable?: boolean;
}

export interface EmployeeAllowance {
  id: number;
  employee_id: number;
  allowance_id: number;
  amount: number;
  allowance?: AllowanceType;
}

// ---- Bonus ----

export interface Bonus {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  type: string;
  amount: number;
  description?: string;
}

// ---- Salary Advance ----

export interface SalaryAdvance {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  amount: number;
  reason?: string;
}

// ---- Notification ----

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  type: "leave" | "ot" | "salary" | "attendance";
  is_read: boolean;
  reference_id?: number;
  reference_type?: string;
  created_at: string;
}

// ---- Dashboard Stats (derived) ----

export interface DashboardStats {
  total_employees: number;
  present_today: number;
  on_leave: number;
  pending_leave_requests: number;
  pending_overtime_requests: number;
  total_departments: number;
}

// ---- Project & Workload ----

export type ProjectStatus = "active" | "completed" | "on_hold";
export type ProjectRole =
  | "backend"
  | "frontend"
  | "fullstack"
  | "mobile"
  | "qa"
  | "qc"
  | "ba"
  | "designer"
  | "pm"
  | "devops";

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  assignments?: ProjectAssignment[];
}

export interface ProjectAssignment {
  id: number;
  project_id: number;
  employee_id: number;
  role: ProjectRole;
  allocation_percentage: number;
  start_date?: string;
  end_date?: string;
  project?: Project;
  employee?: Employee;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
}

export interface AssignMemberRequest {
  employee_id: number;
  role: ProjectRole;
  allocation_percentage?: number;
  start_date?: string;
  end_date?: string;
}

export interface WorkloadOverview {
  total_employees: number;
  total_projects: number;
  employees_by_department: Record<string, number>;
  overloaded_employees: Array<{
    employee: Employee;
    project_count: number;
  }>;
}

// ---- Project Members (REQ-002 spec) ----
// Note: ProjectAssignment above uses the old role schema (frontend/backend/…).
// ProjectMember below matches the REQ-002 API contract (pm/ba/dev/…).

export type ProjectMemberRole = "pm" | "ba" | "dev" | "tester" | "designer" | "other";

export interface ProjectMember {
  id: number;
  project_id: number;
  employee_id: number;
  project_role: ProjectMemberRole;
  joined_at?: string;
  employee?: Employee;
}

export interface AddProjectMemberRequest {
  employee_id: number;
  project_role: ProjectMemberRole;
}

// ---- Milestones ----

export type MilestoneStatus = "upcoming" | "in_progress" | "completed" | "overdue";

export interface MilestoneItem {
  id?: number;
  milestone_id?: number;
  content: string;
  is_completed: boolean;
  display_order?: number;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  deadline?: string;
  status: MilestoneStatus;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  items?: MilestoneItem[];
}

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  deadline?: string;
  items?: Array<{ content: string; display_order?: number }>;
}

export interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  deadline?: string;
  status?: MilestoneStatus;
  items?: Array<{
    id?: number;
    content: string;
    is_completed?: boolean;
    display_order?: number;
  }>;
}

// ---- Announcements ----

export type AnnouncementTargetType = "all" | "team" | "project";

export interface PollOption {
  id: number;
  poll_id?: number;
  text: string;
  vote_count: number;
  percentage?: number;
  display_order?: number;
}

export interface Poll {
  id: number;
  announcement_id?: number;
  question: string;
  is_multiple_choice: boolean;
  is_anonymous: boolean;
  deadline?: string;
  status: "active" | "closed";
  options?: PollOption[];
  created_at?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  target_type: AnnouncementTargetType;
  target_id?: number | null;
  is_pinned: boolean;
  expires_at?: string | null;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  poll?: Poll;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  target_type: AnnouncementTargetType;
  target_id?: number | null;
  is_pinned?: boolean;
  expires_at?: string | null;
  poll?: {
    question: string;
    is_multiple_choice: boolean;
    is_anonymous: boolean;
    deadline?: string;
    options: Array<{ text: string; display_order?: number }>;
  };
}

export interface PollResults {
  poll_id: number;
  question: string;
  total_votes: number;
  is_anonymous: boolean;
  is_closed: boolean;
  my_votes: number[];
  options: Array<{
    id: number;
    text: string;
    vote_count: number;
    percentage: number;
  }>;
  voters?: Array<{
    option_id: number;
    employee: Employee;
  }> | null;
}
