import React from "react";
import { Badge } from "@/components/ui/Badge";
import { PollWidget } from "@/components/announcements/PollWidget";
import type { Announcement, AnnouncementTargetType } from "@/types";

const targetConfig: Record<
  AnnouncementTargetType,
  { label: string; variant: "green" | "blue" | "purple" }
> = {
  all: { label: "Toàn công ty", variant: "green" },
  department: { label: "Phòng ban", variant: "blue" },
  project: { label: "Dự án", variant: "purple" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete?: (id: number) => void;
  showManageActions?: boolean;
}

export function AnnouncementCard({
  announcement,
  onDelete,
  showManageActions,
}: AnnouncementCardProps) {
  const targetCfg = targetConfig[announcement.target_type] ?? {
    label: announcement.target_type,
    variant: "gray" as const,
  };
  const isExpired = announcement.expires_at
    ? new Date(announcement.expires_at).getTime() < Date.now()
    : false;

  return (
    <div
      className={[
        "rounded-xl border bg-white shadow-sm animate-fade-slide-up transition-all duration-200",
        announcement.is_pinned
          ? "border-green-300 ring-1 ring-green-200"
          : "border-slate-200",
        isExpired ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {announcement.is_pinned && (
              <svg
                className="h-4 w-4 flex-shrink-0 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-label="Đã ghim"
              >
                <path d="M16 12V4h1a1 1 0 000-2H7a1 1 0 000 2h1v8l-2 4h12l-2-4z" />
              </svg>
            )}
            <h3 className="font-semibold text-slate-800 truncate">
              {announcement.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={targetCfg.variant}>{targetCfg.label}</Badge>
            {isExpired && <Badge variant="red">Hết hạn</Badge>}
            {showManageActions && onDelete && (
              <button
                onClick={() => onDelete(announcement.id)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Xoá thông báo"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {announcement.content}
        </p>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span>{formatDate(announcement.created_at)}</span>
          {announcement.expires_at && (
            <span>
              Hết hạn:{" "}
              {new Date(announcement.expires_at).toLocaleDateString("vi-VN")}
            </span>
          )}
        </div>

        {/* Poll */}
        {announcement.poll && <PollWidget poll={announcement.poll} />}
      </div>
    </div>
  );
}
