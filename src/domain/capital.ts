import { z } from "zod";

/**
 * Round 12: the capital-provider (lender) side of the marketplace (ADR-0012).
 * A single simulated provider funds advances, earns a spread on the upfront fee,
 * and sits BEHIND the full default waterfall — losses reach it only when all six
 * layers are exhausted.
 */

export const allocationSchema = z.object({
  advanceId: z.string().min(1),
  agentId: z.string().min(1),
  /** Provider capital currently at work in this advance (tracks outstanding). */
  fundedUsd: z.number().nonnegative(),
});
export type Allocation = z.infer<typeof allocationSchema>;

export const capitalProviderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Total simulated capital committed to the platform. */
  committedUsd: z.number().nonnegative(),
  /** Liquid, un-deployed capital. */
  availableUsd: z.number().nonnegative(),
  /** Capital at work in outstanding advances. */
  deployedUsd: z.number().nonnegative(),
  /** Provider's share of upfront fees earned to date. */
  earnedSpreadUsd: z.number().nonnegative(),
  /** Losses that pierced the entire waterfall (usually zero — that's the pitch). */
  lossUsd: z.number().nonnegative(),
  allocations: z.array(allocationSchema),
});
export type CapitalProvider = z.infer<typeof capitalProviderSchema>;

/** Share of each advance's upfront fee paid to the funding provider. */
export const PROVIDER_FEE_SHARE = 0.8;
