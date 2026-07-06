import { beforeEach, describe, expect, it } from "vitest";
import { MockRiskEngine } from "./mockRiskEngine";
import { MockScenarioEngine } from "./mockScenarioEngine";
import { MockTreasuryEngine } from "./mockTreasuryEngine";
import { applyLoss, seedWaterfall, totalCapacityUsd } from "./waterfall";
import { getWorld, resetWorld } from "./store";

const scenarios = new MockScenarioEngine(0);
const riskEngine = new MockRiskEngine(new MockTreasuryEngine(0), 0);

beforeEach(() => resetWorld());

describe("default waterfall accounting", () => {
  it("conserves totals: absorbed + uncovered equals the loss", () => {
    const layers = seedWaterfall();
    const r = applyLoss(layers, 275_000);
    expect(r.absorbedUsd + r.uncoveredUsd).toBe(275_000);
    expect(r.uncoveredUsd).toBe(0);
    expect(layers.reduce((s, l) => s + l.absorbedUsd, 0)).toBe(275_000);
  });

  it("exhausts each layer completely before touching the next", () => {
    const layers = seedWaterfall();
    applyLoss(layers, 275_000); // 50k + 100k + 125k of cohort margin
    expect(layers[0].absorbedUsd).toBe(layers[0].capacityUsd);
    expect(layers[1].absorbedUsd).toBe(layers[1].capacityUsd);
    expect(layers[2].absorbedUsd).toBe(125_000);
    expect(layers[3].absorbedUsd).toBe(0);
    expect(layers[4].absorbedUsd).toBe(0);
  });

  it("losses beyond total capacity are uncovered, never lost", () => {
    const layers = seedWaterfall();
    const capacity = totalCapacityUsd(layers);
    const r = applyLoss(layers, capacity + 90_000);
    expect(r.absorbedUsd).toBe(capacity);
    expect(r.uncoveredUsd).toBe(90_000);
  });
});

describe("stress scenarios (Round 11)", () => {
  it("oracle divergence HALTS instead of acting: freeze on, waterfall untouched", async () => {
    const result = await scenarios.run("oracle_failure");
    expect(result.halted).toBe(true);
    expect(result.lossUsd).toBe(0);
    expect(result.layers.every((l) => l.absorbedUsd === 0)).toBe(true);
    expect(getWorld().globalFreeze).toBe(true);

    // The halt is real: financing is denied fleet-wide while halted.
    const decision = await riskEngine.evaluate({
      agentId: "agt-atlas",
      amountUsd: 10_000,
      purpose: "compute",
      termDays: 30,
    });
    expect(decision.outcome).toBe("denied");
  });

  it("the flash crash reaches deeper layers with conserved accounting", async () => {
    const result = await scenarios.run("flash_crash");
    expect(result.halted).toBe(false);
    expect(result.lossUsd).toBeGreaterThan(seedWaterfall()[0].capacityUsd);
    expect(result.absorbedUsd + result.uncoveredUsd).toBe(result.lossUsd);
    const touched = result.layers.filter((l) => l.absorbedUsd > 0);
    expect(touched.length).toBeGreaterThanOrEqual(2);
  });

  it("the de-peg stays shallow: only the top of the waterfall absorbs", async () => {
    const result = await scenarios.run("stablecoin_depeg");
    expect(result.lossUsd).toBeLessThan(seedWaterfall()[0].capacityUsd);
    expect(result.layers[0].absorbedUsd).toBe(result.lossUsd);
    expect(result.layers.slice(1).every((l) => l.absorbedUsd === 0)).toBe(true);
  });

  it("the cohort cascade is throttled and staggered, member by member", async () => {
    const result = await scenarios.run("cohort_cascade");
    expect(result.throttled).toBe(true);
    const tranches = result.timeline.filter((t) => t.action === "liquidation.tranche");
    // 3 crowded-cluster members × 2 rate-limited tranches, in sequence.
    expect(tranches).toHaveLength(6);
    for (const name of ["SwarmLabel", "Courier", "TickerMind"]) {
      expect(tranches.some((t) => t.detail.includes(name))).toBe(true);
    }
    expect(result.timeline.some((t) => t.action === "liquidation.throttled")).toBe(true);
  });

  it("scenarios are deterministic across identical worlds", async () => {
    const first = await scenarios.run("flash_crash");
    resetWorld();
    const second = await scenarios.run("flash_crash");
    expect(second.lossUsd).toBe(first.lossUsd);
    expect(second.layers).toEqual(first.layers);
    expect(second.timeline.map((t) => t.action)).toEqual(first.timeline.map((t) => t.action));
  });

  it("reset restores capacity and lifts the halt", async () => {
    await scenarios.run("flash_crash");
    await scenarios.run("oracle_failure");
    await scenarios.reset();
    const state = await scenarios.getState();
    expect(state.layers.every((l) => l.absorbedUsd === 0)).toBe(true);
    expect(state.lastResult).toBeNull();
    expect(getWorld().globalFreeze).toBe(false);
  });
});
