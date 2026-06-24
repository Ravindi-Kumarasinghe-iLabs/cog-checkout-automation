Feature: Cloud of Goods checkout order placement

  @smoke
  Scenario: SMOKE-001 Verify the Cloud of Goods staging home page loads successfully
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed

  @checkout @product-cart
  Scenario: CHECKOUT-BASE-001 Open checkout with Lightweight Mobility Scooter in the cart
    Given I open the checkout page with Lightweight Mobility Scooter in the cart

  @checkout @delivery-address @DA-001
  Scenario: DA-001 Verify user can enter and select a valid locality delivery address successfully
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I enter and select "Orlando, FL, USA" as the delivery address
    Then the delivery address "Orlando, FL, USA" should be selected successfully
    And the rental period date picker should be displayed

  @checkout @delivery-address @DA-002
  Scenario: DA-002 Verify user can enter and select a valid airport delivery address successfully
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I enter and select "Orlando International Airport (MCO), Jeff Fuqua Boulevard, Orlando, FL, USA" as the delivery address
    Then the delivery address "Orlando International Airport (MCO), Jeff Fuqua Boulevard, Orlando, FL, USA" should be selected successfully
    And the rental period date picker should be displayed

  @checkout @delivery-address @DA-003
  Scenario: DA-003 Verify user can enter and select a valid attraction place delivery address successfully
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I enter and select "Universal Studios Florida, Universal Boulevard, Orlando, FL, USA" as the delivery address
    Then the delivery address "Universal Studios Florida, Universal Boulevard, Orlando, FL, USA" should be selected successfully
    And the rental period date picker should be displayed

  @checkout @rental-period @RP-001
  Scenario: RP-001 Show rental period required validation when Next is clicked without selecting a rental period
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the delivery location label should be visible
    When I enter "Orlando" as the delivery address
    And I select "Orlando, FL, USA" from the address suggestions
    And I click the Next button
    Then the "Rental period is required." validation message should be displayed

  @checkout @rental-period @RP-002
  Scenario: RP-002 Date picker should open when the user clicks inside the rental period field
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the delivery location label should be visible
    When I enter "Orlando" as the delivery address
    And I select "Orlando, FL, USA" from the address suggestions
    Then the rental period label should be visible
    When I click on the rental period field
    Then the date picker should be displayed

  @checkout @rental-period @RP-003
  Scenario: RP-003 Date picker should open when the user clicks the calendar icon in the rental period field
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the delivery location label should be visible
    When I enter "Orlando" as the delivery address
    And I select "Orlando, FL, USA" from the address suggestions
    When I click on the date picker icon
    Then the date picker should be displayed

  @checkout @rental-period @RP-004
  Scenario: RP-004 Date picker should disable past dates, apply 4 PM same-day cutoff, and enable future dates
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the delivery location label should be visible
    When I enter "Orlando" as the delivery address
    And I select "Orlando, FL, USA" from the address suggestions
    When I click on the rental period field
    Then the date picker should be displayed
    And past dates should be displayed as disabled in the date picker
    And today's date should reflect the 4 PM same-day cutoff for "Orlando"
    And future dates should be enabled in the date picker

  @checkout @rental-period @RP-005
  Scenario: RP-005 User should be able to select today as both the rental start and end date with a single tap
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the delivery location label should be visible
    When I enter "Orlando" as the delivery address
    And I select "Orlando, FL, USA" from the address suggestions
    When I click on the rental period field
    Then the date picker should be displayed
    When I tap today's date in the date picker
    And I click the Done button in the date picker
    Then the rental period field should show today as both the start and end date for "Orlando"

  @checkout @rental-period @RP-006
  Scenario: RP-006 User should be able to select today as both the rental start and end date with a double tap
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the delivery location label should be visible
    When I enter "Orlando" as the delivery address
    And I select "Orlando, FL, USA" from the address suggestions
    When I click on the rental period field
    Then the date picker should be displayed
    When I double tap today's date in the date picker
    And I click the Done button in the date picker
    Then the rental period field should show today as both the start and end date for "Orlando"

  @checkout @rental-period @RP-007
  Scenario: RP-007 User should be able to select today as the rental start date and a future date as the rental end date
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the delivery location label should be visible
    When I enter "Orlando" as the delivery address
    And I select "Orlando, FL, USA" from the address suggestions
    When I click on the rental period field
    Then the date picker should be displayed
    When I tap today's date in the date picker
    And I navigate to the next month and select a future end date
    And I click the Done button in the date picker
    Then the rental period field should show today as start and a future date as end for "Orlando"

  @checkout @rental-period @RP-008
  Scenario: RP-008 User should be able to select the same future date as both the rental start and end date with a single tap
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the delivery location label should be visible
    When I enter "Orlando" as the delivery address
    And I select "Orlando, FL, USA" from the address suggestions
    When I click on the rental period field
    Then the date picker should be displayed
    When I navigate to the next month and tap a future date
    And I click the Done button in the date picker
    Then the rental period field should show the selected future date as both the start and end date


  @checkout @delivery-address @DA-004
  Scenario: DA-004 Verify user can enter and select a valid blacklisted hotel delivery address successfully
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I enter and select "Disney's All-Star Sports Resort, West Buena Vista Drive, Lake Buena Vista, FL, USA" as the delivery address
    Then the delivery address "Disney's All-Star Sports Resort, West Buena Vista Drive, Lake Buena Vista, FL, USA" should be selected successfully
    And the rental period date picker should be displayed

  @checkout @delivery-address @DA-005
  Scenario: DA-005 Verify delivery address dropdown selection validation appears in orange after typing one letter
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I type "O" in the delivery address field and click outside without selecting a dropdown address
    Then the delivery address dropdown selection validation should be displayed

  @checkout @delivery-address @DA-006
  Scenario: DA-006 Verify delivery address dropdown selection validation appears after typing a partial address
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I type "Orla" in the delivery address field and click outside without selecting a dropdown address
    Then the delivery address dropdown selection validation should be displayed

  @checkout @delivery-address @DA-007
  Scenario: DA-007 Verify delivery address dropdown selection validation appears after typing half or more of an address
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I type "Orlando Inter" in the delivery address field and click outside without selecting a dropdown address
    Then the delivery address dropdown selection validation should be displayed

  @checkout @delivery-address @DA-008
  Scenario: DA-008 Verify delivery address dropdown selection validation appears after typing the full address
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I type "Orlando, FL, USA" in the delivery address field and click outside without selecting a dropdown address
    Then the delivery address dropdown selection validation should be displayed

  @checkout @delivery-address @DA-009
  Scenario: DA-009 Verify delivery address required validation appears after focusing empty field
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I focus the empty delivery address field and click outside
    Then the delivery address required validation should be displayed

  @checkout @delivery-address @DA-010
  Scenario: DA-010 Verify delivery address required validation appears when Next is clicked with empty field
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I click the Next button
    Then the delivery address required validation should be displayed
