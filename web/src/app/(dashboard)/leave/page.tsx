"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import type { LeaveRequest } from "@/types";

// TODO: connect to real API — GET /leave
const mockLeave: LeaveRequest[] = [
  { id: 1, employee_id: 1, employee_name: "Nguyễn Văn An", department_name: "Engineering", leave_type: "annual", start_date: "2026-03-22", end_date: "2026-03-23", days: 2, reason: "Việc gia đình", status: "pending", created_at: "2026-03-19T09:00:00Z" },
  { id: 2, employee_id: 2, employee_name: "Trần Thị Bình", department_name: "HR", leave_type: "sick", start_date: "2026-03-20", end_date: "2026-03-20", days: 1, reason: "Bị ốm", status: "leader_approved", leader_approved_at: "2026-03-19T11:00:00Z", created_at: "2026-03-18T14:00:00Z" },
  { id: 3, employee_id: 3, employee_name: "Lê Minh Châu", department_name: "Sales", leave_type: "annual", start_date: "2026-03-25", end_date: "2026-03-26", days: 2, reason: "Du lịch gia đình", status: "pending", created_at: "2026-03-17T10:00:00Z" },
  { id: 4, employee_id: 4, employee_name: "Phạm Quốc Dũng", department_name: "Engineering", leave_type: "annual", start_date: "2026-03-01", end_date: "2026-03-02", days: 2, reason: "Nghỉ lễ", status: "approved", leader_approved_at: "2026-02-28T10:00:00Z", hr_approved_at: "2026-02-28T14:00:00Z", created_at: "2026-02-26T00:00:00Z" },
  { id: 5, employee_id: 5, employee_name: "Hoàng Thị Em", department_name: "Finance", leave_type: "sick", start_date: "2026-02-15", end_date: "2026-02-15", days: 1, reason: "Sức khoẻ", status: "rejected", rejected_reason: "Không đủ giấy tờ bác sĩ", created_at: "2026-02-14T00:00:00Z" },
  { id: 6, employee_id: 6, employee_name: "Vũ Thành Giang", department_name: "Marketing", leave_type: "unpaid", start_date: "2026-04-01", end_date: "2026-04-03", days: 3, reason: "Chuyện cá nhân", status: "pending", created_at: "2026-03-18T08:00:00Z" },
];

const leaveTypeLabel: Record<string, string> = {
  annual: "Phép năm",
  sick: "Phép bệnh",
  unpaid: "Không lương",
  other: "Khác",
};

function LeaveTable({ requests, onAction }: { requests: LeaveRequest[]; onAction?: (id: number, action: "approve" | "reject") => void }) {
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
            {["Nhân viên", "Phòng ban", "Loại", "Từ ngày", "Đến ngày", "Số ngày", "Lý do", "Trạng thái", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                    {req.employee_name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{req.employee_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{req.department_name}</td>
              <td className="px-4 py-3">
                <Badge variant="blue">{leaveTypeLabel[req.leave_type]}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{req.start_date}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{req.end_date}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">{req.days}</td>
              <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{req.reason}</td>
              <td className="px-4 py-3">{statusBadge(req.status)}</td>
              <td className="px-4 py-3">
                {(req.status === "pending" || req.status === "leader_approved") && onAction && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => onAction(req.id, "approve")}
                    >
                      Duyệt
                    </Button>
                    <Button
                      size="xs"
                      variant="danger"
                      onClick={() => onAction(req.id, "reject")}
                    >
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

export default function LeavePage() {
  const [rejectModal, setRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = mockLeave.filter((l) => l.status === "pending" || l.status === "leader_approved");
  const approved = mockLeave.filter((l) => l.status === "approved");
  const rejected = mockLeave.filter((l) => l.status === "rejected");
  const all = mockLeave;

  const handleAction = (id: number, action: "approve" | "reject") => {
    if (action === "reject") {
      setRejectModal(id);
    } else {
      // TODO: connect to real API — PATCH /leave/:id/approve
      console.log("Approve", id);
    }
  };

  return (
    <>
      <Header
        title="Nghỉ phép"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Nghỉ phép" }]}
      />
      <div className="p-6 space-y-5">
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
                onClick={() => {
                  // TODO: connect to real API — PATCH /leave/:id/reject
                  console.log("Reject", rejectModal, rejectReason);
                  setRejectModal(null);
                  setRejectReason("");
                }}
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
