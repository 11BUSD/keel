# Keel — Product Spec (Prototype)

Keel is a **prime brokerage for the AI agent economy**: the financial control plane
where operators of revenue-generating AI agents monitor their fleet, finance compute
against verifiable agent revenue, and keep every dollar of agent activity inside
explainable, auditable, human-controllable guardrails.

## What this prototype demonstrates

A deployed, clickable demo of the beachhead product:

1. **Fleet dashboard** — a simulated fleet of revenue-generating AI agents; each agent's
   revenue, runway, treasury, positions, counterparties, and mandate at a glance, with
   drill-down to a full agent detail view.
2. **Compute-cost financing** — the "money shot": request a cash advance against an
   agent's simulated verifiable revenue, watch the risk engine evaluate it, and get an
   **explainable approve/deny decision** with the full rule trace (which limits,
   collateral, and cashflow facts drove it) and resulting haircut/fee terms.
3. **Fail-safe controls** — per-agent and global kill switches, mandate limits enforced
   on every decision, human override of denied requests, and a hash-chained audit log
   where every state change is recorded and viewable.

## What this prototype explicitly does NOT do (non-goals)

- **No real funds, custody, private keys, live trading, or third-party financial APIs.**
  Every balance and transaction is simulated in-browser behind the typed money-layer
  interfaces (ARCHITECTURE.md §Money layer).
- No authentication or multi-tenancy — it is a public demo of a single simulated fleet.
- No real credit models — the risk engine is a deterministic, explainable rule engine
  over simulated data.
- No persistence — state lives in the browser session and resets on reload (by design:
  every demo starts from the same seeded world).

## Demo narrative (the 3-minute investor walkthrough)

1. Land on the fleet dashboard: 8 simulated agents, health at a glance, one agent
   visibly low on runway.
2. Open that agent: revenue trend, burn, runway, positions, counterparties, mandate.
3. Request a compute financing advance → risk engine runs → **approved with a visible
   rule trace** and terms; treasury and runway update immediately.
4. Try an oversized advance on a risky agent → **denied, with the exact failed rules
   and remediation** shown.
5. Use human override to approve a reduced amount; flip the kill switch; show that a
   killed agent cannot be financed; end on the audit log showing every event
   hash-chained.

## Open questions (decide before the next milestone)

- Capital-provider (lender) side of the marketplace: separate view or separate app?
- Correlation/portfolio risk visualization across agents.
- Repayment mechanics in the simulation (revenue-share sweep vs. fixed schedule).
- Whether the demo should support multiple seeded scenarios (bull/bear fleet).
