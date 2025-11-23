import { test, expect } from '@playwright/test';

/**
 * Debug Test - Verify API calls work correctly
 * Check for console errors and confirm all API endpoints return 200
 */

test.describe('Debug API Calls', () => {
  let consoleErrors: string[] = [];

  test('Check for console errors and verify API calls', async ({ page }) => {
    // Collect console errors
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ Console error:', msg.text());
      }
    });

    // Track all network requests
    const apiCalls: Array<{ url: string; status: number }> = [];
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('/backgrounds/')) {
        apiCalls.push({
          url,
          status: response.status()
        });
        console.log(`${response.status()} - ${url}`);
      }
    });

    // Load the page
    await page.goto('http://localhost:5173/sacredlockscreen/');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/debug-api.png', fullPage: true });

    // Check for console errors
    console.log('\n=== CONSOLE ERRORS ===');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.log(`  - ${err}`));
      console.log(`\nTotal console errors: ${consoleErrors.length}`);
    } else {
      console.log('✅ No console errors');
    }

    // Check API calls
    console.log('\n=== API CALLS ===');
    apiCalls.forEach(call => {
      const status = call.status === 200 ? '✅' : '❌';
      console.log(`${status} ${call.status} - ${call.url}`);
    });

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);

    // Verify all API calls were successful
    const failedCalls = apiCalls.filter(c => c.status !== 200);
    if (failedCalls.length > 0) {
      console.log('\n❌ FAILED API CALLS:');
      failedCalls.forEach(call => console.log(`  ${call.status} - ${call.url}`));
    }
    expect(failedCalls).toHaveLength(0);

    console.log('\n✅ SUCCESS: All API calls working correctly!');
  });
});
