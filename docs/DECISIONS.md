# Keel — Decision Log (ADRs)

Append-only. Every meaningful decision: what, why, alternatives rejected.

## ADR-0001 — Simulated data only; money layer behind typed interfaces
**Date:** 2026-07-05 · **Status:** Accepted
The prototype contains no real funds, custody, keys, trading, or financial APIs. All
financial state flows through five typed service interfaces with mock implementations.
**Why:** zero real-world risk; lets the real backend swap in without UI changes.
**Rejected:** wiring any real payment/exchange sandbox (regulatory + security surface
far beyond a demo).

## ADR-0002 — Stack: Next.js App Router + TS strict + Tailwind v4 + TanStack Query + zod + Vitest, deployed on Vercel
**Date:** 2026-07-05 · **Status:** Accepted
**Why:** boring, well-documented stack = low hallucination surface, fast path to a
public URL, high UX ceiling. **Rejected:** Vite SPA (loses easy Vercel headers/routing),
Remix (team familiarity).

## ADR-0003 — Hand-rolled design-system primitives instead of shadcn/ui
**Date:** 2026-07-05 · **Status:** Accepted (deviation from playbook, logged per §E3)
Primitives (Card, StatBlock, DataTable, Badge, Button, states, RuleTrace…) are built
directly on Tailwind semantic tokens in `src/components/ui`.
**Why:** the prototype needs ~15 small primitives; shadcn brings Radix + CLI codegen +
theming conventions we'd immediately restyle. Fewer deps = smaller drift/hallucination
surface. **Rejected:** shadcn/ui (kept as an option if the component surface grows),
any chart library (inline SVG sparklines suffice and are deterministic).

## ADR-0004 — World state is client-side, seeded, ephemeral
**Date:** 2026-07-05 · **Status:** Accepted
The simulated fleet is generated in-browser from a fixed seed into an in-memory store;
service mocks mutate it; reload resets it.
**Why:** a Vercel serverless backend cannot hold in-memory state across invocations;
client state makes the demo fully interactive, deterministic, and free of backend
failure modes. Every investor demo starts from the identical world.
**Rejected:** server route handlers + DB (persistence is a non-goal, adds latency and
ops surface to a demo).

## ADR-0005 — Deterministic rule-based risk engine with first-class rule trace
**Date:** 2026-07-05 · **Status:** Accepted
`MockRiskEngine` evaluates seven ordered, typed rules (kill switch, mandate purpose,
mandate cap, advance-to-revenue ratio, revenue floor, counterparty concentration,
volatility-based haircut). Output is a `RiskDecision` whose `ruleTrace` is rendered
verbatim in the UI.
**Why:** explainability is the product's core claim; a deterministic trace demos
identically every time and is fully unit-testable. **Rejected:** LLM-generated
explanations (non-deterministic, hallucination risk in the one place trust matters).

## ADR-0006 — Hash-chained audit log (FNV-1a 64-bit, in-memory)
**Date:** 2026-07-05 · **Status:** Accepted
Every audit event embeds the previous event's hash; the viewer verifies the chain.
**Why:** demonstrates tamper-evidence cheaply and synchronously in the browser.
FNV-1a is NOT cryptographic — acceptable because the log is simulated; a real system
would use SHA-256 + signed anchors (noted in UI copy). **Rejected:** WebCrypto SHA-256
(async-only API complicates the synchronous store for no demo gain).

## ADR-0008 — Rounds 7–8: git baseline, CI gate, Playwright e2e restored
**Date:** 2026-07-05 · **Status:** Accepted (closes the ADR-0007 deferral)
Repo initialized on `main` with the Milestone-1 app as the baseline commit. CI
(`.github/workflows/ci.yml`) runs typecheck + lint + unit tests + build, plus a
Playwright job covering the six hero-flow e2e tests against a production build on
port 3100. E2e tests use in-app navigation where state must persist, because a full
reload intentionally resets the seeded world (ADR-0004).
**Remaining (requires the human's GitHub/Vercel accounts, not doable from this
machine):** push to GitHub, enable branch protection on `main`, connect the repo to
the Vercel project for PR previews. Recorded as explicit operator steps in README.
**Rejected:** faking a remote or claiming branch protection exists (Contract §C4).

## ADR-0009 — Round 9: financing lifecycle via a daily-step simulation clock
**Date:** 2026-07-06 · **Status:** Accepted
`TreasuryEngine.advanceTime(days)` steps a per-day simulation: revenue accrual (a
flat trailing-30d/30 per day), burn, revenue-share repayment of advances, then a
laddered reserve — surplus above `dailyBurn × minRunwayDays` sweeps into a simulated
tokenized T-bill position (4.5% APY, daily compounding); when burn pulls cash below
the floor, T-bills are **redeemed** to defend it (runway before yield — a failing
test forced this redemption rule, see treasurySim.test.ts). Killed/paused agents
neither earn nor spend. **Rejected:** stochastic daily revenue (breaks demo
determinism); real yield instruments (Contract PRIME DIRECTIVE).

## ADR-0010 — Round 10: correlation clusters as explicit, explainable pricing
**Date:** 2026-07-06 · **Status:** Accepted
Agents carry `baseModel` + `strategyClass`; sharing BOTH forms a correlation cluster
treated as one exposure. Crowding fee add-on = 2% per peer, capped at 8%, surfaced as
info rule `R9_CORRELATION_CROWDING` in every decision trace and applied to approved
and override terms alike. The seeded crowded cluster is helios-4 /
autonomous-b2b-services (SwarmLabel, Courier, TickerMind → +4% each). Exposed via
`RiskEngine.getCorrelationReport()` and the /risk view.
**Rejected:** similarity scores / embedding distance (black box, violates the
explainability contract); counterparty-overlap-only clustering (already covered by
R4 concentration).

## ADR-0007 — Playwright e2e and CI pipeline deferred to next milestone
**Date:** 2026-07-05 · **Status:** Accepted (deviation from playbook, logged per §E3)
Round 1 ships with Vitest unit + component smoke tests, local verify commands, and a
Vercel deploy. **Why:** no git remote/CI provider is wired yet in this environment;
e2e adds most value once flows stabilize. Queued as T-7/T-8 in TASKS.md so it cannot
silently drop. **Rejected:** claiming CI exists without a pipeline (Contract §C4).
