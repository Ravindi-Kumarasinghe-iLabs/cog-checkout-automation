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
    tags: "@smoke",
    format: ["progress"],
    forceExit: true,
  },
};
