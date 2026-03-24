"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AttendanceRecord } from "@/types";
import { useAttendanceRecords } from "@/hooks/useApi";

const mockAttendance: AttendanceRecord[] = [
  { id: 1, employee_id: 1, check_in_time: "2026-03-19T08:02:00Z", check_out_time: "2026-03-19T17:30:00Z", status: "checked_out", gps_lat: 10.762622, gps_lng: 106.660172 },
  { id: 2, employee_id: 2, check_in_time: "2026-03-19T08:45:00Z", check_out_time: "2026-03-19T17:15:00Z", status: "checked_out", gps_lat: 10.762622, gps_lng: 106.660172, wifi_ssid: "Office-WiFi" },
  { id: 3, employee_id: 3, status: "checked_in", gps_lat: undefined, gps_lng: undefined },
  { id: 4, employee_id: 4, check_in_time: "2026-03-19T08:00:00Z", check_out_time: "2026-03-19T12:30:00Z", status: "checked_out", gps_lat: 10.762622, gps_lng: 106.660172 },
  { id: 5, employee_id: 5, check_in_time: "2026-03-19T08:05:00Z", check_out_time: "2026-03-19T17:35:00Z", status: "checked_out", wifi_ssid: "Home-WiFi" },
  { id: 6, employee_id: 6, check_in_time: "2026-03-19T08:10:00Z", check_out_time: "2026-03-19T17:20:00Z", status: "checked_out", gps_lat: 10.762622, gps_lng: 106.660172 },
  { id: 7, employee_id: 7, check_in_time: "2026-03-19T08:03:00Z", check_out_time: "2026-03-19T17:00:00Z", status: "checked_out", gps_lat: 10.762622, gps_lng: 106.660172 },
  { id: 8, employee_id: 8, check_in_time: "2026-03-19T09:15:00Z", check_out_time: "2026-03-19T18:00:00Z", status: "checked_out", gps_lat: 10.762622, gps_lng: 106.660172 },
];

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "checked_in", label: "Đã check-in" },
  { value: "checked_out", label: "Đã check-out" },
];

function formatTime(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoString;
  }
}

function formatDate(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN");
  } catch {
    return isoString;
  }
}

export default function AttendancePage() {
  const [dateFrom, setDateFrom] = useState("2026-03-19");
  const [dateTo, setDateTo] = useState("2026-03-19");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useAttendanceRecords({
    start_date: dateFrom,
    end_date: dateTo,
  });

  const attendanceData = response?.data ?? mockAttendance;

  const filtered = attendanceData.filter((r) => {
    const employeeName = r.employee?.full_name ?? "";
    const matchSearch = !search || employeeName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    checkedIn: attendanceData.filter((r) => r.status === "checked_in").length,
    checkedOut: attendanceData.filter((r) => r.status === "checked_out").length,
    total: attendanceData.length,
    gpsVerified: attendanceData.filter((r) => r.gps_lat != null && r.gps_lng != null).length,
    wifiVerified: attendanceData.filter((r) => !!r.wifi_ssid).length,
  };

  return (
    <>
      <Header
        title="Chấm công"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Chấm công" }]}
      />
      <div className="p-6 space-y-5">
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center text-sm text-slate-400 py-2">Đang tải dữ liệu...</div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-36">
              <Input
                label="Từ ngày"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="w-36">
              <Input
                label="Đến ngày"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="w-56">
              <Input
                label="Tìm nhân viên"
                placeholder="Tên nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="w-44">
              <Select
                label="Trạng thái"
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
            <Button variant="outline" icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }>
              Xuất Excel
            </Button>
          </div>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Đã check-in", value: stats.checkedIn, variant: "green" as const },
            { label: "Đã check-out", value: stats.checkedOut, variant: "blue" as const },
            { label: "Tổng cộng", value: stats.total, variant: "gray" as const },
            { label: "GPS xác nhận", value: stats.gpsVerified, variant: "orange" as const },
            { label: "WiFi xác nhận", value: stats.wifiVerified, variant: "purple" as const },
          ].map(({ label, value, variant }) => (
            <Card key={label} padding="sm">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
              <Badge variant={variant} className="mt-1">hôm nay</Badge>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h3 className="font-semibold text-slate-800">
              Danh sách chấm công
            </h3>
            <span className="text-sm text-slate-400">{filtered.length} bản ghi</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Nhân viên", "Ngày", "Check-in", "Check-out", "Trạng thái", "GPS", "WiFi"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                      Không có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  filtered.map((rec) => {
                    const employeeName = rec.employee?.full_name ?? `NV #${rec.employee_id}`;
                    const hasGps = rec.gps_lat != null && rec.gps_lng != null;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                              {employeeName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{employeeName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(rec.check_in_time)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatTime(rec.check_in_time)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatTime(rec.check_out_time)}</td>
                        <td className="px-4 py-3">{statusBadge(rec.status)}</td>
                        <td className="px-4 py-3">
                          {hasGps ? (
                            <Badge variant="green" dot>Verified</Badge>
                          ) : (
                            <Badge variant="gray" dot>Unverified</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">{rec.wifi_ssid ?? "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
