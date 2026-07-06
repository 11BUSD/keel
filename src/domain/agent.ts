import { z } from "zod";
import { tbillPositionSchema } from "./lifecycle";

/**
 * Agent-side domain contracts. Every entity crossing a module boundary has a zod
 * schema; types are inferred (Contract §D2). All monetary values are simulated USD.
 */

export const agentStatusSchema = z.enum(["active", "paused", "killed"]);
export type AgentStatus = z.infer<typeof agentStatusSchema>;

export const financingPurposeSchema = z.enum([
  "compute",
  "inference",
  "data",
  "storage",
]);
export type FinancingPurpose = z.infer<typeof financingPurposeSchema>;

export const revenuePointSchema = z.object({
  /** ISO month, e.g. "2026-03" */
  month: z.string().regex(/^\d{4}-\d{2}$/),
  revenueUsd: z.number().nonnegative(),
});
export type RevenuePoint = z.infer<typeof revenuePointSchema>;

export const counterpartySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["inference", "cloud", "marketplace", "enterprise"]),
  /** Share of the agent's revenue attributable to this counterparty, 0..1. */
  revenueShare: z.number().min(0).max(1),
  rating: z.enum(["A", "B", "C"]),
});
export type Counterparty = z.infer<typeof counterpartySchema>;

export const positionSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    "compute_credits",
    "gpu_reservation",
    "receivable",
    "stable_reserve",
  ]),
  label: z.string().min(1),
  valueUsd: z.number().nonnegative(),
  counterpartyId: z.string().optional(),
});
export type Position = z.infer<typeof positionSchema>;

export const mandateSchema = z.object({
  /** Hard cap on total outstanding advances. */
  maxAdvanceUsd: z.number().positive(),
  /** Max advance as a multiple of trailing-30d revenue, e.g. 0.5 = 50%. */
  maxAdvanceToRevenue: z.number().positive(),
  minRunwayDays: z.number().positive(),
  allowedPurposes: z.array(financingPurposeSchema).min(1),
  dailySpendLimitUsd: z.number().positive(),
});
export type Mandate = z.infer<typeof mandateSchema>;

export const treasurySchema = z.object({
  cashUsd: z.number().nonnegative(),
  stableUsd: z.number().nonnegative(),
  dailyBurnUsd: z.number().positive(),
});
export type Treasury = z.infer<typeof treasurySchema>;

export const agentRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  archetype: z.string().min(1),
  description: z.string().min(1),
  status: agentStatusSchema,
  /** Base model lineage — agents on the same model + strategy are one bet (Round 10). */
  baseModel: z.string().min(1),
  strategyClass: z.string().min(1),
  revenueSeries: z.array(revenuePointSchema).min(1),
  trailing30dRevenueUsd: z.number().nonnegative(),
  /** Coefficient of variation of monthly revenue, 0..1+. */
  revenueVolatility: z.number().nonnegative(),
  treasury: treasurySchema,
  positions: z.array(positionSchema),
  counterparties: z.array(counterpartySchema),
  mandate: mandateSchema,
  outstandingAdvanceUsd: z.number().nonnegative(),
  /** Simulated tokenized T-bill sweep balance (Round 9). */
  tbill: tbillPositionSchema,
});
export type AgentRecord = z.infer<typeof agentRecordSchema>;

/** Days of runway left at current burn, across cash + stable reserves. */
export function runwayDays(treasury: Treasury): number {
  return (treasury.cashUsd + treasury.stableUsd) / treasury.dailyBurnUsd;
}

/** Largest single counterparty revenue share, 0..1. */
export function topCounterpartyShare(agent: AgentRecord): number {
  return agent.counterparties.reduce((max, c) => Math.max(max, c.revenueShare), 0);
}
