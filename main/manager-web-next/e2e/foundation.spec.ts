import { expect, test } from "@playwright/test";

test("renders the foundation page through a deep link", async ({ page }) => {
  await page.goto("/foundation/deep-link");

  await expect(page).toHaveTitle("小智管理控制台");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "现代、可靠、可渐进迁移的小智控制台",
  );
  await expect(page.getByText("127")).toBeVisible();
});

test("switches and persists every supported language", async ({ page }) => {
  await page.goto("/");

  const languageSelect = page.getByRole("combobox", { name: "界面语言" });
  await expect(languageSelect.locator("option")).toHaveCount(6);

  await languageSelect.selectOption("en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A modern, reliable Xiaozhi console built for incremental migration",
  );

  await page.reload();
  await expect(page.getByRole("combobox", { name: "Interface language" })).toHaveValue(
    "en",
  );
});
