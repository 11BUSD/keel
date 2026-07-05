"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { runwayDays, topCounterpartyShare, type AgentRecord } from "@/domain";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Select, TextInput } from "@/components/ui/Field";
import { Sparkline } from "@/components/ui/Sparkline";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/ui/States";
import { formatDays, formatPct, formatUsdCompact } from "@/lib/format";
import { useAgents } from "@/hooks/useKeel";
import { runwayTone, statusTone } from "@/components/statusTone";

const columns: Column<AgentRecord>[] = [
  {
    key: "name",
    label: "Agent",
    sortValue: (a) => a.name,
    render: (a) => (
      <div>
        <div className="font-medium text-ink">{a.name}</div>
        <div className="text-xs text-ink-faint">{a.archetype}</div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortValue: (a) => a.status,
    render: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge>,
  },
  {
    key: "revenue",
    label: "Revenue (30d)",
    align: "right",
    sortValue: (a) => a.trailing30dRevenueUsd,
    render: (a) => (
      <div className="flex items-center justify-end gap-3">
        <Sparkline
          data={a.revenueSeries.map((p) => p.revenueUsd)}
          label={`${a.name} revenue trend`}
        />
        <span>{formatUsdCompact(a.trailing30dRevenueUsd)}</span>
      </div>
    ),
  },
  {
    key: "runway",
    label: "Runway",
    align: "right",
    sortValue: (a) => runwayDays(a.treasury),
    render: (a) => {
      const days = runwayDays(a.treasury);
      const toneClass = {
        positive: "text-positive",
        caution: "text-caution",
        danger: "text-danger",
      }[runwayTone(days)];
      return <span className={toneClass}>{formatDays(days)}</span>;
    },
  },
  {
    key: "treasury",
    label: "Treasury",
    align: "right",
    sortValue: (a) => a.treasury.cashUsd + a.treasury.stableUsd,
    render: (a) => formatUsdCompact(a.treasury.cashUsd + a.treasury.stableUsd),
  },
  {
    key: "outstanding",
    label: "Advances",
    align: "right",
    sortValue: (a) => a.outstandingAdvanceUsd,
    render: (a) =>
      a.outstandingAdvanceUsd > 0 ? (
        <span className="text-accent">{formatUsdCompact(a.outstandingAdvanceUsd)}</span>
      ) : (
        <span className="text-ink-faint">—</span>
      ),
  },
  {
    key: "concentration",
    label: "Top CP share",
    align: "right",
    sortValue: (a) => topCounterpartyShare(a),
    render: (a) => {
      const share = topCounterpartyShare(a);
      return (
        <span className={share > 0.7 ? "text-danger" : share > 0.5 ? "text-caution" : ""}>
          {formatPct(share, 0)}
        </span>
      );
    },
  },
];

export function FleetTable() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useAgents();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (a) =>
        (status === "all" || a.status === status) &&
        (query === "" ||
          `${a.name} ${a.archetype}`.toLowerCase().includes(query.toLowerCase())),
    );
  }, [data, query, status]);

  if (isPending) return <SkeletonRows rows={8} />;
  if (isError)
    return (
      <ErrorState detail="The ledger could not be read." onRetry={() => refetch()} />
    );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <TextInput
          aria-label="Search agents"
          placeholder="Search agents…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-60"
        />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-40"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="killed">Killed</option>
        </Select>
        <span className="text-xs text-ink-faint">
          {filtered.length} of {data.length} agents
        </span>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No agents match"
          detail="Adjust the search or status filter to see the fleet."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(a) => a.id}
          onRowClick={(a) => router.push(`/agents/${a.id}`)}
          initialSort={{ key: "revenue", dir: "desc" }}
        />
      )}
    </div>
  );
}
