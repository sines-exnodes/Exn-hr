"use client";

import React, { useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

const monthNames = [
  "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

/* ─── Sub-components ─── */

function LineItem({
  label,
  value,
  bold,
  color,
  indent,
  sub,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
  color?: string;
  indent?: boolean;
  sub?: boolean;
}) {
  const formatted = typeof value === "number" ? fc(value) : value;
  return (
    <div
      className={`flex items-center justify-between ${indent ? "pl-5" : ""} ${bold ? "py-2" : "py-[5px]"}`}
    >
      <span
        className={
          sub
            ? "text-xs text-slate-400"
            : bold
              ? "text-[13px] font-semibold text-slate-800"
              : "text-[13px] text-slate-600"
        }
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${
          sub
            ? "text-xs text-slate-400"
            : bold
              ? `text-[13px] font-bold ${color ?? "text-slate-800"}`
              : `text-[13px] font-medium ${color ?? "text-slate-700"}`
        }`}
      >
        {formatted}
      </span>
    </div>
  );
}

function Divider({ dashed }: { dashed?: boolean }) {
  return (
    <div
      className={`my-0.5 ${dashed ? "border-t border-dashed border-slate-200" : "border-t border-slate-100"}`}
    />
  );
}

function SummaryMiniCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: "green" | "red" | "blue" | "orange";
  icon: React.ReactNode;
}) {
  const bg = {
    green: "bg-emerald-50 border-emerald-200",
    red: "bg-red-50 border-red-200",
    blue: "bg-blue-50 border-blue-200",
    orange: "bg-amber-50 border-amber-200",
  }[accent];
  const text = {
    green: "text-emerald-700",
    red: "text-red-700",
    blue: "text-blue-700",
    orange: "text-amber-700",
  }[accent];
  const iconBg = {
    green: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-amber-100 text-amber-600",
  }[accent];

  return (
    <div className={`rounded-xl border px-4 py-3 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={`text-lg font-bold tabular-nums ${text}`}>{fc(value)}</p>
    </div>
  );
}

/* ─── PDF print styles ─── */

const pdfStyles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif; color: #1e293b; padding: 16mm; font-size: 12px; }
@page { size: A4; margin: 12mm; }

.payslip-container { max-width: 720px; margin: 0 auto; }

/* Header */
.payslip-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
.payslip-header .brand { display: flex; align-items: center; gap: 12px; }
.payslip-header .logo { width: 40px; height: 40px; border-radius: 10px; object-fit: contain; }
.payslip-header .company { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; }
.payslip-header .title { font-size: 18px; font-weight: 700; color: #1e293b; }
.payslip-header .period { text-align: right; }
.payslip-header .period .month { font-size: 22px; font-weight: 800; color: #3b82f6; }
.payslip-header .period .year { font-size: 11px; color: #94a3b8; }
.payslip-header .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.payslip-header .status-confirmed { background: #dcfce7; color: #166534; }
.payslip-header .status-draft { background: #f1f5f9; color: #64748b; }

/* Employee card */
.emp-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
.emp-avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #818cf8, #6366f1); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; flex-shrink: 0; }
.emp-info { flex: 1; display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1.5fr; gap: 8px; }
.emp-info .field .label { font-size: 10px; color: #94a3b8; margin-bottom: 1px; }
.emp-info .field .value { font-size: 12px; font-weight: 600; color: #1e293b; }

/* Summary row */
.summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.mini-card { border-radius: 10px; border: 1px solid; padding: 12px 14px; }
.mini-card .mc-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.mini-card .mc-icon { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; }
.mini-card .mc-label { font-size: 10px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.mini-card .mc-value { font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
.mc-green { border-color: #bbf7d0; background: #f0fdf4; }
.mc-green .mc-icon { background: #dcfce7; color: #16a34a; }
.mc-green .mc-value { color: #15803d; }
.mc-red { border-color: #fecaca; background: #fef2f2; }
.mc-red .mc-icon { background: #fee2e2; color: #dc2626; }
.mc-red .mc-value { color: #dc2626; }
.mc-blue { border-color: #bfdbfe; background: #eff6ff; }
.mc-blue .mc-icon { background: #dbeafe; color: #2563eb; }
.mc-blue .mc-value { color: #1d4ed8; }
.mc-orange { border-color: #fed7aa; background: #fffbeb; }
.mc-orange .mc-icon { background: #fef3c7; color: #d97706; }
.mc-orange .mc-value { color: #b45309; }

/* Sections */
.sections { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.section { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.section-head { padding: 8px 14px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }
.section-head .dot { width: 8px; height: 8px; border-radius: 50%; }
.section-head .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; }
.section-body { padding: 6px 14px; }
.row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.row.indent { padding-left: 14px; }
.row .lbl { font-size: 12px; color: #475569; }
.row .val { font-size: 12px; font-weight: 500; color: #334155; font-variant-numeric: tabular-nums; }
.row.bold .lbl, .row.bold .val { font-weight: 700; font-size: 12px; color: #1e293b; }
.row .sub-lbl { font-size: 11px; color: #94a3b8; }
.row .sub-val { font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
.row .red { color: #ef4444; }
.row .blue { color: #2563eb; }
.row .green { color: #16a34a; }
.row .orange { color: #ea580c; }
.divider { border-top: 1px dashed #e2e8f0; margin: 3px 0; }
.solid-divider { border-top: 1px solid #f1f5f9; margin: 3px 0; }

/* Net salary */
.net-box { text-align: center; padding: 20px; border-radius: 14px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #86efac; }
.net-box .net-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; font-weight: 600; }
.net-box .net-amount { font-size: 30px; font-weight: 800; color: #16a34a; margin-top: 4px; }
.net-box .net-bar { height: 6px; border-radius: 3px; background: #bbf7d0; margin-top: 12px; overflow: hidden; }
.net-box .net-bar-fill { height: 100%; border-radius: 3px; background: #16a34a; }

/* Work days */
.work-days-bar { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.wd-track { flex: 1; height: 6px; border-radius: 3px; background: #e2e8f0; overflow: hidden; }
.wd-fill { height: 100%; border-radius: 3px; background: #3b82f6; }
.wd-pct { font-size: 11px; font-weight: 600; color: #3b82f6; }

/* Signatures */
.signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; }
.signatures .role { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 50px; }
.signatures .name { font-size: 12px; font-weight: 600; color: #1e293b; border-top: 1px solid #cbd5e1; padding-top: 8px; display: inline-block; min-width: 140px; }
`;

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
        <style>${pdfStyles}</style>
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Đang tải phiếu lương...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
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
  const empInitials = empName.split(" ").map((w) => w[0]).join("").slice(-2).toUpperCase();
  const dept = emp?.department?.name ?? "—";
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

  const netPct = totalIncome > 0 ? Math.round((record.net_salary / totalIncome) * 100) : 0;
  const stdDays = record.standard_work_days ?? 0;
  const actDays = record.actual_work_days ?? 0;
  const daysPct = stdDays > 0 ? Math.min(100, Math.round((actDays / stdDays) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      {/* Action bar */}
      <div className="max-w-[820px] mx-auto px-6 mb-5 flex items-center justify-between print:hidden">
        <Link
          href="/payroll"
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại bảng lương
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            In
          </Button>
          <Button size="sm" onClick={handlePrintPdf}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tải PDF
          </Button>
        </div>
      </div>

      {/* Printable content */}
      <div
        ref={printRef}
        className="payslip-container max-w-[820px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 print:shadow-none print:border-0 print:rounded-none print:p-0"
      >
        {/* ─── Header ─── */}
        <div className="payslip-header flex items-center justify-between mb-6 pb-5 border-b-2 border-slate-200">
          <div className="brand flex items-center gap-3">
            <Image
              src="/logo_without_text.webp"
              alt="EXN Logo"
              width={44}
              height={44}
              className="logo w-11 h-11 rounded-xl object-contain"
            />
            <div>
              <p className="company text-[10px] uppercase tracking-[2px] text-slate-400 font-medium">
                Công ty EXN
              </p>
              <h1 className="title text-lg font-bold text-slate-800">Phiếu lương</h1>
            </div>
          </div>
          <div className="period text-right">
            <p className="month text-2xl font-extrabold text-blue-600">
              {monthNames[record.month] || `T${record.month}`}
            </p>
            <div className="flex items-center justify-end gap-2 mt-0.5">
              <span className="year text-xs text-slate-400">Năm {record.year}</span>
              <span
                className={`status-badge inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  record.status === "confirmed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {record.status === "confirmed" ? "Đã xác nhận" : "Bản nháp"}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Employee card ─── */}
        <div className="emp-card bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="emp-avatar w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
            {empInitials}
          </div>
          <div className="emp-info flex-1 grid grid-cols-5 gap-3">
            <div className="field">
              <p className="label text-[10px] text-slate-400 mb-0.5">Tên nhân viên</p>
              <p className="value text-[13px] font-semibold text-slate-800">{empName}</p>
            </div>
            <div className="field">
              <p className="label text-[10px] text-slate-400 mb-0.5">Phòng ban</p>
              <p className="value text-[13px] font-semibold text-slate-800">{dept}</p>
            </div>
            <div className="field">
              <p className="label text-[10px] text-slate-400 mb-0.5">Loại HĐ</p>
              <p className="value text-[13px] font-semibold text-slate-800">{ctLabel}</p>
            </div>
            <div className="field">
              <p className="label text-[10px] text-slate-400 mb-0.5">Mã NV</p>
              <p className="value text-[13px] font-semibold text-slate-800">
                EXN-{String(record.employee_id).padStart(3, "0")}
              </p>
            </div>
            <div className="field">
              <p className="label text-[10px] text-slate-400 mb-0.5">Ngày thanh toán</p>
              <p className="value text-[13px] font-semibold text-slate-800">
                {record.payment_date
                  ? new Date(record.payment_date).toLocaleDateString("vi-VN")
                  : "Chưa xác định"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Summary mini-cards ─── */}
        <div className="summary-row grid grid-cols-4 gap-3 mb-6">
          <SummaryMiniCard
            label="Tổng thu nhập"
            value={totalIncome}
            accent="green"
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <SummaryMiniCard
            label="Tổng khấu trừ"
            value={record.total_deductions}
            accent="red"
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <SummaryMiniCard
            label="Thuế TNCN"
            value={record.pit_amount ?? 0}
            accent="orange"
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>}
          />
          <SummaryMiniCard
            label="Bảo hiểm NV"
            value={totalIns}
            accent="blue"
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
        </div>

        {/* ─── Detail sections ─── */}
        <div className="sections grid grid-cols-2 gap-4 mb-6">
          {/* 1. Lương + Thưởng + PC */}
          <div className="section border border-slate-200 rounded-xl overflow-hidden">
            <div className="section-head bg-emerald-50/60 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
              <div className="dot w-2 h-2 rounded-full bg-emerald-500" />
              <span className="section-label text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Thu nhập
              </span>
            </div>
            <div className="section-body px-4 py-2">
              <LineItem label="Lương hợp đồng" value={record.basic_salary} />
              <LineItem label="Lương đóng BHXH" value={insSalary} sub />
              <LineItem label="Lương theo ngày công" value={prorated} />
              <Divider dashed />
              <LineItem label="Phụ cấp" value={record.total_allowances} color="text-blue-600" />
              <Divider dashed />
              <LineItem label="Tổng OT" value={record.total_ot_pay} color="text-orange-600" />
              {(record.ot_pay_normal ?? 0) > 0 && (
                <LineItem label="Ngày thường (x1.5)" value={record.ot_pay_normal ?? 0} indent sub />
              )}
              {(record.ot_pay_weekend ?? 0) > 0 && (
                <LineItem label="Cuối tuần (x2.0)" value={record.ot_pay_weekend ?? 0} indent sub />
              )}
              {(record.ot_pay_holiday ?? 0) > 0 && (
                <LineItem label="Ngày lễ (x3.0)" value={record.ot_pay_holiday ?? 0} indent sub />
              )}
              <Divider dashed />
              <LineItem label="Thưởng" value={record.total_bonus} color="text-emerald-600" />
              <Divider />
              <LineItem label="Tổng thu nhập" value={totalIncome} bold color="text-emerald-700" />
            </div>
          </div>

          {/* 2. Các khoản trừ */}
          <div className="section border border-slate-200 rounded-xl overflow-hidden">
            <div className="section-head bg-red-50/60 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
              <div className="dot w-2 h-2 rounded-full bg-red-500" />
              <span className="section-label text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Khấu trừ
              </span>
            </div>
            <div className="section-body px-4 py-2">
              <LineItem label="BHXH (8%)" value={record.bhxh ?? insSalary * 0.08} color="text-red-500" />
              <LineItem label="BHYT (1.5%)" value={record.bhyt ?? insSalary * 0.015} color="text-red-500" />
              <LineItem label="BHTN (1%)" value={record.bhtn ?? insSalary * 0.01} color="text-red-500" />
              <LineItem label="Tổng bảo hiểm" value={totalIns} bold color="text-red-600" />
              <Divider dashed />
              <LineItem label="Đoàn phí" value={record.union_fee_employee ?? 0} color="text-red-500" />
              <LineItem label="Thuế TNCN" value={record.pit_amount ?? 0} color="text-red-500" />
              <LineItem label="Tạm ứng" value={record.salary_advance} color="text-red-500" />
              <Divider />
              <LineItem label="Tổng khấu trừ" value={record.total_deductions} bold color="text-red-600" />
            </div>
          </div>

          {/* 3. Ngày công */}
          <div className="section border border-slate-200 rounded-xl overflow-hidden">
            <div className="section-head bg-blue-50/60 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
              <div className="dot w-2 h-2 rounded-full bg-blue-500" />
              <span className="section-label text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Ngày công
              </span>
            </div>
            <div className="section-body px-4 py-3">
              <LineItem label="Công chuẩn" value={`${stdDays} ngày`} />
              <LineItem label="Công thực tế" value={`${actDays} ngày`} bold />
              {/* Visual bar */}
              <div className="work-days-bar flex items-center gap-2 mt-2">
                <div className="wd-track flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="wd-fill h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${daysPct}%` }}
                  />
                </div>
                <span className="wd-pct text-[11px] font-semibold text-blue-600">{daysPct}%</span>
              </div>
            </div>
          </div>

          {/* 4. Chi tiết thuế TNCN */}
          <div className="section border border-slate-200 rounded-xl overflow-hidden">
            <div className="section-head bg-amber-50/60 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
              <div className="dot w-2 h-2 rounded-full bg-amber-500" />
              <span className="section-label text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Chi tiết thuế TNCN
              </span>
            </div>
            <div className="section-body px-4 py-2">
              <LineItem label="TN trước giảm trừ" value={pitBefore} />
              <LineItem label="Giảm trừ bản thân" value={personalDed} color="text-blue-600" />
              <LineItem label="Giảm trừ phụ thuộc" value={dependentDed} color="text-blue-600" />
              <Divider dashed />
              <LineItem label="Thu nhập chịu thuế" value={taxableInc} bold />
              <LineItem label="Thuế TNCN phải nộp" value={record.pit_amount ?? 0} bold color="text-red-600" />
            </div>
          </div>
        </div>

        {/* ─── Net salary ─── */}
        <div className="net-box text-center py-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300">
          <p className="net-label text-[11px] uppercase tracking-[1.5px] text-emerald-800 font-semibold">
            Tổng lương thực lãnh
          </p>
          <p className="net-amount text-[32px] font-extrabold text-emerald-600 mt-1">
            {fc(record.net_salary)}
          </p>
          {/* Proportion bar */}
          <div className="net-bar mx-auto mt-3 w-60 h-1.5 rounded-full bg-emerald-200/60 overflow-hidden">
            <div
              className="net-bar-fill h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${netPct}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-600/70 mt-1">{netPct}% thu nhập</p>
        </div>

        {/* ─── Signatures ─── */}
        <div className="signatures grid grid-cols-2 gap-10 mt-12 text-center">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-14">
              Giám đốc
            </p>
            <div className="inline-block border-t border-slate-300 pt-2 min-w-[140px]">
              <p className="text-sm font-semibold text-slate-800">___________________</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-14">
              Người lao động
            </p>
            <div className="inline-block border-t border-slate-300 pt-2 min-w-[140px]">
              <p className="text-sm font-semibold text-slate-800">{empName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
