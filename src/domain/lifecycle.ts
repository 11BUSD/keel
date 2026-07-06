import { z } from "zod";

/** Round 9: advance lifecycle + treasury sweep contracts (Contract §D2). */

export const advanceSchema = z.object({
  id: z.string().min(1),
  agentId: z.string().min(1),
  decisionId: z.string().min(1),
  principalUsd: z.number().positive(),
  /** Share of daily revenue swept toward repayment, 0..1 (from the approval terms). */
  revenueShare: z.number().min(0).max(1),
  termDays: z.number().positive(),
  /** Simulation day the advance was disbursed. */
  startDay: z.number().int().nonnegative(),
  outstandingUsd: z.number().nonnegative(),
  repaidUsd: z.number().nonnegative(),
  status: z.enum(["active", "repaid", "overdue"]),
});
export type Advance = z.infer<typeof advanceSchema>;

/** Simulated tokenized T-bill position held per agent (yield-bearing, simulated). */
export const tbillPositionSchema = z.object({
  balanceUsd: z.number().nonnegative(),
  yieldAccruedUsd: z.number().nonnegative(),
});
export type TbillPosition = z.infer<typeof tbillPositionSchema>;

/** Aggregate result of advancing the simulation clock. */
export const simulationReportSchema = z.object({
  days: z.number().int().positive(),
  fromDay: z.number().int().nonnegative(),
  toDay: z.number().int().positive(),
  revenueAccruedUsd: z.number().nonnegative(),
  burnPaidUsd: z.number().nonnegative(),
  repaidUsd: z.number().nonnegative(),
  advancesFullyRepaid: z.number().int().nonnegative(),
  sweptUsd: z.number().nonnegative(),
  /** T-bills redeemed back to cash to defend reserve floors. */
  redeemedUsd: z.number().nonnegative(),
  yieldAccruedUsd: z.number().nonnegative(),
});
export type SimulationReport = z.infer<typeof simulationReportSchema>;
