import { expect, test } from "@playwright/test";
import { TOUR_STEPS } from "../src/content/tour";

test("the guided tour walks all nine beats and never traps the visitor", async ({
  page,
}) => {
  // The landing CTA starts the tour on the dashboard.
  await page.goto("/");
  await page.getByRole("link", { name: "Take the 2-minute tour" }).click();

  const dialog = page.getByRole("dialog");
  for (let i = 0; i < TOUR_STEPS.length; i++) {
    await expect(dialog.getByText(`${i + 1}/${TOUR_STEPS.length}`)).toBeVisible({
      timeout: 15_000,
    });
    await expect(dialog.getByText(TOUR_STEPS[i].title)).toBeVisible();
    // The tour navigates to the real view for each beat.
    await expect(page).toHaveURL(new RegExp(TOUR_STEPS[i].route.split("?")[0]));
    await dialog
      .getByRole("button", { name: i === TOUR_STEPS.length - 1 ? "Finish" : "Next" })
      .click();
  }
  // Finishing dismisses the overlay; free exploration continues.
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
});

test("the tour is skippable at any step", async ({ page }) => {
  await page.goto("/dashboard?tour=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Meet the fleet")).toBeVisible({ timeout: 15_000 });

  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByText("The problem")).toBeVisible();

  await page.getByRole("button", { name: "Skip the tour" }).click();
  await expect(dialog).toBeHidden();
  // The underlying view is fully usable afterward.
  await expect(page.getByRole("heading", { name: "SwarmLabel" })).toBeVisible();
});
