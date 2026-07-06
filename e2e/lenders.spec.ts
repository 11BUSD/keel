import { expect, test } from "@playwright/test";

test("both market sides in one walkthrough: fund an advance, earn spread, stay protected", async ({
  page,
}) => {
  // Borrower side: approve an advance.
  await page.goto("/financing?agent=agt-swarmlabel");
  await page.getByRole("button", { name: "Submit to risk engine" }).click();
  await expect(page.getByText("Approved", { exact: true })).toBeVisible({
    timeout: 15_000,
  });

  // Lender side (in-app nav preserves the world): capital is now at work.
  await page.getByRole("link", { name: "Capital Provider" }).click();
  await expect(page.getByText("Capital at work")).toBeVisible();
  await expect(
    page.locator("li", { hasText: "SwarmLabel" }).getByText("$25,000"),
  ).toBeVisible();
  await expect(page.getByText("Fully protected to date")).toBeVisible();

  // The withdrawal guard: capital at work cannot be withdrawn.
  await page.locator("#capital-amount").fill("2000000");
  await page.getByRole("button", { name: "Withdraw" }).click();
  await expect(page.getByText(/cannot be withdrawn/)).toBeVisible({ timeout: 10_000 });

  // Deploying more capital updates the book.
  await page.locator("#capital-amount").fill("500000");
  await page.getByRole("button", { name: "Deploy capital" }).click();
  await expect(page.getByText("$2M", { exact: true })).toBeVisible({ timeout: 10_000 });
});

test("a stress scenario shows the provider protected by the waterfall", async ({
  page,
}) => {
  await page.goto("/scenarios");
  await page.getByRole("button", { name: "Run flash crash" }).click();
  await expect(page.getByText(/Defaulter's margin absorbs/)).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("link", { name: "Capital Provider" }).click();
  await expect(page.getByText("Fully protected to date")).toBeVisible();
  await expect(page.getByText("EXHAUSTED").first()).toBeVisible();
});
