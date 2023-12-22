import { expect, type Locator, type Page } from '@playwright/test';

export class NegativeArea {
  readonly page: Page;
  readonly area: Locator;

  constructor(page: Page) {
    this.page = page;
    this.area = this.page.locator('.negative-area');
  }

  async expectVisible() {
    await expect(this.area).toHaveCount(2);
  }

  async expectHidden() {
    await expect(this.area).toHaveCount(0);
  }
}
