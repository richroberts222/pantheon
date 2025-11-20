import { test, chromium } from '@playwright/test';
import path from 'path';

test('Setup Google Profile + Add-on using REAL Chrome Profile', async () => {

  // Copy Your Real Chrome Profile to Root of the Project.
  // Your actual Chrome Profile is lets say called 'Default'
  // So the folder structure is: <projectRoot>/real-chrome-profile/Default
  // You copied your real 'Default' Chrome Profile into the project itself
  const realProfilePath = path.resolve('./real-chrome-profile');

  console.log("Using REAL Chrome profile at:", realProfilePath);

  const context = await chromium.launchPersistentContext(realProfilePath, {
    headless: false,
    channel: 'chrome',
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = context.pages()[0] || await context.newPage();

 /*
  Browser launched with your REAL Chrome profile.
  1. Go to https://docs.google.com
  2. Manually input Authentication Credentials
  3. Navigate to: https://workspace.google.com/marketplace/app/content_publisher/432998952749
  4. Ensure the add-on is installed
  5. Open a blank Google Doc & verify "Extensions → Content Publisher"
  6. When finished, press 'Resume' in Playwright Inspector.
  7. At this time all the Browser Cookies, etc...will be saved to a JSON file
  */

  await page.pause(); //<--- DO NOT REMOVE THIS PAUSE --- It is necessary for Manual Intervention before writing the storageState

  // Save cookies + localStorage for future automation
  await context.storageState({ path: 'google-auth-with-addon.json' });
  console.log('Saved state to google-auth-with-addon.json');

  await context.close();
});
