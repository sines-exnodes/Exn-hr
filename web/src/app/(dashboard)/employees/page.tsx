"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useEmployees, useDepartments } from "@/hooks/useApi";
import type { Employee } from "@/types";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page] = useState(1);

  useEffect(() => {
    const fromUrl = searchParams.get("department_id");
    setDeptFilter(fromUrl ?? "");
  }, [searchParams]);

  // Real API calls
  const { data: employeesRes, isLoading } = useEmployees({
    page,
    size: 50,
    search: search || undefined,
    department_id: deptFilter ? Number(deptFilter) : undefined,
  });
  const { data: deptRes } = useDepartments();

  const employees: Employee[] = employeesRes?.data ?? [];
  const totalCount = employeesRes?.total ?? 0;

  // Build department options from API
  const departments = deptRes?.data ?? [];
  const departmentOptions = [
    { value: "", label: "Tất cả phòng ban" },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ];

  // Client-side filtering for status (API may not support status filter directly)
  const filtered = employees.filter((emp) => {
    const isActive = emp.user?.is_active ?? true;
    const empStatus = isActive ? "active" : "inactive";
    const matchStatus = !statusFilter || empStatus === statusFilter;
    return matchStatus;
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  const activeDeptName = deptFilter
    ? departments.find((d) => String(d.id) === deptFilter)?.name
    : undefined;

  return (
    <>
      <Header
        title="Quản lý nhân viên"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Nhân viên" }]}
      />
      <div className="p-6 space-y-4">
        {activeDeptName && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-green-100 bg-green-50/80 px-4 py-3 text-sm text-green-800">
            <span>
              Đang lọc theo phòng ban: <strong>{activeDeptName}</strong> (chỉ nhân viên đã gán team thuộc phòng ban này).
            </span>
            <Link
              href="/employees"
              className="shrink-0 font-medium text-[#15803d] underline-offset-2 hover:underline"
            >
              Xem tất cả nhân viên
            </Link>
          </div>
        )}
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Tìm kiếm nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={departmentOptions}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>
          <Link href="/employees/new">
            <Button icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }>
              Thêm nhân viên
            </Button>
          </Link>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Hiển thị <strong className="text-slate-700">{filtered.length}</strong> / {totalCount} nhân viên</span>
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vị trí</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Lương CB</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày vào</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white stagger-children">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                      Không tìm thấy nhân viên nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => {
                    const empStatus = emp.user?.is_active ? "active" : "inactive";
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E]/10 text-sm font-semibold text-[#22C55E]">
                              {emp.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{emp.full_name}</p>
                              <p className="text-xs text-slate-400">ID #{emp.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{emp.user?.email ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{emp.team?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{emp.position}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 font-medium">{formatCurrency(emp.basic_salary)}</td>
                        <td className="px-4 py-3">{statusBadge(empStatus)}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{emp.join_date}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/employees/${emp.id}`}
                            className="text-sm font-medium text-[#22C55E] hover:text-green-700 transition-colors"
                          >
                            Xem
                          </Link>
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
    </>
  );
}
