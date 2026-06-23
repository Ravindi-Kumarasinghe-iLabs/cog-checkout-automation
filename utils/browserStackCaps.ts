import { testEnv } from "../support/env";
import playwrightPackage from "playwright/package.json";

export type BrowserStackProfile = "chrome-desktop" | "safari-desktop";

type BrowserStackCaps = Record<string, string | boolean>;

const profileCapabilities: Record<BrowserStackProfile, BrowserStackCaps> = {
  "chrome-desktop": {
    os: "Windows",
    osVersion: "11",
    browser: "chrome",
    browserVersion: "latest",
  },
  "safari-desktop": {
    os: "OS X",
    osVersion: "Ventura",
    browser: "playwright-webkit",
    browserVersion: "latest",
  },
};

export const getBrowserStackProfile = (): BrowserStackProfile => {
  const profile = process.env.BROWSERSTACK_PROFILE as BrowserStackProfile | undefined;

  if (profile && profile in profileCapabilities) {
    return profile;
  }

  if (testEnv.browser === "webkit") {
    return "safari-desktop";
  }

  return "chrome-desktop";
};

export const getBrowserStackWsEndpoint = (scenarioName: string): string => {
  if (!testEnv.browserStackUsername || !testEnv.browserStackAccessKey) {
    throw new Error("BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set to run on BrowserStack.");
  }

  const profile = getBrowserStackProfile();
  const sessionName = `${scenarioName} - ${profile}`;
  const capabilities = {
    ...profileCapabilities[profile],
    "browserstack.username": testEnv.browserStackUsername,
    "browserstack.accessKey": testEnv.browserStackAccessKey,
    project: testEnv.browserStackProjectName,
    build: testEnv.browserStackBuildName,
    name: sessionName,
    "browserstack.debug": true,
    "browserstack.console": "info",
    "browserstack.networkLogs": true,
    "client.playwrightVersion": playwrightPackage.version,
  };

  return `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(capabilities))}`;
};
