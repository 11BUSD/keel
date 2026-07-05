import type { Metadata } from "next";
import { ControlsScreen } from "@/components/controls/ControlsScreen";

export const metadata: Metadata = { title: "Fail-safe Controls — Keel" };

export default function ControlsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Fail-safe controls</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
          The human stays in charge: fleet-wide freeze, per-agent kill switches, and
          mandate limits enforced on every decision. Every action here is audited.
        </p>
      </div>
      <ControlsScreen />
    </div>
  );
}
