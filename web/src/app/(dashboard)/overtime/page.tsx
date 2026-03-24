"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import type { OvertimeRequest } from "@/types";
import { useOvertimeRequests, leaderApproveOT, ceoApproveOT, cancelOvertime } from "@/hooks/useApi";

const mockOT: OvertimeRequest[] = [
  { id: 1, employee_id: 1, date: "2026-03-18", start_time: "17:30", end_time: "20:30", hours: 3, reason: "Hoàn thiện tính năng release", leader_status: "pending", ceo_status: "pending", overall_status: "pending", created_at: "2026-03-18T21:00:00Z" },
  { id: 2, employee_id: 4, date: "2026-03-17", start_time: "18:00", end_time: "21:00", hours: 3, reason: "Triển khai hệ thống", leader_status: "approved", ceo_status: "pending", overall_status: "pending", created_at: "2026-03-17T22:00:00Z" },
  { id: 3, employee_id: 2, date: "2026-03-15", start_time: "17:30", end_time: "19:30", hours: 2, reason: "Xử lý tài liệu hợp đồng", leader_status: "approved", ceo_status: "approved", overall_status: "approved", created_at: "2026-03-15T20:00:00Z" },
  { id: 4, employee_id: 6, date: "2026-03-10", start_time: "18:00", end_time: "20:00", hours: 2, reason: "Chuẩn bị tài liệu pitch", leader_status: "approved", ceo_status: "rejected", overall_status: "rejected", created_at: "2026-03-10T21:00:00Z" },
  { id: 5, employee_id: 8, date: "2026-03-19", start_time: "17:30", end_time: "21:30", hours: 4, reason: "Bug fix khẩn cấp production", leader_status: "pending", ceo_status: "pending", overall_status: "pending", created_at: "2026-03-19T22:00:00Z" },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

function calcOTAmount(ot: OvertimeRequest): number {
  const basicSalary = ot.employee?.basic_salary ?? 0;
  if (basicSalary === 0) return 0;
  return ot.hours * (basicSalary / 26 / 8) * 1.5;
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
    return <div className="py-10 text-center text-sm text-slate-400">Không có yêu cầu OT nào.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            {["Nhân viên", "Ngày", "Giờ", "Số giờ", "Lý do", "Thành tiền", "Leader", "CEO", "Trạng thái", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {requests.map((ot) => {
            const employeeName = ot.employee?.full_name ?? `NV #${ot.employee_id}`;
            const amount = calcOTAmount(ot);
            return (
              <tr key={ot.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                      {employeeName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{employeeName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{ot.date}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{ot.start_time} – {ot.end_time}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700">{ot.hours}h</td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{ot.reason}</td>
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
                      <Button size="xs" variant="primary" onClick={() => onApprove(ot.id)}>
                        Duyệt
                      </Button>
                      <Button size="xs" variant="danger" onClick={() => onReject(ot.id)}>
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

export default function OvertimePage() {
  const { data: response, mutate, isLoading } = useOvertimeRequests();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectStage, setRejectStage] = useState<"leader" | "ceo">("leader");
  const [actionLoading, setActionLoading] = useState(false);

  const otData = response?.data ?? mockOT;

  const leaderPending = otData.filter((o) => o.leader_status === "pending");
  const ceoPending = otData.filter((o) => o.leader_status === "approved" && o.ceo_status === "pending");
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
        await leaderApproveOT(rejectId, { status: "rejected", comment: rejectReason });
      } else {
        await ceoApproveOT(rejectId, { status: "rejected", comment: rejectReason });
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

  return (
    <>
      <Header
        title="Overtime"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Overtime" }]}
      />
      <div className="p-6 space-y-5">
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center text-sm text-slate-400 py-2">Đang tải dữ liệu...</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <p className="text-xs text-slate-400">Chờ Leader duyệt</p>
            <p className="mt-1 text-3xl font-bold text-yellow-600">{leaderPending.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-400">Chờ CEO duyệt</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{ceoPending.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-400">Tổng giờ OT (đã duyệt)</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{totalHours}h</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-400">Tổng chi phí OT</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{formatCurrency(totalAmount)}</p>
          </Card>
        </div>

        {/* 2-level approval info */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-700">Quy trình phê duyệt 2 cấp</p>
              <p className="text-xs text-blue-600 mt-1">
                Yêu cầu OT cần được <strong>Leader</strong> phê duyệt trước, sau đó <strong>CEO</strong> phê duyệt lần cuối. Tỷ lệ OT cố định x1.5.
              </p>
            </div>
          </div>
        </div>

        <Card padding="none">
          <Tabs
            tabs={[
              { id: "leader", label: "Chờ Leader duyệt", badge: leaderPending.length },
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
                    onReject={(id) => { setRejectStage("leader"); setRejectId(id); }}
                  />
                );
              }
              if (active === "ceo") {
                return (
                  <OTTable
                    requests={ceoPending}
                    stage="ceo"
                    onApprove={(id) => handleApprove(id, "ceo")}
                    onReject={(id) => { setRejectStage("ceo"); setRejectId(id); }}
                  />
                );
              }
              const data = active === "approved" ? approved : active === "rejected" ? rejected : all;
              return <OTTable requests={data} />;
            }}
          </Tabs>
        </Card>

        {/* Reject modal */}
        <Modal
          isOpen={rejectId !== null}
          onClose={() => setRejectId(null)}
          title="Từ chối yêu cầu OT"
          footer={
            <>
              <Button variant="outline" onClick={() => setRejectId(null)}>Huỷ</Button>
              <Button variant="danger" disabled={actionLoading} onClick={handleReject}>
                Xác nhận từ chối
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-600">Nhập lý do từ chối yêu cầu làm thêm giờ:</p>
            <textarea
              rows={3}
              placeholder="Lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>
        </Modal>
      </div>
    </>
  );
}
