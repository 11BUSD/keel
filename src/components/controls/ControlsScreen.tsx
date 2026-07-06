"use client";

import { runwayDays, type AgentRecord } from "@/domain";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { COPY } from "@/content/copy";
import { formatDays, formatUsdCompact } from "@/lib/format";
import {
  useAgents,
  useFleetSummary,
  useGlobalFreeze,
  useKillSwitch,
} from "@/hooks/useKeel";
import { statusTone } from "@/components/statusTone";

export function ControlsScreen() {
  const agents = useAgents();
  const summary = useFleetSummary();
  const freeze = useGlobalFreeze();
  const kill = useKillSwitch();

  if (agents.isPending || summary.isPending) return <SkeletonRows rows={8} />;
  if (agents.isError || summary.isError || !agents.data || !summary.data) {
    return (
      <ErrorState detail="Could not load control state." onRetry={() => agents.refetch()} />
    );
  }

  const frozen = summary.data.globalFreeze;
  return (
    <div className="space-y-4">
      <Panel title={COPY.controls.freezeTitle}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[13px] text-ink-muted">{COPY.controls.freezeBody}</p>
            <div className="mt-2">
              {frozen ? (
                <Badge tone="danger">{COPY.controls.freezeOn}</Badge>
              ) : (
                <Badge tone="positive">{COPY.controls.freezeOff}</Badge>
              )}
            </div>
          </div>
          <Button
            variant={frozen ? "ghost" : "danger"}
            busy={freeze.isPending}
            onClick={() => freeze.mutate(!frozen)}
          >
            {frozen ? COPY.controls.releaseFreeze : COPY.controls.engageFreeze}
          </Button>
        </div>
      </Panel>

      <Panel title={COPY.controls.killTitle}>
        <p className="mb-3 text-[13px] text-ink-muted">{COPY.controls.killBody}</p>
        <ul className="divide-y divide-line/60">
          {agents.data.map((a) => (
            <KillRow key={a.id} agent={a} busy={kill.isPending} onToggle={kill.mutate} />
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function KillRow({
  agent,
  busy,
  onToggle,
}: {
  agent: AgentRecord;
  busy: boolean;
  onToggle: (args: { agentId: string; killed: boolean }) => void;
}) {
  const killed = agent.status === "killed";
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-3">
        <Badge tone={statusTone(agent.status)}>{agent.status}</Badge>
        <div>
          <div className="text-[13px] font-medium text-ink">{agent.name}</div>
          <div className="text-[11px] text-ink-faint">
            {formatUsdCompact(agent.trailing30dRevenueUsd)}/30d ·{" "}
            {formatDays(runwayDays(agent.treasury))} runway
          </div>
        </div>
      </div>
      <Button
        variant={killed ? "ghost" : "danger"}
        busy={busy}
        disabled={agent.status === "paused"}
        onClick={() => onToggle({ agentId: agent.id, killed: !killed })}
      >
        {killed ? COPY.controls.reactivate : COPY.controls.kill}
      </Button>
    </li>
  );
}
