"use client";

import type { AgentRecord } from "@/domain";
import { Badge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/States";
import { formatPct, formatUsd } from "@/lib/format";

const positionLabels: Record<string, string> = {
  compute_credits: "Compute credits",
  gpu_reservation: "GPU reservation",
  receivable: "Receivable",
  stable_reserve: "Stable reserve",
};

export function AgentTables({ agent }: { agent: AgentRecord }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Positions">
        {agent.positions.length === 0 ? (
          <EmptyState title="No positions" detail="This agent holds no positions yet." />
        ) : (
          <ul className="space-y-2.5">
            {agent.positions.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-[13px]">
                <div>
                  <div className="text-ink">{p.label}</div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-faint">
                    {positionLabels[p.kind] ?? p.kind}
                  </div>
                </div>
                <span className="tabular text-ink-muted">{formatUsd(p.valueUsd)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Counterparties">
        <ul className="space-y-3">
          {agent.counterparties.map((c) => (
            <li key={c.id} className="text-[13px]">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-ink">{c.name}</span>
                <span className="flex items-center gap-2">
                  <Badge tone={c.rating === "A" ? "positive" : c.rating === "B" ? "neutral" : "caution"}>
                    {c.rating}
                  </Badge>
                  <span className="tabular text-ink-muted">{formatPct(c.revenueShare, 0)}</span>
                </span>
              </div>
              <Meter
                fraction={c.revenueShare}
                tone={c.revenueShare > 0.7 ? "danger" : c.revenueShare > 0.5 ? "caution" : "accent"}
                label={`${c.name} revenue share`}
              />
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Mandate">
        <dl className="space-y-2.5 text-[13px]">
          <MandateRow label="Max total advance" value={formatUsd(agent.mandate.maxAdvanceUsd)} />
          <MandateRow
            label="Advance / 30d revenue"
            value={formatPct(agent.mandate.maxAdvanceToRevenue, 0)}
          />
          <MandateRow label="Min runway" value={`${agent.mandate.minRunwayDays} days`} />
          <MandateRow label="Daily spend limit" value={formatUsd(agent.mandate.dailySpendLimitUsd)} />
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-ink-faint">Allowed purposes</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {agent.mandate.allowedPurposes.map((p) => (
                <Badge key={p} tone="accent">
                  {p}
                </Badge>
              ))}
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}

function MandateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="tabular text-ink">{value}</dd>
    </div>
  );
}
