import { expect } from "@playwright/test";
import { testEnv } from "../support/env";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  private readonly pageHeader = this.page.locator("h1").first();
  private readonly browseAllLink = this.page.getByRole("link", { name: "Browse All >>" });

  async open(): Promise<void> {
    const response = await this.page.goto(testEnv.baseUrl, { waitUntil: "domcontentloaded" });
    await this.expectSuccessfulPageLoad(response?.status());
    await this.closeKnownPopups();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cog-stg\.incubatelabs\.com/);
    await expect(this.page).toHaveTitle(/Cloud of Goods|CloudofGoods|Rent/i);
    await this.expectNoServerError();
  }

  async browseAllProducts(): Promise<void> {
    await this.closeKnownPopups();
    await Promise.all([
      this.page.waitForURL(/\/product-rentals\/all/, { timeout: 30000 }),
      this.browseAllLink.click(),
    ]);
  }

  async getHeaderText(): Promise<string | null> {
    return this.pageHeader.textContent();
  }
}
