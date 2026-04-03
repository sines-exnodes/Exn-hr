"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCurrentUser, useMyProfile } from "@/hooks/useApi";

const roleLabels: Record<string, string> = {
  admin: "Quản trị",
  ceo: "CEO",
  hr: "Nhân sự",
  leader: "Trưởng nhóm",
  employee: "Nhân viên",
};

export default function AccountPage() {
  const {
    data: userRes,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();
  const {
    data: empRes,
    error: empError,
    isLoading: empLoading,
  } = useMyProfile({
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  });

  const user = userRes?.data;
  const emp = empRes?.data;
  const noEmployee = !empLoading && empError != null;

  return (
    <>
      <Header
        title="Tài khoản"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Tài khoản" },
        ]}
      />
      <div className="p-6 mx-auto max-w-3xl space-y-6">
        <Card>
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Đăng nhập
          </h2>
          {userLoading && <p className="text-sm text-slate-500">Đang tải…</p>}
          {userError && (
            <p className="text-sm text-red-600">
              Không tải được thông tin tài khoản. Thử đăng nhập lại.
            </p>
          )}
          {user && (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-800">{user.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Vai trò</dt>
                <dd className="font-medium text-slate-800">
                  {roleLabels[user.role] ?? user.role}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Trạng thái</dt>
                <dd className="font-medium text-slate-800">
                  {user.is_active ? "Hoạt động" : "Đã khoá"}
                </dd>
              </div>
            </dl>
          )}
        </Card>

        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">
              Hồ sơ nhân viên
            </h2>
            {emp?.id != null && (
              <Link href={`/employees/${emp.id}`}>
                <Button size="sm">Chỉnh sửa trên trang Nhân viên</Button>
              </Link>
            )}
          </div>
          {empLoading && <p className="text-sm text-slate-500">Đang tải…</p>}
          {noEmployee && (
            <p className="text-sm text-slate-600">
              Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên trên hệ
              thống (hoặc bạn chỉ có quyền quản trị). Liên hệ HR nếu cần tạo hồ
              sơ.
            </p>
          )}
          {emp && (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Họ tên</dt>
                <dd className="font-medium text-slate-800">{emp.full_name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Vị trí</dt>
                <dd className="font-medium text-slate-800">
                  {emp.user?.role ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Điện thoại</dt>
                <dd className="font-medium text-slate-800">
                  {emp.phone ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Phòng ban</dt>
                <dd className="font-medium text-slate-800">
                  {emp.department?.name ?? "—"}
                </dd>
              </div>
            </dl>
          )}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-800 mb-2">
            Bảo mật
          </h2>
          <p className="text-sm text-slate-600 mb-4">Đổi mật khẩu đăng nhập.</p>
          <Link href="/account/password">
            <Button variant="outline">Đổi mật khẩu</Button>
          </Link>
        </Card>
      </div>
    </>
  );
}
