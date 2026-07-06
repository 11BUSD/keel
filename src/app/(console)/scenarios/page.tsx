import type { Metadata } from "next";
import { ScenarioScreen } from "@/components/scenarios/ScenarioScreen";
import { ScreenIntro } from "@/components/ui/ScreenIntro";
import { COPY } from "@/content/copy";

export const metadata: Metadata = { title: "Stress Scenarios — Keel" };

export default function ScenariosPage() {
  return (
    <div className="space-y-4">
      <ScreenIntro
        title={COPY.screens.scenarios.title}
        intro={COPY.screens.scenarios.intro}
      />
      <ScenarioScreen />
    </div>
  );
}
