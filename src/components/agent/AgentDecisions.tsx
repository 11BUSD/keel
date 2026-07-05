"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, SkeletonRows } from "@/components/ui/States";
import { formatTime } from "@/lib/format";
import { useDecisions } from "@/hooks/useKeel";
import { outcomeLabel, outcomeTone } from "@/components/statusTone";

export function AgentDecisions({ agentId }: { agentId: string }) {
  const { data, isPending, isError } = useDecisions(agentId);

  return (
    <Panel
      title="Financing decisions"
      action={
        <Link href={`/financing?agent=${agentId}`} className="text-xs text-accent hover:underline">
          New request →
        </Link>
      }
    >
      {isPending ? (
        <SkeletonRows rows={2} />
      ) : isError ? (
        <EmptyState title="Decisions unavailable" detail="Could not read the decision ledger." />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No decisions yet"
          detail="Request financing for this agent to see the risk engine's explainable decision here."
        />
      ) : (
        <ul className="space-y-2">
          {data.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px]"
            >
              <span className="flex items-center gap-2">
                <Badge tone={outcomeTone(d.outcome)}>{outcomeLabel[d.outcome]}</Badge>
                <span className="text-ink-muted">{d.summary}</span>
              </span>
              <span className="tabular text-[11px] text-ink-faint">{formatTime(d.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
