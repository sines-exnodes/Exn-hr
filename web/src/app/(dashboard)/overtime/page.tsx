"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import type { OvertimeRequest } from "@/types";

// TODO: connect to real API — GET /overtime
const mockOT: OvertimeRequest[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", date: "2026-03-18", start_time: "17:30", end_time: "20:30", hours: 3, reason: "Hoàn thiện tính năng release", status: "pending", rate: 1.5, amount: 281250, created_at: "2026-03-18T21:00:00Z" },
  { id: 2, employee_id: 4, employee_name: "Phạm Quốc Dũng", department_name: "Engineering", date: "2026-03-17", start_time: "18:00", end_time: "21:00", hours: 3, reason: "Triển khai hệ thống", status: "leader_approved", leader_approved_at: "2026-03-18T09:00:00Z", rate: 1.5, amount: 562500, created_at: "2026-03-17T22:00:00Z" },
  { id: 3, employee_id: 2, employee_name: "Trần Thị Bình", department_name: "HR", date: "2026-03-15", start_time: "17:30", end_time: "19:30", hours: 2, reason: "Xử lý tài liệu hợp đồng", status: "ceo_approved", leader_approved_at: "2026-03-16T09:00:00Z", ceo_approved_at: "2026-03-16T14:00:00Z", rate: 1.5, amount: 187500, created_at: "2026-03-15T20:00:00Z" },
  { id: 4, employee_id: 6, employee_name: "Vũ Thành Giang", department_name: "Marketing", date: "2026-03-10", start_time: "18:00", end_time: "20:00", hours: 2, reason: "Chuẩn bị tài liệu pitch", status: "rejected", rejected_reason: "Chưa có kế hoạch OT được duyệt trước", rate: 1.5, amount: 137500, created_at: "2026-03-10T21:00:00Z" },
  { id: 5, employee_id: 8, employee_name: "Bùi Văn Khoa", department_name: "Engineering", date: "2026-03-19", start_time: "17:30", end_time: "21:30", hours: 4, reason: "Bug fix khẩn cấp production", status: "pending", rate: 1.5, amount: 350000, created_at: "2026-03-19T22:00:00Z" },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

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
            {["Nhân viên", "Phòng ban", "Ngày", "Giờ", "Số giờ", "Lý do", "Thành tiền", "Trạng thái", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {requests.map((ot) => (
            <tr key={ot.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                    {ot.employee_name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{ot.employee_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{ot.department_name}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{ot.date}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{ot.start_time} – {ot.end_time}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">{ot.hours}h</td>
              <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{ot.reason}</td>
              <td className="px-4 py-3 text-sm font-medium text-slate-700">{formatCurrency(ot.amount)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  {statusBadge(ot.status)}
                  {ot.status === "leader_approved" && (
                    <span className="text-xs text-slate-400">Level 1 ✓</span>
                  )}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OvertimePage() {
  const [rejectId, setRejectId] = useState<number | null>(null);

  const leaderPending = mockOT.filter((o) => o.status === "pending");
  const ceoPending = mockOT.filter((o) => o.status === "leader_approved");
  const approved = mockOT.filter((o) => o.status === "ceo_approved");
  const rejected = mockOT.filter((o) => o.status === "rejected");
  const all = mockOT;

  const totalAmount = approved.reduce((s, o) => s + o.amount, 0);
  const totalHours = approved.reduce((s, o) => s + o.hours, 0);

  return (
    <>
      <Header
        title="Overtime"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Overtime" }]}
      />
      <div className="p-6 space-y-5">
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
                    onApprove={(id) => console.log("Leader approve", id)}
                    onReject={(id) => setRejectId(id)}
                  />
                );
              }
              if (active === "ceo") {
                return (
                  <OTTable
                    requests={ceoPending}
                    stage="ceo"
                    onApprove={(id) => console.log("CEO approve", id)}
                    onReject={(id) => setRejectId(id)}
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
              <Button variant="danger" onClick={() => {
                // TODO: connect to real API — PATCH /overtime/:id/reject
                setRejectId(null);
              }}>
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>
        </Modal>
      </div>
    </>
  );
}
