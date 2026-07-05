"use client";

import { Button } from "./Button";

/** Skeleton block matching final layout (DESIGN.md: no raw spinners). */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded bg-surface-3 ${className}`}
    />
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      <p className="mt-1 text-xs text-ink-faint">{detail}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  detail,
  onRetry,
}: {
  title?: string;
  detail: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger/5 px-6 py-8 text-center"
    >
      <p className="text-sm font-medium text-danger">{title}</p>
      <p className="mt-1 text-xs text-ink-muted">{detail}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
