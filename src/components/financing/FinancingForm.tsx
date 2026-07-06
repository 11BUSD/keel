"use client";

import { useEffect, useState } from "react";
import {
  financingPurposeSchema,
  financingRequestInputSchema,
  type RiskDecision,
} from "@/domain";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { COPY } from "@/content/copy";
import { useAgents, useEvaluateFinancing } from "@/hooks/useKeel";

const evaluationSteps = [
  "Verifying revenue attestations…",
  "Checking mandate limits…",
  "Assessing counterparty concentration…",
  "Pricing volatility haircut…",
  "Writing to the audit chain…",
];

export function FinancingForm({
  initialAgentId,
  onDecision,
}: {
  initialAgentId?: string;
  onDecision: (d: RiskDecision) => void;
}) {
  const agents = useAgents();
  const evaluate = useEvaluateFinancing();
  const [agentId, setAgentId] = useState(initialAgentId ?? "");
  const [amount, setAmount] = useState("25000");
  const [purpose, setPurpose] = useState("compute");
  const [termDays, setTermDays] = useState("30");
  const [error, setError] = useState<string | null>(null);

  // Derived default: first agent until the user picks one (no effect needed).
  const effectiveAgentId = agentId || agents.data?.[0]?.id || "";

  if (agents.isPending) {
    return (
      <Panel title={COPY.financing.formTitle}>
        <SkeletonRows rows={4} />
      </Panel>
    );
  }
  if (agents.isError || !agents.data) {
    return <ErrorState detail="Could not load the fleet." onRetry={() => agents.refetch()} />;
  }

  const submit = async () => {
    setError(null);
    const parsed = financingRequestInputSchema.safeParse({
      agentId: effectiveAgentId,
      amountUsd: Number(amount),
      purpose,
      termDays: Number(termDays),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · "));
      return;
    }
    try {
      onDecision(await evaluate.mutateAsync(parsed.data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed.");
    }
  };

  return (
    <Panel title={COPY.financing.formTitle}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Agent" htmlFor="fin-agent">
          <Select
            id="fin-agent"
            value={effectiveAgentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            {agents.data.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.archetype}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Amount (USD)" htmlFor="fin-amount">
          <TextInput
            id="fin-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label="Purpose" htmlFor="fin-purpose">
          <Select id="fin-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            {financingPurposeSchema.options.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Term" htmlFor="fin-term">
          <Select id="fin-term" value={termDays} onChange={(e) => setTermDays(e.target.value)}>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </Select>
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Button busy={evaluate.isPending} onClick={submit}>
          {evaluate.isPending ? COPY.financing.evaluating : COPY.financing.submit}
        </Button>
        {evaluate.isPending && <EvaluationTicker />}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      )}
    </Panel>
  );
}

/** Purely visual progress narration while the mock engine "thinks". */
function EvaluationTicker() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % evaluationSteps.length), 350);
    return () => clearInterval(t);
  }, []);
  return (
    <span aria-live="polite" className="text-xs text-ink-muted">
      {evaluationSteps[step]}
    </span>
  );
}
