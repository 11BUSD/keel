import { beforeEach, describe, expect, it } from "vitest";
import { MockRiskEngine } from "./mockRiskEngine";
import { MockTreasuryEngine } from "./mockTreasuryEngine";
import { computeClusters, crowdingAddOn } from "./correlation";
import { feeFor } from "./riskRules";
import { findAgent, getWorld, resetWorld } from "./store";

const engine = new MockRiskEngine(new MockTreasuryEngine(0), 0);

beforeEach(() => resetWorld());

describe("correlation clusters (Round 10)", () => {
  it("groups agents by base model + strategy, deterministically", () => {
    const clusters = computeClusters(getWorld().agents);
    expect(clusters).toEqual(computeClusters(getWorld().agents));

    const crowded = clusters.find((c) => c.key === "helios-4::autonomous-b2b-services");
    expect(crowded).toBeDefined();
    expect(crowded!.size).toBe(3);
    expect(crowded!.agentNames.sort()).toEqual(["Courier", "SwarmLabel", "TickerMind"]);

    // Same model but different strategy is NOT the same bet.
    const polyglot = clusters.find((c) => c.agentIds.includes("agt-polyglot"));
    expect(polyglot!.size).toBe(1);
  });

  it("crowding add-on scales monotonically with cluster size and caps", () => {
    expect(crowdingAddOn(1)).toBe(0);
    expect(crowdingAddOn(2)).toBeCloseTo(0.02);
    expect(crowdingAddOn(3)).toBeCloseTo(0.04);
    expect(crowdingAddOn(4)).toBeGreaterThan(crowdingAddOn(3));
    expect(crowdingAddOn(10)).toBe(0.08);
  });

  it("a crowded cluster member pays a demonstrably higher fee", () => {
    const swarm = findAgent("agt-swarmlabel")!;
    expect(feeFor(swarm, crowdingAddOn(3))).toBeCloseTo(feeFor(swarm, 0) + 0.04, 6);
  });

  it("the crowding add-on appears as a named rule and lands in the approved terms", async () => {
    const decision = await engine.evaluate({
      agentId: "agt-swarmlabel",
      amountUsd: 15_000,
      purpose: "compute",
      termDays: 30,
    });
    expect(decision.outcome).toBe("approved");

    const rule = decision.ruleTrace.find((r) => r.id === "R9_CORRELATION_CROWDING");
    expect(rule).toBeDefined();
    expect(rule!.severity).toBe("info");
    expect(rule!.detail).toContain("Courier");
    expect(rule!.detail).toContain("TickerMind");
    expect(rule!.detail).toContain("4%");

    // Fee = base fee + 4% crowding for a 3-agent cluster.
    const swarm = findAgent("agt-swarmlabel")!;
    expect(decision.terms!.fee).toBeCloseTo(feeFor(swarm, 0.04), 6);
  });

  it("a singleton agent gets the rule with no add-on", async () => {
    const decision = await engine.evaluate({
      agentId: "agt-atlas",
      amountUsd: 10_000,
      purpose: "compute",
      termDays: 30,
    });
    const rule = decision.ruleTrace.find((r) => r.id === "R9_CORRELATION_CROWDING");
    expect(rule!.detail).toContain("No correlated peers");
    const atlas = findAgent("agt-atlas")!;
    expect(decision.terms!.fee).toBeCloseTo(feeFor(atlas, 0), 6);
  });

  it("the correlation report is exposed through the RiskEngine interface", async () => {
    const report = await engine.getCorrelationReport();
    expect(report[0].size).toBe(3);
    expect(report[0].feeAddOn).toBeCloseTo(0.04);
    expect(report).toHaveLength(6);
  });
});
