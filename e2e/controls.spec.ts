import { expect, test } from "@playwright/test";

test("a killed agent cannot be financed, and the kill is audited", async ({ page }) => {
  await page.goto("/controls");

  // Kill the first active agent (Atlas Research, alphabetical seed order).
  const atlasRow = page.locator("li", { hasText: "Atlas Research" });
  await atlasRow.getByRole("button", { name: "Kill" }).click();
  await expect(atlasRow.getByText("killed", { exact: true })).toBeVisible({
    timeout: 10_000,
  });

  // Navigate in-app (full reloads reset the simulated world by design).
  await page.getByRole("link", { name: "Financing" }).click();
  await page.locator("#fin-agent").selectOption("agt-atlas");
  await page.getByRole("button", { name: "Submit to risk engine" }).click();

  await expect(page.getByText("Denied", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/status is "killed"/)).toBeVisible();

  // The audit log carries the kill event and the chain still verifies.
  await page.getByRole("link", { name: "Audit Log" }).click();
  await expect(page.getByText("kill_switch.engaged")).toBeVisible();
  await expect(page.getByText("Chain verified", { exact: true })).toBeVisible();
});

test("global freeze halts financing fleet-wide", async ({ page }) => {
  await page.goto("/controls");
  await page.getByRole("button", { name: "Engage global freeze" }).click();
  await expect(page.getByText("FREEZE ACTIVE — fleet halted")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByRole("link", { name: "Financing" }).click();
  await page.getByRole("button", { name: "Submit to risk engine" }).click();

  await expect(page.getByText("Denied", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/Global freeze is active/)).toBeVisible();
});
