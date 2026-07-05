import { describe, expect, it } from "vitest";
import { agentRecordSchema, runwayDays } from "@/domain";
import { coefficientOfVariation, generateFleet } from "./generator";

describe("generateFleet", () => {
  it("is deterministic for the same seed", () => {
    expect(generateFleet(42)).toEqual(generateFleet(42));
  });

  it("produces different worlds for different seeds", () => {
    const a = generateFleet(1).map((x) => x.revenueSeries);
    const b = generateFleet(2).map((x) => x.revenueSeries);
    expect(a).not.toEqual(b);
  });

  it("emits schema-valid records for the demo fleet", () => {
    const fleet = generateFleet();
    expect(fleet).toHaveLength(8);
    for (const agent of fleet) {
      expect(() => agentRecordSchema.parse(agent)).not.toThrow();
    }
  });

  it("tunes the demo beats: low runway, concentration, revenue floor", () => {
    const fleet = generateFleet();
    const byId = new Map(fleet.map((a) => [a.id, a]));
    // SwarmLabel is the financing candidate: healthy revenue, short runway.
    const swarm = byId.get("agt-swarmlabel")!;
    expect(runwayDays(swarm.treasury)).toBeLessThan(20);
    expect(swarm.trailing30dRevenueUsd).toBeGreaterThan(50_000);
    // TickerMind fails concentration; Nightjar fails the revenue floor.
    const ticker = byId.get("agt-tickermind")!;
    expect(Math.max(...ticker.counterparties.map((c) => c.revenueShare))).toBeGreaterThan(0.7);
    const nightjar = byId.get("agt-nightjar")!;
    expect(nightjar.trailing30dRevenueUsd).toBeLessThan(10_000);
  });
});

describe("coefficientOfVariation", () => {
  it("is 0 for a flat series and positive for a noisy one", () => {
    const flat = [1, 2, 3].map((i) => ({ month: `2026-0${i}`, revenueUsd: 100 }));
    expect(coefficientOfVariation(flat)).toBe(0);
    const noisy = [
      { month: "2026-01", revenueUsd: 50 },
      { month: "2026-02", revenueUsd: 150 },
    ];
    expect(coefficientOfVariation(noisy)).toBeGreaterThan(0.4);
  });
});
