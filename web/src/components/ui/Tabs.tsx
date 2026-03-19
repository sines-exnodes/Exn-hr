"use client";

import React, { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children?: (activeTab: string) => React.ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const handleSelect = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div>
      <div
        className="flex gap-1 border-b border-slate-200"
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => handleSelect(tab.id)}
              className={[
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                "border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                isActive
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
              ].join(" ")}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={[
                    "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {children && (
        <div
          role="tabpanel"
          id={`tabpanel-${active}`}
          aria-labelledby={`tab-${active}`}
          className="mt-4"
        >
          {children(active)}
        </div>
      )}
    </div>
  );
}
