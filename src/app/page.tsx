import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { COPY } from "@/content/copy";

const { landing } = COPY;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight">{COPY.shell.brand}</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-ink-faint">
            {COPY.shell.brandSuffix}
          </span>
        </div>
        <Badge tone="caution">{landing.simulatedBadge}</Badge>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-8 pb-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
          {landing.kicker}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-[2.6rem]">
          {landing.headline}
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          {landing.subhead}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-accent-deep px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-accent"
          >
            {landing.ctaConsole}
          </Link>
          <Link
            href="/financing"
            className="rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {landing.ctaFinancing}
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {landing.pillars.map((p) => (
            <div key={p.title} className="rounded-lg border border-line bg-surface-1 p-5">
              <h2 className="text-sm font-semibold">{p.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-line px-8 py-4 text-[11px] text-ink-faint">
        {landing.footer}
      </footer>
    </div>
  );
}
