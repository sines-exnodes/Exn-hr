"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import type { SalaryRecord } from "@/types";
import {
  useSalaryRecords,
  runPayroll,
  confirmSalary,
  exportPayrollCsv,
} from "@/hooks/useApi";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const contractTypeLabel: Record<
  string,
  {
    label: string;
    variant: "green" | "blue" | "yellow" | "orange" | "purple" | "gray";
  }
> = {
  full_time: { label: "Toàn thời gian", variant: "green" },
  expat: { label: "Expat", variant: "purple" },
  probation: { label: "Thử việc", variant: "yellow" },
  intern: { label: "Thực tập", variant: "orange" },
  collaborator: { label: "CTV", variant: "blue" },
  service_contract: { label: "HĐDV", variant: "gray" },
};

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Tháng ${i + 1}`,
}));

const yearOptions = ["2026", "2025", "2024"].map((y) => ({
  value: y,
  label: y,
}));

function SalaryDetailModal({
  record,
  isOpen,
  onClose,
}: {
  record: SalaryRecord | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!record) return null;

  const employeeName =
    record.employee?.full_name ?? `NV #${record.employee_id}`;

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-sm font-semibold text-slate-800 mb-2 mt-4 first:mt-0">
      {children}
    </h4>
  );

  const Row = ({
    label,
    value,
    bold,
    negative,
    highlight,
  }: {
    label: string;
    value: number;
    bold?: boolean;
    negative?: boolean;
    highlight?: boolean;
  }) => (
    <div
      className={[
        "flex items-center justify-between py-1.5 px-2 rounded",
        highlight ? "bg-green-50" : "",
      ].join(" ")}
    >
      <span
        className={`text-sm ${bold ? "font-semibold text-slate-800" : "text-slate-600"}`}
      >
        {label}
      </span>
      <span
        className={[
          "text-sm tabular-nums",
          bold ? "font-bold" : "font-medium",
          negative
            ? "text-red-600"
            : highlight
              ? "text-green-700"
              : "text-slate-800",
        ].join(" ")}
      >
        {negative && value > 0 ? "-" : ""}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );

  const Divider = () => (
    <div className="border-t border-dashed border-slate-200 my-1" />
  );

  const totalIncome =
    (record.prorated_salary ?? record.basic_salary) +
    (record.taxable_allowances ?? 0) +
    (record.non_taxable_allowances ?? 0) +
    record.total_ot_pay +
    record.total_bonus;

  const totalDeductions =
    (record.bhxh ?? 0) +
    (record.bhyt ?? 0) +
    (record.bhtn ?? 0) +
    (record.pit_amount ?? 0) +
    (record.union_fee_employee ?? 0) +
    record.salary_advance;

  const totalEmployerCost =
    record.total_employer_cost ??
    (record.employer_insurance_cost ?? 0) + (record.union_fee_employer ?? 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết lương — ${employeeName}`}
      size="xl"
    >
      <div className="max-h-[70vh] overflow-y-auto -mx-6 px-6 space-y-1">
        {/* Header info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E]/10 text-sm font-semibold text-[#22C55E]">
            {employeeName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {employeeName}
            </p>
            <p className="text-xs text-slate-400">
              Tháng {record.month}/{record.year} &middot;{" "}
              {record.employee?.contract_type
                ? (contractTypeLabel[record.employee.contract_type]?.label ??
                  record.employee.contract_type)
                : "—"}
            </p>
          </div>
          <div className="ml-auto">{statusBadge(record.status)}</div>
        </div>

        {/* Thu nhap */}
        <SectionTitle>Thu nhập</SectionTitle>
        <Row
          label="Lương theo ngày công"
          value={record.prorated_salary ?? record.basic_salary}
        />
        <Row label="Phụ cấp tính thuế" value={record.taxable_allowances ?? 0} />
        <Row
          label="Phụ cấp miễn thuế"
          value={record.non_taxable_allowances ?? 0}
        />
        <Row label="OT ngày thường" value={record.ot_pay_normal ?? 0} />
        <Row label="OT cuối tuần" value={record.ot_pay_weekend ?? 0} />
        <Row label="OT ngày lễ" value={record.ot_pay_holiday ?? 0} />
        <Row label="Thưởng" value={record.total_bonus} />
        <Divider />
        <Row label="Tổng thu nhập" value={totalIncome} bold />

        {/* Khau tru */}
        <SectionTitle>Khấu trừ</SectionTitle>
        <Row label="BHXH (8%)" value={record.bhxh ?? 0} negative />
        <Row label="BHYT (1.5%)" value={record.bhyt ?? 0} negative />
        <Row label="BHTN (1%)" value={record.bhtn ?? 0} negative />
        <div className="px-2 py-1">
          <p className="text-xs text-slate-400">
            Thu nhập chịu thuế: {formatCurrency(record.taxable_income ?? 0)}{" "}
            &middot; Giảm trừ bản thân:{" "}
            {formatCurrency(record.personal_deduction ?? 0)} &middot; Giảm trừ
            người phụ thuộc: {formatCurrency(record.dependent_deduction ?? 0)}
          </p>
        </div>
        <Row label="Thuế TNCN" value={record.pit_amount ?? 0} negative />
        <Row
          label="Đoàn phí NV"
          value={record.union_fee_employee ?? 0}
          negative
        />
        <Row label="Tạm ứng" value={record.salary_advance} negative />
        <Divider />
        <Row label="Tổng khấu trừ" value={totalDeductions} bold negative />

        {/* Chi phi cong ty */}
        <SectionTitle>Chi phí công ty</SectionTitle>
        <Row
          label="BHXH công ty (17.5%)"
          value={
            record.employer_bhxh ?? (record.employer_insurance_cost ?? 0) * 0.7
          }
        />
        <Row
          label="BHYT công ty (3%)"
          value={
            record.employer_bhyt ?? (record.employer_insurance_cost ?? 0) * 0.12
          }
        />
        <Row
          label="BHTN công ty (1%)"
          value={
            record.employer_bhtn ?? (record.employer_insurance_cost ?? 0) * 0.04
          }
        />
        <Row
          label="TNNN công ty (0.5%)"
          value={
            record.employer_tnnn ?? (record.employer_insurance_cost ?? 0) * 0.14
          }
        />
        <Row label="Đoàn phí CTY" value={record.union_fee_employer ?? 0} />
        <Divider />
        <Row label="Tổng chi phí công ty" value={totalEmployerCost} bold />

        {/* Net salary */}
        <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-800">
              Thực nhận
            </span>
            <span className="text-xl font-bold text-green-700">
              {formatCurrency(record.net_salary)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function PayrollPage() {
  const [month, setMonth] = useState("3");
  const [year, setYear] = useState("2026");
  const [standardWorkDays, setStandardWorkDays] = useState("22");
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(
    null,
  );

  const {
    data: response,
    mutate,
    isLoading,
  } = useSalaryRecords({
    month: Number(month),
    year: Number(year),
  });

  const payrollData = response?.data ?? [];

  const summary = {
    total_employees: payrollData.length,
    total_gross: payrollData.reduce(
      (s, p) =>
        s +
        p.basic_salary +
        p.total_allowances +
        p.total_ot_pay +
        p.total_bonus,
      0,
    ),
    total_net: payrollData.reduce((s, p) => s + p.net_salary, 0),
    total_allowances: payrollData.reduce((s, p) => s + p.total_allowances, 0),
    total_ot: payrollData.reduce((s, p) => s + p.total_ot_pay, 0),
    total_bonus: payrollData.reduce((s, p) => s + p.total_bonus, 0),
    total_deductions: payrollData.reduce((s, p) => s + p.total_deductions, 0),
    status: payrollData.length > 0 ? payrollData[0].status : "draft",
  };

  const handleRunPayroll = async () => {
    const days = Number(standardWorkDays);
    if (!days || days <= 0) {
      alert("Vui lòng nhập số ngày công chuẩn hợp lệ");
      return;
    }
    setActionLoading(true);
    try {
      await runPayroll({
        month: Number(month),
        year: Number(year),
        standard_work_days: days,
      });
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
      const blob = await exportPayrollCsv({
        month: Number(month),
        year: Number(year),
      });
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

  const tableHeaders = [
    "Kỳ lương",
    "Nhân viên",
    "Loại HĐ",
    "Lương GP",
    "Ngày công",
    "Phụ cấp",
    "OT",
    "Thưởng",
    "BHXH NV",
    "Thuế TNCN",
    "Đoàn phí",
    "Thực nhận",
    "Trạng thái",
    "",
  ];

  return (
    <>
      <Header
        title="Tính lương"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Tính lương" },
        ]}
      />
      <div className="p-6 space-y-5">
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center text-sm text-slate-400 py-2">
            Đang tải dữ liệu...
          </div>
        )}

        {/* Period selector + standard work days */}
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
            <div className="w-44">
              <Input
                label="Số ngày công chuẩn"
                type="number"
                min={1}
                max={31}
                value={standardWorkDays}
                onChange={(e) => setStandardWorkDays(e.target.value)}
                required
                placeholder="VD: 22"
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
            {
              label: "Nhân viên",
              value: summary.total_employees,
              isNumber: true,
              color: "text-slate-800",
            },
            {
              label: "Tổng gộp",
              value: formatCurrency(summary.total_gross),
              isNumber: false,
              color: "text-slate-800",
            },
            {
              label: "Tổng thực nhận",
              value: formatCurrency(summary.total_net),
              isNumber: false,
              color: "text-green-600",
            },
            {
              label: "Phụ cấp",
              value: formatCurrency(summary.total_allowances),
              isNumber: false,
              color: "text-blue-600",
            },
            {
              label: "OT",
              value: formatCurrency(summary.total_ot),
              isNumber: false,
              color: "text-orange-600",
            },
            {
              label: "Khấu trừ",
              value: formatCurrency(summary.total_deductions),
              isNumber: false,
              color: "text-red-600",
            },
          ].map(({ label, value, color }) => (
            <Card key={label} padding="sm">
              <p className="text-xs text-slate-400">{label}</p>
              <p className={`mt-1 text-lg font-bold ${color} truncate`}>
                {value}
              </p>
            </Card>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              Kỳ lương:{" "}
              <strong>
                Tháng {month}/{year}
              </strong>
            </span>
            {statusBadge(summary.status)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Đang xuất..." : "Xuất CSV"}
            </Button>
            <Button disabled={actionLoading} onClick={handleRunPayroll}>
              {actionLoading ? "Đang xử lý..." : "Chạy bảng lương"}
            </Button>
          </div>
        </div>

        {/* Payroll table */}
        <Card padding="none">
          <div className="border-b border-slate-100 p-4">
            <h3 className="font-semibold text-slate-800">
              Chi tiết bảng lương tháng {month}/{year}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {tableHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payrollData.map((p) => {
                  const employeeName =
                    p.employee?.full_name ?? `NV #${p.employee_id}`;
                  const ct = p.employee?.contract_type
                    ? contractTypeLabel[p.employee.contract_type]
                    : null;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRecord(p)}
                    >
                      {/* Ky luong */}
                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                        {p.month}/{p.year}
                      </td>
                      {/* Nhan vien */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                            {employeeName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {employeeName}
                          </span>
                        </div>
                      </td>
                      {/* Loai HD */}
                      <td className="px-4 py-3">
                        {ct ? (
                          <Badge variant={ct.variant}>{ct.label}</Badge>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      {/* Luong GP */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {formatCurrency(p.basic_salary)}
                      </td>
                      {/* Ngay cong */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {p.actual_work_days ?? "—"} /{" "}
                        {p.standard_work_days ?? "—"}
                      </td>
                      {/* Phu cap */}
                      <td className="px-4 py-3 text-sm text-blue-600 whitespace-nowrap">
                        {p.total_allowances > 0
                          ? formatCurrency(p.total_allowances)
                          : "—"}
                      </td>
                      {/* OT */}
                      <td className="px-4 py-3 text-sm text-orange-600 whitespace-nowrap">
                        {p.total_ot_pay > 0
                          ? formatCurrency(p.total_ot_pay)
                          : "—"}
                      </td>
                      {/* Thuong */}
                      <td className="px-4 py-3 text-sm text-green-600 whitespace-nowrap">
                        {p.total_bonus > 0
                          ? formatCurrency(p.total_bonus)
                          : "—"}
                      </td>
                      {/* BHXH NV */}
                      <td className="px-4 py-3 text-sm text-red-600 whitespace-nowrap">
                        {(p.bhxh ?? 0) + (p.bhyt ?? 0) + (p.bhtn ?? 0) > 0
                          ? `-${formatCurrency((p.bhxh ?? 0) + (p.bhyt ?? 0) + (p.bhtn ?? 0))}`
                          : "—"}
                      </td>
                      {/* Thue TNCN */}
                      <td className="px-4 py-3 text-sm text-red-600 whitespace-nowrap">
                        {(p.pit_amount ?? 0) > 0
                          ? `-${formatCurrency(p.pit_amount!)}`
                          : "—"}
                      </td>
                      {/* Doan phi */}
                      <td className="px-4 py-3 text-sm text-red-600 whitespace-nowrap">
                        {(p.union_fee_employee ?? 0) > 0
                          ? `-${formatCurrency(p.union_fee_employee!)}`
                          : "—"}
                      </td>
                      {/* Thuc nhan */}
                      <td className="px-4 py-3 text-sm font-bold text-green-600 whitespace-nowrap">
                        {formatCurrency(p.net_salary)}
                      </td>
                      {/* Trang thai */}
                      <td className="px-4 py-3">{statusBadge(p.status)}</td>
                      {/* Xem phieu luong */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/payroll/${p.id}`}
                          className="text-xs font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Xem
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                    Tổng cộng
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                    {payrollData.length} NV
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap">
                    {formatCurrency(
                      payrollData.reduce((s, p) => s + p.basic_salary, 0),
                    )}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600 whitespace-nowrap">
                    {formatCurrency(summary.total_allowances)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-orange-600 whitespace-nowrap">
                    {formatCurrency(summary.total_ot)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600 whitespace-nowrap">
                    {formatCurrency(summary.total_bonus)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600 whitespace-nowrap">
                    -
                    {formatCurrency(
                      payrollData.reduce(
                        (s, p) =>
                          s + (p.bhxh ?? 0) + (p.bhyt ?? 0) + (p.bhtn ?? 0),
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600 whitespace-nowrap">
                    -
                    {formatCurrency(
                      payrollData.reduce((s, p) => s + (p.pit_amount ?? 0), 0),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600 whitespace-nowrap">
                    -
                    {formatCurrency(
                      payrollData.reduce(
                        (s, p) => s + (p.union_fee_employee ?? 0),
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600 whitespace-nowrap">
                    {formatCurrency(summary.total_net)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>

      {/* Detail modal */}
      <SalaryDetailModal
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </>
  );
}
