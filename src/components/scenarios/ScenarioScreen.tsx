"use client";

import type { ScenarioResult } from "@/domain";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/ui/States";
import { formatUsd } from "@/lib/format";
import {
  useResetScenario,
  useRunScenario,
  useScenarioSpecs,
  useScenarioState,
} from "@/hooks/useKeel";
import { WaterfallViz } from "./WaterfallViz";

export function ScenarioScreen() {
  const specs = useScenarioSpecs();
  const state = useScenarioState();
  const run = useRunScenario();
  const reset = useResetScenario();

  if (specs.isPending || state.isPending) return <SkeletonRows rows={8} />;
  if (specs.isError || state.isError || !specs.data || !state.data) {
    return (
      <ErrorState detail="Could not load the scenario console." onRetry={() => state.refetch()} />
    );
  }

  const last = state.data.lastResult;
  return (
    <div className="space-y-4">
      <Panel
        title="Inject a catastrophe"
        action={
          <Button variant="ghost" busy={reset.isPending} onClick={() => reset.mutate()}>
            Reset scenario state
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {specs.data.map((spec) => (
            <div key={spec.id} className="flex flex-col rounded-md border border-line bg-surface-2 p-3">
              <span className="text-[13px] font-medium text-ink">{spec.name}</span>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-muted">{spec.description}</p>
              <Button
                variant="danger"
                className="mt-3 self-start"
                busy={run.isPending && run.variables === spec.id}
                disabled={run.isPending}
                onClick={() => run.mutate(spec.id)}
              >
                Run {spec.name.toLowerCase()}
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Default waterfall — who absorbs the loss">
          <WaterfallViz layers={state.data.layers} />
          <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
            Losses fill each layer completely before touching the next. Capital
            providers sit behind all six layers — they lose only if the entire
            waterfall is exhausted.
          </p>
        </Panel>
        <Panel title="Automated response timeline">
          {last ? (
            <ResultTimeline result={last} />
          ) : (
            <EmptyState
              title="No scenario run yet"
              detail="Inject a catastrophe to watch the safety machinery respond step by step."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

function ResultTimeline({ result }: { result: ScenarioResult }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={result.halted ? "danger" : "caution"}>
          {result.halted ? "HALTED — fail-safe default" : result.name}
        </Badge>
        {result.throttled && <Badge tone="accent">throttled unwind</Badge>}
        {!result.halted && (
          <span className="text-xs text-ink-muted">
            Loss {formatUsd(result.lossUsd)} · absorbed {formatUsd(result.absorbedUsd)}
            {result.uncoveredUsd > 0 && ` · UNCOVERED ${formatUsd(result.uncoveredUsd)}`}
          </span>
        )}
      </div>
      <ol className="space-y-1.5">
        {result.timeline.map((t) => (
          <li key={t.step} className="flex gap-3 rounded-md border border-line bg-surface-2 px-3 py-2">
            <span className="font-mono text-[10px] text-ink-faint">t+{t.step}</span>
            <div className="min-w-0">
              <div className="text-xs font-medium text-ink">
                {t.action}
                <span className="ml-2 font-normal text-ink-faint">{t.actor}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{t.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
