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
  airportDeliveryAddress: {
    tags: "@DA-002",
  },
  attractionDeliveryAddress: {
    tags: "@DA-003",
  },
  blacklistedHotelDeliveryAddress: {
    tags: "@DA-004",
  },
  rentalPeriod: {
    tags: "@RP-001",
  },
  deliveryAddressDropdownValidation: {
    tags: "@DA-005",
  },
  partialDeliveryAddressDropdownValidation: {
    tags: "@DA-006",
  },
  halfDeliveryAddressDropdownValidation: {
    tags: "@DA-007",
  },
  fullDeliveryAddressDropdownValidation: {
    tags: "@DA-008",
  },
  emptyDeliveryAddressRequiredValidation: {
    tags: "@DA-009",
  },
  rentalPeriodDatePicker: {
    tags: "@RP-002",
  },
  browserStack: {
    parallel: 1,
  },
};
