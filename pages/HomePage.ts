import { expect } from "@playwright/test";
import { testEnv } from "../support/env";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  private readonly pageHeader = this.page.locator("h1").first();

  async open(): Promise<void> {
    await this.page.goto(testEnv.baseUrl, { waitUntil: "domcontentloaded" });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cog-stg\.incubatelabs\.com/);
    await expect(this.page).toHaveTitle(/Cloud of Goods|CloudofGoods|Rent/i);
  }

  async getHeaderText(): Promise<string | null> {
    return this.pageHeader.textContent();
  }
}
