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
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organization", label: "Tổ chức", icon: Building2 },
  { href: "/employees", label: "Nhân viên", icon: Users },
  { href: "/attendance", label: "Chấm công", icon: ScanLine },
  { href: "/leave", label: "Nghỉ phép", icon: Calendar },
  { href: "/overtime", label: "Làm thêm (OT)", icon: Timer },
  { href: "/payroll", label: "Tính lương", icon: Wallet },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex h-screen w-60 flex-shrink-0 flex-col"
      style={{ backgroundColor: "var(--bg-sidebar)" }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <span className="text-sm font-bold text-white">E</span>
        </div>
        <span className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}>
          Exn-Hr
        </span>
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
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active ? "var(--sidebar-active-bg)" : "transparent",
                    color: active ? "var(--sidebar-active-text)" : "var(--sidebar-text)",
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
      <div className="px-3 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
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
            AD
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>
              admin@exn.vn
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
