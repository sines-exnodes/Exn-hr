"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ScanLine,
  Calendar,
  Timer,
  Wallet,
  BarChart3,
  Briefcase,
  LayoutGrid,
  Megaphone,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { useAuthContext } from "@/lib/auth";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[]; // if undefined, visible to all
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/organization",
    label: "Tổ chức",
    icon: Building2,
    roles: ["admin", "ceo", "hr"],
  },
  {
    href: "/employees",
    label: "Nhân viên",
    icon: Users,
    roles: ["admin", "ceo", "hr"],
  },
  { href: "/attendance", label: "Chấm công", icon: ScanLine },
  { href: "/leave", label: "Nghỉ phép", icon: Calendar },
  { href: "/overtime", label: "Làm thêm (OT)", icon: Timer },
  {
    href: "/payroll",
    label: "Tính lương",
    icon: Wallet,
    roles: ["admin", "ceo", "hr"],
  },
  {
    href: "/workload",
    label: "Phân bổ NV",
    icon: LayoutGrid,
    roles: ["admin", "ceo", "hr"],
  },
  {
    href: "/projects",
    label: "Dự án",
    icon: Briefcase,
    roles: ["admin", "ceo", "hr", "leader"],
  },
  {
    href: "/announcements",
    label: "Thông báo",
    icon: Megaphone,
  },
  {
    href: "/reports",
    label: "Báo cáo",
    icon: BarChart3,
    roles: ["admin", "ceo", "hr"],
  },
  {
    href: "/allowances",
    label: "Phụ cấp",
    icon: Wallet,
    roles: ["admin", "hr"],
  },
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  ceo: "CEO",
  hr: "HR",
  leader: "Leader",
  employee: "Nhân viên",
};

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthContext();

  const userRole = user?.role ?? "employee";
  const userEmail = user?.email ?? "—";
  const userInitials = userEmail.substring(0, 2).toUpperCase();
  const roleLabel = roleLabels[userRole] ?? userRole;

  const filteredNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex h-screen w-60 flex-shrink-0 flex-col animate-fade-slide-up"
      style={{ backgroundColor: "var(--bg-sidebar)" }}
    >
      {/* Logo */}
      <div
        className="flex min-h-[4.25rem] items-center px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/logo_without_text.webp"
            alt="EXN HRM"
            width={42}
            height={42}
            className="h-10 w-10 object-contain"
            draggable={false}
          />
          <span
            className="text-lg font-semibold text-white tracking-tight"
            style={{
              fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
            }}
          >
            EXN HRM
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p
          className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--sidebar-text)" }}
        >
          Menu
        </p>
        <ul className="space-y-0.5">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-0.5"
                  style={{
                    backgroundColor: active
                      ? "var(--sidebar-active-bg)"
                      : "transparent",
                    color: active
                      ? "var(--sidebar-active-text)"
                      : "var(--sidebar-text)",
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme toggle + User */}
      <div
        className="px-3 pb-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <button
          onClick={toggleTheme}
          className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
          style={{ color: "var(--sidebar-text)" }}
        >
          {theme === "green" ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === "green" ? "Dark Blue" : "Green"} Theme</span>
        </button>

        <div className="mt-2 flex items-center gap-3 rounded-md px-3 py-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {roleLabel}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--sidebar-text)" }}
            >
              {userEmail}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex-shrink-0 rounded-md p-1.5 transition-colors hover:bg-white/10"
            style={{ color: "var(--sidebar-text)" }}
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
