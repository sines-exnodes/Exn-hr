"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import type { Department } from "@/types";

// TODO: connect to real API — GET /departments
const mockDepartments: Department[] = [
  { id: 1, name: "Engineering", description: "Phát triển sản phẩm và hạ tầng kỹ thuật", leader_id: 4, leader_name: "Phạm Quốc Dũng", member_count: 12, created_at: "2019-01-01T00:00:00Z" },
  { id: 2, name: "Sales", description: "Kinh doanh và phát triển khách hàng", leader_id: 3, leader_name: "Lê Minh Châu", member_count: 8, created_at: "2019-01-01T00:00:00Z" },
  { id: 3, name: "HR", description: "Quản lý nhân sự và văn hoá doanh nghiệp", leader_id: 2, leader_name: "Trần Thị Bình", member_count: 5, created_at: "2019-01-01T00:00:00Z" },
  { id: 4, name: "Finance", description: "Tài chính, kế toán và kiểm soát chi phí", leader_id: 5, leader_name: "Hoàng Thị Em", member_count: 6, created_at: "2019-01-01T00:00:00Z" },
  { id: 5, name: "Marketing", description: "Marketing, thương hiệu và nội dung", leader_id: 6, leader_name: "Vũ Thành Giang", member_count: 7, created_at: "2020-03-01T00:00:00Z" },
  { id: 6, name: "Operations", description: "Vận hành và cải tiến quy trình", leader_id: undefined, leader_name: undefined, member_count: 4, created_at: "2021-06-01T00:00:00Z" },
];

const deptColors: Record<number, string> = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-green-100 text-green-700",
  3: "bg-purple-100 text-purple-700",
  4: "bg-yellow-100 text-yellow-700",
  5: "bg-orange-100 text-orange-700",
  6: "bg-slate-100 text-slate-700",
};

const deptIcons: Record<number, React.ReactNode> = {
  1: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  2: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  3: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  4: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  5: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  6: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export default function OrganizationPage() {
  const [selected, setSelected] = useState<Department | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");

  const totalEmployees = mockDepartments.reduce((s, d) => s + d.member_count, 0);

  return (
    <>
      <Header
        title="Tổ chức"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Tổ chức" }]}
      />
      <div className="p-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {mockDepartments.map((dept) => (
            <Card
              key={dept.id}
              padding="sm"
              className="cursor-pointer border-2 transition-colors hover:border-[#22C55E]"
            >
              <button
                className="w-full text-left"
                onClick={() => setSelected(dept)}
              >
                <p className="text-xs text-slate-500">{dept.name}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">{dept.member_count}</p>
                <p className="text-xs text-slate-400">nhân viên</p>
              </button>
            </Card>
          ))}
        </div>

        {/* Org overview */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">
            Tổng cộng: <span className="text-[#22C55E]">{totalEmployees}</span> nhân viên, <span className="text-[#22C55E]">{mockDepartments.length}</span> phòng ban
          </h2>
          <Button
            onClick={() => setCreateOpen(true)}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Tạo phòng ban
          </Button>
        </div>

        {/* Department cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockDepartments.map((dept) => (
            <Card
              key={dept.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <button
                className="w-full text-left"
                onClick={() => setSelected(dept)}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${deptColors[dept.id] ?? "bg-slate-100 text-slate-600"}`}>
                    {deptIcons[dept.id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                      <Badge variant="gray">{dept.member_count} người</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">{dept.description}</p>
                    {dept.leader_name ? (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                          {dept.leader_name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-500">{dept.leader_name}</span>
                        <Badge variant="blue">Trưởng phòng</Badge>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-slate-400 italic">Chưa có trưởng phòng</p>
                    )}
                  </div>
                </div>
              </button>
            </Card>
          ))}
        </div>

        {/* Department detail modal */}
        {selected && (
          <Modal
            isOpen={!!selected}
            onClose={() => setSelected(null)}
            title={`Chi tiết: ${selected.name}`}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Mô tả</p>
                <p className="text-sm text-slate-700">{selected.description || "Chưa có mô tả"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400 mb-1">Số nhân viên</p>
                  <p className="text-2xl font-bold text-slate-800">{selected.member_count}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400 mb-1">Trưởng phòng</p>
                  <p className="text-sm font-semibold text-slate-700">{selected.leader_name ?? "Chưa phân công"}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
                <Button>Xem nhân viên</Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Create department modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Tạo phòng ban mới"
          footer={
            <>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
              <Button onClick={() => setCreateOpen(false)}>Tạo phòng ban</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Tên phòng ban"
              placeholder="VD: Engineering"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Mô tả</label>
              <textarea
                rows={3}
                placeholder="Mô tả ngắn về chức năng phòng ban..."
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
