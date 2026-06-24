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

  @checkout @delivery-address @DA-004
  Scenario: DA-004 Verify user can enter and select a valid blacklisted hotel delivery address successfully
    Given I open the checkout page with Lightweight Mobility Scooter in the cart
    Then the delivery address section should be displayed
    When I enter and select "Golden Gate Hotel and Casino, Fremont Street, Las Vegas, NV, USA" as the delivery address
    Then the delivery address "Golden Gate Hotel and Casino, Fremont Street, Las Vegas, NV, USA" should be selected successfully
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
