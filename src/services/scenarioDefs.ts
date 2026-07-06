import type { AgentRecord, ScenarioSpec, TimelineStep } from "@/domain";
import { formatUsd } from "@/lib/format";
import { computeClusters } from "./correlation";

/**
 * Round 11: deterministic scenario definitions (ADR-0011). Each shock computes a
 * loss from the current world state and narrates a timeline of the automated
 * responses. No randomness, no market data — the same world produces the same
 * catastrophe every run.
 */

// Severity constants are the scenario "script" — tuned so the flash crash reaches
// deep layers while the depeg stays shallow, per the demo narrative.
export const FLASH_CRASH_POSITION_LOSS = 0.45;
export const DEPEG_HAIRCUT = 0.04;
export const CASCADE_ADVANCE_LOSS = 0.5;
export const CASCADE_REVENUE_LOSS = 0.35;
export const LIQUIDATION_TRANCHES = 2;

export const scenarioSpecs: ScenarioSpec[] = [
  {
    id: "flash_crash",
    name: "Flash crash",
    description:
      "Marketplace positions reprice violently. Circuit breakers pause, positions are repriced, and the crystallized loss walks down the waterfall.",
  },
  {
    id: "stablecoin_depeg",
    name: "Stablecoin de-peg",
    description:
      "The fleet's stable reserves take a 4% haircut. A shallow loss the first layers absorb without touching mutualized capital.",
  },
  {
    id: "oracle_failure",
    name: "Oracle failure",
    description:
      "Price feeds diverge beyond tolerance. Fail-safe default: the system HALTS everything and waits for a human — ambiguity never triggers action.",
  },
  {
    id: "cohort_cascade",
    name: "Correlated-cohort cascade",
    description:
      "The crowded model cluster fails together. Cohort-aware, rate-limited liquidation staggers the unwind instead of dumping simultaneously.",
  },
];

export interface ShockPlan {
  lossUsd: number;
  halted: boolean;
  throttled: boolean;
  timeline: TimelineStep[];
}

type StepInput = Omit<TimelineStep, "step">;

function timeline(steps: StepInput[]): TimelineStep[] {
  return steps.map((s, step) => ({ step, ...s }));
}

export function planFlashCrash(agents: AgentRecord[]): ShockPlan {
  const exposed = agents
    .filter((a) => a.status === "active")
    .flatMap((a) => a.positions)
    .filter((p) => p.kind !== "stable_reserve");
  const exposedUsd = exposed.reduce((s, p) => s + p.valueUsd, 0);
  const lossUsd = Math.round(exposedUsd * FLASH_CRASH_POSITION_LOSS);
  return {
    lossUsd,
    halted: false,
    throttled: false,
    timeline: timeline([
      { actor: "market-monitor", action: "shock.detected", detail: `Marketplace prints gap ${FLASH_CRASH_POSITION_LOSS * 100}% down across ${exposed.length} non-stable positions (${formatUsd(exposedUsd)} exposed).` },
      { actor: "circuit-breaker", action: "trading.paused", detail: "Circuit breaker engaged: all agent spending and new financing paused during repricing." },
      { actor: "risk-engine", action: "positions.repriced", detail: `Positions marked to the post-crash print; crystallized loss ${formatUsd(lossUsd)}.` },
      { actor: "waterfall", action: "loss.allocated", detail: "Loss handed to the default waterfall for layered absorption." },
    ]),
  };
}

export function planDepeg(agents: AgentRecord[]): ShockPlan {
  const stableUsd = agents.reduce((s, a) => s + a.treasury.stableUsd, 0);
  const lossUsd = Math.round(stableUsd * DEPEG_HAIRCUT);
  return {
    lossUsd,
    halted: false,
    throttled: false,
    timeline: timeline([
      { actor: "market-monitor", action: "depeg.detected", detail: `Reference stablecoin trades ${DEPEG_HAIRCUT * 100}% below par; fleet stable reserves ${formatUsd(stableUsd)}.` },
      { actor: "risk-engine", action: "reserves.haircut", detail: `Stable reserves marked down; crystallized loss ${formatUsd(lossUsd)}.` },
      { actor: "waterfall", action: "loss.allocated", detail: "Shallow loss absorbed at the top of the waterfall." },
    ]),
  };
}

export function planOracleFailure(): ShockPlan {
  return {
    lossUsd: 0,
    halted: true,
    throttled: false,
    timeline: timeline([
      { actor: "oracle-monitor", action: "divergence.detected", detail: "Primary and fallback price feeds diverge beyond tolerance — state is ambiguous." },
      { actor: "fail-safe", action: "system.halted", detail: "Fail-safe default: HALT. No liquidation, no financing, no repricing on ambiguous data. Global freeze engaged pending human review." },
    ]),
  };
}

export function planCohortCascade(agents: AgentRecord[]): ShockPlan {
  const crowded = computeClusters(agents)
    .filter((c) => c.size > 1)
    .sort((a, b) => b.size - a.size)[0];
  const members = agents.filter((a) => crowded?.agentIds.includes(a.id));
  const lossUsd = Math.round(
    members.reduce(
      (s, m) =>
        s + m.outstandingAdvanceUsd * CASCADE_ADVANCE_LOSS + m.trailing30dRevenueUsd * CASCADE_REVENUE_LOSS,
      0,
    ),
  );
  const steps: StepInput[] = [
    { actor: "risk-engine", action: "cohort.breach", detail: `Correlated cluster ${crowded?.key} degrades together — ${members.length} agents treated as ONE exposure (${crowded?.agentNames.join(", ")}).` },
    { actor: "cohort-throttle", action: "liquidation.throttled", detail: "Cohort-aware throttle engaged: unwind is staggered and rate-limited, not a simultaneous dump." },
  ];
  for (let tranche = 1; tranche <= LIQUIDATION_TRANCHES; tranche++) {
    for (const m of members) {
      steps.push({
        actor: "liquidation-engine",
        action: "liquidation.tranche",
        detail: `${m.name}: tranche ${tranche}/${LIQUIDATION_TRANCHES} unwound at the rate limit; market impact contained before the next tranche.`,
      });
    }
  }
  steps.push({ actor: "waterfall", action: "loss.allocated", detail: `Staggered unwind complete; residual loss ${formatUsd(lossUsd)} to the waterfall.` });
  return { lossUsd, halted: false, throttled: true, timeline: timeline(steps) };
}
