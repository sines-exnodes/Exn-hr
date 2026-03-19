import React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import type { DashboardStats, AttendanceRecord, LeaveRequest } from "@/types";

// TODO: connect to real API — matches Apidog spec GET /dashboard/stats
const mockStats: DashboardStats = {
  total_employees: 42,
  present_today: 38,
  on_leave: 3,
  pending_leave_requests: 5,
  pending_overtime_requests: 2,
  total_departments: 6,
};

// TODO: connect to real API — GET /attendance?date=today&size=5
const recentAttendance: AttendanceRecord[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", date: "2026-03-19", check_in: "08:02", check_out: "17:30", status: "present", location_verified: true },
  { id: 2, employee_id: 2, employee_name: "Trần Thị Bình", date: "2026-03-19", check_in: "08:45", check_out: "17:15", status: "late", location_verified: true },
  { id: 3, employee_id: 3, employee_name: "Lê Minh Châu", date: "2026-03-19", check_in: undefined, check_out: undefined, status: "absent", location_verified: false },
  { id: 4, employee_id: 4, employee_name: "Phạm Quốc Dũng", date: "2026-03-19", check_in: "08:00", check_out: "12:30", status: "half_day", location_verified: true },
  { id: 5, employee_id: 5, employee_name: "Hoàng Thị Em", date: "2026-03-19", check_in: "08:05", check_out: "17:35", status: "present", location_verified: false },
];

// TODO: connect to real API — GET /leave?status=pending&size=5
const pendingLeave: LeaveRequest[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", leave_type: "annual", start_date: "2026-03-22", end_date: "2026-03-23", days: 2, reason: "Việc gia đình", status: "pending", created_at: "2026-03-19T09:00:00Z" },
  { id: 2, employee_id: 2, employee_name: "Trần Thị Bình", department_name: "HR", leave_type: "sick", start_date: "2026-03-20", end_date: "2026-03-20", days: 1, reason: "Sức khoẻ", status: "leader_approved", created_at: "2026-03-18T14:00:00Z" },
  { id: 3, employee_id: 3, employee_name: "Lê Minh Châu", department_name: "Sales", leave_type: "annual", start_date: "2026-03-25", end_date: "2026-03-26", days: 2, reason: "Du lịch", status: "pending", created_at: "2026-03-17T10:00:00Z" },
];

interface StatCardProps {
  label: string;
  value: number;
  change?: string;
  positive?: boolean;
  color: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, change, positive, color, icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const attendanceRate = Math.round((mockStats.present_today / mockStats.total_employees) * 100);

  return (
    <>
      <Header
        title="Dashboard"
        breadcrumbs={[{ label: "Tổng quan" }]}
      />
      <div className="p-6 space-y-6">
        {/* Date context */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Thứ Năm, 19 tháng 3 năm 2026
          </p>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Đang làm việc
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng NV"
            value={mockStats.total_employees}
            change="+2 tháng này"
            positive
            color="bg-blue-50"
            icon={
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="Đang làm"
            value={mockStats.present_today}
            change={`${attendanceRate}% tỷ lệ`}
            positive={attendanceRate >= 80}
            color="bg-green-50"
            icon={
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Nghỉ phép hôm nay"
            value={mockStats.on_leave}
            color="bg-yellow-50"
            icon={
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="OT tháng"
            value={126}
            change="x1.5 hệ số"
            positive
            color="bg-orange-50"
            icon={
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Attendance table */}
          <div className="lg:col-span-2">
            <Card padding="none">
              <div className="p-5 border-b border-slate-100">
                <CardHeader>
                  <CardTitle>Chấm công hôm nay</CardTitle>
                  <a href="/attendance" className="text-sm font-medium text-[#22C55E] hover:text-green-700">
                    Xem tất cả →
                  </a>
                </CardHeader>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">Nhân viên</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">Check-in</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">Check-out</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">Trạng thái</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">GPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                              {rec.employee_name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{rec.employee_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{rec.check_in ?? "—"}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{rec.check_out ?? "—"}</td>
                        <td className="px-5 py-3">{statusBadge(rec.status)}</td>
                        <td className="px-5 py-3">
                          {rec.location_verified ? (
                            <span className="text-green-500">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-slate-300">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Quick stats + pending leave */}
          <div className="space-y-4">
            {/* Dept distribution */}
            <Card>
              <CardHeader className="mb-4">
                <CardTitle>Phòng ban</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {[
                  { name: "Engineering", count: 12, pct: 29 },
                  { name: "Sales", count: 8, pct: 19 },
                  { name: "HR", count: 5, pct: 12 },
                  { name: "Finance", count: 6, pct: 14 },
                  { name: "Marketing", count: 7, pct: 17 },
                  { name: "Operations", count: 4, pct: 9 },
                ].map((dept) => (
                  <div key={dept.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-600">{dept.name}</span>
                      <span className="font-semibold text-slate-700">{dept.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-[#22C55E]"
                        style={{ width: `${dept.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pending leave */}
            <Card>
              <CardHeader className="mb-3">
                <CardTitle>Nghỉ phép chờ duyệt</CardTitle>
                <Badge variant="yellow" dot>{mockStats.pending_leave_requests}</Badge>
              </CardHeader>
              <div className="space-y-2">
                {pendingLeave.map((req) => (
                  <div key={req.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                      {req.employee_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">{req.employee_name}</p>
                      <p className="text-xs text-slate-400">{req.start_date} · {req.days} ngày</p>
                    </div>
                    {statusBadge(req.status)}
                  </div>
                ))}
                <a href="/leave" className="block pt-1 text-center text-xs font-medium text-[#22C55E] hover:text-green-700">
                  Xem tất cả →
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
