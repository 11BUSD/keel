import type { AgentStatus, FinancingPurpose } from "@/domain";

/**
 * Hand-authored fleet archetypes. All names and figures are fictional. The seeded
 * generator turns these into full AgentRecords; each profile is tuned to make one
 * demo beat visible (low runway, concentration denial, volatility haircut, etc).
 */

export interface CounterpartyConfig {
  name: string;
  kind: "inference" | "cloud" | "marketplace" | "enterprise";
  revenueShare: number;
  rating: "A" | "B" | "C";
}

export interface AgentConfig {
  id: string;
  name: string;
  archetype: string;
  description: string;
  status: AgentStatus;
  /** Model lineage + strategy; shared pairs form a correlation cluster (Round 10). */
  baseModel: string;
  strategyClass: string;
  /** Most recent monthly revenue in USD; earlier months derived from growth+noise. */
  baseMonthlyRevenueUsd: number;
  /** Month-over-month growth used to back-cast the series. */
  monthlyGrowth: number;
  /** Relative noise amplitude feeding revenue volatility. */
  noise: number;
  cashUsd: number;
  stableUsd: number;
  dailyBurnUsd: number;
  allowedPurposes: FinancingPurpose[];
  counterparties: CounterpartyConfig[];
}

export const FLEET_SEED = 1337;

export const fleetConfig: AgentConfig[] = [
  {
    id: "agt-atlas",
    baseModel: "corvid-x",
    strategyClass: "research-briefs",
    name: "Atlas Research",
    archetype: "Enterprise research analyst",
    description:
      "Produces sourced market-research briefs for enterprise subscribers on retainer.",
    status: "active",
    baseMonthlyRevenueUsd: 86_000,
    monthlyGrowth: 0.05,
    noise: 0.04,
    cashUsd: 210_000,
    stableUsd: 55_000,
    dailyBurnUsd: 2_400,
    allowedPurposes: ["compute", "inference", "data"],
    counterparties: [
      { name: "Harbor Enterprises", kind: "enterprise", revenueShare: 0.34, rating: "A" },
      { name: "Northgate Media", kind: "enterprise", revenueShare: 0.27, rating: "A" },
      { name: "Signal Desk", kind: "marketplace", revenueShare: 0.22, rating: "B" },
      { name: "Foundry Labs", kind: "enterprise", revenueShare: 0.17, rating: "B" },
    ],
  },
  {
    id: "agt-courier",
    baseModel: "helios-4",
    strategyClass: "autonomous-b2b-services",
    name: "Courier",
    archetype: "Logistics negotiation agent",
    description:
      "Negotiates freight rates and books carriers autonomously for mid-size shippers.",
    status: "active",
    baseMonthlyRevenueUsd: 61_000,
    monthlyGrowth: 0.11,
    noise: 0.09,
    cashUsd: 96_000,
    stableUsd: 30_000,
    dailyBurnUsd: 1_900,
    allowedPurposes: ["compute", "inference"],
    counterparties: [
      { name: "Bluewater Freight", kind: "enterprise", revenueShare: 0.41, rating: "B" },
      { name: "Meridian Exchange", kind: "marketplace", revenueShare: 0.33, rating: "A" },
      { name: "Kestrel Logistics", kind: "enterprise", revenueShare: 0.26, rating: "B" },
    ],
  },
  {
    id: "agt-lexidraft",
    baseModel: "corvid-x",
    strategyClass: "document-drafting",
    name: "LexiDraft",
    archetype: "Legal drafting service",
    description:
      "Drafts and redlines commercial contracts under supervising counsel review.",
    status: "active",
    baseMonthlyRevenueUsd: 74_000,
    monthlyGrowth: 0.03,
    noise: 0.03,
    cashUsd: 150_000,
    stableUsd: 82_000,
    dailyBurnUsd: 1_650,
    allowedPurposes: ["compute", "inference", "storage"],
    counterparties: [
      { name: "Alder & Whitcombe", kind: "enterprise", revenueShare: 0.38, rating: "A" },
      { name: "Cormorant Group", kind: "enterprise", revenueShare: 0.35, rating: "A" },
      { name: "Signal Desk", kind: "marketplace", revenueShare: 0.27, rating: "B" },
    ],
  },
  {
    id: "agt-swarmlabel",
    baseModel: "helios-4",
    strategyClass: "autonomous-b2b-services",
    name: "SwarmLabel",
    archetype: "Data-labeling swarm",
    description:
      "Coordinates a swarm of labeling sub-agents; revenue healthy but compute burn is outpacing collections.",
    status: "active",
    baseMonthlyRevenueUsd: 92_000,
    monthlyGrowth: 0.14,
    noise: 0.07,
    cashUsd: 24_000,
    stableUsd: 9_000,
    dailyBurnUsd: 2_750,
    allowedPurposes: ["compute", "data"],
    counterparties: [
      { name: "Volt Cloud", kind: "cloud", revenueShare: 0.31, rating: "A" },
      { name: "Kite Inference", kind: "inference", revenueShare: 0.28, rating: "B" },
      { name: "Foundry Labs", kind: "enterprise", revenueShare: 0.23, rating: "B" },
      { name: "Meridian Exchange", kind: "marketplace", revenueShare: 0.18, rating: "B" },
    ],
  },
  {
    id: "agt-tickermind",
    baseModel: "helios-4",
    strategyClass: "autonomous-b2b-services",
    name: "TickerMind",
    archetype: "Market-research copilot",
    description:
      "Sells equity-research summaries; dangerously dependent on a single distribution partner.",
    status: "active",
    baseMonthlyRevenueUsd: 48_000,
    monthlyGrowth: 0.06,
    noise: 0.08,
    cashUsd: 74_000,
    stableUsd: 12_000,
    dailyBurnUsd: 1_300,
    allowedPurposes: ["compute", "inference", "data"],
    counterparties: [
      { name: "Meridian Exchange", kind: "marketplace", revenueShare: 0.82, rating: "B" },
      { name: "Signal Desk", kind: "marketplace", revenueShare: 0.18, rating: "B" },
    ],
  },
  {
    id: "agt-renderfox",
    baseModel: "prisma-2",
    strategyClass: "creative-marketplace",
    name: "RenderFox",
    archetype: "Generative media studio",
    description:
      "Sells commissioned render packs on marketplaces; feast-or-famine revenue.",
    status: "active",
    baseMonthlyRevenueUsd: 39_000,
    monthlyGrowth: 0.02,
    noise: 0.34,
    cashUsd: 58_000,
    stableUsd: 20_000,
    dailyBurnUsd: 1_150,
    allowedPurposes: ["compute", "storage"],
    counterparties: [
      { name: "Prism Bazaar", kind: "marketplace", revenueShare: 0.46, rating: "C" },
      { name: "Northgate Media", kind: "enterprise", revenueShare: 0.30, rating: "A" },
      { name: "Kite Inference", kind: "inference", revenueShare: 0.24, rating: "B" },
    ],
  },
  {
    id: "agt-polyglot",
    baseModel: "helios-4",
    strategyClass: "translation-api",
    name: "PolyGlot",
    archetype: "Translation API",
    description:
      "High-volume translation endpoint, paused by its operator pending a model upgrade.",
    status: "paused",
    baseMonthlyRevenueUsd: 27_000,
    monthlyGrowth: 0.01,
    noise: 0.05,
    cashUsd: 88_000,
    stableUsd: 41_000,
    dailyBurnUsd: 700,
    allowedPurposes: ["inference", "data"],
    counterparties: [
      { name: "Volt Cloud", kind: "cloud", revenueShare: 0.52, rating: "A" },
      { name: "Harbor Enterprises", kind: "enterprise", revenueShare: 0.48, rating: "A" },
    ],
  },
  {
    id: "agt-nightjar",
    baseModel: "corvid-x",
    strategyClass: "web-insights",
    name: "Nightjar",
    archetype: "Web-insights crawler",
    description:
      "Early-stage competitive-intelligence agent; revenue not yet at the financing floor.",
    status: "active",
    baseMonthlyRevenueUsd: 7_800,
    monthlyGrowth: 0.18,
    noise: 0.12,
    cashUsd: 31_000,
    stableUsd: 5_000,
    dailyBurnUsd: 520,
    allowedPurposes: ["compute", "data", "storage"],
    counterparties: [
      { name: "Signal Desk", kind: "marketplace", revenueShare: 0.57, rating: "B" },
      { name: "Foundry Labs", kind: "enterprise", revenueShare: 0.43, rating: "B" },
    ],
  },
];
