import { After, Before, setDefaultTimeout, Status } from "@cucumber/cucumber";
import { chromium, firefox, webkit, type BrowserType } from "playwright";
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

  this.browser = await browserType.launch({
    headless: testEnv.headless,
  });

  this.context = await this.browser.newContext();
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
