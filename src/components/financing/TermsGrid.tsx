import type { ReactNode } from "react";
import type { AdvanceTerms } from "@/domain";
import { Term } from "@/components/ui/Term";
import { TERMS } from "@/content/terms";
import { formatPct, formatUsd } from "@/lib/format";

/** The approved terms, plain-labeled with expert terms one tap away. */
export function TermsGrid({ terms }: { terms: AdvanceTerms }) {
  const rows: { label: ReactNode; value: string; key: string }[] = [
    { key: "principal", label: "Amount borrowed", value: formatUsd(terms.principalUsd) },
    {
      key: "haircut",
      label: <Term plain="Safety buffer" expert={TERMS.haircut.expert} def={TERMS.haircut.def} />,
      value: formatPct(terms.haircut, 0),
    },
    { key: "fee", label: "Upfront fee", value: formatPct(terms.fee, 2) },
    {
      key: "sweep",
      label: <Term plain="Earnings share for repayment" expert={TERMS.financing.expert} def={TERMS.financing.def} />,
      value: formatPct(terms.revenueShare, 0),
    },
    { key: "term", label: "Term", value: `${terms.termDays} days` },
    { key: "net", label: "Cash that lands", value: formatUsd(terms.netDisbursedUsd) },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-md border border-line bg-surface-2 p-3 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.key}>
          <dt className="text-[10px] uppercase tracking-wider text-ink-faint">{row.label}</dt>
          <dd className="tabular mt-0.5 text-sm font-medium text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
