"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type {
  Project,
  ProjectAssignment,
  ProjectRole,
  ProjectStatus,
  Milestone,
} from "@/types";
import {
  useProjects,
  useProjectMembers,
  useProjectMilestones,
  useEmployees,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  createMilestone,
  deleteMilestone,
} from "@/hooks/useApi";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; variant: "green" | "blue" | "yellow" }
> = {
  active: { label: "Đang triển khai", variant: "green" },
  completed: { label: "Hoàn thành", variant: "blue" },
  on_hold: { label: "Tạm dừng", variant: "yellow" },
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <Badge>{status}</Badge>;
  return (
    <Badge variant={cfg.variant} dot>
      {cfg.label}
    </Badge>
  );
}

const ROLE_CONFIG: Record<
  ProjectRole,
  {
    label: string;
    variant: "blue" | "green" | "purple" | "yellow" | "orange" | "gray" | "red";
  }
> = {
  backend: { label: "Backend", variant: "blue" },
  frontend: { label: "Frontend", variant: "green" },
  fullstack: { label: "Fullstack", variant: "blue" },
  mobile: { label: "Mobile", variant: "purple" },
  qa: { label: "QA", variant: "yellow" },
  qc: { label: "QC", variant: "yellow" },
  ba: { label: "BA", variant: "orange" },
  designer: { label: "Designer", variant: "purple" },
  pm: { label: "PM", variant: "gray" },
  devops: { label: "DevOps", variant: "red" },
};

function RoleBadge({ role }: { role: ProjectRole }) {
  const cfg = ROLE_CONFIG[role];
  if (!cfg) return <Badge>{role}</Badge>;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

const statusOptions = [
  { value: "active", label: "Đang triển khai" },
  { value: "completed", label: "Hoàn thành" },
  { value: "on_hold", label: "Tạm dừng" },
];

const roleOptions: { value: ProjectRole; label: string }[] = [
  { value: "backend", label: "Backend" },
  { value: "frontend", label: "Frontend" },
  { value: "fullstack", label: "Fullstack" },
  { value: "mobile", label: "Mobile" },
  { value: "qa", label: "QA" },
  { value: "qc", label: "QC" },
  { value: "ba", label: "BA" },
  { value: "designer", label: "Designer" },
  { value: "pm", label: "PM" },
  { value: "devops", label: "DevOps" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  } catch {
    return dateStr;
  }
}

export default function ProjectsPage() {
  const {
    data: projectsRes,
    mutate: mutateProjects,
    isLoading,
  } = useProjects();
  const projects: Project[] = projectsRes?.data ?? [];

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;

  const { data: membersRes, mutate: mutateMembers } = useProjectMembers(
    selectedId ?? undefined,
  );
  const members: ProjectAssignment[] = membersRes?.data ?? [];

  const { data: milestonesRes, mutate: mutateMilestones } =
    useProjectMilestones(selectedId ?? undefined);
  const milestones: Milestone[] = milestonesRes?.data ?? [];

  const { data: employeesRes } = useEmployees({ page: 1, size: 200 });
  const allEmployees = employeesRes?.data ?? [];

  const [search, setSearch] = useState("");
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );
  }, [projects, search]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<string>("active");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  const [memberEmployeeId, setMemberEmployeeId] = useState("");
  const [memberRole, setMemberRole] = useState<string>("backend");
  const [memberAllocation, setMemberAllocation] = useState("100");

  // Milestone state
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [msTitle, setMsTitle] = useState("");
  const [msDesc, setMsDesc] = useState("");
  const [msDeadline, setMsDeadline] = useState("");
  const [msItems, setMsItems] = useState<string[]>([""]);
  const [deleteMsId, setDeleteMsId] = useState<number | null>(null);

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormStatus("active");
    setFormStartDate("");
    setFormEndDate("");
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setActionLoading(true);
    try {
      await createProject({
        name: formName,
        description: formDesc || undefined,
        status: formStatus as ProjectStatus,
        start_date: formStartDate || undefined,
        end_date: formEndDate || undefined,
      });
      await mutateProjects();
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = () => {
    if (!selectedProject) return;
    setFormName(selectedProject.name);
    setFormDesc(selectedProject.description ?? "");
    setFormStatus(selectedProject.status);
    setFormStartDate(selectedProject.start_date ?? "");
    setFormEndDate(selectedProject.end_date ?? "");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedProject || !formName.trim()) return;
    setActionLoading(true);
    try {
      await updateProject(selectedProject.id, {
        name: formName,
        description: formDesc || undefined,
        status: formStatus as ProjectStatus,
        start_date: formStartDate || undefined,
        end_date: formEndDate || undefined,
      });
      await mutateProjects();
      setEditOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await deleteProject(selectedProject.id);
      await mutateProjects();
      setSelectedId(null);
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedProject || !memberEmployeeId) return;
    setActionLoading(true);
    try {
      await addProjectMember(selectedProject.id, {
        employee_id: Number(memberEmployeeId),
        role: memberRole as ProjectRole,
        allocation_percentage: Number(memberAllocation) || 100,
      });
      await mutateMembers();
      await mutateProjects();
      setAddMemberOpen(false);
      setMemberEmployeeId("");
      setMemberRole("backend");
      setMemberAllocation("100");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (employeeId: number) => {
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await removeProjectMember(selectedProject.id, employeeId);
      await mutateMembers();
      await mutateProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!selectedProject || !msTitle.trim()) return;
    setActionLoading(true);
    try {
      await createMilestone(selectedProject.id, {
        title: msTitle,
        description: msDesc || undefined,
        deadline: msDeadline || undefined,
        items: msItems
          .filter((t) => t.trim())
          .map((t, i) => ({ content: t, display_order: i + 1 })),
      });
      await mutateMilestones();
      setAddMilestoneOpen(false);
      setMsTitle("");
      setMsDesc("");
      setMsDeadline("");
      setMsItems([""]);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMilestone = async () => {
    if (!deleteMsId) return;
    setActionLoading(true);
    try {
      await deleteMilestone(deleteMsId);
      await mutateMilestones();
      setDeleteMsId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // All employees selectable — one employee can have multiple roles in a project
  const employeeOptions = [
    { value: "", label: "Chọn nhân viên..." },
    ...allEmployees.map((e) => ({
      value: String(e.id),
      label: `${e.full_name} — ${e.user?.role ?? ""}`,
    })),
  ];

  return (
    <>
      <Header
        title="Quản lý dự án"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Dự án" }]}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[350px] flex-shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800">Dự án</h2>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setCreateOpen(true);
              }}
            >
              + Thêm dự án
            </Button>
          </div>
          <div className="px-4 py-3">
            <Input
              placeholder="Tìm kiếm dự án..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {isLoading && (
              <p className="text-center text-sm text-slate-400 py-4">
                Đang tải...
              </p>
            )}
            {!isLoading && filteredProjects.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">
                {search ? "Không tìm thấy dự án nào." : "Chưa có dự án nào."}
              </p>
            )}
            {filteredProjects.map((project) => {
              const memberCount = project.assignments?.length ?? 0;
              const isSelected = selectedId === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer ${isSelected ? "border-[#22C55E] bg-green-50/80 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}
                  onClick={() => setSelectedId(project.id)}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-medium text-slate-800 truncate">
                      {project.name}
                    </h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {project.description || "Chưa có mô tả"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {memberCount} thành viên
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedProject ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-400">
                Chọn dự án để xem chi tiết
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-slate-800">
                        {selectedProject.name}
                      </h2>
                      <StatusBadge status={selectedProject.status} />
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      {selectedProject.description || "Chưa có mô tả"}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Bắt đầu: </span>
                        <span className="font-medium text-slate-700">
                          {formatDate(selectedProject.start_date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Kết thúc: </span>
                        <span className="font-medium text-slate-700">
                          {formatDate(selectedProject.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={openEdit}>
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Xoá
                    </Button>
                  </div>
                </div>
              </Card>

              <Card padding="none">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-semibold text-slate-800">
                    Thành viên ({members.length})
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setMemberEmployeeId("");
                      setMemberRole("backend");
                      setMemberAllocation("100");
                      setAddMemberOpen(true);
                    }}
                  >
                    + Thêm thành viên
                  </Button>
                </div>
                {members.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-slate-400">
                    Chưa có thành viên nào trong dự án này.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Nhân viên
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Phòng ban
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Vai trò
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Phân bổ
                          </th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {members.map((m) => (
                          <tr
                            key={m.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E]/10 text-xs font-semibold text-[#22C55E]">
                                  {m.employee?.full_name?.charAt(0) ?? "?"}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 text-sm">
                                    {m.employee?.full_name ?? "—"}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {m.employee?.user?.role ?? ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {m.employee?.department?.name ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <RoleBadge role={m.role} />
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 font-medium tabular-nums">
                              {m.allocation_percentage}%
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                disabled={actionLoading}
                                onClick={() =>
                                  handleRemoveMember(m.employee_id)
                                }
                              >
                                Xoá
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Milestones */}
              <Card padding="none">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-semibold text-slate-800">
                    Cột mốc ({milestones.length})
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setMsTitle("");
                      setMsDesc("");
                      setMsDeadline("");
                      setMsItems([""]);
                      setAddMilestoneOpen(true);
                    }}
                  >
                    + Thêm cột mốc
                  </Button>
                </div>
                {milestones.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-slate-400">
                    Chưa có cột mốc nào.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {milestones.map((ms) => {
                      const totalItems = ms.items?.length ?? 0;
                      const doneItems =
                        ms.items?.filter((i) => i.is_completed).length ?? 0;
                      const statusColor =
                        ms.status === "completed"
                          ? "green"
                          : ms.status === "overdue"
                            ? "red"
                            : ms.status === "in_progress"
                              ? "blue"
                              : "yellow";
                      const statusLabel =
                        ms.status === "completed"
                          ? "Hoàn thành"
                          : ms.status === "overdue"
                            ? "Quá hạn"
                            : ms.status === "in_progress"
                              ? "Đang thực hiện"
                              : "Sắp tới";
                      return (
                        <div
                          key={ms.id}
                          className="px-6 py-4 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-800 text-sm">
                                  {ms.title}
                                </h4>
                                <Badge variant={statusColor as any}>
                                  {statusLabel}
                                </Badge>
                              </div>
                              {ms.description && (
                                <p className="text-xs text-slate-500 mb-2">
                                  {ms.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                {ms.deadline && (
                                  <span>Hạn: {formatDate(ms.deadline)}</span>
                                )}
                                {totalItems > 0 && (
                                  <span>
                                    {doneItems}/{totalItems} hoàn thành
                                  </span>
                                )}
                              </div>
                              {totalItems > 0 && (
                                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#22C55E] transition-all"
                                    style={{
                                      width: `${totalItems > 0 ? (doneItems / totalItems) * 100 : 0}%`,
                                    }}
                                  />
                                </div>
                              )}
                              {(ms.items?.length ?? 0) > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {ms.items!.map((item) => (
                                    <li
                                      key={item.id}
                                      className="flex items-center gap-2 text-xs text-slate-600"
                                    >
                                      <span
                                        className={
                                          item.is_completed
                                            ? "text-green-500"
                                            : "text-slate-300"
                                        }
                                      >
                                        {item.is_completed ? "✓" : "○"}
                                      </span>
                                      <span
                                        className={
                                          item.is_completed
                                            ? "line-through text-slate-400"
                                            : ""
                                        }
                                      >
                                        {item.content}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <button
                              type="button"
                              className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                              onClick={() => setDeleteMsId(ms.id)}
                            >
                              Xoá
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Thêm dự án mới"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Huỷ
            </Button>
            <Button loading={actionLoading} onClick={handleCreate}>
              Tạo dự án
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tên dự án"
            placeholder="VD: Website Redesign"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              rows={3}
              placeholder="Mô tả ngắn về dự án..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>
          <Select
            label="Trạng thái"
            options={statusOptions}
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Chỉnh sửa dự án"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Huỷ
            </Button>
            <Button loading={actionLoading} onClick={handleEdit}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tên dự án"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>
          <Select
            label="Trạng thái"
            options={statusOptions}
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Xác nhận xoá"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              loading={actionLoading}
              onClick={handleDelete}
            >
              Xoá dự án
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc chắn muốn xoá dự án{" "}
          <strong>{selectedProject?.name}</strong>? Hành động này không thể hoàn
          tác.
        </p>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={addMilestoneOpen}
        onClose={() => setAddMilestoneOpen(false)}
        title="Thêm cột mốc"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setAddMilestoneOpen(false)}
            >
              Huỷ
            </Button>
            <Button loading={actionLoading} onClick={handleAddMilestone}>
              Tạo cột mốc
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            placeholder="VD: Release v1.0"
            value={msTitle}
            onChange={(e) => setMsTitle(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              rows={2}
              placeholder="Mô tả ngắn..."
              value={msDesc}
              onChange={(e) => setMsDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>
          <Input
            label="Hạn hoàn thành"
            type="date"
            value={msDeadline}
            onChange={(e) => setMsDeadline(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Checklist items
            </label>
            {msItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder={`Item ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const next = [...msItems];
                    next[idx] = e.target.value;
                    setMsItems(next);
                  }}
                />
                {msItems.length > 1 && (
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-600 text-sm"
                    onClick={() =>
                      setMsItems(msItems.filter((_, i) => i !== idx))
                    }
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-[#22C55E] hover:underline self-start mt-1"
              onClick={() => setMsItems([...msItems, ""])}
            >
              + Thêm item
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Milestone Modal */}
      <Modal
        isOpen={deleteMsId !== null}
        onClose={() => setDeleteMsId(null)}
        title="Xoá cột mốc"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteMsId(null)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              loading={actionLoading}
              onClick={handleDeleteMilestone}
            >
              Xoá
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xoá cột mốc này? Hành động không thể hoàn tác.
        </p>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Thêm thành viên"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Huỷ
            </Button>
            <Button
              loading={actionLoading}
              disabled={!memberEmployeeId}
              onClick={handleAddMember}
            >
              Thêm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Nhân viên"
            options={employeeOptions}
            value={memberEmployeeId}
            onChange={(e) => setMemberEmployeeId(e.target.value)}
          />
          <Select
            label="Vai trò"
            options={roleOptions}
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          />
          <Input
            label="Phân bổ (%)"
            type="number"
            min={1}
            max={100}
            value={memberAllocation}
            onChange={(e) => setMemberAllocation(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
