import { expect, type Locator } from "@playwright/test";
import { getActiveTimeoutMs, testEnv } from "../support/env";
import { BasePage } from "./BasePage";

export class ProductPage extends BasePage {
  private readonly rentEquipmentHeading = this.page.getByRole("heading", { name: "Rent Equipment" });
  private readonly lightweightScooterLink = this.page.getByRole("link", {
    name: "Lightweight Mobility Scooter rental",
  });
  private readonly lightweightScooterBookNowButton = this.page.locator("#seeprice-btn-63");

  async expectAllProductRentalsPageLoaded(): Promise<void> {
    await this.closeKnownPopups();
    await expect(this.page).toHaveURL(/\/product-rentals\/all/, { timeout: getActiveTimeoutMs() });

    if (testEnv.testEnvironment === "browserstack") {
      const headingText = await this.page
        .locator("h1")
        .first()
        .textContent({ timeout: 30000 })
        .catch(() => "");

      expect(headingText).toMatch(/Rent Equipment/i);
    } else {
      await expect(this.rentEquipmentHeading).toBeVisible({ timeout: getActiveTimeoutMs() });
    }

    await this.expectNoServerError();
  }

  async expectLightweightMobilityScooterIsListed(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      const productLinkCount = await this.page
        .getByRole("link", { name: "Lightweight Mobility Scooter rental" })
        .count()
        .catch(() => 0);

      expect(productLinkCount).toBeGreaterThan(0);
      return;
    }

    await expect(this.lightweightScooterLink).toBeVisible({ timeout: getActiveTimeoutMs() });
  }

  async bookLightweightMobilityScooter(): Promise<void> {
    await this.closeKnownPopups();
    const bookNowButton = this.getLightweightScooterBookNowButton();

    await this.lightweightScooterLink.scrollIntoViewIfNeeded();
    await this.scrollUntilVisible(bookNowButton);

    if (testEnv.testEnvironment === "browserstack") {
      const bookNowButtonCount = await this.page.locator("#seeprice-btn-63").count().catch(() => 0);
      expect(bookNowButtonCount).toBeGreaterThan(0);
    } else {
      await expect(bookNowButton).toBeVisible({ timeout: getActiveTimeoutMs() });
      await expect(bookNowButton).toBeEnabled({ timeout: getActiveTimeoutMs() });
    }

    await bookNowButton.click({ timeout: getActiveTimeoutMs() });

    await this.page
      .waitForLoadState("domcontentloaded", {
        timeout: getActiveTimeoutMs(),
      })
      .catch(() => {
        // BrowserStack/STG can keep background requests active.
      });

    await this.page.waitForURL(/checkout|cart/i, { timeout: getActiveTimeoutMs() });
    await this.closeKnownPopups();
  }

  private getLightweightScooterBookNowButton(): Locator {
    const productCard = this.lightweightScooterLink.locator("xpath=ancestor::*[contains(@class, 'product') or contains(@class, 'card')][1]");
    const fallbackBookNowButton = productCard.getByRole("button", { name: /Book Now|See Price/i }).first();

    return this.lightweightScooterBookNowButton.or(fallbackBookNowButton).first();
  }

  private async scrollUntilVisible(locator: Locator): Promise<void> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
        await locator.scrollIntoViewIfNeeded();
        return;
      }

      await this.page.mouse.wheel(0, 500);
    }

    await expect(locator).toBeVisible();
  }
}
