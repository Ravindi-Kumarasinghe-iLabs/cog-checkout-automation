import { expect, type Locator, type Page } from "@playwright/test";
import { getActiveTimeoutMs } from "../support/env";

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = "/"): Promise<void> {
    const response = await this.page.goto(path, { waitUntil: "domcontentloaded" });
    await this.expectSuccessfulPageLoad(response?.status());
    await this.closeKnownPopups();
  }

  async expectPageUrlContains(expectedText: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expectedText));
  }

  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async fillStable(locator: Locator, value: string): Promise<void> {
    await locator.fill("");
    await locator.fill(value);
    await expect(locator).toHaveValue(value);
  }

  async closeKnownPopups(): Promise<void> {
    const popupCloseButtons = [
      this.page.getByRole("button", { name: /close/i }),
      this.page.getByRole("button", { name: /no thanks/i }),
      this.page.getByRole("button", { name: /not now/i }),
      this.page.getByRole("button", { name: /accept/i }),
      this.page.getByRole("button", { name: /got it/i }),
      this.page.locator('[aria-label="Close"]').first(),
      this.page.locator(".cookie-policy button").filter({ hasText: /accept|close|ok/i }).first(),
      this.page.locator("#credential_picker_container iframe").first(),
    ];

    for (const closeButton of popupCloseButtons) {
      try {
        if (await closeButton.isVisible({ timeout: 1000 })) {
          await closeButton.click({ timeout: 1000 });
        }
      } catch {
        // Optional marketing/auth popups are best-effort cleanup.
      }
    }

    await this.dismissGoogleOneTap();
  }

  async expectNoServerError(): Promise<void> {
    const body = this.page.locator("body");
    await body.waitFor({
      state: "attached",
      timeout: getActiveTimeoutMs(),
    });

    const bodyText = await body
      .innerText({
        timeout: Math.min(getActiveTimeoutMs(), 30000),
      })
      .catch(() => "");

    expect(bodyText).not.toMatch(/\b(404|502|bad gateway)\b/i);
  }

  protected async expectSuccessfulPageLoad(status?: number): Promise<void> {
    if (status !== undefined) {
      expect(status).toBeLessThan(400);
    }

    await this.page.waitForLoadState("domcontentloaded", {
      timeout: getActiveTimeoutMs(),
    });

    await this.page.locator("body").waitFor({
      state: "attached",
      timeout: getActiveTimeoutMs(),
    });

    await this.expectNoServerError();
  }

  private async dismissGoogleOneTap(): Promise<void> {
    const googleOneTapFrame = this.page.frameLocator('iframe[title*="Sign in with Google"], iframe[src*="accounts.google.com"]');
    const googleCloseButton = googleOneTapFrame.locator('[aria-label="Close"], #close').first();

    try {
      if (await googleCloseButton.isVisible({ timeout: 1000 })) {
        await googleCloseButton.click({ timeout: 1000 });
      }
    } catch {
      // Google One Tap is cross-origin and may not expose a close button every time.
    }
  }
}
