import { After, Before, setDefaultTimeout, Status } from "@cucumber/cucumber";
import { chromium, devices, firefox, webkit, type BrowserType } from "playwright";
import { getActiveTimeoutMs, testEnv } from "./env";
import type { CustomWorld } from "./world";
import { getBrowserStackWsEndpoint } from "../utils/browserStackCaps";

const browserTypes: Record<string, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

setDefaultTimeout(getActiveTimeoutMs());

Before(async function (this: CustomWorld, scenario) {
  const browserType = browserTypes[testEnv.browser] ?? chromium;
  const launchOptions = {
    headless: testEnv.headless,
    channel: testEnv.browserChannel,
  };
  const mobileDevice = testEnv.browser === "webkit" ? devices["iPhone 15 Pro Max"] : devices["Pixel 5"];
  const contextOptions = testEnv.testEnvironment === "browserstack" ? {} : testEnv.device === "mobile" ? mobileDevice : {};

  this.browser =
    testEnv.testEnvironment === "browserstack"
      ? await chromium.connect(getBrowserStackWsEndpoint(scenario.pickle.name))
      : await browserType.launch(launchOptions);

  if (testEnv.testEnvironment === "browserstack") {
    this.page = await this.browser.newPage();
    this.context = this.page.context();
  } else {
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();
  }

  this.page.setDefaultTimeout(getActiveTimeoutMs());
  this.page.setDefaultNavigationTimeout(getActiveTimeoutMs());
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.attach(screenshot, "image/png");
    } catch {
      await this.attach("Screenshot capture failed after browser/session error.", "text/plain");
    }
  }

  if (testEnv.testEnvironment === "browserstack" && this.page) {
    const status = scenario.result?.status === Status.PASSED ? "passed" : "failed";
    const reason =
      scenario.result?.status === Status.PASSED
        ? "Scenario passed successfully"
        : scenario.result?.message ?? "Scenario failed";

    try {
      await this.page.evaluate(
        () => {},
        `browserstack_executor: ${JSON.stringify({
          action: "setSessionStatus",
          arguments: {
            status,
            reason,
          },
        })}`,
      );
    } catch {
      await this.attach("BrowserStack session status update failed after browser/session error.", "text/plain");
    }
  }

  try {
    await this.context?.close();
  } catch {
    await this.attach("Browser context close failed after browser/session error.", "text/plain");
  }

  try {
    await this.browser?.close();
  } catch {
    await this.attach("Browser close failed after browser/session error.", "text/plain");
  }
});
