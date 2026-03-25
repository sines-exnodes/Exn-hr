"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserMenu } from "@/components/layout/UserMenu";
import { useNotifications, useUnreadCount, markNotificationRead } from "@/hooks/useApi";

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifRes, mutate: mutateNotifs } = useNotifications({ page: 1, size: 10 });
  const { data: unreadRes, mutate: mutateUnread } = useUnreadCount();

  const notifications = notifRes?.data ?? [];
  const unreadCount = unreadRes?.data?.count ?? 0;

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      mutateNotifs();
      mutateUnread();
    } catch {
      // silently ignore
    }
  };

  return (
    <header className="glass-surface sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 px-6">
      {/* Left: title + breadcrumbs */}
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-0.5">
            <ol className="flex items-center gap-1 text-xs text-slate-400">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-slate-600 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-500">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      {/* Right: search + notifications */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search..."
            className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white" aria-hidden="true">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg animate-fade-slide-up">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-700">Notifications</h3>
              </div>
              <ul className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                  >
                    <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${n.is_read ? "bg-slate-200" : "bg-green-400"}`} />
                    <div>
                      <p className="text-sm text-slate-700">{n.body}</p>
                      <p className="text-xs text-slate-400">{timeAgo(n.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 p-3">
                <button className="w-full rounded-lg py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <UserMenu notifOpen={notifOpen} onMenuOpen={() => setNotifOpen(false)} />
      </div>
    </header>
  );
}
