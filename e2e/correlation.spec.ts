import { expect, test } from "@playwright/test";

test("correlation view shows the crowded cluster and its margin add-on", async ({
  page,
}) => {
  await page.goto("/risk");

  // The crowded helios-4 cluster: three agents, one exposure, +4% add-on.
  const crowded = page.locator("section", {
    hasText: "helios-4 / autonomous-b2b-services",
  });
  await expect(crowded.getByText("3 correlated agents")).toBeVisible({
    timeout: 10_000,
  });
  await expect(crowded.getByRole("link", { name: "SwarmLabel" })).toBeVisible();
  await expect(crowded.getByRole("link", { name: "Courier" })).toBeVisible();
  await expect(crowded.getByRole("link", { name: "TickerMind" })).toBeVisible();
  await expect(crowded.getByText("+4%")).toBeVisible();

  // Crowding surfaces inside a financing decision as a named rule.
  await page.getByRole("link", { name: "Financing" }).click();
  await page.locator("#fin-agent").selectOption("agt-swarmlabel");
  await page.getByRole("button", { name: "Submit to risk engine" }).click();
  await expect(page.getByText("Approved", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByText(/Show the details/).click();
  await expect(page.getByText("R9_CORRELATION_CROWDING")).toBeVisible();
  await expect(page.getByText(/crowding adds 4% to the fee/)).toBeVisible();
});
