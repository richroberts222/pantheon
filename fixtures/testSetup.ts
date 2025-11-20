import { test as base, chromium, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { GoogleDocsPage } from '../pages/GoogleDocsPage';
import { PantheonAddonPage } from '../pages/PantheonAddonPage';
import { PermissionModalsPage } from '../pages/PermissionModalsPage';

type Fixtures = {
  context: BrowserContext;
  page: Page;
  docs: GoogleDocsPage;
  addon: PantheonAddonPage;
  modals: PermissionModalsPage;
};

export const test = base.extend<Fixtures>({
  context: async ({}, use) => {
    const realProfilePath = path.resolve('./real-chrome-profile');

    const context = await chromium.launchPersistentContext(realProfilePath, {
      headless: false,
      channel: 'chrome',
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    });

    const pages = context.pages();
    for (let i = 1; i < pages.length; i++) await pages[i].close();

    await use(context);

    await context.close();
  },

  page: async ({ context }, use) => {
    const page = context.pages()[0];
    await use(page);
  },

  docs: async ({ page }, use) => {
    const docs = new GoogleDocsPage(page);
    await use(docs);
  },

  addon: async ({ page }, use) => {
    const addon = new PantheonAddonPage(page);
    await use(addon);
  },

  modals: async ({ page }, use) => {
    const modals = new PermissionModalsPage(page);
    await use(modals);
  },
});
