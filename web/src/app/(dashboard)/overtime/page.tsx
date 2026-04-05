"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import type { OvertimeRequest } from "@/types";
import {
  useOvertimeRequests,
  createOvertimeRequest,
  leaderApproveOT,
  ceoApproveOT,
  cancelOvertime,
} from "@/hooks/useApi";
import { useSSE } from "@/hooks/useSSE";
import { Pagination } from "@/components/Pagination";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const OT_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    multiplier: number;
    badgeLabel: string;
    variant: "blue" | "orange" | "purple";
  }
> = {
  normal: {
    label: "Ngày thường (x1.5)",
    multiplier: 1.5,
    badgeLabel: "x1.5",
    variant: "blue",
  },
  weekend: {
    label: "Ngày nghỉ (x2.0)",
    multiplier: 2.0,
    badgeLabel: "x2.0",
    variant: "orange",
  },
  holiday: {
    label: "Ngày lễ (x3.0)",
    multiplier: 3.0,
    badgeLabel: "x3.0",
    variant: "purple",
  },
};

function getOTMultiplier(otType?: string): number {
  return OT_TYPE_CONFIG[otType ?? "normal"]?.multiplier ?? 1.5;
}

function otTypeBadge(otType?: string) {
  const config = OT_TYPE_CONFIG[otType ?? "normal"] ?? OT_TYPE_CONFIG.normal;
  return <Badge variant={config.variant}>{config.badgeLabel}</Badge>;
}

function calcOTAmount(ot: OvertimeRequest): number {
  const basicSalary = ot.employee?.basic_salary ?? 0;
  if (basicSalary === 0) return 0;
  return ot.hours * (basicSalary / 26 / 8) * getOTMultiplier(ot.ot_type);
}

function OTTable({
  requests,
  onApprove,
  onReject,
  stage,
}: {
  requests: OvertimeRequest[];
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  stage?: "leader" | "ceo";
}) {
  if (requests.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        Không có yêu cầu OT nào.
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
              "Ngày",
              "Giờ",
              "Số giờ",
              "Loại OT",
              "Lý do",
              "Thành tiền",
              "Leader",
              "CEO",
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
          {requests.map((ot) => {
            const employeeName =
              ot.employee?.full_name ?? `NV #${ot.employee_id}`;
            const amount = calcOTAmount(ot);
            return (
              <tr
                key={ot.id}
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
                <td className="px-4 py-3 text-sm text-slate-600">{ot.date}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {ot.start_time} – {ot.end_time}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                  {ot.hours}h
                </td>
                <td className="px-4 py-3">{otTypeBadge(ot.ot_type)}</td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">
                  {ot.reason}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  {amount > 0 ? formatCurrency(amount) : "—"}
                </td>
                <td className="px-4 py-3">{statusBadge(ot.leader_status)}</td>
                <td className="px-4 py-3">{statusBadge(ot.ceo_status)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {statusBadge(ot.overall_status)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {onApprove && onReject && (
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => onApprove(ot.id)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => onReject(ot.id)}
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

export default function OvertimePage() {
  const [page, setPage] = useState(1);
  const { data: response, mutate, isLoading } = useOvertimeRequests({ page, size: PAGE_SIZE });

  // Real-time updates via SSE
  useSSE({
    overtime_created: () => {
      mutate();
    },
    overtime_approved: () => {
      mutate();
    },
  });

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectStage, setRejectStage] = useState<"leader" | "ceo">("leader");
  const [actionLoading, setActionLoading] = useState(false);

  // Create OT form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newOT, setNewOT] = useState({
    date: "",
    start_time: "",
    end_time: "",
    hours: 0,
    reason: "",
    ot_type: "normal" as "normal" | "weekend" | "holiday",
  });

  const otData = response?.data ?? [];
  const totalCount = response?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const leaderPending = otData.filter((o) => o.leader_status === "pending");
  const ceoPending = otData.filter(
    (o) => o.leader_status === "approved" && o.ceo_status === "pending",
  );
  const approved = otData.filter((o) => o.overall_status === "approved");
  const rejected = otData.filter((o) => o.overall_status === "rejected");
  const all = otData;

  const totalAmount = approved.reduce((s, o) => s + calcOTAmount(o), 0);
  const totalHours = approved.reduce((s, o) => s + o.hours, 0);

  const handleApprove = async (id: number, stage: "leader" | "ceo") => {
    setActionLoading(true);
    try {
      if (stage === "leader") {
        await leaderApproveOT(id, { status: "approved" });
      } else {
        await ceoApproveOT(id, { status: "approved" });
      }
      await mutate();
    } catch (err) {
      console.error("Approve failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectId === null) return;
    setActionLoading(true);
    try {
      if (rejectStage === "leader") {
        await leaderApproveOT(rejectId, {
          status: "rejected",
          comment: rejectReason,
        });
      } else {
        await ceoApproveOT(rejectId, {
          status: "rejected",
          comment: rejectReason,
        });
      }
      await mutate();
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setActionLoading(false);
      setRejectId(null);
      setRejectReason("");
    }
  };

  const resetCreateForm = () => {
    setNewOT({
      date: "",
      start_time: "",
      end_time: "",
      hours: 0,
      reason: "",
      ot_type: "normal",
    });
    setShowCreateModal(false);
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      await createOvertimeRequest(newOT);
      await mutate();
      resetCreateForm();
    } catch (err) {
      console.error("Create OT failed", err);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Overtime"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Overtime" }]}
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
          <Card>
            <p className="text-xs text-slate-400">Chờ Leader duyệt</p>
            <p className="mt-1 text-3xl font-bold text-yellow-600">
              {leaderPending.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-400">Chờ CEO duyệt</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">
              {ceoPending.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-400">Tổng giờ OT (đã duyệt)</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {totalHours}h
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-400">Tổng chi phí OT</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              {formatCurrency(totalAmount)}
            </p>
          </Card>
        </div>

        {/* Create OT button */}
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Tạo yêu cầu OT
          </Button>
        </div>

        {/* 2-level approval info */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5"
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
              <p className="text-sm font-semibold text-blue-700">
                Quy trình phê duyệt 2 cấp
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Yêu cầu OT cần được <strong>Leader</strong> phê duyệt trước, sau
                đó <strong>CEO</strong> phê duyệt lần cuối. Tỷ lệ OT: Ngày
                thường x1.5, Ngày nghỉ x2.0, Ngày lễ x3.0.
              </p>
            </div>
          </div>
        </div>

        <Card padding="none">
          <Tabs
            tabs={[
              {
                id: "leader",
                label: "Chờ Leader duyệt",
                badge: leaderPending.length,
              },
              { id: "ceo", label: "Chờ CEO duyệt", badge: ceoPending.length },
              { id: "approved", label: "Đã duyệt" },
              { id: "rejected", label: "Từ chối" },
              { id: "all", label: "Tất cả" },
            ]}
          >
            {(active) => {
              if (active === "leader") {
                return (
                  <OTTable
                    requests={leaderPending}
                    stage="leader"
                    onApprove={(id) => handleApprove(id, "leader")}
                    onReject={(id) => {
                      setRejectStage("leader");
                      setRejectId(id);
                    }}
                  />
                );
              }
              if (active === "ceo") {
                return (
                  <OTTable
                    requests={ceoPending}
                    stage="ceo"
                    onApprove={(id) => handleApprove(id, "ceo")}
                    onReject={(id) => {
                      setRejectStage("ceo");
                      setRejectId(id);
                    }}
                  />
                );
              }
              const data =
                active === "approved"
                  ? approved
                  : active === "rejected"
                    ? rejected
                    : all;
              return <OTTable requests={data} />;
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
          isOpen={rejectId !== null}
          onClose={() => setRejectId(null)}
          title="Từ chối yêu cầu OT"
          footer={
            <>
              <Button variant="outline" onClick={() => setRejectId(null)}>
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
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-600">
              Nhập lý do từ chối yêu cầu làm thêm giờ:
            </p>
            <textarea
              rows={3}
              placeholder="Lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>
        </Modal>

        {/* Create OT modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={resetCreateForm}
          title="Tạo yêu cầu tăng ca"
          footer={
            <>
              <Button variant="outline" onClick={resetCreateForm}>
                Huỷ
              </Button>
              <Button
                variant="primary"
                disabled={
                  createLoading ||
                  !newOT.date ||
                  !newOT.start_time ||
                  !newOT.end_time ||
                  newOT.hours <= 0 ||
                  !newOT.reason
                }
                onClick={handleCreate}
              >
                {createLoading ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Loại tăng ca
              </label>
              <select
                value={newOT.ot_type}
                onChange={(e) =>
                  setNewOT({
                    ...newOT,
                    ot_type: e.target.value as "normal" | "weekend" | "holiday",
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              >
                {Object.entries(OT_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ngày
              </label>
              <input
                type="date"
                value={newOT.date}
                onChange={(e) => setNewOT({ ...newOT, date: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  value={newOT.start_time}
                  onChange={(e) =>
                    setNewOT({ ...newOT, start_time: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Giờ kết thúc
                </label>
                <input
                  type="time"
                  value={newOT.end_time}
                  onChange={(e) =>
                    setNewOT({ ...newOT, end_time: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số giờ
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={newOT.hours}
                onChange={(e) =>
                  setNewOT({ ...newOT, hours: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lý do
              </label>
              <textarea
                rows={3}
                placeholder="Nhập lý do tăng ca..."
                value={newOT.reason}
                onChange={(e) => setNewOT({ ...newOT, reason: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
