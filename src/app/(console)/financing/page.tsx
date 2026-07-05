"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { RiskDecision } from "@/domain";
import { DecisionCard } from "@/components/financing/DecisionCard";
import { FinancingForm } from "@/components/financing/FinancingForm";
import { EmptyState, SkeletonRows } from "@/components/ui/States";

export default function FinancingPage() {
  return (
    <Suspense fallback={<SkeletonRows rows={6} />}>
      <FinancingScreen />
    </Suspense>
  );
}

function FinancingScreen() {
  const params = useSearchParams();
  const [decision, setDecision] = useState<RiskDecision | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Financing</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
          Request a cash advance against an agent&apos;s simulated verifiable revenue.
          The risk engine returns an explainable decision — every rule it checked, with
          the numbers that drove it — and writes everything to the audit chain.
        </p>
      </div>
      <FinancingForm
        initialAgentId={params.get("agent") ?? undefined}
        onDecision={setDecision}
      />
      {decision ? (
        <DecisionCard decision={decision} onNewDecision={setDecision} />
      ) : (
        <EmptyState
          title="No decision yet"
          detail="Submit a request above to watch the risk engine evaluate it. Tip: SwarmLabel approves; TickerMind denies on concentration; Nightjar denies on the revenue floor."
        />
      )}
    </div>
  );
}
