import { After, Before, setDefaultTimeout, Status } from "@cucumber/cucumber";
import { chromium, devices, firefox, webkit, type BrowserType } from "playwright";
import { testEnv } from "./env";
import type { CustomWorld } from "./world";

const browserTypes: Record<string, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

setDefaultTimeout(testEnv.defaultTimeoutMs);

Before(async function (this: CustomWorld) {
  const browserType = browserTypes[testEnv.browser] ?? chromium;
  const launchOptions = {
    headless: testEnv.headless,
    channel: testEnv.browserChannel,
  };
  const mobileDevice = testEnv.browser === "webkit" ? devices["iPhone 13"] : devices["Pixel 5"];
  const contextOptions = testEnv.device === "mobile" ? mobileDevice : {};

  this.browser = await browserType.launch(launchOptions);

  this.context = await this.browser.newContext(contextOptions);
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(testEnv.defaultTimeoutMs);
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, "image/png");
  }

  await this.context?.close();
  await this.browser?.close();
});
