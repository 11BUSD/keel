import type {
  Advance,
  AgentRecord,
  AuditEvent,
  CapitalProvider,
  FinancingRequest,
  RiskDecision,
  ScenarioResult,
  WaterfallLayer,
} from "@/domain";
import { fnv1a64 } from "@/lib/hash";
import { generateFleet } from "@/mocks/generator";
import { seedWaterfall } from "./waterfall";

/**
 * In-memory world state for the simulated demo (ADR-0004). Internal to the services
 * layer — UI code never imports this file; it goes through the interfaces.
 * State is per-session (per browser tab / per test) and resets on reload.
 */

export interface WorldState {
  agents: AgentRecord[];
  requests: FinancingRequest[];
  decisions: RiskDecision[];
  advances: Advance[];
  audit: AuditEvent[];
  waterfall: WaterfallLayer[];
  lastScenario: ScenarioResult | null;
  capitalProvider: CapitalProvider;
  globalFreeze: boolean;
  /** Simulation clock in days (Round 9). */
  simDay: number;
  idCounter: number;
}

let world: WorldState | null = null;

function createWorld(): WorldState {
  const state: WorldState = {
    agents: generateFleet(),
    requests: [],
    decisions: [],
    advances: [],
    audit: [],
    waterfall: seedWaterfall(),
    lastScenario: null,
    capitalProvider: {
      id: "cp-meridian",
      name: "Meridian Capital Partners",
      committedUsd: 1_500_000,
      availableUsd: 1_500_000,
      deployedUsd: 0,
      earnedSpreadUsd: 0,
      lossUsd: 0,
      allocations: [],
    },
    globalFreeze: false,
    simDay: 0,
    idCounter: 0,
  };
  appendAuditTo(state, {
    actor: "system",
    category: "system",
    action: "world.seeded",
    detail: `Simulated fleet generated: ${state.agents.length} agents. All data fictional.`,
  });
  return state;
}

export function getWorld(): WorldState {
  if (!world) world = createWorld();
  return world;
}

/** Reset to the seeded state — used by tests and the in-app demo reset. */
export function resetWorld(): void {
  world = null;
}

export function nextId(prefix: string): string {
  const state = getWorld();
  state.idCounter += 1;
  return `${prefix}-${String(state.idCounter).padStart(4, "0")}`;
}

export interface AuditInput {
  actor: string;
  category: AuditEvent["category"];
  action: string;
  detail: string;
  agentId?: string;
}

function appendAuditTo(state: WorldState, input: AuditInput): AuditEvent {
  const prev = state.audit[state.audit.length - 1];
  const prevHash = prev ? prev.hash : "genesis";
  const seq = state.audit.length;
  const ts = new Date().toISOString();
  const id = `evt-${String(seq).padStart(5, "0")}`;
  const hash = fnv1a64(
    [prevHash, seq, ts, input.actor, input.action, input.detail, input.agentId ?? ""].join("|"),
  );
  const event: AuditEvent = { seq, id, ts, prevHash, hash, ...input };
  state.audit.push(event);
  return event;
}

export function appendAudit(input: AuditInput): AuditEvent {
  return appendAuditTo(getWorld(), input);
}

/** Recompute the chain exactly as appendAudit built it. */
export function verifyAuditChain(state: WorldState = getWorld()): boolean {
  let prevHash = "genesis";
  for (const e of state.audit) {
    const expected = fnv1a64(
      [prevHash, e.seq, e.ts, e.actor, e.action, e.detail, e.agentId ?? ""].join("|"),
    );
    if (e.hash !== expected || e.prevHash !== prevHash) return false;
    prevHash = e.hash;
  }
  return true;
}

export function findAgent(agentId: string): AgentRecord | undefined {
  return getWorld().agents.find((a) => a.id === agentId);
}

/** Simulated service latency so loading states are visible; 0 in tests. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
