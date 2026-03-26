import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | EXN HRM",
    default: "Bảng lương | EXN HRM",
  },
};

export default function FullPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      <main className="animate-fade-slide-up">{children}</main>
    </div>
  );
}
