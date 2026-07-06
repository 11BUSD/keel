import Link from "next/link";
import type { WaterfallLayer } from "@/domain";
import { WaterfallViz } from "@/components/scenarios/WaterfallViz";
import { Panel } from "@/components/ui/Panel";
import { formatUsdCompact } from "@/lib/format";

/** What stands between agent defaults and the provider's capital. */
export function ProtectionPanel({
  layers,
  lossUsd,
}: {
  layers: WaterfallLayer[];
  lossUsd: number;
}) {
  const headroomUsd = layers.reduce((s, l) => s + (l.capacityUsd - l.absorbedUsd), 0);
  return (
    <Panel title="Loss protection — the waterfall stands in front of you">
      <p className="mb-3 text-[13px] text-ink-muted">
        <span className="tabular font-medium text-positive">
          {formatUsdCompact(headroomUsd)}
        </span>{" "}
        of loss-absorbing headroom sits between agent defaults and provider capital
        {lossUsd === 0 ? " — no loss has ever reached the provider" : ""}. Try a{" "}
        <Link href="/scenarios" className="text-accent hover:underline">
          stress scenario
        </Link>{" "}
        and watch the layers absorb it here.
      </p>
      <WaterfallViz layers={layers} />
    </Panel>
  );
}
