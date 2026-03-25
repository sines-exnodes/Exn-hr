"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { SalaryRecord } from "@/types";
import { useSalaryRecords, runPayroll, confirmSalary, exportPayrollCsv } from "@/hooks/useApi";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);


const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Tháng ${i + 1}`,
}));

const yearOptions = ["2026", "2025", "2024"].map((y) => ({ value: y, label: y }));

export default function PayrollPage() {
  const [month, setMonth] = useState("3");
  const [year, setYear] = useState("2026");
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: response, mutate, isLoading } = useSalaryRecords({
    month: Number(month),
    year: Number(year),
  });

  const payrollData = response?.data ?? [];

  const summary = {
    total_employees: payrollData.length,
    total_gross: payrollData.reduce((s, p) => s + p.basic_salary + p.total_allowances + p.total_ot_pay + p.total_bonus, 0),
    total_net: payrollData.reduce((s, p) => s + p.net_salary, 0),
    total_allowances: payrollData.reduce((s, p) => s + p.total_allowances, 0),
    total_ot: payrollData.reduce((s, p) => s + p.total_ot_pay, 0),
    total_bonus: payrollData.reduce((s, p) => s + p.total_bonus, 0),
    total_deductions: payrollData.reduce((s, p) => s + p.total_deductions, 0),
    status: payrollData.length > 0 ? payrollData[0].status : "draft",
  };

  const handleRunPayroll = async () => {
    setActionLoading(true);
    try {
      await runPayroll({ month: Number(month), year: Number(year) });
      await mutate();
    } catch (err) {
      console.error("Run payroll failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportPayrollCsv({ month: Number(month), year: Number(year) });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll_${month}_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export payroll failed", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Header
        title="Tính lương"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Tính lương" }]}
      />
      <div className="p-6 space-y-5">
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center text-sm text-slate-400 py-2">Đang tải dữ liệu...</div>
        )}

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
            <Button variant="outline" onClick={() => mutate()}>
              Tải dữ liệu
            </Button>
          </div>
        </Card>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Nhân viên", value: summary.total_employees, isNumber: true, color: "text-slate-800" },
            { label: "Tổng gộp", value: formatCurrency(summary.total_gross), isNumber: false, color: "text-slate-800" },
            { label: "Tổng thực nhận", value: formatCurrency(summary.total_net), isNumber: false, color: "text-green-600" },
            { label: "Phụ cấp", value: formatCurrency(summary.total_allowances), isNumber: false, color: "text-blue-600" },
            { label: "OT", value: formatCurrency(summary.total_ot), isNumber: false, color: "text-orange-600" },
            { label: "Khấu trừ", value: formatCurrency(summary.total_deductions), isNumber: false, color: "text-red-600" },
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
            {statusBadge(summary.status)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? "Đang xuất..." : "Xuất CSV"}
            </Button>
            <Button disabled={actionLoading} onClick={handleRunPayroll}>
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
                  {["Nhân viên", "Lương CB", "Phụ cấp", "OT (x1.5)", "Thưởng", "Khấu trừ", "Ứng lương", "Thực nhận"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payrollData.map((p) => {
                  const employeeName = p.employee?.full_name ?? `NV #${p.employee_id}`;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                            {employeeName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{employeeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.basic_salary)}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{formatCurrency(p.total_allowances)}</td>
                      <td className="px-4 py-3 text-sm text-orange-600">
                        {p.total_ot_pay > 0 ? `+${formatCurrency(p.total_ot_pay)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {p.total_bonus > 0 ? `+${formatCurrency(p.total_bonus)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {p.total_deductions > 0 ? `-${formatCurrency(p.total_deductions)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {p.salary_advance > 0 ? `-${formatCurrency(p.salary_advance)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(p.net_salary)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">Tổng cộng</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatCurrency(payrollData.reduce((s, p) => s + p.basic_salary, 0))}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatCurrency(summary.total_allowances)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-orange-600">{formatCurrency(summary.total_ot)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(summary.total_bonus)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">-{formatCurrency(summary.total_deductions)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-500">-{formatCurrency(payrollData.reduce((s, p) => s + p.salary_advance, 0))}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(summary.total_net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
