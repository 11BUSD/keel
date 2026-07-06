import type { Metadata } from "next";
import { AuditScreen } from "@/components/audit/AuditScreen";
import { ScreenIntro } from "@/components/ui/ScreenIntro";
import { COPY } from "@/content/copy";

export const metadata: Metadata = { title: "Audit Log — Keel" };

export default function AuditPage() {
  return (
    <div className="space-y-4">
      <ScreenIntro title={COPY.screens.audit.title} intro={COPY.screens.audit.intro} />
      <AuditScreen />
    </div>
  );
}
