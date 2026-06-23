import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProductPage extends BasePage {
  private readonly rentEquipmentHeading = this.page.getByRole("heading", { name: "Rent Equipment" });
  private readonly lightweightScooterLink = this.page.getByRole("link", {
    name: "Lightweight Mobility Scooter rental",
  });
  private readonly lightweightScooterBookNowButton = this.page.locator("#seeprice-btn-63");

  async expectAllProductRentalsPageLoaded(): Promise<void> {
    await this.closeKnownPopups();
    await expect(this.page).toHaveURL(/\/product-rentals\/all/);
    await expect(this.rentEquipmentHeading).toBeVisible();
    await this.expectNoServerError();
  }

  async expectLightweightMobilityScooterIsListed(): Promise<void> {
    await expect(this.lightweightScooterLink).toBeVisible();
  }

  async bookLightweightMobilityScooter(): Promise<void> {
    await this.closeKnownPopups();
    await this.lightweightScooterLink.scrollIntoViewIfNeeded();
    await this.getLightweightScooterBookNowButton().scrollIntoViewIfNeeded();

    await Promise.all([
      this.page.waitForURL(/\/checkout|\/cart|checkout/i, { timeout: 30000 }),
      this.getLightweightScooterBookNowButton().click(),
    ]);
  }

  private getLightweightScooterBookNowButton(): Locator {
    const productCard = this.lightweightScooterLink.locator("xpath=ancestor::*[contains(@class, 'product') or contains(@class, 'card')][1]");
    const fallbackBookNowButton = productCard.getByRole("button", { name: /Book Now|See Price/i }).first();

    return this.lightweightScooterBookNowButton.or(fallbackBookNowButton).first();
  }
}
