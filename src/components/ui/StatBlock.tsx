import type { ReactNode } from "react";
import type { BadgeTone } from "./Badge";

const valueTones: Record<BadgeTone, string> = {
  neutral: "text-ink",
  positive: "text-positive",
  caution: "text-caution",
  danger: "text-danger",
  accent: "text-accent",
};

export function StatBlock({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-1 px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </div>
      <div className={`tabular mt-1 text-2xl font-semibold ${valueTones[tone]}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>}
    </div>
  );
}
