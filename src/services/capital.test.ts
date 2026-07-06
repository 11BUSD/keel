import { beforeEach, describe, expect, it } from "vitest";
import { PROVIDER_FEE_SHARE } from "@/domain";
import { MockRiskEngine } from "./mockRiskEngine";
import { MockScenarioEngine } from "./mockScenarioEngine";
import { MockTreasuryEngine } from "./mockTreasuryEngine";
import { getWorld, resetWorld } from "./store";

const treasury = new MockTreasuryEngine(0);
const engine = new MockRiskEngine(treasury, 0);
const scenarios = new MockScenarioEngine(0);

const approve = (amountUsd: number) =>
  engine.evaluate({ agentId: "agt-swarmlabel", amountUsd, purpose: "compute", termDays: 30 });

beforeEach(() => resetWorld());

describe("capital provider accounting (Round 12)", () => {
  it("funds an advance and earns its share of the upfront fee", async () => {
    const before = structuredClone(getWorld().capitalProvider);
    const decision = await approve(20_000);
    const feeUsd = 20_000 * decision.terms!.fee;
    const spread = feeUsd * PROVIDER_FEE_SHARE;

    const provider = getWorld().capitalProvider;
    expect(provider.deployedUsd).toBe(20_000);
    expect(provider.earnedSpreadUsd).toBeCloseTo(spread, 2);
    expect(provider.availableUsd).toBeCloseTo(before.availableUsd - 20_000 + spread, 2);
    expect(provider.allocations).toHaveLength(1);
    expect(provider.allocations[0].fundedUsd).toBe(20_000);
  });

  it("repayment releases provider capital; full repay nets exactly the spread", async () => {
    const initialAvailable = getWorld().capitalProvider.availableUsd;
    const decision = await approve(5_000);
    const spread = 5_000 * decision.terms!.fee * PROVIDER_FEE_SHARE;

    await treasury.advanceTime(30);
    const provider = getWorld().capitalProvider;
    expect(provider.deployedUsd).toBeCloseTo(0, 2);
    expect(provider.allocations).toHaveLength(0);
    expect(provider.availableUsd).toBeCloseTo(initialAvailable + spread, 2);
  });

  it("deploy and withdraw move liquid capital, bounded by what is not at work", async () => {
    await treasury.deployCapital(250_000);
    expect(getWorld().capitalProvider.committedUsd).toBe(1_750_000);

    await approve(20_000);
    const liquid = getWorld().capitalProvider.availableUsd;
    await expect(treasury.withdrawCapital(liquid + 1)).rejects.toThrow(/liquid/i);
    await treasury.withdrawCapital(100_000);
    expect(getWorld().capitalProvider.availableUsd).toBeCloseTo(liquid - 100_000, 2);

    await expect(treasury.deployCapital(-5)).rejects.toThrow();
  });

  it("the waterfall protects the provider: a deep shock causes zero provider loss", async () => {
    await approve(20_000);
    const result = await scenarios.run("flash_crash");
    expect(result.lossUsd).toBeGreaterThan(100_000);
    expect(result.uncoveredUsd).toBe(0);
    expect(getWorld().capitalProvider.lossUsd).toBe(0);
  });

  it("only a waterfall-piercing loss is attributed to the provider, exactly", async () => {
    // Collapse the waterfall to a sliver so the shock pierces all layers.
    const world = getWorld();
    world.waterfall = world.waterfall.map((l) => ({ ...l, capacityUsd: 1_000 }));
    const availableBefore = world.capitalProvider.availableUsd;

    const result = await scenarios.run("flash_crash");
    expect(result.uncoveredUsd).toBe(result.lossUsd - 6_000);
    expect(world.capitalProvider.lossUsd).toBe(result.uncoveredUsd);
    expect(world.capitalProvider.availableUsd).toBeCloseTo(
      availableBefore - result.uncoveredUsd,
      2,
    );
  });
});
