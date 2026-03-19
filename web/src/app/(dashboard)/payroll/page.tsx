"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { PayrollRecord, PayrollSummary } from "@/types";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// TODO: connect to real API — GET /payroll?month=3&year=2026
const mockPayroll: PayrollRecord[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", month: 3, year: 2026, base_salary: 20000000, total_allowances: 2000000, total_overtime: 1500000, insurance_deduction: 1600000, net_salary: 21900000, status: "draft" },
  { id: 2, employee_id: 2, employee_name: "Trần Thị Bình", department_name: "HR", month: 3, year: 2026, base_salary: 15000000, total_allowances: 1000000, total_overtime: 0, insurance_deduction: 1200000, net_salary: 14800000, status: "draft" },
  { id: 3, employee_id: 3, employee_name: "Lê Minh Châu", department_name: "Sales", month: 3, year: 2026, base_salary: 18000000, total_allowances: 1500000, total_overtime: 750000, insurance_deduction: 1440000, net_salary: 18810000, status: "draft" },
  { id: 4, employee_id: 4, employee_name: "Phạm Quốc Dũng", department_name: "Engineering", month: 3, year: 2026, base_salary: 30000000, total_allowances: 3000000, total_overtime: 2250000, insurance_deduction: 2400000, net_salary: 32850000, status: "draft" },
  { id: 5, employee_id: 5, employee_name: "Hoàng Thị Em", department_name: "Finance", month: 3, year: 2026, base_salary: 12000000, total_allowances: 800000, total_overtime: 0, insurance_deduction: 960000, net_salary: 11840000, status: "draft" },
  { id: 6, employee_id: 6, employee_name: "Vũ Thành Giang", department_name: "Marketing", month: 3, year: 2026, base_salary: 11000000, total_allowances: 700000, total_overtime: 0, insurance_deduction: 880000, net_salary: 10820000, status: "draft" },
];

const mockSummary: PayrollSummary = {
  month: 3,
  year: 2026,
  total_employees: mockPayroll.length,
  total_gross: mockPayroll.reduce((s, p) => s + p.base_salary + p.total_allowances + p.total_overtime, 0),
  total_net: mockPayroll.reduce((s, p) => s + p.net_salary, 0),
  total_overtime: mockPayroll.reduce((s, p) => s + p.total_overtime, 0),
  total_allowances: mockPayroll.reduce((s, p) => s + p.total_allowances, 0),
  total_insurance: mockPayroll.reduce((s, p) => s + p.insurance_deduction, 0),
  status: "draft",
};

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Tháng ${i + 1}`,
}));

const yearOptions = ["2026", "2025", "2024"].map((y) => ({ value: y, label: y }));

export default function PayrollPage() {
  const [month, setMonth] = useState("3");
  const [year, setYear] = useState("2026");

  return (
    <>
      <Header
        title="Tính lương"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Tính lương" }]}
      />
      <div className="p-6 space-y-5">
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
            <Button variant="outline">
              Tải dữ liệu
            </Button>
          </div>
        </Card>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Nhân viên", value: mockSummary.total_employees, isNumber: true, color: "text-slate-800" },
            { label: "Tổng gộp", value: formatCurrency(mockSummary.total_gross), isNumber: false, color: "text-slate-800" },
            { label: "Tổng thực nhận", value: formatCurrency(mockSummary.total_net), isNumber: false, color: "text-green-600" },
            { label: "Phụ cấp", value: formatCurrency(mockSummary.total_allowances), isNumber: false, color: "text-blue-600" },
            { label: "OT", value: formatCurrency(mockSummary.total_overtime), isNumber: false, color: "text-orange-600" },
            { label: "Bảo hiểm trừ", value: formatCurrency(mockSummary.total_insurance), isNumber: false, color: "text-red-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} padding="sm">
              <p className="text-xs text-slate-400">{label}</p>
              <p className={`mt-1 text-lg font-bold ${color} truncate`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              Kỳ lương: <strong>Tháng {month}/{year}</strong>
            </span>
            {statusBadge(mockSummary.status)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Xuất Excel
            </Button>
            <Button>
              Chạy bảng lương
            </Button>
          </div>
        </div>

        {/* Payroll table */}
        <Card padding="none">
          <div className="border-b border-slate-100 p-4">
            <h3 className="font-semibold text-slate-800">Chi tiết bảng lương tháng {month}/{year}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Nhân viên", "Phòng ban", "Lương CB", "Phụ cấp", "OT (x1.5)", "Thưởng", "Khấu trừ BH", "Thực nhận"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {mockPayroll.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                          {p.employee_name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{p.employee_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{p.department_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.base_salary)}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">{formatCurrency(p.total_allowances)}</td>
                    <td className="px-4 py-3 text-sm text-orange-600">
                      {p.total_overtime > 0 ? `+${formatCurrency(p.total_overtime)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">—</td>
                    <td className="px-4 py-3 text-sm text-red-600">-{formatCurrency(p.insurance_deduction)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(p.net_salary)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-slate-700">Tổng cộng</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatCurrency(mockPayroll.reduce((s, p) => s + p.base_salary, 0))}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatCurrency(mockSummary.total_allowances)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-orange-600">{formatCurrency(mockSummary.total_overtime)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">—</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">-{formatCurrency(mockSummary.total_insurance)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(mockSummary.total_net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
