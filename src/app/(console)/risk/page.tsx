import type { Metadata } from "next";
import { CorrelationScreen } from "@/components/risk/CorrelationScreen";
import { ScreenIntro } from "@/components/ui/ScreenIntro";
import { COPY } from "@/content/copy";

export const metadata: Metadata = { title: "Correlation Risk — Keel" };

export default function RiskPage() {
  return (
    <div className="space-y-4">
      <ScreenIntro title={COPY.screens.risk.title} intro={COPY.screens.risk.intro} />
      <CorrelationScreen />
    </div>
  );
}
