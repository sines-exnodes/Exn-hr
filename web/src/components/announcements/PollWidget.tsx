"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { votePoll, usePollResults } from "@/hooks/useApi";
import type { Poll } from "@/types";

interface PollWidgetProps {
  poll: Poll;
  onVoted?: () => void;
}

export function PollWidget({ poll, onVoted }: PollWidgetProps) {
  const { data: resultsRes, mutate } = usePollResults(poll.id);
  const results = resultsRes?.data;

  const [selected, setSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasVoted = (results?.my_votes ?? []).length > 0;
  const isClosed = results?.is_closed ?? poll.status === "closed";
  const showResults = hasVoted || isClosed;

  const isPastDeadline = poll.deadline
    ? new Date(poll.deadline).getTime() < Date.now()
    : false;
  const canVote = !hasVoted && !isClosed && !isPastDeadline;

  const toggleOption = (optionId: number) => {
    if (!canVote) return;
    if (poll.is_multiple_choice) {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelected([optionId]);
    }
  };

  const handleVote = async () => {
    if (selected.length === 0) {
      setError("Vui lòng chọn ít nhất một tuỳ chọn.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await votePoll(poll.id, { option_ids: selected });
      await mutate();
      onVoted?.();
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bình chọn thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  type DisplayOption = {
    id: number;
    text: string;
    vote_count: number;
    percentage?: number;
    display_order?: number;
  };

  const options: DisplayOption[] = showResults
    ? (results?.options ?? poll.options ?? [])
    : (poll.options ?? []);

  const totalVotes = results?.total_votes ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mt-3">
      {/* Poll header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-semibold text-slate-800">{poll.question}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {poll.is_anonymous && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              Ẩn danh
            </span>
          )}
          {poll.is_multiple_choice && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">
              Nhiều lựa chọn
            </span>
          )}
          {isClosed && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-500">
              Đã đóng
            </span>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {options
          .slice()
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((option) => {
            const isMyVote = (results?.my_votes ?? []).includes(option.id);
            const pct = showResults ? (option.percentage ?? 0) : 0;

            return (
              <div key={option.id}>
                {showResults ? (
                  /* Results view */
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isMyVote && (
                          <svg className="h-3.5 w-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`text-sm ${isMyVote ? "font-semibold text-green-700" : "text-slate-700"}`}>
                          {option.text}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        {pct.toFixed(0)}%
                        <span className="ml-1 font-normal text-slate-400">({option.vote_count})</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isMyVote ? "bg-green-500" : "bg-slate-400"}`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                ) : (
                  /* Voting view */
                  <button
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    disabled={!canVote}
                    className={[
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-150",
                      selected.includes(option.id)
                        ? "border-green-400 bg-green-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      !canVote ? "cursor-default" : "cursor-pointer",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        selected.includes(option.id)
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300",
                        poll.is_multiple_choice ? "rounded" : "",
                      ].join(" ")}
                    >
                      {selected.includes(option.id) && (
                        <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-slate-700">{option.text}</span>
                  </button>
                )}
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {showResults
            ? `${totalVotes} lượt bình chọn`
            : poll.deadline
            ? `Hạn: ${new Date(poll.deadline).toLocaleDateString("vi-VN")}`
            : "Đang mở"}
        </p>
        {canVote && (
          <Button size="xs" variant="primary" loading={submitting} onClick={handleVote}>
            Bình chọn
          </Button>
        )}
        {hasVoted && (
          <span className="text-xs font-medium text-green-600">Bạn đã bình chọn</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
