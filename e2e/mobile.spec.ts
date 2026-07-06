import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test("phone width: landing, dashboard, and financing stay usable", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /bank, risk desk, and safety net/i }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Open the fleet console" }).click();
  await expect(page.getByRole("heading", { name: "Fleet dashboard" })).toBeVisible();
  // The mobile nav strip replaces the sidebar at this width.
  const mobileNav = page.locator("nav[aria-label='Primary']");
  await expect(mobileNav.getByRole("link", { name: "Financing" })).toBeVisible();

  await mobileNav.getByRole("link", { name: "Financing" }).click();
  await page.getByRole("button", { name: "Submit to risk engine" }).click();
  await expect(page.getByText("Approved", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  // No horizontal page overflow at phone width.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
