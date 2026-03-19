"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import type { CreateEmployeeRequest } from "@/types";

const departmentOptions = [
  { value: "1", label: "Engineering" },
  { value: "2", label: "Sales" },
  { value: "3", label: "HR" },
  { value: "4", label: "Finance" },
  { value: "5", label: "Marketing" },
  { value: "6", label: "Operations" },
];

const roleOptions = [
  { value: "employee", label: "Nhân viên" },
  { value: "leader", label: "Trưởng nhóm" },
  { value: "hr", label: "HR" },
  { value: "ceo", label: "CEO" },
  { value: "admin", label: "Admin" },
];

const initialForm: Partial<CreateEmployeeRequest> = {
  name: "",
  email: "",
  phone: "",
  role: "employee",
  position: "",
  hire_date: "",
  birth_date: "",
  address: "",
  insurance_salary: 0,
  base_salary: 0,
};

export default function NewEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Tên không được để trống";
    if (!form.email) errs.email = "Email không được để trống";
    if (!form.position) errs.position = "Vị trí không được để trống";
    if (!form.hire_date) errs.hire_date = "Ngày vào làm không được để trống";
    if (!departmentId) errs.department_id = "Chọn phòng ban";
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
    // TODO: connect to real API — POST /employees
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push("/employees");
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
          {/* Section 1: Thông tin cơ bản */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">1</div>
              <h2 className="text-base font-semibold text-slate-800">Thông tin cơ bản</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2">
                <Input
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={set("name")}
                  error={errors.name}
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
                label="Số điện thoại"
                type="tel"
                placeholder="0901234567"
                value={form.phone}
                onChange={set("phone")}
              />
              <Input
                label="Ngày sinh"
                type="date"
                value={form.birth_date}
                onChange={set("birth_date")}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">2</div>
              <h2 className="text-base font-semibold text-slate-800">Thông tin công việc</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                label="Phòng ban"
                options={departmentOptions}
                placeholder="Chọn phòng ban"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                error={errors.department_id}
                required
              />
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
                onChange={set("role") as React.ChangeEventHandler<HTMLSelectElement>}
                required
              />
              <Input
                label="Ngày vào làm"
                type="date"
                value={form.hire_date}
                onChange={set("hire_date")}
                error={errors.hire_date}
                required
              />
            </div>
          </Card>

          {/* Section 3: Lương & Bảo hiểm */}
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-white text-sm font-bold">3</div>
              <h2 className="text-base font-semibold text-slate-800">Lương & Bảo hiểm</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Lương cơ bản (VND)"
                type="number"
                placeholder="15000000"
                value={form.base_salary || ""}
                onChange={set("base_salary")}
                hint="Lương thực tế nhận hằng tháng"
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
