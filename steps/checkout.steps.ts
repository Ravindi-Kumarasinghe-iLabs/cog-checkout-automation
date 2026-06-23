import { Given, Then } from "@cucumber/cucumber";
import { HomePage } from "../pages/HomePage";
import type { CustomWorld } from "../support/world";

Given("I open the Cloud of Goods staging home page", async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);

  await homePage.open();
});

Then("the Cloud of Goods home page should be displayed", async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);

  await homePage.expectLoaded();
});
