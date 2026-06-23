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
