import { expect, test } from "@playwright/test";

test("landing → fleet console shows the seeded fleet with SwarmLabel's red runway", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /bank, risk desk, and safety net/i }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Open the fleet console" }).click();
  await expect(page.getByRole("heading", { name: "Fleet dashboard" })).toBeVisible();

  // All 8 seeded agents render.
  await expect(page.locator("tbody tr")).toHaveCount(8);

  // SwarmLabel is the low-runway demo star: ~12d, styled as danger.
  const swarmRow = page.locator("tbody tr", { hasText: "SwarmLabel" });
  await expect(swarmRow.locator("span.text-danger", { hasText: /^\d+d$/ })).toHaveText(
    "12d",
  );

  // Audit chain badge verifies in the top bar.
  await expect(page.getByText(/audit chain verified/i)).toBeVisible();
});

test("drill-down into an agent shows revenue, mandate, and counterparties", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.locator("tbody tr", { hasText: "SwarmLabel" }).click();

  await expect(page.getByRole("heading", { name: "SwarmLabel" })).toBeVisible();
  await expect(page.getByText("REVENUE (30D, VERIFIED)")).toBeVisible();
  await expect(page.getByText("Mandate", { exact: true })).toBeVisible();
  await expect(page.getByText("Volt Cloud", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Request financing" })).toBeVisible();
});
