"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import {
  useEmployees,
  useAttendanceRecords,
  useLeaveRequests,
  useOvertimeRequests,
  useSalaryRecords,
  useDepartments,
  exportAttendanceCsv,
  exportPayrollCsv,
} from "@/hooks/useApi";

const fc = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Tháng ${i + 1}`,
}));
const yearOptions = ["2026", "2025", "2024"].map((y) => ({
  value: y,
  label: y,
}));

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─── Report Card ────────────────────────────────────────
function ReportCard({
  title,
  description,
  icon,
  color,
  bgColor,
  badge,
  onExportCsv,
  onView,
  exporting,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  badge?: string;
  onExportCsv?: () => void;
  onView?: () => void;
  exporting?: boolean;
}) {
  return (
    <Card className="group transition-shadow hover:shadow-md">
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${bgColor} ${color}`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800 group-hover:text-[#22C55E] transition-colors">
                {title}
              </h3>
              {badge && (
                <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {exporting ? "Đang xuất..." : "Xuất CSV"}
            </button>
          )}
          {onView && (
            <button
              onClick={onView}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#22C55E]/10 px-3 py-1.5 text-xs font-medium text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors"
            >
              Xem báo cáo
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Summary Stat ────────────────────────────────────────
function Stat({
  label,
  value,
  color = "text-slate-800",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-xl font-bold ${color} tabular-nums`}>{value}</p>
    </div>
  );
}

// ─── Detail Row ──────────────────────────────────────────
function DetailRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={`text-sm font-medium tabular-nums ${color ?? "text-slate-800"}`}
      >
        {typeof value === "number" ? fc(value) : value}
      </span>
    </div>
  );
}

export default function ReportsPage() {
  const [month, setMonth] = useState("3");
  const [year, setYear] = useState("2026");
  const [exportingAtt, setExportingAtt] = useState(false);
  const [exportingPay, setExportingPay] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const m = Number(month);
  const y = Number(year);

  const { data: empRes } = useEmployees({ page: 1, size: 100 });
  const { data: attRes } = useAttendanceRecords({ page: 1, size: 500 });
  const { data: leaveRes } = useLeaveRequests({ page: 1, size: 500 });
  const { data: otRes } = useOvertimeRequests({ page: 1, size: 500 });
  const { data: salaryRes } = useSalaryRecords({ month: m, year: y });
  const { data: deptRes } = useDepartments();

  const employees = empRes?.data ?? [];
  const attendance = attRes?.data ?? [];
  const leaves = leaveRes?.data ?? [];
  const overtimes = otRes?.data ?? [];
  const salaries = salaryRes?.data ?? [];
  const departments = deptRes?.data ?? [];

  // ─── Attendance stats ──
  const attCheckedIn = attendance.filter(
    (a) => a.status === "checked_in" || a.status === "checked_out",
  ).length;

  // ─── Leave stats ──
  const leavePending = leaves.filter(
    (l) => l.overall_status === "pending",
  ).length;
  const leaveApproved = leaves.filter(
    (l) => l.overall_status === "approved",
  ).length;
  const leaveRejected = leaves.filter(
    (l) => l.overall_status === "rejected",
  ).length;
  const totalLeaveDays = leaves
    .filter((l) => l.overall_status === "approved")
    .reduce((s, l) => s + l.days, 0);

  // ─── OT stats ──
  const otPending = overtimes.filter(
    (o) => o.overall_status === "pending",
  ).length;
  const otApproved = overtimes.filter(
    (o) => o.overall_status === "approved",
  ).length;
  const totalOtHours = overtimes
    .filter((o) => o.overall_status === "approved")
    .reduce((s, o) => s + o.hours, 0);

  // ─── Salary stats ──
  const totalNet = salaries.reduce((s, r) => s + r.net_salary, 0);
  const totalGross = salaries.reduce((s, r) => s + r.basic_salary, 0);
  const totalPit = salaries.reduce((s, r) => s + (r.pit_amount ?? 0), 0);
  const totalInsurance = salaries.reduce(
    (s, r) => s + ((r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0)),
    0,
  );
  const totalInsEmployer = salaries.reduce(
    (s, r) => s + (r.employer_insurance_cost ?? 0),
    0,
  );

  // ─── Headcount ──
  const activeEmployees = employees.filter(
    (e) => e.user?.is_active !== false,
  ).length;
  const byDept: Record<string, number> = {};
  employees.forEach((e) => {
    const d = e.team?.department?.name ?? "Chưa gán";
    byDept[d] = (byDept[d] || 0) + 1;
  });

  const handleExportAttendance = async () => {
    setExportingAtt(true);
    try {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endDate = `${year}-${month.padStart(2, "0")}-31`;
      const blob = await exportAttendanceCsv({
        start_date: startDate,
        end_date: endDate,
      });
      downloadBlob(blob, `attendance_${month}_${year}.csv`);
    } catch (e) {
      console.error(e);
    } finally {
      setExportingAtt(false);
    }
  };

  const handleExportPayroll = async () => {
    setExportingPay(true);
    try {
      const blob = await exportPayrollCsv({ month: m, year: y });
      downloadBlob(blob, `payroll_${month}_${year}.csv`);
    } catch (e) {
      console.error(e);
    } finally {
      setExportingPay(false);
    }
  };

  return (
    <>
      <Header
        title="Báo cáo"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Báo cáo" }]}
      />
      <div className="p-6 space-y-6">
        {/* Period selector */}
        <Card>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-36">
              <Select
                label="Tháng"
                options={monthOptions}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="w-28">
              <Select
                label="Năm"
                options={yearOptions}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <p className="text-sm text-slate-400 ml-2">
              Dữ liệu hiển thị cho kỳ{" "}
              <strong>
                T{month}/{year}
              </strong>
            </p>
          </div>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <Card padding="sm">
            <Stat label="Tổng NV" value={activeEmployees} />
          </Card>
          <Card padding="sm">
            <Stat label="Phòng ban" value={departments.length} />
          </Card>
          <Card padding="sm">
            <Stat
              label="Chấm công"
              value={attCheckedIn}
              color="text-blue-600"
            />
          </Card>
          <Card padding="sm">
            <Stat
              label="Đơn nghỉ phép"
              value={leaves.length}
              color="text-yellow-600"
            />
          </Card>
          <Card padding="sm">
            <Stat
              label="Đơn OT"
              value={overtimes.length}
              color="text-orange-600"
            />
          </Card>
          <Card padding="sm">
            <Stat
              label="Lương NET"
              value={fc(totalNet)}
              color="text-green-600"
            />
          </Card>
        </div>

        {/* Report cards */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Báo cáo & Thống kê
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Nhấn &quot;Xem báo cáo&quot; để xem chi tiết hoặc xuất CSV.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Chấm công */}
          <ReportCard
            title="Báo cáo chấm công"
            description={`${attCheckedIn} lượt chấm công trong kỳ.`}
            color="text-blue-600"
            bgColor="bg-blue-50"
            badge="Hàng tháng"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            onExportCsv={handleExportAttendance}
            exporting={exportingAtt}
            onView={() => setActiveModal("attendance")}
          />

          {/* 2. Bảng lương */}
          <ReportCard
            title="Báo cáo bảng lương"
            description={`${salaries.length} NV · NET: ${fc(totalNet)}`}
            color="text-green-600"
            bgColor="bg-green-50"
            badge="Hàng tháng"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
            }
            onExportCsv={handleExportPayroll}
            exporting={exportingPay}
            onView={() => setActiveModal("payroll")}
          />

          {/* 3. Nghỉ phép */}
          <ReportCard
            title="Báo cáo nghỉ phép"
            description={`${totalLeaveDays} ngày đã duyệt · ${leavePending} đơn chờ duyệt`}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            badge="Hàng năm"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            onView={() => setActiveModal("leave")}
          />

          {/* 4. OT */}
          <ReportCard
            title="Báo cáo OT"
            description={`${totalOtHours}h đã duyệt · ${otPending} đơn chờ`}
            color="text-orange-600"
            bgColor="bg-orange-50"
            badge="Hàng tháng"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            onView={() => setActiveModal("overtime")}
          />

          {/* 5. Nhân sự */}
          <ReportCard
            title="Báo cáo nhân sự"
            description={`${activeEmployees} NV · ${departments.length} phòng ban`}
            color="text-purple-600"
            bgColor="bg-purple-50"
            badge="Hàng quý"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            onView={() => setActiveModal("headcount")}
          />

          {/* 6. Bảo hiểm */}
          <ReportCard
            title="Báo cáo bảo hiểm"
            description={`NV: ${fc(totalInsurance)} · CTY: ${fc(totalInsEmployer)}`}
            color="text-rose-600"
            bgColor="bg-rose-50"
            badge="Hàng tháng"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
            onView={() => setActiveModal("insurance")}
          />
        </div>
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Attendance Modal */}
      <Modal
        isOpen={activeModal === "attendance"}
        onClose={() => setActiveModal(null)}
        title={`Báo cáo chấm công — T${month}/${year}`}
        size="lg"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <Card padding="sm">
              <Stat
                label="Tổng lượt"
                value={attendance.length}
                color="text-blue-600"
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="Checked in"
                value={
                  attendance.filter((a) => a.status === "checked_in").length
                }
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="Checked out"
                value={
                  attendance.filter((a) => a.status === "checked_out").length
                }
              />
            </Card>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  NV
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Ngày
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Check-in
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Check-out
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  GPS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.slice(0, 50).map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2 text-slate-700">
                    {a.employee?.full_name ?? `#${a.employee_id}`}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {a.check_in_time?.slice(0, 10) ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {a.check_in_time
                      ? new Date(a.check_in_time).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {a.check_out_time
                      ? new Date(a.check_out_time).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {a.gps_lat && a.gps_lng ? (
                      <Badge variant="green" dot>
                        OK
                      </Badge>
                    ) : (
                      <Badge variant="gray">—</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Payroll Modal */}
      <Modal
        isOpen={activeModal === "payroll"}
        onClose={() => setActiveModal(null)}
        title={`Báo cáo lương — T${month}/${year}`}
        size="xl"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            <Card padding="sm">
              <Stat label="Tổng GROSS" value={fc(totalGross)} />
            </Card>
            <Card padding="sm">
              <Stat
                label="Tổng NET"
                value={fc(totalNet)}
                color="text-green-600"
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="Thuế TNCN"
                value={fc(totalPit)}
                color="text-red-600"
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="BHXH NV"
                value={fc(totalInsurance)}
                color="text-orange-600"
              />
            </Card>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  NV
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  Lương GP
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  Phụ cấp
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  BHXH
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  Thuế
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  NET
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salaries.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 font-medium text-slate-700">
                    {r.employee?.full_name ?? `#${r.employee_id}`}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                    {fc(r.basic_salary)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-blue-600">
                    {fc(r.total_allowances)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-red-500">
                    {fc((r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0))}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-red-500">
                    {fc(r.pit_amount ?? 0)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-green-600">
                    {fc(r.net_salary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Leave Modal */}
      <Modal
        isOpen={activeModal === "leave"}
        onClose={() => setActiveModal(null)}
        title="Báo cáo nghỉ phép"
        size="lg"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            <Card padding="sm">
              <Stat label="Tổng đơn" value={leaves.length} />
            </Card>
            <Card padding="sm">
              <Stat
                label="Đã duyệt"
                value={leaveApproved}
                color="text-green-600"
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="Chờ duyệt"
                value={leavePending}
                color="text-yellow-600"
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="Từ chối"
                value={leaveRejected}
                color="text-red-600"
              />
            </Card>
          </div>
          <DetailRow
            label="Tổng ngày phép đã duyệt"
            value={`${totalLeaveDays} ngày`}
            color="text-green-600"
          />
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  NV
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Loại
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Từ
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Đến
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">
                  Ngày
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  TT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2 text-slate-700">
                    {l.employee?.full_name ?? `#${l.employee_id}`}
                  </td>
                  <td className="px-3 py-2 capitalize text-slate-500">
                    {l.type}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{l.start_date}</td>
                  <td className="px-3 py-2 text-slate-500">{l.end_date}</td>
                  <td className="px-3 py-2 text-center font-medium">
                    {l.days}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        l.overall_status === "approved"
                          ? "green"
                          : l.overall_status === "rejected"
                            ? "red"
                            : "yellow"
                      }
                    >
                      {l.overall_status === "approved"
                        ? "Duyệt"
                        : l.overall_status === "rejected"
                          ? "Từ chối"
                          : "Chờ"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* OT Modal */}
      <Modal
        isOpen={activeModal === "overtime"}
        onClose={() => setActiveModal(null)}
        title="Báo cáo OT"
        size="lg"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <Card padding="sm">
              <Stat label="Tổng đơn" value={overtimes.length} />
            </Card>
            <Card padding="sm">
              <Stat
                label="Đã duyệt"
                value={otApproved}
                color="text-green-600"
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="Tổng giờ duyệt"
                value={`${totalOtHours}h`}
                color="text-orange-600"
              />
            </Card>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  NV
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Ngày
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Loại
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">
                  Giờ
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Lý do
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  TT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overtimes.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-2 text-slate-700">
                    {o.employee?.full_name ?? `#${o.employee_id}`}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{o.date}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        o.ot_type === "holiday"
                          ? "purple"
                          : o.ot_type === "weekend"
                            ? "orange"
                            : "blue"
                      }
                    >
                      {o.ot_type === "holiday"
                        ? "x3.0"
                        : o.ot_type === "weekend"
                          ? "x2.0"
                          : "x1.5"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-center font-medium">
                    {o.hours}
                  </td>
                  <td className="px-3 py-2 text-slate-500 max-w-[200px] truncate">
                    {o.reason}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        o.overall_status === "approved"
                          ? "green"
                          : o.overall_status === "rejected"
                            ? "red"
                            : "yellow"
                      }
                    >
                      {o.overall_status === "approved"
                        ? "Duyệt"
                        : o.overall_status === "rejected"
                          ? "Từ chối"
                          : "Chờ"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Headcount Modal */}
      <Modal
        isOpen={activeModal === "headcount"}
        onClose={() => setActiveModal(null)}
        title="Báo cáo nhân sự"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Card padding="sm">
              <Stat
                label="Tổng NV hoạt động"
                value={activeEmployees}
                color="text-green-600"
              />
            </Card>
            <Card padding="sm">
              <Stat label="Phòng ban" value={departments.length} />
            </Card>
          </div>
          <h4 className="text-sm font-semibold text-slate-700">
            Nhân viên theo phòng ban
          </h4>
          <div className="space-y-2">
            {Object.entries(byDept)
              .sort((a, b) => b[1] - a[1])
              .map(([dept, count]) => (
                <div
                  key={dept}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50"
                >
                  <span className="text-sm text-slate-700">{dept}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22C55E] rounded-full"
                        style={{ width: `${(count / activeEmployees) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-800 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
          <h4 className="text-sm font-semibold text-slate-700 pt-2">
            Loại hợp đồng
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              employees.reduce<Record<string, number>>((acc, e) => {
                const ct = e.contract_type ?? "full_time";
                acc[ct] = (acc[ct] || 0) + 1;
                return acc;
              }, {}),
            ).map(([ct, count]) => (
              <Badge
                key={ct}
                variant={
                  ct === "full_time"
                    ? "green"
                    : ct === "probation"
                      ? "yellow"
                      : "blue"
                }
              >
                {ct === "full_time"
                  ? "HĐLĐ"
                  : ct === "probation"
                    ? "Thử việc"
                    : ct}
                : {count}
              </Badge>
            ))}
          </div>
        </div>
      </Modal>

      {/* Insurance Modal */}
      <Modal
        isOpen={activeModal === "insurance"}
        onClose={() => setActiveModal(null)}
        title={`Báo cáo bảo hiểm — T${month}/${year}`}
        size="lg"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <Card padding="sm">
              <Stat
                label="BHXH NV (10.5%)"
                value={fc(totalInsurance)}
                color="text-red-600"
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="BHXH CTY (21.5%)"
                value={fc(totalInsEmployer)}
                color="text-orange-600"
              />
            </Card>
            <Card padding="sm">
              <Stat
                label="Tổng cộng"
                value={fc(totalInsurance + totalInsEmployer)}
              />
            </Card>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  NV
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  Lương BH
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  BHXH 8%
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  BHYT 1.5%
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  BHTN 1%
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  Tổng NV
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  Tổng CTY
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salaries
                .filter((r) => (r.insurance_salary ?? 0) > 0)
                .map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 font-medium text-slate-700">
                      {r.employee?.full_name ?? `#${r.employee_id}`}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {fc(r.insurance_salary ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-500">
                      {fc(r.bhxh ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-500">
                      {fc(r.bhyt ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-500">
                      {fc(r.bhtn ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-red-600">
                      {fc((r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0))}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-orange-600">
                      {fc(r.employer_insurance_cost ?? 0)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
