"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { CreateAnnouncementModal } from "@/components/announcements/CreateAnnouncementModal";
import { useAnnouncements, deleteAnnouncement } from "@/hooks/useApi";
import type { AnnouncementTargetType } from "@/types";

const targetFilterOptions: { value: "" | AnnouncementTargetType; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "all", label: "Toàn công ty" },
  { value: "team", label: "Theo nhóm" },
  { value: "project", label: "Theo dự án" },
];

export default function AnnouncementsPage() {
  const [targetFilter, setTargetFilter] = useState<"" | AnnouncementTargetType>("");
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: response, isLoading, mutate } = useAnnouncements(
    targetFilter ? { target_type: targetFilter } : undefined
  );

  const announcements = response?.data ?? [];

  // Pinned first
  const sorted = [...announcements].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleDelete = async () => {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await deleteAnnouncement(deletingId);
      await mutate();
      setDeletingId(null);
    } catch {
      // silently ignore
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Thông báo"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Thông báo" }]}
      />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Tổng thông báo",
              value: announcements.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Đã ghim",
              value: announcements.filter((a) => a.is_pinned).length,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Có bình chọn",
              value: announcements.filter((a) => !!a.poll).length,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Hết hạn",
              value: announcements.filter(
                (a) => a.expires_at && new Date(a.expires_at).getTime() < Date.now()
              ).length,
              color: "text-red-600",
              bg: "bg-red-50",
            },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border border-slate-200 ${bg} p-4 shadow-sm`}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {targetFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTargetFilter(opt.value)}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
                  targetFilter === opt.value
                    ? "bg-green-500 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            onClick={() => setShowCreate(true)}
          >
            Tạo thông báo
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-4 text-center text-sm text-slate-400">Đang tải...</div>
        )}

        {/* Empty */}
        {!isLoading && sorted.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-500">Chưa có thông báo nào.</p>
            <p className="mt-1 text-xs text-slate-400">Bấm "Tạo thông báo" để bắt đầu.</p>
          </div>
        )}

        {/* List */}
        {!isLoading && sorted.length > 0 && (
          <div className="space-y-4">
            {sorted.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                showManageActions
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateAnnouncementModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => mutate()}
      />

      {/* Delete confirm modal */}
      <Modal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Xoá thông báo"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Huỷ</Button>
            <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
              Xoá
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xoá thông báo này? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </>
  );
}
