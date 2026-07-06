import Link from "next/link";
import type { WaterfallLayer } from "@/domain";
import { WaterfallViz } from "@/components/scenarios/WaterfallViz";
import { Panel } from "@/components/ui/Panel";
import { COPY } from "@/content/copy";
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
    <Panel title={COPY.lenders.protectionTitle}>
      <p className="mb-3 text-[13px] text-ink-muted">
        {COPY.lenders.protectionBody(formatUsdCompact(headroomUsd))}
        {lossUsd === 0 ? " — and none ever has been." : "."} Try a{" "}
        <Link href="/scenarios" className="text-accent hover:underline">
          stress scenario
        </Link>{" "}
        and watch the cushions absorb it here.
      </p>
      <WaterfallViz layers={layers} />
    </Panel>
  );
}
