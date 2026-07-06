import {
  advanceTermsSchema,
  PROVIDER_FEE_SHARE,
  simulationReportSchema,
  type AdvanceTerms,
  type Advance,
  type AgentRecord,
  type CapitalProvider,
  type SimulationReport,
} from "@/domain";
import { formatUsd } from "@/lib/format";
import type { TreasuryEngine } from "./interfaces";
import { appendAudit, delay, findAgent, getWorld, nextId } from "./store";
import { stepAgentDay } from "./treasurySim";

/** Applies advances and runs the deterministic time simulation (Round 9). */
export class MockTreasuryEngine implements TreasuryEngine {
  constructor(private readonly latencyMs = 300) {}

  async applyAdvance(
    agentId: string,
    rawTerms: AdvanceTerms,
    decisionId: string,
  ): Promise<AgentRecord> {
    const terms = advanceTermsSchema.parse(rawTerms);
    const world = getWorld();
    const agent = findAgent(agentId);
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);

    agent.treasury.cashUsd += terms.netDisbursedUsd;
    agent.outstandingAdvanceUsd += terms.principalUsd;
    const advance: Advance = {
      id: nextId("adv"),
      agentId,
      decisionId,
      principalUsd: terms.principalUsd,
      revenueShare: terms.revenueShare,
      termDays: terms.termDays,
      startDay: world.simDay,
      outstandingUsd: terms.principalUsd,
      repaidUsd: 0,
      status: "active",
    };
    world.advances.push(advance);
    fundFromProvider(world.capitalProvider, advance, terms);
    appendAudit({
      actor: "treasury-engine",
      category: "financing",
      action: "advance.disbursed",
      detail: `${formatUsd(terms.netDisbursedUsd)} net disbursed to ${agent.name} (principal ${formatUsd(terms.principalUsd)}, ${terms.termDays}d, ${(terms.revenueShare * 100).toFixed(0)}% revenue-share sweep, ${advance.id}).`,
      agentId: agent.id,
    });
    return agent;
  }

  async advanceTime(days: number): Promise<SimulationReport> {
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      throw new Error("advanceTime accepts 1–90 whole days.");
    }
    await delay(this.latencyMs);
    const world = getWorld();
    const fromDay = world.simDay;
    const outstandingBefore = new Map(
      world.advances.map((a) => [a.id, a.outstandingUsd]),
    );
    const report: SimulationReport = {
      days,
      fromDay,
      toDay: fromDay + days,
      revenueAccruedUsd: 0,
      burnPaidUsd: 0,
      repaidUsd: 0,
      advancesFullyRepaid: 0,
      sweptUsd: 0,
      redeemedUsd: 0,
      yieldAccruedUsd: 0,
    };
    for (let d = 0; d < days; d++) {
      world.simDay += 1;
      for (const agent of world.agents) {
        const t = stepAgentDay(agent, world.advances, world.simDay);
        report.revenueAccruedUsd += t.revenueUsd;
        report.burnPaidUsd += t.burnUsd;
        report.repaidUsd += t.repaidUsd;
        report.advancesFullyRepaid += t.advancesFullyRepaid;
        report.sweptUsd += t.sweptUsd;
        report.redeemedUsd += t.redeemedUsd;
        report.yieldAccruedUsd += t.yieldUsd;
      }
    }
    reconcileProviderRepayments(world.capitalProvider, world.advances, outstandingBefore);
    appendAudit({
      actor: "treasury-engine",
      category: "system",
      action: "time.advanced",
      detail: `Day ${fromDay} → ${world.simDay}: ${formatUsd(report.repaidUsd)} repaid (${report.advancesFullyRepaid} advance(s) closed), ${formatUsd(report.sweptUsd)} swept to simulated T-bills, ${formatUsd(report.redeemedUsd)} redeemed to defend reserve floors, ${formatUsd(report.yieldAccruedUsd)} yield accrued.`,
    });
    return simulationReportSchema.parse(report);
  }

  async deployCapital(amountUsd: number): Promise<CapitalProvider> {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 50_000_000) {
      throw new Error("Deploy amount must be a positive USD figure (≤ $50M).");
    }
    await delay(this.latencyMs);
    const provider = getWorld().capitalProvider;
    provider.committedUsd += amountUsd;
    provider.availableUsd += amountUsd;
    appendAudit({
      actor: provider.name,
      category: "financing",
      action: "capital.deployed",
      detail: `${formatUsd(amountUsd)} simulated capital committed to the platform.`,
    });
    return structuredClone(provider);
  }

  async withdrawCapital(amountUsd: number): Promise<CapitalProvider> {
    await delay(this.latencyMs);
    const provider = getWorld().capitalProvider;
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      throw new Error("Withdrawal must be a positive USD figure.");
    }
    if (amountUsd > provider.availableUsd) {
      throw new Error(
        `Only ${formatUsd(provider.availableUsd)} is liquid — capital at work in advances cannot be withdrawn.`,
      );
    }
    provider.committedUsd -= amountUsd;
    provider.availableUsd -= amountUsd;
    appendAudit({
      actor: provider.name,
      category: "financing",
      action: "capital.withdrawn",
      detail: `${formatUsd(amountUsd)} withdrawn from the platform.`,
    });
    return structuredClone(provider);
  }
}

/** Provider funds what it can; spread = its share of the upfront fee, pro-rated. */
function fundFromProvider(
  provider: CapitalProvider,
  advance: Advance,
  terms: AdvanceTerms,
): void {
  const funded = Math.min(terms.principalUsd, provider.availableUsd);
  if (funded <= 0) return;
  const feeUsd = terms.principalUsd * terms.fee;
  const spread = feeUsd * PROVIDER_FEE_SHARE * (funded / terms.principalUsd);
  provider.availableUsd = provider.availableUsd - funded + spread;
  provider.deployedUsd += funded;
  provider.earnedSpreadUsd += spread;
  provider.allocations.push({
    advanceId: advance.id,
    agentId: advance.agentId,
    fundedUsd: funded,
  });
}

/** Repayments release provider capital: allocations track outstanding downward. */
function reconcileProviderRepayments(
  provider: CapitalProvider,
  advances: Advance[],
  outstandingBefore: Map<string, number>,
): void {
  for (const allocation of provider.allocations) {
    const advance = advances.find((a) => a.id === allocation.advanceId);
    const before = outstandingBefore.get(allocation.advanceId);
    if (!advance || before === undefined) continue;
    const repaid = Math.max(0, before - advance.outstandingUsd);
    const released = Math.min(repaid, allocation.fundedUsd);
    allocation.fundedUsd -= released;
    provider.deployedUsd -= released;
    provider.availableUsd += released;
  }
  provider.allocations = provider.allocations.filter((a) => a.fundedUsd > 0.005);
}
