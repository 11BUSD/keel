import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { Sparkline } from "@/components/ui/Sparkline";
import { StatBlock } from "@/components/ui/StatBlock";
import { EmptyState, ErrorState, Skeleton, SkeletonRows } from "@/components/ui/States";

export const metadata: Metadata = { title: "Design System — Keel" };

const tokens = [
  "surface-0",
  "surface-1",
  "surface-2",
  "surface-3",
  "accent",
  "positive",
  "caution",
  "danger",
] as const;

export default function StylePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Design system</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Semantic tokens and every primitive with its loading, empty, and error states
          (docs/DESIGN.md).
        </p>
      </div>

      <Panel title="Color tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tokens.map((t) => (
            <div key={t} className="flex items-center gap-2 text-xs">
              <span
                className="size-8 rounded border border-line"
                style={{ background: `var(--${t})` }}
              />
              <span className="font-mono text-ink-muted">--{t}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Typography">
        <div className="space-y-2">
          <p className="text-2xl font-semibold">Hero stat — 24/semibold</p>
          <p className="text-xl font-semibold">Page title — 20/semibold</p>
          <p className="text-base font-semibold">Section — 16/semibold</p>
          <p className="text-[13px]">Body/data — 13/regular</p>
          <p className="text-[11px] uppercase tracking-wider text-ink-faint">
            Label — 11/medium/tracked
          </p>
          <p className="tabular font-mono text-[13px]">Mono figures — 1,234,567.89</p>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Badges & buttons">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="positive">Positive</Badge>
            <Badge tone="caution">Caution</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="accent">Accent</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button busy>Busy</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Panel>

        <Panel title="Stats, meters, trends">
          <div className="grid grid-cols-2 gap-3">
            <StatBlock label="Revenue (30d)" value="$92K" sub="+14% MoM" tone="positive" />
            <StatBlock label="Runway" value="12d" sub="Below mandate floor" tone="danger" />
          </div>
          <div className="mt-4 space-y-2">
            <Meter fraction={0.31} tone="accent" label="Example meter low" />
            <Meter fraction={0.62} tone="caution" label="Example meter mid" />
            <Meter fraction={0.86} tone="danger" label="Example meter high" />
          </div>
          <div className="mt-4">
            <Sparkline data={[38, 42, 40, 48, 52, 49, 61, 67]} width={280} height={48} label="Example trend" />
          </div>
        </Panel>

        <Panel title="Form controls">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Text input" htmlFor="style-input" hint="With hint text">
              <TextInput id="style-input" placeholder="Placeholder…" />
            </Field>
            <Field label="Select" htmlFor="style-select">
              <Select id="style-select" defaultValue="b">
                <option value="a">Option A</option>
                <option value="b">Option B</option>
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title="Required states">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-24" />
              <SkeletonRows rows={1} />
            </div>
            <EmptyState title="Empty state" detail="Explains what fills it and how." />
            <ErrorState detail="Error state with what failed." />
          </div>
        </Panel>
      </div>
    </div>
  );
}
