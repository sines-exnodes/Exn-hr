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
} from "@/types";
import {
  useProjects,
  useProjectMembers,
  useEmployees,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from "@/hooks/useApi";

// ---- Status helpers ----

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; variant: "green" | "blue" | "yellow" }
> = {
  active: { label: "\u0110ang tri\u1ec3n khai", variant: "green" },
  completed: { label: "Ho\u00e0n th\u00e0nh", variant: "blue" },
  on_hold: { label: "T\u1ea1m d\u1eebng", variant: "yellow" },
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

// ---- Role helpers ----

const ROLE_CONFIG: Record<
  ProjectRole,
  {
    label: string;
    variant: "blue" | "green" | "purple" | "yellow" | "orange" | "gray";
  }
> = {
  backend: { label: "Backend", variant: "blue" },
  frontend: { label: "Frontend", variant: "green" },
  mobile: { label: "Mobile", variant: "purple" },
  qa: { label: "QA", variant: "yellow" },
  ba: { label: "BA", variant: "orange" },
  designer: { label: "Designer", variant: "purple" },
  pm: { label: "PM", variant: "gray" },
  devops: { label: "DevOps", variant: "blue" },
};

function RoleBadgeStyled({ role }: { role: ProjectRole }) {
  if (role === "designer") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-100 text-rose-700">
        Designer
      </span>
    );
  }
  if (role === "devops") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700">
        DevOps
      </span>
    );
  }
  const cfg = ROLE_CONFIG[role];
  if (!cfg) return <Badge>{role}</Badge>;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

// ---- Options ----

const statusOptions = [
  { value: "active", label: "\u0110ang tri\u1ec3n khai" },
  { value: "completed", label: "Ho\u00e0n th\u00e0nh" },
  { value: "on_hold", label: "T\u1ea1m d\u1eebng" },
];

const roleOptions: { value: ProjectRole; label: string }[] = [
  { value: "backend", label: "Backend" },
  { value: "frontend", label: "Frontend" },
  { value: "mobile", label: "Mobile" },
  { value: "qa", label: "QA" },
  { value: "ba", label: "BA" },
  { value: "designer", label: "Designer" },
  { value: "pm", label: "PM" },
  { value: "devops", label: "DevOps" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "\u2014";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  } catch {
    return dateStr;
  }
}

export default function ProjectsPage() {
  // ---- Data ----
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

  const { data: employeesRes } = useEmployees({ page: 1, size: 200 });
  const allEmployees = employeesRes?.data ?? [];

  // ---- Search ----
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

  // ---- Modal states ----
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ---- Form state \u2014 Create / Edit ----
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<string>("active");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  // ---- Form state \u2014 Add Member ----
  const [memberEmployeeId, setMemberEmployeeId] = useState("");
  const [memberRole, setMemberRole] = useState<string>("backend");
  const [memberAllocation, setMemberAllocation] = useState("100");

  // ---- Handlers ----

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
      console.error("Create project failed", err);
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
      console.error("Update project failed", err);
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
      console.error("Delete project failed", err);
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
      console.error("Add member failed", err);
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
      console.error("Remove member failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Employees available for adding (not already assigned) ----
  const assignedEmployeeIds = new Set(members.map((m) => m.employee_id));
  const availableEmployees = allEmployees.filter(
    (e) => !assignedEmployeeIds.has(e.id),
  );
  const employeeOptions = availableEmployees.map((e) => ({
    value: String(e.id),
    label: `${e.full_name} \u2014 ${e.position}`,
  }));

  return (
    <>
      <Header
        title="Qu\u1ea3n l\u00fd d\u1ef1 \u00e1n"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "D\u1ef1 \u00e1n" },
        ]}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* ---- Left panel: Project list ---- */}
        <div className="w-[350px] flex-shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800">
              Qu\u1ea3n l\u00fd d\u1ef1 \u00e1n
            </h2>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setCreateOpen(true);
              }}
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
              + Th\u00eam d\u1ef1 \u00e1n
            </Button>
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <Input
              placeholder="T\u00ecm ki\u1ebfm d\u1ef1 \u00e1n..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {isLoading && (
              <p className="text-center text-sm text-slate-400 py-4">
                \u0110ang t\u1ea3i d\u1eef li\u1ec7u...
              </p>
            )}
            {!isLoading && filteredProjects.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">
                {search
                  ? "Kh\u00f4ng t\u00ecm th\u1ea5y d\u1ef1 \u00e1n n\u00e0o."
                  : "Ch\u01b0a c\u00f3 d\u1ef1 \u00e1n n\u00e0o."}
              </p>
            )}
            {filteredProjects.map((project) => {
              const memberCount = project.assignments?.length ?? 0;
              const isSelected = selectedId === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  className={[
                    "w-full text-left rounded-lg border p-3 transition-all cursor-pointer",
                    isSelected
                      ? "border-[#22C55E] bg-green-50/80 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                  ].join(" ")}
                  onClick={() => setSelectedId(project.id)}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-medium text-slate-800 truncate">
                      {project.name}
                    </h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {project.description || "Ch\u01b0a c\u00f3 m\u00f4 t\u1ea3"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{memberCount} th\u00e0nh vi\u00ean</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- Right panel: Project detail ---- */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedProject ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-slate-400">
                  Ch\u1ecdn d\u1ef1 \u00e1n \u0111\u1ec3 xem chi ti\u1ebft
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Project info */}
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
                      {selectedProject.description ||
                        "Ch\u01b0a c\u00f3 m\u00f4 t\u1ea3"}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">
                          B\u1eaft \u0111\u1ea7u:{" "}
                        </span>
                        <span className="font-medium text-slate-700">
                          {formatDate(selectedProject.start_date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">
                          K\u1ebft th\u00fac:{" "}
                        </span>
                        <span className="font-medium text-slate-700">
                          {formatDate(selectedProject.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={openEdit}>
                      S\u1eeda
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Xo\u00e1
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Members section */}
              <Card padding="none">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-semibold text-slate-800">
                    Th\u00e0nh vi\u00ean ({members.length})
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setMemberEmployeeId("");
                      setMemberRole("backend");
                      setMemberAllocation("100");
                      setAddMemberOpen(true);
                    }}
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
                    + Th\u00eam th\u00e0nh vi\u00ean
                  </Button>
                </div>

                {members.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-slate-400">
                    Ch\u01b0a c\u00f3 th\u00e0nh vi\u00ean n\u00e0o trong
                    d\u1ef1 \u00e1n n\u00e0y.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            NV
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Ph\u00f2ng ban
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Vai tr\u00f2
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Ph\u00e2n b\u1ed5
                          </th>
                          <th className="px-4 py-3"></th>
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
                                    {m.employee?.full_name ?? "\u2014"}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {m.employee?.position ?? ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {m.employee?.team?.department?.name ??
                                m.employee?.team?.name ??
                                "\u2014"}
                            </td>
                            <td className="px-4 py-3">
                              <RoleBadgeStyled role={m.role} />
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
                                Xo\u00e1
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ---- Create Project Modal ---- */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Th\u00eam d\u1ef1 \u00e1n m\u1edbi"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Hu\u1ef7
            </Button>
            <Button
              disabled={actionLoading}
              loading={actionLoading}
              onClick={handleCreate}
            >
              T\u1ea1o d\u1ef1 \u00e1n
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="T\u00ean d\u1ef1 \u00e1n"
            placeholder="VD: Website Redesign"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              M\u00f4 t\u1ea3
            </label>
            <textarea
              rows={3}
              placeholder="M\u00f4 t\u1ea3 ng\u1eafn v\u1ec1 d\u1ef1 \u00e1n..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>
          <Select
            label="Tr\u1ea1ng th\u00e1i"
            options={statusOptions}
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ng\u00e0y b\u1eaft \u0111\u1ea7u"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <Input
              label="Ng\u00e0y k\u1ebft th\u00fac"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* ---- Edit Project Modal ---- */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Ch\u1ec9nh s\u1eeda d\u1ef1 \u00e1n"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Hu\u1ef7
            </Button>
            <Button
              disabled={actionLoading}
              loading={actionLoading}
              onClick={handleEdit}
            >
              L\u01b0u thay \u0111\u1ed5i
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="T\u00ean d\u1ef1 \u00e1n"
            placeholder="VD: Website Redesign"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              M\u00f4 t\u1ea3
            </label>
            <textarea
              rows={3}
              placeholder="M\u00f4 t\u1ea3 ng\u1eafn v\u1ec1 d\u1ef1 \u00e1n..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>
          <Select
            label="Tr\u1ea1ng th\u00e1i"
            options={statusOptions}
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ng\u00e0y b\u1eaft \u0111\u1ea7u"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <Input
              label="Ng\u00e0y k\u1ebft th\u00fac"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* ---- Delete Confirmation Modal ---- */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="X\u00e1c nh\u1eadn xo\u00e1"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Hu\u1ef7
            </Button>
            <Button
              variant="danger"
              disabled={actionLoading}
              loading={actionLoading}
              onClick={handleDelete}
            >
              Xo\u00e1 d\u1ef1 \u00e1n
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          B\u1ea1n c\u00f3 ch\u1eafc ch\u1eafn mu\u1ed1n xo\u00e1 d\u1ef1
          \u00e1n <strong>{selectedProject?.name}</strong>? H\u00e0nh
          \u0111\u1ed9ng n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c.
        </p>
      </Modal>

      {/* ---- Add Member Modal ---- */}
      <Modal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Th\u00eam th\u00e0nh vi\u00ean"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Hu\u1ef7
            </Button>
            <Button
              disabled={actionLoading || !memberEmployeeId}
              loading={actionLoading}
              onClick={handleAddMember}
            >
              Th\u00eam
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Nh\u00e2n vi\u00ean"
            options={employeeOptions}
            value={memberEmployeeId}
            onChange={(e) => setMemberEmployeeId(e.target.value)}
            placeholder="Ch\u1ecdn nh\u00e2n vi\u00ean..."
            required
          />
          <Select
            label="Vai tr\u00f2"
            options={roleOptions}
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          />
          <Input
            label="Ph\u00e2n b\u1ed5 (%)"
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
