import { formatUsd } from "@/lib/format";

/**
 * Round 14: single source of truth for user-facing copy. Plain language leads;
 * expert depth lives behind <Term>/<ShowDetails> (see src/content/terms.ts).
 * Components import from here — no hard-coded narrative copy in components.
 */

export const COPY = {
  landing: {
    kicker: "Prime brokerage for the AI agent economy",
    headline:
      "AI agents are starting to run real businesses — earning, spending, and paying their own bills. Keel is the bank, risk desk, and safety net behind them.",
    subhead:
      "Watch a fleet of AI-run businesses get financed, supervised, and stress-tested — with every decision explained in plain English.",
    ctaConsole: "Open the fleet console",
    ctaFinancing: "Try the financing flow",
    simulatedBadge: "Demo · simulated data only",
    pillars: [
      {
        title: "See every agent's health",
        body: "Each AI business's earnings, spending, bank balance, and customers in one calm screen — with trouble visible at a glance.",
      },
      {
        title: "Cash advances repaid from earnings",
        body: "An agent short on cash can borrow against what it verifiably earns. Every yes or no comes with the plain list of reasons behind it.",
      },
      {
        title: "Safety nets a human controls",
        body: "Rulebooks, off switches, a freeze for the whole fleet, and a tamper-proof record of everything — the human always stays in charge.",
      },
    ],
    footer:
      "Prototype demonstrator. No real funds, custody, private keys, or trading — the entire money layer is simulated behind typed interfaces.",
  },

  shell: {
    brand: "Keel",
    brandSuffix: "Prime",
    simulated: "Simulated data",
    freeze: "Global freeze active",
    chainVerified: (n: number) => `Audit chain verified · ${n} events`,
    chainBroken: "Audit chain BROKEN",
    sessionNote: "Session world · reload to reset",
    sidebarFooter:
      "Demo prototype. All data simulated — no real funds, custody, or trading.",
    nav: {
      dashboard: "Fleet Dashboard",
      financing: "Financing",
      treasury: "Treasury",
      risk: "Correlation Risk",
      scenarios: "Stress Scenarios",
      lenders: "Capital Provider",
      controls: "Fail-safe Controls",
      audit: "Audit Log",
      style: "Design System",
    },
  },

  screens: {
    dashboard: {
      title: "Fleet dashboard",
      intro:
        "Eight simulated AI-run businesses under Keel's supervision — who's earning, who's burning cash, and who needs help. Click any agent to look inside.",
    },
    financing: {
      title: "Financing",
      intro:
        "An agent short on cash can request an advance repaid from its own future earnings. The decision comes back in seconds — with the plain list of reasons behind every yes or no.",
    },
    treasury: {
      title: "Treasury & lifecycle",
      intro:
        "Watch the money story play out: advances get repaid automatically from earnings, and spare cash is parked somewhere safe — but never below each agent's emergency-cash line.",
    },
    risk: {
      title: "Correlation risk",
      intro:
        "Some of these agents look like separate businesses but are secretly the same bet — same AI model, same playbook. Keel spots that and prices it.",
    },
    scenarios: {
      title: "Stress scenarios",
      intro:
        "Trigger a disaster on purpose and watch the safety machinery respond: freezes, slow unwinds, and six layers of shock absorbers before anyone's money is touched.",
    },
    lenders: {
      title: "Capital provider",
      intro:
        "The other side of the market: whoever funds these advances earns most of the fee as profit — and six layers of protection stand between them and any failure.",
    },
    controls: {
      title: "Fail-safe controls",
      intro:
        "The human is always in charge: an off switch for any agent, a freeze for the whole fleet, and a rulebook checked on every decision. Everything done here is recorded.",
    },
    audit: {
      title: "Audit log",
      intro:
        "The tamper-proof record: every request, decision, payment, and control action, in order, each entry fingerprint-linked to the one before it.",
    },
    style: {
      title: "Design system",
      intro:
        "The visual building blocks every screen is made of, with their loading, empty, and error states.",
    },
  },

  financing: {
    formTitle: "Request a cash advance",
    submit: "Submit to risk engine",
    evaluating: "Evaluating…",
    emptyTitle: "No decision yet",
    emptyDetail:
      "Submit a request above to watch the decision happen. Tip: SwarmLabel gets a yes; TickerMind gets a no (one customer is 82% of its income); Nightjar is too small so far.",
    deniedLead: (agentName: string) => `We can't approve this yet for ${agentName}.`,
    plainReasons: {
      frozen: "Everything is frozen fleet-wide right now — no agent can borrow until a human lifts the freeze.",
      inactive: (name: string) =>
        `${name} is switched off right now — only active agents can borrow.`,
      purpose: "Its rulebook doesn't allow borrowing for this purpose.",
      revenueFloor: "It doesn't yet earn enough verified income to qualify.",
      concentration: (name: string, pct: string) =>
        `${name} earns ${pct} of its money from a single customer — if that one customer left, it couldn't pay us back.`,
      tooBig: "The request is bigger than its safety buffer allows.",
    },
    approvedLead: (net: number) =>
      `Approved — ${formatUsd(net)} lands in the agent's balance after the fee.`,
    overrideLead: "A human supervisor approved a smaller amount instead.",
    traceLabel: "Show the details — every rule we checked, with the numbers",
    howToYes: "How to get to yes",
    overrideTitle: "Human override — approve a smaller amount",
    overrideBody:
      "A supervising human can overrule the engine within the safety buffer. The override goes on the permanent record under their name.",
    overrideButton: "Override & approve",
    overrideAmountLabel: "Override amount (USD)",
    overrideAmountError: "Enter a positive override amount in USD.",
  },

  heroMoments: {
    runwayAlert: (name: string, days: number) =>
      `${name} is ${days} days from going dark — it won't be able to pay for the computing power it needs to keep working. This is exactly the moment financing is supposed to solve.`,
    moat: "SwarmLabel, Courier, and TickerMind look like three separate businesses. They're not — they run on the same AI model and the same playbook, so if one fails this way, they all fail together. We treat them as one bet and price it accordingly. No one else in finance can see this, because no one else watches this many agents at once.",
    waterfall:
      "Trigger a flash crash and watch the money stay safe. A failure has to burn through five cushions before it ever reaches a lender — and you can see exactly how much room is left in each one.",
  },

  scenarios: {
    injectTitle: "Trigger a disaster (safely)",
    reset: "Reset scenario state",
    run: (name: string) => `Run ${name.toLowerCase()}`,
    waterfallTitle: "The shock absorbers — who takes the hit, in order",
    waterfallFootnote:
      "A loss fills each cushion completely before touching the next. Lenders sit behind all six — they only lose if every cushion is used up.",
    timelineTitle: "What the machines did about it",
    haltedBadge: "FROZE EVERYTHING — safe by default",
    throttledBadge: "slow, careful unwind",
    emptyTitle: "No disaster triggered yet",
    emptyDetail: "Pick one above and watch the safety machinery respond step by step.",
    lossLine: (loss: string, absorbed: string) => `Damage ${loss} · cushioned ${absorbed}`,
    uncovered: (amount: string) => ` · REACHED LENDERS ${amount}`,
  },

  lenders: {
    committed: "Money put in",
    deployed: "At work / withdrawable",
    spread: "Profit earned so far",
    losses: "Losses that ever reached the lender",
    protectedNote: "Fully protected to date",
    piercedNote: "The shock absorbers were fully used up",
    capitalAtWork: "Capital at work",
    emptyAllocations:
      "No capital at work yet. Approve a financing request — the lender funds it and starts earning.",
    protectionTitle: "What stands between failures and this money",
    protectionBody: (headroom: string) =>
      `${headroom} of cushioning has to be used up before a single dollar of lender money is touched`,
    moveTitle: "Move simulated money in or out",
    deployButton: "Deploy capital",
    withdrawButton: "Withdraw",
    amountLabel: "Amount (USD)",
    liquidHint: (liquid: string) => `Withdrawable now: ${liquid}`,
  },

  controls: {
    freezeTitle: "Freeze everything",
    freezeBody:
      "The big red button for the whole fleet. While it's on, no agent can spend or borrow — every request is automatically refused. Turning it on or off goes on the permanent record.",
    freezeOn: "FREEZE ACTIVE — fleet halted",
    freezeOff: "Fleet operating normally",
    engageFreeze: "Engage global freeze",
    releaseFreeze: "Release global freeze",
    killTitle: "Per-agent off switches",
    killBody:
      "Switching an agent off stops its spending and borrowing instantly. An off agent can't be financed — not even by a human override — until it's switched back on.",
    kill: "Kill",
    reactivate: "Reactivate",
  },

  audit: {
    chainTitle: "Is the record intact?",
    chainVerified: "Chain verified",
    chainBroken: "CHAIN BROKEN",
    chainBody:
      "Every entry carries the fingerprint of the one before it, and we recompute the whole chain on every read — so nobody can quietly rewrite history. (Simulated with a non-cryptographic hash; a real ledger would use SHA-256 with signed anchors.)",
    emptyTitle: "Nothing in this category yet",
    emptyDetail: "Run a financing request or flip a control to generate events.",
  },

  treasury: {
    advanceTitle: "Fast-forward time",
    advanceBody:
      "Each simulated day: earnings come in, bills get paid, a slice of earnings repays any advance, and spare cash gets parked somewhere safe — but the emergency-cash line is always refilled first.",
    advance7: "Advance 7 days",
    advance30: "Advance 30 days",
    bookTitle: "Advances being repaid",
    bookEmpty:
      "No advances yet. Approve a financing request, then fast-forward time to watch it get repaid.",
    reservesTitle: "Emergency cash lines (safety before yield)",
  },
} as const;
