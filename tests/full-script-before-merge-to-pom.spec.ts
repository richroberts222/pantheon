import { test, chromium, expect, Frame } from '@playwright/test';
import path from 'path';

// TEST DATA
const TEST_NAME = 'Pantheon publish flow (correct order, double refresh, assert body)';
const DOC_CREATE_URL = 'https://docs.google.com/document/create';
const BODY_TEXT = 'Pantheon is Awesome!';
const DOCUMENT_TITLE = 'Pantheon Doc';

// ERROR MESSAGES
const ERR_IFRAME_AFTER_RENAME = 'Addon iframe did not load after rename';
const ERR_IFRAME_STABILIZATION = 'Add-on did not stabilize';
const ERR_FINAL_IFRAME_LOAD = 'Final Pantheon iframe did not load';
const ERR_PLAYGROUND_IFRAME = 'Playground iframe did not load';

// ENVIRONMENT / UI TEXT CONSTANTS
const CHROME_CONTROLLED_TEXT = 'Chrome is being controlled by automated test software';

const TAB_NAME_PANTHEON = 'Pantheon';

const ALT_ALLOW_ACCESS = 'Allow access';
const ALT_REFRESH = 'Refresh';
const ALT_CONNECT_TO_PLAYGROUND = 'Connect to playground';
const ALT_GO_TO_PLAYGROUND = 'Go to playground';

const ARIA_PUBLISH = 'PUBLISH';

const BUTTON_TEXT_ALLOW = 'Allow';
const TEXT_ALLOW_PANTHEON_DIALOG = 'Allow Pantheon to access this file';
const BTN_PUBLISH_TEXT = 'Publish';
const BTN_VIEW_LIVE_CONTENT = 'View Live Content';

const TEXT_EXPLORE_PLAYGROUND = 'Explore the playground collection';
const TEXT_ADD_SAMPLE_CONTENT = 'ADD SAMPLE CONTENT';

// SELECTORS
const ADDON_IFRAME_SELECTOR = 'iframe[src*="addons.gsuite.google.com"]';

// PAGE OBJECTS
test(TEST_NAME, async () => {
  const realProfilePath = path.resolve('./real-chrome-profile');

  const context = await chromium.launchPersistentContext(realProfilePath, {
    headless: false,
    channel: 'chrome',
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled']
  });

  const pages = context.pages();
  for (let i = 1; i < pages.length; i++) await pages[i].close();
  const page = pages[0];

  await page.goto(DOC_CREATE_URL);

  const DocsPage = {
    pantheonTab: page.getByRole('tab', { name: TAB_NAME_PANTHEON }),
    bodyArea: page.locator('.kix-page-paginated'),
    titleInput: page.locator('input.docs-title-input'),
  };

  const AddonFrameLocator = page.frameLocator(ADDON_IFRAME_SELECTOR);

  const AddonPanel = {
    allowAccessBtn: AddonFrameLocator.locator(`img[alt="${ALT_ALLOW_ACCESS}"]`),
    refreshBtn: AddonFrameLocator.locator(`img[alt="${ALT_REFRESH}"]`).first(),
    connectToPlaygroundBtn: AddonFrameLocator
      .locator(`img[alt="${ALT_CONNECT_TO_PLAYGROUND}"]`)
      .first(),
    goToPlaygroundBtn: AddonFrameLocator
      .locator(`img[alt="${ALT_GO_TO_PLAYGROUND}"]`)
      .first(),
    publishBtn: AddonFrameLocator.locator(`button[aria-label="${ARIA_PUBLISH}"]`),
  };

  const PermissionModals = {
    fileScopeModal: page.locator('div.request-file-scope-modal[aria-modal="true"]'),
    fileScopeAllowBtn: page
      .locator('div.request-file-scope-modal[aria-modal="true"]')
      .getByRole('button', { name: BUTTON_TEXT_ALLOW }),

    pantheonDialog: page
      .getByRole('dialog')
      .filter({ hasText: TEXT_ALLOW_PANTHEON_DIALOG }),

    pantheonDialogAllowBtn: page
      .getByRole('dialog')
      .filter({ hasText: TEXT_ALLOW_PANTHEON_DIALOG })
      .getByRole('button', { name: BUTTON_TEXT_ALLOW }),
  };

  const PublishPopup = {
    publishBtn: (popup: any) =>
      popup.locator('button.pds-button', { hasText: BTN_PUBLISH_TEXT }),
    viewLiveBtn: (popup: any) =>
      popup.getByRole('button', { name: BTN_VIEW_LIVE_CONTENT }),
  };

  // STEP 1 — OPEN PANTHEON TAB AND ALLOW ACCESS
  const pantheonTab = DocsPage.pantheonTab;
  const allowAccess = AddonPanel.allowAccessBtn;
  const fileScopeModal = PermissionModals.fileScopeModal;
  const fileScopeAllowBtn = PermissionModals.fileScopeAllowBtn;
  await pantheonTab.click();
  await allowAccess.waitFor({ state: 'visible' });
  await allowAccess.click();
  await fileScopeModal.waitFor({ state: 'visible' });
  await fileScopeAllowBtn.click({ force: true });

  // STEP 2 — TYPE INTO BODY
const bodyArea = DocsPage.bodyArea;
await page.waitForSelector('.kix-page-paginated');
await bodyArea.click({ force: true });
await page.type('.kix-page-paginated', BODY_TEXT, { delay: 30 });

  // STEP 3 — RENAME DOCUMENT
  const titleInput = DocsPage.titleInput;
  await titleInput.click();
  await titleInput.fill(DOCUMENT_TITLE);
  await titleInput.press('Enter');
  await page.waitForTimeout(400);

  // STEP 4 — REFRESH IN ADD-ON
  await page.waitForTimeout(1500);
  await page.waitForSelector(ADDON_IFRAME_SELECTOR, { timeout: 15000 });
  const iframeHandle = await page.$(ADDON_IFRAME_SELECTOR);
  let addonFrameReal: Frame | null = null;
  for (let i = 0; i < 20; i++) {
    addonFrameReal = (await iframeHandle?.contentFrame()) ?? null;
    if (addonFrameReal) break;
    await page.waitForTimeout(500);
  }
  if (!addonFrameReal) throw new Error(ERR_IFRAME_AFTER_RENAME);
  const refreshBtnActual = addonFrameReal.locator(`img[alt="${ALT_REFRESH}"]`).first();
  await refreshBtnActual.waitFor({ state: 'visible', timeout: 10000 });
  await refreshBtnActual.click();

  // STEP 5 — CONNECT TO PLAYGROUND
  const chromeBanner = page.getByText(CHROME_CONTROLLED_TEXT, { exact: false });
  await chromeBanner.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.waitForSelector(ADDON_IFRAME_SELECTOR, { timeout: 15000 });
  const iframeHandle2 = await page.$(ADDON_IFRAME_SELECTOR);
  let addonFrameAfterRefresh: Frame | null = null;
  for (let i = 0; i < 30; i++) {
    addonFrameAfterRefresh = (await iframeHandle2?.contentFrame()) ?? null;
    if (addonFrameAfterRefresh) {
      const hasConnect = await addonFrameAfterRefresh
        .locator(`img[alt="${ALT_CONNECT_TO_PLAYGROUND}"]`)
        .count();
      const hasSampleContent = await addonFrameAfterRefresh
        .locator(`text=${TEXT_ADD_SAMPLE_CONTENT}`)
        .count();
      if (hasConnect > 0 || hasSampleContent > 0) break;
    }
    await page.waitForTimeout(300);
  }
  if (!addonFrameAfterRefresh) throw new Error(ERR_IFRAME_STABILIZATION);
  await page.waitForTimeout(1500);
  await addonFrameAfterRefresh.waitForSelector(`text=${TEXT_EXPLORE_PLAYGROUND}`, {
    timeout: 15000,
  });
  const connectBtn = addonFrameAfterRefresh
    .locator(`img[alt="${ALT_CONNECT_TO_PLAYGROUND}"]`)
    .first();
  await connectBtn.waitFor({ state: 'visible', timeout: 15000 });
  await connectBtn.click();

  // STEP 6 — GO TO PLAYGROUND
  await page.waitForTimeout(2000);
  await page.waitForSelector(ADDON_IFRAME_SELECTOR, { timeout: 15000 });
  const iframeHandle3 = await page.$(ADDON_IFRAME_SELECTOR);
  let pantheonFinalFrame: Frame | null = null;
  for (let i = 0; i < 20; i++) {
    pantheonFinalFrame = (await iframeHandle3?.contentFrame()) ?? null;
    if (pantheonFinalFrame) break;
    await page.waitForTimeout(500);
  }
  if (!pantheonFinalFrame) throw new Error(ERR_FINAL_IFRAME_LOAD);
  const goToPlaygroundBtn = pantheonFinalFrame
    .locator(`img[alt="${ALT_GO_TO_PLAYGROUND}"]`)
    .first();
  await goToPlaygroundBtn.waitFor({ state: 'visible', timeout: 15000 });
  await goToPlaygroundBtn.click();

  // STEP 7 — PUBLISH
  await page.waitForTimeout(2500);
  await page.waitForSelector(ADDON_IFRAME_SELECTOR, { timeout: 15000 });
  const iframeHandle4 = await page.$(ADDON_IFRAME_SELECTOR);
  let pantheonPlaygroundFrame: Frame | null = null;
  for (let i = 0; i < 20; i++) {
    pantheonPlaygroundFrame = (await iframeHandle4?.contentFrame()) ?? null;
    if (pantheonPlaygroundFrame) break;
    await page.waitForTimeout(500);
  }
  if (!pantheonPlaygroundFrame) throw new Error(ERR_PLAYGROUND_IFRAME);
  const publishBtn = pantheonPlaygroundFrame.locator(
    `button[aria-label="${ARIA_PUBLISH}"]`
  );
  await publishBtn.waitFor({ state: 'visible', timeout: 15000 });
  const popupPromise = page.waitForEvent('popup');
  await publishBtn.click();
  const publishPopup = await popupPromise;
  const popupPublish = PublishPopup.publishBtn(publishPopup);
  await popupPublish.waitFor({ state: 'visible' });
  await popupPublish.click();
  const viewLive = PublishPopup.viewLiveBtn(publishPopup);
  await viewLive.waitFor({ state: 'visible', timeout: 7000 });
  await viewLive.click();

  // STEP 8 — ASSERT CONTENT ON LIVE PAGE
  await page.waitForTimeout(1500);
  const pagesAfter = context.pages();
  const livePage = pagesAfter[pagesAfter.length - 1];
  await expect(livePage.getByText(BODY_TEXT)).toBeVisible();

  await page.pause();
  await context.close();
});
