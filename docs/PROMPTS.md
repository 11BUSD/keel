# Keel — Prompt Pack (next rounds)

Ready-to-paste prompts for the build loop. Rules: **one task per round**, agent plans
first and waits for approval, the reviewer AI scores the increment with the rubric at
the bottom before the next task starts. The Operating Contract (CLAUDE.md) is assumed
in force for all of them.

---

## TASK 7 — GitHub + CI

```markdown
TASK 7: Put the repo on GitHub with CI that enforces the Definition of Done.

CONTEXT: docs/DECISIONS.md ADR-0007 deferred CI. Trunk must stay deployable with
checks enforced by a machine, not by discipline.

IN SCOPE: .github/workflows/ci.yml, README badge, docs/TASKS.md status, docs/DECISIONS.md.
OUT OF SCOPE: any app code, any dependency change, Playwright (that is Task 8).

ACCEPTANCE CRITERIA:
- [ ] CI runs lint + typecheck + tests on every push and PR; a red check blocks merge
- [ ] Vercel preview deploy per PR; production deploys from main only
- [ ] No secrets in the workflow; DECISIONS.md updated; DoD (§G) met

GUARDRAILS + DELIVERABLE: per template. Plan first.
```

## TASK 8 — Playwright e2e

```markdown
TASK 8: Add Playwright end-to-end tests for the three demo journeys.

CONTEXT: The investor demo must never break silently. docs/PRODUCT.md "Demo narrative"
defines the journeys.

IN SCOPE: playwright config, e2e/ specs, package.json scripts, CI wiring for e2e.
OUT OF SCOPE: app code changes except adding stable data-testid attributes.

ACCEPTANCE CRITERIA:
- [ ] e2e: dashboard renders 8 agents and drill-down to SwarmLabel works
- [ ] e2e: financing approve (SwarmLabel) shows rule trace and updates treasury
- [ ] e2e: financing deny (TickerMind) shows failed rule + remediation; override works
- [ ] e2e: kill switch prevents financing; audit chain shows the events
- [ ] Runs headless in CI; DoD (§G) met
```

## TASK 9 — Portfolio risk view

```markdown
TASK 9: Build the fleet-level risk view: exposure, concentration, correlation.

CONTEXT: docs/PRODUCT.md open question "Correlation/portfolio risk visualization".
A prime broker's edge is seeing risk across the book, not per-agent.

IN SCOPE: /app/(console)/risk route + components, read-only aggregation added to
Ledger interface + MockLedger (one method: getPortfolioRisk()), domain schema for
the aggregate, unit tests for the aggregation math.
OUT OF SCOPE: financing flow, controls, any mutation path.

ACCEPTANCE CRITERIA:
- [ ] Shows fleet exposure by counterparty and by purpose, with concentration flags
- [ ] Shows pairwise revenue-stream overlap (shared counterparties) as a simple matrix
- [ ] All four view states handled; aggregation logic unit-tested; DoD (§G) met
```

## TASK 10 — Capital-provider console

```markdown
TASK 10: Build the lender-side console: the book of advances and yield.

CONTEXT: docs/PRODUCT.md open question "capital-provider side". Shows the marketplace
story: someone funds these advances and earns the fee.

IN SCOPE: /app/(console)/book route + components, Ledger read methods for the advance
book, domain schemas for BookEntry, tests.
OUT OF SCOPE: any real yield math beyond fee accrual over term, auth/tenancy.

ACCEPTANCE CRITERIA:
- [ ] Lists all outstanding advances: agent, principal, fee, term, revenue-share, status
- [ ] Book-level stats: deployed capital, weighted avg fee, expected fee income
- [ ] Updates live when a new advance is approved in the financing flow
- [ ] DoD (§G) met
```

## TASK 11 — Repayment simulation

```markdown
TASK 11: Simulate time: revenue-share sweeps repay outstanding advances.

CONTEXT: docs/PRODUCT.md open question "repayment mechanics". Makes the credit story
complete: advances are not grants.

IN SCOPE: TreasuryEngine interface (one method: advanceTime(days)), mock
implementation, a "simulate 7 days" control in the console shell, audit events for
sweeps, unit tests for sweep math (partial + full repayment, killed agents skip).
OUT OF SCOPE: changing the risk rules, the generator's base world.

ACCEPTANCE CRITERIA:
- [ ] Advancing time sweeps revenueShare × period revenue against outstanding advances
- [ ] Treasury, outstanding, and the lender book all reconcile after a sweep
- [ ] Every sweep is an audit event; chain stays valid; DoD (§G) met
```

## TASK 12 — Scenario seeds

```markdown
TASK 12: Switchable demo scenarios: "calm" and "stressed" fleet worlds.

CONTEXT: Investor Q&A often asks "what does a bad day look like?" A stressed world
(revenue drawdowns, breached concentrations, short runways) shows the controls earning
their keep.

IN SCOPE: mocks/ scenario configs, a scenario switcher in the shell (resets the world),
generator parameterization, tests that both scenarios are deterministic and valid.
OUT OF SCOPE: risk rules, services interfaces.

ACCEPTANCE CRITERIA:
- [ ] Two named seeds selectable in-app; switching regenerates the world and audit log
- [ ] Stressed world triggers visibly different dashboard/risk states
- [ ] Both worlds deterministic; DoD (§G) met
```

---

## The evaluation rubric (give this to the reviewer AI after every task)

```markdown
You are an independent reviewer. Do NOT write features. Evaluate the increment that was
just built against the criteria below. Be adversarial and specific; assume the builder
may have drifted, faked a result, or accrued debt. Verify claims — do not take the
builder's "it works" at face value.

For the task <paste the task and its acceptance criteria>, produce:

1. ACCEPTANCE — For each acceptance criterion: PASS / FAIL / UNVERIFIABLE, with the
   evidence you checked (file, test output, live URL behavior). Any UNVERIFIABLE is a
   process failure — the builder must make it checkable.
2. DRIFT CHECK — Did the change touch only in-scope files? Any scope creep, silent
   architecture changes, or spec deviations not logged in DECISIONS.md? List them.
3. DEBT CHECK — TS strictness respected? Contracts-before-UI honored? Money layer kept
   behind the interface? File/function size limits? Tests present and meaningful?
   Dead/commented code? Rate the debt: none / minor / blocking.
4. HALLUCINATION CHECK — List every external library/API the change uses. Spot-check
   that each exists and is used correctly per its real docs/types. Flag anything
   invented, any fabricated path, any claimed-but-unrun result.
5. INJECTION/SECURITY CHECK — Any place where fetched/runtime/mock data could be treated
   as instructions or executed? Any secrets committed? Input validation at boundaries?
6. UX CHECK — Against docs/DESIGN.md: hierarchy, all states handled, accessibility,
   consistency with the design system, does it feel trustworthy and modern.
7. VERDICT — SHIP / FIX-THEN-SHIP / REJECT, with a numbered list of REQUIRED FIXES.
8. NEXT TASK — Recommend the single highest-value next task and one sentence why.
```
