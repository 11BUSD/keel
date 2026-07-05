"use client";

import Link from "next/link";
import { runwayDays, type AgentRecord } from "@/domain";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { Sparkline } from "@/components/ui/Sparkline";
import { StatBlock } from "@/components/ui/StatBlock";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { formatDays, formatUsd, formatUsdCompact } from "@/lib/format";
import { useAgent } from "@/hooks/useKeel";
import { runwayTone, statusTone } from "@/components/statusTone";
import { AgentDecisions } from "./AgentDecisions";
import { AgentTables } from "./AgentTables";

export function AgentDetail({ agentId }: { agentId: string }) {
  const { data: agent, isPending, isError, refetch } = useAgent(agentId);

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-1/2" />
        <div className="grid gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[86px]" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (isError)
    return <ErrorState detail="Could not load this agent." onRetry={() => refetch()} />;
  if (!agent)
    return (
      <ErrorState
        title="Agent not found"
        detail={`No agent with id "${agentId}" exists in this simulated fleet.`}
      />
    );

  const days = runwayDays(agent.treasury);
  return (
    <div className="space-y-4">
      <Header agent={agent} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock
          label="Revenue (30d, verified)"
          value={formatUsdCompact(agent.trailing30dRevenueUsd)}
          sub={`Volatility CV ${(agent.revenueVolatility * 100).toFixed(1)}%`}
        />
        <StatBlock
          label="Runway"
          value={formatDays(days)}
          tone={runwayTone(days)}
          sub={`Burn ${formatUsd(agent.treasury.dailyBurnUsd)}/day`}
        />
        <StatBlock
          label="Treasury"
          value={formatUsdCompact(agent.treasury.cashUsd + agent.treasury.stableUsd)}
          sub={`Cash ${formatUsdCompact(agent.treasury.cashUsd)} · Stable ${formatUsdCompact(agent.treasury.stableUsd)}`}
        />
        <StatBlock
          label="Outstanding advances"
          value={formatUsdCompact(agent.outstandingAdvanceUsd)}
          tone={agent.outstandingAdvanceUsd > 0 ? "accent" : "neutral"}
          sub={`Mandate cap ${formatUsdCompact(agent.mandate.maxAdvanceUsd)}`}
        />
      </div>
      <Panel title="Revenue trend (8 months, simulated)">
        <RevenueChart agent={agent} />
      </Panel>
      <AgentTables agent={agent} />
      <AgentDecisions agentId={agent.id} />
    </div>
  );
}

function Header({ agent }: { agent: AgentRecord }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{agent.name}</h1>
          <Badge tone={statusTone(agent.status)}>{agent.status}</Badge>
        </div>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
          {agent.archetype} — {agent.description}
        </p>
      </div>
      <Link
        href={`/financing?agent=${agent.id}`}
        className="rounded-md bg-accent-deep px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-accent"
      >
        Request financing
      </Link>
    </div>
  );
}

function RevenueChart({ agent }: { agent: AgentRecord }) {
  const values = agent.revenueSeries.map((p) => p.revenueUsd);
  return (
    <div>
      <Sparkline
        data={values}
        width={860}
        height={140}
        stretch
        label={`${agent.name} monthly revenue`}
      />
      <div className="mt-2 flex justify-between text-[11px] text-ink-faint">
        {agent.revenueSeries.map((p) => (
          <span key={p.month} className="tabular">
            {p.month}
          </span>
        ))}
      </div>
    </div>
  );
}
