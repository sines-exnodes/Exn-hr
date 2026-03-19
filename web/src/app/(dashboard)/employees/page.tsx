"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Employee } from "@/types";

// TODO: connect to real API — GET /employees
const mockEmployees: Employee[] = [
  { id: 1, employee_code: "EMP001", name: "Nguyễn Văn An", email: "an.nv@company.com", phone: "0901234567", role: "employee", department_id: 1, department_name: "Engineering", position: "Senior Developer", status: "active", hire_date: "2022-01-15", insurance_salary: 8000000, base_salary: 20000000, created_at: "2022-01-15T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 2, employee_code: "EMP002", name: "Trần Thị Bình", email: "binh.tt@company.com", phone: "0912345678", role: "hr", department_id: 3, department_name: "HR", position: "HR Specialist", status: "active", hire_date: "2021-06-01", insurance_salary: 7000000, base_salary: 15000000, created_at: "2021-06-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 3, employee_code: "EMP003", name: "Lê Minh Châu", email: "chau.lm@company.com", role: "employee", department_id: 2, department_name: "Sales", position: "Sales Manager", status: "on_leave", hire_date: "2020-03-10", insurance_salary: 6000000, base_salary: 18000000, created_at: "2020-03-10T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 4, employee_code: "EMP004", name: "Phạm Quốc Dũng", email: "dung.pq@company.com", phone: "0934567890", role: "leader", department_id: 1, department_name: "Engineering", position: "Tech Lead", status: "active", hire_date: "2019-08-20", insurance_salary: 10000000, base_salary: 30000000, created_at: "2019-08-20T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 5, employee_code: "EMP005", name: "Hoàng Thị Em", email: "em.ht@company.com", role: "employee", department_id: 4, department_name: "Finance", position: "Accountant", status: "active", hire_date: "2023-02-01", insurance_salary: 5500000, base_salary: 12000000, created_at: "2023-02-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 6, employee_code: "EMP006", name: "Vũ Thành Giang", email: "giang.vt@company.com", role: "employee", department_id: 5, department_name: "Marketing", position: "Content Specialist", status: "active", hire_date: "2023-05-15", insurance_salary: 5000000, base_salary: 11000000, created_at: "2023-05-15T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 7, employee_code: "EMP007", name: "Đỗ Thị Hương", email: "huong.dt@company.com", role: "employee", department_id: 2, department_name: "Sales", position: "Sales Executive", status: "inactive", hire_date: "2021-09-01", insurance_salary: 5000000, base_salary: 10000000, created_at: "2021-09-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 8, employee_code: "EMP008", name: "Bùi Văn Khoa", email: "khoa.bv@company.com", role: "employee", department_id: 1, department_name: "Engineering", position: "Frontend Developer", status: "active", hire_date: "2024-01-10", insurance_salary: 6000000, base_salary: 14000000, created_at: "2024-01-10T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
];

const departmentOptions = [
  { value: "", label: "Tất cả phòng ban" },
  { value: "Engineering", label: "Engineering" },
  { value: "Sales", label: "Sales" },
  { value: "HR", label: "HR" },
  { value: "Finance", label: "Finance" },
  { value: "Marketing", label: "Marketing" },
];

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
  { value: "terminated", label: "Terminated" },
];

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = mockEmployees.filter((emp) => {
    const matchSearch =
      !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || emp.department_name === deptFilter;
    const matchStatus = !statusFilter || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <>
      <Header
        title="Quản lý nhân viên"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Nhân viên" }]}
      />
      <div className="p-6 space-y-4">
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
          <span>Hiển thị <strong className="text-slate-700">{filtered.length}</strong> / {mockEmployees.length} nhân viên</span>
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mã / Tên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Phòng ban</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vị trí</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Lương CB</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày vào</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                      Không tìm thấy nhân viên nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E]/10 text-sm font-semibold text-[#22C55E]">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{emp.name}</p>
                            <p className="text-xs text-slate-400">{emp.employee_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{emp.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{emp.department_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{emp.position}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">{formatCurrency(emp.base_salary)}</td>
                      <td className="px-4 py-3">{statusBadge(emp.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{emp.hire_date}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="text-sm font-medium text-[#22C55E] hover:text-green-700 transition-colors"
                        >
                          Xem
                        </Link>
                      </td>
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
