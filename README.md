# CoG Checkout Automation

Automated checkout flow tests for the Cloud of Goods staging site.

This project uses:

- Playwright for browser automation
- Cucumber for BDD feature files and step definitions
- TypeScript for page objects, hooks, and support code
- BrowserStack for remote desktop browser execution

## Test Site

```text
https://cog-stg.incubatelabs.com
```

## Prerequisites

Install these before setting up the project:

- Git
- Node.js LTS
- npm
- Google Chrome, optional for local viewing
- BrowserStack account, only needed for BrowserStack runs

Check Node and npm:

```cmd
node -v
npm -v
```

## Clone The Project

```cmd
git clone https://github.com/Ravindi-Kumarasinghe-iLabs/cog-checkout-automation.git
cd "cog-checkout-automation"
```

If your local folder name is different, open CMD inside that project folder.

## Install Dependencies

```cmd
npm install
```

Install Playwright browsers:

```cmd
npx playwright install
```

## Environment Setup

Create a local `.env` file by copying `.env.example`.

```cmd
copy .env.example .env
```

Recommended `.env` values:

```env
BASE_URL=https://cog-stg.incubatelabs.com
BROWSER=chromium
HEADLESS=false
DEFAULT_TIMEOUT_MS=600000
BROWSERSTACK_TIMEOUT_MS=900000
TEST_ENV=local

BROWSERSTACK_BUILD_NAME=COG Checkout Automation
BROWSERSTACK_PROJECT_NAME=Cloud of Goods Checkout
```

Do not commit `.env`. It is ignored by Git.

## BrowserStack Credentials

BrowserStack credentials can be saved in Windows environment variables:

```cmd
setx BROWSERSTACK_USERNAME "your_browserstack_username"
setx BROWSERSTACK_ACCESS_KEY "your_browserstack_access_key"
```

Close and reopen CMD after running `setx`.

Check that the username is available:

```cmd
echo %BROWSERSTACK_USERNAME%
```

Check that the access key exists without printing it:

```cmd
if defined BROWSERSTACK_ACCESS_KEY (echo BROWSERSTACK_ACCESS_KEY is set) else (echo BROWSERSTACK_ACCESS_KEY is NOT set)
```

## Project Structure

```text
features/
  checkout/
    checkout-order-placement.feature
pages/
  BasePage.ts
  HomePage.ts
  ProductPage.ts
  CartPage.ts
  CheckoutPage.ts
  PaymentPage.ts
  OrderConfirmationPage.ts
steps/
  checkout.steps.ts
support/
  env.ts
  hooks.ts
  world.ts
utils/
  browserStackCaps.ts
test-data/
reports/
```

## Main Test Cases

- `CHECKOUT-BASE-001` opens checkout with Lightweight Mobility Scooter in the cart
- `DA-001` selects a valid locality delivery address
- `DA-002` selects a valid airport delivery address
- `DA-003` selects a valid attraction place delivery address
- `DA-004` selects a valid blacklisted hotel delivery address

## Useful Validation Commands

TypeScript check:

```cmd
npm run typecheck
```

Cucumber dry run:

```cmd
npm run test:dry-run
```

## Local Test Commands

Run the product cart base test in all local headed browsers:

```cmd
npm run test:product-cart:all-headed
```

Run DA-001 in all local headed browsers:

```cmd
npm run test:locality-delivery-address:all-headed
```

Run DA-002 in all local headed browsers:

```cmd
npm run test:airport-delivery-address:all-headed
```

Run DA-003 in all local headed browsers:

```cmd
npm run test:attraction-delivery-address:all-headed
```

Run DA-004 in all local headed browsers:

```cmd
npm run test:blacklisted-hotel-delivery-address:all-headed
```

Run all delivery address tests in all local headed browsers:

```cmd
npm run test:delivery-addresses:all-headed
```

## Single Browser Local Commands

Chrome desktop:

```cmd
npm run test:airport-delivery-address:chrome-desktop
```

Chrome mobile:

```cmd
npm run test:airport-delivery-address:chrome-mobile
```

Safari desktop, using Playwright WebKit:

```cmd
npm run test:airport-delivery-address:safari-desktop
```

Safari mobile, using Playwright WebKit mobile profile:

```cmd
npm run test:airport-delivery-address:safari-mobile
```

Replace `airport-delivery-address` with:

```text
locality-delivery-address
attraction-delivery-address
blacklisted-hotel-delivery-address
```

## BrowserStack Test Commands

For now, BrowserStack runs are desktop only:

- Chrome desktop
- Safari desktop

Run DA-001 on BrowserStack:

```cmd
npm run test:locality-delivery-address:bs:all
```

Run DA-002 on BrowserStack:

```cmd
npm run test:airport-delivery-address:bs:all
```

Run DA-003 on BrowserStack:

```cmd
npm run test:attraction-delivery-address:bs:all
```

Run DA-004 on BrowserStack:

```cmd
npm run test:blacklisted-hotel-delivery-address:bs:all
```

Run all delivery address tests on BrowserStack:

```cmd
npm run test:delivery-addresses:bs:all
```

Single BrowserStack examples:

```cmd
npm run test:blacklisted-hotel-delivery-address:bs:chrome-desktop
npm run test:blacklisted-hotel-delivery-address:bs:safari-desktop
```

## Reports

Cucumber reports are generated in:

```text
reports/
```

The default report files are:

```text
reports/cucumber-report.html
reports/cucumber-report.json
```

## Branch And Commit Workflow

Create a feature branch:

```cmd
git checkout main
git pull origin main
git checkout -b feature/ravindi/your-feature-name
```

Commit changes:

```cmd
git status
git add .
git commit -m "Add meaningful commit message"
```

Push the feature branch:

```cmd
git push -u origin feature/ravindi/your-feature-name
```

Open a pull request into `main`.

## Notes

- `.env` is ignored by Git and should not be pushed.
- `.env.example` is committed so other people know which variables are needed.
- BrowserStack mobile runs are not enabled in the npm scripts because the current BrowserStack plan may not support real mobile devices.
- Local Safari tests use Playwright WebKit, which is the closest local automation equivalent to Safari.
