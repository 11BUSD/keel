// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RuleOutcome } from "@/domain";
import { RuleTraceView } from "@/components/financing/RuleTraceView";
import { Badge } from "./Badge";
import { Meter } from "./Meter";
import { Sparkline } from "./Sparkline";
import { StatBlock } from "./StatBlock";
import { EmptyState, ErrorState, SkeletonRows } from "./States";

describe("design-system primitives (smoke)", () => {
  it("Badge renders its label", () => {
    render(<Badge tone="danger">Denied</Badge>);
    expect(screen.getByText("Denied")).toBeDefined();
  });

  it("StatBlock renders label, value, and sub", () => {
    render(<StatBlock label="Runway" value="12d" sub="at current burn" tone="danger" />);
    expect(screen.getByText("Runway")).toBeDefined();
    expect(screen.getByText("12d")).toBeDefined();
    expect(screen.getByText("at current burn")).toBeDefined();
  });

  it("Meter exposes an accessible meter role with clamped value", () => {
    render(<Meter fraction={1.4} tone="danger" label="Concentration" />);
    const meter = screen.getByRole("meter", { name: "Concentration" });
    expect(meter.getAttribute("aria-valuenow")).toBe("100");
  });

  it("Sparkline renders an accessible svg image", () => {
    render(<Sparkline data={[1, 2, 3]} label="Revenue trend" />);
    expect(screen.getByRole("img", { name: "Revenue trend" })).toBeDefined();
  });

  it("loading / empty / error states render", () => {
    render(
      <div>
        <SkeletonRows rows={2} />
        <EmptyState title="Nothing here" detail="Do the thing." />
        <ErrorState detail="It broke." />
      </div>,
    );
    expect(screen.getByRole("status", { name: "Loading" })).toBeDefined();
    expect(screen.getByText("Nothing here")).toBeDefined();
    expect(screen.getByRole("alert")).toBeDefined();
  });
});

describe("RuleTraceView", () => {
  const trace: RuleOutcome[] = [
    { id: "R1", name: "Agent operable", passed: true, detail: "Status active.", severity: "hard" },
    { id: "R4", name: "Concentration", passed: false, detail: "82% > 70% limit.", severity: "hard" },
  ];

  it("renders every rule with pass/fail semantics", () => {
    render(<RuleTraceView trace={trace} />);
    expect(screen.getByText("Agent operable")).toBeDefined();
    expect(screen.getByText("Concentration")).toBeDefined();
    expect(screen.getByText("82% > 70% limit.")).toBeDefined();
    expect(screen.getByText("passed")).toBeDefined();
    expect(screen.getByText("failed")).toBeDefined();
  });
});
