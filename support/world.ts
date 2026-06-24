import { setWorldConstructor, World, type IWorldOptions } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "playwright";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  selectedEndDate?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
