"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Milestone, MilestoneItem, MilestoneStatus } from "@/types";

const milestoneStatusConfig: Record<MilestoneStatus, { label: string; variant: "blue" | "green" | "yellow" | "red" }> = {
  upcoming: { label: "Sắp tới", variant: "blue" },
  in_progress: { label: "Đang thực hiện", variant: "yellow" },
  completed: { label: "Hoàn thành", variant: "green" },
  overdue: { label: "Quá hạn", variant: "red" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isDueSoon(deadline: string): boolean {
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

interface MilestoneTableProps {
  milestones: Milestone[];
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestone: Milestone) => void;
  onToggleItem?: (milestoneId: number, item: MilestoneItem) => void;
  canManage?: boolean;
}

export function MilestoneTable({ milestones, onEdit, onDelete, onToggleItem, canManage }: MilestoneTableProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (milestones.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Chưa có cột mốc nào.
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="w-8 px-4 py-3" />
            {["Tên cột mốc", "Mô tả", "Deadline", "Trạng thái", ...(canManage ? [""] : [])].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {milestones.map((m) => {
            const config = milestoneStatusConfig[m.status] ?? { label: m.status, variant: "gray" as const };
            const dueSoon = m.status !== "completed" && m.status !== "overdue" && !!m.deadline && isDueSoon(m.deadline);
            const hasItems = (m.items ?? []).length > 0;
            const isExpanded = expanded.has(m.id);

            return (
              <React.Fragment key={m.id}>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  {/* Expand toggle */}
                  <td className="px-4 py-3">
                    {hasItems && (
                      <button
                        onClick={() => toggleExpand(m.id)}
                        className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                      >
                        <svg
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">{m.title}</span>
                      {dueSoon && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                          Sắp đến hạn
                        </span>
                      )}
                      {hasItems && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          {(m.items ?? []).filter((i) => i.is_completed).length}/{(m.items ?? []).length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">
                    {m.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {m.deadline ? formatDate(m.deadline) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={config.variant} dot>{config.label}</Badge>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <Button size="xs" variant="outline" onClick={() => onEdit(m)}>
                            Sửa
                          </Button>
                        )}
                        {onDelete && (
                          <Button size="xs" variant="danger" onClick={() => onDelete(m)}>
                            Xoá
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                {/* Expanded items row */}
                {isExpanded && hasItems && (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="bg-slate-50/60 px-8 py-3">
                      <ul className="space-y-1.5">
                        {(m.items ?? [])
                          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                          .map((item, idx) => (
                            <li key={item.id ?? idx} className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={item.is_completed}
                                onChange={() => onToggleItem?.(m.id, item)}
                                disabled={!canManage || !onToggleItem}
                                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 disabled:cursor-default"
                              />
                              <span
                                className={[
                                  "text-sm",
                                  item.is_completed
                                    ? "line-through text-slate-400"
                                    : "text-slate-700",
                                ].join(" ")}
                              >
                                {item.content}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
