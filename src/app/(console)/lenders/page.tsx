import type { Metadata } from "next";
import { LenderScreen } from "@/components/lenders/LenderScreen";

export const metadata: Metadata = { title: "Capital Provider — Keel" };

export default function LendersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Capital provider</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
          The other side of the marketplace: deploy simulated capital, fund agent
          advances, earn the spread — protected by the full default waterfall.
        </p>
      </div>
      <LenderScreen />
    </div>
  );
}
