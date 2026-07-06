"use client";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { StatBlock } from "@/components/ui/StatBlock";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { COPY } from "@/content/copy";
import { formatUsd, formatUsdCompact } from "@/lib/format";
import { useAdvanceTime, useFleetSummary } from "@/hooks/useKeel";
import { AdvanceBook } from "./AdvanceBook";
import { ReserveTable } from "./ReserveTable";

export function TreasuryScreen() {
  const summary = useFleetSummary();
  const advanceTime = useAdvanceTime();

  if (summary.isPending) return <SkeletonRows rows={8} />;
  if (summary.isError || !summary.data) {
    return (
      <ErrorState detail="Could not load treasury state." onRetry={() => summary.refetch()} />
    );
  }

  const s = summary.data;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock label="Simulation clock" value={`Day ${s.simDay}`} sub="Seeded world time" />
        <StatBlock
          label="Outstanding advances"
          value={formatUsdCompact(s.fleetOutstandingAdvanceUsd)}
          tone={s.fleetOutstandingAdvanceUsd > 0 ? "accent" : "neutral"}
          sub="Repaying via revenue share"
        />
        <StatBlock
          label="Swept to T-bills"
          value={formatUsdCompact(s.fleetTbillUsd)}
          tone={s.fleetTbillUsd > 0 ? "positive" : "neutral"}
          sub="Simulated tokenized T-bills"
        />
        <StatBlock
          label="Fleet treasury"
          value={formatUsdCompact(s.fleetTreasuryUsd)}
          sub="Cash + stable (excl. T-bills)"
        />
      </div>

      <Panel title={COPY.treasury.advanceTitle}>
        <div className="flex flex-wrap items-center gap-3">
          <p className="mr-auto max-w-lg text-[13px] text-ink-muted">
            {COPY.treasury.advanceBody}
          </p>
          <Button
            variant="ghost"
            busy={advanceTime.isPending}
            onClick={() => advanceTime.mutate(7)}
          >
            {COPY.treasury.advance7}
          </Button>
          <Button busy={advanceTime.isPending} onClick={() => advanceTime.mutate(30)}>
            {COPY.treasury.advance30}
          </Button>
        </div>
        {advanceTime.data && (
          <p className="mt-3 rounded-md border border-line bg-surface-2 px-3 py-2 text-xs text-ink-muted">
            Day {advanceTime.data.fromDay} → {advanceTime.data.toDay}:{" "}
            {formatUsd(advanceTime.data.repaidUsd)} repaid
            {advanceTime.data.advancesFullyRepaid > 0 &&
              ` (${advanceTime.data.advancesFullyRepaid} advance(s) closed)`}
            , {formatUsd(advanceTime.data.sweptUsd)} swept,{" "}
            {formatUsd(advanceTime.data.redeemedUsd)} redeemed for reserves,{" "}
            {formatUsd(advanceTime.data.yieldAccruedUsd)} yield accrued.
          </p>
        )}
      </Panel>

      <AdvanceBook />
      <ReserveTable />
    </div>
  );
}
