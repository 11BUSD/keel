import { expect, test } from "@playwright/test";

test("cohort cascade: throttled unwind walks the loss down the waterfall", async ({
  page,
}) => {
  await page.goto("/scenarios");
  await page.getByRole("button", { name: "Run correlated-cohort cascade" }).click();

  await expect(page.getByText("slow, careful unwind")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/rate-limited, not a simultaneous dump/)).toBeVisible();
  await expect(
    page.getByText(/SwarmLabel: tranche 1\/2 unwound at the rate limit/),
  ).toBeVisible();
  await expect(page.getByText(/Defaulter's margin absorbs/)).toBeVisible();
  await expect(page.getByText("EXHAUSTED").first()).toBeVisible();
});

test("oracle failure HALTS the fleet; reset restores it", async ({ page }) => {
  await page.goto("/scenarios");
  await page.getByRole("button", { name: "Run oracle failure" }).click();

  await expect(page.getByText("FROZE EVERYTHING — safe by default")).toBeVisible({
    timeout: 15_000,
  });
  // The halt is fleet-wide: the topbar shows the global freeze.
  await expect(page.getByText("Global freeze active")).toBeVisible();

  await page.getByRole("button", { name: "Reset scenario state" }).click();
  await expect(page.getByText("Global freeze active")).toBeHidden({ timeout: 15_000 });
  await expect(page.getByText("No disaster triggered yet")).toBeVisible();
});
