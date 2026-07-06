// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScreenIntro } from "./ScreenIntro";
import { ShowDetails } from "./ShowDetails";
import { Term } from "./Term";

describe("progressive-disclosure primitives (Round 14)", () => {
  it("Term leads with the plain phrase and reveals the expert definition on click", () => {
    render(<Term plain="safety buffer" expert="collateral haircut" def="We hold part back." />);
    const trigger = screen.getByRole("button", { name: "safety buffer" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("collateral haircut")).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("collateral haircut")).toBeDefined();
    expect(screen.getByText("We hold part back.")).toBeDefined();
  });

  it("ShowDetails collapses the expert layer by default", () => {
    render(
      <ShowDetails label="Show the details">
        <p>R4_CONCENTRATION 82%</p>
      </ShowDetails>,
    );
    const details = screen.getByText("Show the details").closest("details");
    expect(details?.hasAttribute("open")).toBe(false);
    expect(screen.getByText("R4_CONCENTRATION 82%")).toBeDefined();
  });

  it("ScreenIntro renders the title and the one plain sentence", () => {
    render(<ScreenIntro title="Fleet dashboard" intro="Who's earning, who needs help." />);
    expect(screen.getByRole("heading", { name: "Fleet dashboard" })).toBeDefined();
    expect(screen.getByText("Who's earning, who needs help.")).toBeDefined();
  });
});
