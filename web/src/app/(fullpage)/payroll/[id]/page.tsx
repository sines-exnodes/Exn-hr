"use client";

import React, { useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ApiResponse, SalaryRecord } from "@/types";

const fc = (n: number) =>
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
  const formatted = typeof value === "number" ? fc(value) : value;
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${indent ? "pl-6" : ""}`}
    >
      <span
        className={`text-[13px] ${bold ? "font-semibold text-slate-800" : "text-slate-600"}`}
      >
        {label}
      </span>
      <span
        className={`text-[13px] font-medium tabular-nums ${color ?? (bold ? "text-slate-800" : "text-slate-700")}`}
      >
        {formatted}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
      </div>
      <div className="px-4 py-2 space-y-0">{children}</div>
    </div>
  );
}

function Hr() {
  return <div className="border-t border-dashed border-slate-200 my-1" />;
}

export default function PayslipPage() {
  const params = useParams();
  const id = params?.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useSWR<ApiResponse<SalaryRecord>>(
    id ? `/salary-records/${id}` : null,
    (path: string) => api.get<ApiResponse<SalaryRecord>>(path),
  );

  const record = data?.data;

  const handlePrintPdf = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>Phiếu lương T${record?.month}/${record?.year} - ${record?.employee?.full_name ?? ""}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; padding: 20mm; font-size: 13px; }
          @page { size: A4; margin: 15mm; }
          .payslip-header { text-align: center; margin-bottom: 24px; }
          .payslip-header h1 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-bottom: 4px; }
          .payslip-header h2 { font-size: 18px; font-weight: 700; color: #1e293b; }
          .info-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; padding: 12px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
          .info-grid .label { font-size: 10px; color: #94a3b8; }
          .info-grid .value { font-size: 13px; font-weight: 600; color: #1e293b; }
          .sections { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .section { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          .section-title { background: #f8fafc; padding: 8px 16px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
          .section-body { padding: 8px 16px; }
          .row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
          .row.indent { padding-left: 16px; }
          .row .label { font-size: 12px; color: #475569; }
          .row .val { font-size: 12px; font-weight: 500; color: #334155; font-variant-numeric: tabular-nums; }
          .row.bold .label, .row.bold .val { font-weight: 700; font-size: 13px; color: #1e293b; }
          .row .red { color: #ef4444; }
          .row .blue { color: #2563eb; }
          .row .green { color: #16a34a; }
          .row .orange { color: #ea580c; }
          .hr { border-top: 1px dashed #e2e8f0; margin: 4px 0; }
          .solid-hr { border-top: 1px solid #e2e8f0; margin: 4px 0; }
          .footer { text-align: center; padding: 20px; border: 2px solid #16a34a; border-radius: 12px; background: #f0fdf4; }
          .footer .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #166534; font-weight: 600; }
          .footer .amount { font-size: 28px; font-weight: 800; color: #16a34a; margin-top: 4px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 48px; text-align: center; }
          .signatures .role { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 60px; }
          .signatures .name { font-size: 13px; font-weight: 600; color: #1e293b; }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-slate-400">Đang tải phiếu lương...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-sm text-red-500">
          {error?.message || "Không tìm thấy phiếu lương."}
        </p>
        <Link href="/payroll">
          <Button variant="outline" size="sm">
            Quay lại bảng lương
          </Button>
        </Link>
      </div>
    );
  }

  const emp = record.employee;
  const empName = emp?.full_name ?? `NV #${record.employee_id}`;
  const dept = emp?.team?.department?.name ?? emp?.team?.name ?? "—";
  const ctLabel = emp?.contract_type
    ? (contractTypeLabels[emp.contract_type] ?? emp.contract_type)
    : "—";
  const insSalary = record.insurance_salary ?? emp?.insurance_salary ?? 0;
  const prorated = record.prorated_salary ?? record.basic_salary;
  const totalIns = (record.bhxh ?? 0) + (record.bhyt ?? 0) + (record.bhtn ?? 0);
  const totalIncome =
    prorated +
    record.total_allowances +
    record.total_ot_pay +
    record.total_bonus;
  const pitBefore =
    prorated +
    record.total_allowances +
    record.total_ot_pay +
    record.total_bonus -
    totalIns;
  const personalDed = record.personal_deduction ?? 11000000;
  const dependentDed = record.dependent_deduction ?? 0;
  const taxableInc =
    record.taxable_income ??
    Math.max(0, pitBefore - personalDed - dependentDed);

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      {/* Action bar */}
      <div className="max-w-4xl mx-auto px-6 mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/payroll"
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại bảng lương
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            In
          </Button>
          <Button size="sm" onClick={handlePrintPdf}>
            Tải PDF
          </Button>
        </div>
      </div>

      {/* Printable content */}
      <div
        ref={printRef}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-0 print:rounded-none print:p-0"
      >
        {/* Header */}
        <div className="payslip-header text-center mb-6">
          <h1 className="text-[11px] uppercase tracking-[2px] text-slate-500 font-semibold">
            Công ty EXN
          </h1>
          <h2 className="text-xl font-bold text-slate-800">
            Phiếu lương tháng {record.month} năm {record.year}
          </h2>
        </div>

        {/* Employee info */}
        <div className="info-grid grid grid-cols-5 gap-3 py-3 border-y border-slate-200 mb-6">
          <div>
            <p className="label text-[10px] text-slate-400">Tên nhân viên</p>
            <p className="value text-[13px] font-semibold text-slate-800">
              {empName}
            </p>
          </div>
          <div>
            <p className="label text-[10px] text-slate-400">Phòng ban</p>
            <p className="value text-[13px] font-semibold text-slate-800">
              {dept}
            </p>
          </div>
          <div>
            <p className="label text-[10px] text-slate-400">Loại HĐ</p>
            <p className="value text-[13px] font-semibold text-slate-800">
              {ctLabel}
            </p>
          </div>
          <div>
            <p className="label text-[10px] text-slate-400">Mã NV</p>
            <p className="value text-[13px] font-semibold text-slate-800">
              EXN-{String(record.employee_id).padStart(3, "0")}
            </p>
          </div>
          <div>
            <p className="label text-[10px] text-slate-400">Ngày thanh toán</p>
            <p className="value text-[13px] font-semibold text-slate-800">
              {record.payment_date
                ? new Date(record.payment_date).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
          </div>
        </div>

        {/* 2x2 Sections */}
        <div className="sections grid grid-cols-2 gap-4 mb-6">
          {/* 1. Lương + Thưởng + PC */}
          <SectionCard title="1. Lương + Thưởng + Phụ cấp">
            <Row label="Tổng lương HĐ" value={record.basic_salary} />
            <Row label="Lương đóng BHXH" value={insSalary} />
            <Row label="Lương theo ngày công" value={prorated} />
            <Hr />
            <Row
              label="Tổng phụ cấp"
              value={record.total_allowances}
              color="text-blue-600"
            />
            <Hr />
            <Row
              label="Tổng OT"
              value={record.total_ot_pay}
              color="text-orange-600"
            />
            {(record.ot_pay_normal ?? 0) > 0 && (
              <Row
                label="OT ngày thường (x1.5)"
                value={record.ot_pay_normal ?? 0}
                indent
                color="text-orange-500"
              />
            )}
            {(record.ot_pay_weekend ?? 0) > 0 && (
              <Row
                label="OT cuối tuần (x2.0)"
                value={record.ot_pay_weekend ?? 0}
                indent
                color="text-orange-500"
              />
            )}
            {(record.ot_pay_holiday ?? 0) > 0 && (
              <Row
                label="OT ngày lễ (x3.0)"
                value={record.ot_pay_holiday ?? 0}
                indent
                color="text-orange-500"
              />
            )}
            <Hr />
            <Row
              label="Thưởng"
              value={record.total_bonus}
              color="text-green-600"
            />
            <div className="border-t border-slate-200 my-1" />
            <Row
              label="Tổng thu nhập"
              value={totalIncome}
              bold
              color="text-green-700"
            />
          </SectionCard>

          {/* 2. Các khoản trừ */}
          <SectionCard title="2. Các khoản trừ">
            <Row
              label="BHXH (8%)"
              value={record.bhxh ?? insSalary * 0.08}
              color="text-red-500"
            />
            <Row
              label="BHYT (1.5%)"
              value={record.bhyt ?? insSalary * 0.015}
              color="text-red-500"
            />
            <Row
              label="BHTN (1%)"
              value={record.bhtn ?? insSalary * 0.01}
              color="text-red-500"
            />
            <Row
              label="Tổng BHXH nhân viên"
              value={totalIns}
              bold
              color="text-red-600"
            />
            <Hr />
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
            <div className="border-t border-slate-200 my-1" />
            <Row
              label="Tổng khấu trừ"
              value={record.total_deductions}
              bold
              color="text-red-600"
            />
          </SectionCard>

          {/* 3. Ngày công */}
          <SectionCard title="3. Ngày công">
            <Row
              label="Công chuẩn"
              value={`${record.standard_work_days ?? "—"} ngày`}
            />
            <Row
              label="Công thực tế"
              value={`${record.actual_work_days ?? "—"} ngày`}
              bold
            />
          </SectionCard>

          {/* 4. Chi tiết thuế TNCN */}
          <SectionCard title="4. Chi tiết thuế TNCN">
            <Row label="Tổng TN trước giảm trừ" value={pitBefore} />
            <Row
              label="Giảm trừ bản thân"
              value={personalDed}
              color="text-blue-600"
            />
            <Row
              label="Giảm trừ người phụ thuộc"
              value={dependentDed}
              color="text-blue-600"
            />
            <Hr />
            <Row label="Thu nhập chịu thuế" value={taxableInc} bold />
            <Row
              label="Thuế TNCN phải nộp"
              value={record.pit_amount ?? 0}
              bold
              color="text-red-600"
            />
          </SectionCard>
        </div>

        {/* Net salary footer */}
        <div className="footer text-center py-5 border-2 border-green-500 rounded-xl bg-green-50">
          <p className="text-xs uppercase tracking-widest text-green-800 font-semibold">
            Tổng lương thực lãnh
          </p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">
            {fc(record.net_salary)}
          </p>
        </div>

        {/* Signatures */}
        <div className="signatures grid grid-cols-2 gap-10 mt-12 text-center">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-16">
              Giám đốc
            </p>
            <p className="text-sm font-semibold text-slate-800">
              ___________________
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-16">
              Người lao động
            </p>
            <p className="text-sm font-semibold text-slate-800">{empName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
