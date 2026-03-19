"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AttendanceRecord } from "@/types";

// TODO: connect to real API — GET /attendance
const mockAttendance: AttendanceRecord[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", date: "2026-03-19", check_in: "08:02", check_out: "17:30", status: "present", location_verified: true },
  { id: 2, employee_id: 2, employee_name: "Trần Thị Bình", date: "2026-03-19", check_in: "08:45", check_out: "17:15", status: "late", location_verified: true, note: "Kẹt xe" },
  { id: 3, employee_id: 3, employee_name: "Lê Minh Châu", date: "2026-03-19", check_in: undefined, check_out: undefined, status: "absent", location_verified: false },
  { id: 4, employee_id: 4, employee_name: "Phạm Quốc Dũng", date: "2026-03-19", check_in: "08:00", check_out: "12:30", status: "half_day", location_verified: true },
  { id: 5, employee_id: 5, employee_name: "Hoàng Thị Em", date: "2026-03-19", check_in: "08:05", check_out: "17:35", status: "present", location_verified: false, note: "WFH - WiFi xác nhận" },
  { id: 6, employee_id: 6, employee_name: "Vũ Thành Giang", date: "2026-03-19", check_in: "08:10", check_out: "17:20", status: "wfh", location_verified: true },
  { id: 7, employee_id: 7, employee_name: "Đỗ Thị Hương", date: "2026-03-19", check_in: "08:03", check_out: "17:00", status: "present", location_verified: true },
  { id: 8, employee_id: 8, employee_name: "Bùi Văn Khoa", date: "2026-03-19", check_in: "09:15", check_out: "18:00", status: "late", location_verified: true },
];

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "present", label: "Có mặt" },
  { value: "late", label: "Đi trễ" },
  { value: "absent", label: "Vắng" },
  { value: "half_day", label: "Nửa ngày" },
  { value: "wfh", label: "WFH" },
];

export default function AttendancePage() {
  const [dateFrom, setDateFrom] = useState("2026-03-19");
  const [dateTo, setDateTo] = useState("2026-03-19");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = mockAttendance.filter((r) => {
    const matchSearch = !search || r.employee_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    present: mockAttendance.filter((r) => r.status === "present").length,
    late: mockAttendance.filter((r) => r.status === "late").length,
    absent: mockAttendance.filter((r) => r.status === "absent").length,
    wfh: mockAttendance.filter((r) => r.status === "wfh").length,
    half: mockAttendance.filter((r) => r.status === "half_day").length,
    verified: mockAttendance.filter((r) => r.location_verified).length,
  };

  return (
    <>
      <Header
        title="Chấm công"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Chấm công" }]}
      />
      <div className="p-6 space-y-5">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Có mặt", value: stats.present, variant: "green" as const },
            { label: "Đi trễ", value: stats.late, variant: "orange" as const },
            { label: "Vắng", value: stats.absent, variant: "red" as const },
            { label: "Nửa ngày", value: stats.half, variant: "yellow" as const },
            { label: "WFH", value: stats.wfh, variant: "blue" as const },
            { label: "GPS xác nhận", value: stats.verified, variant: "gray" as const },
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
                  {["Nhân viên", "Ngày", "Check-in", "Check-out", "Trạng thái", "GPS", "Ghi chú"].map((h) => (
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
                  filtered.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                            {rec.employee_name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{rec.employee_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{rec.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{rec.check_in ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{rec.check_out ?? "—"}</td>
                      <td className="px-4 py-3">{statusBadge(rec.status)}</td>
                      <td className="px-4 py-3">
                        {rec.location_verified ? (
                          <Badge variant="green" dot>Verified</Badge>
                        ) : (
                          <Badge variant="gray" dot>Unverified</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{rec.note ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
