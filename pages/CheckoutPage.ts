import { BasePage } from "./BasePage";
import { expect, type Locator } from "@playwright/test";

export class CheckoutPage extends BasePage {
  private readonly detailPanel = this.page.locator("#detail-panel");
  private readonly cartPanel = this.page.locator("#cart-panel");
  private readonly lightweightScooterCartLink = this.cartPanel.locator("a").filter({
    hasText: "Lightweight Mobility Scooter",
  });
  private readonly lightweightScooterImageLink = this.cartPanel.getByRole("link", {
    name: "Lightweight Mobility Scooter",
  }).first();
  private readonly deliveryLocationLabel = this.detailPanel
    .locator("label:visible, span:visible, div:visible")
    .filter({ hasText: "Enter delivery location" })
    .first();
  private readonly deliveryAddressHelpText = this.detailPanel.getByText("Delivery address not sure?");
  private readonly deliveryAddressInput = this.detailPanel.getByRole("textbox", {
    name: "Address or name of the place",
    exact: true,
  });
  private readonly rentalPeriodLabel = this.detailPanel.getByText("Enter rental period*");
  private readonly rentalPeriodDatePicker = this.detailPanel.getByRole("textbox", {
    name: "Pick your start & end dates",
  });
  private readonly rentalPeriodCalendarIcon = this.detailPanel.locator(".input-group-addon");

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

  async expectDeliveryAddressSectionDisplayed(): Promise<void> {
    await expect(this.detailPanel).toBeVisible();
    await expect(this.deliveryLocationLabel).toBeVisible();
    await expect(this.deliveryAddressInput).toBeVisible();
    await expect(this.deliveryAddressHelpText).toBeVisible();
  }

  async enterAndSelectDeliveryAddress(address: string): Promise<"Google" | "Cloud maps"> {
    await this.deliveryAddressInput.click();
    await this.deliveryAddressInput.fill("");

    const provider = await this.typeAddressUntilSuggestionLoads(address);
    const addressSuggestion = this.getAddressSuggestion(address);

    await expect(addressSuggestion).toBeVisible({ timeout: 15000 });
    await addressSuggestion.click();
    await this.waitForAddressValidationToFinish();

    return provider;
  }

  async expectDeliveryAddressSelected(address: string): Promise<void> {
    await expect(this.deliveryAddressInput).toHaveValue(new RegExp(address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    await expect(this.deliveryAddressInput).not.toHaveClass(/has-error/);
    await this.expectNoDeliveryAddressValidationErrors();
  }

  async expectRentalPeriodDatePickerDisplayed(): Promise<void> {
    await expect(this.rentalPeriodLabel).toBeVisible();
    await expect(this.rentalPeriodDatePicker).toBeVisible();
    await expect(this.rentalPeriodCalendarIcon).toBeVisible();
  }

  private async typeAddressUntilSuggestionLoads(address: string): Promise<"Google" | "Cloud maps"> {
    for (const character of address) {
      await this.deliveryAddressInput.pressSequentially(character, { delay: 75 });

      if (await this.getAddressSuggestion(address).isVisible({ timeout: 300 }).catch(() => false)) {
        return this.getMapDropdownProvider();
      }
    }

    await expect(this.getAddressSuggestion(address)).toBeVisible({ timeout: 15000 });

    return this.getMapDropdownProvider();
  }

  private getAddressSuggestion(address: string): Locator {
    return this.page
      .locator("#delivery_location-autocomplete-list div")
      .filter({ hasText: address })
      .first()
      .or(this.page.locator(".pac-container .pac-item").filter({ hasText: address }).first())
      .or(this.page.getByRole("option", { name: new RegExp(address, "i") }).first())
      .or(this.page.locator("[id*='autocomplete'], [class*='autocomplete']").getByText(address, { exact: true }).first());
  }

  private async getMapDropdownProvider(): Promise<"Google" | "Cloud maps"> {
    const googlePowered = this.page
      .locator(".pac-container, [role='listbox']")
      .filter({ hasText: /powered by google/i })
      .first();

    if (await googlePowered.isVisible({ timeout: 1000 }).catch(() => false)) {
      return "Google";
    }

    return "Cloud maps";
  }

  private async waitForAddressValidationToFinish(): Promise<void> {
    const validationLoader = this.detailPanel
      .locator(".spinner, .loader, [class*='spinner'], [class*='loading'], [class*='loader']")
      .first();

    if (await validationLoader.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(validationLoader).toBeHidden({ timeout: 20000 });
    }
  }

  private async expectNoDeliveryAddressValidationErrors(): Promise<void> {
    const validationErrors = this.detailPanel.locator(".invalid-feedback:visible, .error:visible, .text-danger:visible, [role='alert']:visible");

    await expect(validationErrors).toHaveCount(0);
  }
}
