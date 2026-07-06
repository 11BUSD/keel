import { beforeEach, describe, expect, it } from "vitest";
import { runwayDays } from "@/domain";
import { MockRiskEngine } from "./mockRiskEngine";
import { MockTreasuryEngine } from "./mockTreasuryEngine";
import { reserveFloorUsd } from "./treasurySim";
import { findAgent, getWorld, resetWorld } from "./store";

const treasury = new MockTreasuryEngine(0);
const engine = new MockRiskEngine(treasury, 0);

beforeEach(() => resetWorld());

describe("advanceTime — financing lifecycle (Round 9)", () => {
  it("revenue-share sweeps repay an advance day by day, honoring approval terms", async () => {
    const decision = await engine.evaluate({
      agentId: "agt-swarmlabel",
      amountUsd: 20_000,
      purpose: "compute",
      termDays: 30,
    });
    expect(decision.outcome).toBe("approved");
    const adv = getWorld().advances[0];
    expect(adv.outstandingUsd).toBe(20_000);

    const agent = findAgent("agt-swarmlabel")!;
    const dailyRevenue = agent.trailing30dRevenueUsd / 30;
    const report = await treasury.advanceTime(7);

    // SwarmLabel repays revenueShare × dailyRevenue each day.
    const expectedDaily = decision.terms!.revenueShare * dailyRevenue;
    expect(adv.repaidUsd).toBeCloseTo(expectedDaily * 7, 0);
    expect(adv.outstandingUsd).toBeCloseTo(20_000 - expectedDaily * 7, 0);
    expect(adv.status).toBe("active");
    expect(report.repaidUsd).toBeGreaterThan(0);
    expect(agent.outstandingAdvanceUsd).toBeCloseTo(adv.outstandingUsd, 0);
  });

  it("an advance fully repays over enough time and is marked repaid", async () => {
    await engine.evaluate({
      agentId: "agt-swarmlabel",
      amountUsd: 5_000,
      purpose: "compute",
      termDays: 30,
    });
    const report = await treasury.advanceTime(30);
    const adv = getWorld().advances[0];
    expect(adv.status).toBe("repaid");
    expect(adv.outstandingUsd).toBe(0);
    expect(adv.repaidUsd).toBeCloseTo(5_000, 0);
    expect(report.advancesFullyRepaid).toBe(1);
    expect(findAgent("agt-swarmlabel")!.outstandingAdvanceUsd).toBe(0);
  });

  it("sweeps surplus into T-bills ONLY above the reserve floor — runway is protected", async () => {
    await treasury.advanceTime(30);
    for (const agent of getWorld().agents) {
      if (agent.status !== "active") continue;
      if (agent.tbill.balanceUsd > 0) {
        // Anyone who swept must still hold at least the reserve floor in cash,
        // i.e. runway never drops below the mandate's minimum because of a sweep.
        expect(agent.treasury.cashUsd).toBeGreaterThanOrEqual(
          reserveFloorUsd(agent) - 0.01,
        );
        expect(runwayDays(agent.treasury)).toBeGreaterThanOrEqual(
          agent.mandate.minRunwayDays - 0.01,
        );
      }
    }
  });

  it("an agent below its reserve floor never sweeps", async () => {
    const swarm = findAgent("agt-swarmlabel")!;
    // Drain SwarmLabel below its floor; net-negative margin keeps it below.
    swarm.treasury.cashUsd = 1_000;
    swarm.treasury.stableUsd = 0;
    swarm.treasury.dailyBurnUsd = swarm.trailing30dRevenueUsd / 30 + 500;
    await treasury.advanceTime(5);
    expect(swarm.tbill.balanceUsd).toBe(0);
  });

  it("redeems T-bills back to cash when burn pulls the reserve below its floor", async () => {
    // Nightjar burns more than it earns: after its day-1 sweep, the ladder must
    // redeem daily to hold the floor rather than letting runway bleed out.
    const nightjar = findAgent("agt-nightjar")!;
    const floor = reserveFloorUsd(nightjar);
    await treasury.advanceTime(30);
    expect(nightjar.tbill.balanceUsd).toBeGreaterThan(0);
    expect(nightjar.treasury.cashUsd).toBeGreaterThanOrEqual(floor - 0.01);
  });

  it("T-bill yield accrues deterministically and compounds", async () => {
    const atlas = findAgent("agt-atlas")!;
    await treasury.advanceTime(1); // first sweep
    const balanceAfterSweep = atlas.tbill.balanceUsd;
    expect(balanceAfterSweep).toBeGreaterThan(0);
    await treasury.advanceTime(1);
    expect(atlas.tbill.yieldAccruedUsd).toBeGreaterThan(0);
    // Re-run from a fresh world: identical outcome (determinism).
    const snapshot = atlas.tbill.balanceUsd;
    resetWorld();
    await treasury.advanceTime(1);
    await treasury.advanceTime(1);
    expect(findAgent("agt-atlas")!.tbill.balanceUsd).toBeCloseTo(snapshot, 6);
  });

  it("killed agents neither earn, burn, nor repay while killed", async () => {
    await engine.evaluate({
      agentId: "agt-swarmlabel",
      amountUsd: 10_000,
      purpose: "compute",
      termDays: 30,
    });
    const swarm = findAgent("agt-swarmlabel")!;
    swarm.status = "killed";
    const cashBefore = swarm.treasury.cashUsd;
    const outstandingBefore = getWorld().advances[0].outstandingUsd;
    await treasury.advanceTime(10);
    expect(swarm.treasury.cashUsd).toBe(cashBefore);
    expect(getWorld().advances[0].outstandingUsd).toBe(outstandingBefore);
  });

  it("rejects a non-integer or out-of-range day count at the boundary", async () => {
    await expect(treasury.advanceTime(0)).rejects.toThrow();
    await expect(treasury.advanceTime(2.5)).rejects.toThrow();
    await expect(treasury.advanceTime(365)).rejects.toThrow();
  });
});
