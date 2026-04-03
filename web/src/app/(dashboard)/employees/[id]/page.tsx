"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  useEmployee,
  useAttendanceRecords,
  useLeaveRequests,
  useSalaryRecords,
  useDepartments,
  useEmployees,
  updateEmployee,
  useEmployeeAllowances,
  useAllowanceTypes,
  setEmployeeAllowance,
  deleteEmployeeAllowance,
} from "@/hooks/useApi";
import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  SalaryRecord,
  EmployeeAllowance,
  AllowanceType,
} from "@/types";

const contractTypeOptions = [
  { value: "", label: "Chọn loại hợp đồng" },
  { value: "official", label: "HĐLĐ" },
  { value: "probation", label: "Thử việc" },
];

const contractRenewalOptions = [
  { value: "1", label: "Lần 1" },
  { value: "2", label: "Lần 2" },
  { value: "3", label: "Lần 3" },
];

const genderOptions = [
  { value: "", label: "Chọn giới tính" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const educationOptions = [
  { value: "", label: "Chọn trình độ" },
  { value: "high_school", label: "THPT" },
  { value: "college", label: "Cao đẳng" },
  { value: "university", label: "Đại học" },
  { value: "master", label: "Thạc sĩ" },
];

const maritalStatusOptions = [
  { value: "", label: "Chọn tình trạng" },
  { value: "single", label: "Độc thân" },
  { value: "married", label: "Đã kết hôn" },
  { value: "other", label: "Khác" },
];

const paymentMethodOptions = [
  { value: "bank_transfer", label: "Chuyển khoản" },
  { value: "cash", label: "Tiền mặt" },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

function formatTime(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

function labelGender(v?: string) {
  const map: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };
  return v ? (map[v] ?? v) : "—";
}

function labelEducation(v?: string) {
  const map: Record<string, string> = {
    high_school: "THPT",
    college: "Cao đẳng",
    university: "Đại học",
    master: "Thạc sĩ",
  };
  return v ? (map[v] ?? v) : "—";
}

function labelMarital(v?: string) {
  const map: Record<string, string> = {
    single: "Độc thân",
    married: "Đã kết hôn",
    other: "Khác",
  };
  return v ? (map[v] ?? v) : "—";
}

function labelContractType(v?: string) {
  const map: Record<string, string> = {
    official: "HĐLĐ",
    probation: "Thử việc",
  };
  return v ? (map[v] ?? v) : "—";
}

function ProfileTab({ emp }: { emp: Employee }) {
  const dependents = emp.dependents ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Thông tin cá nhân */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Thông tin cá nhân
        </h3>
        <div className="space-y-3">
          {[
            { label: "Họ và tên", value: emp.full_name },
            { label: "Email công ty", value: emp.user?.email ?? "—" },
            { label: "Email cá nhân", value: emp.personal_email ?? "—" },
            { label: "Điện thoại", value: emp.phone ?? "—" },
            { label: "Ngày sinh", value: emp.dob ?? "—" },
            { label: "Giới tính", value: labelGender(emp.gender) },
            { label: "Quốc tịch", value: emp.nationality ?? "—" },
            { label: "Số CCCD", value: emp.id_number ?? "—" },
            { label: "Ngày cấp CCCD", value: emp.id_issue_date ?? "—" },
            { label: "Trình độ học vấn", value: labelEducation(emp.education) },
            {
              label: "Tình trạng hôn nhân",
              value: labelMarital(emp.marital_status),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium text-slate-700 text-right max-w-xs">
                {value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Thông tin công việc */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Thông tin công việc
        </h3>
        <div className="space-y-3">
          {[
            { label: "Mã nhân viên", value: `#${emp.id}` },
            { label: "Phòng ban", value: emp.department?.name ?? "—" },
            { label: "Vị trí", value: emp.user?.role ?? "—" },
            {
              label: "Quản lý trực tiếp",
              value: emp.manager?.full_name ?? "—",
            },
            { label: "Ngày vào làm", value: emp.join_date },
            { label: "Loại HĐ", value: labelContractType(emp.contract_type) },
            { label: "Ngày ký HĐ", value: emp.contract_sign_date ?? "—" },
            { label: "Ngày hết hạn HĐ", value: emp.contract_end_date ?? "—" },
            {
              label: "Lần ký HĐ",
              value:
                emp.contract_renewal != null
                  ? `Lần ${emp.contract_renewal}`
                  : "—",
            },
            {
              label: "Trạng thái",
              value: statusBadge(emp.user?.is_active ? "active" : "inactive"),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-400">{label}</span>
              <span className="font-medium text-slate-700">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Địa chỉ */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Địa chỉ
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Địa chỉ thường trú",
              value: emp.permanent_address ?? "—",
            },
            { label: "Địa chỉ hiện tại", value: emp.current_address ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm gap-4">
              <span className="text-slate-400 shrink-0">{label}</span>
              <span className="font-medium text-slate-700 text-right">
                {value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Liên hệ khẩn cấp */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Liên hệ khẩn cấp
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Tên người liên hệ",
              value: emp.emergency_contact_name ?? "—",
            },
            {
              label: "Mối quan hệ",
              value: emp.emergency_contact_relation ?? "—",
            },
            {
              label: "Số điện thoại",
              value: emp.emergency_contact_phone ?? "—",
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium text-slate-700 text-right max-w-xs">
                {value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Người phụ thuộc */}
      <Card className="lg:col-span-2">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Người phụ thuộc ({dependents.length})
        </h3>
        {dependents.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có người phụ thuộc.</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                {["Họ tên", "Ngày sinh", "Giới tính", "Mối quan hệ"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dependents.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2 text-sm font-medium text-slate-700">
                    {d.full_name}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {d.dob ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {labelGender(d.gender)}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600 capitalize">
                    {d.relationship}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function AllowancesSection({
  employeeId,
  allowances,
  allowanceTypes,
  mutateAllowances,
}: {
  employeeId: number;
  allowances: EmployeeAllowance[];
  allowanceTypes: AllowanceType[];
  mutateAllowances: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<EmployeeAllowance | null>(null);

  const assignedIds = new Set(allowances.map((a) => a.allowance_id));
  const availableTypes = allowanceTypes.filter((t) => !assignedIds.has(t.id));

  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);

  const handleAdd = async () => {
    if (!selectedType || !amount) return;
    setSaving(true);
    try {
      await setEmployeeAllowance(employeeId, {
        allowance_id: Number(selectedType),
        amount: Number(amount),
      });
      mutateAllowances();
      setAddOpen(false);
      setSelectedType("");
      setAmount("");
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem || !amount) return;
    setSaving(true);
    try {
      await setEmployeeAllowance(employeeId, {
        allowance_id: editItem.allowance_id,
        amount: Number(amount),
      });
      mutateAllowances();
      setEditItem(null);
      setAmount("");
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    setSaving(true);
    try {
      await deleteEmployeeAllowance(employeeId, deleteId);
      mutateAllowances();
      setDeleteId(null);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card padding="none">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div>
            <h3 className="font-semibold text-slate-800">Phụ cấp hiện tại</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tổng:{" "}
              <span className="font-semibold text-[#22C55E]">
                {formatCurrency(totalAllowances)}
              </span>
              /tháng
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSelectedType("");
              setAmount("");
              setAddOpen(true);
            }}
            disabled={availableTypes.length === 0}
          >
            + Thêm phụ cấp
          </Button>
        </div>
        {allowances.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400">
              Chưa có phụ cấp nào được gán cho nhân viên này.
            </p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                {["Loại phụ cấp", "Mô tả", "Số tiền/tháng", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allowances.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">
                    {a.allowance?.name ?? `#${a.allowance_id}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {a.allowance?.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#22C55E]">
                    {formatCurrency(a.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          setEditItem(a);
                          setAmount(String(a.amount));
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setDeleteId(a.allowance_id)}
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Add allowance modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Thêm phụ cấp"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={saving}
            >
              Huỷ
            </Button>
            <Button
              onClick={handleAdd}
              loading={saving}
              disabled={!selectedType || !amount}
            >
              Thêm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Loại phụ cấp"
            options={[
              { value: "", label: "Chọn loại phụ cấp..." },
              ...availableTypes.map((t) => ({
                value: String(t.id),
                label: t.name,
              })),
            ]}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />
          <Input
            label="Số tiền (VND/tháng)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </Modal>

      {/* Edit allowance modal */}
      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title={`Sửa phụ cấp: ${editItem?.allowance?.name ?? ""}`}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setEditItem(null)}
              disabled={saving}
            >
              Huỷ
            </Button>
            <Button onClick={handleEdit} loading={saving} disabled={!amount}>
              Lưu
            </Button>
          </>
        }
      >
        <Input
          label="Số tiền (VND/tháng)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteId != null}
        onClose={() => setDeleteId(null)}
        title="Xoá phụ cấp"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={saving}
            >
              Huỷ
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>
              Xác nhận xoá
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xoá phụ cấp này khỏi nhân viên? Thay đổi sẽ áp dụng
          từ kỳ lương tiếp theo.
        </p>
      </Modal>
    </>
  );
}

function SalaryTab({
  emp,
  salaryRecords,
  allowances,
  allowanceTypes,
  mutateAllowances,
}: {
  emp: Employee;
  salaryRecords: SalaryRecord[];
  allowances: EmployeeAllowance[];
  allowanceTypes: AllowanceType[];
  mutateAllowances: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Lương cơ bản",
            value: formatCurrency(emp.basic_salary),
            color: "text-slate-900",
          },
          {
            label: "Lương bảo hiểm",
            value: formatCurrency(emp.insurance_salary),
            color: "text-blue-600",
          },
          {
            label: "Khấu trừ BH (~8%)",
            value: formatCurrency(emp.insurance_salary * 0.08),
            color: "text-red-600",
          },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      <AllowancesSection
        employeeId={emp.id}
        allowances={allowances}
        allowanceTypes={allowanceTypes}
        mutateAllowances={mutateAllowances}
      />

      <Card padding="none">
        <div className="border-b border-slate-100 p-4">
          <h3 className="font-semibold text-slate-800">Lịch sử lương</h3>
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Kỳ lương",
                "Lương CB",
                "Phụ cấp",
                "OT",
                "Khấu trừ",
                "Thực nhận",
                "Trạng thái",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salaryRecords.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  T{p.month}/{p.year}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {formatCurrency(p.basic_salary)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {formatCurrency(p.total_allowances)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {formatCurrency(p.total_ot_pay)}
                </td>
                <td className="px-4 py-3 text-sm text-red-600">
                  -{formatCurrency(p.total_deductions)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                  {formatCurrency(p.net_salary)}
                </td>
                <td className="px-4 py-3">{statusBadge(p.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AttendanceTab({ records }: { records: AttendanceRecord[] }) {
  return (
    <Card padding="none">
      <div className="border-b border-slate-100 p-4">
        <h3 className="font-semibold text-slate-800">Chấm công gần đây</h3>
      </div>
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            {["Ngày", "Check-in", "Check-out", "Trạng thái", "GPS"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((a) => {
            const hasGps = !!(a.gps_lat && a.gps_lng);
            return (
              <tr key={a.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(a.check_in_time)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {formatTime(a.check_in_time)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {formatTime(a.check_out_time)}
                </td>
                <td className="px-4 py-3">{statusBadge(a.status)}</td>
                <td className="px-4 py-3">
                  <Badge variant={hasGps ? "green" : "gray"} dot>
                    {hasGps ? "Verified" : "Unverified"}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function LeaveTab({ leaveRecords }: { leaveRecords: LeaveRequest[] }) {
  const leaveUsed = leaveRecords
    .filter((l) => l.overall_status === "approved")
    .reduce((s, l) => s + l.days, 0);
  const leaveTotal = 12;
  const leaveRemaining = leaveTotal - leaveUsed;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Tổng phép năm",
            value: leaveTotal,
            color: "text-slate-900",
          },
          { label: "Đã sử dụng", value: leaveUsed, color: "text-orange-600" },
          { label: "Còn lại", value: leaveRemaining, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>
              {value}{" "}
              <span className="text-sm font-normal text-slate-400">ngày</span>
            </p>
          </Card>
        ))}
      </div>
      <Card padding="none">
        <div className="border-b border-slate-100 p-4">
          <h3 className="font-semibold text-slate-800">Lịch sử nghỉ phép</h3>
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Loại",
                "Từ ngày",
                "Đến ngày",
                "Số ngày",
                "Lý do",
                "Trạng thái",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaveRecords.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm text-slate-700 capitalize">
                  {l.type}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {l.start_date}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {l.end_date}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  {l.days}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">
                  {l.reason}
                </td>
                <td className="px-4 py-3">{statusBadge(l.overall_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const numericId = Number(id);

  const {
    data: empRes,
    isLoading: empLoading,
    mutate: mutateEmp,
  } = useEmployee(id);
  const { data: attendanceRes } = useAttendanceRecords({
    employee_id: numericId,
    page: 1,
    size: 20,
  });
  const { data: leaveRes } = useLeaveRequests({
    employee_id: numericId,
    page: 1,
    size: 20,
  });
  const { data: salaryRes } = useSalaryRecords();
  const { data: deptRes } = useDepartments();
  const { data: employeesRes } = useEmployees();
  const { data: allowancesRes, mutate: mutateAllowances } =
    useEmployeeAllowances(numericId);
  const { data: allowanceTypesRes } = useAllowanceTypes();

  const [editOpen, setEditOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [gender, setGender] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idIssueDate, setIdIssueDate] = useState("");
  const [education, setEducation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [contractType, setContractType] = useState("");
  const [contractSignDate, setContractSignDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [contractRenewal, setContractRenewal] = useState("1");
  const [basicSalary, setBasicSalary] = useState("");
  const [insuranceSalary, setInsuranceSalary] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankHolderName, setBankHolderName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  const emp = empRes?.data as Employee | undefined;
  const attendanceRecords: AttendanceRecord[] = attendanceRes?.data ?? [];
  const leaveRecords: LeaveRequest[] = leaveRes?.data ?? [];
  const allSalaryRecords = salaryRes?.data ?? [];
  const salaryRecords: SalaryRecord[] = allSalaryRecords.filter(
    (s) => s.employee_id === numericId,
  );

  const departments = deptRes?.data ?? [];
  const allEmployees = employeesRes?.data ?? [];
  const employeeAllowances: EmployeeAllowance[] = allowancesRes?.data ?? [];
  const allowanceTypes: AllowanceType[] = allowanceTypesRes?.data ?? [];

  const departmentOptions = [
    { value: "", label: "Không gán phòng ban" },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ];

  const managerOptions = [
    { value: "", label: "Không gán quản lý" },
    ...allEmployees
      .filter((e) => e.id !== numericId)
      .map((e) => ({ value: String(e.id), label: e.full_name })),
  ];

  useEffect(() => {
    if (!editOpen || !emp) return;
    setFullName(emp.full_name);
    setPhone(emp.phone ?? "");
    setPersonalEmail(emp.personal_email ?? "");
    setGender(emp.gender ?? "");
    setPermanentAddress(emp.permanent_address ?? "");
    setCurrentAddress(emp.current_address ?? "");
    setDob(emp.dob ?? "");
    setNationality(emp.nationality ?? "");
    setIdNumber(emp.id_number ?? "");
    setIdIssueDate(emp.id_issue_date ?? "");
    setEducation(emp.education ?? "");
    setMaritalStatus(emp.marital_status ?? "");
    setEmergencyName(emp.emergency_contact_name ?? "");
    setEmergencyRelation(emp.emergency_contact_relation ?? "");
    setEmergencyPhone(emp.emergency_contact_phone ?? "");
    setDepartmentId(emp.department_id != null ? String(emp.department_id) : "");
    setManagerId(emp.manager_id != null ? String(emp.manager_id) : "");
    setJoinDate(emp.join_date ?? "");
    setContractType(emp.contract_type ?? "");
    setContractSignDate(emp.contract_sign_date ?? "");
    setContractEndDate(emp.contract_end_date ?? "");
    setContractRenewal(String(emp.contract_renewal ?? 1));
    setBasicSalary(String(emp.basic_salary ?? ""));
    setInsuranceSalary(String(emp.insurance_salary ?? ""));
    setBankAccount(emp.bank_account ?? "");
    setBankName(emp.bank_name ?? "");
    setBankHolderName(emp.bank_holder_name ?? "");
    setPaymentMethod(emp.payment_method ?? "bank_transfer");
    setFormError("");
  }, [editOpen, emp]);

  const handleSaveEdit = async () => {
    if (!emp) return;
    if (!fullName.trim()) {
      setFormError("Họ tên không được để trống.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const basic = Number(basicSalary) || 0;
      const ins = Number(insuranceSalary) || 0;
      await updateEmployee(emp.id, {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        personal_email: personalEmail.trim() || undefined,
        gender: (gender as Employee["gender"]) || undefined,
        permanent_address: permanentAddress.trim() || undefined,
        current_address: currentAddress.trim() || undefined,
        dob: dob || undefined,
        nationality: nationality.trim() || undefined,
        id_number: idNumber.trim() || undefined,
        id_issue_date: idIssueDate || undefined,
        education: (education as Employee["education"]) || undefined,
        marital_status:
          (maritalStatus as Employee["marital_status"]) || undefined,
        emergency_contact_name: emergencyName.trim() || undefined,
        emergency_contact_relation: emergencyRelation.trim() || undefined,
        emergency_contact_phone: emergencyPhone.trim() || undefined,
        ...(departmentId === ""
          ? { clear_department: true }
          : { department_id: Number(departmentId) }),
        ...(managerId === ""
          ? { clear_manager: true }
          : { manager_id: Number(managerId) }),
        join_date: joinDate || undefined,
        contract_type: (contractType as Employee["contract_type"]) || undefined,
        contract_sign_date: contractSignDate || undefined,
        contract_end_date: contractEndDate || undefined,
        contract_renewal: Number(contractRenewal) || undefined,
        basic_salary: basic,
        insurance_salary: ins,
        bank_account: bankAccount.trim() || undefined,
        bank_name: bankName.trim() || undefined,
        bank_holder_name: bankHolderName.trim() || undefined,
        payment_method:
          (paymentMethod as "bank_transfer" | "cash") || undefined,
      });
      await mutateEmp();
      setEditOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!emp?.user) return;
    setSaving(true);
    try {
      await updateEmployee(emp.id, { is_active: !emp.user.is_active });
      await mutateEmp();
      setStatusModalOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (empLoading) {
    return (
      <>
        <Header
          title="Đang tải..."
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Nhân viên", href: "/employees" },
            { label: "..." },
          ]}
        />
        <div className="p-6">
          <p className="text-sm text-slate-400">
            Đang tải thông tin nhân viên...
          </p>
        </div>
      </>
    );
  }

  if (!emp) {
    return (
      <>
        <Header
          title="Không tìm thấy nhân viên"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Nhân viên", href: "/employees" },
            { label: "Không tìm thấy" },
          ]}
        />
        <div className="p-6">
          <p className="text-sm text-slate-400">Không có dữ liệu nhân viên.</p>
        </div>
      </>
    );
  }

  const empStatus = emp.user?.is_active ? "active" : "inactive";
  const isActive = emp.user?.is_active ?? false;

  return (
    <>
      <Header
        title={emp.full_name}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Nhân viên", href: "/employees" },
          { label: emp.full_name },
        ]}
      />
      <div className="p-6 space-y-4">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-2xl font-bold text-[#22C55E]">
              {emp.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {emp.full_name}
                </h2>
                {statusBadge(empStatus)}
              </div>
              <p className="text-sm text-slate-500">
                {emp.user?.role ?? "—"}
                {emp.department?.name ? ` · ${emp.department.name}` : ""}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                #{emp.id} · {emp.user?.email ?? "—"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant={isActive ? "danger" : "primary"}
                size="sm"
                onClick={() => {
                  setFormError("");
                  setStatusModalOpen(true);
                }}
              >
                {isActive ? "Vô hiệu hoá" : "Kích hoạt lại"}
              </Button>
            </div>
          </div>
        </Card>

        <Tabs
          tabs={[
            { id: "profile", label: "Hồ sơ" },
            { id: "salary", label: "Lương" },
            { id: "attendance", label: "Chấm công" },
            { id: "leave", label: "Nghỉ phép" },
          ]}
        >
          {(active) => {
            if (active === "profile") return <ProfileTab emp={emp} />;
            if (active === "salary")
              return (
                <SalaryTab
                  emp={emp}
                  salaryRecords={salaryRecords}
                  allowances={employeeAllowances}
                  allowanceTypes={allowanceTypes}
                  mutateAllowances={mutateAllowances}
                />
              );
            if (active === "attendance")
              return <AttendanceTab records={attendanceRecords} />;
            if (active === "leave")
              return <LeaveTab leaveRecords={leaveRecords} />;
            return null;
          }}
        </Tabs>

        {/* Edit modal */}
        <Modal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          title="Chỉnh sửa nhân viên"
          size="lg"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Huỷ
              </Button>
              <Button onClick={handleSaveEdit} loading={saving}>
                Lưu thay đổi
              </Button>
            </>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            {/* Thông tin cá nhân */}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Thông tin cá nhân
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Email cá nhân"
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
              />
              <Select
                label="Giới tính"
                options={genderOptions}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
              <Input
                label="Ngày sinh"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <Input
                label="Quốc tịch"
                placeholder="Việt Nam"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
              <Input
                label="Số CCCD"
                placeholder="012345678901"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
              <Input
                label="Ngày cấp CCCD"
                type="date"
                value={idIssueDate}
                onChange={(e) => setIdIssueDate(e.target.value)}
              />
              <Select
                label="Trình độ học vấn"
                options={educationOptions}
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
              <Select
                label="Tình trạng hôn nhân"
                options={maritalStatusOptions}
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
              />
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Địa chỉ thường trú
                </label>
                <textarea
                  rows={2}
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Địa chỉ hiện tại
                </label>
                <textarea
                  rows={2}
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
              </div>
            </div>

            <hr className="my-2 border-slate-200" />

            {/* Liên hệ khẩn cấp */}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Liên hệ khẩn cấp
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Tên người liên hệ"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
              />
              <Input
                label="Mối quan hệ"
                placeholder="Vợ / Chồng / Bố / Mẹ..."
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
              />
              <Input
                label="Số điện thoại khẩn cấp"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
            </div>

            <hr className="my-2 border-slate-200" />

            {/* Thông tin công việc */}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Thông tin công việc
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Phòng ban"
                options={departmentOptions}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              />
              <Select
                label="Quản lý trực tiếp"
                options={managerOptions}
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
              />
              <Input
                label="Ngày vào làm"
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
              />
              <Select
                label="Loại hợp đồng"
                options={contractTypeOptions}
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
              />
              <Input
                label="Ngày ký hợp đồng"
                type="date"
                value={contractSignDate}
                onChange={(e) => setContractSignDate(e.target.value)}
              />
              <Input
                label="Ngày hết hạn hợp đồng"
                type="date"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
              />
              <Select
                label="Lần ký hợp đồng"
                options={contractRenewalOptions}
                value={contractRenewal}
                onChange={(e) => setContractRenewal(e.target.value)}
              />
              <Input
                label="Lương cơ bản (VND)"
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
              />
              <Input
                label="Lương bảo hiểm (VND)"
                type="number"
                value={insuranceSalary}
                onChange={(e) => setInsuranceSalary(e.target.value)}
              />
            </div>

            <hr className="my-2 border-slate-200" />

            {/* Thông tin ngân hàng */}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Thông tin ngân hàng
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Số tài khoản"
                placeholder="0123456789"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
              <Input
                label="Ngân hàng"
                placeholder="Vietcombank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <Input
                label="Tên chủ tài khoản"
                placeholder="NGUYEN VAN A"
                value={bankHolderName}
                onChange={(e) => setBankHolderName(e.target.value)}
              />
              <Select
                label="Hình thức nhận lương"
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>
          </div>
        </Modal>

        {/* Status toggle modal */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={isActive ? "Vô hiệu hoá tài khoản" : "Kích hoạt lại tài khoản"}
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setStatusModalOpen(false)}
                disabled={saving}
              >
                Huỷ
              </Button>
              <Button
                variant={isActive ? "danger" : "primary"}
                loading={saving}
                onClick={handleToggleActive}
              >
                {isActive ? "Xác nhận vô hiệu hoá" : "Xác nhận kích hoạt"}
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            {isActive
              ? "Nhân viên sẽ không thể đăng nhập cho đến khi được kích hoạt lại. Bạn có chắc chắn?"
              : "Khôi phục quyền đăng nhập cho nhân viên này?"}
          </p>
          {formError && (
            <p className="mt-3 text-sm text-red-600">{formError}</p>
          )}
        </Modal>
      </div>
    </>
  );
}
