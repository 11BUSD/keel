import {
  runwayDays,
  topCounterpartyShare,
  type AdvanceTerms,
  type AgentRecord,
  type FinancingRequestInput,
  type RuleOutcome,
} from "@/domain";
import { formatPct, formatUsd } from "@/lib/format";

/**
 * The deterministic rule set behind MockRiskEngine (ADR-0005). Pure functions:
 * (agent, request, world flags) → rule trace + terms. Fully unit-tested.
 */

export const REVENUE_FLOOR_USD = 10_000;
export const MAX_COUNTERPARTY_SHARE = 0.7;
export const REVENUE_SHARE = 0.12;

/** Volatility (coefficient of variation) → collateral haircut tier. */
export function haircutForVolatility(cv: number): number {
  if (cv < 0.1) return 0.1;
  if (cv < 0.25) return 0.2;
  return 0.35;
}

/** Upfront fee: base 2% + volatility premium + concentration premium. */
export function feeFor(agent: AgentRecord): number {
  const concentrationBump = topCounterpartyShare(agent) > 0.5 ? 0.01 : 0;
  return Number((0.02 + 0.03 * Math.min(agent.revenueVolatility, 1) + concentrationBump).toFixed(4));
}

/** Max financeable amount after haircut, mandate ratio, and outstanding advances. */
export function collateralCapacity(agent: AgentRecord): number {
  const haircut = haircutForVolatility(agent.revenueVolatility);
  const gross = (1 - haircut) * agent.mandate.maxAdvanceToRevenue * agent.trailing30dRevenueUsd;
  return Math.max(0, Math.round(gross - agent.outstandingAdvanceUsd));
}

export function buildTerms(agent: AgentRecord, amountUsd: number, termDays: number): AdvanceTerms {
  const haircut = haircutForVolatility(agent.revenueVolatility);
  const fee = feeFor(agent);
  return {
    principalUsd: amountUsd,
    haircut,
    fee,
    revenueShare: REVENUE_SHARE,
    termDays,
    netDisbursedUsd: Math.round(amountUsd * (1 - fee)),
  };
}

export function evaluateRules(
  agent: AgentRecord,
  request: FinancingRequestInput,
  globalFreeze: boolean,
): RuleOutcome[] {
  const haircut = haircutForVolatility(agent.revenueVolatility);
  const capacity = collateralCapacity(agent);
  const topShare = topCounterpartyShare(agent);
  const headroom = agent.mandate.maxAdvanceUsd - agent.outstandingAdvanceUsd;
  const postRunway = runwayDays({
    ...agent.treasury,
    cashUsd: agent.treasury.cashUsd + buildTerms(agent, request.amountUsd, request.termDays).netDisbursedUsd,
  });

  return [
    {
      id: "R1_AGENT_OPERABLE",
      name: "Agent operable",
      severity: "hard",
      passed: agent.status === "active" && !globalFreeze,
      detail: globalFreeze
        ? "Global freeze is active — all financing halted by operator."
        : `Agent status is "${agent.status}"${agent.status === "active" ? " — eligible for financing." : " — only active agents can draw financing."}`,
    },
    {
      id: "R2_PURPOSE_ALLOWED",
      name: "Purpose within mandate",
      severity: "hard",
      passed: agent.mandate.allowedPurposes.includes(request.purpose),
      detail: `Requested purpose "${request.purpose}"; mandate allows [${agent.mandate.allowedPurposes.join(", ")}].`,
    },
    {
      id: "R3_REVENUE_FLOOR",
      name: "Verifiable revenue floor",
      severity: "hard",
      passed: agent.trailing30dRevenueUsd >= REVENUE_FLOOR_USD,
      detail: `Trailing-30d verified revenue ${formatUsd(agent.trailing30dRevenueUsd)} vs floor ${formatUsd(REVENUE_FLOOR_USD)}.`,
    },
    {
      id: "R4_CONCENTRATION",
      name: "Counterparty concentration",
      severity: "hard",
      passed: topShare <= MAX_COUNTERPARTY_SHARE,
      detail: `Largest counterparty drives ${formatPct(topShare)} of revenue; limit is ${formatPct(MAX_COUNTERPARTY_SHARE, 0)}.`,
    },
    {
      id: "R5_VOLATILITY_HAIRCUT",
      name: "Volatility haircut",
      severity: "info",
      passed: true,
      detail: `Revenue volatility (CV) ${formatPct(agent.revenueVolatility)} → ${formatPct(haircut, 0)} collateral haircut applied to financeable revenue.`,
    },
    {
      id: "R6_MANDATE_CAP",
      name: "Mandate advance cap",
      severity: "hard",
      passed: request.amountUsd <= headroom,
      detail: `Requested ${formatUsd(request.amountUsd)}; mandate cap ${formatUsd(agent.mandate.maxAdvanceUsd)} minus ${formatUsd(agent.outstandingAdvanceUsd)} outstanding leaves ${formatUsd(headroom)}.`,
    },
    {
      id: "R7_COLLATERAL_CAPACITY",
      name: "Collateral capacity",
      severity: "hard",
      passed: request.amountUsd <= capacity,
      detail: `Post-haircut capacity: (1 − ${formatPct(haircut, 0)}) × ${formatPct(agent.mandate.maxAdvanceToRevenue, 0)} × ${formatUsd(agent.trailing30dRevenueUsd)} − outstanding = ${formatUsd(capacity)}.`,
    },
    {
      id: "R8_RUNWAY_IMPACT",
      name: "Runway impact",
      severity: "info",
      passed: true,
      detail: `Runway moves from ${Math.round(runwayDays(agent.treasury))}d to ~${Math.round(postRunway)}d after net disbursement.`,
    },
  ];
}

/** Remediation guidance for each hard rule that can fail. */
export function remediationFor(failed: RuleOutcome[], agent: AgentRecord): string[] {
  const capacity = collateralCapacity(agent);
  const map: Record<string, string> = {
    R1_AGENT_OPERABLE: "Reactivate the agent (or lift the global freeze) before requesting financing.",
    R2_PURPOSE_ALLOWED: `Request one of the mandate's allowed purposes: ${agent.mandate.allowedPurposes.join(", ")}.`,
    R3_REVENUE_FLOOR: `Grow verified trailing-30d revenue above ${formatUsd(REVENUE_FLOOR_USD)} to qualify.`,
    R4_CONCENTRATION: `Diversify: bring the top counterparty below ${formatPct(MAX_COUNTERPARTY_SHARE, 0)} of revenue, or seek a human override with reduced size.`,
    R6_MANDATE_CAP: `Reduce the request to at most ${formatUsd(Math.max(0, agent.mandate.maxAdvanceUsd - agent.outstandingAdvanceUsd))}, or raise the mandate cap.`,
    R7_COLLATERAL_CAPACITY: `Reduce the request to at most ${formatUsd(capacity)} (post-haircut capacity).`,
  };
  return failed.map((r) => map[r.id]).filter((s): s is string => Boolean(s));
}
