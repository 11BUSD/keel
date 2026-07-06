"use client";

import Link from "next/link";
import type { CorrelationCluster } from "@/domain";
import { Badge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { COPY } from "@/content/copy";
import { formatPct } from "@/lib/format";
import { useAgents, useCorrelationReport } from "@/hooks/useKeel";

const MAX_SHOWN_CROWDING = 4;

export function CorrelationScreen() {
  const report = useCorrelationReport();
  const agents = useAgents();

  if (report.isPending || agents.isPending) return <SkeletonRows rows={6} />;
  if (report.isError || !report.data) {
    return (
      <ErrorState detail="Could not compute correlation clusters." onRetry={() => report.refetch()} />
    );
  }

  return (
    <div className="space-y-4">
      <Panel title="Why this matters">
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink">
          {COPY.heroMoments.moat}
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {report.data.map((cluster) => (
          <ClusterCard key={cluster.key} cluster={cluster} />
        ))}
      </div>
    </div>
  );
}

function ClusterCard({ cluster }: { cluster: CorrelationCluster }) {
  const crowded = cluster.size > 1;
  return (
    <Panel
      title={`${cluster.baseModel} / ${cluster.strategyClass}`}
      action={
        <Badge tone={cluster.size >= 3 ? "danger" : crowded ? "caution" : "positive"}>
          {crowded ? `${cluster.size} correlated agents` : "singleton"}
        </Badge>
      }
    >
      <div className="space-y-3">
        <Meter
          fraction={cluster.size / MAX_SHOWN_CROWDING}
          tone={cluster.size >= 3 ? "danger" : crowded ? "caution" : "positive"}
          label={`${cluster.key} crowding`}
        />
        <ul className="space-y-1.5">
          {cluster.agentIds.map((id, i) => (
            <li key={id} className="flex items-center justify-between text-[13px]">
              <Link href={`/agents/${id}`} className="text-ink hover:text-accent">
                {cluster.agentNames[i]}
              </Link>
              <span className="font-mono text-[10px] text-ink-faint">{id}</span>
            </li>
          ))}
        </ul>
        <p className="rounded-md border border-line bg-surface-2 px-3 py-2 text-xs text-ink-muted">
          {crowded ? (
            <>
              Treated as <span className="text-ink">one exposure</span>. Each member
              pays a <span className="text-caution">+{formatPct(cluster.feeAddOn, 0)}</span>{" "}
              crowding fee add-on on new financing.
            </>
          ) : (
            <>Unique model + strategy — no crowding add-on.</>
          )}
        </p>
      </div>
    </Panel>
  );
}
