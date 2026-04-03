"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createAnnouncement } from "@/hooks/useApi";
import type {
  AnnouncementTargetType,
  CreateAnnouncementRequest,
} from "@/types";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PollOptionDraft {
  text: string;
}

interface PollDraft {
  enabled: boolean;
  question: string;
  is_multiple_choice: boolean;
  is_anonymous: boolean;
  deadline: string;
  options: PollOptionDraft[];
}

const defaultPoll: PollDraft = {
  enabled: false,
  question: "",
  is_multiple_choice: false,
  is_anonymous: true,
  deadline: "",
  options: [{ text: "" }, { text: "" }],
};

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<AnnouncementTargetType>("all");
  const [targetId, setTargetId] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [poll, setPoll] = useState<PollDraft>({ ...defaultPoll });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePoll = (field: keyof PollDraft, value: unknown) => {
    setPoll((prev) => ({ ...prev, [field]: value }));
  };

  const addPollOption = () => {
    setPoll((prev) => ({ ...prev, options: [...prev.options, { text: "" }] }));
  };

  const removePollOption = (idx: number) => {
    setPoll((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  };

  const updatePollOption = (idx: number, text: string) => {
    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === idx ? { text } : o)),
    }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống.");
      return;
    }
    if (!content.trim()) {
      setError("Nội dung không được để trống.");
      return;
    }
    if (poll.enabled) {
      if (!poll.question.trim()) {
        setError("Câu hỏi bình chọn không được để trống.");
        return;
      }
      const validOptions = poll.options.filter((o) => o.text.trim());
      if (validOptions.length < 2) {
        setError("Cần ít nhất 2 tuỳ chọn cho bình chọn.");
        return;
      }
    }
    setError("");
    setLoading(true);

    const payload: CreateAnnouncementRequest = {
      title: title.trim(),
      content: content.trim(),
      target_type: targetType,
      target_id: targetType !== "all" && targetId ? parseInt(targetId) : null,
      is_pinned: isPinned,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    if (poll.enabled) {
      const validOptions = poll.options
        .filter((o) => o.text.trim())
        .map((o, idx) => ({ text: o.text.trim(), display_order: idx + 1 }));
      payload.poll = {
        question: poll.question.trim(),
        is_multiple_choice: poll.is_multiple_choice,
        is_anonymous: poll.is_anonymous,
        deadline: poll.deadline
          ? new Date(poll.deadline).toISOString()
          : undefined,
        options: validOptions,
      };
    }

    try {
      await createAnnouncement(payload);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo thông báo thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setTargetType("all");
    setTargetId("");
    setIsPinned(false);
    setExpiresAt("");
    setPoll({ ...defaultPoll });
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo thông báo mới"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Huỷ
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Đăng thông báo
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Tiêu đề"
          required
          placeholder="VD: Nghỉ lễ 30/4 - 1/5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Nhập nội dung thông báo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Target */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Đối tượng
            </label>
            <select
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value as AnnouncementTargetType);
                setTargetId("");
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Toàn công ty</option>
              <option value="department">Theo phòng ban</option>
              <option value="project">Theo dự án</option>
            </select>
          </div>
          {targetType !== "all" && (
            <Input
              label={targetType === "department" ? "ID Phòng ban" : "ID Dự án"}
              type="number"
              placeholder="Nhập ID..."
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
          )}
        </div>

        {/* Options row */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-slate-700">Ghim thông báo</span>
          </label>
        </div>

        <Input
          label="Ngày hết hạn (tuỳ chọn)"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />

        {/* Poll section */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={poll.enabled}
              onChange={(e) => updatePoll("enabled", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Thêm bình chọn (Poll)
            </span>
          </label>

          {poll.enabled && (
            <div className="space-y-3 mt-2">
              <Input
                label="Câu hỏi bình chọn"
                required
                placeholder="VD: Bạn sẽ làm gì dịp lễ?"
                value={poll.question}
                onChange={(e) => updatePoll("question", e.target.value)}
              />

              {/* Poll options */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Tuỳ chọn
                  </label>
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Thêm tuỳ chọn
                  </button>
                </div>
                <div className="space-y-2">
                  {poll.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Tuỳ chọn ${idx + 1}...`}
                        value={opt.text}
                        onChange={(e) => updatePollOption(idx, e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {poll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(idx)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label="Xoá tuỳ chọn"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Poll settings */}
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={poll.is_multiple_choice}
                    onChange={(e) =>
                      updatePoll("is_multiple_choice", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-slate-700">Nhiều lựa chọn</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={poll.is_anonymous}
                    onChange={(e) =>
                      updatePoll("is_anonymous", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-slate-700">Ẩn danh</span>
                </label>
              </div>

              <Input
                label="Hạn bình chọn (tuỳ chọn)"
                type="datetime-local"
                value={poll.deadline}
                onChange={(e) => updatePoll("deadline", e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
