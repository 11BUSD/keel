"use client";

import { Badge } from "@/components/ui/Badge";
import { useTour } from "@/components/tour/TourProvider";
import { COPY } from "@/content/copy";
import { useAuditVerify, useFleetSummary } from "@/hooks/useKeel";

export function Topbar() {
  const summary = useFleetSummary();
  const chain = useAuditVerify();
  const tour = useTour();

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface-1 px-6 py-3">
      <div className="flex items-center gap-3">
        <Badge tone="caution">{COPY.shell.simulated}</Badge>
        {summary.data?.globalFreeze && <Badge tone="danger">{COPY.shell.freeze}</Badge>}
        <button
          onClick={tour.start}
          className="rounded-md border border-accent/40 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
        >
          {COPY.shell.tourButton}
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-faint">
        {chain.data && (
          <Badge tone={chain.data.valid ? "positive" : "danger"}>
            {chain.data.valid
              ? COPY.shell.chainVerified(chain.data.length)
              : COPY.shell.chainBroken}
          </Badge>
        )}
        <span className="hidden sm:inline">{COPY.shell.sessionNote}</span>
      </div>
    </header>
  );
}
