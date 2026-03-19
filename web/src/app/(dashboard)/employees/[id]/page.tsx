"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import type { Employee, AttendanceRecord, LeaveRequest, PayrollRecord } from "@/types";

// TODO: connect to real API — GET /employees/:id
const mockEmployee: Employee = {
  id: 1,
  employee_code: "EMP001",
  name: "Nguyễn Văn An",
  email: "an.nv@company.com",
  phone: "0901234567",
  role: "employee",
  department_id: 1,
  department_name: "Engineering",
  position: "Senior Developer",
  status: "active",
  hire_date: "2022-01-15",
  birth_date: "1992-05-20",
  address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
  insurance_salary: 8000000,
  base_salary: 20000000,
  created_at: "2022-01-15T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

// TODO: connect to real API — GET /attendance?employee_id=1
const mockAttendance: AttendanceRecord[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", date: "2026-03-19", check_in: "08:02", check_out: "17:30", status: "present", location_verified: true },
  { id: 2, employee_id: 1, employee_name: "Nguyễn Văn An", date: "2026-03-18", check_in: "08:45", check_out: "17:15", status: "late", location_verified: true },
  { id: 3, employee_id: 1, employee_name: "Nguyễn Văn An", date: "2026-03-17", check_in: "08:00", check_out: "17:30", status: "present", location_verified: true },
  { id: 4, employee_id: 1, employee_name: "Nguyễn Văn An", date: "2026-03-14", check_in: "08:05", check_out: "17:00", status: "present", location_verified: false },
  { id: 5, employee_id: 1, employee_name: "Nguyễn Văn An", date: "2026-03-13", check_in: undefined, check_out: undefined, status: "absent", location_verified: false },
];

// TODO: connect to real API — GET /leave?employee_id=1
const mockLeave: LeaveRequest[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", leave_type: "annual", start_date: "2026-02-10", end_date: "2026-02-11", days: 2, reason: "Nghỉ lễ", status: "approved", leader_approved_at: "2026-02-08T10:00:00Z", hr_approved_at: "2026-02-09T09:00:00Z", created_at: "2026-02-07T00:00:00Z" },
  { id: 2, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", leave_type: "sick", start_date: "2025-11-15", end_date: "2025-11-15", days: 1, reason: "Sức khoẻ", status: "approved", leader_approved_at: "2025-11-14T09:00:00Z", hr_approved_at: "2025-11-14T11:00:00Z", created_at: "2025-11-14T00:00:00Z" },
];

// TODO: connect to real API — GET /payroll?employee_id=1
const mockPayroll: PayrollRecord[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", month: 2, year: 2026, base_salary: 20000000, total_allowances: 2000000, total_overtime: 1500000, insurance_deduction: 1600000, net_salary: 21900000, status: "paid", paid_at: "2026-03-05T00:00:00Z" },
  { id: 2, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", month: 1, year: 2026, base_salary: 20000000, total_allowances: 2000000, total_overtime: 0, insurance_deduction: 1600000, net_salary: 20400000, status: "paid", paid_at: "2026-02-05T00:00:00Z" },
  { id: 3, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", month: 3, year: 2026, base_salary: 20000000, total_allowances: 2000000, total_overtime: 0, insurance_deduction: 1600000, net_salary: 20400000, status: "draft" },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

function ProfileTab({ emp }: { emp: Employee }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Thông tin cá nhân</h3>
        <div className="space-y-3">
          {[
            { label: "Họ và tên", value: emp.name },
            { label: "Email", value: emp.email },
            { label: "Điện thoại", value: emp.phone ?? "—" },
            { label: "Ngày sinh", value: emp.birth_date ?? "—" },
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
            { label: "Mã nhân viên", value: emp.employee_code },
            { label: "Phòng ban", value: emp.department_name },
            { label: "Vị trí", value: emp.position },
            { label: "Vai trò", value: emp.role },
            { label: "Ngày vào làm", value: emp.hire_date },
            { label: "Trạng thái", value: statusBadge(emp.status) },
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

function SalaryTab({ emp }: { emp: Employee }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Lương cơ bản", value: formatCurrency(emp.base_salary), color: "text-slate-900" },
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
            {mockPayroll.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  T{p.month}/{p.year}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.base_salary)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.total_allowances)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.total_overtime)}</td>
                <td className="px-4 py-3 text-sm text-red-600">-{formatCurrency(p.insurance_deduction)}</td>
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

function AttendanceTab() {
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
          {mockAttendance.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-sm text-slate-700">{a.date}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{a.check_in ?? "—"}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{a.check_out ?? "—"}</td>
              <td className="px-4 py-3">{statusBadge(a.status)}</td>
              <td className="px-4 py-3">
                <Badge variant={a.location_verified ? "green" : "gray"} dot>
                  {a.location_verified ? "Verified" : "Unverified"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function LeaveTab() {
  const leaveUsed = mockLeave.filter((l) => l.status === "approved").reduce((s, l) => s + l.days, 0);
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
            {mockLeave.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm text-slate-700 capitalize">{l.leave_type}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{l.start_date}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{l.end_date}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700">{l.days}</td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{l.reason}</td>
                <td className="px-4 py-3">{statusBadge(l.status)}</td>
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
  const id = params.id;

  // In real usage: fetch employee by id
  const emp = mockEmployee;

  return (
    <>
      <Header
        title={emp.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Nhân viên", href: "/employees" },
          { label: emp.name },
        ]}
      />
      <div className="p-6 space-y-4">
        {/* Employee header card */}
        <Card>
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-2xl font-bold text-[#22C55E]">
              {emp.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{emp.name}</h2>
                {statusBadge(emp.status)}
              </div>
              <p className="text-sm text-slate-500">{emp.position} · {emp.department_name}</p>
              <p className="text-xs text-slate-400 mt-1">{emp.employee_code} · {emp.email}</p>
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
            if (active === "salary") return <SalaryTab emp={emp} />;
            if (active === "attendance") return <AttendanceTab />;
            if (active === "leave") return <LeaveTab />;
            return null;
          }}
        </Tabs>
      </div>
    </>
  );
}
