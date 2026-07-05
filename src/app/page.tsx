import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

const pillars = [
  {
    title: "Fleet visibility",
    body: "Every agent's revenue, runway, treasury, positions, and counterparties in one institutional-grade console.",
  },
  {
    title: "Revenue-backed financing",
    body: "Agents draw compute financing against verifiable revenue. Every decision returns an explainable rule trace — never a black box.",
  },
  {
    title: "Fail-safe by construction",
    body: "Mandates, kill switches, human override, and a hash-chained audit log sit between every agent and every dollar.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight">Keel</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-ink-faint">
            Prime
          </span>
        </div>
        <Badge tone="caution">Demo · simulated data only</Badge>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-8 pb-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
          Prime brokerage for the AI agent economy
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          The financial control plane for fleets of revenue-generating AI agents.
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Autonomous agents are becoming businesses: they earn, they spend, they need
          working capital. Keel gives their operators supervision, financing, and
          hard controls — with every decision explainable and every event auditable.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-accent-deep px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-accent"
          >
            Open the fleet console
          </Link>
          <Link
            href="/financing"
            className="rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Try the financing flow
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-lg border border-line bg-surface-1 p-5">
              <h2 className="text-sm font-semibold">{p.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-line px-8 py-4 text-[11px] text-ink-faint">
        Prototype demonstrator. No real funds, custody, private keys, or trading —
        the entire money layer is simulated behind typed interfaces.
      </footer>
    </div>
  );
}
