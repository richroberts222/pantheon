import { Page } from '@playwright/test';
import testData from '../data/testData.json';

export class PermissionModalsPage {
  constructor(private page: Page) {}

  async allowFileAccess() {
    const modal = this.page.locator('div.request-file-scope-modal[aria-modal="true"]');
    const allowBtn = modal.getByRole('button', { name: testData.modalText.allowButton });

    await modal.waitFor({ state: 'visible' });
    await allowBtn.click({ force: true });
  }

  async allowPantheonAccess() {
    const dialog = this.page
      .getByRole('dialog')
      .filter({ hasText: testData.modalText.pantheonDialogText });

    const allowBtn = dialog.getByRole('button', {
      name: testData.modalText.allowButton
    });

    await dialog.waitFor({ state: 'visible' });
    await allowBtn.click();
  }
}
