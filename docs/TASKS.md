# Keel — Task Backlog

One vertical slice per round. A task is DONE only per Contract §G.

## Milestone 1 — live, beautiful, simulated fleet dashboard (this round)

| # | Task | Status |
|---|------|--------|
| T-0 | Scaffold Next.js + TS strict + Tailwind, deployable | ✅ done |
| T-1 | Grounding docs (/docs) | ✅ done |
| T-2 | Design tokens + ui primitives + app shell + /style showcase | ✅ done |
| T-3 | Domain schemas (zod) + service interfaces + seeded mock world + engine tests | ✅ done |
| T-4 | Fleet dashboard + agent detail (read-only hero views) | ✅ done |
| T-5 | Financing flow with explainable decision + audit writes | ✅ done |
| T-6 | Fail-safe controls: kill switches, human override, audit log viewer | ✅ done |

## Milestone 2 — enforceable loop + the full money story (per the Milestone-2 prompt pack)

| # | Task | Status |
|---|------|--------|
| R-7 | git repo + CI gate (typecheck/lint/test/build + e2e job) | ✅ local repo + workflow done; GitHub push / branch protection / Vercel-git connect are operator steps (see README) |
| R-8 | Playwright e2e for the hero flows, wired into CI | ✅ done (6 journeys) |
| R-9 | Financing lifecycle: draw → repay + reserve-floored T-bill sweep | ✅ done |
| R-10 | Correlation clusters feed margin (R9_CORRELATION_CROWDING) + /risk view | ✅ done |
| R-11 | Stress scenarios + CCP default waterfall + fail-safe halt + /scenarios | ✅ done |
| R-12 | Capital-provider console: fund, earn spread, waterfall-protected | ✅ done |

## Milestone 3 — legibility & shareability (per the Milestone-3 prompt pack)

| # | Task | Status |
|---|------|--------|
| R-13 | CI green on a real runner | ✅ verified (run 28790483341); branch protection + Vercel-git connect remain operator steps |
| R-14 | Plain-language copy system: copy.ts + Term/ShowDetails/ScreenIntro | ✅ done |
| R-15 | Guided 9-beat tour | ✅ done |
| R-16 | Cold-visitor explainer | ✅ done |
| R-17 | Shareability: OG card, responsive, a11y pass | ✅ done |

## Acceptance criteria live with each task prompt; statuses updated per round.
