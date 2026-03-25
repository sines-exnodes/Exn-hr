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

  const emp = empRes?.data as Employee | undefined;
  const attendanceRecords: AttendanceRecord[] = attendanceRes?.data ?? [];
  const leaveRecords: LeaveRequest[] = leaveRes?.data ?? [];
  // Filter salary records for this employee from paginated results
  const allSalaryRecords = salaryRes?.data ?? [];
  const salaryRecords: SalaryRecord[] = allSalaryRecords.filter((s) => s.employee_id === Number(id));

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

  if (!emp) {
    return (
      <>
        <Header
          title="Không tìm thấy nhân viên"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Nhân viên", href: "/employees" },
            { label: "Không tìm thấy" },
          ]}
        />
        <div className="p-6">
          <p className="text-sm text-slate-400">Không có dữ liệu nhân viên.</p>
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
