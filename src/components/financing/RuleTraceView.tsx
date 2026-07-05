import type { RuleOutcome } from "@/domain";
import { Badge } from "@/components/ui/Badge";

/** The explainable decision, rendered verbatim from the engine (ADR-0005). */
export function RuleTraceView({ trace }: { trace: RuleOutcome[] }) {
  return (
    <ol className="space-y-1.5">
      {trace.map((rule) => (
        <li
          key={rule.id}
          className={`flex items-start gap-3 rounded-md border px-3 py-2 ${
            rule.passed ? "border-line bg-surface-2" : "border-danger/40 bg-danger/5"
          }`}
        >
          <span
            aria-hidden
            className={`mt-0.5 text-sm ${rule.passed ? "text-positive" : "text-danger"}`}
          >
            {rule.passed ? "✓" : "✗"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-ink">{rule.name}</span>
              <span className="font-mono text-[10px] text-ink-faint">{rule.id}</span>
              <Badge tone={rule.severity === "hard" ? "neutral" : "accent"}>
                {rule.severity === "hard" ? "hard rule" : "pricing"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{rule.detail}</p>
          </div>
          <span className="sr-only">{rule.passed ? "passed" : "failed"}</span>
        </li>
      ))}
    </ol>
  );
}
