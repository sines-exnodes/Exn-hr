"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { changePassword } from "@/hooks/useApi";

export default function AccountPasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword.length < 6) {
      setMessage({ type: "err", text: "Mật khẩu mới cần ít nhất 6 ký tự." });
      return;
    }
    if (newPassword !== confirm) {
      setMessage({ type: "err", text: "Mật khẩu xác nhận không khớp." });
      return;
    }
    setLoading(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      setMessage({ type: "ok", text: "Đã đổi mật khẩu thành công." });
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Đổi mật khẩu thất bại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Đổi mật khẩu"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Tài khoản", href: "/account" },
          { label: "Đổi mật khẩu" },
        ]}
      />
      <div className="p-6 mx-auto max-w-lg space-y-6">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.type === "ok"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Input
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" loading={loading}>
                Lưu mật khẩu
              </Button>
              <Link href="/account">
                <Button type="button" variant="outline">
                  Quay lại
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
