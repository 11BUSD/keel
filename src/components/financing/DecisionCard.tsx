"use client";

import { useState } from "react";
import { topCounterpartyShare, type AgentRecord, type RiskDecision } from "@/domain";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { ShowDetails } from "@/components/ui/ShowDetails";
import { COPY } from "@/content/copy";
import { formatPct } from "@/lib/format";
import { useAgent, useOverrideDecision } from "@/hooks/useKeel";
import { outcomeLabel, outcomeTone } from "@/components/statusTone";
import { RuleTraceView } from "./RuleTraceView";
import { TermsGrid } from "./TermsGrid";

export function DecisionCard({
  decision,
  onNewDecision,
}: {
  decision: RiskDecision;
  onNewDecision: (d: RiskDecision) => void;
}) {
  const { data: agent } = useAgent(decision.agentId);

  return (
    <Panel title={`Decision ${decision.id}`}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={outcomeTone(decision.outcome)}>{outcomeLabel[decision.outcome]}</Badge>
            <p className="text-[13px] font-medium text-ink">
              {decision.outcome === "denied"
                ? COPY.financing.deniedLead(agent?.name ?? "this agent")
                : decision.outcome === "approved"
                  ? COPY.financing.approvedLead(decision.terms?.netDisbursedUsd ?? 0)
                  : COPY.financing.overrideLead}
            </p>
          </div>
          {decision.outcome === "denied" && agent && (
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-ink-muted">
              {plainReasons(decision, agent).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          <p className="text-xs text-ink-faint">{decision.summary}</p>
        </div>

        {decision.terms && <TermsGrid terms={decision.terms} />}

        {decision.remediation.length > 0 && (
          <div className="rounded-md border border-caution/30 bg-caution/5 px-3 py-2.5">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-caution">
              {COPY.financing.howToYes}
            </h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-ink-muted">
              {decision.remediation.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <ShowDetails key={decision.id} label={COPY.financing.traceLabel}>
          <RuleTraceView trace={decision.ruleTrace} />
        </ShowDetails>

        {decision.outcome === "denied" && (
          <OverrideForm decision={decision} onNewDecision={onNewDecision} />
        )}
      </div>
    </Panel>
  );
}

/** Plain-English reasons composed from the failed hard rules + agent facts. */
function plainReasons(decision: RiskDecision, agent: AgentRecord): string[] {
  const failed = new Set(
    decision.ruleTrace.filter((r) => r.severity === "hard" && !r.passed).map((r) => r.id),
  );
  const P = COPY.financing.plainReasons;
  const reasons: string[] = [];
  if (failed.has("R1_AGENT_OPERABLE")) {
    reasons.push(agent.status === "active" ? P.frozen : P.inactive(agent.name));
  }
  if (failed.has("R2_PURPOSE_ALLOWED")) reasons.push(P.purpose);
  if (failed.has("R3_REVENUE_FLOOR")) reasons.push(P.revenueFloor);
  if (failed.has("R4_CONCENTRATION")) {
    reasons.push(P.concentration(agent.name, formatPct(topCounterpartyShare(agent), 1)));
  }
  if (failed.has("R6_MANDATE_CAP") || failed.has("R7_COLLATERAL_CAPACITY")) {
    reasons.push(P.tooBig);
  }
  return reasons;
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
      setError(COPY.financing.overrideAmountError);
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
        {COPY.financing.overrideTitle}
      </h3>
      <p className="mt-1 text-xs text-ink-muted">{COPY.financing.overrideBody}</p>
      <div className="mt-3 flex items-end gap-3">
        <div className="max-w-48 flex-1">
          <Field label={COPY.financing.overrideAmountLabel} htmlFor="override-amount">
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
          {COPY.financing.overrideButton}
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
