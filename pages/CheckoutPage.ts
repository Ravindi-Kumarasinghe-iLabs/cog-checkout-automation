import { BasePage } from "./BasePage";
import { expect } from "@playwright/test";

export class CheckoutPage extends BasePage {
  private readonly cartPanel = this.page.locator("#cart-panel");
  private readonly lightweightScooterCartLink = this.cartPanel.locator("a").filter({
    hasText: "Lightweight Mobility Scooter",
  });
  private readonly lightweightScooterImageLink = this.cartPanel.getByRole("link", {
    name: "Lightweight Mobility Scooter",
  }).first();

  async expectLoaded(): Promise<void> {
    await this.closeKnownPopups();
    await expect(this.page).toHaveURL(/checkout|cart/i);
    await this.expectNoServerError();
  }

  async expectLightweightMobilityScooterInCart(): Promise<void> {
    await expect(this.cartPanel).toBeVisible();
    await expect(this.lightweightScooterCartLink).toBeVisible();
    await expect(this.lightweightScooterImageLink).toBeVisible();
  }
}
