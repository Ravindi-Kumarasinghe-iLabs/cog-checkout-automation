import { After, Before, setDefaultTimeout, Status } from "@cucumber/cucumber";
import { chromium, devices, firefox, webkit, type BrowserContextOptions, type BrowserType } from "playwright";
import { getActiveTimeoutMs, testEnv } from "./env";
import type { CustomWorld } from "./world";
import { getBrowserStackWsEndpoint } from "../utils/browserStackCaps";

const DESKTOP_CONTEXT_OPTIONS: BrowserContextOptions = {
  viewport: {
    width: 1440,
    height: 900,
  },
};

const browserTypes: Record<string, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

const getLocalBrowserProfile = (): string => {
  const explicitProfile = process.env.BROWSER_PROFILE ?? process.env.BROWSERSTACK_PROFILE;

  if (explicitProfile) {
    return explicitProfile;
  }

  if (testEnv.device === "mobile") {
    return testEnv.browser === "webkit" ? "safari-mobile" : "chrome-mobile";
  }

  return testEnv.browser === "webkit" ? "safari-desktop" : "chrome-desktop";
};

const getLocalBrowserType = (profile: string): BrowserType => {
  if (profile === "safari-mobile" || profile === "safari-desktop") {
    return webkit;
  }

  if (profile === "chrome-mobile" || profile === "chrome-desktop") {
    return chromium;
  }

  return browserTypes[testEnv.browser] ?? chromium;
};

const getLocalContextOptions = (profile: string): BrowserContextOptions => {
  if (profile === "safari-mobile") {
    const iPhone14 = devices["iPhone 14"];

    return {
      viewport: {
        width: 390,
        height: 844,
      },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
      userAgent: iPhone14.userAgent,
    };
  }

  if (profile === "chrome-mobile") {
    const pixel7 = devices["Pixel 7"];

    return {
      viewport: {
        width: 412,
        height: 915,
      },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
      userAgent: pixel7.userAgent,
    };
  }

  return DESKTOP_CONTEXT_OPTIONS;
};

setDefaultTimeout(getActiveTimeoutMs());

Before(async function (this: CustomWorld, scenario) {
  const localProfile = getLocalBrowserProfile();
  const browserType = getLocalBrowserType(localProfile);
  const launchOptions = {
    headless: testEnv.headless,
    channel: testEnv.browserChannel,
  };
  const contextOptions = getLocalContextOptions(localProfile);

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

    if (localProfile === "safari-mobile" || localProfile === "chrome-mobile") {
      const mobileDebugInfo = await this.page.evaluate(() => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent,
        visualViewportScale: window.visualViewport?.scale,
      }));

      console.log("Mobile debug info:", mobileDebugInfo);
    }
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
