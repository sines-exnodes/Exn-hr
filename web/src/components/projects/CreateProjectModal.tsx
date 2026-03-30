"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createProject } from "@/hooks/useApi";
import type { CreateProjectRequest } from "@/types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [form, setForm] = useState<CreateProjectRequest>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: keyof CreateProjectRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Tên dự án không được để trống.");
      return;
    }
    if (!form.start_date) {
      setError("Vui lòng chọn ngày bắt đầu.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createProject({
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        start_date: form.start_date,
        end_date: form.end_date || undefined,
      });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo dự án thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", description: "", start_date: "", end_date: "" });
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo dự án mới"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Huỷ
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Tạo dự án
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
          label="Tên dự án"
          required
          placeholder="VD: Exn-Hr Mobile App"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Mô tả</label>
          <textarea
            rows={3}
            placeholder="Mô tả ngắn về dự án..."
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ngày bắt đầu"
            type="date"
            required
            value={form.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
          />
          <Input
            label="Ngày kết thúc"
            type="date"
            value={form.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
