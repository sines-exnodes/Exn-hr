"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useEmployee, useAttendanceRecords, useLeaveRequests, useSalaryRecords } from "@/hooks/useApi";
import type { Employee, AttendanceRecord, LeaveRequest, SalaryRecord } from "@/types";

// Fallback mock data
const mockEmployee: Employee = {
  id: 1,
  user_id: 1,
  full_name: "Nguyen Van An",
  phone: "0901234567",
  dob: "1992-05-20",
  address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
  position: "Senior Developer",
  team_id: 1,
  basic_salary: 20000000,
  insurance_salary: 8000000,
  join_date: "2022-01-15",
  created_at: "2022-01-15T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  user: { id: 1, email: "an.nv@company.com", role: "employee", is_active: true },
  team: { id: 1, name: "Engineering", department_id: 1 },
};

const mockAttendance: AttendanceRecord[] = [
  { id: 1, employee_id: 1, check_in_time: "2026-03-19T08:02:00Z", check_out_time: "2026-03-19T17:30:00Z", status: "checked_out" },
  { id: 2, employee_id: 1, check_in_time: "2026-03-18T08:45:00Z", check_out_time: "2026-03-18T17:15:00Z", status: "checked_out" },
  { id: 3, employee_id: 1, check_in_time: "2026-03-17T08:00:00Z", check_out_time: "2026-03-17T17:30:00Z", status: "checked_out" },
];

const mockLeave: LeaveRequest[] = [
  { id: 1, employee_id: 1, type: "paid", start_date: "2026-02-10", end_date: "2026-02-11", days: 2, reason: "Nghỉ lễ", leader_status: "approved", hr_status: "approved", overall_status: "approved", created_at: "2026-02-07T00:00:00Z" },
  { id: 2, employee_id: 1, type: "paid", start_date: "2025-11-15", end_date: "2025-11-15", days: 1, reason: "Sức khoẻ", leader_status: "approved", hr_status: "approved", overall_status: "approved", created_at: "2025-11-14T00:00:00Z" },
];

const mockSalary: SalaryRecord[] = [
  { id: 1, employee_id: 1, month: 2, year: 2026, basic_salary: 20000000, total_allowances: 2000000, total_ot_pay: 1500000, total_bonus: 0, total_deductions: 1600000, salary_advance: 0, net_salary: 21900000, status: "confirmed", insurance_salary: 8000000 },
  { id: 2, employee_id: 1, month: 1, year: 2026, basic_salary: 20000000, total_allowances: 2000000, total_ot_pay: 0, total_bonus: 0, total_deductions: 1600000, salary_advance: 0, net_salary: 20400000, status: "confirmed", insurance_salary: 8000000 },
  { id: 3, employee_id: 1, month: 3, year: 2026, basic_salary: 20000000, total_allowances: 2000000, total_ot_pay: 0, total_bonus: 0, total_deductions: 1600000, salary_advance: 0, net_salary: 20400000, status: "draft" },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

function formatTime(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "—";
  }
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

function ProfileTab({ emp }: { emp: Employee }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Thông tin cá nhân</h3>
        <div className="space-y-3">
          {[
            { label: "Họ và tên", value: emp.full_name },
            { label: "Email", value: emp.user?.email ?? "—" },
            { label: "Điện thoại", value: emp.phone ?? "—" },
            { label: "Ngày sinh", value: emp.dob ?? "—" },
            { label: "Địa chỉ", value: emp.address ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium text-slate-700 text-right max-w-xs">{value}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Thông tin công việc</h3>
        <div className="space-y-3">
          {[
            { label: "Mã nhân viên", value: `#${emp.id}` },
            { label: "Team", value: emp.team?.name ?? "—" },
            { label: "Vị trí", value: emp.position },
            { label: "Vai trò", value: emp.user?.role ?? "—" },
            { label: "Ngày vào làm", value: emp.join_date },
            { label: "Trạng thái", value: statusBadge(emp.user?.is_active ? "active" : "inactive") },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium text-slate-700">{value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SalaryTab({ emp, salaryRecords }: { emp: Employee; salaryRecords: SalaryRecord[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Lương cơ bản", value: formatCurrency(emp.basic_salary), color: "text-slate-900" },
          { label: "Lương bảo hiểm", value: formatCurrency(emp.insurance_salary), color: "text-blue-600" },
          { label: "Khấu trừ BH (~8%)", value: formatCurrency(emp.insurance_salary * 0.08), color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>
      <Card padding="none">
        <div className="border-b border-slate-100 p-4">
          <h3 className="font-semibold text-slate-800">Lịch sử lương</h3>
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {["Kỳ lương", "Lương CB", "Phụ cấp", "OT", "Khấu trừ", "Thực nhận", "Trạng thái"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salaryRecords.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  T{p.month}/{p.year}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.basic_salary)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.total_allowances)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.total_ot_pay)}</td>
                <td className="px-4 py-3 text-sm text-red-600">-{formatCurrency(p.total_deductions)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">{formatCurrency(p.net_salary)}</td>
                <td className="px-4 py-3">{statusBadge(p.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AttendanceTab({ records }: { records: AttendanceRecord[] }) {
  return (
    <Card padding="none">
      <div className="border-b border-slate-100 p-4">
        <h3 className="font-semibold text-slate-800">Chấm công gần đây</h3>
      </div>
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            {["Ngày", "Check-in", "Check-out", "Trạng thái", "GPS"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((a) => {
            const hasGps = !!(a.gps_lat && a.gps_lng);
            return (
              <tr key={a.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm text-slate-700">{formatDate(a.check_in_time)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatTime(a.check_in_time)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatTime(a.check_out_time)}</td>
                <td className="px-4 py-3">{statusBadge(a.status)}</td>
                <td className="px-4 py-3">
                  <Badge variant={hasGps ? "green" : "gray"} dot>
                    {hasGps ? "Verified" : "Unverified"}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function LeaveTab({ leaveRecords }: { leaveRecords: LeaveRequest[] }) {
  const leaveUsed = leaveRecords.filter((l) => l.overall_status === "approved").reduce((s, l) => s + l.days, 0);
  const leaveTotal = 12;
  const leaveRemaining = leaveTotal - leaveUsed;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng phép năm", value: leaveTotal, color: "text-slate-900" },
          { label: "Đã sử dụng", value: leaveUsed, color: "text-orange-600" },
          { label: "Còn lại", value: leaveRemaining, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value} <span className="text-sm font-normal text-slate-400">ngày</span></p>
          </Card>
        ))}
      </div>
      <Card padding="none">
        <div className="border-b border-slate-100 p-4">
          <h3 className="font-semibold text-slate-800">Lịch sử nghỉ phép</h3>
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {["Loại", "Từ ngày", "Đến ngày", "Số ngày", "Lý do", "Trạng thái"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaveRecords.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm text-slate-700 capitalize">{l.type}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{l.start_date}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{l.end_date}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700">{l.days}</td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{l.reason}</td>
                <td className="px-4 py-3">{statusBadge(l.overall_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Real API calls
  const { data: empRes, isLoading: empLoading } = useEmployee(id);
  const { data: attendanceRes } = useAttendanceRecords({ employee_id: Number(id), page: 1, size: 20 });
  const { data: leaveRes } = useLeaveRequests({ employee_id: Number(id), page: 1, size: 20 });
  const { data: salaryRes } = useSalaryRecords();

  const emp: Employee = empRes?.data ?? mockEmployee;
  const attendanceRecords: AttendanceRecord[] = attendanceRes?.data ?? mockAttendance;
  const leaveRecords: LeaveRequest[] = leaveRes?.data ?? mockLeave;
  // Filter salary records for this employee from paginated results
  const allSalaryRecords = salaryRes?.data ?? [];
  const salaryRecords: SalaryRecord[] = allSalaryRecords.length > 0
    ? allSalaryRecords.filter((s) => s.employee_id === Number(id))
    : mockSalary;

  if (empLoading) {
    return (
      <>
        <Header
          title="Đang tải..."
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Nhân viên", href: "/employees" },
            { label: "..." },
          ]}
        />
        <div className="p-6">
          <p className="text-sm text-slate-400">Đang tải thông tin nhân viên...</p>
        </div>
      </>
    );
  }

  const empStatus = emp.user?.is_active ? "active" : "inactive";

  return (
    <>
      <Header
        title={emp.full_name}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Nhân viên", href: "/employees" },
          { label: emp.full_name },
        ]}
      />
      <div className="p-6 space-y-4">
        {/* Employee header card */}
        <Card>
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-2xl font-bold text-[#22C55E]">
              {emp.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{emp.full_name}</h2>
                {statusBadge(empStatus)}
              </div>
              <p className="text-sm text-slate-500">{emp.position} · {emp.team?.name ?? "—"}</p>
              <p className="text-xs text-slate-400 mt-1">#{emp.id} · {emp.user?.email ?? "—"}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Chỉnh sửa
              </Button>
              <Button variant="danger" size="sm">
                Vô hiệu hoá
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: "profile", label: "Hồ sơ" },
            { id: "salary", label: "Lương" },
            { id: "attendance", label: "Chấm công" },
            { id: "leave", label: "Nghỉ phép" },
          ]}
        >
          {(active) => {
            if (active === "profile") return <ProfileTab emp={emp} />;
            if (active === "salary") return <SalaryTab emp={emp} salaryRecords={salaryRecords} />;
            if (active === "attendance") return <AttendanceTab records={attendanceRecords} />;
            if (active === "leave") return <LeaveTab leaveRecords={leaveRecords} />;
            return null;
          }}
        </Tabs>
      </div>
    </>
  );
}
