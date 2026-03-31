"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { MilestoneTable } from "@/components/projects/MilestoneTable";
import { AddMilestoneModal } from "@/components/projects/AddMilestoneModal";
import {
  useProject,
  useProjectMembersList,
  useProjectMilestones,
  useEmployees,
  addProjectMemberV2,
  removeProjectMember,
  deleteMilestone,
  updateMilestone,
} from "@/hooks/useApi";
import type {
  Milestone,
  MilestoneItem,
  ProjectMemberRole,
  ProjectStatus,
} from "@/types";

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: "green" | "yellow" | "gray" }
> = {
  active: { label: "Đang hoạt động", variant: "green" },
  completed: { label: "Hoàn thành", variant: "gray" },
  on_hold: { label: "Tạm dừng", variant: "yellow" },
};

const roleLabels: Record<string, string> = {
  pm: "PM",
  ba: "BA",
  dev: "Developer",
  backend: "Backend",
  frontend: "Frontend",
  fullstack: "Fullstack",
  mobile: "Mobile",
  qa: "QA",
  qc: "QC",
  tester: "Tester",
  designer: "Designer",
  devops: "DevOps",
  other: "Khác",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const { data: projectRes, isLoading: loadingProject } = useProject(projectId);
  const { data: membersRes, mutate: mutateMembers } =
    useProjectMembersList(projectId);
  const { data: milestonesRes, mutate: mutateMilestones } =
    useProjectMilestones(projectId);
  const { data: employeesRes } = useEmployees({ size: 100 });

  const project = projectRes?.data;
  const members = membersRes?.data ?? [];
  const milestones = milestonesRes?.data ?? [];
  const employees = employeesRes?.data ?? [];

  const [addMemberEmployeeId, setAddMemberEmployeeId] = useState("");
  const [addMemberRole, setAddMemberRole] = useState<ProjectMemberRole>("dev");
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");

  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const memberEmployeeIds = new Set(members.map((m) => m.employee_id));
  const availableEmployees = employees.filter(
    (e) => !memberEmployeeIds.has(e.id),
  );

  const handleAddMember = async () => {
    if (!addMemberEmployeeId) {
      setAddMemberError("Vui lòng chọn nhân viên.");
      return;
    }
    setAddMemberError("");
    setAddMemberLoading(true);
    try {
      await addProjectMemberV2(projectId, {
        employee_id: parseInt(addMemberEmployeeId),
        role: addMemberRole,
      });
      await mutateMembers();
      setAddMemberEmployeeId("");
      setAddMemberRole("dev");
    } catch (err) {
      setAddMemberError(
        err instanceof Error ? err.message : "Thêm thành viên thất bại.",
      );
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleRemoveMember = async (employeeId: number) => {
    try {
      await removeProjectMember(projectId, employeeId);
      await mutateMembers();
    } catch {
      // silently ignore
    }
  };

  const handleDeleteMilestone = async () => {
    if (!deletingMilestone) return;
    setDeleteLoading(true);
    try {
      await deleteMilestone(deletingMilestone.id);
      await mutateMilestones();
      setDeletingMilestone(null);
    } catch {
      // silently ignore
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleItem = async (milestoneId: number, item: MilestoneItem) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;
    const updatedItems = (milestone.items ?? []).map((i) =>
      i.id === item.id ? { ...i, is_completed: !i.is_completed } : i,
    );
    try {
      await updateMilestone(milestoneId, {
        items: updatedItems.map((i, idx) => ({
          id: i.id,
          content: i.content,
          is_completed: i.is_completed,
          display_order: idx + 1,
        })),
      });
      await mutateMilestones();
    } catch {
      // silently ignore
    }
  };

  if (loadingProject) {
    return (
      <>
        <Header
          title="Dự án"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Dự án", href: "/projects" },
            { label: "Chi tiết" },
          ]}
        />
        <div className="p-6 text-center text-sm text-slate-400">
          Đang tải...
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header
          title="Dự án"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Dự án", href: "/projects" },
            { label: "Không tìm thấy" },
          ]}
        />
        <div className="p-6 text-center text-sm text-slate-500">
          Không tìm thấy dự án.
        </div>
      </>
    );
  }

  const statusCfg = statusConfig[project.status];

  return (
    <>
      <Header
        title={project.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Dự án", href: "/projects" },
          { label: project.name },
        ]}
      />
      <div className="p-6 space-y-6">
        <Card padding="none">
          <Tabs
            tabs={[
              { id: "overview", label: "Tổng quan" },
              { id: "members", label: "Thành viên", badge: members.length },
              { id: "milestones", label: "Cột mốc", badge: milestones.length },
            ]}
          >
            {(active) => {
              if (active === "overview") {
                return (
                  <div className="p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                          {project.name}
                        </h2>
                        {project.description && (
                          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-2xl">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusCfg.variant}>
                        {statusCfg.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {[
                        {
                          label: "Ngày bắt đầu",
                          value: formatDate(project.start_date),
                        },
                        {
                          label: "Ngày kết thúc",
                          value: formatDate(project.end_date),
                        },
                        { label: "Thành viên", value: String(members.length) },
                        { label: "Cột mốc", value: String(milestones.length) },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="mt-1 text-lg font-semibold text-slate-800">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (active === "members") {
                return (
                  <div className="p-6 space-y-5">
                    {/* Add member */}
                    <div className="flex items-end gap-3 flex-wrap">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">
                          Thêm thành viên
                        </label>
                        <select
                          value={addMemberEmployeeId}
                          onChange={(e) =>
                            setAddMemberEmployeeId(e.target.value)
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[200px]"
                        >
                          <option value="">-- Chọn nhân viên --</option>
                          {availableEmployees.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">
                          Vai trò
                        </label>
                        <select
                          value={addMemberRole}
                          onChange={(e) =>
                            setAddMemberRole(
                              e.target.value as ProjectMemberRole,
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        variant="primary"
                        loading={addMemberLoading}
                        onClick={handleAddMember}
                      >
                        Thêm
                      </Button>
                    </div>
                    {addMemberError && (
                      <p className="text-sm text-red-500">{addMemberError}</p>
                    )}

                    {/* Members list */}
                    {members.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-400">
                        Chưa có thành viên nào.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              {[
                                "Nhân viên",
                                "Vai trò",
                                "Ngày tham gia",
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
                            {members.map((member) => (
                              <tr
                                key={member.id}
                                className="hover:bg-slate-50/50 transition-colors"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-600">
                                      {(
                                        member.employee?.full_name ?? "?"
                                      ).charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">
                                      {member.employee?.full_name ??
                                        `NV #${member.employee_id}`}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant="blue">
                                    {roleLabels[member.role] ?? member.role}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500">
                                  {formatDate(member.start_date)}
                                </td>
                                <td className="px-4 py-3">
                                  <Button
                                    size="xs"
                                    variant="danger"
                                    onClick={() =>
                                      handleRemoveMember(member.employee_id)
                                    }
                                  >
                                    Xoá
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }

              // milestones tab
              return (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="sm"
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
                      onClick={() => {
                        setEditingMilestone(null);
                        setShowAddMilestone(true);
                      }}
                    >
                      Thêm cột mốc
                    </Button>
                  </div>
                  <MilestoneTable
                    milestones={milestones}
                    canManage
                    onEdit={(m) => {
                      setEditingMilestone(m);
                      setShowAddMilestone(true);
                    }}
                    onDelete={(m) => setDeletingMilestone(m)}
                    onToggleItem={handleToggleItem}
                  />
                </div>
              );
            }}
          </Tabs>
        </Card>
      </div>

      {/* Add/Edit Milestone modal */}
      <AddMilestoneModal
        isOpen={showAddMilestone}
        onClose={() => {
          setShowAddMilestone(false);
          setEditingMilestone(null);
        }}
        onSuccess={() => mutateMilestones()}
        projectId={projectId}
        editingMilestone={editingMilestone}
      />

      {/* Delete Milestone confirm */}
      <Modal
        isOpen={deletingMilestone !== null}
        onClose={() => setDeletingMilestone(null)}
        title="Xoá cột mốc"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingMilestone(null)}
            >
              Huỷ
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDeleteMilestone}
            >
              Xoá
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xoá cột mốc{" "}
          <span className="font-semibold">"{deletingMilestone?.title}"</span>?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </>
  );
}
