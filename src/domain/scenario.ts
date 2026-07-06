import { z } from "zod";

/**
 * Round 11: stress scenarios + CCP-style default waterfall (ADR-0011).
 * Every scenario is deterministic and simulated; the point is making the
 * safety machinery visible, not modeling markets.
 */

export const scenarioIdSchema = z.enum([
  "flash_crash",
  "stablecoin_depeg",
  "oracle_failure",
  "cohort_cascade",
]);
export type ScenarioId = z.infer<typeof scenarioIdSchema>;

export const scenarioSpecSchema = z.object({
  id: scenarioIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
});
export type ScenarioSpec = z.infer<typeof scenarioSpecSchema>;

export const waterfallLayerSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  capacityUsd: z.number().positive(),
  absorbedUsd: z.number().nonnegative(),
});
export type WaterfallLayer = z.infer<typeof waterfallLayerSchema>;

export const timelineStepSchema = z.object({
  step: z.number().int().nonnegative(),
  actor: z.string().min(1),
  action: z.string().min(1),
  detail: z.string().min(1),
});
export type TimelineStep = z.infer<typeof timelineStepSchema>;

export const scenarioResultSchema = z.object({
  scenarioId: scenarioIdSchema,
  name: z.string().min(1),
  lossUsd: z.number().nonnegative(),
  absorbedUsd: z.number().nonnegative(),
  /** Loss beyond the full waterfall — what would reach capital providers. */
  uncoveredUsd: z.number().nonnegative(),
  /** Fail-safe default engaged: system halted instead of acting on ambiguity. */
  halted: z.boolean(),
  /** Cohort-aware liquidation was rate-limited rather than a simultaneous dump. */
  throttled: z.boolean(),
  timeline: z.array(timelineStepSchema).min(1),
  layers: z.array(waterfallLayerSchema).min(1),
});
export type ScenarioResult = z.infer<typeof scenarioResultSchema>;

export const scenarioStateSchema = z.object({
  layers: z.array(waterfallLayerSchema).min(1),
  lastResult: scenarioResultSchema.nullable(),
});
export type ScenarioState = z.infer<typeof scenarioStateSchema>;
