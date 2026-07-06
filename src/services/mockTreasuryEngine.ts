import {
  advanceTermsSchema,
  simulationReportSchema,
  type AdvanceTerms,
  type Advance,
  type AgentRecord,
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
    appendAudit({
      actor: "treasury-engine",
      category: "system",
      action: "time.advanced",
      detail: `Day ${fromDay} → ${world.simDay}: ${formatUsd(report.repaidUsd)} repaid (${report.advancesFullyRepaid} advance(s) closed), ${formatUsd(report.sweptUsd)} swept to simulated T-bills, ${formatUsd(report.redeemedUsd)} redeemed to defend reserve floors, ${formatUsd(report.yieldAccruedUsd)} yield accrued.`,
    });
    return simulationReportSchema.parse(report);
  }
}
