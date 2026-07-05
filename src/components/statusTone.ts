import type { AgentStatus } from "@/domain";
import type { BadgeTone } from "./ui/Badge";

export function statusTone(status: AgentStatus): BadgeTone {
  if (status === "active") return "positive";
  if (status === "paused") return "caution";
  return "danger";
}

export function runwayTone(days: number): "positive" | "caution" | "danger" {
  if (days < 15) return "danger";
  if (days < 30) return "caution";
  return "positive";
}

export function outcomeTone(
  outcome: "approved" | "denied" | "override_approved",
): BadgeTone {
  if (outcome === "approved") return "positive";
  if (outcome === "override_approved") return "caution";
  return "danger";
}

export const outcomeLabel: Record<string, string> = {
  approved: "Approved",
  denied: "Denied",
  override_approved: "Override approved",
};
