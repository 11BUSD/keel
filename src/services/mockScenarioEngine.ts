import {
  scenarioIdSchema,
  scenarioResultSchema,
  type ScenarioId,
  type ScenarioResult,
  type ScenarioSpec,
  type ScenarioState,
} from "@/domain";
import { formatUsd } from "@/lib/format";
import type { ScenarioEngine } from "./interfaces";
import {
  planCohortCascade,
  planDepeg,
  planFlashCrash,
  planOracleFailure,
  scenarioSpecs,
  type ShockPlan,
} from "./scenarioDefs";
import { appendAudit, delay, getWorld } from "./store";
import { applyLoss, seedWaterfall } from "./waterfall";

/** Round 11 (ADR-0011): the operator-triggered catastrophe theater. */
export class MockScenarioEngine implements ScenarioEngine {
  constructor(private readonly latencyMs = 800) {}

  async list(): Promise<ScenarioSpec[]> {
    return scenarioSpecs;
  }

  async run(rawId: ScenarioId): Promise<ScenarioResult> {
    const id = scenarioIdSchema.parse(rawId);
    await delay(this.latencyMs);
    const world = getWorld();
    const spec = scenarioSpecs.find((s) => s.id === id)!;

    const plan: ShockPlan =
      id === "flash_crash"
        ? planFlashCrash(world.agents)
        : id === "stablecoin_depeg"
          ? planDepeg(world.agents)
          : id === "oracle_failure"
            ? planOracleFailure()
            : planCohortCascade(world.agents);

    appendAudit({
      actor: "operator:demo",
      category: "control",
      action: "scenario.started",
      detail: `${spec.name} injected (simulated).`,
    });

    let absorbedUsd = 0;
    let uncoveredUsd = 0;
    const timeline = [...plan.timeline];
    if (plan.halted) {
      world.globalFreeze = true;
      appendAudit({
        actor: "fail-safe",
        category: "control",
        action: "scenario.halted",
        detail: "Ambiguous oracle state → HALT-and-hold. Global freeze engaged; no automated action taken.",
      });
    } else {
      const absorption = applyLoss(world.waterfall, plan.lossUsd);
      absorbedUsd = absorption.absorbedUsd;
      uncoveredUsd = absorption.uncoveredUsd;
      for (const layer of absorption.perLayer) {
        timeline.push({
          step: timeline.length,
          actor: "waterfall",
          action: "layer.absorbed",
          detail: `${layer.label} absorbs ${formatUsd(layer.absorbedUsd)}.`,
        });
      }
      if (uncoveredUsd > 0) {
        const provider = world.capitalProvider;
        provider.lossUsd += uncoveredUsd;
        provider.availableUsd = Math.max(0, provider.availableUsd - uncoveredUsd);
        timeline.push({
          step: timeline.length,
          actor: "waterfall",
          action: "waterfall.exhausted",
          detail: `${formatUsd(uncoveredUsd)} exceeds all six layers — ${provider.name} absorbs the remainder.`,
        });
        appendAudit({
          actor: "waterfall",
          category: "control",
          action: "provider.loss",
          detail: `${formatUsd(uncoveredUsd)} pierced the full waterfall and was attributed to ${provider.name}.`,
        });
      }
      appendAudit({
        actor: "waterfall",
        category: "control",
        action: "scenario.absorbed",
        detail: `${spec.name}: ${formatUsd(plan.lossUsd)} loss; ${formatUsd(absorbedUsd)} absorbed across ${world.waterfall.filter((l) => l.absorbedUsd > 0).length} layer(s); ${formatUsd(uncoveredUsd)} uncovered.`,
      });
    }

    const result = scenarioResultSchema.parse({
      scenarioId: id,
      name: spec.name,
      lossUsd: plan.lossUsd,
      absorbedUsd,
      uncoveredUsd,
      halted: plan.halted,
      throttled: plan.throttled,
      timeline,
      layers: structuredClone(world.waterfall),
    });
    world.lastScenario = result;
    return structuredClone(result);
  }

  async getState(): Promise<ScenarioState> {
    await delay(Math.min(this.latencyMs, 250));
    const world = getWorld();
    return {
      layers: structuredClone(world.waterfall),
      lastResult: world.lastScenario ? structuredClone(world.lastScenario) : null,
    };
  }

  async reset(): Promise<void> {
    await delay(Math.min(this.latencyMs, 250));
    const world = getWorld();
    world.waterfall = seedWaterfall();
    world.lastScenario = null;
    world.globalFreeze = false;
    appendAudit({
      actor: "operator:demo",
      category: "control",
      action: "scenario.reset",
      detail: "Waterfall capacity restored and scenario halt lifted.",
    });
  }
}
