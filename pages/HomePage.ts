import { expect } from "@playwright/test";
import { getActiveTimeoutMs, testEnv } from "../support/env";
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

    if (testEnv.testEnvironment === "browserstack") {
      const response = await this.page.goto(`${testEnv.baseUrl}/product-rentals/all`, { waitUntil: "domcontentloaded" });
      await this.expectSuccessfulPageLoad(response?.status());
      return;
    }

    await Promise.all([
      this.page.waitForURL(/\/product-rentals\/all/, {
        timeout: getActiveTimeoutMs(),
        waitUntil: "domcontentloaded",
      }),
      this.browseAllLink.click(),
    ]);
  }

  async expectCartHasAbandonedItem(): Promise<void> {
    const cartCount = this.page.locator("#headerCartItemCount");

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForFunction(
        () => {
          const el = document.querySelector("#headerCartItemCount");
          return el !== null && parseInt(el.textContent ?? "0") > 0;
        },
        undefined,
        { timeout: Math.min(getActiveTimeoutMs(), 30000) },
      );
      return;
    }

    await expect(cartCount).toBeVisible({ timeout: getActiveTimeoutMs() });
    const countText = await cartCount.textContent();
    expect(parseInt(countText ?? "0")).toBeGreaterThan(0);
  }

  async getHeaderText(): Promise<string | null> {
    return this.pageHeader.textContent();
  }
}
