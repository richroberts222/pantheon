import { expect } from '@playwright/test';
import { test } from '../fixtures/testSetup';
import testData from '../data/testData.json';

test.only('Pantheon Publish Flow', async ({ page, docs, addon, modals, context }) => {

  await page.goto(testData.urls.googleDocCreate);

  await docs.openPantheonTab();
  await addon.clickAllowAccess();
  await modals.allowFileAccess();

  await docs.typeBodyText();
  await docs.renameDocument();

  await addon.clickRefresh();
  await addon.clickConnectToPlayground();
  await addon.clickGoToPlayground();

  const popupPromise = page.waitForEvent('popup');
  await addon.clickPublish();

  const popup = await popupPromise;

  await popup.locator('button.pds-button', { hasText: testData.publishPopup.publishButtonText }).click();
  await popup.getByRole('button', { name: testData.publishPopup.viewLiveText }).click();

  await page.waitForTimeout(1500);

  const livePages = context.pages();
  const livePage = livePages[livePages.length - 1];

  await expect(livePage.getByText(testData.pantheon.bodyText)).toBeVisible();
});
