"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCurrentUser, useMyProfile } from "@/hooks/useApi";

function getInitials(display: string): string {
  const s = display.trim();
  if (!s) return "?";
  if (s.includes("@")) {
    return s.slice(0, 2).toUpperCase();
  }
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return s.slice(0, 2).toUpperCase();
}

const roleLabels: Record<string, string> = {
  admin: "Quản trị",
  ceo: "CEO",
  hr: "Nhân sự",
  leader: "Trưởng nhóm",
  employee: "Nhân viên",
};

export function signOutWeb() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  document.cookie = "auth_token=; path=/; max-age=0";
  window.location.href = "/login";
}

interface UserMenuProps {
  /** Khi panel thông báo mở thì đóng menu user */
  notifOpen?: boolean;
  /** Gọi khi mở menu user (để đóng panel thông báo) */
  onMenuOpen?: () => void;
}

export function UserMenu({ notifOpen = false, onMenuOpen }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: userRes, isLoading: userLoading } = useCurrentUser();
  const { data: empRes } = useMyProfile({
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (notifOpen) setOpen(false);
  }, [notifOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const user = userRes?.data;
  const emp = empRes?.data;
  const displayName = emp?.full_name ?? user?.email ?? "Tài khoản";
  const initials = getInitials(emp?.full_name ?? user?.email ?? "U");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => {
            const next = !prev;
            if (next) onMenuOpen?.();
            return next;
          })
        }
        className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white pl-1 pr-2 text-left transition-all duration-200 hover:bg-slate-50 hover:-translate-y-0.5"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu tài khoản"
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-[11px] font-bold text-white">
          {userLoading && !user ? "…" : initials}
        </span>
        <span className="hidden max-w-[140px] truncate text-xs font-medium text-slate-700 sm:block">
          {userLoading ? "…" : displayName}
        </span>
        <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-lg animate-fade-slide-up"
          role="menu"
        >
          <div className="border-b border-slate-100 px-4 pb-3 pt-1">
            <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
            {user?.email && (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            )}
            {user?.role && (
              <p className="mt-1 text-xs text-green-600">{roleLabels[user.role] ?? user.role}</p>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/account"
              role="menuitem"
              className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              Hồ sơ &amp; tài khoản
            </Link>
            {emp?.id != null && (
              <Link
                href={`/employees/${emp.id}`}
                role="menuitem"
                className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                Chỉnh sửa thông tin nhân viên
              </Link>
            )}
            <Link
              href="/account/password"
              role="menuitem"
              className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              Đổi mật khẩu
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              type="button"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpen(false);
                signOutWeb();
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
