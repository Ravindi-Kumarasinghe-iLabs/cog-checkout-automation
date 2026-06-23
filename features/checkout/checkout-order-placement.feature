Feature: Cloud of Goods checkout order placement

  @smoke
  Scenario: Open the Cloud of Goods staging home page
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed

  @checkout @product-cart
  Scenario: Add Lightweight Mobility Scooter to cart and open checkout
    Given I open the Cloud of Goods staging home page
    Then the Cloud of Goods home page should be displayed
    When I browse all product rentals
    Then the product rentals all page should be displayed
    And the Lightweight Mobility Scooter should be listed
    When I book the Lightweight Mobility Scooter
    Then the checkout page should be displayed
    And the checkout cart should contain the Lightweight Mobility Scooter
