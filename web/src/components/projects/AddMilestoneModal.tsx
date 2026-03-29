"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createMilestone, updateMilestone } from "@/hooks/useApi";
import type { Milestone, MilestoneStatus } from "@/types";

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  editingMilestone?: Milestone | null;
}

const milestoneStatuses: { value: MilestoneStatus; label: string }[] = [
  { value: "upcoming", label: "Sắp tới" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "overdue", label: "Quá hạn" },
];

interface ItemDraft {
  id?: number;
  content: string;
  is_completed: boolean;
}

export function AddMilestoneModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  editingMilestone,
}: AddMilestoneModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<MilestoneStatus>("upcoming");
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editingMilestone;

  useEffect(() => {
    if (editingMilestone) {
      setTitle(editingMilestone.title);
      setDescription(editingMilestone.description ?? "");
      setDeadline(editingMilestone.deadline ? editingMilestone.deadline.split("T")[0] : "");
      setStatus(editingMilestone.status);
      setItems(
        (editingMilestone.items ?? []).map((item) => ({
          id: item.id,
          content: item.content,
          is_completed: item.is_completed,
        }))
      );
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
      setStatus("upcoming");
      setItems([]);
    }
    setError("");
  }, [editingMilestone, isOpen]);

  const addItem = () => {
    setItems((prev) => [...prev, { content: "", is_completed: false }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemDraft, value: string | boolean) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Tên cột mốc không được để trống.");
      return;
    }
    if (!deadline) {
      setError("Vui lòng chọn deadline.");
      return;
    }
    setError("");
    setLoading(true);

    const validItems = items
      .filter((item) => item.content.trim())
      .map((item, idx) => ({
        id: item.id,
        content: item.content.trim(),
        is_completed: item.is_completed,
        display_order: idx + 1,
      }));

    try {
      if (isEditing && editingMilestone) {
        await updateMilestone(editingMilestone.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          deadline,
          status,
          items: validItems,
        });
      } else {
        await createMilestone(projectId, {
          title: title.trim(),
          description: description.trim() || undefined,
          deadline,
          items: validItems.length > 0 ? validItems : undefined,
        });
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thao tác thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setStatus("upcoming");
    setItems([]);
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Sửa cột mốc" : "Thêm cột mốc"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Huỷ
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            {isEditing ? "Lưu thay đổi" : "Thêm cột mốc"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <Input
          label="Tên cột mốc"
          required
          placeholder="VD: Release tính năng Login"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Mô tả</label>
          <textarea
            rows={2}
            placeholder="Mô tả cột mốc..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <Input
          label="Deadline"
          type="date"
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        {isEditing && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {milestoneStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Checklist items */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Danh sách công việc</label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm mục
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Chưa có mục nào. Bấm "Thêm mục" để bắt đầu.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {isEditing && (
                    <input
                      type="checkbox"
                      checked={item.is_completed}
                      onChange={(e) => updateItem(idx, "is_completed", e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                  )}
                  <input
                    type="text"
                    placeholder={`Công việc ${idx + 1}...`}
                    value={item.content}
                    onChange={(e) => updateItem(idx, "content", e.target.value)}
                    className={[
                      "flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900",
                      "placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500",
                      item.is_completed ? "line-through text-slate-400" : "",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="flex-shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="Xoá mục"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
