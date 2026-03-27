import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | EXN HRM",
    default: "Dashboard | EXN HRM",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div
        className="flex h-screen overflow-hidden bg-mesh-soft"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto animate-fade-slide-up">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
