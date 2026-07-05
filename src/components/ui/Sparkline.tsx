/** Deterministic inline-SVG trend chart — no chart library (ADR-0003). */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  tone = "accent",
  showArea = true,
  label,
  stretch = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  tone?: "accent" | "positive" | "caution" | "danger";
  showArea?: boolean;
  label?: string;
  /** Scale to the container width (viewBox keeps the aspect ratio). */
  stretch?: boolean;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 2;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
  });
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;
  const color = `var(--${tone})`;

  return (
    <svg
      width={stretch ? undefined : width}
      height={stretch ? undefined : height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label ?? "Trend"}
      className={stretch ? "h-auto w-full" : "shrink-0"}
    >
      {showArea && <polygon points={area} fill={color} opacity={0.12} />}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={2} fill={color} />
    </svg>
  );
}
