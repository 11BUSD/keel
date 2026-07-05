import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "positive" | "caution" | "danger" | "accent";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line text-ink-muted bg-surface-2",
  positive: "border-positive/30 text-positive bg-positive/10",
  caution: "border-caution/30 text-caution bg-caution/10",
  danger: "border-danger/30 text-danger bg-danger/10",
  accent: "border-accent/30 text-accent bg-accent/10",
};

/** Status chip. Always carries a text label — never color alone (DESIGN.md a11y). */
export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
