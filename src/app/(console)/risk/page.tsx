import type { Metadata } from "next";
import { CorrelationScreen } from "@/components/risk/CorrelationScreen";

export const metadata: Metadata = { title: "Correlation Risk — Keel" };

export default function RiskPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Correlation risk</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
          Model-monoculture risk across the fleet: which agents are really the same
          bet, and what that crowding costs them in margin.
        </p>
      </div>
      <CorrelationScreen />
    </div>
  );
}
