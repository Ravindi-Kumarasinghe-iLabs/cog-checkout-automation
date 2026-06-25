const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const deliveryAddressTests = [
  "test:locality-delivery-address",
  "test:airport-delivery-address",
  "test:attraction-delivery-address",
  "test:blacklisted-hotel-delivery-address",
  "test:delivery-address-dropdown-validation",
  "test:partial-delivery-address-dropdown-validation",
  "test:half-delivery-address-dropdown-validation",
  "test:full-delivery-address-dropdown-validation",
  "test:empty-delivery-address-required-validation",
  "test:next-empty-delivery-address-required-validation",
];

const pickupAddressTests = [
  "test:pickup-address",
  "test:pickup-address-city-mismatch",
  "test:pickup-locality-address",
  "test:pickup-airport-address",
  "test:pickup-attraction-address",
  "test:pickup-blacklisted-hotel-address",
];

const checkoutTests = [
  "test:product-cart",
  ...deliveryAddressTests,
  ...pickupAddressTests,
  "test:rental-period",
  "test:rental-period-date-picker",
  "test:rental-period-calendar-icon",
  "test:past-dates-disabled",
  "test:single-day-rental",
  "test:double-tap-single-day-rental",
  "test:future-end-date-rental",
  "test:same-future-date-rental",
  "test:different-future-dates-rental",
  "test:change-rental-period",
  "test:navigation-logo",
  "test:navigation-cart-item",
  "test:navigation-cart-item-name",
  "test:navigation-close-icon",
];

const localBrowsers = ["chrome-desktop", "chrome-mobile", "safari-desktop", "safari-mobile"];
const browserStackBrowsers = ["bs:chrome-desktop", "bs:safari-desktop"];

const suites = {
  "delivery-addresses:all-headed": expandScripts(deliveryAddressTests, localBrowsers),
  "delivery-addresses:bs:all": expandScripts(deliveryAddressTests, browserStackBrowsers),
  "pickup-addresses:all-headed": expandScripts(pickupAddressTests, localBrowsers),
  "pickup-addresses:bs:all": expandScripts(pickupAddressTests, browserStackBrowsers),
  "checkout:all-headed": expandScripts(checkoutTests, localBrowsers),
  "checkout:bs:all": expandScripts(checkoutTests.filter((script) => script !== "test:product-cart"), browserStackBrowsers),
};

const suiteName = process.argv[2];

if (!suiteName || !suites[suiteName]) {
  console.error("Unknown suite. Available suites:");
  Object.keys(suites).forEach((name) => console.error(`  ${name}`));
  process.exit(1);
}

const runId = `${suiteName.replace(/[^a-z0-9-]+/gi, "-")}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const suiteReportDir = path.join("reports", "suites", runId);
const jsonDir = path.join(suiteReportDir, "json");
const htmlDir = path.join(suiteReportDir, "html");

fs.mkdirSync(jsonDir, { recursive: true });
fs.mkdirSync(htmlDir, { recursive: true });

const results = [];
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

console.log(`\nRunning suite: ${suiteName}`);
console.log(`Report directory: ${suiteReportDir}\n`);

for (const scriptName of suites[suiteName]) {
  const safeName = scriptName.replace(/[^a-z0-9-]+/gi, "_");
  const jsonReport = path.join(jsonDir, `${safeName}.json`);
  const htmlReport = path.join(htmlDir, `${safeName}.html`);
  const startedAt = Date.now();

  console.log(`\n========== START ${scriptName} ==========`);

  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CUCUMBER_JSON_REPORT: jsonReport,
      CUCUMBER_HTML_REPORT: htmlReport,
    },
    stdio: "inherit",
  });

  const durationMs = Date.now() - startedAt;
  const summary = readCucumberSummary(jsonReport);
  const status = result.status === 0 ? "passed" : "failed";

  results.push({
    scriptName,
    status,
    exitCode: result.status,
    signal: result.signal,
    durationMs,
    jsonReport,
    htmlReport,
    ...summary,
  });

  console.log(`========== END ${scriptName}: ${status.toUpperCase()} ==========\n`);
}

writeSuiteSummary(suiteReportDir, suiteName, results);
generateCombinedHtmlReport(suiteReportDir, jsonDir, suiteName);

const failedResults = results.filter((result) => result.status !== "passed");
const passedCount = results.length - failedResults.length;

console.log("\n========== SUITE SUMMARY ==========");
console.log(`Suite: ${suiteName}`);
console.log(`Passed scripts: ${passedCount}`);
console.log(`Failed scripts: ${failedResults.length}`);
console.log(`Summary: ${path.join(suiteReportDir, "summary.md")}`);
console.log(`Combined report: ${path.join(suiteReportDir, "combined-html-report", "index.html")}`);

if (failedResults.length > 0) {
  console.log("\nFailed scripts:");
  failedResults.forEach((result) => console.log(`  ${result.scriptName}`));
}

process.exit(failedResults.length > 0 ? 1 : 0);

function expandScripts(baseScripts, browsers) {
  return baseScripts.flatMap((scriptName) => browsers.map((browser) => `${scriptName}:${browser}`));
}

function readCucumberSummary(jsonReport) {
  if (!fs.existsSync(jsonReport)) {
    return {
      scenarios: 0,
      passedScenarios: 0,
      failedScenarios: 0,
      skippedScenarios: 0,
    };
  }

  const report = JSON.parse(fs.readFileSync(jsonReport, "utf8"));
  const scenarios = report.flatMap((feature) => feature.elements ?? []).filter((element) => element.type === "scenario");
  const failedScenarios = scenarios.filter((scenario) => scenario.steps?.some((step) => step.result?.status === "failed")).length;
  const skippedScenarios = scenarios.filter((scenario) => scenario.steps?.every((step) => step.result?.status === "skipped")).length;

  return {
    scenarios: scenarios.length,
    passedScenarios: scenarios.length - failedScenarios - skippedScenarios,
    failedScenarios,
    skippedScenarios,
  };
}

function writeSuiteSummary(suiteReportDir, suiteName, results) {
  const summaryJsonPath = path.join(suiteReportDir, "summary.json");
  const summaryMarkdownPath = path.join(suiteReportDir, "summary.md");

  fs.writeFileSync(summaryJsonPath, JSON.stringify({ suiteName, results }, null, 2));

  const lines = [
    `# Test Suite Report: ${suiteName}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "| Script | Status | Scenarios | Passed | Failed | Skipped | Duration |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: |",
    ...results.map((result) =>
      [
        result.scriptName,
        result.status,
        result.scenarios,
        result.passedScenarios,
        result.failedScenarios,
        result.skippedScenarios,
        `${Math.round(result.durationMs / 1000)}s`,
      ].join(" | "),
    ),
    "",
    "## Report Files",
    "",
    ...results.map((result) => `- ${result.scriptName}: ${result.htmlReport}`),
  ];

  fs.writeFileSync(summaryMarkdownPath, lines.join("\n"));
}

function generateCombinedHtmlReport(suiteReportDir, jsonDir, suiteName) {
  try {
    const reporter = require("multiple-cucumber-html-reporter");

    reporter.generate({
      jsonDir,
      reportPath: path.join(suiteReportDir, "combined-html-report"),
      reportName: `COG Checkout Automation - ${suiteName}`,
      pageTitle: `COG Checkout Automation - ${suiteName}`,
      displayDuration: true,
      metadata: {
        browser: {
          name: "Multiple",
          version: "See scenario names",
        },
        device: "Local and BrowserStack profiles",
        platform: {
          name: process.platform,
        },
      },
    });
  } catch (error) {
    fs.writeFileSync(path.join(suiteReportDir, "combined-report-error.txt"), String(error));
  }
}
