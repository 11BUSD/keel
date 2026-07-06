import { z } from "zod";

/**
 * Round 10: correlation-cluster contracts. A cluster is the set of agents sharing
 * a base model AND strategy class — economically one exposure, so crowding raises
 * the margin each member pays (docs/PRODUCT.md, ADR-0010).
 */

export const correlationClusterSchema = z.object({
  /** Stable key: `${baseModel}::${strategyClass}`. */
  key: z.string().min(1),
  baseModel: z.string().min(1),
  strategyClass: z.string().min(1),
  agentIds: z.array(z.string().min(1)).min(1),
  agentNames: z.array(z.string().min(1)).min(1),
  size: z.number().int().positive(),
  /** Crowding-based fee add-on each member pays, 0..1. */
  feeAddOn: z.number().min(0).max(1),
});
export type CorrelationCluster = z.infer<typeof correlationClusterSchema>;
