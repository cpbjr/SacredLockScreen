import { test, expect } from '@playwright/test';

/**
 * Production Diagnostic Test
 * Purpose: Document the CURRENT broken state before applying fix
 * Expected: This test should FAIL and show double-prefixed URLs
 */

test.describe('Sacred Lock Screen - Production Diagnostic (Before Fix)', () => {
  test('should document broken background images and double-prefix bug', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Collect failed network requests
    const failedRequests: Array<{ url: string; status: number }> = [];
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // Visit production site
    await page.goto('https://whitepine-tech.com/sacredlockscreen/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Extra wait for any async operations

    // Take screenshot of broken state
    await page.screenshot({
      path: 'test-results/before-fix-broken-backgrounds.png',
      fullPage: true
    });

    // Check background section
    const backgroundSection = page.locator('text=Step 2: Choose Background');
    await expect(backgroundSection).toBeVisible();

    // Get all background images
    const backgroundImages = page.locator('img[alt*="bg-"]');
    const imageCount = await backgroundImages.count();
    console.log(`Found ${imageCount} background images`);

    // Check each background image src attribute
    const imageSrcs: string[] = [];
    for (let i = 0; i < imageCount; i++) {
      const img = backgroundImages.nth(i);
      const src = await img.getAttribute('src');
      if (src) {
        imageSrcs.push(src);
        console.log(`Background ${i + 1} src:`, src);

        // Check for double prefix bug
        if (src.includes('/sacredlockscreen/sacredlockscreen/')) {
          console.log(`❌ DOUBLE PREFIX BUG DETECTED in image ${i + 1}:`, src);
        }
      }
    }

    // Attempt to fill form
    await page.fill('textarea[placeholder*="verse"]', 'For God so loved the world');
    await page.fill('input[placeholder*="John"]', 'John 3:16');

    // Try to select a background (might not work if images broken)
    try {
      const firstBg = backgroundImages.first();
      await firstBg.click({ timeout: 2000 });
    } catch (e) {
      console.log('Could not click background (expected if images broken)');
    }

    // Try to click Generate button
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(3000);
    }

    // Final screenshot
    await page.screenshot({
      path: 'test-results/before-fix-after-generate-attempt.png',
      fullPage: true
    });

    // Report findings
    console.log('\n=== DIAGNOSTIC RESULTS ===');
    console.log('Console Errors:', consoleErrors.length);
    consoleErrors.forEach(err => console.log('  -', err));

    console.log('\nFailed Requests:', failedRequests.length);
    failedRequests.forEach(req => console.log(`  - ${req.status}: ${req.url}`));

    console.log('\nImage Sources:');
    imageSrcs.forEach((src, i) => {
      const hasDoublePrefixBug = src.includes('/sacredlockscreen/sacredlockscreen/');
      console.log(`  ${i + 1}. ${src} ${hasDoublePrefixBug ? '❌ DOUBLE PREFIX' : '✓'}`);
    });

    // This test is expected to document failures - we won't make it fail
    // but we will log all the issues found
    expect(consoleErrors.length).toBeGreaterThan(0); // We EXPECT errors in broken state
  });
});
