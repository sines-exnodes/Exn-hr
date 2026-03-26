"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ApiResponse, SalaryRecord } from "@/types";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const contractTypeLabels: Record<string, string> = {
  full_time: "Toàn thời gian",
  expat: "Expat",
  probation: "Thử việc",
  intern: "Thực tập",
  collaborator: "Cộng tác viên",
  service_contract: "Hợp đồng dịch vụ",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
        {children}
      </h3>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  color,
  indent,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
  color?: string;
  indent?: boolean;
}) {
  const formattedValue =
    typeof value === "number" ? formatCurrency(value) : value;
  return (
    <div
      className={`flex items-center justify-between px-5 py-2 ${indent ? "pl-9" : ""}`}
    >
      <span
        className={`text-sm ${bold ? "font-semibold text-slate-800" : "text-slate-600"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-medium tabular-nums ${
          color ?? (bold ? "text-slate-800" : "text-slate-700")
        }`}
      >
        {formattedValue}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-dashed border-slate-200 mx-5" />;
}

export default function PayslipPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, error } = useSWR<ApiResponse<SalaryRecord>>(
    id ? `/salary/${id}` : null,
    (path: string) => api.get<ApiResponse<SalaryRecord>>(path),
  );

  const record = data?.data;

  if (isLoading) {
    return (
      <>
        <Header
          title="Phiếu lương"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Bảng lương", href: "/payroll" },
            { label: "Phiếu lương" },
          ]}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-slate-400">Đang tải phiếu lương...</p>
        </div>
      </>
    );
  }

  if (error || !record) {
    return (
      <>
        <Header
          title="Phiếu lương"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Bảng lương", href: "/payroll" },
            { label: "Phiếu lương" },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm text-red-500">
            {error?.message || "Không tìm thấy phiếu lương."}
          </p>
          <Link href="/payroll">
            <Button variant="outline" size="sm">
              Quay lại bảng lương
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const employee = record.employee;
  const employeeName = employee?.full_name ?? `NV #${record.employee_id}`;
  const department =
    employee?.team?.department?.name ?? employee?.team?.name ?? "—";
  const contractType = employee?.contract_type
    ? (contractTypeLabels[employee.contract_type] ?? employee.contract_type)
    : "—";

  // Computed values
  const insuranceSalary =
    record.insurance_salary ?? employee?.insurance_salary ?? 0;
  const proratedSalary =
    record.prorated_salary ??
    (record.standard_work_days && record.standard_work_days > 0
      ? (record.basic_salary / record.standard_work_days) *
        (record.actual_work_days ?? record.standard_work_days)
      : record.basic_salary);
  const totalInsuranceEmployee =
    (record.bhxh ?? 0) + (record.bhyt ?? 0) + (record.bhtn ?? 0);
  const totalIncome =
    proratedSalary +
    (record.taxable_allowances ?? 0) +
    (record.non_taxable_allowances ?? 0) +
    record.total_ot_pay +
    record.total_bonus;

  // PIT calculation display
  const taxableIncomeBeforeDeduction =
    proratedSalary +
    (record.taxable_allowances ?? 0) +
    record.total_ot_pay +
    record.total_bonus -
    totalInsuranceEmployee;
  const personalDeduction = record.personal_deduction ?? 11000000;
  const dependentDeduction = record.dependent_deduction ?? 0;
  const taxableIncome =
    record.taxable_income ??
    Math.max(
      0,
      taxableIncomeBeforeDeduction - personalDeduction - dependentDeduction,
    );

  return (
    <>
      <Header
        title="Phiếu lương"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Bảng lương", href: "/payroll" },
          { label: "Phiếu lương" },
        ]}
      />
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* ===== HEADER ===== */}
        <Card className="print:shadow-none print:border-0">
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              Công ty EXN
            </p>
            <h2 className="text-xl font-bold text-slate-800">
              Phiếu lương tháng {record.month} năm {record.year}
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">Tên nhân viên</p>
              <p className="text-sm font-semibold text-slate-800">
                {employeeName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Phòng ban</p>
              <p className="text-sm font-semibold text-slate-800">
                {department}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Loại HĐ</p>
              <p className="text-sm font-semibold text-slate-800">
                {contractType}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Mã NV</p>
              <p className="text-sm font-semibold text-slate-800">
                EXN-{String(record.employee_id).padStart(3, "0")}
              </p>
            </div>
          </div>
        </Card>

        {/* ===== 2x2 GRID ===== */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Section 1 - LƯƠNG + THƯỞNG + PC */}
          <Card padding="none" className="overflow-hidden">
            <SectionTitle>Lương + Thưởng + Phụ cấp</SectionTitle>
            <div className="divide-y divide-slate-100 py-1">
              <Row label="Tổng lương HĐ" value={record.basic_salary} />
              <Row label="Lương đóng BHXH" value={insuranceSalary} />
              <Row label="Lương theo ngày công" value={proratedSalary} />
              <Divider />
              <Row
                label="Phụ cấp tính thuế"
                value={record.taxable_allowances ?? 0}
                color="text-blue-600"
              />
              <Row
                label="Phụ cấp miễn thuế"
                value={record.non_taxable_allowances ?? 0}
                color="text-blue-600"
              />
              <Divider />
              <Row
                label="Tổng OT"
                value={record.total_ot_pay}
                color="text-orange-600"
              />
              {(record.ot_pay_normal ?? 0) > 0 && (
                <Row
                  label="OT ngày thường"
                  value={record.ot_pay_normal ?? 0}
                  indent
                  color="text-orange-500"
                />
              )}
              {(record.ot_pay_weekend ?? 0) > 0 && (
                <Row
                  label="OT cuối tuần"
                  value={record.ot_pay_weekend ?? 0}
                  indent
                  color="text-orange-500"
                />
              )}
              {(record.ot_pay_holiday ?? 0) > 0 && (
                <Row
                  label="OT ngày lễ"
                  value={record.ot_pay_holiday ?? 0}
                  indent
                  color="text-orange-500"
                />
              )}
              <Divider />
              <Row
                label="Thưởng"
                value={record.total_bonus}
                color="text-green-600"
              />
              <div className="border-t border-slate-200" />
              <Row
                label="Tổng thu nhập"
                value={totalIncome}
                bold
                color="text-green-700"
              />
            </div>
          </Card>

          {/* Section 2 - CÁC KHOẢN TRỪ */}
          <Card padding="none" className="overflow-hidden">
            <SectionTitle>Các khoản trừ</SectionTitle>
            <div className="divide-y divide-slate-100 py-1">
              <Row
                label="BHXH (8%)"
                value={record.bhxh ?? insuranceSalary * 0.08}
                color="text-red-500"
              />
              <Row
                label="BHYT (1.5%)"
                value={record.bhyt ?? insuranceSalary * 0.015}
                color="text-red-500"
              />
              <Row
                label="BHTN (1%)"
                value={record.bhtn ?? insuranceSalary * 0.01}
                color="text-red-500"
              />
              <Row
                label="Tổng BHXH nhân viên"
                value={totalInsuranceEmployee}
                bold
                color="text-red-600"
              />
              <Divider />
              <Row
                label="Đoàn phí nhân viên"
                value={record.union_fee_employee ?? 0}
                color="text-red-500"
              />
              <Row
                label="Thuế TNCN"
                value={record.pit_amount ?? 0}
                color="text-red-500"
              />
              <Row
                label="Tạm ứng"
                value={record.salary_advance}
                color="text-red-500"
              />
              <div className="border-t border-slate-200" />
              <Row
                label="Tổng khấu trừ"
                value={record.total_deductions}
                bold
                color="text-red-600"
              />
            </div>
          </Card>

          {/* Section 3 - NGÀY CÔNG */}
          <Card padding="none" className="overflow-hidden">
            <SectionTitle>Ngày công</SectionTitle>
            <div className="divide-y divide-slate-100 py-1">
              <Row
                label="Công chuẩn"
                value={`${record.standard_work_days ?? "—"} ngày`}
              />
              <Row
                label="Công thực tế"
                value={`${record.actual_work_days ?? "—"} ngày`}
                bold
              />
            </div>
          </Card>

          {/* Section 4 - CHI TIẾT THUẾ TNCN */}
          <Card padding="none" className="overflow-hidden">
            <SectionTitle>Chi tiết thuế TNCN</SectionTitle>
            <div className="divide-y divide-slate-100 py-1">
              <Row
                label="Tổng TN tính thuế trước giảm trừ"
                value={taxableIncomeBeforeDeduction}
              />
              <Row
                label="Giảm trừ bản thân"
                value={personalDeduction}
                color="text-blue-600"
              />
              <Row
                label="Giảm trừ người phụ thuộc"
                value={dependentDeduction}
                color="text-blue-600"
              />
              <Divider />
              <Row label="Thu nhập chịu thuế" value={taxableIncome} bold />
              <Row
                label="Thuế TNCN phải nộp"
                value={record.pit_amount ?? 0}
                bold
                color="text-red-600"
              />
            </div>
          </Card>
        </div>

        {/* ===== FOOTER - NET SALARY ===== */}
        <Card className="print:shadow-none">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">
                Tổng lương thực lãnh
              </p>
              <p className="mt-1 text-3xl font-extrabold text-green-600">
                {formatCurrency(record.net_salary)}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="print:hidden"
              icon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              }
            >
              In phiếu lương
            </Button>
          </div>
        </Card>

        {/* Back link */}
        <div className="print:hidden text-center">
          <Link
            href="/payroll"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Quay lại bảng lương
          </Link>
        </div>
      </div>
    </>
  );
}
