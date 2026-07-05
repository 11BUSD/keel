import { expect, test } from "@playwright/test";

test("approve path: SwarmLabel gets an advance with a full rule trace", async ({
  page,
}) => {
  await page.goto("/financing?agent=agt-swarmlabel");
  await page.getByRole("button", { name: "Submit to risk engine" }).click();

  await expect(page.getByText("Approved", { exact: true })).toBeVisible({
    timeout: 15_000,
  });

  // The explainable trace renders all 8 rules with the driving numbers.
  await expect(page.getByText("R1_AGENT_OPERABLE")).toBeVisible();
  await expect(page.getByText("R7_COLLATERAL_CAPACITY")).toBeVisible();
  await expect(page.getByText(/net disbursed/i)).toBeVisible();
});

test("deny path: TickerMind fails concentration with remediation, then human override", async ({
  page,
}) => {
  await page.goto("/financing");
  await page.locator("#fin-agent").selectOption("agt-tickermind");
  await page.locator("#fin-amount").fill("6000");
  await page.getByRole("button", { name: "Submit to risk engine" }).click();

  await expect(page.getByText("Denied", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/82\.0% of revenue/)).toBeVisible();
  await expect(page.getByText(/Diversify: bring the top counterparty below 70%/)).toBeVisible();

  // Human override approves a reduced amount, attributed to the operator.
  await page.locator("#override-amount").fill("4000");
  await page.getByRole("button", { name: "Override & approve" }).click();

  await expect(page.getByText("Override approved", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/Human override by operator:demo/)).toBeVisible();
  await expect(page.getByText("R0_HUMAN_OVERRIDE")).toBeVisible();
});
