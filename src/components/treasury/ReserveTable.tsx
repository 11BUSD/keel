"use client";

import { runwayDays, type AgentRecord } from "@/domain";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { formatDays, formatUsd } from "@/lib/format";
import { useAgents } from "@/hooks/useKeel";

function floorUsd(agent: AgentRecord): number {
  return agent.treasury.dailyBurnUsd * agent.mandate.minRunwayDays;
}

/** Reserve floor vs cash, and the swept T-bill balance, per active agent. */
export function ReserveTable() {
  const { data, isPending, isError, refetch } = useAgents();

  if (isPending) return <SkeletonRows rows={5} />;
  if (isError || !data) {
    return <ErrorState detail="Could not load reserves." onRetry={() => refetch()} />;
  }

  return (
    <Panel title="Reserves & sweeps (runway before yield)">
      <ul className="divide-y divide-line/60">
        {data
          .filter((a) => a.status !== "killed")
          .map((agent) => {
            const floor = floorUsd(agent);
            const coverage = floor > 0 ? agent.treasury.cashUsd / floor : 1;
            return (
              <li key={agent.id} className="py-2.5 text-[13px]">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-ink">{agent.name}</span>
                  <span className="tabular text-[11px] text-ink-faint">
                    cash {formatUsd(agent.treasury.cashUsd)} · floor {formatUsd(floor)} ·
                    runway {formatDays(runwayDays(agent.treasury))}
                  </span>
                </div>
                <Meter
                  fraction={Math.min(1, coverage)}
                  tone={coverage >= 1 ? "positive" : coverage >= 0.6 ? "caution" : "danger"}
                  label={`${agent.name} reserve-floor coverage`}
                />
                <p className="mt-1 text-[11px] text-ink-faint">
                  T-bills {formatUsd(agent.tbill.balanceUsd)}
                  {agent.tbill.yieldAccruedUsd > 0.01 &&
                    ` (yield accrued ${formatUsd(agent.tbill.yieldAccruedUsd)})`}
                </p>
              </li>
            );
          })}
      </ul>
    </Panel>
  );
}
