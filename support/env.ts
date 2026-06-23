import dotenv from "dotenv";

dotenv.config({ quiet: true });

const toBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
};

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const testEnv = {
  baseUrl: process.env.BASE_URL ?? "https://cog-stg.incubatelabs.com",
  testEnvironment: process.env.TEST_ENV ?? "local",
  browser: process.env.BROWSER ?? "chromium",
  browserChannel: process.env.BROWSER_CHANNEL,
  device: process.env.DEVICE ?? "desktop",
  headless: toBoolean(process.env.HEADLESS, false),
  defaultTimeoutMs: toNumber(process.env.DEFAULT_TIMEOUT_MS, 300000),
  browserStackTimeoutMs: toNumber(process.env.BROWSERSTACK_TIMEOUT_MS, 600000),
  browserStackUsername: process.env.BROWSERSTACK_USERNAME,
  browserStackAccessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  browserStackBuildName: process.env.BROWSERSTACK_BUILD_NAME ?? "COG Checkout Automation",
  browserStackProjectName: process.env.BROWSERSTACK_PROJECT_NAME ?? "Cloud of Goods Checkout",
};

export const getActiveTimeoutMs = (): number =>
  testEnv.testEnvironment === "browserstack" ? testEnv.browserStackTimeoutMs : testEnv.defaultTimeoutMs;
