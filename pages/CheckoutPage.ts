import { BasePage } from "./BasePage";
import { expect, type Locator } from "@playwright/test";
import { getActiveTimeoutMs, testEnv } from "../support/env";

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
    await this.page.waitForURL(/checkout|cart/i, { timeout: getActiveTimeoutMs() });
    await this.expectNoServerError();
  }

  async expectLightweightMobilityScooterInCart(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.expectBrowserStackTextInDetail("#cart-panel", /Lightweight Mobility Scooter/i);
      return;
    }

    await expect(this.cartPanel).toBeVisible();
    await expect(this.lightweightScooterCartLink).toBeVisible();
    await expect(this.lightweightScooterImageLink).toBeVisible();
  }

  async expectDeliveryAddressSectionDisplayed(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.waitForBrowserStackSelector("#detail-panel");
      await this.expectBrowserStackTextInDetail("#detail-panel", /Enter delivery location/i);
      await this.expectBrowserStackTextInDetail("#detail-panel", /Delivery address not sure\?/i);
      await this.waitForBrowserStackSelector("#delivery_location");
      return;
    }

    await expect(this.detailPanel).toBeVisible();
    await expect(this.deliveryLocationLabel).toBeVisible();
    await expect(this.deliveryAddressInput).toBeVisible();
    await expect(this.deliveryAddressHelpText).toBeVisible();
  }

  async enterAndSelectDeliveryAddress(address: string): Promise<"Google" | "Cloud maps"> {
    await this.deliveryAddressInput.click();
    await this.deliveryAddressInput.fill("");

    const provider = await this.typeAddressUntilSuggestionLoads(address);
    const addressSuggestion = await this.getSelectableAddressSuggestion(address);

    await addressSuggestion.click();
    await this.waitForAddressValidationToFinish();

    return provider;
  }

  async expectDeliveryAddressSelected(address: string): Promise<void> {
    const exactAddressPattern = new RegExp(address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    if (testEnv.testEnvironment === "browserstack") {
      const selectedAddress = await this.deliveryAddressInput.inputValue({ timeout: getActiveTimeoutMs() });
      const hasErrorClass = await this.deliveryAddressInput.evaluate((element) => element.classList.contains("has-error"));

      expect(this.selectedAddressMatchesExpected(selectedAddress, address, exactAddressPattern)).toBe(true);
      expect(hasErrorClass).toBe(false);
      await this.expectNoDeliveryAddressValidationErrors();
      return;
    }

    const selectedAddress = await this.deliveryAddressInput.inputValue({ timeout: getActiveTimeoutMs() });
    expect(this.selectedAddressMatchesExpected(selectedAddress, address, exactAddressPattern)).toBe(true);
    await expect(this.deliveryAddressInput).not.toHaveClass(/has-error/);
    await this.expectNoDeliveryAddressValidationErrors();
  }

  async expectRentalPeriodDatePickerDisplayed(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.expectBrowserStackTextInDetail("#detail-panel", /Enter rental period\*/i);
      await this.waitForBrowserStackSelector("#dp-dsk-start-end");
      await this.waitForBrowserStackSelector(".input-group-addon");
      return;
    }

    await expect(this.rentalPeriodLabel).toBeVisible();
    await expect(this.rentalPeriodDatePicker).toBeVisible();
    await expect(this.rentalPeriodCalendarIcon).toBeVisible();
  }

  private async typeAddressUntilSuggestionLoads(address: string): Promise<"Google" | "Cloud maps"> {
    let provider: "Google" | "Cloud maps" | undefined;
    let typedCharacters = 0;

    await this.deliveryAddressInput.focus();

    for (const chunk of address.match(/.{1,5}/g) ?? []) {
      await this.page.keyboard.type(chunk, { delay: 150 });
      typedCharacters += chunk.length;

      const dropdownLoaded = await this.isAutocompleteDropdownLoaded();

      if (dropdownLoaded && provider === undefined) {
        provider = await this.getMapDropdownProvider();
      }

      if (typedCharacters >= 10 && (await this.getAddressSuggestion(address).isVisible({ timeout: 500 }).catch(() => false))) {
        return provider ?? this.getMapDropdownProvider();
      }
    }

    if (testEnv.device === "mobile") {
      await expect(this.getTopAddressSuggestion()).toBeVisible({ timeout: getActiveTimeoutMs() });
    } else {
      await expect(this.getAddressSuggestion(address)).toBeVisible({ timeout: getActiveTimeoutMs() });
    }

    return provider ?? this.getMapDropdownProvider();
  }

  private async isAutocompleteDropdownLoaded(): Promise<boolean> {
    return this.page
      .locator("#delivery_location-autocomplete-list div, .pac-container .pac-item, [role='option']")
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false);
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

  private getTopAddressSuggestion(): Locator {
    return this.page.locator("#delivery_location-autocomplete-list div, .pac-container .pac-item, [role='option']").first();
  }

  private async getSelectableAddressSuggestion(address: string): Promise<Locator> {
    const exactAddressSuggestion = this.getAddressSuggestion(address);

    if (await exactAddressSuggestion.isVisible({ timeout: 1000 }).catch(() => false)) {
      return exactAddressSuggestion;
    }

    if (testEnv.device === "mobile") {
      const topAddressSuggestion = this.getTopAddressSuggestion();
      await expect(topAddressSuggestion).toBeVisible({ timeout: getActiveTimeoutMs() });
      return topAddressSuggestion;
    }

    await expect(exactAddressSuggestion).toBeVisible({ timeout: getActiveTimeoutMs() });
    return exactAddressSuggestion;
  }

  private selectedAddressMatchesExpected(selectedAddress: string, expectedAddress: string, exactAddressPattern: RegExp): boolean {
    if (exactAddressPattern.test(selectedAddress)) {
      return true;
    }

    if (testEnv.device !== "mobile") {
      return false;
    }

    const expectedAddressParts = expectedAddress
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const importantAddressParts = [expectedAddressParts[0], expectedAddressParts[1], ...expectedAddressParts.slice(-3)].filter(Boolean);

    return importantAddressParts.every((part) => selectedAddress.toLowerCase().includes(part.toLowerCase()));
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

    if (await validationLoader.isVisible({ timeout: Math.min(getActiveTimeoutMs(), 10000) }).catch(() => false)) {
      await expect(validationLoader).toBeHidden({ timeout: getActiveTimeoutMs() });
    }
  }

  private async expectNoDeliveryAddressValidationErrors(): Promise<void> {
    const validationErrors = this.detailPanel.locator(".invalid-feedback:visible, .error:visible, .text-danger:visible, [role='alert']:visible");

    if (testEnv.testEnvironment === "browserstack") {
      const validationErrorCount = await validationErrors.count().catch(() => 0);

      expect(validationErrorCount).toBe(0);
      return;
    }

    await expect(validationErrors).toHaveCount(0);
  }

  private async waitForBrowserStackSelector(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: "attached",
      timeout: getActiveTimeoutMs(),
    });
  }

  private async expectBrowserStackTextInDetail(selector: string, expectedText: RegExp): Promise<void> {
    await this.waitForBrowserStackSelector(selector);

    const text = await this.page
      .locator(selector)
      .first()
      .innerText({ timeout: Math.min(getActiveTimeoutMs(), 30000) })
      .catch(() => "");

    expect(text).toMatch(expectedText);
  }
}
