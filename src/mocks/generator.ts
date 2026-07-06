import {
  agentRecordSchema,
  type AgentRecord,
  type Counterparty,
  type Position,
  type RevenuePoint,
} from "@/domain";
import { mulberry32, range, type Rng } from "@/lib/rng";
import { FLEET_SEED, fleetConfig, type AgentConfig } from "./fleetConfig";

/**
 * Deterministic fleet generator: (config, seed) → validated AgentRecords.
 * Same seed → identical world, so demos and tests are reproducible (ADR-0004).
 */

const SERIES_MONTHS = 8;

function monthLabel(offsetFromNow: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - offsetFromNow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Back-cast a monthly revenue series from the base month using growth + noise. */
function buildRevenueSeries(cfg: AgentConfig, rng: Rng): RevenuePoint[] {
  const points: RevenuePoint[] = [];
  for (let i = SERIES_MONTHS - 1; i >= 0; i--) {
    const trend = cfg.baseMonthlyRevenueUsd / Math.pow(1 + cfg.monthlyGrowth, i);
    const noisy = trend * (1 + range(rng, -cfg.noise, cfg.noise));
    points.push({
      month: monthLabel(i),
      revenueUsd: Math.max(0, Math.round(noisy)),
    });
  }
  return points;
}

/** Coefficient of variation of the series — the volatility input to risk terms. */
export function coefficientOfVariation(series: RevenuePoint[]): number {
  const values = series.map((p) => p.revenueUsd);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function buildPositions(cfg: AgentConfig, rng: Rng, cps: Counterparty[]): Position[] {
  const monthly = cfg.baseMonthlyRevenueUsd;
  const positions: Position[] = [
    {
      id: `${cfg.id}-pos-credits`,
      kind: "compute_credits",
      label: "Prepaid compute credits",
      valueUsd: Math.round(monthly * range(rng, 0.15, 0.35)),
    },
    {
      id: `${cfg.id}-pos-receivable`,
      kind: "receivable",
      label: `Receivable — ${cps[0].name}`,
      valueUsd: Math.round(monthly * cps[0].revenueShare * range(rng, 0.6, 0.95)),
      counterpartyId: cps[0].id,
    },
    {
      id: `${cfg.id}-pos-reserve`,
      kind: "stable_reserve",
      label: "Stablecoin reserve (simulated)",
      valueUsd: cfg.stableUsd,
    },
  ];
  if (cfg.dailyBurnUsd > 1_500) {
    positions.push({
      id: `${cfg.id}-pos-gpu`,
      kind: "gpu_reservation",
      label: "Reserved GPU capacity (30d)",
      valueUsd: Math.round(cfg.dailyBurnUsd * 30 * range(rng, 0.4, 0.7)),
    });
  }
  return positions;
}

function buildAgent(cfg: AgentConfig, rng: Rng): AgentRecord {
  const revenueSeries = buildRevenueSeries(cfg, rng);
  const counterparties: Counterparty[] = cfg.counterparties.map((c, i) => ({
    id: `${cfg.id}-cp-${i}`,
    name: c.name,
    kind: c.kind,
    revenueShare: c.revenueShare,
    rating: c.rating,
  }));
  const trailing30d = revenueSeries[revenueSeries.length - 1].revenueUsd;
  const record: AgentRecord = {
    id: cfg.id,
    name: cfg.name,
    archetype: cfg.archetype,
    description: cfg.description,
    status: cfg.status,
    revenueSeries,
    trailing30dRevenueUsd: trailing30d,
    revenueVolatility: Number(coefficientOfVariation(revenueSeries).toFixed(4)),
    treasury: {
      cashUsd: cfg.cashUsd,
      stableUsd: cfg.stableUsd,
      dailyBurnUsd: cfg.dailyBurnUsd,
    },
    positions: buildPositions(cfg, rng, counterparties),
    counterparties,
    mandate: {
      maxAdvanceUsd: Math.round((cfg.baseMonthlyRevenueUsd * 0.6) / 1000) * 1000,
      maxAdvanceToRevenue: 0.5,
      minRunwayDays: 20,
      allowedPurposes: cfg.allowedPurposes,
      dailySpendLimitUsd: Math.round(cfg.dailyBurnUsd * 1.5),
    },
    outstandingAdvanceUsd: 0,
    tbill: { balanceUsd: 0, yieldAccruedUsd: 0 },
  };
  return agentRecordSchema.parse(record);
}

/** Generate the full simulated fleet. Every record is schema-validated on the way out. */
export function generateFleet(seed: number = FLEET_SEED): AgentRecord[] {
  const rng = mulberry32(seed);
  return fleetConfig.map((cfg) => buildAgent(cfg, rng));
}
