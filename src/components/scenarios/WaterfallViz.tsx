import type { WaterfallLayer } from "@/domain";
import { formatUsdCompact } from "@/lib/format";

/**
 * The default waterfall, layer by layer: absorbed vs remaining headroom.
 * Reads top-down in loss order — the same order the engine fills them.
 */
export function WaterfallViz({ layers }: { layers: WaterfallLayer[] }) {
  return (
    <ol className="space-y-2.5">
      {layers.map((layer, i) => {
        const used = layer.absorbedUsd / layer.capacityUsd;
        const exhausted = used >= 1;
        return (
          <li key={layer.id} className="text-[13px]">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-ink-faint">L{i + 1}</span>
                <span className={exhausted ? "text-danger" : "text-ink"}>{layer.label}</span>
              </span>
              <span className="tabular text-[11px] text-ink-muted">
                {formatUsdCompact(layer.absorbedUsd)} / {formatUsdCompact(layer.capacityUsd)}
                {exhausted && <span className="ml-1.5 text-danger">EXHAUSTED</span>}
              </span>
            </div>
            <div
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(Math.min(1, used) * 100)}
              aria-label={`${layer.label} absorption`}
              className="h-2.5 w-full overflow-hidden rounded-full bg-surface-3"
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${Math.min(1, used) * 100}%`,
                  background: exhausted ? "var(--danger)" : used > 0 ? "var(--caution)" : "var(--positive)",
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
