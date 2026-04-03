"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { createEmployee, useDepartments, useEmployees } from "@/hooks/useApi";
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
  { value: "official", label: "Nhân viên chính thức (HĐLĐ)" },
  { value: "probation", label: "Thử việc (HĐTV)" },
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
  { value: "married", label: "Kết hôn" },
  { value: "other", label: "Khác" },
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
  personal_email: "",
  role: "employee",
  join_date: "",
  dob: "",
  permanent_address: "",
  current_address: "",
  nationality: "",
  id_number: "",
  id_issue_date: "",
  education: undefined,
  marital_status: undefined,
  emergency_contact_name: "",
  emergency_contact_relation: "",
  emergency_contact_phone: "",
  insurance_salary: 0,
  basic_salary: 0,
  contract_type: undefined,
  contract_sign_date: "",
  contract_end_date: "",
  contract_renewal: 1,
  bank_account: "",
  bank_name: "",
  bank_holder_name: "",
  payment_method: "bank_transfer",
};

export default function NewEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [deptId, setDeptId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: deptRes } = useDepartments();
  const { data: empRes } = useEmployees({ size: 100 });

  const departments = deptRes?.data ?? [];
  const employees = empRes?.data ?? [];

  const departmentOptions = departments.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));
  const managerOptions = employees.map((e) => ({
    value: String(e.id),
    label: `${e.full_name}${e.user?.role === "leader" ? " (Leader)" : ""}`,
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
    if (!form.join_date) errs.join_date = "Ngày bắt đầu không được để trống";
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
        personal_email: form.personal_email || undefined,
        gender: (form.gender as CreateEmployeeRequest["gender"]) || undefined,
        permanent_address: form.permanent_address || undefined,
        current_address: form.current_address || undefined,
        dob: form.dob || undefined,
        nationality: form.nationality || undefined,
        id_number: form.id_number || undefined,
        id_issue_date: form.id_issue_date || undefined,
        education:
          (form.education as CreateEmployeeRequest["education"]) || undefined,
        marital_status:
          (form.marital_status as CreateEmployeeRequest["marital_status"]) ||
          undefined,
        emergency_contact_name: form.emergency_contact_name || undefined,
        emergency_contact_relation:
          form.emergency_contact_relation || undefined,
        emergency_contact_phone: form.emergency_contact_phone || undefined,
        department_id: deptId ? Number(deptId) : undefined,
        manager_id: managerId ? Number(managerId) : undefined,
        join_date: form.join_date!,
        contract_type:
          (form.contract_type as CreateEmployeeRequest["contract_type"]) ||
          undefined,
        contract_sign_date: form.contract_sign_date || undefined,
        contract_end_date: form.contract_end_date || undefined,
        contract_renewal: Number(form.contract_renewal) || 1,
        basic_salary: Number(form.basic_salary) || 0,
        insurance_salary: Number(form.insurance_salary) || 0,
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

          {/* Section 1: Thông tin cá nhân */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                1
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Thông tin cá nhân
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
                label="Email công ty"
                type="email"
                placeholder="nhanvien@exn.vn"
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
                label="Email cá nhân"
                type="email"
                placeholder="email@gmail.com"
                value={form.personal_email}
                onChange={set("personal_email")}
              />
              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0901234567"
                value={form.phone}
                onChange={set("phone")}
              />
              <Select
                label="Giới tính"
                options={genderOptions}
                value={form.gender ?? ""}
                onChange={
                  set("gender") as React.ChangeEventHandler<HTMLSelectElement>
                }
              />
              <Input
                label="Ngày sinh"
                type="date"
                value={form.dob}
                onChange={set("dob")}
              />
              <Input
                label="Quốc tịch"
                placeholder="Việt Nam"
                value={form.nationality}
                onChange={set("nationality")}
              />
              <Input
                label="Số CCCD"
                placeholder="012345678901"
                value={form.id_number}
                onChange={set("id_number")}
              />
              <Input
                label="Ngày cấp CCCD"
                type="date"
                value={form.id_issue_date}
                onChange={set("id_issue_date")}
              />
              <Select
                label="Trình độ học vấn"
                options={educationOptions}
                value={form.education ?? ""}
                onChange={
                  set(
                    "education",
                  ) as React.ChangeEventHandler<HTMLSelectElement>
                }
              />
              <Select
                label="Tình trạng hôn nhân"
                options={maritalStatusOptions}
                value={form.marital_status ?? ""}
                onChange={
                  set(
                    "marital_status",
                  ) as React.ChangeEventHandler<HTMLSelectElement>
                }
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Địa chỉ thường trú
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Địa chỉ thường trú..."
                    value={form.permanent_address}
                    onChange={set("permanent_address")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Địa chỉ hiện tại
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Địa chỉ hiện tại..."
                    value={form.current_address}
                    onChange={set("current_address")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Liên hệ khẩn cấp */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                2
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Liên hệ khẩn cấp
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Họ tên"
                placeholder="Nguyen Thi B"
                value={form.emergency_contact_name}
                onChange={set("emergency_contact_name")}
              />
              <Input
                label="Mối quan hệ"
                placeholder="Vợ / Chồng / Cha / Mẹ"
                value={form.emergency_contact_relation}
                onChange={set("emergency_contact_relation")}
              />
              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0901234567"
                value={form.emergency_contact_phone}
                onChange={set("emergency_contact_phone")}
              />
            </div>
          </Card>

          {/* Section 3: Thông tin công việc */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                3
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Thông tin công việc
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                label="Phòng ban"
                options={[
                  { value: "", label: "Chọn phòng ban" },
                  ...departmentOptions,
                ]}
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
              />
              <Select
                label="Vị trí"
                options={roleOptions}
                value={form.role}
                onChange={
                  set("role") as React.ChangeEventHandler<HTMLSelectElement>
                }
                required
              />
              <Select
                label="Line Manager"
                options={[
                  { value: "", label: "Chọn Line Manager" },
                  ...managerOptions,
                ]}
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
              />
              <Input
                label="Ngày bắt đầu"
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
                label="Ngày ký hợp đồng"
                type="date"
                value={form.contract_sign_date}
                onChange={set("contract_sign_date")}
              />
              <Input
                label="Ngày hết hạn hợp đồng"
                type="date"
                value={form.contract_end_date}
                onChange={set("contract_end_date")}
              />
              <Select
                label="Lần ký hợp đồng"
                options={contractRenewalOptions}
                value={String(form.contract_renewal ?? 1)}
                onChange={
                  set(
                    "contract_renewal",
                  ) as React.ChangeEventHandler<HTMLSelectElement>
                }
              />
            </div>
          </Card>

          {/* Section 4: Lương & Bảo hiểm */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                4
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Lương & Bảo hiểm
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Lương cơ bản (NET – VND)"
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

          {/* Section 5: Thông tin ngân hàng */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">
                5
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
