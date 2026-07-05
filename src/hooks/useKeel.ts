"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FinancingRequestInput } from "@/domain";
import { getServices } from "@/services";

/**
 * The single bridge between React and the money layer (ARCHITECTURE.md).
 * Components use these hooks only — never services or the store directly.
 */

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => getServices().ledger.listAgents(),
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ["agents", id],
    queryFn: () => getServices().ledger.getAgent(id),
  });
}

export function useFleetSummary() {
  return useQuery({
    queryKey: ["fleet-summary"],
    queryFn: () => getServices().ledger.getFleetSummary(),
  });
}

export function useDecisions(agentId?: string) {
  return useQuery({
    queryKey: ["decisions", agentId ?? "all"],
    queryFn: () => getServices().ledger.listDecisions(agentId),
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: ["audit"],
    queryFn: () => getServices().auditLog.list(),
  });
}

export function useAuditVerify() {
  return useQuery({
    queryKey: ["audit-verify"],
    queryFn: () => getServices().auditLog.verifyChain(),
  });
}

/** After any money-layer mutation the whole world may have moved — refetch all. */
function useInvalidateWorld() {
  const client = useQueryClient();
  return () => client.invalidateQueries();
}

export function useEvaluateFinancing() {
  const invalidate = useInvalidateWorld();
  return useMutation({
    mutationFn: (input: FinancingRequestInput) =>
      getServices().riskEngine.evaluate(input),
    onSuccess: invalidate,
  });
}

export function useKillSwitch() {
  const invalidate = useInvalidateWorld();
  return useMutation({
    mutationFn: (args: { agentId: string; killed: boolean }) =>
      getServices().mandateEngine.setKillSwitch(args.agentId, args.killed, "operator:demo"),
    onSuccess: invalidate,
  });
}

export function useGlobalFreeze() {
  const invalidate = useInvalidateWorld();
  return useMutation({
    mutationFn: (frozen: boolean) =>
      getServices().mandateEngine.setGlobalFreeze(frozen, "operator:demo"),
    onSuccess: invalidate,
  });
}

export function useOverrideDecision() {
  const invalidate = useInvalidateWorld();
  return useMutation({
    mutationFn: (args: { decisionId: string; amountUsd: number }) =>
      getServices().mandateEngine.overrideDecision(args.decisionId, args.amountUsd, "operator:demo"),
    onSuccess: invalidate,
  });
}
