"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { StatBlock } from "@/components/ui/StatBlock";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { COPY } from "@/content/copy";
import { formatPct, formatUsdCompact } from "@/lib/format";
import {
  useCapitalProvider,
  useDeployCapital,
  useScenarioState,
  useWithdrawCapital,
} from "@/hooks/useKeel";
import { AllocationList } from "./AllocationList";
import { ProtectionPanel } from "./ProtectionPanel";

export function LenderScreen() {
  const provider = useCapitalProvider();
  const scenario = useScenarioState();

  if (provider.isPending || scenario.isPending) return <SkeletonRows rows={8} />;
  if (provider.isError || !provider.data || !scenario.data) {
    return (
      <ErrorState detail="Could not load the lender book." onRetry={() => provider.refetch()} />
    );
  }

  const p = provider.data;
  const spreadRate = p.committedUsd > 0 ? p.earnedSpreadUsd / p.committedUsd : 0;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock label={COPY.lenders.committed} value={formatUsdCompact(p.committedUsd)} sub={p.name} />
        <StatBlock
          label={COPY.lenders.deployed}
          value={`${formatUsdCompact(p.deployedUsd)} / ${formatUsdCompact(p.availableUsd)}`}
          tone={p.deployedUsd > 0 ? "accent" : "neutral"}
          sub="Funding advances vs withdrawable"
        />
        <StatBlock
          label={COPY.lenders.spread}
          value={formatUsdCompact(p.earnedSpreadUsd)}
          tone={p.earnedSpreadUsd > 0 ? "positive" : "neutral"}
          sub={`${formatPct(spreadRate, 2)} on money put in`}
        />
        <StatBlock
          label={COPY.lenders.losses}
          value={formatUsdCompact(p.lossUsd)}
          tone={p.lossUsd > 0 ? "danger" : "positive"}
          sub={p.lossUsd > 0 ? COPY.lenders.piercedNote : COPY.lenders.protectedNote}
        />
      </div>

      <CapitalControls liquidUsd={p.availableUsd} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AllocationList provider={p} />
        <ProtectionPanel layers={scenario.data.layers} lossUsd={p.lossUsd} />
      </div>
    </div>
  );
}

function CapitalControls({ liquidUsd }: { liquidUsd: number }) {
  const deploy = useDeployCapital();
  const withdraw = useWithdrawCapital();
  const [amount, setAmount] = useState("250000");
  const [error, setError] = useState<string | null>(null);

  const move = async (direction: "deploy" | "withdraw") => {
    setError(null);
    const amountUsd = Number(amount);
    try {
      if (direction === "deploy") await deploy.mutateAsync(amountUsd);
      else await withdraw.mutateAsync(amountUsd);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Capital movement failed.");
    }
  };

  return (
    <Panel title={COPY.lenders.moveTitle}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="max-w-52 flex-1">
          <Field
            label={COPY.lenders.amountLabel}
            htmlFor="capital-amount"
            hint={COPY.lenders.liquidHint(formatUsdCompact(liquidUsd))}
          >
            <TextInput
              id="capital-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
        </div>
        <Button busy={deploy.isPending} onClick={() => move("deploy")}>
          {COPY.lenders.deployButton}
        </Button>
        <Button variant="ghost" busy={withdraw.isPending} onClick={() => move("withdraw")}>
          {COPY.lenders.withdrawButton}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </Panel>
  );
}
