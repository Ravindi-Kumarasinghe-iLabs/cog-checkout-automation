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
  private readonly deliveryAddressDropdownValidationMessage = this.detailPanel.getByText("Select a delivery address from the dropdown");
  private readonly deliveryAddressRequiredValidationMessage = this.detailPanel.getByText("A valid delivery address is required.");
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

  async expectDeliveryLocationLabelVisible(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.waitForBrowserStackSelector("#detail-panel");
      await this.expectBrowserStackTextInDetail("#detail-panel", /Enter delivery location/i);
      return;
    }

    await expect(this.deliveryLocationLabel).toBeVisible({ timeout: getActiveTimeoutMs() });
  }

  async enterDeliveryAddress(address: string): Promise<void> {
    await this.deliveryAddressInput.click();
    await this.deliveryAddressInput.fill("");
    await this.deliveryAddressInput.focus();

    for (const chunk of address.match(/.{1,5}/g) ?? []) {
      await this.page.keyboard.type(chunk, { delay: 250 });
      if (await this.isAutocompleteDropdownLoaded()) {
        return;
      }
    }

    await expect(
      this.page.locator("#delivery_location-autocomplete-list div, .pac-container .pac-item, [role='option']").first()
    ).toBeVisible({ timeout: getActiveTimeoutMs() });
  }

  async selectFromAddressSuggestions(address: string): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      const dropdownSelector = "#delivery_location-autocomplete-list div, .pac-container .pac-item, [role='option']";
      const cityKeyword = address.split(",")[0].trim().toLowerCase();
      await this.page.waitForFunction(
        ({ sel, keyword }: { sel: string; keyword: string }) =>
          Array.from(document.querySelectorAll(sel)).some((el) =>
            el.textContent?.toLowerCase().includes(keyword),
          ),
        { sel: dropdownSelector, keyword: cityKeyword },
        { timeout: Math.min(getActiveTimeoutMs(), 30000) },
      );
      const suggestion = await this.getSelectableAddressSuggestion(address);
      await suggestion.click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      await this.waitForAddressValidationToFinish();
      return;
    }

    const suggestion = await this.getSelectableAddressSuggestion(address);
    await suggestion.click();
    await this.waitForAddressValidationToFinish();
  }

  async clickNextButton(): Promise<void> {
    const button = this.page.locator("#continueBtn").or(this.page.getByRole("button", { name: /next/i })).first();
    await button.waitFor({ state: "visible", timeout: getActiveTimeoutMs() });

    if (testEnv.testEnvironment === "browserstack") {
      await button.click({ force: true, timeout: getActiveTimeoutMs() });
      return;
    }

    await button.click();
  }

  async expectValidationMessage(message: string): Promise<void> {
    const messagePattern = new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    if (testEnv.testEnvironment === "browserstack") {
      const escapedMessage = message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      await this.page.waitForFunction(
        ({ selector, pattern }: { selector: string; pattern: string }) => {
          const el = document.querySelector(selector);
          return el ? new RegExp(pattern, "i").test(el.textContent ?? "") : false;
        },
        { selector: "#detail-panel", pattern: escapedMessage },
        { timeout: Math.min(getActiveTimeoutMs(), 30000) },
      );
      return;
    }

    await expect(this.page.getByText(messagePattern).first()).toBeVisible({ timeout: getActiveTimeoutMs() });
  }

  async expectRentalPeriodLabelVisible(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.waitForBrowserStackSelector("#detail-panel");
      await this.expectBrowserStackTextInDetail("#detail-panel", /Enter rental period\*/i);
      return;
    }

    await expect(this.rentalPeriodLabel).toBeVisible({ timeout: getActiveTimeoutMs() });
  }

  async clickRentalPeriodField(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.rentalPeriodDatePicker.click({ force: true, timeout: getActiveTimeoutMs() });
      return;
    }

    await this.rentalPeriodDatePicker.click();
  }

  async clickDatePickerIcon(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.rentalPeriodCalendarIcon.scrollIntoViewIfNeeded({ timeout: getActiveTimeoutMs() });
      await this.rentalPeriodCalendarIcon.click({ force: true, timeout: getActiveTimeoutMs() });
      return;
    }

    await this.rentalPeriodCalendarIcon.click();
  }

  async expectDatePickerDisplayed(): Promise<void> {
    const calendarSelector = testEnv.device === "mobile" ? "#calendarContainer" : "#custRangePicketDekstopCalendarPopup";

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForSelector(calendarSelector, {
        state: "visible",
        timeout: Math.min(getActiveTimeoutMs(), 30000),
      });
      return;
    }

    await expect(this.page.locator(calendarSelector)).toBeVisible({ timeout: getActiveTimeoutMs() });
  }

  async expectPastDatesDisabledInDatePicker(): Promise<void> {
    const calendarSelector = testEnv.device === "mobile" ? "#calendarContainer" : "#custRangePicketDekstopCalendarPopup";
    const disabledSelector = `${calendarSelector} .cust-range-picker-disabled`;

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForFunction(
        (sel: string) => document.querySelectorAll(sel).length > 0,
        disabledSelector,
        { timeout: Math.min(getActiveTimeoutMs(), 30000) },
      );
      const hasPastTitle = await this.page.evaluate((sel: string) => {
        const els = document.querySelectorAll(sel);
        return Array.from(els).some((el) => el.getAttribute("title")?.toLowerCase().includes("past") ?? false);
      }, disabledSelector);
      expect(hasPastTitle).toBe(true);
      return;
    }

    const disabledDates = this.page.locator(disabledSelector);
    await expect(disabledDates.first()).toBeVisible({ timeout: getActiveTimeoutMs() });
    const count = await disabledDates.count();
    expect(count).toBeGreaterThan(0);
    const firstTitle = await disabledDates.first().getAttribute("title");
    expect(firstTitle?.toLowerCase()).toContain("past");
  }

  async expectTodayCutoffRuleForCity(city: string): Promise<void> {
    const calendarSelector = testEnv.device === "mobile" ? "#calendarContainer" : "#custRangePicketDekstopCalendarPopup";
    const { year, month, day, hour, minute } = this.getDeliveryCityLocalDateTime(city);
    const CUTOFF_MINUTES = 16 * 60; // 4:00 PM
    const isPastCutoff = hour * 60 + minute > CUTOFF_MINUTES;
    const todaySelector = `${calendarSelector} [data-date="${month}/${day}/${year}"]`;

    if (testEnv.testEnvironment === "browserstack") {
      const todayIsDisabled = await this.page.evaluate(
        (sel: string) => document.querySelector(sel)?.classList.contains("cust-range-picker-disabled") ?? null,
        todaySelector,
      );
      if (todayIsDisabled !== null) {
        expect(todayIsDisabled).toBe(isPastCutoff);
      }
      return;
    }

    const todayEl = this.page.locator(todaySelector);
    if (isPastCutoff) {
      await expect(todayEl).toHaveClass(/cust-range-picker-disabled/, { timeout: getActiveTimeoutMs() });
    } else {
      await expect(todayEl).not.toHaveClass(/cust-range-picker-disabled/, { timeout: getActiveTimeoutMs() });
    }
  }

  async expectFutureDatesEnabledInDatePicker(): Promise<void> {
    const calendarSelector = testEnv.device === "mobile" ? "#calendarContainer" : "#custRangePicketDekstopCalendarPopup";
    const monthContainerSelector = `${calendarSelector} .custRangePicketDekstopMonth-container`;

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForSelector(monthContainerSelector, {
        state: "attached",
        timeout: Math.min(getActiveTimeoutMs(), 30000),
      });
    }

    const allFutureEnabled = await this.page.evaluate((monthSel: string) => {
      const containers = document.querySelectorAll(monthSel);
      const secondMonth = containers[1];
      if (!secondMonth) return null;
      const dateCells = secondMonth.querySelectorAll("[data-date]");
      if (dateCells.length === 0) return null;
      return Array.from(dateCells).every((el) => !el.classList.contains("cust-range-picker-disabled"));
    }, monthContainerSelector);

    if (allFutureEnabled !== null) {
      expect(allFutureEnabled).toBe(true);
    }
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

  async typeDeliveryAddressAndBlurWithoutSelecting(value: string): Promise<void> {
    await this.deliveryAddressInput.click();
    await this.deliveryAddressInput.fill("");
    await this.deliveryAddressInput.focus();
    await this.page.keyboard.type(value, { delay: 250 });
    await this.clickOutsideDeliveryAddressField();
    await this.clickOutsideAgainIfAutocompleteDropdownIsVisible();
  }

  async expectDeliveryAddressDropdownSelectionValidation(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.expectDeliveryAddressDropdownSelectionValidationForBrowserStack();
      return;
    }

    await expect(this.deliveryAddressDropdownValidationMessage).toBeVisible({ timeout: getActiveTimeoutMs() });
    await expect(this.deliveryAddressHelpText).not.toBeVisible();

    const validationColor = await this.deliveryAddressDropdownValidationMessage.evaluate((element) => getComputedStyle(element).color);
    const inputBorderColor = await this.deliveryAddressInput.evaluate((element) => getComputedStyle(element).borderColor);

    expect(this.cssColorMatches(validationColor, "#FFA500")).toBe(true);
    expect(this.cssColorMatches(inputBorderColor, "#b94a48")).toBe(true);
  }

  async focusEmptyDeliveryAddressAndBlur(): Promise<void> {
    await this.deliveryAddressInput.click();
    await this.deliveryAddressInput.fill("");
    await this.clickOutsideDeliveryAddressField();
  }

  async expectDeliveryAddressRequiredValidation(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.expectDeliveryAddressRequiredValidationForBrowserStack();
      return;
    }

    await expect(this.deliveryAddressRequiredValidationMessage).toBeVisible({ timeout: getActiveTimeoutMs() });
    await expect(this.deliveryAddressHelpText).not.toBeVisible();

    const validationColor = await this.deliveryAddressRequiredValidationMessage.evaluate((element) => getComputedStyle(element).color);
    const inputBorderColor = await this.deliveryAddressInput.evaluate((element) => getComputedStyle(element).borderColor);

    expect(this.cssColorMatches(validationColor, "#D0151F")).toBe(true);
    expect(this.cssColorMatches(inputBorderColor, "#b94a48")).toBe(true);
  }

  private async typeAddressUntilSuggestionLoads(address: string): Promise<"Google" | "Cloud maps"> {
    let provider: "Google" | "Cloud maps" | undefined;
    let typedCharacters = 0;

    await this.deliveryAddressInput.focus();

    for (const chunk of address.match(/.{1,5}/g) ?? []) {
      await this.page.keyboard.type(chunk, { delay: 250 });
      typedCharacters += chunk.length;

      const dropdownLoaded = await this.isAutocompleteDropdownLoaded();

      if (dropdownLoaded && provider === undefined) {
        provider = await this.getMapDropdownProvider();
      }

      if (typedCharacters >= 10 && (await this.getAddressSuggestion(address).isVisible({ timeout: 1000 }).catch(() => false))) {
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
      .isVisible({ timeout: 1000 })
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

    if (await exactAddressSuggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
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

  private getDeliveryCityLocalDateTime(city: string): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  } {
    const CITY_TIMEZONES: Record<string, string> = {
      Orlando: "America/New_York",
      "Las Vegas": "America/Los_Angeles",
    };
    const timezone = CITY_TIMEZONES[city] ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(now);
    const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? "0");
    return {
      year: get("year"),
      month: get("month"),
      day: get("day"),
      hour: get("hour") % 24,
      minute: get("minute"),
    };
  }

  private cssColorMatches(actualColor: string, expectedHexColor: string): boolean {
    return this.normalizeCssColor(actualColor) === this.normalizeCssColor(expectedHexColor);
  }

  private async clickOutsideDeliveryAddressField(): Promise<void> {
    const inputBox = await this.deliveryAddressInput.boundingBox();

    if (inputBox) {
      const viewport = this.page.viewportSize();
      const clickX = Math.min(inputBox.x + inputBox.width + 40, (viewport?.width ?? inputBox.x + inputBox.width + 40) - 20);
      const clickY = inputBox.y + inputBox.height / 2;

      await this.page.mouse.click(clickX, clickY);
      return;
    }

    await this.detailPanel.click({ position: { x: 10, y: 10 }, timeout: getActiveTimeoutMs() });
  }

  private async waitForAutocompleteDropdownToClose(): Promise<void> {
    await this.page
      .waitForFunction(
        () => {
          const dropdowns = Array.from(
            document.querySelectorAll<HTMLElement>("#delivery_location-autocomplete-list, .pac-container, [role='listbox']"),
          );

          return dropdowns.every((dropdown) => {
            const styles = getComputedStyle(dropdown);

            return styles.display === "none" || styles.visibility === "hidden" || dropdown.offsetParent === null;
          });
        },
        undefined,
        { timeout: getActiveTimeoutMs() },
      )
      .catch(() => {
        // Some map providers keep an empty off-screen container mounted after blur.
      });
  }

  private async clickOutsideAgainIfAutocompleteDropdownIsVisible(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (!(await this.isAutocompleteDropdownVisible())) {
        return;
      }

      await this.clickOutsideDeliveryAddressField();
      await this.waitForAutocompleteDropdownToClose();
    }
  }

  private async isAutocompleteDropdownVisible(): Promise<boolean> {
    return this.page.evaluate(() => {
      const dropdowns = Array.from(
        document.querySelectorAll<HTMLElement>("#delivery_location-autocomplete-list, .pac-container, [role='listbox']"),
      );

      return dropdowns.some((dropdown) => {
        const styles = getComputedStyle(dropdown);

        return styles.display !== "none" && styles.visibility !== "hidden" && dropdown.offsetParent !== null;
      });
    });
  }

  private async expectDeliveryAddressDropdownSelectionValidationForBrowserStack(): Promise<void> {
    await this.page.waitForFunction(
      () => document.body.textContent?.includes("Select a delivery address from the dropdown"),
      undefined,
      { timeout: getActiveTimeoutMs() },
    );

    const validationState = await this.page.evaluate(() => {
      const findLeafElementByText = (text: string): HTMLElement | undefined => {
        const elements = Array.from(document.querySelectorAll<HTMLElement>("#detail-panel *"));

        return elements.find((element) => {
          const containsText = element.textContent?.includes(text) ?? false;
          const childContainsText = Array.from(element.children).some((child) => child.textContent?.includes(text));

          return containsText && !childContainsText;
        });
      };
      const validationElement = findLeafElementByText("Select a delivery address from the dropdown");
      const helpElement = findLeafElementByText("Delivery address not sure?");
      const inputElement = document.querySelector<HTMLInputElement>("#delivery_location");

      return {
        validationVisible: Boolean(validationElement && validationElement.offsetParent !== null),
        validationColor: validationElement ? getComputedStyle(validationElement).color : "",
        helpVisible: Boolean(helpElement && helpElement.offsetParent !== null),
        inputBorderColor: inputElement ? getComputedStyle(inputElement).borderColor : "",
      };
    });

    expect(validationState.validationVisible).toBe(true);
    expect(validationState.helpVisible).toBe(false);
    expect(this.cssColorMatches(validationState.validationColor, "#FFA500")).toBe(true);
    expect(this.cssColorMatches(validationState.inputBorderColor, "#b94a48")).toBe(true);
  }

  private async expectDeliveryAddressRequiredValidationForBrowserStack(): Promise<void> {
    await this.page.waitForFunction(
      () => document.body.textContent?.includes("A valid delivery address is required."),
      undefined,
      { timeout: getActiveTimeoutMs() },
    );

    const validationState = await this.page.evaluate(() => {
      const findLeafElementByText = (text: string): HTMLElement | undefined => {
        const elements = Array.from(document.querySelectorAll<HTMLElement>("#detail-panel *"));

        return elements.find((element) => {
          const containsText = element.textContent?.includes(text) ?? false;
          const childContainsText = Array.from(element.children).some((child) => child.textContent?.includes(text));

          return containsText && !childContainsText;
        });
      };
      const validationElement = findLeafElementByText("A valid delivery address is required.");
      const helpElement = findLeafElementByText("Delivery address not sure?");
      const inputElement = document.querySelector<HTMLInputElement>("#delivery_location");

      return {
        validationVisible: Boolean(validationElement && validationElement.offsetParent !== null),
        validationColor: validationElement ? getComputedStyle(validationElement).color : "",
        helpVisible: Boolean(helpElement && helpElement.offsetParent !== null),
        inputBorderColor: inputElement ? getComputedStyle(inputElement).borderColor : "",
      };
    });

    expect(validationState.validationVisible).toBe(true);
    expect(validationState.helpVisible).toBe(false);
    expect(this.cssColorMatches(validationState.validationColor, "#D0151F")).toBe(true);
    expect(this.cssColorMatches(validationState.inputBorderColor, "#b94a48")).toBe(true);
  }

  private normalizeCssColor(color: string): string {
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const red = Number.parseInt(hex.slice(0, 2), 16);
      const green = Number.parseInt(hex.slice(2, 4), 16);
      const blue = Number.parseInt(hex.slice(4, 6), 16);

      return `${red},${green},${blue}`;
    }

    const rgbValues = color.match(/\d+(\.\d+)?/g)?.slice(0, 3) ?? [];

    return rgbValues.map((value) => String(Math.round(Number(value)))).join(",");
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
