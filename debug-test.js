const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));

  // Listen for page errors
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  // Go to the app
  await page.goto('http://localhost:5173');

  // Wait a bit for the page to load
  await page.waitForTimeout(2000);

  // Fill in the form
  await page.fill('textarea', 'For God so loved the world that he gave his one and only Son');
  await page.fill('input[type="text"]', 'John 3:16');

  // Select a background (click the first one)
  await page.click('button[class*="aspect-[9/16]"]');

  // Click Generate Image button
  console.log('Clicking Generate Image button...');
  await page.click('button:has-text("Generate Image")');

  // Wait and see what happens
  await page.waitForTimeout(5000);

  console.log('Test complete. Browser will stay open for inspection.');
})();
