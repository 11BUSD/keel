/** Horizontal capacity/health meter with semantic tone. */
export function Meter({
  fraction,
  tone,
  label,
}: {
  /** 0..1, clamped. */
  fraction: number;
  tone: "accent" | "positive" | "caution" | "danger";
  label: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${pct}%`, background: `var(--${tone})` }}
      />
    </div>
  );
}
