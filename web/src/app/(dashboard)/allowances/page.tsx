"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { AllowanceType } from "@/types";
import {
  useAllowanceTypes,
  createAllowanceType,
  deleteAllowanceType,
  updateAllowanceType,
} from "@/hooks/useApi";

export default function AllowancesPage() {
  const { data: response, mutate, isLoading } = useAllowanceTypes();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<AllowanceType | null>(null);
  const [deleteItem, setDeleteItem] = useState<AllowanceType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formTaxable, setFormTaxable] = useState(false);

  const allowanceTypes = response?.data ?? [];

  const openCreate = () => {
    setFormName("");
    setFormDesc("");
    setFormTaxable(false);
    setCreateOpen(true);
  };

  const openEdit = (item: AllowanceType) => {
    setFormName(item.name);
    setFormDesc(item.description ?? "");
    setFormTaxable(item.is_taxable ?? false);
    setEditItem(item);
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setActionLoading(true);
    try {
      await createAllowanceType({
        name: formName,
        description: formDesc || undefined,
        is_taxable: formTaxable,
      });
      await mutate();
      setCreateOpen(false);
      setFormName("");
      setFormDesc("");
    } catch (err) {
      console.error("Create allowance type failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setActionLoading(true);
    try {
      await deleteAllowanceType(deleteItem.id);
      await mutate();
      setDeleteItem(null);
    } catch (err) {
      console.error("Delete allowance type failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem || !formName.trim()) return;
    setActionLoading(true);
    try {
      await updateAllowanceType(editItem.id, {
        name: formName.trim(),
        description: formDesc || undefined,
        is_taxable: formTaxable,
      });
      await mutate();
      setEditItem(null);
    } catch (err) {
      console.error("Update allowance type failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Quản lý phụ cấp"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Phụ cấp" }]}
      />
      <div className="p-6 space-y-5">
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center text-sm text-slate-400 py-2">
            Đang tải dữ liệu...
          </div>
        )}

        {/* Info banner */}
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-700">
              Phụ cấp tuỳ chỉnh
            </p>
            <p className="text-xs text-green-600 mt-1">
              Admin có thể tạo các loại phụ cấp tự do. Phụ cấp được gán cho từng
              nhân viên và tự động tính vào bảng lương hàng tháng.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              {allowanceTypes.length}
            </span>{" "}
            loại phụ cấp
          </p>
          <Button
            onClick={openCreate}
            icon={
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Thêm loại phụ cấp
          </Button>
        </div>

        {/* Allowance type cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!isLoading && allowanceTypes.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <p className="text-sm text-slate-400 text-center py-6">
                Chưa có loại phụ cấp nào.
              </p>
            </Card>
          )}
          {allowanceTypes.map((type) => (
            <Card key={type.id} className="group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10">
                    <svg
                      className="h-5 w-5 text-[#22C55E]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {type.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {type.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(type)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    aria-label="Chỉnh sửa"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteItem(type)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="Xoá"
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
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Create modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Thêm loại phụ cấp mới"
          footer={
            <>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Huỷ
              </Button>
              <Button disabled={actionLoading} onClick={handleCreate}>
                Tạo loại phụ cấp
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Tên loại phụ cấp"
              placeholder="VD: Phụ cấp ăn trưa"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <textarea
                rows={2}
                placeholder="Mô tả phụ cấp này..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formTaxable}
                onChange={(e) => setFormTaxable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#22C55E] focus:ring-[#22C55E]"
              />
              <span className="text-sm font-medium text-slate-700">
                Tính thuế TNCN
              </span>
            </label>
          </div>
        </Modal>

        {/* Edit modal */}
        <Modal
          isOpen={editItem !== null}
          onClose={() => setEditItem(null)}
          title={`Chỉnh sửa: ${editItem?.name}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditItem(null)}>
                Huỷ
              </Button>
              <Button disabled={actionLoading} onClick={handleEdit}>
                Lưu thay đổi
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Tên loại phụ cấp"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formTaxable}
                onChange={(e) => setFormTaxable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#22C55E] focus:ring-[#22C55E]"
              />
              <span className="text-sm font-medium text-slate-700">
                Tính thuế TNCN
              </span>
            </label>
          </div>
        </Modal>

        {/* Delete confirm modal */}
        <Modal
          isOpen={deleteItem !== null}
          onClose={() => setDeleteItem(null)}
          title="Xoá loại phụ cấp"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteItem(null)}>
                Huỷ
              </Button>
              <Button
                variant="danger"
                disabled={actionLoading}
                onClick={handleDelete}
              >
                Xoá
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Bạn có chắc muốn xoá loại phụ cấp{" "}
            <strong>&ldquo;{deleteItem?.name}&rdquo;</strong>? Hành động này
            không thể hoàn tác và sẽ xoá tất cả phụ cấp đang áp dụng cho nhân
            viên.
          </p>
        </Modal>
      </div>
    </>
  );
}
