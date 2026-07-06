import type { WaterfallLayer } from "@/domain";

/**
 * The CCP-style default waterfall (ADR-0011). Pure accounting: losses fill each
 * layer completely before touching the next; anything beyond the last layer is
 * uncovered (and would reach capital providers). Totals always conserve.
 */

export function seedWaterfall(): WaterfallLayer[] {
  return [
    { id: "defaulter_margin", label: "Defaulter's margin", capacityUsd: 50_000, absorbedUsd: 0 },
    { id: "principal_guarantee", label: "Principal guarantee", capacityUsd: 100_000, absorbedUsd: 0 },
    { id: "cohort_margin", label: "Cohort margin", capacityUsd: 150_000, absorbedUsd: 0 },
    { id: "equity_tranche", label: "Keel equity tranche", capacityUsd: 200_000, absorbedUsd: 0 },
    { id: "default_fund", label: "Mutualized default fund", capacityUsd: 300_000, absorbedUsd: 0 },
    { id: "insurance", label: "Insurance layer", capacityUsd: 500_000, absorbedUsd: 0 },
  ];
}

export interface AbsorptionResult {
  absorbedUsd: number;
  uncoveredUsd: number;
  perLayer: { id: string; label: string; absorbedUsd: number }[];
}

/** Apply a loss to the waterfall in order, mutating layer absorption. */
export function applyLoss(layers: WaterfallLayer[], lossUsd: number): AbsorptionResult {
  let remaining = Math.max(0, lossUsd);
  const perLayer: AbsorptionResult["perLayer"] = [];
  for (const layer of layers) {
    if (remaining <= 0) break;
    const headroom = layer.capacityUsd - layer.absorbedUsd;
    const take = Math.min(headroom, remaining);
    if (take > 0) {
      layer.absorbedUsd += take;
      remaining -= take;
      perLayer.push({ id: layer.id, label: layer.label, absorbedUsd: take });
    }
  }
  return {
    absorbedUsd: Math.max(0, lossUsd) - remaining,
    uncoveredUsd: remaining,
    perLayer,
  };
}

export function totalCapacityUsd(layers: WaterfallLayer[]): number {
  return layers.reduce((s, l) => s + l.capacityUsd, 0);
}

export function totalHeadroomUsd(layers: WaterfallLayer[]): number {
  return layers.reduce((s, l) => s + (l.capacityUsd - l.absorbedUsd), 0);
}
