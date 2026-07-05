"use client";

import { Badge } from "@/components/ui/Badge";
import { useAuditVerify, useFleetSummary } from "@/hooks/useKeel";

export function Topbar() {
  const summary = useFleetSummary();
  const chain = useAuditVerify();

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface-1 px-6 py-3">
      <div className="flex items-center gap-3">
        <Badge tone="caution">Simulated data</Badge>
        {summary.data?.globalFreeze && <Badge tone="danger">Global freeze active</Badge>}
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-faint">
        {chain.data && (
          <Badge tone={chain.data.valid ? "positive" : "danger"}>
            {chain.data.valid
              ? `Audit chain verified · ${chain.data.length} events`
              : "Audit chain BROKEN"}
          </Badge>
        )}
        <span>Session world · reload to reset</span>
      </div>
    </header>
  );
}
