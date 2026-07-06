"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, SkeletonRows } from "@/components/ui/States";
import { formatPct, formatUsd } from "@/lib/format";
import { useAdvances, useAgents } from "@/hooks/useKeel";

const statusTones = { active: "accent", repaid: "positive", overdue: "danger" } as const;

export function AdvanceBook() {
  const advances = useAdvances();
  const agents = useAgents();

  return (
    <Panel
      title="Advance book"
      action={
        <Link href="/financing" className="text-xs text-accent hover:underline">
          New request →
        </Link>
      }
    >
      {advances.isPending || agents.isPending ? (
        <SkeletonRows rows={3} />
      ) : advances.isError || !advances.data || advances.data.length === 0 ? (
        <EmptyState
          title="No advances yet"
          detail="Approve a financing request, then advance the clock to watch it repay."
        />
      ) : (
        <ul className="space-y-2.5">
          {advances.data.map((adv) => {
            const agent = agents.data?.find((a) => a.id === adv.agentId);
            const progress = adv.repaidUsd / adv.principalUsd;
            return (
              <li
                key={adv.id}
                className="rounded-md border border-line bg-surface-2 px-3 py-2.5 text-[13px]"
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Badge tone={statusTones[adv.status]}>{adv.status}</Badge>
                    <span className="font-medium text-ink">{agent?.name ?? adv.agentId}</span>
                    <span className="font-mono text-[10px] text-ink-faint">{adv.id}</span>
                  </span>
                  <span className="tabular text-ink-muted">
                    {formatUsd(adv.repaidUsd)} / {formatUsd(adv.principalUsd)} repaid (
                    {formatPct(progress, 0)})
                  </span>
                </div>
                <Meter
                  fraction={progress}
                  tone={adv.status === "overdue" ? "danger" : adv.status === "repaid" ? "positive" : "accent"}
                  label={`${agent?.name ?? adv.agentId} repayment progress`}
                />
                <p className="mt-1.5 text-[11px] text-ink-faint">
                  {formatPct(adv.revenueShare, 0)} revenue-share sweep · {adv.termDays}d
                  term · disbursed day {adv.startDay} · outstanding {formatUsd(adv.outstandingUsd)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
