import {
  financingRequestInputSchema,
  type FinancingRequest,
  type FinancingRequestInput,
  type RiskDecision,
} from "@/domain";
import { formatUsd } from "@/lib/format";
import type { RiskEngine, TreasuryEngine } from "./interfaces";
import { buildTerms, evaluateRules, remediationFor } from "./riskRules";
import { appendAudit, delay, findAgent, getWorld, nextId } from "./store";

/**
 * MockRiskEngine (ADR-0005): deterministic, explainable rule evaluation over the
 * simulated world. Records request + decision + audit events; applies approved
 * advances through the TreasuryEngine interface.
 */
export class MockRiskEngine implements RiskEngine {
  constructor(
    private readonly treasury: TreasuryEngine,
    private readonly latencyMs = 600,
  ) {}

  async evaluate(rawInput: FinancingRequestInput): Promise<RiskDecision> {
    const input = financingRequestInputSchema.parse(rawInput);
    await delay(this.latencyMs);

    const world = getWorld();
    const agent = findAgent(input.agentId);
    if (!agent) throw new Error(`Unknown agent: ${input.agentId}`);

    const request: FinancingRequest = {
      ...input,
      id: nextId("req"),
      createdAt: new Date().toISOString(),
    };
    world.requests.push(request);
    appendAudit({
      actor: "operator",
      category: "financing",
      action: "financing.requested",
      detail: `${agent.name} requested ${formatUsd(input.amountUsd)} (${input.purpose}, ${input.termDays}d).`,
      agentId: agent.id,
    });

    const ruleTrace = evaluateRules(agent, input, world.globalFreeze);
    const failedHard = ruleTrace.filter((r) => r.severity === "hard" && !r.passed);
    const approved = failedHard.length === 0;
    const terms = approved ? buildTerms(agent, input.amountUsd, input.termDays) : undefined;

    const decision: RiskDecision = {
      id: nextId("dec"),
      requestId: request.id,
      agentId: agent.id,
      outcome: approved ? "approved" : "denied",
      decidedBy: "risk_engine",
      summary: approved
        ? `Approved ${formatUsd(input.amountUsd)} ${input.purpose} advance — ${terms!.haircut * 100}% haircut, ${(terms!.fee * 100).toFixed(2)}% fee, net ${formatUsd(terms!.netDisbursedUsd)}.`
        : `Denied — ${failedHard.length} of ${ruleTrace.filter((r) => r.severity === "hard").length} hard rules failed: ${failedHard.map((r) => r.name).join("; ")}.`,
      ruleTrace,
      terms,
      remediation: approved ? [] : remediationFor(failedHard, agent),
      createdAt: new Date().toISOString(),
    };
    world.decisions.push(decision);
    appendAudit({
      actor: "risk-engine",
      category: "financing",
      action: approved ? "decision.approved" : "decision.denied",
      detail: decision.summary,
      agentId: agent.id,
    });

    if (approved && terms) {
      await this.treasury.applyAdvance(agent.id, terms, decision.id);
    }
    return decision;
  }
}
