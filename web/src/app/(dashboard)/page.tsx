"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { useEmployees, useAttendanceRecords, useLeaveRequests } from "@/hooks/useApi";
import type { AttendanceRecord, LeaveRequest } from "@/types";

// Format ISO time to HH:mm
function formatTime(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "—";
  }
}

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
  const today = new Date().toISOString().slice(0, 10);

  // Real API calls
  const { data: employeesRes } = useEmployees({ page: 1, size: 1 });
  const { data: attendanceRes, isLoading: attendanceLoading } = useAttendanceRecords({ start_date: today, end_date: today, page: 1, size: 5 });
  const { data: pendingLeaveRes, isLoading: leaveLoading } = useLeaveRequests({ status: "pending", page: 1, size: 5 });

  const totalEmployees = employeesRes?.total ?? 0;
  const attendanceRecords: AttendanceRecord[] = attendanceRes?.data ?? [];
  const presentToday = attendanceRes?.total ?? 0;
  const pendingLeaveList: LeaveRequest[] = pendingLeaveRes?.data ?? [];
  const pendingLeaveCount = pendingLeaveRes?.total ?? 0;

  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

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
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Đang làm việc
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng NV"
            value={totalEmployees}
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
            value={presentToday}
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
            value={0}
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
            value={0}
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
                    {attendanceLoading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                          Đang tải...
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((rec) => {
                        const empName = rec.employee?.full_name ?? `NV #${rec.employee_id}`;
                        const hasGps = !!(rec.gps_lat && rec.gps_lng);
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                                  {empName.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-slate-700">{empName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-600">{formatTime(rec.check_in_time)}</td>
                            <td className="px-5 py-3 text-sm text-slate-600">{formatTime(rec.check_out_time)}</td>
                            <td className="px-5 py-3">{statusBadge(rec.status)}</td>
                            <td className="px-5 py-3">
                              {hasGps ? (
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
                        );
                      })
                    )}
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
                <Badge variant="yellow" dot>{pendingLeaveCount}</Badge>
              </CardHeader>
              <div className="space-y-2">
                {leaveLoading ? (
                  <p className="text-sm text-slate-400 text-center py-4">Đang tải...</p>
                ) : (
                  pendingLeaveList.map((req) => {
                    const empName = req.employee?.full_name ?? `NV #${req.employee_id}`;
                    return (
                      <div key={req.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                          {empName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-700">{empName}</p>
                          <p className="text-xs text-slate-400">{req.start_date} · {req.days} ngày</p>
                        </div>
                        {statusBadge(req.overall_status)}
                      </div>
                    );
                  })
                )}
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
