import { expect, test } from "@playwright/test";

test("a cold visitor gets the 30-second explainer and a path into the tour", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "New here? The whole idea in 30 seconds" }),
  ).toBeVisible();
  await expect(page.getByText("AI agents are becoming businesses.")).toBeVisible();
  await expect(page.getByText("Every business eventually needs a bank.")).toBeVisible();
  await expect(page.getByText("Keel is that someone.")).toBeVisible();
  // The simulated-data honesty line is part of the first thing outsiders read.
  await expect(page.getByText(/Everything on this site is a simulation/)).toBeVisible();

  // The explainer leads straight into the guided tour.
  await page.getByRole("link", { name: "See it for yourself — take the tour" }).click();
  await expect(page.getByRole("dialog").getByText("Meet the fleet")).toBeVisible({
    timeout: 15_000,
  });
});
