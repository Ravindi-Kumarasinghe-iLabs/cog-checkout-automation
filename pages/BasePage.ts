import { expect, type Locator, type Page } from "@playwright/test";

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = "/"): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async expectPageUrlContains(expectedText: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expectedText));
  }

  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async fillStable(locator: Locator, value: string): Promise<void> {
    await locator.fill("");
    await locator.fill(value);
    await expect(locator).toHaveValue(value);
  }
}
