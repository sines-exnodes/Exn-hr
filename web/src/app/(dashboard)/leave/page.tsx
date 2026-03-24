"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import type { LeaveRequest } from "@/types";
import { useLeaveRequests, leaderApproveLeave, hrApproveLeave, cancelLeave } from "@/hooks/useApi";

const mockLeave: LeaveRequest[] = [
  { id: 1, employee_id: 1, type: "paid", start_date: "2026-03-22", end_date: "2026-03-23", days: 2, reason: "Việc gia đình", leader_status: "pending", hr_status: "pending", overall_status: "pending", created_at: "2026-03-19T09:00:00Z" },
  { id: 2, employee_id: 2, type: "unpaid", start_date: "2026-03-20", end_date: "2026-03-20", days: 1, reason: "Bị ốm", leader_status: "approved", hr_status: "pending", overall_status: "pending", created_at: "2026-03-18T14:00:00Z" },
  { id: 3, employee_id: 3, type: "paid", start_date: "2026-03-25", end_date: "2026-03-26", days: 2, reason: "Du lịch gia đình", leader_status: "pending", hr_status: "pending", overall_status: "pending", created_at: "2026-03-17T10:00:00Z" },
  { id: 4, employee_id: 4, type: "paid", start_date: "2026-03-01", end_date: "2026-03-02", days: 2, reason: "Nghỉ lễ", leader_status: "approved", hr_status: "approved", overall_status: "approved", created_at: "2026-02-26T00:00:00Z" },
  { id: 5, employee_id: 5, type: "unpaid", start_date: "2026-02-15", end_date: "2026-02-15", days: 1, reason: "Sức khoẻ", leader_status: "approved", hr_status: "rejected", overall_status: "rejected", created_at: "2026-02-14T00:00:00Z" },
  { id: 6, employee_id: 6, type: "unpaid", start_date: "2026-04-01", end_date: "2026-04-03", days: 3, reason: "Chuyện cá nhân", leader_status: "pending", hr_status: "pending", overall_status: "pending", created_at: "2026-03-18T08:00:00Z" },
];

const leaveTypeLabel: Record<string, string> = {
  paid: "Phép năm",
  unpaid: "Không lương",
};

function LeaveTable({ requests, onAction }: { requests: LeaveRequest[]; onAction?: (id: number, action: "approve" | "reject", req: LeaveRequest) => void }) {
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
            {["Nhân viên", "Loại", "Từ ngày", "Đến ngày", "Số ngày", "Lý do", "Leader", "HR", "Trạng thái", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {requests.map((req) => {
            const employeeName = req.employee?.full_name ?? `NV #${req.employee_id}`;
            return (
              <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                      {employeeName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{employeeName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="blue">{leaveTypeLabel[req.type] ?? req.type}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{req.start_date}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{req.end_date}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700">{req.days}</td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{req.reason}</td>
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

export default function LeavePage() {
  const { data: response, mutate, isLoading } = useLeaveRequests();
  const [rejectModal, setRejectModal] = useState<{ id: number; req: LeaveRequest } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const leaveData = response?.data ?? mockLeave;

  const pending = leaveData.filter((l) => l.overall_status === "pending");
  const approved = leaveData.filter((l) => l.overall_status === "approved");
  const rejected = leaveData.filter((l) => l.overall_status === "rejected");
  const all = leaveData;

  const handleAction = async (id: number, action: "approve" | "reject", req: LeaveRequest) => {
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
        await leaderApproveLeave(id, { status: "rejected", comment: rejectReason });
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
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Nghỉ phép" }]}
      />
      <div className="p-6 space-y-5">
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center text-sm text-slate-400 py-2">Đang tải dữ liệu...</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Chờ duyệt", value: pending.length, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Đã duyệt", value: approved.length, color: "text-green-600", bg: "bg-green-50" },
            { label: "Từ chối", value: rejected.length, color: "text-red-600", bg: "bg-red-50" },
            { label: "Tổng cộng", value: all.length, color: "text-blue-600", bg: "bg-blue-50" },
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
              const data = active === "pending" ? pending : active === "approved" ? approved : active === "rejected" ? rejected : all;
              return <LeaveTable requests={data} onAction={active === "pending" ? handleAction : undefined} />;
            }}
          </Tabs>
        </Card>

        {/* Reject modal */}
        <Modal
          isOpen={rejectModal !== null}
          onClose={() => setRejectModal(null)}
          title="Từ chối đơn nghỉ phép"
          footer={
            <>
              <Button variant="outline" onClick={() => setRejectModal(null)}>Huỷ</Button>
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
            <p className="text-sm text-slate-600">Vui lòng nhập lý do từ chối để nhân viên được biết.</p>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Lý do từ chối <span className="text-red-500">*</span></label>
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
      </div>
    </>
  );
}
