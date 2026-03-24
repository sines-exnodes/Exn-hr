import React from "react";

type BadgeVariant =
  | "green"
  | "red"
  | "yellow"
  | "blue"
  | "gray"
  | "orange"
  | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-slate-100 text-slate-600",
  orange: "bg-orange-100 text-orange-700",
  purple: "bg-purple-100 text-purple-700",
};

const dotClasses: Record<BadgeVariant, string> = {
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  gray: "bg-slate-400",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
};

export function Badge({
  variant = "gray",
  children,
  className = "",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${dotClasses[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// Convenience helpers for common statuses
export function statusBadge(status: string) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: "green", label: "Active" },
    inactive: { variant: "gray", label: "Inactive" },
    terminated: { variant: "red", label: "Terminated" },
    on_leave: { variant: "yellow", label: "On Leave" },
    present: { variant: "green", label: "Present" },
    absent: { variant: "red", label: "Absent" },
    late: { variant: "orange", label: "Late" },
    half_day: { variant: "yellow", label: "Half Day" },
    wfh: { variant: "blue", label: "WFH" },
    pending: { variant: "yellow", label: "Pending" },
    leader_approved: { variant: "blue", label: "Leader Approved" },
    approved: { variant: "green", label: "Approved" },
    rejected: { variant: "red", label: "Rejected" },
    ceo_approved: { variant: "green", label: "CEO Approved" },
    draft: { variant: "gray", label: "Draft" },
    paid: { variant: "green", label: "Paid" },
    checked_in: { variant: "green", label: "Checked In" },
    checked_out: { variant: "blue", label: "Checked Out" },
    confirmed: { variant: "green", label: "Confirmed" },
  };
  const entry = map[status] ?? { variant: "gray" as BadgeVariant, label: status };
  return <Badge variant={entry.variant} dot>{entry.label}</Badge>;
}
