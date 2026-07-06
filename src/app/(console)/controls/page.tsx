import type { Metadata } from "next";
import { ControlsScreen } from "@/components/controls/ControlsScreen";
import { ScreenIntro } from "@/components/ui/ScreenIntro";
import { COPY } from "@/content/copy";

export const metadata: Metadata = { title: "Fail-safe Controls — Keel" };

export default function ControlsPage() {
  return (
    <div className="space-y-4">
      <ScreenIntro
        title={COPY.screens.controls.title}
        intro={COPY.screens.controls.intro}
      />
      <ControlsScreen />
    </div>
  );
}
