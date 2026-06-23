import { Given, Then, When } from "@cucumber/cucumber";
import { CheckoutPage } from "../pages/CheckoutPage";
import { HomePage } from "../pages/HomePage";
import { ProductPage } from "../pages/ProductPage";
import type { CustomWorld } from "../support/world";

Given("I open the Cloud of Goods staging home page", async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);

  await homePage.open();
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
