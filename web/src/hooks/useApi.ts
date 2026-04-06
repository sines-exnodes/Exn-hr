"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  Employee,
  Department,
  Dependent,
  CreateDependentRequest,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  OvertimeRequest,
  SalaryRecord,
  AllowanceType,
  Notification,
  OfficeLocation,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CheckInRequest,
  ApproveRequest,
  RunPayrollRequest,
  ChangePasswordRequest,
  CreateLeaveRequest,
  Bonus,
  SalaryAdvance,
  EmployeeAllowance,
  Project,
  ProjectAssignment,
  CreateProjectRequest,
  UpdateProjectRequest,
  AssignMemberRequest,
  WorkloadOverview,
  ProjectMember,
  AddProjectMemberRequest,
  Milestone,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  Announcement,
  CreateAnnouncementRequest,
  AnnouncementTargetType,
  PollResults,
} from "@/types";

// ---- SWR fetcher ----

const fetcher = <T>(path: string) => api.get<T>(path);

// ---- Pagination params ----

interface PaginationParams {
  page?: number;
  size?: number;
}

// ============================================================
// Auth
// ============================================================

export function useCurrentUser() {
  return useSWR("/auth/me", (path) =>
    api.get<
      ApiResponse<{
        id: number;
        email: string;
        role: string;
        is_active: boolean;
      }>
    >(path),
  );
}

export async function changePassword(data: ChangePasswordRequest) {
  return api.post<ApiResponse<null>>("/auth/change-password", data);
}

export async function forgotPassword(data: { email: string }) {
  return api.post<ApiResponse<null>>("/auth/forgot-password", data);
}

// ============================================================
// Employees
// ============================================================

interface EmployeeFilters extends PaginationParams {
  department_id?: number;
  role?: string;
  search?: string;
}

export function useEmployees(
  filters?: EmployeeFilters,
  config?: SWRConfiguration,
) {
  const params = filters as Record<
    string,
    string | number | boolean | undefined
  >;
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return useSWR<PaginatedResponse<Employee>>(
    `/employees${qs}`,
    fetcher,
    config,
  );
}

export function useEmployee(id?: number | string, config?: SWRConfiguration) {
  return useSWR<ApiResponse<Employee>>(
    id ? `/employees/${id}` : null,
    fetcher,
    config,
  );
}

export function useMyProfile(config?: SWRConfiguration) {
  return useSWR<ApiResponse<Employee>>("/employees/me", fetcher, config);
}

export async function createEmployee(data: CreateEmployeeRequest) {
  return api.post<ApiResponse<Employee>>("/employees", data);
}

export async function updateEmployee(id: number, data: UpdateEmployeeRequest) {
  return api.put<ApiResponse<Employee>>(`/employees/${id}`, data);
}

// ---- Employee Allowances ----

export function useEmployeeAllowances(
  employeeId?: number,
  config?: SWRConfiguration,
) {
  return useSWR<ApiResponse<EmployeeAllowance[]>>(
    employeeId ? `/employees/${employeeId}/allowances` : null,
    fetcher,
    config,
  );
}

export async function setEmployeeAllowance(
  employeeId: number,
  data: { allowance_id: number; amount: number },
) {
  return api.post<ApiResponse<null>>(
    `/employees/${employeeId}/allowances`,
    data,
  );
}

export async function deleteEmployeeAllowance(
  employeeId: number,
  allowanceId: number,
) {
  return api.delete<ApiResponse<null>>(
    `/employees/${employeeId}/allowances/${allowanceId}`,
  );
}

// ============================================================
// Departments
// ============================================================

export function useDepartments(config?: SWRConfiguration) {
  return useSWR<ApiResponse<Department[]>>("/departments", fetcher, config);
}

export function useDepartment(id?: number, config?: SWRConfiguration) {
  return useSWR<ApiResponse<Department>>(
    id ? `/departments/${id}` : null,
    fetcher,
    config,
  );
}

export async function createDepartment(data: {
  name: string;
  description?: string;
}) {
  return api.post<ApiResponse<Department>>("/departments", data);
}

export async function updateDepartment(
  id: number,
  data: { name?: string; description?: string },
) {
  return api.put<ApiResponse<Department>>(`/departments/${id}`, data);
}

export async function deleteDepartment(id: number) {
  return api.delete<ApiResponse<null>>(`/departments/${id}`);
}

// ============================================================
// Upload (Cloudinary)
// ============================================================

export async function uploadFile(file: File, folder?: string) {
  const formData = new FormData();
  formData.append("file", file);
  const qs = folder ? `?folder=${encodeURIComponent(folder)}` : "";
  return api.post<ApiResponse<{ url: string; public_id: string }>>(
    `/upload${qs}`,
    formData,
  );
}

// ============================================================
// Dependents
// ============================================================

export function useDependents(employeeId?: number, config?: SWRConfiguration) {
  return useSWR<ApiResponse<Dependent[]>>(
    employeeId ? `/employees/${employeeId}/dependents` : null,
    fetcher,
    config,
  );
}

export async function createDependent(
  employeeId: number,
  data: CreateDependentRequest,
) {
  return api.post<ApiResponse<Dependent>>(
    `/employees/${employeeId}/dependents`,
    data,
  );
}

export async function updateDependent(
  employeeId: number,
  depId: number,
  data: Partial<CreateDependentRequest>,
) {
  return api.put<ApiResponse<Dependent>>(
    `/employees/${employeeId}/dependents/${depId}`,
    data,
  );
}

export async function deleteDependent(employeeId: number, depId: number) {
  return api.delete<ApiResponse<null>>(
    `/employees/${employeeId}/dependents/${depId}`,
  );
}

// ============================================================
// Attendance
// ============================================================

interface AttendanceFilters extends PaginationParams {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
}

export function useAttendanceRecords(
  filters?: AttendanceFilters,
  config?: SWRConfiguration,
) {
  const params = filters as Record<
    string,
    string | number | boolean | undefined
  >;
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return useSWR<PaginatedResponse<AttendanceRecord>>(
    `/attendance${qs}`,
    fetcher,
    config,
  );
}

export function useTodayAttendance(config?: SWRConfiguration) {
  return useSWR<ApiResponse<AttendanceRecord>>(
    "/attendance/today",
    fetcher,
    config,
  );
}

export function useOfficeLocations(config?: SWRConfiguration) {
  return useSWR<ApiResponse<OfficeLocation[]>>(
    "/attendance/office-locations",
    fetcher,
    config,
  );
}

export async function checkIn(data: CheckInRequest) {
  return api.post<ApiResponse<AttendanceRecord>>("/attendance/check-in", data);
}

export async function checkOut(data: CheckInRequest) {
  return api.post<ApiResponse<AttendanceRecord>>("/attendance/check-out", data);
}

export async function createOfficeLocation(data: {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}) {
  return api.post<ApiResponse<OfficeLocation>>(
    "/attendance/office-locations",
    data,
  );
}

export async function addApprovedWifi(data: {
  ssid: string;
  bssid?: string;
  office_location_id: number;
}) {
  return api.post<ApiResponse<null>>("/attendance/approved-wifi", data);
}

export async function deleteApprovedWifi(id: number) {
  return api.delete<ApiResponse<null>>(`/attendance/approved-wifi/${id}`);
}

export async function exportAttendanceCsv(params?: {
  start_date?: string;
  end_date?: string;
  employee_id?: number;
}) {
  return api.download("/attendance/export", params);
}

// ============================================================
// Leave
// ============================================================

interface LeaveFilters extends PaginationParams {
  employee_id?: number;
  status?: string;
  type?: string;
  year?: number;
}

export function useLeaveRequests(
  filters?: LeaveFilters,
  config?: SWRConfiguration,
) {
  const params = filters as Record<
    string,
    string | number | boolean | undefined
  >;
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return useSWR<PaginatedResponse<LeaveRequest>>(
    `/leave${qs}`,
    fetcher,
    config,
  );
}

export function useLeaveRequest(id?: number, config?: SWRConfiguration) {
  return useSWR<ApiResponse<LeaveRequest>>(
    id ? `/leave/${id}` : null,
    fetcher,
    config,
  );
}

export function useLeaveBalance(year?: number, config?: SWRConfiguration) {
  const qs = year ? `?year=${year}` : "";
  return useSWR<ApiResponse<LeaveBalance>>(
    `/leave/balance${qs}`,
    fetcher,
    config,
  );
}

export async function createLeaveRequest(data: CreateLeaveRequest) {
  return api.post<ApiResponse<LeaveRequest>>("/leave", data);
}

export async function leaderApproveLeave(id: number, data: ApproveRequest) {
  return api.post<ApiResponse<LeaveRequest>>(
    `/leave/${id}/leader-approve`,
    data,
  );
}

export async function hrApproveLeave(id: number, data: ApproveRequest) {
  return api.post<ApiResponse<LeaveRequest>>(`/leave/${id}/hr-approve`, data);
}

export async function cancelLeave(id: number) {
  return api.delete<ApiResponse<null>>(`/leave/${id}`);
}

// ============================================================
// Overtime
// ============================================================

interface OvertimeFilters extends PaginationParams {
  employee_id?: number;
  status?: string;
  month?: number;
  year?: number;
}

export function useOvertimeRequests(
  filters?: OvertimeFilters,
  config?: SWRConfiguration,
) {
  const params = filters as Record<
    string,
    string | number | boolean | undefined
  >;
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return useSWR<PaginatedResponse<OvertimeRequest>>(
    `/overtime${qs}`,
    fetcher,
    config,
  );
}

export function useOvertimeRequest(id?: number, config?: SWRConfiguration) {
  return useSWR<ApiResponse<OvertimeRequest>>(
    id ? `/overtime/${id}` : null,
    fetcher,
    config,
  );
}

export async function createOvertimeRequest(data: {
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  reason: string;
  ot_type?: "normal" | "weekend" | "holiday";
}) {
  return api.post<ApiResponse<OvertimeRequest>>("/overtime", data);
}

export async function leaderApproveOT(id: number, data: ApproveRequest) {
  return api.post<ApiResponse<OvertimeRequest>>(
    `/overtime/${id}/leader-approve`,
    data,
  );
}

export async function ceoApproveOT(id: number, data: ApproveRequest) {
  return api.post<ApiResponse<OvertimeRequest>>(
    `/overtime/${id}/ceo-approve`,
    data,
  );
}

export async function cancelOvertime(id: number) {
  return api.delete<ApiResponse<null>>(`/overtime/${id}`);
}

// ============================================================
// Salary / Payroll
// ============================================================

interface SalaryFilters extends PaginationParams {
  month?: number;
  year?: number;
}

export function useSalaryRecords(
  filters?: SalaryFilters,
  config?: SWRConfiguration,
) {
  const params = filters as Record<
    string,
    string | number | boolean | undefined
  >;
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return useSWR<PaginatedResponse<SalaryRecord>>(
    `/salary${qs}`,
    fetcher,
    config,
  );
}

export function useMySalary(
  month?: number,
  year?: number,
  config?: SWRConfiguration,
) {
  const qs = month && year ? `?month=${month}&year=${year}` : "";
  return useSWR<ApiResponse<SalaryRecord>>(`/salary/me${qs}`, fetcher, config);
}

export function useEmployeeSalary(
  employeeId?: number,
  month?: number,
  year?: number,
  config?: SWRConfiguration,
) {
  const qs = month && year ? `?month=${month}&year=${year}` : "";
  return useSWR<ApiResponse<SalaryRecord>>(
    employeeId ? `/salary/employee/${employeeId}${qs}` : null,
    fetcher,
    config,
  );
}

export async function runPayroll(data: RunPayrollRequest) {
  return api.post<ApiResponse<SalaryRecord[]>>("/salary/run-payroll", data);
}

export async function confirmSalary(id: number) {
  return api.post<ApiResponse<null>>(`/salary-records/${id}/confirm`);
}

export async function exportPayrollCsv(params?: {
  month?: number;
  year?: number;
}) {
  return api.download("/salary/export", params);
}

// ---- Allowance Types ----

export function useAllowanceTypes(config?: SWRConfiguration) {
  return useSWR<ApiResponse<AllowanceType[]>>(
    "/salary/allowance-types",
    fetcher,
    config,
  );
}

export async function createAllowanceType(data: {
  name: string;
  description?: string;
  is_taxable?: boolean;
}) {
  return api.post<ApiResponse<AllowanceType>>("/salary/allowance-types", data);
}

export async function updateAllowanceType(
  id: number,
  data: { name: string; description?: string; is_taxable?: boolean },
) {
  return api.put<ApiResponse<AllowanceType>>(
    `/salary/allowance-types/${id}`,
    data,
  );
}

export async function deleteAllowanceType(id: number) {
  return api.delete<ApiResponse<null>>(`/salary/allowance-types/${id}`);
}

// ---- Bonuses ----

export async function addBonus(data: {
  employee_id: number;
  month: number;
  year: number;
  type: string;
  amount: number;
  description?: string;
}) {
  return api.post<ApiResponse<Bonus>>("/salary/bonuses", data);
}

// ---- Salary Advances ----

export async function addSalaryAdvance(data: {
  employee_id: number;
  month: number;
  year: number;
  amount: number;
  reason?: string;
}) {
  return api.post<ApiResponse<SalaryAdvance>>("/salary/advances", data);
}

// ============================================================
// Notifications
// ============================================================

interface NotificationFilters extends PaginationParams {
  is_read?: boolean;
  type?: string;
}

export function useNotifications(
  filters?: NotificationFilters,
  config?: SWRConfiguration,
) {
  const params = filters as Record<
    string,
    string | number | boolean | undefined
  >;
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return useSWR<PaginatedResponse<Notification>>(
    `/notifications${qs}`,
    fetcher,
    config,
  );
}

export function useUnreadCount(config?: SWRConfiguration) {
  return useSWR<ApiResponse<{ count: number }>>(
    "/notifications/unread-count",
    fetcher,
    config,
  );
}

export async function markNotificationRead(id: number) {
  return api.patch<ApiResponse<null>>(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return api.patch<ApiResponse<null>>("/notifications/read-all");
}

// ============================================================
// Projects
// ============================================================

export function useProjects(config?: SWRConfiguration) {
  return useSWR<ApiResponse<Project[]>>("/projects", fetcher, config);
}

export function useProject(id?: number, config?: SWRConfiguration) {
  return useSWR<ApiResponse<Project>>(
    id ? `/projects/${id}` : null,
    fetcher,
    config,
  );
}

export async function createProject(data: CreateProjectRequest) {
  return api.post<ApiResponse<Project>>("/projects", data);
}

export async function updateProject(id: number, data: UpdateProjectRequest) {
  return api.put<ApiResponse<Project>>(`/projects/${id}`, data);
}

export async function deleteProject(id: number) {
  return api.delete<ApiResponse<null>>(`/projects/${id}`);
}

export function useProjectMembers(
  projectId?: number,
  config?: SWRConfiguration,
) {
  return useSWR<ApiResponse<ProjectAssignment[]>>(
    projectId ? `/projects/${projectId}/members` : null,
    fetcher,
    config,
  );
}

export async function addProjectMember(
  projectId: number,
  data: AssignMemberRequest,
) {
  return api.post<ApiResponse<ProjectAssignment>>(
    `/projects/${projectId}/members`,
    data,
  );
}

export async function updateProjectMember(
  projectId: number,
  employeeId: number,
  data: { role?: string; allocation_percentage?: number },
) {
  return api.put<ApiResponse<null>>(
    `/projects/${projectId}/members/${employeeId}`,
    data,
  );
}

export async function removeProjectMember(
  projectId: number,
  employeeId: number,
) {
  return api.delete<ApiResponse<null>>(
    `/projects/${projectId}/members/${employeeId}`,
  );
}

// ============================================================
// Workload
// ============================================================

export function useWorkloadOverview(config?: SWRConfiguration) {
  return useSWR<ApiResponse<WorkloadOverview>>(
    "/workload/overview",
    fetcher,
    config,
  );
}

export function useWorkloadMatrix(config?: SWRConfiguration) {
  return useSWR<ApiResponse<ProjectAssignment[]>>(
    "/workload/matrix",
    fetcher,
    config,
  );
}

export function useEmployeeWorkload(
  employeeId?: number,
  config?: SWRConfiguration,
) {
  return useSWR<ApiResponse<ProjectAssignment[]>>(
    employeeId ? `/workload/employee/${employeeId}` : null,
    fetcher,
    config,
  );
}

// ============================================================
// Project Members (REQ-002 — uses project_role, joined_at)
// ============================================================

export function useProjectMembersList(
  projectId?: number,
  config?: SWRConfiguration,
) {
  return useSWR<ApiResponse<ProjectMember[]>>(
    projectId ? `/projects/${projectId}/members` : null,
    fetcher,
    config,
  );
}

export async function addProjectMemberV2(
  projectId: number,
  data: AddProjectMemberRequest,
) {
  return api.post<ApiResponse<ProjectMember>>(
    `/projects/${projectId}/members`,
    data,
  );
}

// ============================================================
// Milestones
// ============================================================

export function useProjectMilestones(
  projectId?: number,
  config?: SWRConfiguration,
) {
  return useSWR<ApiResponse<Milestone[]>>(
    projectId ? `/projects/${projectId}/milestones` : null,
    fetcher,
    config,
  );
}

export async function createMilestone(
  projectId: number,
  data: CreateMilestoneRequest,
) {
  return api.post<ApiResponse<Milestone>>(
    `/projects/${projectId}/milestones`,
    data,
  );
}

export async function updateMilestone(
  milestoneId: number,
  data: UpdateMilestoneRequest,
) {
  return api.put<ApiResponse<Milestone>>(`/milestones/${milestoneId}`, data);
}

export async function deleteMilestone(milestoneId: number) {
  return api.delete<ApiResponse<null>>(`/milestones/${milestoneId}`);
}

// ============================================================
// Announcements
// ============================================================

interface AnnouncementFilters {
  page?: number;
  size?: number;
  target_type?: AnnouncementTargetType;
}

export function useAnnouncements(
  filters?: AnnouncementFilters,
  config?: SWRConfiguration,
) {
  const params = filters as Record<
    string,
    string | number | boolean | undefined
  >;
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return useSWR<PaginatedResponse<Announcement>>(
    `/announcements${qs}`,
    fetcher,
    config,
  );
}

export function useAnnouncement(id?: number, config?: SWRConfiguration) {
  return useSWR<ApiResponse<Announcement>>(
    id ? `/announcements/${id}` : null,
    fetcher,
    config,
  );
}

export async function createAnnouncement(data: CreateAnnouncementRequest) {
  return api.post<ApiResponse<Announcement>>("/announcements", data);
}

export async function updateAnnouncement(
  id: number,
  data: Partial<CreateAnnouncementRequest>,
) {
  return api.put<ApiResponse<Announcement>>(`/announcements/${id}`, data);
}

export async function deleteAnnouncement(id: number) {
  return api.delete<ApiResponse<null>>(`/announcements/${id}`);
}

// ============================================================
// Polls
// ============================================================

export function usePollResults(pollId?: number, config?: SWRConfiguration) {
  return useSWR<ApiResponse<PollResults>>(
    pollId ? `/polls/${pollId}/results` : null,
    fetcher,
    config,
  );
}

export async function votePoll(pollId: number, data: { option_ids: number[] }) {
  return api.post<ApiResponse<null>>(`/polls/${pollId}/vote`, data);
}
