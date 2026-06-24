import { BasePage } from "./BasePage";
import { expect, type Locator } from "@playwright/test";
import { getActiveTimeoutMs, testEnv } from "../support/env";

const ADDRESS_TYPING_DELAY_MS = 400;

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
  private readonly useSameAddressCheckbox = this.detailPanel.getByLabel("Use same address for both");
  private readonly useSameAddressLabel = this.detailPanel.getByText("Use same address for both");
  private readonly pickupAddressInput = this.detailPanel.getByPlaceholder("Pickup address or name of the");
  private readonly rentalPeriodLabel = this.detailPanel.getByText("Enter rental period*");
  private readonly rentalPeriodDatePicker = this.detailPanel.getByRole("textbox", {
    name: "Pick your start & end dates",
  });
  private readonly rentalPeriodCalendarIcon = this.detailPanel.locator(".input-group-addon");

  async clickLogo(): Promise<void> {
    const logo = this.page.locator("#cogLogo-blue");
    if (testEnv.testEnvironment === "browserstack") {
      await logo.waitFor({ state: "visible", timeout: Math.min(getActiveTimeoutMs(), 30000) });
      await logo.click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      return;
    }
    await logo.click();
  }

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

    const provider = await this.typeAddressUntilSuggestionLoads(address, this.deliveryAddressInput);
    const addressSuggestion = await this.getSelectableAddressSuggestion(address);

    await this.clickAddressSuggestion(addressSuggestion);
    await this.waitForAddressValidationToFinish();

    return provider;
  }

  async expectDeliveryAddressSelected(address: string): Promise<void> {
    const exactAddressPattern = new RegExp(address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const selectedAddress = await this.waitForAddressInputToMatch(this.deliveryAddressInput, address, exactAddressPattern);

    if (testEnv.testEnvironment === "browserstack") {
      const hasErrorClass = await this.deliveryAddressInput.evaluate((element) => element.classList.contains("has-error"));

      expect(this.selectedAddressMatchesExpected(selectedAddress, address, exactAddressPattern)).toBe(true);
      expect(hasErrorClass).toBe(false);
      await this.expectNoDeliveryAddressValidationErrors();
      return;
    }

    expect(this.selectedAddressMatchesExpected(selectedAddress, address, exactAddressPattern)).toBe(true);
    await expect(this.deliveryAddressInput).not.toHaveClass(/has-error/);
    await this.expectNoDeliveryAddressValidationErrors();
  }

  async expectUseSameAddressCheckboxDisplayed(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.expectBrowserStackTextInDetail("#detail-panel", /Use same address for both/i);
      await this.waitForBrowserStackSelector("input[type='checkbox']");
      return;
    }

    await expect(this.useSameAddressLabel).toBeVisible({ timeout: getActiveTimeoutMs() });
    await expect(this.useSameAddressCheckbox).toBeVisible({ timeout: getActiveTimeoutMs() });
  }

  async uncheckUseSameAddressForBoth(): Promise<void> {
    await this.useSameAddressCheckbox.waitFor({ state: "visible", timeout: getActiveTimeoutMs() });

    if (await this.useSameAddressCheckbox.isChecked()) {
      await this.useSameAddressCheckbox.uncheck({ force: testEnv.testEnvironment === "browserstack" });
    }
  }

  async expectPickupAddressFieldDisplayed(): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll<HTMLInputElement>("input")).some((input) =>
            input.placeholder.toLowerCase().includes("pickup address or name of the"),
          ),
        undefined,
        { timeout: getActiveTimeoutMs() },
      );
      return;
    }

    await expect(this.pickupAddressInput).toBeVisible({ timeout: getActiveTimeoutMs() });
  }

  async enterAndSelectPickupAddress(address: string): Promise<"Google" | "Cloud maps"> {
    await this.pickupAddressInput.click();
    await this.pickupAddressInput.fill("");

    const provider = await this.typeAddressUntilSuggestionLoads(address, this.pickupAddressInput);
    const addressSuggestion = await this.getSelectableAddressSuggestion(address);

    await this.clickAddressSuggestion(addressSuggestion);
    await this.waitForAddressValidationToFinish();

    return provider;
  }

  async expectPickupAddressSelected(address: string): Promise<void> {
    const exactAddressPattern = new RegExp(address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const selectedAddress = await this.waitForAddressInputToMatch(this.pickupAddressInput, address, exactAddressPattern);

    expect(this.selectedAddressMatchesExpected(selectedAddress, address, exactAddressPattern)).toBe(true);
    await this.expectNoDeliveryAddressValidationErrors();
  }

  async expectDeliveryAndPickupAddressValidationSuccessful(): Promise<void> {
    await this.waitForAddressValidationToFinish();
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
      await this.page.keyboard.type(chunk, { delay: ADDRESS_TYPING_DELAY_MS });
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
      await this.clickAddressSuggestion(suggestion);
      await this.waitForAddressValidationToFinish();
      return;
    }

    const suggestion = await this.getSelectableAddressSuggestion(address);
    await this.clickAddressSuggestion(suggestion);
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

  async clickTodayDateInDatePicker(): Promise<void> {
    const calendarSelector = testEnv.device === "mobile" ? "#calendarContainer" : "#custRangePicketDekstopCalendarPopup";
    const today = new Date();
    const todaySelector = `${calendarSelector} [data-date="${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}"]`;

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForSelector(todaySelector, {
        state: "visible",
        timeout: Math.min(getActiveTimeoutMs(), 30000),
      });
      await this.page.locator(todaySelector).click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      return;
    }

    await this.page.locator(todaySelector).click();
  }

  async selectFutureDateAsEndDate(): Promise<string> {
    const today = new Date();
    // 15th of 2 months from now — always rendered and always in the future
    const futureDate = new Date(today.getFullYear(), today.getMonth() + 2, 15);
    const m = futureDate.getMonth() + 1;
    const d = futureDate.getDate();
    const y = futureDate.getFullYear();
    const dateAttr = `${m}/${d}/${y}`;
    const paddedDate = `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;

    if (testEnv.device === "mobile") {
      const fullSelector = `#calendarContainer [data-date="${dateAttr}"]`;
      if (testEnv.testEnvironment === "browserstack") {
        await this.page.waitForSelector(fullSelector, { state: "attached", timeout: Math.min(getActiveTimeoutMs(), 30000) });
        await this.page.locator(fullSelector).scrollIntoViewIfNeeded({ timeout: Math.min(getActiveTimeoutMs(), 30000) });
        await this.page.locator(fullSelector).click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      } else {
        await this.page.locator(fullSelector).scrollIntoViewIfNeeded();
        await this.page.locator(fullSelector).click();
      }
    } else {
      const nextBtn = this.page.locator("#nextBtnDesktopRangePicker");
      if (testEnv.testEnvironment === "browserstack") {
        await nextBtn.waitFor({ state: "visible", timeout: Math.min(getActiveTimeoutMs(), 30000) });
        await nextBtn.click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      } else {
        await nextBtn.click();
      }
      const fullSelector = `#custRangePicketDekstopCalendarPopup [data-date="${dateAttr}"]`;
      if (testEnv.testEnvironment === "browserstack") {
        await this.page.waitForSelector(fullSelector, { state: "visible", timeout: Math.min(getActiveTimeoutMs(), 30000) });
        await this.page.locator(fullSelector).click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      } else {
        await this.page.locator(fullSelector).click();
      }
    }

    return paddedDate;
  }

  async selectFutureStartDate(): Promise<string> {
    const today = new Date();
    const futureDate = new Date(today.getFullYear(), today.getMonth() + 2, 15);
    const m = futureDate.getMonth() + 1;
    const d = futureDate.getDate();
    const y = futureDate.getFullYear();
    const dateAttr = `${m}/${d}/${y}`;
    const paddedDate = `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;

    if (testEnv.device === "mobile") {
      const fullSelector = `#calendarContainer [data-date="${dateAttr}"]`;
      if (testEnv.testEnvironment === "browserstack") {
        await this.page.waitForSelector(fullSelector, { state: "attached", timeout: Math.min(getActiveTimeoutMs(), 30000) });
        await this.page.locator(fullSelector).scrollIntoViewIfNeeded({ timeout: Math.min(getActiveTimeoutMs(), 30000) });
        await this.page.locator(fullSelector).click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      } else {
        await this.page.locator(fullSelector).scrollIntoViewIfNeeded();
        await this.page.locator(fullSelector).click();
      }
    } else {
      const nextBtn = this.page.locator("#nextBtnDesktopRangePicker");
      if (testEnv.testEnvironment === "browserstack") {
        await nextBtn.waitFor({ state: "visible", timeout: Math.min(getActiveTimeoutMs(), 30000) });
        await nextBtn.click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      } else {
        await nextBtn.click();
      }
      const fullSelector = `#custRangePicketDekstopCalendarPopup [data-date="${dateAttr}"]`;
      if (testEnv.testEnvironment === "browserstack") {
        await this.page.waitForSelector(fullSelector, { state: "visible", timeout: Math.min(getActiveTimeoutMs(), 30000) });
        await this.page.locator(fullSelector).click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      } else {
        await this.page.locator(fullSelector).click();
      }
    }

    return paddedDate;
  }

  async selectLaterEndDate(): Promise<string> {
    const today = new Date();
    // 20th of same future month — always after the 15th start date, no extra navigation needed
    const futureDate = new Date(today.getFullYear(), today.getMonth() + 2, 20);
    const m = futureDate.getMonth() + 1;
    const d = futureDate.getDate();
    const y = futureDate.getFullYear();
    const dateAttr = `${m}/${d}/${y}`;
    const paddedDate = `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
    const calendarSelector = testEnv.device === "mobile" ? "#calendarContainer" : "#custRangePicketDekstopCalendarPopup";
    const fullSelector = `${calendarSelector} [data-date="${dateAttr}"]`;

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForSelector(fullSelector, { state: "visible", timeout: Math.min(getActiveTimeoutMs(), 30000) });
      await this.page.locator(fullSelector).click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
    } else {
      await this.page.locator(fullSelector).click();
    }

    return paddedDate;
  }

  async expectFutureStartAndEndDates(startDate: string, endDate: string): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForFunction(
        ({ start, end }: { start: string; end: string }) => {
          const startVal = (document.querySelector("#dp-dsk-start") as HTMLInputElement | null)?.value ?? "";
          const endVal = (document.querySelector("#dp-dsk-end") as HTMLInputElement | null)?.value ?? "";
          return startVal === start && endVal === end;
        },
        { start: startDate, end: endDate },
        { timeout: Math.min(getActiveTimeoutMs(), 30000) },
      );
      return;
    }

    await expect(this.page.locator("#dp-dsk-start")).toHaveValue(startDate, { timeout: getActiveTimeoutMs() });
    await expect(this.page.locator("#dp-dsk-end")).toHaveValue(endDate, { timeout: getActiveTimeoutMs() });
    await expect(this.page.locator("#dp-dsk-start-end")).not.toHaveValue("", {
      timeout: Math.min(getActiveTimeoutMs(), 15000),
    });
  }

  async expectFutureDateAsBothStartAndEnd(date: string): Promise<void> {
    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForFunction(
        (expected: string) => {
          const startVal = (document.querySelector("#dp-dsk-start") as HTMLInputElement | null)?.value ?? "";
          const endVal = (document.querySelector("#dp-dsk-end") as HTMLInputElement | null)?.value ?? "";
          return startVal === expected && endVal === expected;
        },
        date,
        { timeout: Math.min(getActiveTimeoutMs(), 30000) },
      );
      return;
    }

    await expect(this.page.locator("#dp-dsk-start")).toHaveValue(date, { timeout: getActiveTimeoutMs() });
    await expect(this.page.locator("#dp-dsk-end")).toHaveValue(date, { timeout: getActiveTimeoutMs() });
    await expect(this.page.locator("#dp-dsk-start-end")).not.toHaveValue("", {
      timeout: Math.min(getActiveTimeoutMs(), 15000),
    });
  }

  async expectTodayAsStartAndFutureDateAsEnd(city: string, endDate: string): Promise<void> {
    const { year, month, day } = this.getDeliveryCityLocalDateTime(city);
    const expectedStart = `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForFunction(
        ({ start, end }: { start: string; end: string }) => {
          const startVal = (document.querySelector("#dp-dsk-start") as HTMLInputElement | null)?.value ?? "";
          const endVal = (document.querySelector("#dp-dsk-end") as HTMLInputElement | null)?.value ?? "";
          return startVal === start && endVal === end;
        },
        { start: expectedStart, end: endDate },
        { timeout: Math.min(getActiveTimeoutMs(), 30000) },
      );
      return;
    }

    await expect(this.page.locator("#dp-dsk-start")).toHaveValue(expectedStart, { timeout: getActiveTimeoutMs() });
    await expect(this.page.locator("#dp-dsk-end")).toHaveValue(endDate, { timeout: getActiveTimeoutMs() });
    await expect(this.page.locator("#dp-dsk-start-end")).not.toHaveValue("", {
      timeout: Math.min(getActiveTimeoutMs(), 15000),
    });
  }

  async doubleTapTodayDateInDatePicker(): Promise<void> {
    const calendarSelector = testEnv.device === "mobile" ? "#calendarContainer" : "#custRangePicketDekstopCalendarPopup";
    const today = new Date();
    const todaySelector = `${calendarSelector} [data-date="${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}"]`;

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForSelector(todaySelector, {
        state: "visible",
        timeout: Math.min(getActiveTimeoutMs(), 30000),
      });
      await this.page.locator(todaySelector).click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      await this.page.locator(todaySelector).click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      return;
    }

    await this.page.locator(todaySelector).click();
    await this.page.locator(todaySelector).click();
  }

  async clickDoneButtonInDatePicker(): Promise<void> {
    const calendarSelector = testEnv.device === "mobile" ? "#bottomSheet" : "#custRangePicketDekstopCalendarPopup";
    const doneButton = this.page.locator(`${calendarSelector} .cust-range-picker-done-button`);

    if (testEnv.testEnvironment === "browserstack") {
      await doneButton.waitFor({ state: "visible", timeout: Math.min(getActiveTimeoutMs(), 30000) });
      await doneButton.click({ force: true, timeout: Math.min(getActiveTimeoutMs(), 30000) });
      return;
    }

    await doneButton.click();
  }

  async expectTodayAsStartAndEndDate(city: string): Promise<void> {
    const { year, month, day } = this.getDeliveryCityLocalDateTime(city);
    // Hidden inputs store date as MM/DD/YYYY
    const expectedHiddenValue = `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;

    if (testEnv.testEnvironment === "browserstack") {
      await this.page.waitForFunction(
        (expected: string) => {
          const start = (document.querySelector("#dp-dsk-start") as HTMLInputElement | null)?.value ?? "";
          const end = (document.querySelector("#dp-dsk-end") as HTMLInputElement | null)?.value ?? "";
          return start === expected && end === expected;
        },
        expectedHiddenValue,
        { timeout: Math.min(getActiveTimeoutMs(), 30000) },
      );
      return;
    }

    // Verify hidden inputs have today's date (retries until value is set)
    await expect(this.page.locator("#dp-dsk-start")).toHaveValue(expectedHiddenValue, {
      timeout: getActiveTimeoutMs(),
    });
    await expect(this.page.locator("#dp-dsk-end")).toHaveValue(expectedHiddenValue, {
      timeout: getActiveTimeoutMs(),
    });

    // Verify the visible rental period input is populated (retries until non-empty)
    await expect(this.page.locator("#dp-dsk-start-end")).not.toHaveValue("", {
      timeout: Math.min(getActiveTimeoutMs(), 15000),
    });
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
    await this.page.keyboard.type(value, { delay: ADDRESS_TYPING_DELAY_MS });
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

  private async typeAddressUntilSuggestionLoads(address: string, addressInput: Locator): Promise<"Google" | "Cloud maps"> {
    let provider: "Google" | "Cloud maps" | undefined;
    let typedCharacters = 0;

    await addressInput.focus();

    for (const chunk of address.match(/.{1,5}/g) ?? []) {
      await this.page.keyboard.type(chunk, { delay: ADDRESS_TYPING_DELAY_MS });
      typedCharacters += chunk.length;

      const dropdownLoaded = await this.isAutocompleteDropdownLoaded();

      if (dropdownLoaded && provider === undefined) {
        provider = await this.getMapDropdownProvider();
      }

      if (typedCharacters >= 10 && (await this.getMatchingAddressSuggestion(address).isVisible({ timeout: 1000 }).catch(() => false))) {
        return provider ?? this.getMapDropdownProvider();
      }
    }

    await expect(this.getMatchingAddressSuggestion(address)).toBeVisible({ timeout: getActiveTimeoutMs() });

    return provider ?? this.getMapDropdownProvider();
  }

  private async isAutocompleteDropdownLoaded(): Promise<boolean> {
    return this.page
      .locator("[id*='autocomplete-list'] div, .pac-container .pac-item, [role='option']")
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false);
  }

  private getExactAddressSuggestion(address: string): Locator {
    return this.page
      .locator("[id*='autocomplete-list'] div")
      .filter({ hasText: address })
      .first()
      .or(this.page.locator(".pac-container .pac-item").filter({ hasText: address }).first())
      .or(this.page.getByRole("option", { name: new RegExp(address, "i") }).first())
      .or(this.page.locator("[id*='autocomplete'], [class*='autocomplete']").getByText(address, { exact: true }).first());
  }

  private getMatchingAddressSuggestion(address: string): Locator {
    const expectedAddressParts = this.getImportantAddressParts(address);
    const addressPattern =
      expectedAddressParts.length <= 2
        ? new RegExp(`^\\s*${expectedAddressParts.map((part) => this.escapeRegex(part)).join("\\b.*\\b")}`, "i")
        : new RegExp(expectedAddressParts.map((part) => this.escapeRegex(part)).join(".*"), "i");

    return this.getExactAddressSuggestion(address)
      .or(this.page.locator("[id*='autocomplete-list'] div").filter({ hasText: addressPattern }).first())
      .or(this.page.locator(".pac-container .pac-item").filter({ hasText: addressPattern }).first())
      .or(this.page.getByRole("option", { name: addressPattern }).first());
  }

  private async getSelectableAddressSuggestion(address: string): Promise<Locator> {
    const matchingAddressSuggestion = this.getMatchingAddressSuggestion(address);

    if (await matchingAddressSuggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
      return matchingAddressSuggestion;
    }

    await expect(matchingAddressSuggestion).toBeVisible({ timeout: getActiveTimeoutMs() });
    return matchingAddressSuggestion;
  }

  private async clickAddressSuggestion(addressSuggestion: Locator): Promise<void> {
    const clickTimeout = Math.min(getActiveTimeoutMs(), 30000);

    await addressSuggestion
      .click({ force: true, timeout: clickTimeout })
      .catch(async () => {
        await addressSuggestion.dispatchEvent("mousedown");
        await addressSuggestion.dispatchEvent("mouseup");
        await addressSuggestion.dispatchEvent("click");
      });
  }

  private async waitForAddressInputToMatch(input: Locator, expectedAddress: string, exactAddressPattern: RegExp): Promise<string> {
    const timeoutMs = Math.min(getActiveTimeoutMs(), 60000);
    const deadline = Date.now() + timeoutMs;
    let selectedAddress = "";

    while (Date.now() < deadline) {
      selectedAddress = await input.inputValue().catch(() => "");

      if (this.selectedAddressMatchesExpected(selectedAddress, expectedAddress, exactAddressPattern)) {
        return selectedAddress;
      }

      await this.page.waitForTimeout(500);
    }

    expect(
      this.selectedAddressMatchesExpected(selectedAddress, expectedAddress, exactAddressPattern),
      `Expected address field value "${selectedAddress}" to match "${expectedAddress}"`,
    ).toBe(true);

    return selectedAddress;
  }

  private selectedAddressMatchesExpected(selectedAddress: string, expectedAddress: string, exactAddressPattern: RegExp): boolean {
    if (exactAddressPattern.test(selectedAddress)) {
      return true;
    }

    const normalizedSelectedAddress = this.normalizeAddressForComparison(selectedAddress);
    const normalizedExpectedAddress = this.normalizeAddressForComparison(expectedAddress);

    if (normalizedSelectedAddress.includes(normalizedExpectedAddress)) {
      return true;
    }

    const expectedAddressParts = expectedAddress
      .split(",")
      .map((part) => this.normalizeAddressForComparison(part))
      .filter(Boolean);
    const importantAddressParts = this.getImportantAddressParts(expectedAddressParts.join(","));

    if (importantAddressParts.length <= 2) {
      return (
        normalizedSelectedAddress.startsWith(importantAddressParts[0]) &&
        importantAddressParts.slice(1).every((part) => normalizedSelectedAddress.includes(part))
      );
    }

    return importantAddressParts.every((part) => normalizedSelectedAddress.includes(part));
  }

  private getImportantAddressParts(address: string): string[] {
    const expectedAddressParts = address
      .split(",")
      .map((part) => this.normalizeAddressForComparison(part))
      .filter((part) => part !== "usa")
      .filter(Boolean);

    if (expectedAddressParts.length <= 2) {
      return expectedAddressParts;
    }

    const [nameOrCity, streetOrState, ...rest] = expectedAddressParts;
    const importantParts = [nameOrCity, streetOrState];
    const city = rest.find((part) => part !== "fl" && part !== "usa");
    const state = rest.find((part) => part === "fl");

    if (city && !importantParts.includes(city)) {
      importantParts.push(city);
    }

    if (state && !importantParts.includes(state)) {
      importantParts.push(state);
    }

    return importantParts;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private normalizeAddressForComparison(address: string): string {
    return address
      .toLowerCase()
      .replace(/\bunited states of america\b/g, "usa")
      .replace(/\bunited states\b/g, "usa")
      .replace(/\bflorida\b/g, "fl")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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
