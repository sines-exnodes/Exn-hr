"use client";

import { useEffect, useRef, useCallback } from "react";

// Base URL from env
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export type SSEEventType =
  | "connected"
  | "attendance_updated"
  | "leave_created"
  | "leave_approved"
  | "overtime_created"
  | "overtime_approved"
  | "payroll_updated"
  | "project_updated";

export interface SSEEvent {
  type: SSEEventType;
  data: Record<string, unknown>;
}

type SSEHandler = (event: SSEEvent) => void;

/**
 * Hook to connect to the SSE endpoint and listen for real-time events.
 * Automatically reconnects on disconnect.
 *
 * @param handlers - Map of event type to handler function
 * @param enabled - Whether SSE should be active (default true)
 *
 * Usage:
 * ```tsx
 * useSSE({
 *   attendance_updated: () => mutateAttendance(),
 *   leave_created: () => mutateLeave(),
 * });
 * ```
 */
export function useSSE(
  handlers: Partial<Record<SSEEventType, SSEHandler>>,
  enabled = true,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const connect = useCallback(() => {
    // Get token from localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token || !enabled) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // EventSource doesn't support custom headers, so pass token as query param
    const url = `${API_BASE}/events?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    // Listen for each event type
    const eventTypes: SSEEventType[] = [
      "connected",
      "attendance_updated",
      "leave_created",
      "leave_approved",
      "overtime_created",
      "overtime_approved",
      "payroll_updated",
      "project_updated",
    ];

    eventTypes.forEach((eventType) => {
      es.addEventListener(eventType, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const handler = handlersRef.current[eventType];
          if (handler) {
            handler({ type: eventType, data: data.data ?? data });
          }
        } catch {
          // ignore parse errors
        }
      });
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [enabled]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
