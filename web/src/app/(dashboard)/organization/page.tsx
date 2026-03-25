"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import type { Department, Team } from "@/types";
import { useDepartments, createDepartment, deleteDepartment } from "@/hooks/useApi";

const DEPT_COLOR_CLASSES = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-yellow-100 text-yellow-700",
  "bg-orange-100 text-orange-700",
  "bg-slate-100 text-slate-700",
];

const DEPT_ICONS: React.ReactNode[] = [
  <svg key="1" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  <svg key="2" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  <svg key="3" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  <svg key="4" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key="5" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  <svg key="6" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
];

function deptStyleIndex(id: number) {
  return Math.abs(id - 1) % DEPT_COLOR_CLASSES.length;
}

/** Tổng nhân viên: cộng members[] của từng team (API đã preload). */
function getMemberCount(dept: Department): number {
  return dept.teams?.reduce((s, t) => s + (t.members?.length ?? 0), 0) ?? 0;
}

function getTeamCount(dept: Department): number {
  return dept.teams?.length ?? 0;
}

function getTeamMemberCount(team: Team): number {
  return team.members?.length ?? 0;
}

/** Một dòng mô tả nhanh trên thẻ: trưởng nhóm từng team (không gộp thành “trưởng phòng”). */
function getDepartmentLeaderSummary(dept: Department): string | null {
  const teams = dept.teams ?? [];
  if (teams.length === 0) return null;
  const withLeader = teams.filter((t) => t.leader?.full_name);
  if (withLeader.length === 0) return null;
  if (teams.length === 1 && withLeader[0]?.leader?.full_name) {
    return withLeader[0].leader!.full_name;
  }
  if (withLeader.length === 1) {
    return `${withLeader[0].leader!.full_name} · ${teams.length} nhóm`;
  }
  return `${withLeader.length} trưởng nhóm · ${teams.length} nhóm`;
}

function TeamsDetailTable({ dept }: { dept: Department }) {
  const teams = dept.teams ?? [];
  if (teams.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
        Chưa có nhóm (team) nào trong phòng ban này.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Nhóm (team)</th>
            <th className="px-3 py-2">Trưởng nhóm</th>
            <th className="px-3 py-2 text-right">Thành viên</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {teams.map((t) => (
            <tr key={t.id} className="bg-white">
              <td className="px-3 py-2 font-medium text-slate-800">{t.name}</td>
              <td className="px-3 py-2 text-slate-600">{t.leader?.full_name ?? "—"}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700">{getTeamMemberCount(t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OrganizationPage() {
  const { data: response, mutate, isLoading } = useDepartments();
  const [selected, setSelected] = useState<Department | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const departments = response?.data ?? [];

  const totalEmployees = departments.reduce((s, d) => s + getMemberCount(d), 0);

  const handleCreate = async () => {
    if (!deptName.trim()) return;
    setActionLoading(true);
    try {
      await createDepartment({ name: deptName, description: deptDesc || undefined });
      await mutate();
      setCreateOpen(false);
      setDeptName("");
      setDeptDesc("");
    } catch (err) {
      console.error("Create department failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(true);
    try {
      await deleteDepartment(id);
      await mutate();
      setSelected(null);
    } catch (err) {
      console.error("Delete department failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Tổ chức"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Tổ chức" }]}
      />
      <div className="p-6 space-y-6">
        {isLoading && (
          <div className="text-center text-sm text-slate-400 py-2">Đang tải dữ liệu...</div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {departments.map((dept) => {
            const memberCount = getMemberCount(dept);
            const teamCount = getTeamCount(dept);
            return (
              <Card
                key={dept.id}
                padding="none"
                className="border-2 transition-colors hover:border-[#22C55E] overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full cursor-pointer px-4 py-3 text-left"
                  onClick={() => setSelected(dept)}
                >
                  <p className="text-xs text-slate-500">{dept.name}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">{memberCount}</p>
                  <p className="text-xs text-slate-400">nhân viên</p>
                  <p className="mt-1 text-[11px] text-slate-400">{teamCount} nhóm</p>
                </button>
                <Link
                  href={`/employees?department_id=${dept.id}`}
                  className="block border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-center text-xs font-medium text-[#22C55E] hover:bg-green-50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Xem danh sách →
                </Link>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">
            Tổng cộng: <span className="text-[#22C55E]">{totalEmployees}</span> nhân viên, <span className="text-[#22C55E]">{departments.length}</span> phòng ban
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const memberCount = getMemberCount(dept);
            const teamCount = getTeamCount(dept);
            const leaderSummary = getDepartmentLeaderSummary(dept);
            const vi = deptStyleIndex(dept.id);
            return (
              <Card
                key={dept.id}
                padding="none"
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <button
                  type="button"
                  className="w-full cursor-pointer p-5 text-left"
                  onClick={() => setSelected(dept)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${DEPT_COLOR_CLASSES[vi]}`}
                    >
                      {DEPT_ICONS[vi]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                        <Badge variant="gray">{memberCount} người</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {teamCount} nhóm (team)
                        {teamCount > 0 && memberCount === 0 && (
                          <span className="ml-1 text-amber-600">· chưa gán thành viên vào nhóm</span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">{dept.description || "—"}</p>
                      {leaderSummary ? (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                            {leaderSummary.charAt(0)}
                          </div>
                          <span className="text-xs text-slate-500 truncate">{leaderSummary}</span>
                          <Badge variant="blue">Trưởng nhóm</Badge>
                        </div>
                      ) : teamCount > 0 ? (
                        <p className="mt-3 text-xs text-slate-400 italic">Các nhóm chưa có trưởng nhóm</p>
                      ) : (
                        <p className="mt-3 text-xs text-slate-400 italic">Chưa có nhóm trong phòng ban</p>
                      )}
                    </div>
                  </div>
                </button>
                <Link
                  href={`/employees?department_id=${dept.id}`}
                  className="flex items-center justify-center gap-1 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-[#22C55E] hover:bg-green-50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Danh sách nhân viên
                  <span aria-hidden>→</span>
                </Link>
              </Card>
            );
          })}
        </div>

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

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Các nhóm & nhân sự (theo API)</p>
                <TeamsDetailTable dept={selected} />
              </div>

              <p className="text-xs text-slate-500">
                Số nhân viên là tổng <strong>members</strong> của các team thuộc phòng ban. Nhân viên chưa gán team
                không nằm trong tổng này — xem đầy đủ khi lọc trang Nhân viên theo phòng ban.
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Link
                  href={`/employees?department_id=${selected.id}`}
                  className="rounded-lg bg-slate-50 p-4 transition-colors hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
                >
                  <p className="text-xs text-slate-400 mb-1">Tổng nhân viên (trong các team)</p>
                  <p className="text-2xl font-bold text-slate-800">{getMemberCount(selected)}</p>
                  <p className="mt-2 text-xs font-medium text-[#22C55E]">Mở danh sách Nhân viên →</p>
                </Link>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400 mb-1">Số nhóm (team)</p>
                  <p className="text-2xl font-bold text-slate-800">{getTeamCount(selected)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-400 mb-1">Trưởng nhóm (tóm tắt)</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {getDepartmentLeaderSummary(selected) ?? "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="danger" disabled={actionLoading} onClick={() => handleDelete(selected.id)}>
                  Xoá phòng ban
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Đóng
                </Button>
                <Link href={`/employees?department_id=${selected.id}`}>
                  <Button>Xem nhân viên</Button>
                </Link>
              </div>
            </div>
          </Modal>
        )}

        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Tạo phòng ban mới"
          footer={
            <>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Huỷ
              </Button>
              <Button disabled={actionLoading} onClick={handleCreate}>
                Tạo phòng ban
              </Button>
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
