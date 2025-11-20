import { Page } from '@playwright/test';
import testData from '../data/testData.json';

const BODY_AREA = '.kix-page-paginated';
const TITLE_INPUT = 'input.docs-title-input';

export class GoogleDocsPage {
  constructor(private page: Page) {}

  async openPantheonTab() {
    await this.page.getByRole('tab', { name: 'Pantheon' }).click();
  }

  async typeBodyText(text: string = testData.pantheon.bodyText) {
    await this.page.waitForSelector(BODY_AREA);
    await this.page.click(BODY_AREA, { force: true });
    await this.page.type(BODY_AREA, text, { delay: 30 });
  }

  async renameDocument(name: string = testData.pantheon.documentTitle) {
    const input = this.page.locator(TITLE_INPUT);
    await input.click();
    await input.fill(name);
    await input.press('Enter');
  }
}
