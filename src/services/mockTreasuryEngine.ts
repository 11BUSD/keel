import { advanceTermsSchema, type AdvanceTerms, type AgentRecord } from "@/domain";
import { formatUsd } from "@/lib/format";
import type { TreasuryEngine } from "./interfaces";
import { appendAudit, findAgent } from "./store";

/** Applies approved advances to the simulated treasury and books the liability. */
export class MockTreasuryEngine implements TreasuryEngine {
  async applyAdvance(agentId: string, rawTerms: AdvanceTerms): Promise<AgentRecord> {
    const terms = advanceTermsSchema.parse(rawTerms);
    const agent = findAgent(agentId);
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);

    agent.treasury.cashUsd += terms.netDisbursedUsd;
    agent.outstandingAdvanceUsd += terms.principalUsd;
    appendAudit({
      actor: "treasury-engine",
      category: "financing",
      action: "advance.disbursed",
      detail: `${formatUsd(terms.netDisbursedUsd)} net disbursed to ${agent.name} (principal ${formatUsd(terms.principalUsd)}, ${terms.termDays}d, ${(terms.revenueShare * 100).toFixed(0)}% revenue-share sweep).`,
      agentId: agent.id,
    });
    return agent;
  }
}
