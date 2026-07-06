import type { Metadata } from "next";
import { FleetSummaryRow } from "@/components/dashboard/FleetSummaryRow";
import { FleetTable } from "@/components/dashboard/FleetTable";
import { Panel } from "@/components/ui/Panel";
import { ScreenIntro } from "@/components/ui/ScreenIntro";
import { COPY } from "@/content/copy";

export const metadata: Metadata = { title: "Fleet Dashboard — Keel" };

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <ScreenIntro
        title={COPY.screens.dashboard.title}
        intro={COPY.screens.dashboard.intro}
      />
      <FleetSummaryRow />
      <Panel title="Agents">
        <FleetTable />
      </Panel>
    </div>
  );
}
