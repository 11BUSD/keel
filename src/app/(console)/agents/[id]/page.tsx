import type { Metadata } from "next";
import { AgentDetail } from "@/components/agent/AgentDetail";

export const metadata: Metadata = { title: "Agent Detail — Keel" };

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgentDetail agentId={id} />;
}
