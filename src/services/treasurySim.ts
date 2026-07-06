import type { Advance, AgentRecord } from "@/domain";

/**
 * Round 9: pure daily-step simulation for the financing lifecycle (ADR-0009).
 * Mutates the passed records in place (they live in the world store) and returns
 * the day's totals. Deterministic: no randomness, no clock reads.
 */

export const TBILL_APY = 0.045;
export const DAILY_TBILL_RATE = TBILL_APY / 365;

/** Cash the agent must hold before any sweep: runway protection comes first. */
export function reserveFloorUsd(agent: AgentRecord): number {
  return agent.treasury.dailyBurnUsd * agent.mandate.minRunwayDays;
}

export interface DayTotals {
  revenueUsd: number;
  burnUsd: number;
  repaidUsd: number;
  advancesFullyRepaid: number;
  sweptUsd: number;
  redeemedUsd: number;
  yieldUsd: number;
}

/**
 * One simulated day for one agent: accrue revenue, pay burn, sweep the revenue
 * share into repayment, then sweep surplus cash above the reserve floor into the
 * simulated T-bill position. Killed/paused agents neither earn nor spend.
 */
export function stepAgentDay(
  agent: AgentRecord,
  advances: Advance[],
  day: number,
): DayTotals {
  const totals: DayTotals = {
    revenueUsd: 0,
    burnUsd: 0,
    repaidUsd: 0,
    advancesFullyRepaid: 0,
    sweptUsd: 0,
    redeemedUsd: 0,
    yieldUsd: 0,
  };
  // T-bill yield accrues regardless of operating status (the position exists).
  const yieldUsd = agent.tbill.balanceUsd * DAILY_TBILL_RATE;
  agent.tbill.balanceUsd += yieldUsd;
  agent.tbill.yieldAccruedUsd += yieldUsd;
  totals.yieldUsd = yieldUsd;

  if (agent.status !== "active") return totals;

  const dailyRevenue = agent.trailing30dRevenueUsd / 30;
  agent.treasury.cashUsd += dailyRevenue;
  totals.revenueUsd = dailyRevenue;

  const burn = Math.min(agent.treasury.cashUsd, agent.treasury.dailyBurnUsd);
  agent.treasury.cashUsd -= burn;
  totals.burnUsd = burn;

  for (const adv of advances) {
    if (adv.agentId !== agent.id || adv.status === "repaid") continue;
    const sweep = Math.min(
      adv.outstandingUsd,
      adv.revenueShare * dailyRevenue,
      agent.treasury.cashUsd,
    );
    adv.outstandingUsd -= sweep;
    adv.repaidUsd += sweep;
    agent.treasury.cashUsd -= sweep;
    agent.outstandingAdvanceUsd = Math.max(0, agent.outstandingAdvanceUsd - sweep);
    totals.repaidUsd += sweep;
    if (adv.outstandingUsd <= 0.005) {
      adv.outstandingUsd = 0;
      adv.status = "repaid";
      totals.advancesFullyRepaid += 1;
    } else if (day - adv.startDay > adv.termDays) {
      adv.status = "overdue";
    }
  }

  // Laddered reserve: sweep ONLY surplus above the floor; when burn pulls cash
  // below the floor, REDEEM T-bills back to cash first — runway before yield.
  const floor = reserveFloorUsd(agent);
  if (agent.treasury.cashUsd > floor) {
    const surplus = agent.treasury.cashUsd - floor;
    agent.treasury.cashUsd -= surplus;
    agent.tbill.balanceUsd += surplus;
    totals.sweptUsd = surplus;
  } else if (agent.treasury.cashUsd < floor && agent.tbill.balanceUsd > 0) {
    const redeem = Math.min(floor - agent.treasury.cashUsd, agent.tbill.balanceUsd);
    agent.tbill.balanceUsd -= redeem;
    agent.treasury.cashUsd += redeem;
    totals.redeemedUsd = redeem;
  }
  return totals;
}
