module.exports = {
  default: {
    requireModule: ["ts-node/register"],
    require: ["support/**/*.ts", "steps/**/*.ts"],
    paths: ["features/**/*.feature"],
    format: ["progress", "html:reports/cucumber-report.html", "json:reports/cucumber-report.json"],
    parallel: 1,
    forceExit: true,
    publishQuiet: true,
  },
  local: {
    tags: "@smoke",
  },
  dryRun: {
    dryRun: true,
    format: ["progress"],
    forceExit: true,
  },
  productCart: {
    tags: "@product-cart",
  },
  deliveryAddress: {
    tags: "@DA-001",
  },
  browserStack: {
    parallel: 1,
  },
};
