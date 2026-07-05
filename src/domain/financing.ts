import { z } from "zod";
import { financingPurposeSchema } from "./agent";

/** Financing, risk-decision, and audit contracts (Contract §D2). */

export const financingRequestInputSchema = z.object({
  agentId: z.string().min(1),
  amountUsd: z.number().positive().max(10_000_000),
  purpose: financingPurposeSchema,
  termDays: z.union([z.literal(30), z.literal(60), z.literal(90)]),
});
export type FinancingRequestInput = z.infer<typeof financingRequestInputSchema>;

export const financingRequestSchema = financingRequestInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().min(1),
});
export type FinancingRequest = z.infer<typeof financingRequestSchema>;

export const ruleOutcomeSchema = z.object({
  /** Stable rule id, e.g. "R3_MANDATE_CAP". */
  id: z.string().min(1),
  name: z.string().min(1),
  passed: z.boolean(),
  /** Human-readable evidence: the numbers that drove the outcome. */
  detail: z.string().min(1),
  /** hard rules can deny; info rules only shape terms. */
  severity: z.enum(["hard", "info"]),
});
export type RuleOutcome = z.infer<typeof ruleOutcomeSchema>;

export const advanceTermsSchema = z.object({
  principalUsd: z.number().positive(),
  /** Collateral haircut applied to revenue when sizing capacity, 0..1. */
  haircut: z.number().min(0).max(1),
  /** Upfront fee as a fraction of principal, 0..1. */
  fee: z.number().min(0).max(1),
  /** Share of future revenue swept for repayment, 0..1. */
  revenueShare: z.number().min(0).max(1),
  termDays: z.number().positive(),
  /** Principal minus upfront fee — what actually lands in the treasury. */
  netDisbursedUsd: z.number().positive(),
});
export type AdvanceTerms = z.infer<typeof advanceTermsSchema>;

export const riskDecisionSchema = z.object({
  id: z.string().min(1),
  requestId: z.string().min(1),
  agentId: z.string().min(1),
  outcome: z.enum(["approved", "denied", "override_approved"]),
  decidedBy: z.enum(["risk_engine", "human_override"]),
  summary: z.string().min(1),
  ruleTrace: z.array(ruleOutcomeSchema).min(1),
  terms: advanceTermsSchema.optional(),
  /** For denials: concrete steps that would flip the decision. */
  remediation: z.array(z.string()),
  createdAt: z.string().min(1),
});
export type RiskDecision = z.infer<typeof riskDecisionSchema>;

export const auditEventSchema = z.object({
  seq: z.number().int().nonnegative(),
  id: z.string().min(1),
  ts: z.string().min(1),
  actor: z.string().min(1),
  category: z.enum(["financing", "control", "system"]),
  action: z.string().min(1),
  detail: z.string().min(1),
  agentId: z.string().optional(),
  prevHash: z.string().min(1),
  hash: z.string().min(1),
});
export type AuditEvent = z.infer<typeof auditEventSchema>;

export const fleetSummarySchema = z.object({
  totalAgents: z.number().int().nonnegative(),
  activeAgents: z.number().int().nonnegative(),
  killedAgents: z.number().int().nonnegative(),
  fleetTrailing30dRevenueUsd: z.number().nonnegative(),
  fleetTreasuryUsd: z.number().nonnegative(),
  fleetOutstandingAdvanceUsd: z.number().nonnegative(),
  medianRunwayDays: z.number().nonnegative(),
  globalFreeze: z.boolean(),
});
export type FleetSummary = z.infer<typeof fleetSummarySchema>;
