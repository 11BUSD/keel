"use client";

import type { CapitalProvider } from "@/domain";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/States";
import { COPY } from "@/content/copy";
import { formatUsd } from "@/lib/format";
import { useAgents } from "@/hooks/useKeel";

/** Where the provider's capital is at work, advance by advance. */
export function AllocationList({ provider }: { provider: CapitalProvider }) {
  const agents = useAgents();

  return (
    <Panel title={COPY.lenders.capitalAtWork}>
      {provider.allocations.length === 0 ? (
        <EmptyState title="No capital deployed" detail={COPY.lenders.emptyAllocations} />
      ) : (
        <ul className="divide-y divide-line/60">
          {provider.allocations.map((allocation) => {
            const agent = agents.data?.find((a) => a.id === allocation.agentId);
            return (
              <li
                key={allocation.advanceId}
                className="flex items-center justify-between gap-2 py-2.5 text-[13px]"
              >
                <span>
                  <span className="font-medium text-ink">
                    {agent?.name ?? allocation.agentId}
                  </span>
                  <span className="ml-2 font-mono text-[10px] text-ink-faint">
                    {allocation.advanceId}
                  </span>
                </span>
                <span className="tabular text-ink-muted">
                  {formatUsd(allocation.fundedUsd)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
