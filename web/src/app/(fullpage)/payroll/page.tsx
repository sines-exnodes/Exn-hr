"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import type { SalaryRecord } from "@/types";
import {
  useSalaryRecords,
  useEmployees,
  useAllowanceTypes,
  useEmployeeAllowances,
  runPayroll,
  confirmSalary,
  exportPayrollCsv,
} from "@/hooks/useApi";

// ─── Helpers ────────────────────────────────────────────
const fc = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n));

const contractTypeLabel: Record<
  string,
  {
    label: string;
    variant: "green" | "blue" | "yellow" | "orange" | "purple" | "gray";
  }
> = {
  full_time: { label: "HĐLĐ", variant: "green" },
  expat: { label: "Expat", variant: "purple" },
  probation: { label: "HĐTV", variant: "yellow" },
  intern: { label: "TTS", variant: "orange" },
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

// ─── Tiny cell components ───────────────────────────────
function Th({
  children,
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap border-b-2 border-slate-300 bg-slate-100 sticky top-0 z-10 ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  ...rest
}: {
  children?: React.ReactNode;
  className?: string;
} & React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-3 py-2 text-xs whitespace-nowrap border-b border-slate-100 ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

function TdNum({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <Td className={`text-right tabular-nums ${className}`}>
      {value !== 0 ? fc(value) : "—"}
    </Td>
  );
}

function TdTotal({
  value,
  className = "",
  children,
  ...rest
}: {
  value: number;
  className?: string;
  children?: React.ReactNode;
} & React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-3 py-2 text-xs font-bold whitespace-nowrap text-right tabular-nums border-t-2 border-slate-300 bg-slate-50 ${className}`}
      {...rest}
    >
      {children ?? fc(value)}
    </td>
  );
}

// ─── Tab definitions ────────────────────────────────────
const TABS = [
  { id: "summary", label: "Tổng hợp" },
  { id: "salary", label: "Bảng lương chi tiết" },
  { id: "allowance", label: "Phụ cấp" },
  { id: "insurance", label: "BHXH" },
  { id: "pit", label: "Thuế TNCN" },
  { id: "bonus", label: "Thưởng" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ═══════════════════════════════════════════════════════
// TAB: Tổng hợp (Summary) — like Excel "Sum" sheet
// ═══════════════════════════════════════════════════════
function SummaryTab({ data }: { data: SalaryRecord[] }) {
  // Group by contract type category
  const groups = useMemo(() => {
    const map: Record<string, SalaryRecord[]> = {};
    data.forEach((r) => {
      const ct = r.employee?.contract_type ?? "full_time";
      if (!map[ct]) map[ct] = [];
      map[ct].push(r);
    });
    return map;
  }, [data]);

  const grandTotal = {
    gross: data.reduce((s, r) => s + r.basic_salary, 0),
    insurance_salary: data.reduce((s, r) => s + (r.insurance_salary ?? 0), 0),
    pit: data.reduce((s, r) => s + (r.pit_amount ?? 0), 0),
    net: data.reduce((s, r) => s + r.net_salary, 0),
    employee_insurance: data.reduce(
      (s, r) => s + ((r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0)),
      0,
    ),
    employer_insurance: data.reduce(
      (s, r) => s + (r.employer_insurance_cost ?? 0),
      0,
    ),
    total_insurance: data.reduce(
      (s, r) =>
        s +
        ((r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0)) +
        (r.employer_insurance_cost ?? 0),
      0,
    ),
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <Th>No</Th>
            <Th>Họ và Tên</Th>
            <Th className="text-right">Lương thoả thuận</Th>
            <Th className="text-right">Lương BH</Th>
            <Th className="text-right">Thuế TNCN</Th>
            <Th className="text-right">Lương NET</Th>
            <Th className="text-right">NV đóng BHXH</Th>
            <Th className="text-right">CTY đóng BH</Th>
            <Th className="text-right">Tổng BHXH</Th>
            <Th>Phương thức</Th>
            <Th>STK</Th>
            <Th>Ngân hàng</Th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groups).map(([ct, records]) => {
            const ctInfo = contractTypeLabel[ct];
            const groupTotal = {
              gross: records.reduce((s, r) => s + r.basic_salary, 0),
              insurance: records.reduce(
                (s, r) => s + (r.insurance_salary ?? 0),
                0,
              ),
              pit: records.reduce((s, r) => s + (r.pit_amount ?? 0), 0),
              net: records.reduce((s, r) => s + r.net_salary, 0),
              empIns: records.reduce(
                (s, r) => s + ((r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0)),
                0,
              ),
              empIns2: records.reduce(
                (s, r) => s + (r.employer_insurance_cost ?? 0),
                0,
              ),
            };

            return (
              <React.Fragment key={ct}>
                {/* Group header */}
                <tr className="bg-slate-50">
                  <Td className="font-bold text-slate-700">
                    {ctInfo?.label ?? ct}
                  </Td>
                  <Td />
                  <TdNum value={groupTotal.gross} className="font-semibold" />
                  <TdNum
                    value={groupTotal.insurance}
                    className="font-semibold"
                  />
                  <TdNum
                    value={groupTotal.pit}
                    className="font-semibold text-red-600"
                  />
                  <TdNum
                    value={groupTotal.net}
                    className="font-semibold text-green-600"
                  />
                  <TdNum value={groupTotal.empIns} className="font-semibold" />
                  <TdNum value={groupTotal.empIns2} className="font-semibold" />
                  <TdNum
                    value={groupTotal.empIns + groupTotal.empIns2}
                    className="font-semibold"
                  />
                  <Td />
                  <Td />
                  <Td />
                </tr>
                {/* Individual rows */}
                {records.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/30">
                    <Td className="text-slate-400">{idx + 1}</Td>
                    <Td className="font-medium text-slate-800">
                      {r.employee?.full_name ?? `NV #${r.employee_id}`}
                    </Td>
                    <TdNum value={r.basic_salary} />
                    <TdNum value={r.insurance_salary ?? 0} />
                    <TdNum value={r.pit_amount ?? 0} className="text-red-600" />
                    <TdNum
                      value={r.net_salary}
                      className="text-green-700 font-semibold"
                    />
                    <TdNum
                      value={(r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0)}
                    />
                    <TdNum value={r.employer_insurance_cost ?? 0} />
                    <TdNum
                      value={
                        (r.bhxh ?? 0) +
                        (r.bhyt ?? 0) +
                        (r.bhtn ?? 0) +
                        (r.employer_insurance_cost ?? 0)
                      }
                    />
                    <Td className="text-slate-500">
                      {r.employee?.payment_method === "cash" ? "TM" : "CK"}
                    </Td>
                    <Td className="text-slate-500 text-[10px]">
                      {r.employee?.bank_account ?? "—"}
                    </Td>
                    <Td className="text-slate-500 text-[10px]">
                      {r.employee?.bank_name ?? "—"}
                    </Td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TdTotal value={0} className="text-left font-bold text-slate-800">
              GRAND TOTAL
            </TdTotal>
            <td className="px-3 py-2 text-xs font-bold border-t-2 border-slate-300 bg-slate-50">
              {data.length} NV
            </td>
            <TdTotal value={grandTotal.gross} />
            <TdTotal value={grandTotal.insurance_salary} />
            <TdTotal value={grandTotal.pit} className="text-red-600" />
            <TdTotal value={grandTotal.net} className="text-green-700" />
            <TdTotal value={grandTotal.employee_insurance} />
            <TdTotal value={grandTotal.employer_insurance} />
            <TdTotal value={grandTotal.total_insurance} />
            <td
              className="border-t-2 border-slate-300 bg-slate-50"
              colSpan={3}
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB: Bảng lương chi tiết — like Excel "Salary Actual"
// ═══════════════════════════════════════════════════════
function SalaryDetailTab({ data }: { data: SalaryRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <Th>STT</Th>
            <Th>Họ và Tên</Th>
            <Th>Phòng ban</Th>
            <Th className="text-right">Lương HĐ</Th>
            <Th className="text-right">Lương BH</Th>
            <Th className="text-center">Công chuẩn</Th>
            <Th className="text-center">Công TT</Th>
            <Th className="text-right">Lương NC</Th>
            <Th className="text-right">Phụ cấp</Th>
            <Th className="text-right">OT</Th>
            <Th className="text-right">Thưởng</Th>
            <Th className="text-right">Tổng TN</Th>
            <Th className="text-right">BHXH NV</Th>
            <Th className="text-right">Thuế TNCN</Th>
            <Th className="text-right">Đoàn phí</Th>
            <Th className="text-right">Tạm ứng</Th>
            <Th className="text-right">Tổng trừ</Th>
            <Th className="text-right">Thực nhận</Th>
            <Th>TT</Th>
            <Th>Xem</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => {
            const empIns = (r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0);
            const totalIncome =
              (r.prorated_salary ?? r.basic_salary) +
              r.total_allowances +
              r.total_ot_pay +
              r.total_bonus;
            const dept =
              r.employee?.team?.department?.name ??
              r.employee?.team?.name ??
              "—";
            return (
              <tr key={r.id} className="hover:bg-blue-50/30">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td className="font-medium text-slate-800 min-w-[140px]">
                  {r.employee?.full_name ?? `NV #${r.employee_id}`}
                </Td>
                <Td className="text-slate-500">{dept}</Td>
                <TdNum value={r.basic_salary} />
                <TdNum value={r.insurance_salary ?? 0} />
                <Td className="text-center text-slate-600">
                  {r.standard_work_days ?? "—"}
                </Td>
                <Td className="text-center font-medium text-slate-800">
                  {r.actual_work_days ?? "—"}
                </Td>
                <TdNum value={r.prorated_salary ?? r.basic_salary} />
                <TdNum value={r.total_allowances} className="text-blue-600" />
                <TdNum value={r.total_ot_pay} className="text-orange-600" />
                <TdNum value={r.total_bonus} className="text-green-600" />
                <TdNum value={totalIncome} className="font-semibold" />
                <TdNum value={empIns} className="text-red-500" />
                <TdNum value={r.pit_amount ?? 0} className="text-red-500" />
                <TdNum
                  value={r.union_fee_employee ?? 0}
                  className="text-red-500"
                />
                <TdNum value={r.salary_advance} className="text-red-500" />
                <TdNum
                  value={r.total_deductions}
                  className="text-red-600 font-semibold"
                />
                <TdNum
                  value={r.net_salary}
                  className="text-green-700 font-bold"
                />
                <Td>{statusBadge(r.status)}</Td>
                <Td>
                  <Link
                    href={`/payroll/${r.id}`}
                    className="text-[10px] font-medium text-green-600 hover:underline"
                  >
                    Phiếu
                  </Link>
                </Td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TdTotal value={0} className="text-left font-bold">
              Tổng
            </TdTotal>
            <td className="px-3 py-2 text-xs font-bold border-t-2 border-slate-300 bg-slate-50">
              {data.length} NV
            </td>
            <td className="border-t-2 border-slate-300 bg-slate-50" />
            <TdTotal value={data.reduce((s, r) => s + r.basic_salary, 0)} />
            <TdTotal
              value={data.reduce((s, r) => s + (r.insurance_salary ?? 0), 0)}
            />
            <td
              className="border-t-2 border-slate-300 bg-slate-50"
              colSpan={2}
            />
            <TdTotal
              value={data.reduce(
                (s, r) => s + (r.prorated_salary ?? r.basic_salary),
                0,
              )}
            />
            <TdTotal
              value={data.reduce((s, r) => s + r.total_allowances, 0)}
              className="text-blue-600"
            />
            <TdTotal
              value={data.reduce((s, r) => s + r.total_ot_pay, 0)}
              className="text-orange-600"
            />
            <TdTotal
              value={data.reduce((s, r) => s + r.total_bonus, 0)}
              className="text-green-600"
            />
            <TdTotal
              value={data.reduce(
                (s, r) =>
                  s +
                  (r.prorated_salary ?? r.basic_salary) +
                  r.total_allowances +
                  r.total_ot_pay +
                  r.total_bonus,
                0,
              )}
            />
            <TdTotal
              value={data.reduce(
                (s, r) => s + (r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0),
                0,
              )}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.pit_amount ?? 0), 0)}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.union_fee_employee ?? 0), 0)}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + r.salary_advance, 0)}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + r.total_deductions, 0)}
              className="text-red-600"
            />
            <TdTotal
              value={data.reduce((s, r) => s + r.net_salary, 0)}
              className="text-green-700"
            />
            <td
              className="border-t-2 border-slate-300 bg-slate-50"
              colSpan={2}
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB: Phụ cấp — like Excel "Allowance" sheet
// ═══════════════════════════════════════════════════════
function AllowanceTab({ data }: { data: SalaryRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <Th>STT</Th>
            <Th>Họ và Tên</Th>
            <Th>Phòng ban</Th>
            <Th>Loại HĐ</Th>
            <Th className="text-right">Lương HĐ</Th>
            <Th className="text-right">Tổng phụ cấp</Th>
            <Th className="text-right">% so với lương</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => {
            const dept = r.employee?.team?.department?.name ?? "—";
            const ct = r.employee?.contract_type
              ? contractTypeLabel[r.employee.contract_type]
              : null;
            const pct =
              r.basic_salary > 0
                ? ((r.total_allowances / r.basic_salary) * 100).toFixed(1)
                : "0.0";
            return (
              <tr key={r.id} className="hover:bg-blue-50/30">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td className="font-medium text-slate-800">
                  {r.employee?.full_name ?? `NV #${r.employee_id}`}
                </Td>
                <Td className="text-slate-500">{dept}</Td>
                <Td>
                  {ct ? <Badge variant={ct.variant}>{ct.label}</Badge> : "—"}
                </Td>
                <TdNum value={r.basic_salary} />
                <TdNum
                  value={r.total_allowances}
                  className="text-blue-600 font-semibold"
                />
                <Td className="text-right text-slate-500">{pct}%</Td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TdTotal value={0} className="text-left font-bold">
              Tổng
            </TdTotal>
            <td
              className="px-3 py-2 text-xs font-bold border-t-2 border-slate-300 bg-slate-50"
              colSpan={3}
            >
              {data.length} NV
            </td>
            <TdTotal value={data.reduce((s, r) => s + r.basic_salary, 0)} />
            <TdTotal
              value={data.reduce((s, r) => s + r.total_allowances, 0)}
              className="text-blue-600"
            />
            <td className="border-t-2 border-slate-300 bg-slate-50" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB: BHXH — Insurance breakdown
// ═══════════════════════════════════════════════════════
function InsuranceTab({ data }: { data: SalaryRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <Th rowSpan={2}>STT</Th>
            <Th rowSpan={2}>Họ và Tên</Th>
            <Th rowSpan={2} className="text-right">
              Lương BH
            </Th>
            <Th className="text-center border-b border-slate-300" colSpan={4}>
              Phần NLĐ (10.5%)
            </Th>
            <Th className="text-center border-b border-slate-300" colSpan={5}>
              Phần DN (21.5%)
            </Th>
            <Th rowSpan={2} className="text-right">
              Đoàn phí NV
            </Th>
            <Th rowSpan={2} className="text-right">
              Đoàn phí CTY
            </Th>
          </tr>
          <tr>
            <Th className="text-right">BHXH 8%</Th>
            <Th className="text-right">BHYT 1.5%</Th>
            <Th className="text-right">BHTN 1%</Th>
            <Th className="text-right">Tổng NV</Th>
            <Th className="text-right">BHXH 17%</Th>
            <Th className="text-right">TNNN 0.5%</Th>
            <Th className="text-right">BHYT 3%</Th>
            <Th className="text-right">BHTN 1%</Th>
            <Th className="text-right">Tổng CTY</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => {
            const ins = r.insurance_salary ?? 0;
            return (
              <tr key={r.id} className="hover:bg-blue-50/30">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td className="font-medium text-slate-800">
                  {r.employee?.full_name ?? `NV #${r.employee_id}`}
                </Td>
                <TdNum value={ins} />
                <TdNum value={r.bhxh ?? ins * 0.08} className="text-red-500" />
                <TdNum value={r.bhyt ?? ins * 0.015} className="text-red-500" />
                <TdNum value={r.bhtn ?? ins * 0.01} className="text-red-500" />
                <TdNum
                  value={(r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0)}
                  className="text-red-600 font-semibold"
                />
                <TdNum value={r.employer_bhxh ?? ins * 0.17} />
                <TdNum value={r.employer_tnnn ?? ins * 0.005} />
                <TdNum value={r.employer_bhyt ?? ins * 0.03} />
                <TdNum value={r.employer_bhtn ?? ins * 0.01} />
                <TdNum
                  value={r.employer_insurance_cost ?? ins * 0.215}
                  className="font-semibold"
                />
                <TdNum
                  value={r.union_fee_employee ?? 0}
                  className="text-red-500"
                />
                <TdNum value={r.union_fee_employer ?? 0} />
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TdTotal value={0} className="text-left font-bold">
              Tổng
            </TdTotal>
            <td className="px-3 py-2 text-xs font-bold border-t-2 border-slate-300 bg-slate-50">
              {data.length} NV
            </td>
            <TdTotal
              value={data.reduce((s, r) => s + (r.insurance_salary ?? 0), 0)}
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.bhxh ?? 0), 0)}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.bhyt ?? 0), 0)}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.bhtn ?? 0), 0)}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce(
                (s, r) => s + (r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0),
                0,
              )}
              className="text-red-600"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.employer_bhxh ?? 0), 0)}
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.employer_tnnn ?? 0), 0)}
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.employer_bhyt ?? 0), 0)}
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.employer_bhtn ?? 0), 0)}
            />
            <TdTotal
              value={data.reduce(
                (s, r) => s + (r.employer_insurance_cost ?? 0),
                0,
              )}
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.union_fee_employee ?? 0), 0)}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.union_fee_employer ?? 0), 0)}
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB: Thuế TNCN — PIT details
// ═══════════════════════════════════════════════════════
function PITTab({ data }: { data: SalaryRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <Th>STT</Th>
            <Th>Họ và Tên</Th>
            <Th>Loại HĐ</Th>
            <Th className="text-right">Tổng TN tính thuế</Th>
            <Th className="text-right">BHXH NV đóng</Th>
            <Th className="text-right">Giảm trừ bản thân</Th>
            <Th className="text-center">Số NPT</Th>
            <Th className="text-right">Giảm trừ NPT</Th>
            <Th className="text-right">Tổng giảm trừ</Th>
            <Th className="text-right">TN chịu thuế</Th>
            <Th className="text-right">Thuế TNCN</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => {
            const ct = r.employee?.contract_type
              ? contractTypeLabel[r.employee.contract_type]
              : null;
            const empIns = (r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0);
            const totalDeductionPIT =
              (r.personal_deduction ?? 0) + (r.dependent_deduction ?? 0);
            const npt = r.employee?.number_of_dependents ?? 0;
            return (
              <tr key={r.id} className="hover:bg-blue-50/30">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td className="font-medium text-slate-800">
                  {r.employee?.full_name ?? `NV #${r.employee_id}`}
                </Td>
                <Td>
                  {ct ? <Badge variant={ct.variant}>{ct.label}</Badge> : "—"}
                </Td>
                <TdNum
                  value={
                    (r.prorated_salary ?? r.basic_salary) +
                    r.total_allowances +
                    r.total_ot_pay +
                    r.total_bonus
                  }
                />
                <TdNum value={empIns} className="text-red-500" />
                <TdNum
                  value={r.personal_deduction ?? 0}
                  className="text-blue-600"
                />
                <Td className="text-center font-medium">{npt}</Td>
                <TdNum
                  value={r.dependent_deduction ?? 0}
                  className="text-blue-600"
                />
                <TdNum
                  value={totalDeductionPIT + empIns}
                  className="text-blue-600 font-semibold"
                />
                <TdNum
                  value={r.taxable_income ?? 0}
                  className="font-semibold"
                />
                <TdNum
                  value={r.pit_amount ?? 0}
                  className="text-red-600 font-bold"
                />
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TdTotal value={0} className="text-left font-bold">
              Tổng
            </TdTotal>
            <td
              className="px-3 py-2 text-xs font-bold border-t-2 border-slate-300 bg-slate-50"
              colSpan={2}
            >
              {data.length} NV
            </td>
            <TdTotal
              value={data.reduce(
                (s, r) =>
                  s +
                  (r.prorated_salary ?? r.basic_salary) +
                  r.total_allowances +
                  r.total_ot_pay +
                  r.total_bonus,
                0,
              )}
            />
            <TdTotal
              value={data.reduce(
                (s, r) => s + (r.bhxh ?? 0) + (r.bhyt ?? 0) + (r.bhtn ?? 0),
                0,
              )}
              className="text-red-500"
            />
            <td
              className="border-t-2 border-slate-300 bg-slate-50"
              colSpan={4}
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.taxable_income ?? 0), 0)}
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.pit_amount ?? 0), 0)}
              className="text-red-600"
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB: Thưởng — Bonus details
// ═══════════════════════════════════════════════════════
function BonusTab({ data }: { data: SalaryRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <Th>STT</Th>
            <Th>Họ và Tên</Th>
            <Th>Phòng ban</Th>
            <Th className="text-right">Thưởng</Th>
            <Th className="text-right">Tạm ứng</Th>
            <Th className="text-right">OT ngày thường</Th>
            <Th className="text-right">OT cuối tuần</Th>
            <Th className="text-right">OT ngày lễ</Th>
            <Th className="text-right">Tổng OT</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => {
            const dept = r.employee?.team?.department?.name ?? "—";
            return (
              <tr key={r.id} className="hover:bg-blue-50/30">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td className="font-medium text-slate-800">
                  {r.employee?.full_name ?? `NV #${r.employee_id}`}
                </Td>
                <Td className="text-slate-500">{dept}</Td>
                <TdNum
                  value={r.total_bonus}
                  className="text-green-600 font-semibold"
                />
                <TdNum value={r.salary_advance} className="text-red-500" />
                <TdNum
                  value={r.ot_pay_normal ?? 0}
                  className="text-orange-500"
                />
                <TdNum
                  value={r.ot_pay_weekend ?? 0}
                  className="text-orange-500"
                />
                <TdNum
                  value={r.ot_pay_holiday ?? 0}
                  className="text-orange-500"
                />
                <TdNum
                  value={r.total_ot_pay}
                  className="text-orange-600 font-semibold"
                />
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TdTotal value={0} className="text-left font-bold">
              Tổng
            </TdTotal>
            <td
              className="px-3 py-2 text-xs font-bold border-t-2 border-slate-300 bg-slate-50"
              colSpan={2}
            >
              {data.length} NV
            </td>
            <TdTotal
              value={data.reduce((s, r) => s + r.total_bonus, 0)}
              className="text-green-600"
            />
            <TdTotal
              value={data.reduce((s, r) => s + r.salary_advance, 0)}
              className="text-red-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.ot_pay_normal ?? 0), 0)}
              className="text-orange-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.ot_pay_weekend ?? 0), 0)}
              className="text-orange-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + (r.ot_pay_holiday ?? 0), 0)}
              className="text-orange-500"
            />
            <TdTotal
              value={data.reduce((s, r) => s + r.total_ot_pay, 0)}
              className="text-orange-600"
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function PayrollPage() {
  const [month, setMonth] = useState("3");
  const [year, setYear] = useState("2026");
  const [standardWorkDays, setStandardWorkDays] = useState("22");
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const {
    data: response,
    mutate,
    isLoading,
  } = useSalaryRecords({ month: Number(month), year: Number(year) });
  const payrollData = response?.data ?? [];

  const summary = useMemo(
    () => ({
      employees: payrollData.length,
      gross: payrollData.reduce((s, r) => s + r.basic_salary, 0),
      net: payrollData.reduce((s, r) => s + r.net_salary, 0),
      pit: payrollData.reduce((s, r) => s + (r.pit_amount ?? 0), 0),
      insurance: payrollData.reduce(
        (s, r) =>
          s +
          (r.bhxh ?? 0) +
          (r.bhyt ?? 0) +
          (r.bhtn ?? 0) +
          (r.employer_insurance_cost ?? 0),
        0,
      ),
    }),
    [payrollData],
  );

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

  return (
    <div className="flex flex-col h-screen">
      {/* ── Top bar ── */}
      <div className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="h-5 w-5"
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
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Bảng lương tháng {month}/{year}
            </h1>
            <p className="text-xs text-slate-400">
              {summary.employees} nhân viên · Công chuẩn: {standardWorkDays}{" "}
              ngày
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="text-sm bg-transparent border-none focus:outline-none text-slate-700"
            >
              {monthOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="text-slate-300">/</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="text-sm bg-transparent border-none focus:outline-none text-slate-700"
            >
              {yearOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            min={1}
            max={31}
            value={standardWorkDays}
            onChange={(e) => setStandardWorkDays(e.target.value)}
            className="w-16 text-sm text-center border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            title="Ngày công chuẩn"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "..." : "Xuất CSV"}
          </Button>
          <Button size="sm" onClick={handleRunPayroll} disabled={actionLoading}>
            {actionLoading ? "Đang xử lý..." : "Chạy bảng lương"}
          </Button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-slate-100">
        <div className="flex gap-6">
          {[
            {
              label: "Tổng lương GROSS",
              value: fc(summary.gross),
              color: "text-slate-800",
            },
            {
              label: "Tổng lương NET",
              value: fc(summary.net),
              color: "text-green-600",
            },
            {
              label: "Tổng thuế TNCN",
              value: fc(summary.pit),
              color: "text-red-600",
            },
            {
              label: "Tổng BHXH (NV+CTY)",
              value: fc(summary.insurance),
              color: "text-orange-600",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{label}:</span>
              <span className={`text-sm font-bold tabular-nums ${color}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-6">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-[#22C55E] text-[#22C55E]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-auto bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
          </div>
        ) : payrollData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-slate-400">
              Chưa có dữ liệu bảng lương cho kỳ này.
            </p>
            <Button
              size="sm"
              onClick={handleRunPayroll}
              disabled={actionLoading}
            >
              Chạy bảng lương
            </Button>
          </div>
        ) : (
          <>
            {activeTab === "summary" && <SummaryTab data={payrollData} />}
            {activeTab === "salary" && <SalaryDetailTab data={payrollData} />}
            {activeTab === "allowance" && <AllowanceTab data={payrollData} />}
            {activeTab === "insurance" && <InsuranceTab data={payrollData} />}
            {activeTab === "pit" && <PITTab data={payrollData} />}
            {activeTab === "bonus" && <BonusTab data={payrollData} />}
          </>
        )}
      </div>
    </div>
  );
}
