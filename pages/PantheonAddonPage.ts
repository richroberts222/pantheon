import { Page, Frame } from '@playwright/test';
import testData from '../data/testData.json';

const ADDON_IFRAME = 'iframe[src*="addons.gsuite.google.com"]';

export class PantheonAddonPage {
  constructor(private page: Page) {}

  async getRealFrame(): Promise<Frame> {
    await this.page.waitForSelector(ADDON_IFRAME);
    const handle = await this.page.$(ADDON_IFRAME);

    for (let i = 0; i < 25; i++) {
      const frame = await handle?.contentFrame();
      if (frame) return frame;
      await this.page.waitForTimeout(300);
    }

    throw new Error("Pantheon iframe never resolved");
  }

  async clickAllowAccess() {
    const frame = await this.getRealFrame();
    await frame
      .locator(`img[alt="${testData.selectors.allowAccessAlt}"]`)
      .waitFor({ state: 'visible' });

    await frame.locator(`img[alt="${testData.selectors.allowAccessAlt}"]`).click();
  }

  async clickRefresh() {
    const frame = await this.getRealFrame();
    const refresh = frame.locator(`img[alt="${testData.selectors.refreshAlt}"]`).first();
    await refresh.waitFor({ state: 'visible', timeout: 10000 });
    await refresh.click();

    await this.page.waitForTimeout(1500);
  }

  async clickConnectToPlayground() {
    const frame = await this.getRealFrame();

    const connect = frame
      .locator(`img[alt="${testData.selectors.connectToPlaygroundAlt}"]`)
      .first();

    await connect.waitFor({ state: 'visible', timeout: 15000 });
    await connect.click();

    await this.page.waitForTimeout(1500);
  }

  async clickGoToPlayground() {
    const frame = await this.getRealFrame();

    const go = frame
      .locator(`img[alt="${testData.selectors.goToPlaygroundAlt}"]`)
      .first();

    await go.waitFor({ state: 'visible', timeout: 15000 });
    await go.click();

    await this.page.waitForTimeout(2500);
  }

  async clickPublish() {
    const frame = await this.getRealFrame();

    const publish = frame
      .locator(`button[aria-label="${testData.selectors.publishAria}"]`)
      .first();

    await publish.waitFor({ state: 'visible', timeout: 15000 });
    await publish.click();
  }
}
