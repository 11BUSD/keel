import {
  runwayDays,
  type Advance,
  type AgentRecord,
  type CapitalProvider,
  type FleetSummary,
  type RiskDecision,
} from "@/domain";
import type { Ledger } from "./interfaces";
import { delay, getWorld } from "./store";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Read-side of the money layer over the simulated world. */
export class MockLedger implements Ledger {
  constructor(private readonly latencyMs = 350) {}

  async listAgents(): Promise<AgentRecord[]> {
    await delay(this.latencyMs);
    return getWorld().agents.map((a) => structuredClone(a));
  }

  async getAgent(id: string): Promise<AgentRecord | null> {
    await delay(this.latencyMs);
    const agent = getWorld().agents.find((a) => a.id === id);
    return agent ? structuredClone(agent) : null;
  }

  async listDecisions(agentId?: string): Promise<RiskDecision[]> {
    await delay(this.latencyMs);
    const all = getWorld().decisions.filter(
      (d) => !agentId || d.agentId === agentId,
    );
    return [...all].reverse().map((d) => structuredClone(d));
  }

  async getDecision(id: string): Promise<RiskDecision | null> {
    await delay(this.latencyMs);
    const d = getWorld().decisions.find((x) => x.id === id);
    return d ? structuredClone(d) : null;
  }

  async listAdvances(agentId?: string): Promise<Advance[]> {
    await delay(this.latencyMs);
    const all = getWorld().advances.filter(
      (a) => !agentId || a.agentId === agentId,
    );
    return [...all].reverse().map((a) => structuredClone(a));
  }

  async getCapitalProvider(): Promise<CapitalProvider> {
    await delay(this.latencyMs);
    return structuredClone(getWorld().capitalProvider);
  }

  async getFleetSummary(): Promise<FleetSummary> {
    await delay(this.latencyMs);
    const { agents, globalFreeze } = getWorld();
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.status === "active").length,
      killedAgents: agents.filter((a) => a.status === "killed").length,
      fleetTrailing30dRevenueUsd: agents.reduce((s, a) => s + a.trailing30dRevenueUsd, 0),
      fleetTreasuryUsd: agents.reduce(
        (s, a) => s + a.treasury.cashUsd + a.treasury.stableUsd,
        0,
      ),
      fleetOutstandingAdvanceUsd: agents.reduce((s, a) => s + a.outstandingAdvanceUsd, 0),
      medianRunwayDays: median(agents.map((a) => runwayDays(a.treasury))),
      globalFreeze,
      simDay: getWorld().simDay,
      fleetTbillUsd: agents.reduce((s, a) => s + a.tbill.balanceUsd, 0),
    };
  }
}
