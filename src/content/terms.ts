/**
 * Round 14: the translation table (docs: Milestone-3 copy system).
 * Every entry: plain lead the layman reads, expert term, one-line definition.
 * Components render these via <Term> — jargon never leads.
 */

export interface TermEntry {
  plain: string;
  expert: string;
  def: string;
}

export const TERMS = {
  runway: {
    plain: "days of cash left to pay its AI bills",
    expert: "runway",
    def: "Treasury ÷ daily burn: how long the agent can operate before the money runs out.",
  },
  burn: {
    plain: "how fast it's spending",
    expert: "daily burn rate",
    def: "What the agent spends per day on compute, data, and services.",
  },
  treasury: {
    plain: "its bank balance",
    expert: "treasury holdings",
    def: "The agent's cash plus stable reserves (all simulated).",
  },
  haircut: {
    plain: "the safety buffer we hold back",
    expert: "collateral haircut",
    def: "We only count part of the agent's earnings as backing, so surprises don't wipe out the lender.",
  },
  concentration: {
    plain: "income that depends on one customer",
    expert: "counterparty concentration",
    def: "The share of revenue coming from a single customer — if they leave, the income goes with them.",
  },
  counterparty: {
    plain: "customer",
    expert: "counterparty",
    def: "Who the agent does business with, each with a credit rating.",
  },
  financing: {
    plain: "a cash advance repaid from its own earnings",
    expert: "revenue-backed financing",
    def: "An advance sized against verifiable revenue, swept back automatically from future income.",
  },
  crowding: {
    plain: "pays more to borrow because too many near-identical agents make the same bet",
    expert: "correlation crowding add-on",
    def: "Agents on the same model + playbook fail together, so each pays a higher fee as the group grows.",
  },
  correlation: {
    plain: "agents that are secretly the same bet",
    expert: "model-lineage correlation cluster",
    def: "Same base model + same strategy = one exposure, however many names it wears.",
  },
  waterfall: {
    plain: "six layers of shock absorbers between a failure and your money",
    expert: "default waterfall",
    def: "Defaulter margin → principal guarantee → cohort margin → equity tranche → default fund → insurance.",
  },
  oracleHalt: {
    plain: "the price feeds disagreed, so we froze everything instead of guessing",
    expert: "halt on oracle divergence",
    def: "When data sources conflict, the system stops rather than act on ambiguity.",
  },
  staggeredLiquidation: {
    plain: "we unwind a failing group slowly so we don't crash the market",
    expert: "cohort-aware tranche liquidation",
    def: "Rate-limited, staggered selling instead of a simultaneous dump.",
  },
  spread: {
    plain: "the lender keeps most of the fee as profit",
    expert: "net interest margin / fee split",
    def: "The capital provider earns 80% of each advance's upfront fee.",
  },
  reserveFloor: {
    plain: "the emergency-cash line we never let an agent drop below",
    expert: "laddered liquidity reserve floor",
    def: "Enough cash for the mandate's minimum runway is defended before any yield-seeking sweep.",
  },
  mandate: {
    plain: "the rulebook that says what an agent is allowed to do",
    expert: "scoped, revocable mandate",
    def: "Hard limits on purposes, amounts, and spending that every decision is checked against.",
  },
  killSwitch: {
    plain: "an off switch for one agent or the whole fleet",
    expert: "per-agent + global halt",
    def: "Killing an agent stops its spending, trading, and financing immediately.",
  },
  auditChain: {
    plain: "a tamper-proof record of everything that happened",
    expert: "hash-linked audit chain",
    def: "Each event carries the fingerprint of the one before it, so history can't be quietly rewritten.",
  },
  ruleTrace: {
    plain: "the plain list of reasons behind every yes or no",
    expert: "explainable rule trace",
    def: "Every decision shows each rule it checked and the numbers that drove it.",
  },
  tbill: {
    plain: "parked in a safe, interest-earning place",
    expert: "simulated tokenized T-bills",
    def: "Idle cash above the reserve floor earns simulated yield until it's needed back.",
  },
} satisfies Record<string, TermEntry>;

export type TermKey = keyof typeof TERMS;
