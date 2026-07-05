# Keel — Architecture (Prototype)

## Fixed stack (do not change without an ADR)

- **Next.js (App Router) + TypeScript strict** — application framework
- **Tailwind CSS v4** — styling via semantic design tokens (see DESIGN.md)
- **TanStack Query** — all client data access goes through queries/mutations
- **zod** — every domain entity has a schema; types are inferred from schemas
- **Vitest + Testing Library** — unit tests for all engine logic, smoke tests for UI
- **Vercel** — deployment target; trunk stays deployable at all times

Deviation from the original playbook stack (shadcn/ui, Playwright, CI) is recorded in
DECISIONS.md — primitives are hand-rolled on Tailwind tokens to minimize the dependency
surface; Playwright/CI are queued as tasks in TASKS.md.

## Module boundaries

```
src/
  domain/       zod schemas + inferred types. No logic, no IO. Everything depends on
                this; this depends on nothing but zod.
  services/     THE MONEY LAYER. Typed interfaces + Mock* implementations + the seeded
                in-memory world store. UI never reaches around these.
  mocks/        Deterministic (seeded) fleet generator producing the simulated world.
  lib/          Pure helpers: seeded RNG, hashing, formatting. No React, no state.
  components/   ui/ (design-system primitives), shell/ (app chrome), feature dirs.
                Components render ONLY domain types and call ONLY hooks.
  hooks/        TanStack Query hooks — the single bridge between React and services.
  app/          Routes. Thin: compose components, no business logic.
```

**Dependency rule:** `app → components → hooks → services → domain ← mocks`.
Nothing imports "upward". `lib` may be imported by anyone; imports nothing local.

## The money layer is an interface (Contract §D4)

All financial state and transitions flow through five typed interfaces in
`src/services/interfaces.ts`:

| Interface       | Responsibility                                               | Mock                |
|-----------------|--------------------------------------------------------------|---------------------|
| `Ledger`        | Read agents, balances, positions, decisions                  | `MockLedger`        |
| `RiskEngine`    | Evaluate financing requests → explainable `RiskDecision`     | `MockRiskEngine`    |
| `TreasuryEngine`| Apply approved advances to treasury; runway math             | `MockTreasuryEngine`|
| `MandateEngine` | Mandate checks, kill switches, human override                | `MockMandateEngine` |
| `AuditLog`      | Append-only, hash-chained event log                          | `MockAuditLog`      |

`src/services/index.ts` exposes a single `getServices()` registry. Swapping in a real
backend means providing real implementations of the five interfaces — no UI changes.

## Data flow (one diagram)

```
 seeded generator (mocks/) ──► WorldStore (services/store.ts, in-memory, per-session)
                                   ▲ read/mutate
      MockLedger / MockRiskEngine / MockTreasuryEngine / MockMandateEngine / MockAuditLog
                                   ▲ getServices()
                     TanStack Query hooks (hooks/) — queries + mutations + invalidation
                                   ▲
                       components/ render domain types; app/ composes routes
```

State is **client-side and ephemeral**: the world is generated from a fixed seed on
first access in the browser, mutated by service calls, reset on reload. This keeps the
deployed demo fully interactive on static/serverless hosting with zero backend state
(ADR-0004).

## How the real backend swaps in later

1. Implement the five interfaces against real services (custody, risk, ledger).
2. Replace `getServices()` wiring (one file) — hooks, components, and routes are
   untouched because they only ever see the interfaces and domain types.
3. The zod schemas at the service boundary become the API validation layer.

## Security baseline

- No secrets anywhere; `.env.example` documents the (empty) config surface.
- Security headers (CSP, X-Frame-Options, nosniff, referrer policy) set in
  `next.config.ts` for all routes.
- No `eval`/dynamic execution; simulated data is rendered as inert text (Contract §A4).
