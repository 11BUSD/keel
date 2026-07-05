"use client";

import { useState } from "react";
import type { RiskDecision } from "@/domain";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { formatPct, formatUsd } from "@/lib/format";
import { useOverrideDecision } from "@/hooks/useKeel";
import { outcomeLabel, outcomeTone } from "@/components/statusTone";
import { RuleTraceView } from "./RuleTraceView";

export function DecisionCard({
  decision,
  onNewDecision,
}: {
  decision: RiskDecision;
  onNewDecision: (d: RiskDecision) => void;
}) {
  return (
    <Panel title={`Decision ${decision.id} · by ${decision.decidedBy === "risk_engine" ? "risk engine" : "human override"}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={outcomeTone(decision.outcome)}>{outcomeLabel[decision.outcome]}</Badge>
          <p className="text-[13px] text-ink-muted">{decision.summary}</p>
        </div>

        {decision.terms && <TermsGrid decision={decision} />}

        <div>
          <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Rule trace — why the engine decided this
          </h3>
          <RuleTraceView trace={decision.ruleTrace} />
        </div>

        {decision.remediation.length > 0 && (
          <div className="rounded-md border border-caution/30 bg-caution/5 px-3 py-2.5">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-caution">
              How to get to yes
            </h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-ink-muted">
              {decision.remediation.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {decision.outcome === "denied" && (
          <OverrideForm decision={decision} onNewDecision={onNewDecision} />
        )}
      </div>
    </Panel>
  );
}

function TermsGrid({ decision }: { decision: RiskDecision }) {
  const t = decision.terms!;
  const rows = [
    ["Principal", formatUsd(t.principalUsd)],
    ["Collateral haircut", formatPct(t.haircut, 0)],
    ["Upfront fee", formatPct(t.fee, 2)],
    ["Revenue-share sweep", formatPct(t.revenueShare, 0)],
    ["Term", `${t.termDays} days`],
    ["Net disbursed", formatUsd(t.netDisbursedUsd)],
  ] as const;
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-md border border-line bg-surface-2 p-3 sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</dt>
          <dd className="tabular mt-0.5 text-sm font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function OverrideForm({
  decision,
  onNewDecision,
}: {
  decision: RiskDecision;
  onNewDecision: (d: RiskDecision) => void;
}) {
  const override = useOverrideDecision();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const amountUsd = Number(amount);
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      setError("Enter a positive override amount in USD.");
      return;
    }
    try {
      const d = await override.mutateAsync({ decisionId: decision.id, amountUsd });
      onNewDecision(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Override failed.");
    }
  };

  return (
    <div className="rounded-md border border-line bg-surface-2 p-3">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        Human override — approve a reduced amount
      </h3>
      <p className="mt-1 text-xs text-ink-muted">
        A supervising human can override the engine within post-haircut capacity. The
        override is logged to the audit chain under the operator&apos;s identity.
      </p>
      <div className="mt-3 flex items-end gap-3">
        <div className="max-w-48 flex-1">
          <Field label="Override amount (USD)" htmlFor="override-amount">
            <TextInput
              id="override-amount"
              inputMode="numeric"
              placeholder="e.g. 4000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
        </div>
        <Button variant="danger" busy={override.isPending} onClick={submit}>
          Override &amp; approve
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
