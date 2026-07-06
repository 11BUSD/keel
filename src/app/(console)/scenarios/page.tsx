import type { Metadata } from "next";
import { ScenarioScreen } from "@/components/scenarios/ScenarioScreen";

export const metadata: Metadata = { title: "Stress Scenarios — Keel" };

export default function ScenariosPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Stress scenarios</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
          What prevents catastrophic failure, made visible: inject a simulated
          catastrophe and watch the circuit breakers, cohort throttles, fail-safe
          halts, and the default waterfall respond in order.
        </p>
      </div>
      <ScenarioScreen />
    </div>
  );
}
