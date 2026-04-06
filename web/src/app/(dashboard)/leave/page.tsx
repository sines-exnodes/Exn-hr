"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { LeaveRequest } from "@/types";
import {
  useLeaveRequests,
  createLeaveRequest,
  leaderApproveLeave,
  hrApproveLeave,
  cancelLeave,
} from "@/hooks/useApi";
import { useSSE } from "@/hooks/useSSE";
import { Pagination } from "@/components/Pagination";

const leaveTypeLabel: Record<string, string> = {
  paid: "Phép năm",
  unpaid: "Không lương",
};

function LeaveTable({
  requests,
  onAction,
}: {
  requests: LeaveRequest[];
  onAction?: (
    id: number,
    action: "approve" | "reject",
    req: LeaveRequest,
  ) => void;
}) {
  if (requests.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        Không có đơn nghỉ phép nào.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            {[
              "Nhân viên",
              "Loại",
              "Từ ngày",
              "Đến ngày",
              "Số ngày",
              "Lý do",
              "Leader",
              "HR",
              "Trạng thái",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {requests.map((req) => {
            const employeeName =
              req.employee?.full_name ?? `NV #${req.employee_id}`;
            return (
              <tr
                key={req.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                      {employeeName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {employeeName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="blue">
                    {leaveTypeLabel[req.type] ?? req.type}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {req.start_date}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {req.end_date}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    {req.days}
                    {req.is_half_day && (
                      <Badge variant="purple">
                        {req.half_day_period === "morning"
                          ? "Nửa buổi (Sáng)"
                          : "Nửa buổi (Chiều)"}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">
                  {req.reason}
                </td>
                <td className="px-4 py-3">{statusBadge(req.leader_status)}</td>
                <td className="px-4 py-3">{statusBadge(req.hr_status)}</td>
                <td className="px-4 py-3">{statusBadge(req.overall_status)}</td>
                <td className="px-4 py-3">
                  {req.overall_status === "pending" && onAction && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => onAction(req.id, "approve", req)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => onAction(req.id, "reject", req)}
                      >
                        Từ chối
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function LeavePage() {
  const [page, setPage] = useState(1);
  const { data: response, mutate, isLoading } = useLeaveRequests({ page, size: PAGE_SIZE });

  // Real-time updates via SSE
  useSSE({
    leave_created: () => {
      mutate();
    },
    leave_approved: () => {
      mutate();
    },
  });

  // Create leave modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    type: "paid" as string,
    start_date: "",
    end_date: "",
    days: 1,
    reason: "",
    is_half_day: false,
    half_day_period: "morning" as string,
  });
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setCreateForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "is_half_day" && value === true) {
        next.days = 0.5;
        next.end_date = next.start_date;
      }
      if (field === "is_half_day" && value === false) {
        next.days = 1;
      }
      if (field === "start_date" && next.is_half_day) {
        next.end_date = value as string;
      }
      return next;
    });
  };

  const handleCreateSubmit = async () => {
    setCreateLoading(true);
    try {
      await createLeaveRequest({
        type: createForm.type,
        start_date: createForm.start_date,
        end_date: createForm.end_date,
        days: createForm.days,
        reason: createForm.reason,
        ...(createForm.is_half_day
          ? {
              is_half_day: true,
              half_day_period: createForm.half_day_period,
            }
          : {}),
      });
      await mutate();
      setCreateOpen(false);
      setCreateForm({
        type: "paid",
        start_date: "",
        end_date: "",
        days: 1,
        reason: "",
        is_half_day: false,
        half_day_period: "morning",
      });
    } catch (err) {
      console.error("Create leave failed", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const [rejectModal, setRejectModal] = useState<{
    id: number;
    req: LeaveRequest;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const leaveData = response?.data ?? [];
  const totalCount = response?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const pending = leaveData.filter((l) => l.overall_status === "pending");
  const approved = leaveData.filter((l) => l.overall_status === "approved");
  const rejected = leaveData.filter((l) => l.overall_status === "rejected");
  const all = leaveData;

  const handleAction = async (
    id: number,
    action: "approve" | "reject",
    req: LeaveRequest,
  ) => {
    if (action === "reject") {
      setRejectModal({ id, req });
      return;
    }

    setActionLoading(true);
    try {
      if (req.leader_status === "pending") {
        await leaderApproveLeave(id, { status: "approved" });
      } else {
        await hrApproveLeave(id, { status: "approved" });
      }
      await mutate();
    } catch (err) {
      console.error("Approve failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      const { id, req } = rejectModal;
      if (req.leader_status === "pending") {
        await leaderApproveLeave(id, {
          status: "rejected",
          comment: rejectReason,
        });
      } else {
        await hrApproveLeave(id, { status: "rejected", comment: rejectReason });
      }
      await mutate();
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setActionLoading(false);
      setRejectModal(null);
      setRejectReason("");
    }
  };

  return (
    <>
      <Header
        title="Nghỉ phép"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Nghỉ phép" },
        ]}
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            + Tạo đơn nghỉ phép
          </Button>
        }
      />
      <div className="p-6 space-y-5">
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center text-sm text-slate-400 py-2">
            Đang tải dữ liệu...
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Chờ duyệt",
              value: pending.length,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Đã duyệt",
              value: approved.length,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Từ chối",
              value: rejected.length,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: "Tổng cộng",
              value: all.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
          ].map(({ label, value, color, bg }) => (
            <Card key={label} className={bg}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        <Card padding="none">
          <Tabs
            tabs={[
              { id: "pending", label: "Chờ duyệt", badge: pending.length },
              { id: "approved", label: "Đã duyệt" },
              { id: "rejected", label: "Từ chối" },
              { id: "all", label: "Tất cả" },
            ]}
          >
            {(active) => {
              const data =
                active === "pending"
                  ? pending
                  : active === "approved"
                    ? approved
                    : active === "rejected"
                      ? rejected
                      : all;
              return (
                <LeaveTable
                  requests={data}
                  onAction={active === "pending" ? handleAction : undefined}
                />
              );
            }}
          </Tabs>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </Card>

        {/* Reject modal */}
        <Modal
          isOpen={rejectModal !== null}
          onClose={() => setRejectModal(null)}
          title="Từ chối đơn nghỉ phép"
          footer={
            <>
              <Button variant="outline" onClick={() => setRejectModal(null)}>
                Huỷ
              </Button>
              <Button
                variant="danger"
                disabled={actionLoading}
                onClick={handleReject}
              >
                Xác nhận từ chối
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Vui lòng nhập lý do từ chối để nhân viên được biết.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
          </div>
        </Modal>

        {/* Create leave modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Tạo đơn nghỉ phép"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Huỷ
              </Button>
              <Button
                variant="primary"
                disabled={
                  createLoading ||
                  !createForm.start_date ||
                  !createForm.reason
                }
                onClick={handleCreateSubmit}
              >
                {createLoading ? "Đang gửi..." : "Gửi đơn"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select
              label="Loại nghỉ phép"
              options={[
                { value: "paid", label: "Phép năm" },
                { value: "unpaid", label: "Không lương" },
              ]}
              value={createForm.type}
              onChange={(e) => handleCreateChange("type", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Từ ngày"
                type="date"
                value={createForm.start_date}
                onChange={(e) =>
                  handleCreateChange("start_date", e.target.value)
                }
              />
              <Input
                label="Đến ngày"
                type="date"
                value={createForm.end_date}
                onChange={(e) =>
                  handleCreateChange("end_date", e.target.value)
                }
                disabled={createForm.is_half_day}
              />
            </div>

            {/* Half-day toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={createForm.is_half_day}
                  onChange={(e) =>
                    handleCreateChange("is_half_day", e.target.checked)
                  }
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#22C55E] peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm font-medium text-slate-700">
                Nghỉ nửa buổi
              </span>
            </div>

            {/* Half-day period selector */}
            {createForm.is_half_day && (
              <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="half_day_period"
                    value="morning"
                    checked={createForm.half_day_period === "morning"}
                    onChange={(e) =>
                      handleCreateChange("half_day_period", e.target.value)
                    }
                    className="h-4 w-4 text-[#22C55E] focus:ring-[#22C55E]"
                  />
                  <span className="text-sm text-slate-700">Buổi sáng</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="half_day_period"
                    value="afternoon"
                    checked={createForm.half_day_period === "afternoon"}
                    onChange={(e) =>
                      handleCreateChange("half_day_period", e.target.value)
                    }
                    className="h-4 w-4 text-[#22C55E] focus:ring-[#22C55E]"
                  />
                  <span className="text-sm text-slate-700">Buổi chiều</span>
                </label>
              </div>
            )}

            <Input
              label="Số ngày"
              type="number"
              min={0.5}
              step={0.5}
              value={createForm.days}
              onChange={(e) =>
                handleCreateChange("days", parseFloat(e.target.value) || 0)
              }
              disabled={createForm.is_half_day}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Lý do <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Nhập lý do nghỉ phép..."
                value={createForm.reason}
                onChange={(e) => handleCreateChange("reason", e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
