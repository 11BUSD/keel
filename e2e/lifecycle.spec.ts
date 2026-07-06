import { expect, test } from "@playwright/test";

test("draw → repay: an approved advance repays over simulated time and sweeps to T-bills", async ({
  page,
}) => {
  // Approve an advance for SwarmLabel.
  await page.goto("/financing?agent=agt-swarmlabel");
  await page.getByRole("button", { name: "Submit to risk engine" }).click();
  await expect(page.getByText("Approved", { exact: true })).toBeVisible({
    timeout: 15_000,
  });

  // In-app navigation preserves the simulated world (full reload resets it).
  await page.getByRole("link", { name: "Treasury" }).click();
  await expect(page.getByText("Day 0")).toBeVisible();
  const advanceRow = page.locator("li", { hasText: "SwarmLabel" }).first();
  await expect(advanceRow.getByText("active", { exact: true })).toBeVisible();

  // Advance the clock 30 days: repayment progresses and T-bills accumulate.
  await page.getByRole("button", { name: "Advance 30 days" }).click();
  await expect(page.getByText("Day 30")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/repaid \(\d+%\)/)).toBeVisible();
  await expect(page.getByText(/yield accrued/).first()).toBeVisible();

  // The audit log records the time advance with reserve-floor language.
  await page.getByRole("link", { name: "Audit Log" }).click();
  await expect(page.getByText("time.advanced")).toBeVisible();
  await expect(page.getByText("Chain verified", { exact: true })).toBeVisible();
});
