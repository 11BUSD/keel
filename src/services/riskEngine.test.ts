import { beforeEach, describe, expect, it } from "vitest";
import type { FinancingRequestInput } from "@/domain";
import { MockAuditLog } from "./mockAuditLog";
import { MockMandateEngine } from "./mockMandateEngine";
import { MockRiskEngine } from "./mockRiskEngine";
import { MockTreasuryEngine } from "./mockTreasuryEngine";
import { collateralCapacity } from "./riskRules";
import { findAgent, getWorld, resetWorld } from "./store";

const treasury = new MockTreasuryEngine();
const engine = new MockRiskEngine(treasury, 0);
const mandates = new MockMandateEngine(treasury, 0);
const audit = new MockAuditLog(0);

const request = (over: Partial<FinancingRequestInput> = {}): FinancingRequestInput => ({
  agentId: "agt-swarmlabel",
  amountUsd: 20_000,
  purpose: "compute",
  termDays: 30,
  ...over,
});

beforeEach(() => resetWorld());

describe("MockRiskEngine.evaluate", () => {
  it("approves a healthy request and applies it to the treasury", async () => {
    const before = findAgent("agt-swarmlabel")!;
    const cashBefore = before.treasury.cashUsd;

    const decision = await engine.evaluate(request());

    expect(decision.outcome).toBe("approved");
    expect(decision.terms).toBeDefined();
    expect(decision.terms!.netDisbursedUsd).toBeLessThan(20_000);
    expect(decision.ruleTrace.every((r) => r.severity !== "hard" || r.passed)).toBe(true);

    const after = findAgent("agt-swarmlabel")!;
    expect(after.treasury.cashUsd).toBe(cashBefore + decision.terms!.netDisbursedUsd);
    expect(after.outstandingAdvanceUsd).toBe(20_000);
  });

  it("denies on counterparty concentration with remediation", async () => {
    const decision = await engine.evaluate(request({ agentId: "agt-tickermind", amountUsd: 5_000 }));
    expect(decision.outcome).toBe("denied");
    const failed = decision.ruleTrace.find((r) => r.id === "R4_CONCENTRATION");
    expect(failed?.passed).toBe(false);
    expect(decision.remediation.length).toBeGreaterThan(0);
    expect(findAgent("agt-tickermind")!.outstandingAdvanceUsd).toBe(0);
  });

  it("denies below the verifiable revenue floor", async () => {
    const decision = await engine.evaluate(request({ agentId: "agt-nightjar", amountUsd: 1_000 }));
    expect(decision.outcome).toBe("denied");
    expect(decision.ruleTrace.find((r) => r.id === "R3_REVENUE_FLOOR")?.passed).toBe(false);
  });

  it("denies a paused agent and a disallowed purpose", async () => {
    const decision = await engine.evaluate(request({ agentId: "agt-polyglot", purpose: "compute" }));
    expect(decision.outcome).toBe("denied");
    expect(decision.ruleTrace.find((r) => r.id === "R1_AGENT_OPERABLE")?.passed).toBe(false);
    expect(decision.ruleTrace.find((r) => r.id === "R2_PURPOSE_ALLOWED")?.passed).toBe(false);
  });

  it("denies an oversized request against post-haircut capacity", async () => {
    const capacity = collateralCapacity(findAgent("agt-atlas")!);
    const decision = await engine.evaluate(request({ agentId: "agt-atlas", amountUsd: capacity + 10_000 }));
    expect(decision.outcome).toBe("denied");
    expect(decision.ruleTrace.find((r) => r.id === "R7_COLLATERAL_CAPACITY")?.passed).toBe(false);
  });

  it("rejects malformed input at the boundary", async () => {
    await expect(engine.evaluate(request({ amountUsd: -5 }))).rejects.toThrow();
  });

  it("writes request + decision events to the audit log", async () => {
    await engine.evaluate(request());
    const events = await audit.list();
    const actions = events.map((e) => e.action);
    expect(actions).toContain("financing.requested");
    expect(actions).toContain("decision.approved");
    expect(actions).toContain("advance.disbursed");
  });
});

describe("fail-safe controls", () => {
  it("kill switch blocks financing and is audited", async () => {
    await mandates.setKillSwitch("agt-swarmlabel", true, "operator:demo");
    const decision = await engine.evaluate(request());
    expect(decision.outcome).toBe("denied");
    expect(decision.ruleTrace.find((r) => r.id === "R1_AGENT_OPERABLE")?.passed).toBe(false);
    expect((await audit.list()).some((e) => e.action === "kill_switch.engaged")).toBe(true);
  });

  it("global freeze blocks every agent", async () => {
    await mandates.setGlobalFreeze(true, "operator:demo");
    const decision = await engine.evaluate(request({ agentId: "agt-atlas" }));
    expect(decision.outcome).toBe("denied");
  });

  it("human override approves a reduced amount within capacity", async () => {
    const denied = await engine.evaluate(request({ agentId: "agt-tickermind", amountUsd: 6_000 }));
    expect(denied.outcome).toBe("denied");
    const cashBefore = findAgent("agt-tickermind")!.treasury.cashUsd;

    const overridden = await mandates.overrideDecision(denied.id, 4_000, "operator:demo");
    expect(overridden.outcome).toBe("override_approved");
    expect(overridden.decidedBy).toBe("human_override");
    expect(findAgent("agt-tickermind")!.treasury.cashUsd).toBeGreaterThan(cashBefore);
    expect(getWorld().decisions).toHaveLength(2);
  });

  it("override refuses approved decisions and killed agents", async () => {
    const approved = await engine.evaluate(request());
    await expect(mandates.overrideDecision(approved.id, 1_000, "x")).rejects.toThrow(/denied/i);

    const denied = await engine.evaluate(request({ agentId: "agt-tickermind", amountUsd: 6_000 }));
    await mandates.setKillSwitch("agt-tickermind", true, "operator:demo");
    await expect(mandates.overrideDecision(denied.id, 1_000, "x")).rejects.toThrow(/killed|frozen/i);
  });
});
