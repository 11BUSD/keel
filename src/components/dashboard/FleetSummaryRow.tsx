"use client";

import { StatBlock } from "@/components/ui/StatBlock";
import { Skeleton } from "@/components/ui/States";
import { formatDays, formatUsdCompact } from "@/lib/format";
import { useFleetSummary } from "@/hooks/useKeel";

export function FleetSummaryRow() {
  const { data, isPending, isError } = useFleetSummary();

  if (isPending) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[86px]" />
        ))}
      </div>
    );
  }
  if (isError || !data) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatBlock
        label="Fleet revenue (30d)"
        value={formatUsdCompact(data.fleetTrailing30dRevenueUsd)}
        sub={`${data.activeAgents} of ${data.totalAgents} agents active`}
      />
      <StatBlock
        label="Fleet treasury"
        value={formatUsdCompact(data.fleetTreasuryUsd)}
        sub="Cash + stable reserves (simulated)"
      />
      <StatBlock
        label="Outstanding advances"
        value={formatUsdCompact(data.fleetOutstandingAdvanceUsd)}
        tone={data.fleetOutstandingAdvanceUsd > 0 ? "accent" : "neutral"}
        sub="Revenue-share repayment"
      />
      <StatBlock
        label="Median runway"
        value={formatDays(data.medianRunwayDays)}
        tone={data.medianRunwayDays < 30 ? "caution" : "positive"}
        sub={data.globalFreeze ? "GLOBAL FREEZE ACTIVE" : "At current burn"}
      />
    </div>
  );
}
