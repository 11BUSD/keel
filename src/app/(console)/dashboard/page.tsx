import type { Metadata } from "next";
import { FleetSummaryRow } from "@/components/dashboard/FleetSummaryRow";
import { FleetTable } from "@/components/dashboard/FleetTable";
import { Panel } from "@/components/ui/Panel";

export const metadata: Metadata = { title: "Fleet Dashboard — Keel" };

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Fleet dashboard</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          A simulated fleet of revenue-generating AI agents under Keel supervision.
          Click an agent to drill down.
        </p>
      </div>
      <FleetSummaryRow />
      <Panel title="Agents">
        <FleetTable />
      </Panel>
    </div>
  );
}
