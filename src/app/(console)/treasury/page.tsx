import type { Metadata } from "next";
import { TreasuryScreen } from "@/components/treasury/TreasuryScreen";

export const metadata: Metadata = { title: "Treasury & Lifecycle — Keel" };

export default function TreasuryPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Treasury &amp; lifecycle</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
          The money story end-to-end: advances draw down, revenue-share sweeps repay
          them on schedule, and surplus cash sweeps into simulated tokenized T-bills —
          with each agent&apos;s compute-cost reserve protected before any sweep.
        </p>
      </div>
      <TreasuryScreen />
    </div>
  );
}
