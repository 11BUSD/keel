import { type AgentRecord, type RiskDecision } from "@/domain";
import { formatUsd } from "@/lib/format";
import type { MandateEngine, TreasuryEngine } from "./interfaces";
import { buildTerms, collateralCapacity } from "./riskRules";
import { appendAudit, delay, findAgent, getWorld, nextId } from "./store";

/** Fail-safe controls: kill switches, global freeze, and human override. */
export class MockMandateEngine implements MandateEngine {
  constructor(
    private readonly treasury: TreasuryEngine,
    private readonly latencyMs = 300,
  ) {}

  async setKillSwitch(agentId: string, killed: boolean, actor: string): Promise<AgentRecord> {
    await delay(this.latencyMs);
    const agent = findAgent(agentId);
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);
    agent.status = killed ? "killed" : "active";
    appendAudit({
      actor,
      category: "control",
      action: killed ? "kill_switch.engaged" : "kill_switch.released",
      detail: killed
        ? `${agent.name} killed: all spending, trading, and financing halted immediately.`
        : `${agent.name} reactivated by ${actor}.`,
      agentId: agent.id,
    });
    return structuredClone(agent);
  }

  async setGlobalFreeze(frozen: boolean, actor: string): Promise<boolean> {
    await delay(this.latencyMs);
    const world = getWorld();
    world.globalFreeze = frozen;
    appendAudit({
      actor,
      category: "control",
      action: frozen ? "global_freeze.engaged" : "global_freeze.released",
      detail: frozen
        ? "Fleet-wide freeze: every financing and spend path is halted."
        : `Fleet-wide freeze lifted by ${actor}.`,
    });
    return frozen;
  }

  async overrideDecision(
    decisionId: string,
    approvedAmountUsd: number,
    actor: string,
  ): Promise<RiskDecision> {
    await delay(this.latencyMs);
    const world = getWorld();
    const original = world.decisions.find((d) => d.id === decisionId);
    if (!original) throw new Error(`Unknown decision: ${decisionId}`);
    if (original.outcome !== "denied") {
      throw new Error("Only denied decisions can be overridden.");
    }
    const agent = findAgent(original.agentId);
    if (!agent) throw new Error(`Unknown agent: ${original.agentId}`);
    if (agent.status === "killed" || world.globalFreeze) {
      throw new Error("Override blocked: agent is killed or the fleet is frozen.");
    }
    if (approvedAmountUsd <= 0 || approvedAmountUsd > collateralCapacity(agent)) {
      throw new Error(
        `Override amount must be within post-haircut capacity (${formatUsd(collateralCapacity(agent))}).`,
      );
    }

    const request = world.requests.find((r) => r.id === original.requestId);
    const terms = buildTerms(agent, approvedAmountUsd, request?.termDays ?? 30);
    const decision: RiskDecision = {
      id: nextId("dec"),
      requestId: original.requestId,
      agentId: agent.id,
      outcome: "override_approved",
      decidedBy: "human_override",
      summary: `Human override by ${actor}: approved reduced ${formatUsd(approvedAmountUsd)} (engine denied ${formatUsd(request?.amountUsd ?? 0)}).`,
      ruleTrace: [
        {
          id: "R0_HUMAN_OVERRIDE",
          name: "Human override",
          severity: "info",
          passed: true,
          detail: `${actor} overrode decision ${original.id}; amount clamped to post-haircut capacity.`,
        },
        ...original.ruleTrace,
      ],
      terms,
      remediation: [],
      createdAt: new Date().toISOString(),
    };
    world.decisions.push(decision);
    appendAudit({
      actor,
      category: "control",
      action: "decision.overridden",
      detail: decision.summary,
      agentId: agent.id,
    });
    await this.treasury.applyAdvance(agent.id, terms);
    return decision;
  }
}
