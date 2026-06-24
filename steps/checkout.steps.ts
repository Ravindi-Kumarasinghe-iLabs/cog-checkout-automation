import { Given, Then, When } from "@cucumber/cucumber";
import { CheckoutPage } from "../pages/CheckoutPage";
import { HomePage } from "../pages/HomePage";
import { ProductPage } from "../pages/ProductPage";
import type { CustomWorld } from "../support/world";

const openCheckoutWithLightweightMobilityScooter = async (world: CustomWorld): Promise<void> => {
  const homePage = new HomePage(world.page);
  const productPage = new ProductPage(world.page);
  const checkoutPage = new CheckoutPage(world.page);

  await homePage.open();
  await homePage.expectLoaded();
  await homePage.browseAllProducts();
  await productPage.expectAllProductRentalsPageLoaded();
  await productPage.expectLightweightMobilityScooterIsListed();
  await productPage.bookLightweightMobilityScooter();
  await checkoutPage.expectLoaded();
  await checkoutPage.expectLightweightMobilityScooterInCart();
};

Given("I open the Cloud of Goods staging home page", async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);

  await homePage.open();
});

Given("I open the checkout page with Lightweight Mobility Scooter in the cart", async function (this: CustomWorld) {
  await openCheckoutWithLightweightMobilityScooter(this);
});

Then("the Cloud of Goods home page should be displayed", async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);

  await homePage.expectLoaded();
});

When("I browse all product rentals", async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);

  await homePage.browseAllProducts();
});

Then("the product rentals all page should be displayed", async function (this: CustomWorld) {
  const productPage = new ProductPage(this.page);

  await productPage.expectAllProductRentalsPageLoaded();
});

Then("the Lightweight Mobility Scooter should be listed", async function (this: CustomWorld) {
  const productPage = new ProductPage(this.page);

  await productPage.expectLightweightMobilityScooterIsListed();
});

When("I book the Lightweight Mobility Scooter", async function (this: CustomWorld) {
  const productPage = new ProductPage(this.page);

  await productPage.bookLightweightMobilityScooter();
});

Then("the checkout page should be displayed", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectLoaded();
});

Then("the checkout cart should contain the Lightweight Mobility Scooter", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectLightweightMobilityScooterInCart();
});

Then("the delivery address section should be displayed", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectDeliveryAddressSectionDisplayed();
});

When("I enter and select {string} as the delivery address", async function (this: CustomWorld, address: string) {
  const checkoutPage = new CheckoutPage(this.page);

  const mapProvider = await checkoutPage.enterAndSelectDeliveryAddress(address);
  await this.attach(`Delivery address map dropdown loaded from: ${mapProvider}`, "text/plain");
});

Then("the delivery address {string} should be selected successfully", async function (this: CustomWorld, address: string) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectDeliveryAddressSelected(address);
});

Then("the rental period date picker should be displayed", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectRentalPeriodDatePickerDisplayed();
});

Then("the delivery location label should be visible", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectDeliveryLocationLabelVisible();
});

When("I enter {string} as the delivery address", async function (this: CustomWorld, address: string) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.enterDeliveryAddress(address);
});

When("I select {string} from the address suggestions", async function (this: CustomWorld, address: string) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.selectFromAddressSuggestions(address);
});

When("I click the Next button", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.clickNextButton();
});

Then("the {string} validation message should be displayed", async function (this: CustomWorld, message: string) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectValidationMessage(message);
});

When(
  "I type {string} in the delivery address field and click outside without selecting a dropdown address",
  async function (this: CustomWorld, value: string) {
    const checkoutPage = new CheckoutPage(this.page);

    await checkoutPage.typeDeliveryAddressAndBlurWithoutSelecting(value);
  },
);

Then("the delivery address dropdown selection validation should be displayed", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectDeliveryAddressDropdownSelectionValidation();
});

When("I focus the empty delivery address field and click outside", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.focusEmptyDeliveryAddressAndBlur();
});

Then("the delivery address required validation should be displayed", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectDeliveryAddressRequiredValidation();
});

Then("the rental period label should be visible", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectRentalPeriodLabelVisible();
});

When("I click on the rental period field", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.clickRentalPeriodField();
});

When("I click on the date picker icon", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.clickDatePickerIcon();
});

Then("the date picker should be displayed", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectDatePickerDisplayed();
});

Then("past dates should be displayed as disabled in the date picker", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectPastDatesDisabledInDatePicker();
});

Then("today's date should reflect the 4 PM same-day cutoff for {string}", async function (this: CustomWorld, city: string) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectTodayCutoffRuleForCity(city);
});

Then("future dates should be enabled in the date picker", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.expectFutureDatesEnabledInDatePicker();
});

When("I tap today's date in the date picker", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.clickTodayDateInDatePicker();
});

When("I double tap today's date in the date picker", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.doubleTapTodayDateInDatePicker();
});

When("I click the Done button in the date picker", async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page);

  await checkoutPage.clickDoneButtonInDatePicker();
});

Then(
  "the rental period field should show today as both the start and end date for {string}",
  async function (this: CustomWorld, city: string) {
    const checkoutPage = new CheckoutPage(this.page);

    await checkoutPage.expectTodayAsStartAndEndDate(city);
  },
);
