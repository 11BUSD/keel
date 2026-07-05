"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/ui/States";
import { formatTime } from "@/lib/format";
import { useAuditLog, useAuditVerify } from "@/hooks/useKeel";

const categoryTone = {
  financing: "accent",
  control: "danger",
  system: "neutral",
} as const;

export function AuditScreen() {
  const log = useAuditLog();
  const chain = useAuditVerify();
  const [category, setCategory] = useState("all");

  const filtered = useMemo(
    () => (log.data ?? []).filter((e) => category === "all" || e.category === category),
    [log.data, category],
  );

  if (log.isPending) return <SkeletonRows rows={10} />;
  if (log.isError || !log.data) {
    return <ErrorState detail="Could not read the audit log." onRetry={() => log.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <Panel title="Chain integrity">
        <div className="flex flex-wrap items-center gap-3">
          {chain.data && (
            <Badge tone={chain.data.valid ? "positive" : "danger"}>
              {chain.data.valid ? "Chain verified" : "CHAIN BROKEN"}
            </Badge>
          )}
          <p className="text-[13px] text-ink-muted">
            Every event embeds the previous event&apos;s hash; the chain is recomputed
            end-to-end on read. Simulated with a non-cryptographic hash — a production
            ledger would use SHA-256 with signed anchors.
          </p>
        </div>
      </Panel>

      <Panel
        title={`Events (${filtered.length})`}
        action={
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-36"
          >
            <option value="all">All categories</option>
            <option value="financing">Financing</option>
            <option value="control">Control</option>
            <option value="system">System</option>
          </Select>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No events in this category"
            detail="Run a financing request or flip a control to generate events."
          />
        ) : (
          <ol className="divide-y divide-line/60">
            {filtered.map((e) => (
              <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 py-2.5">
                <div className="flex min-w-0 items-start gap-3">
                  <Badge tone={categoryTone[e.category]}>{e.category}</Badge>
                  <div className="min-w-0">
                    <div className="text-[13px] text-ink">
                      <span className="font-medium">{e.action}</span>
                      <span className="text-ink-faint"> · {e.actor}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">{e.detail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="tabular text-[11px] text-ink-faint">{formatTime(e.ts)}</div>
                  <div className="font-mono text-[10px] text-ink-faint">
                    #{e.seq} · {e.hash.slice(0, 12)}…
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}
