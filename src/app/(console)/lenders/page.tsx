import type { Metadata } from "next";
import { LenderScreen } from "@/components/lenders/LenderScreen";
import { ScreenIntro } from "@/components/ui/ScreenIntro";
import { COPY } from "@/content/copy";

export const metadata: Metadata = { title: "Capital Provider — Keel" };

export default function LendersPage() {
  return (
    <div className="space-y-4">
      <ScreenIntro
        title={COPY.screens.lenders.title}
        intro={COPY.screens.lenders.intro}
      />
      <LenderScreen />
    </div>
  );
}
