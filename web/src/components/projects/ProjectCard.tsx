import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Project, ProjectStatus } from "@/types";

const statusConfig: Record<ProjectStatus, { label: string; variant: "green" | "yellow" | "gray" }> = {
  active: { label: "Đang hoạt động", variant: "green" },
  completed: { label: "Hoàn thành", variant: "gray" },
  on_hold: { label: "Tạm dừng", variant: "yellow" },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const config = statusConfig[project.status] ?? { label: project.status, variant: "gray" as const };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-slide-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 group-hover:text-green-600 transition-colors truncate">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      {/* Dates */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(project.start_date)}</span>
          {project.end_date && (
            <>
              <span className="text-slate-300">→</span>
              <span>{formatDate(project.end_date)}</span>
            </>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            <span className="font-semibold text-slate-700">
              {project.member_count ?? project.members?.length ?? 0}
            </span>{" "}
            thành viên
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>
            <span className="font-semibold text-slate-700">
              {project.milestone_count ?? project.milestones?.length ?? 0}
            </span>{" "}
            cột mốc
          </span>
        </div>
        <div className="ml-auto text-xs font-medium text-green-600 group-hover:underline">
          Xem chi tiết →
        </div>
      </div>
    </Link>
  );
}
