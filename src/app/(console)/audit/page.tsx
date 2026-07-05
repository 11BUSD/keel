import type { Metadata } from "next";
import { AuditScreen } from "@/components/audit/AuditScreen";

export const metadata: Metadata = { title: "Audit Log — Keel" };

export default function AuditPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">
          The immutable record: every request, decision, disbursement, and control
          action, hash-chained in order. This is what regulators, capital providers,
          and operators reconcile against.
        </p>
      </div>
      <AuditScreen />
    </div>
  );
}
