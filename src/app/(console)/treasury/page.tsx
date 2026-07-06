import type { Metadata } from "next";
import { TreasuryScreen } from "@/components/treasury/TreasuryScreen";
import { ScreenIntro } from "@/components/ui/ScreenIntro";
import { COPY } from "@/content/copy";

export const metadata: Metadata = { title: "Treasury & Lifecycle — Keel" };

export default function TreasuryPage() {
  return (
    <div className="space-y-4">
      <ScreenIntro
        title={COPY.screens.treasury.title}
        intro={COPY.screens.treasury.intro}
      />
      <TreasuryScreen />
    </div>
  );
}
