import type { AgentRecord, CorrelationCluster } from "@/domain";
import { formatPct } from "@/lib/format";

/**
 * Round 10 (ADR-0010): correlation clusters. Agents sharing base model AND
 * strategy class are one economic exposure; crowding raises the fee each member
 * pays. Pure, deterministic, and fully explainable — no hidden scores.
 */

export const CROWDING_ADD_ON_PER_PEER = 0.02;
export const CROWDING_ADD_ON_CAP = 0.08;

/** Fee add-on for a member of a cluster of `size` agents: 2% per peer, capped at 8%. */
export function crowdingAddOn(size: number): number {
  return Math.min(CROWDING_ADD_ON_PER_PEER * Math.max(0, size - 1), CROWDING_ADD_ON_CAP);
}

export function clusterKey(agent: Pick<AgentRecord, "baseModel" | "strategyClass">): string {
  return `${agent.baseModel}::${agent.strategyClass}`;
}

/** Group the fleet into correlation clusters, stable-ordered by key. */
export function computeClusters(agents: AgentRecord[]): CorrelationCluster[] {
  const byKey = new Map<string, AgentRecord[]>();
  for (const agent of agents) {
    const key = clusterKey(agent);
    byKey.set(key, [...(byKey.get(key) ?? []), agent]);
  }
  return [...byKey.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, members]) => ({
      key,
      baseModel: members[0].baseModel,
      strategyClass: members[0].strategyClass,
      agentIds: members.map((m) => m.id),
      agentNames: members.map((m) => m.name),
      size: members.length,
      feeAddOn: crowdingAddOn(members.length),
    }));
}

/** The cluster a specific agent belongs to (always exists — singletons included). */
export function clusterFor(agent: AgentRecord, agents: AgentRecord[]): CorrelationCluster {
  const cluster = computeClusters(agents).find((c) => c.agentIds.includes(agent.id));
  if (!cluster) throw new Error(`Agent ${agent.id} missing from its own fleet.`);
  return cluster;
}

/** Human-readable trace line for the R9 correlation rule. */
export function crowdingDetail(agent: AgentRecord, cluster: CorrelationCluster): string {
  if (cluster.size <= 1) {
    return `No correlated peers: ${agent.name} is the only ${cluster.baseModel} / ${cluster.strategyClass} exposure. No crowding add-on.`;
  }
  const peers = cluster.agentNames.filter((n) => n !== agent.name).join(", ");
  return `${cluster.size} agents share ${cluster.baseModel} / ${cluster.strategyClass} (peers: ${peers}) — treated as one exposure; crowding adds ${formatPct(cluster.feeAddOn, 0)} to the fee.`;
}
