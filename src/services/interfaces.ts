import type {
  Advance,
  AdvanceTerms,
  AgentRecord,
  AuditEvent,
  FinancingRequestInput,
  FleetSummary,
  RiskDecision,
  SimulationReport,
} from "@/domain";

/**
 * THE MONEY LAYER (Contract §D4). All financial state and transitions flow through
 * these five interfaces. UI code may import only this file, `getServices()`, and
 * domain types — never the store or mock internals. A real backend replaces the
 * mock implementations without touching hooks, components, or routes.
 */

export interface Ledger {
  listAgents(): Promise<AgentRecord[]>;
  getAgent(id: string): Promise<AgentRecord | null>;
  /** Decisions, newest first; optionally filtered to one agent. */
  listDecisions(agentId?: string): Promise<RiskDecision[]>;
  getDecision(id: string): Promise<RiskDecision | null>;
  getFleetSummary(): Promise<FleetSummary>;
  /** Advance book, newest first; optionally filtered to one agent (Round 9). */
  listAdvances(agentId?: string): Promise<Advance[]>;
}

export interface RiskEngine {
  /**
   * Validates the request (zod), evaluates the full rule set, records the request,
   * the decision, and the audit events, and applies the advance to the treasury when
   * approved — atomically from the caller's point of view.
   */
  evaluate(input: FinancingRequestInput): Promise<RiskDecision>;
}

export interface TreasuryEngine {
  /**
   * Credits the net disbursement to the agent's treasury and books the advance
   * into the lifecycle ledger under the approving decision.
   */
  applyAdvance(
    agentId: string,
    terms: AdvanceTerms,
    decisionId: string,
  ): Promise<AgentRecord>;
  /**
   * Advances the simulation clock: revenue accrues, burn is paid, revenue-share
   * sweeps repay active advances, and surplus cash above each agent's reserve
   * floor sweeps into a simulated T-bill position (Round 9, ADR-0009).
   */
  advanceTime(days: number): Promise<SimulationReport>;
}

export interface MandateEngine {
  setKillSwitch(
    agentId: string,
    killed: boolean,
    actor: string,
  ): Promise<AgentRecord>;
  setGlobalFreeze(frozen: boolean, actor: string): Promise<boolean>;
  /**
   * Human override of a denied decision: approves a (usually reduced) amount,
   * re-derives terms, applies the advance, and audits the override with its actor.
   */
  overrideDecision(
    decisionId: string,
    approvedAmountUsd: number,
    actor: string,
  ): Promise<RiskDecision>;
}

export interface AuditLog {
  /** All events, newest first. */
  list(): Promise<AuditEvent[]>;
  /** Recomputes the hash chain end-to-end. */
  verifyChain(): Promise<{ valid: boolean; length: number }>;
}

export interface KeelServices {
  ledger: Ledger;
  riskEngine: RiskEngine;
  treasuryEngine: TreasuryEngine;
  mandateEngine: MandateEngine;
  auditLog: AuditLog;
}
