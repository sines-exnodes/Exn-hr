"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import type {
  Project,
  ProjectAssignment,
  WorkloadOverview,
  ProjectRole,
  Employee,
  CreateProjectRequest,
  AssignMemberRequest,
} from "@/types";
import {
  useProjects,
  useWorkloadOverview,
  useWorkloadMatrix,
  useEmployees,
  useEmployeeWorkload,
  useProjectMembers,
  createProject,
  addProjectMember,
  removeProjectMember,
} from "@/hooks/useApi";

// ─── Helpers ────────────────────────────────────────────
const roleLabel: Record<ProjectRole, string> = {
  backend: "BE",
  frontend: "FE",
  mobile: "MB",
  qa: "QC/BA",
  ba: "BA",
  designer: "Designer",
  pm: "PM",
  devops: "DevOps",
};

const statusLabel: Record<
  string,
  { label: string; variant: "green" | "blue" | "yellow" | "gray" }
> = {
  active: { label: "Đang chạy", variant: "green" },
  completed: { label: "Hoàn thành", variant: "blue" },
  on_hold: { label: "Tạm dừng", variant: "yellow" },
};

const statusOptions = [
  { value: "active", label: "Đang chạy" },
  { value: "completed", label: "Hoàn thành" },
  { value: "on_hold", label: "Tạm dừng" },
];

const roleOptions: { value: ProjectRole; label: string }[] = [
  { value: "backend", label: "Backend" },
  { value: "frontend", label: "Frontend" },
  { value: "mobile", label: "Mobile" },
  { value: "qa", label: "QC/BA" },
  { value: "ba", label: "BA" },
  { value: "designer", label: "Designer" },
  { value: "pm", label: "PM" },
  { value: "devops", label: "DevOps" },
];

// ─── Tiny cell components (same as payroll) ─────────────
function Th({
  children,
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap border-b-2 border-slate-300 bg-slate-100 sticky top-0 z-10 ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  ...rest
}: {
  children?: React.ReactNode;
  className?: string;
} & React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-3 py-2 text-xs whitespace-nowrap border-b border-slate-100 ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

// ─── Tab definitions ────────────────────────────────────
const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "matrix", label: "Ma trận phân bổ" },
  { id: "by-project", label: "Theo dự án" },
  { id: "by-employee", label: "Theo nhân viên" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ═══════════════════════════════════════════════════════
// TAB 1: Tổng quan (Overview)
// ═══════════════════════════════════════════════════════
function OverviewTab({
  overview,
  employees,
  assignments,
}: {
  overview: WorkloadOverview | null;
  employees: Employee[];
  assignments: ProjectAssignment[];
}) {
  const employeeProjectCount = useMemo(() => {
    const map: Record<number, number> = {};
    assignments.forEach((a) => {
      map[a.employee_id] = (map[a.employee_id] || 0) + 1;
    });
    return map;
  }, [assignments]);

  const overloaded = useMemo(
    () => employees.filter((e) => (employeeProjectCount[e.id] || 0) > 4),
    [employees, employeeProjectCount],
  );

  const unassigned = useMemo(
    () => employees.filter((e) => !employeeProjectCount[e.id]),
    [employees, employeeProjectCount],
  );

  const deptCounts = overview?.employees_by_department ?? {};

  return (
    <div className="p-6 space-y-6">
      {/* Department breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Nhân viên theo phòng ban
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(deptCounts).map(([dept, count]) => (
            <div
              key={dept}
              className="rounded-lg border border-slate-200 bg-white p-3 text-center"
            >
              <p className="text-xs text-slate-500 truncate">{dept}</p>
              <p className="text-lg font-bold text-slate-800">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overloaded employees */}
      <div>
        <h3 className="text-sm font-semibold text-red-600 mb-3">
          NV quá tải (&gt;4 dự án) — {overloaded.length} người
        </h3>
        {overloaded.length === 0 ? (
          <p className="text-xs text-slate-400">Không có nhân viên quá tải.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>STT</Th>
                  <Th>Họ và Tên</Th>
                  <Th>Vị trí</Th>
                  <Th>Phòng ban</Th>
                  <Th className="text-center">Số DA</Th>
                  <Th>Trạng thái</Th>
                </tr>
              </thead>
              <tbody>
                {overloaded.map((e, idx) => (
                  <tr key={e.id} className="bg-red-50/50">
                    <Td className="text-slate-400">{idx + 1}</Td>
                    <Td className="font-medium text-slate-800">
                      {e.full_name}
                    </Td>
                    <Td className="text-slate-500">{e.position}</Td>
                    <Td className="text-slate-500">
                      {e.team?.department?.name ?? e.team?.name ?? "—"}
                    </Td>
                    <Td className="text-center font-bold text-red-600">
                      {employeeProjectCount[e.id] || 0}
                    </Td>
                    <Td>
                      <Badge variant="red" dot>
                        Quá tải
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unassigned employees */}
      <div>
        <h3 className="text-sm font-semibold text-yellow-600 mb-3">
          NV chưa gán dự án — {unassigned.length} người
        </h3>
        {unassigned.length === 0 ? (
          <p className="text-xs text-slate-400">
            Tất cả nhân viên đều đã được gán dự án.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>STT</Th>
                  <Th>Họ và Tên</Th>
                  <Th>Vị trí</Th>
                  <Th>Phòng ban</Th>
                  <Th>Trạng thái</Th>
                </tr>
              </thead>
              <tbody>
                {unassigned.map((e, idx) => (
                  <tr key={e.id} className="bg-yellow-50/50">
                    <Td className="text-slate-400">{idx + 1}</Td>
                    <Td className="font-medium text-slate-800">
                      {e.full_name}
                    </Td>
                    <Td className="text-slate-500">{e.position}</Td>
                    <Td className="text-slate-500">
                      {e.team?.department?.name ?? e.team?.name ?? "—"}
                    </Td>
                    <Td>
                      <Badge variant="yellow" dot>
                        Chưa gán
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 2: Ma trận phân bổ (Matrix)
// ═══════════════════════════════════════════════════════
function MatrixTab({
  employees,
  projects,
  assignments,
}: {
  employees: Employee[];
  projects: Project[];
  assignments: ProjectAssignment[];
}) {
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === "active"),
    [projects],
  );

  // Build assignment lookup: employeeId -> Set<projectId>
  const assignmentMap = useMemo(() => {
    const map: Record<number, Set<number>> = {};
    assignments.forEach((a) => {
      if (!map[a.employee_id]) map[a.employee_id] = new Set();
      map[a.employee_id].add(a.project_id);
    });
    return map;
  }, [assignments]);

  // Group employees by department
  const grouped = useMemo(() => {
    const map: Record<string, Employee[]> = {};
    employees.forEach((e) => {
      const dept = e.team?.department?.name ?? e.team?.name ?? "Chưa phân bổ";
      if (!map[dept]) map[dept] = [];
      map[dept].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [employees]);

  return (
    <div className="overflow-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <Th className="sticky left-0 z-20 bg-slate-100 min-w-[180px]">
              Nhân viên
            </Th>
            <Th className="sticky left-[180px] z-20 bg-slate-100 min-w-[100px]">
              Vị trí
            </Th>
            {activeProjects.map((p) => (
              <Th key={p.id} className="text-center min-w-[80px]">
                <span className="block max-w-[80px] truncate" title={p.name}>
                  {p.name}
                </span>
              </Th>
            ))}
            <Th className="text-center bg-slate-200">Tổng DA</Th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(([dept, emps]) => (
            <React.Fragment key={dept}>
              {/* Department group header */}
              <tr className="bg-slate-50">
                <Td
                  colSpan={activeProjects.length + 3}
                  className="font-bold text-slate-700 text-[11px] uppercase tracking-wide bg-slate-50 border-b border-slate-200"
                >
                  {dept} ({emps.length})
                </Td>
              </tr>
              {emps.map((e) => {
                const count = assignmentMap[e.id]?.size ?? 0;
                const rowBg =
                  count === 0
                    ? "bg-yellow-50/40"
                    : count > 4
                      ? "bg-red-50/40"
                      : "";
                return (
                  <tr key={e.id} className={`hover:bg-blue-50/30 ${rowBg}`}>
                    <Td className="font-medium text-slate-800 sticky left-0 z-[5] bg-white min-w-[180px]">
                      {e.full_name}
                    </Td>
                    <Td className="text-slate-500 sticky left-[180px] z-[5] bg-white min-w-[100px]">
                      {e.position}
                    </Td>
                    {activeProjects.map((p) => {
                      const assigned = assignmentMap[e.id]?.has(p.id);
                      return (
                        <Td key={p.id} className="text-center">
                          {assigned ? (
                            <span
                              className="inline-block h-3 w-3 rounded-full bg-green-500"
                              title="Assigned"
                            />
                          ) : null}
                        </Td>
                      );
                    })}
                    <Td
                      className={`text-center font-bold ${
                        count === 0
                          ? "text-yellow-600"
                          : count > 4
                            ? "text-red-600"
                            : "text-slate-800"
                      } bg-slate-50`}
                    >
                      {count}
                    </Td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 3: Theo dự án (By Project)
// ═══════════════════════════════════════════════════════
function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  employees,
}: {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}) {
  const { data: membersRes, mutate } = useProjectMembers(project?.id);
  const members = membersRes?.data ?? [];
  const [adding, setAdding] = useState(false);
  const [newMember, setNewMember] = useState<AssignMemberRequest>({
    employee_id: 0,
    role: "backend",
    allocation_percentage: 100,
  });
  const [saving, setSaving] = useState(false);

  const availableEmployees = useMemo(() => {
    const assignedIds = new Set(members.map((m) => m.employee_id));
    return employees.filter((e) => !assignedIds.has(e.id));
  }, [employees, members]);

  const handleAddMember = async () => {
    if (!project || !newMember.employee_id) return;
    setSaving(true);
    try {
      await addProjectMember(project.id, newMember);
      await mutate();
      setAdding(false);
      setNewMember({
        employee_id: 0,
        role: "backend",
        allocation_percentage: 100,
      });
    } catch (err) {
      console.error("Add member failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (employeeId: number) => {
    if (!project) return;
    try {
      await removeProjectMember(project.id, employeeId);
      await mutate();
    } catch (err) {
      console.error("Remove member failed", err);
    }
  };

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project.name} size="xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{members.length} thành viên</p>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setAdding(!adding)}
          >
            {adding ? "Huỷ" : "+ Thêm thành viên"}
          </Button>
        </div>

        {adding && (
          <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50">
            <Select
              label="Nhân viên"
              required
              options={availableEmployees.map((e) => ({
                value: String(e.id),
                label: e.full_name,
              }))}
              placeholder="Chọn nhân viên"
              value={String(newMember.employee_id || "")}
              onChange={(e) =>
                setNewMember((prev) => ({
                  ...prev,
                  employee_id: Number(e.target.value),
                }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Vai trò"
                options={roleOptions}
                value={newMember.role}
                onChange={(e) =>
                  setNewMember((prev) => ({
                    ...prev,
                    role: e.target.value as ProjectRole,
                  }))
                }
              />
              <Input
                label="Phân bổ (%)"
                type="number"
                min={1}
                max={100}
                value={newMember.allocation_percentage}
                onChange={(e) =>
                  setNewMember((prev) => ({
                    ...prev,
                    allocation_percentage: Number(e.target.value),
                  }))
                }
              />
            </div>
            <Button size="sm" onClick={handleAddMember} loading={saving}>
              Thêm
            </Button>
          </div>
        )}

        {/* Member list */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Nhân viên</Th>
                <Th>Vai trò</Th>
                <Th className="text-center">Phân bổ</Th>
                <Th className="text-center">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-blue-50/30">
                  <Td className="font-medium text-slate-800">
                    {m.employee?.full_name ?? `NV #${m.employee_id}`}
                  </Td>
                  <Td>
                    <Badge variant="blue">{roleLabel[m.role] ?? m.role}</Badge>
                  </Td>
                  <Td className="text-center">{m.allocation_percentage}%</Td>
                  <Td className="text-center">
                    <button
                      onClick={() => handleRemove(m.employee_id)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Xoá
                    </button>
                  </Td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <Td colSpan={4} className="text-center text-slate-400">
                    Chưa có thành viên
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function ByProjectTab({
  projects,
  assignments,
  employees,
}: {
  projects: Project[];
  assignments: ProjectAssignment[];
  employees: Employee[];
}) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Count roles per project
  const projectRoleCounts = useMemo(() => {
    const map: Record<number, Record<string, number>> = {};
    assignments.forEach((a) => {
      if (!map[a.project_id]) map[a.project_id] = {};
      map[a.project_id][a.role] = (map[a.project_id][a.role] || 0) + 1;
    });
    return map;
  }, [assignments]);

  const projectTotalCounts = useMemo(() => {
    const map: Record<number, number> = {};
    assignments.forEach((a) => {
      map[a.project_id] = (map[a.project_id] || 0) + 1;
    });
    return map;
  }, [assignments]);

  const roleCols: ProjectRole[] = [
    "backend",
    "frontend",
    "mobile",
    "qa",
    "designer",
    "pm",
  ];

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <Th>STT</Th>
              <Th>Tên dự án</Th>
              <Th>Trạng thái</Th>
              {roleCols.map((r) => (
                <Th key={r} className="text-center">
                  {roleLabel[r]}
                </Th>
              ))}
              <Th className="text-center bg-slate-200">Tổng</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, idx) => {
              const counts = projectRoleCounts[p.id] ?? {};
              const total = projectTotalCounts[p.id] ?? 0;
              const st = statusLabel[p.status] ?? {
                label: p.status,
                variant: "gray" as const,
              };
              return (
                <tr key={p.id} className="hover:bg-blue-50/30">
                  <Td className="text-slate-400">{idx + 1}</Td>
                  <Td>
                    <button
                      onClick={() => setSelectedProject(p)}
                      className="font-medium text-green-600 hover:underline text-left"
                    >
                      {p.name}
                    </button>
                  </Td>
                  <Td>
                    <Badge variant={st.variant} dot>
                      {st.label}
                    </Badge>
                  </Td>
                  {roleCols.map((r) => (
                    <Td key={r} className="text-center tabular-nums">
                      {counts[r] || "—"}
                    </Td>
                  ))}
                  <Td className="text-center font-bold text-slate-800 bg-slate-50">
                    {total}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        employees={employees}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 4: Theo nhân viên (By Employee)
// ═══════════════════════════════════════════════════════
function EmployeeDetailModal({
  employee,
  isOpen,
  onClose,
}: {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: workloadRes } = useEmployeeWorkload(employee?.id);
  const workloads = workloadRes?.data ?? [];

  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee.full_name}
      size="lg"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{employee.position}</span>
          <span>|</span>
          <span>
            {employee.team?.department?.name ?? employee.team?.name ?? "—"}
          </span>
        </div>
        <p className="text-xs text-slate-500">{workloads.length} dự án</p>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Dự án</Th>
                <Th>Vai trò</Th>
                <Th className="text-center">Phân bổ</Th>
              </tr>
            </thead>
            <tbody>
              {workloads.map((w) => (
                <tr key={w.id} className="hover:bg-blue-50/30">
                  <Td className="font-medium text-slate-800">
                    {w.project?.name ?? `DA #${w.project_id}`}
                  </Td>
                  <Td>
                    <Badge variant="blue">{roleLabel[w.role] ?? w.role}</Badge>
                  </Td>
                  <Td className="text-center">{w.allocation_percentage}%</Td>
                </tr>
              ))}
              {workloads.length === 0 && (
                <tr>
                  <Td colSpan={3} className="text-center text-slate-400">
                    Chưa được gán dự án nào
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function ByEmployeeTab({
  employees,
  assignments,
  projects,
}: {
  employees: Employee[];
  assignments: ProjectAssignment[];
  projects: Project[];
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  // Build employee -> projects mapping
  const employeeProjects = useMemo(() => {
    const map: Record<number, { projectNames: string[]; count: number }> = {};
    const projectMap = new Map(projects.map((p) => [p.id, p.name]));
    assignments.forEach((a) => {
      if (!map[a.employee_id])
        map[a.employee_id] = { projectNames: [], count: 0 };
      map[a.employee_id].count++;
      const name = projectMap.get(a.project_id);
      if (name) map[a.employee_id].projectNames.push(name);
    });
    return map;
  }, [assignments, projects]);

  const getStatus = (count: number) => {
    if (count === 0) return { label: "Chưa gán", variant: "yellow" as const };
    if (count > 4) return { label: "Quá tải", variant: "red" as const };
    return { label: "Bình thường", variant: "green" as const };
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <Th>STT</Th>
              <Th>Họ và Tên</Th>
              <Th>Phòng ban</Th>
              <Th>Vị trí</Th>
              <Th>Dự án</Th>
              <Th className="text-center">Tổng DA</Th>
              <Th>Trạng thái</Th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e, idx) => {
              const info = employeeProjects[e.id] ?? {
                projectNames: [],
                count: 0,
              };
              const status = getStatus(info.count);
              const rowBg =
                info.count === 0
                  ? "bg-yellow-50/40"
                  : info.count > 4
                    ? "bg-red-50/40"
                    : "";
              return (
                <tr
                  key={e.id}
                  className={`hover:bg-blue-50/30 cursor-pointer ${rowBg}`}
                  onClick={() => setSelectedEmployee(e)}
                >
                  <Td className="text-slate-400">{idx + 1}</Td>
                  <Td className="font-medium text-slate-800">{e.full_name}</Td>
                  <Td className="text-slate-500">
                    {e.team?.department?.name ?? e.team?.name ?? "—"}
                  </Td>
                  <Td className="text-slate-500">{e.position}</Td>
                  <Td
                    className="max-w-[250px] truncate text-slate-600"
                    title={info.projectNames.join(", ")}
                  >
                    {info.projectNames.length > 0
                      ? info.projectNames.join(", ")
                      : "—"}
                  </Td>
                  <Td
                    className={`text-center font-bold ${
                      info.count === 0
                        ? "text-yellow-600"
                        : info.count > 4
                          ? "text-red-600"
                          : "text-slate-800"
                    }`}
                  >
                    {info.count}
                  </Td>
                  <Td>
                    <Badge variant={status.variant} dot>
                      {status.label}
                    </Badge>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// Create Project Modal
// ═══════════════════════════════════════════════════════
function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateProjectRequest>({
    name: "",
    description: "",
    status: "active",
    start_date: "",
    end_date: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await createProject({
        ...form,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      });
      onCreated();
      onClose();
      setForm({
        name: "",
        description: "",
        status: "active",
        start_date: "",
        end_date: "",
      });
    } catch (err) {
      console.error("Create project failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm dự án mới"
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Huỷ
          </Button>
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            Tạo dự án
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Tên dự án"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="VD: EXN HR System"
        />
        <Input
          label="Mô tả"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Mô tả ngắn về dự án"
        />
        <Select
          label="Trạng thái"
          options={statusOptions}
          value={form.status ?? "active"}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              status: e.target.value as CreateProjectRequest["status"],
            }))
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ngày bắt đầu"
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm((f) => ({ ...f, start_date: e.target.value }))
            }
          />
          <Input
            label="Ngày kết thúc"
            type="date"
            value={form.end_date}
            onChange={(e) =>
              setForm((f) => ({ ...f, end_date: e.target.value }))
            }
          />
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function WorkloadPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showCreateProject, setShowCreateProject] = useState(false);

  const {
    data: projectsRes,
    mutate: mutateProjects,
    isLoading: loadingProjects,
  } = useProjects();
  const { data: overviewRes, isLoading: loadingOverview } =
    useWorkloadOverview();
  const { data: matrixRes, isLoading: loadingMatrix } = useWorkloadMatrix();
  const { data: employeesRes, isLoading: loadingEmployees } = useEmployees();

  const projects = projectsRes?.data ?? [];
  const overview = overviewRes?.data ?? null;
  const assignments = matrixRes?.data ?? [];
  const employees = employeesRes?.data ?? [];

  const isLoading =
    loadingProjects || loadingOverview || loadingMatrix || loadingEmployees;

  // Computed stats
  const stats = useMemo(() => {
    const empProjectCount: Record<number, number> = {};
    assignments.forEach((a) => {
      empProjectCount[a.employee_id] =
        (empProjectCount[a.employee_id] || 0) + 1;
    });
    const overloaded = employees.filter(
      (e) => (empProjectCount[e.id] || 0) > 4,
    ).length;
    const unassigned = employees.filter((e) => !empProjectCount[e.id]).length;
    return {
      totalEmployees: employees.length,
      totalProjects: projects.length,
      overloaded,
      unassigned,
    };
  }, [employees, projects, assignments]);

  return (
    <div className="flex flex-col h-screen">
      {/* ── Top bar ── */}
      <div className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Quản lý phân bổ nhân sự
            </h1>
            <p className="text-xs text-slate-400">
              {stats.totalEmployees} nhân viên · {stats.totalProjects} dự án
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => setShowCreateProject(true)}>
            + Thêm dự án
          </Button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-slate-100">
        <div className="flex gap-6">
          {[
            {
              label: "Tổng NV",
              value: String(stats.totalEmployees),
              color: "text-slate-800",
            },
            {
              label: "Tổng dự án",
              value: String(stats.totalProjects),
              color: "text-slate-800",
            },
            {
              label: "NV quá tải (>4 DA)",
              value: String(stats.overloaded),
              color: stats.overloaded > 0 ? "text-red-600" : "text-slate-800",
            },
            {
              label: "NV chưa gán DA",
              value: String(stats.unassigned),
              color:
                stats.unassigned > 0 ? "text-yellow-600" : "text-slate-800",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{label}:</span>
              <span className={`text-sm font-bold tabular-nums ${color}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-6">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-[#22C55E] text-[#22C55E]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-auto bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                overview={overview}
                employees={employees}
                assignments={assignments}
              />
            )}
            {activeTab === "matrix" && (
              <MatrixTab
                employees={employees}
                projects={projects}
                assignments={assignments}
              />
            )}
            {activeTab === "by-project" && (
              <ByProjectTab
                projects={projects}
                assignments={assignments}
                employees={employees}
              />
            )}
            {activeTab === "by-employee" && (
              <ByEmployeeTab
                employees={employees}
                assignments={assignments}
                projects={projects}
              />
            )}
          </>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onCreated={() => mutateProjects()}
      />
    </div>
  );
}
