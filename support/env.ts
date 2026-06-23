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
  browser: process.env.BROWSER ?? "chromium",
  headless: toBoolean(process.env.HEADLESS, false),
  defaultTimeoutMs: toNumber(process.env.DEFAULT_TIMEOUT_MS, 30000),
};
