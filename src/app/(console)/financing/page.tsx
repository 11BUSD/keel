"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { RiskDecision } from "@/domain";
import { DecisionCard } from "@/components/financing/DecisionCard";
import { FinancingForm } from "@/components/financing/FinancingForm";
import { ScreenIntro } from "@/components/ui/ScreenIntro";
import { EmptyState, SkeletonRows } from "@/components/ui/States";
import { COPY } from "@/content/copy";

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
      <ScreenIntro
        title={COPY.screens.financing.title}
        intro={COPY.screens.financing.intro}
      />
      <FinancingForm
        initialAgentId={params.get("agent") ?? undefined}
        onDecision={setDecision}
      />
      {decision ? (
        <DecisionCard decision={decision} onNewDecision={setDecision} />
      ) : (
        <EmptyState
          title={COPY.financing.emptyTitle}
          detail={COPY.financing.emptyDetail}
        />
      )}
    </div>
  );
}
