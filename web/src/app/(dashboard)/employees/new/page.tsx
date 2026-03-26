"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { createEmployee, useDepartments, useTeams } from "@/hooks/useApi";
import type { CreateEmployeeRequest } from "@/types";

const roleOptions = [
  { value: "employee", label: "Nhân viên" },
  { value: "leader", label: "Trưởng nhóm" },
  { value: "hr", label: "HR" },
  { value: "ceo", label: "CEO" },
  { value: "admin", label: "Admin" },
];

const contractTypeOptions = [
  { value: "", label: "Chọn loại hợp đồng" },
  { value: "full_time", label: "Nhân viên chính thức (HĐLĐ)" },
  { value: "expat", label: "Nhân viên nước ngoài" },
  { value: "probation", label: "Thử việc (HĐTV)" },
  { value: "intern", label: "Thực tập sinh" },
  { value: "collaborator", label: "Cộng tác viên" },
  { value: "service_contract", label: "Hợp đồng dịch vụ" },
];

const paymentMethodOptions = [
  { value: "bank_transfer", label: "Chuyển khoản" },
  { value: "cash", label: "Tiền mặt" },
];

const initialForm: Partial<CreateEmployeeRequest> = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  role: "employee",
  position: "",
  join_date: "",
  dob: "",
  address: "",
  insurance_salary: 0,
  basic_salary: 0,
  contract_type: undefined,
  number_of_dependents: 0,
  bank_account: "",
  bank_name: "",
  bank_holder_name: "",
  payment_method: "bank_transfer",
};

export default function NewEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real API calls for dropdowns
  const { data: deptRes } = useDepartments();
  const { data: teamsRes } = useTeams();

  const departments = deptRes?.data ?? [];
  const teams = teamsRes?.data ?? [];

  const departmentOptions = departments.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));
  const teamOptions = teams.map((t) => ({
    value: String(t.id),
    label: `${t.name}${t.department?.name ? ` (${t.department.name})` : ""}`,
  }));

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name) errs.full_name = "Tên không được để trống";
    if (!form.email) errs.email = "Email không được để trống";
    if (!form.password) errs.password = "Mật khẩu không được để trống";
    if (!form.position) errs.position = "Vị trí không được để trống";
    if (!form.join_date) errs.join_date = "Ngày vào làm không được để trống";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await createEmployee({
        email: form.email!,
        password: form.password!,
        role: (form.role as CreateEmployeeRequest["role"]) ?? "employee",
        full_name: form.full_name!,
        phone: form.phone || undefined,
        address: form.address || undefined,
        dob: form.dob || undefined,
        join_date: form.join_date!,
        position: form.position!,
        team_id: teamId ? Number(teamId) : undefined,
        basic_salary: Number(form.basic_salary) || 0,
        insurance_salary: Number(form.insurance_salary) || 0,
        contract_type:
          (form.contract_type as CreateEmployeeRequest["contract_type"]) ||
          undefined,
        number_of_dependents: Number(form.number_of_dependents) || 0,
        bank_account: form.bank_account || undefined,
        bank_name: form.bank_name || undefined,
        bank_holder_name: form.bank_holder_name || undefined,
        payment_method:
          (form.payment_method as CreateEmployeeRequest["payment_method"]) ||
          undefined,
      });
      router.push("/employees");
    } catch (err) {
      setErrors({
        _form: err instanceof Error ? err.message : "Tạo nhân viên thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Thêm nhân viên mới"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Nhân viên", href: "/employees" },
          { label: "Thêm mới" },
        ]}
      />
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          {errors._form && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors._form}
            </div>
          )}

          {/* Section 1: Thông tin cơ bản */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                1
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Thông tin cơ bản
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2">
                <Input
                  label="Họ và tên"
                  placeholder="Nguyen Van A"
                  value={form.full_name}
                  onChange={set("full_name")}
                  error={errors.full_name}
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                placeholder="nhanvien@company.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
                required
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="********"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                required
              />
              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0901234567"
                value={form.phone}
                onChange={set("phone")}
              />
              <Input
                label="Ngày sinh"
                type="date"
                value={form.dob}
                onChange={set("dob")}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Địa chỉ
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Địa chỉ thường trú..."
                    value={form.address}
                    onChange={set("address")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Thông tin công việc */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                2
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Thông tin công việc
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departmentOptions.length > 0 ? (
                <Select
                  label="Team"
                  options={[{ value: "", label: "Chọn team" }, ...teamOptions]}
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                />
              ) : (
                <Select
                  label="Team"
                  options={[{ value: "", label: "Đang tải..." }]}
                  value=""
                  onChange={() => {}}
                  disabled
                />
              )}
              <Input
                label="Vị trí / Chức danh"
                placeholder="Senior Developer"
                value={form.position}
                onChange={set("position")}
                error={errors.position}
                required
              />
              <Select
                label="Vai trò hệ thống"
                options={roleOptions}
                value={form.role}
                onChange={
                  set("role") as React.ChangeEventHandler<HTMLSelectElement>
                }
                required
              />
              <Input
                label="Ngày vào làm"
                type="date"
                value={form.join_date}
                onChange={set("join_date")}
                error={errors.join_date}
                required
              />
              <Select
                label="Loại hợp đồng"
                options={contractTypeOptions}
                value={form.contract_type ?? ""}
                onChange={
                  set(
                    "contract_type",
                  ) as React.ChangeEventHandler<HTMLSelectElement>
                }
              />
              <Input
                label="Số người phụ thuộc"
                type="number"
                placeholder="0"
                value={form.number_of_dependents ?? 0}
                onChange={set("number_of_dependents")}
              />
            </div>
          </Card>

          {/* Section 3: Lương & Bảo hiểm */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                3
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Lương & Bảo hiểm
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Lương cơ bản (VND)"
                type="number"
                placeholder="15000000"
                value={form.basic_salary || ""}
                onChange={set("basic_salary")}
                hint="Lương thực tế nhận hàng tháng"
              />
              <Input
                label="Lương bảo hiểm (VND)"
                type="number"
                placeholder="5000000"
                value={form.insurance_salary || ""}
                onChange={set("insurance_salary")}
                hint="Mức đóng bảo hiểm xã hội"
              />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              * Phụ cấp có thể thêm sau trong mục Quản lý phụ cấp.
            </p>
          </Card>

          {/* Section 4: Thông tin ngân hàng */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                4
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Thông tin ngân hàng
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Số tài khoản"
                placeholder="0123456789"
                value={form.bank_account}
                onChange={set("bank_account")}
              />
              <Input
                label="Ngân hàng"
                placeholder="Vietcombank"
                value={form.bank_name}
                onChange={set("bank_name")}
              />
              <Input
                label="Tên chủ tài khoản"
                placeholder="NGUYEN VAN A"
                value={form.bank_holder_name}
                onChange={set("bank_holder_name")}
              />
              <Select
                label="Hình thức nhận lương"
                options={paymentMethodOptions}
                value={form.payment_method ?? "bank_transfer"}
                onChange={
                  set(
                    "payment_method",
                  ) as React.ChangeEventHandler<HTMLSelectElement>
                }
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/employees")}
            >
              Huỷ
            </Button>
            <Button type="submit" loading={loading}>
              Tạo nhân viên
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
