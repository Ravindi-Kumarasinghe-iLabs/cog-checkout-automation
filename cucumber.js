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
  pickupAddress: {
    tags: "@PA-001",
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
  nextEmptyDeliveryAddressRequiredValidation: {
    tags: "@DA-010",
  },
  rentalPeriodDatePicker: {
    tags: "@RP-002",
  },
  rentalPeriodCalendarIcon: {
    tags: "@RP-003",
  },
  pastDatesDisabled: {
    tags: "@RP-004",
  },
  singleDayRental: {
    tags: "@RP-005",
  },
  doubleTapSingleDayRental: {
    tags: "@RP-006",
  },
  navigationLogo: {
    tags: "@NV-001",
  },
  changeRentalPeriod: {
    tags: "@RP-010",
  },
  differentFutureDatesRental: {
    tags: "@RP-009",
  },
  sameFutureDateRental: {
    tags: "@RP-008",
  },
  futureEndDateRental: {
    tags: "@RP-007",
  },
  browserStack: {
    parallel: 1,
  },
};
