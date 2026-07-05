# Keel — AI Prime Brokerage (Prototype)

A deployed, clickable demonstrator of **Keel**: the financial control plane for fleets
of revenue-generating AI agents. Fleet supervision, revenue-backed compute financing
with **explainable risk decisions**, and hard fail-safe controls (mandates, kill
switches, human override, hash-chained audit log).

> **Simulated data only.** No real funds, custody, private keys, trading, or financial
> APIs anywhere in this codebase. The entire money layer is mocked behind typed
> interfaces (see `docs/ARCHITECTURE.md`).

## Run it

```bash
npm install
npm run dev        # local dev
npm test           # engine + UI tests (Vitest)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # production build
```

## The 3-minute investor demo

1. **Landing → Fleet dashboard.** 8 simulated agents; note **SwarmLabel**: strong
   revenue, **12-day runway** in red.
2. **Click SwarmLabel.** Revenue trend, burn, treasury, positions, counterparties,
   mandate — then **Request financing**.
3. **Submit $25,000 / compute / 30 days.** The risk engine evaluates and **approves
   with a full rule trace**: revenue floor, concentration, volatility haircut,
   mandate cap, collateral capacity, runway impact. Treasury and runway update live.
4. **Switch to TickerMind, request $6,000.** **Denied** — 82% single-counterparty
   concentration, with concrete remediation. Use **human override** to approve a
   reduced $4,000; it's logged under the operator's identity.
5. **Fail-safe controls.** Kill an agent (it can no longer be financed), show the
   global freeze, and end on the **audit log**: every event hash-chained and verified.

Reloading the page resets the simulated world to the identical seeded state — every
demo run is reproducible.

## How this was built (and how to keep building it)

This repo follows a coding-agent control loop designed to prevent prompt injection,
technical debt, drift, and hallucination:

- `CLAUDE.md` — the agent **Operating Contract** (Layer 0), in force on every task
- `docs/PRODUCT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `STANDARDS.md` — the single
  source of truth (Layer 1)
- `docs/TASKS.md` — the sequenced backlog; one vertical slice per round (Layer 2)
- `docs/PROMPTS.md` — **ready-to-paste task prompts for the next milestone and the
  evaluation rubric** for an independent reviewer AI (Layers 2+3)
- `docs/DECISIONS.md` — the ADR log / drift audit trail

## Architecture in one paragraph

Next.js App Router + TypeScript strict + Tailwind v4 + TanStack Query + zod + Vitest.
All financial state flows through five typed service interfaces (`Ledger`,
`RiskEngine`, `TreasuryEngine`, `MandateEngine`, `AuditLog`) with mock
implementations over a seeded, in-browser world store. Swapping in a real backend
means re-implementing five interfaces — no UI changes. See `docs/ARCHITECTURE.md`.
