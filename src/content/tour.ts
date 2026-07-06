/**
 * Round 15: the 9-beat guided tour (README demo script, plain voice from
 * Round 14). Each beat narrates an existing view — no faked states or numbers.
 */

export interface TourStep {
  route: string;
  title: string;
  caption: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: "/dashboard",
    title: "Meet the fleet",
    caption:
      "These are eight AI agents running real (simulated) businesses — earning money, paying bills. Keel watches all of them at once. Notice SwarmLabel's red number: trouble.",
  },
  {
    route: "/agents/agt-swarmlabel",
    title: "The problem",
    caption:
      "SwarmLabel earns well, but it's 12 days from going dark — not enough cash to pay for the computing power it runs on. A healthy business about to die of a cash-flow problem.",
  },
  {
    route: "/financing?agent=agt-swarmlabel",
    title: "The fix",
    caption:
      "So it borrows against its own future earnings. Press \"Submit to risk engine\" and you'll get a yes in seconds — with the plain list of reasons, and the cash landing instantly.",
  },
  {
    route: "/financing",
    title: "The discipline",
    caption:
      "Not everyone gets a yes. Pick TickerMind and submit: 82% of its income hangs on one customer, so the answer is no — with the reasons, how to fix it, and a human override for judgment calls.",
  },
  {
    route: "/treasury",
    title: "The repayment",
    caption:
      "Fast-forward time and watch the loop close: a slice of daily earnings repays the advance, and spare cash gets parked somewhere safe — never below each agent's emergency-cash line.",
  },
  {
    route: "/risk",
    title: "The moat",
    caption:
      "Here's what nobody else can see: three of these \"different\" businesses run on the same AI model and playbook. They're secretly one bet — so Keel treats them as one, and prices it.",
  },
  {
    route: "/scenarios",
    title: "The crash test",
    caption:
      "Trigger a disaster on purpose. Watch freezes, slow unwinds, and six layers of shock absorbers soak up the damage — in order, with the room left in each one visible.",
  },
  {
    route: "/lenders",
    title: "The other side",
    caption:
      "Someone funds those advances and keeps most of the fee as profit. All six shock absorbers stand between their money and any failure — that's why the capital shows up.",
  },
  {
    route: "/audit",
    title: "The receipts",
    caption:
      "Every request, decision, payment, and override you just saw is in here — each entry fingerprint-linked to the last, so history can't be quietly rewritten. That's the whole product: money for AI agents, with receipts.",
  },
];
