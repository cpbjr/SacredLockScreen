import { test, expect } from '@playwright/test';

/**
 * Comprehensive Production Verification Test
 * Purpose: Verify ALL functionality works after fix including Preview & Adjust
 * Expected: All tests PASS with no console errors or network failures
 */

test.describe('Sacred Lock Screen - Production Verification (After Fix)', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Collect console errors
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ Console error:', msg.text());
      }
    });

    // Visit production site
    await page.goto('https://whitepine-tech.com/sacredlockscreen/');
    await page.waitForLoadState('networkidle');
  });

  test('Test 1: Initial Load - No console errors', async ({ page }) => {
    await page.screenshot({ path: 'test-results/1-initial-load.png', fullPage: true });

    expect(consoleErrors).toHaveLength(0);
    console.log('✓ No console errors on initial load');
  });

  test('Test 2: Background Selection - All thumbnails load', async ({ page }) => {
    // Wait for background section
    const backgroundSection = page.locator('text=Step 2: Choose Background');
    await expect(backgroundSection).toBeVisible();

    // Get all background images
    const backgroundImages = page.locator('img[alt*="bg-"]');
    const imageCount = await backgroundImages.count();
    console.log(`Found ${imageCount} background images`);
    expect(imageCount).toBe(5);

    // Check each background image has correct src (NO double prefix)
    for (let i = 0; i < imageCount; i++) {
      const img = backgroundImages.nth(i);
      const src = await img.getAttribute('src');
      console.log(`Background ${i + 1} src:`, src);

      // Should have single prefix, NOT double
      expect(src).toContain('/sacredlockscreen/backgrounds/');
      expect(src).not.toContain('/sacredlockscreen/sacredlockscreen/');

      // Verify image loaded successfully (naturalWidth > 0 means loaded)
      const isLoaded = await img.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
      expect(isLoaded).toBe(true);
      console.log(`✓ Background ${i + 1} loaded successfully`);
    }

    // Click first background to select it
    await backgroundImages.first().click();

    await page.screenshot({ path: 'test-results/2-backgrounds-working.png', fullPage: true });
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 3: Form Inputs - All fields present', async ({ page }) => {
    // Check all form elements exist (before generation)
    const verseTextarea = page.locator('textarea[placeholder*="verse"]');
    await expect(verseTextarea).toBeVisible();

    const referenceInput = page.locator('input[placeholder*="John"]');
    await expect(referenceInput).toBeVisible();

    const deviceSelect = page.locator('select').first();
    await expect(deviceSelect).toBeVisible();

    const generateButton = page.locator('button:has-text("Generate")');
    await expect(generateButton).toBeVisible();

    console.log('✓ All form inputs present');
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 4: Initial Generation - Image appears', async ({ page }) => {
    // Fill form
    await page.fill('textarea[placeholder*="verse"]',
      'For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life.');
    await page.fill('input[placeholder*="John"]', 'John 3:16');

    // Select background
    const backgroundImages = page.locator('img[alt*="bg-"]');
    await backgroundImages.first().click();

    await page.screenshot({ path: 'test-results/3-form-filled.png', fullPage: true });

    // Click Generate
    const generateButton = page.locator('button:has-text("Generate")');
    await generateButton.click();

    // Wait for preview to appear (max 15 seconds)
    const previewImage = page.locator('img[alt="Generated lock screen"]');
    await expect(previewImage).toBeVisible({ timeout: 15000 });

    // Verify image has base64 data
    const imgSrc = await previewImage.getAttribute('src');
    expect(imgSrc).toContain('data:image/png;base64,');
    console.log('✓ Initial generation successful');

    await page.screenshot({ path: 'test-results/4-initial-generation.png', fullPage: true });
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 5: Preview & Adjust - Font Size Increase', async ({ page }) => {
    // Generate initial image first
    await page.fill('textarea[placeholder*="verse"]', 'Be still and know that I am God');
    await page.fill('input[placeholder*="John"]', 'Psalm 46:10');
    const backgroundImages = page.locator('img[alt*="bg-"]');
    await backgroundImages.first().click();
    await page.locator('button:has-text("Generate")').click();
    await expect(page.locator('img[alt="Generated lock screen"]')).toBeVisible({ timeout: 15000 });

    // Get initial font size
    const fontSizeInput = page.locator('input[type="number"]');
    const initialSize = await fontSizeInput.inputValue();
    console.log('Initial font size:', initialSize);

    // Get initial image src
    const previewImage = page.locator('img[alt="Generated lock screen"]');
    const initialSrc = await previewImage.getAttribute('src');

    // Click + button
    const plusButton = page.locator('button', { has: page.locator('svg.lucide-plus') });
    await plusButton.click();

    // Wait for regeneration (image src should change)
    await expect(async () => {
      const newSrc = await previewImage.getAttribute('src');
      expect(newSrc).not.toBe(initialSrc);
    }).toPass({ timeout: 10000 });

    // Verify font size increased by 5
    const newSize = await fontSizeInput.inputValue();
    expect(parseInt(newSize)).toBe(parseInt(initialSize) + 5);
    console.log('✓ Font size increased to:', newSize);

    await page.screenshot({ path: 'test-results/5-font-size-increased.png', fullPage: true });
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 6: Preview & Adjust - Font Size Decrease', async ({ page }) => {
    // Generate initial image
    await page.fill('textarea[placeholder*="verse"]', 'The Lord is my shepherd');
    await page.fill('input[placeholder*="John"]', 'Psalm 23:1');
    const backgroundImages = page.locator('img[alt*="bg-"]');
    await backgroundImages.first().click();
    await page.locator('button:has-text("Generate")').click();
    await expect(page.locator('img[alt="Generated lock screen"]')).toBeVisible({ timeout: 15000 });

    const fontSizeInput = page.locator('input[type="number"]');
    const initialSize = await fontSizeInput.inputValue();
    const previewImage = page.locator('img[alt="Generated lock screen"]');
    const initialSrc = await previewImage.getAttribute('src');

    // Click - button twice
    const minusButton = page.locator('button', { has: page.locator('svg.lucide-minus') });
    await minusButton.click();
    await page.waitForTimeout(2000); // Wait for first regeneration
    await minusButton.click();

    // Wait for final regeneration
    await expect(async () => {
      const newSrc = await previewImage.getAttribute('src');
      expect(newSrc).not.toBe(initialSrc);
    }).toPass({ timeout: 10000 });

    // Verify font size decreased by 10 total
    const newSize = await fontSizeInput.inputValue();
    expect(parseInt(newSize)).toBe(parseInt(initialSize) - 10);
    console.log('✓ Font size decreased to:', newSize);

    await page.screenshot({ path: 'test-results/6-font-size-decreased.png', fullPage: true });
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 7: Preview & Adjust - Direct Font Size Input', async ({ page }) => {
    // Generate initial image
    await page.fill('textarea[placeholder*="verse"]', 'I can do all things through Christ');
    await page.fill('input[placeholder*="John"]', 'Philippians 4:13');
    const backgroundImages = page.locator('img[alt*="bg-"]');
    await backgroundImages.first().click();
    await page.locator('button:has-text("Generate")').click();
    await expect(page.locator('img[alt="Generated lock screen"]')).toBeVisible({ timeout: 15000 });

    const fontSizeInput = page.locator('input[type="number"]');
    const previewImage = page.locator('img[alt="Generated lock screen"]');
    const initialSrc = await previewImage.getAttribute('src');

    // Clear and type new font size
    await fontSizeInput.click();
    await fontSizeInput.press('Control+A');
    await fontSizeInput.type('90');
    await fontSizeInput.blur(); // Trigger change event

    // Wait for regeneration
    await expect(async () => {
      const newSrc = await previewImage.getAttribute('src');
      expect(newSrc).not.toBe(initialSrc);
    }).toPass({ timeout: 10000 });

    const newSize = await fontSizeInput.inputValue();
    expect(newSize).toBe('90');
    console.log('✓ Direct font size input works: 90px');

    await page.screenshot({ path: 'test-results/7-font-size-direct-input.png', fullPage: true });
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 8: Preview & Adjust - Font Family Change', async ({ page }) => {
    // Generate initial image
    await page.fill('textarea[placeholder*="verse"]', 'Love is patient, love is kind');
    await page.fill('input[placeholder*="John"]', '1 Corinthians 13:4');
    const backgroundImages = page.locator('img[alt*="bg-"]');
    await backgroundImages.first().click();
    await page.locator('button:has-text("Generate")').click();
    await expect(page.locator('img[alt="Generated lock screen"]')).toBeVisible({ timeout: 15000 });

    const previewImage = page.locator('img[alt="Generated lock screen"]');
    const initialSrc = await previewImage.getAttribute('src');

    // Change font
    const fontSelect = page.locator('select').nth(1); // Second select is font selector
    await fontSelect.selectOption('liberation-serif');

    // Wait for regeneration
    await expect(async () => {
      const newSrc = await previewImage.getAttribute('src');
      expect(newSrc).not.toBe(initialSrc);
    }).toPass({ timeout: 10000 });

    const selectedFont = await fontSelect.inputValue();
    expect(selectedFont).toBe('liberation-serif');
    console.log('✓ Font family changed to Liberation Serif');

    await page.screenshot({ path: 'test-results/8-font-family-changed.png', fullPage: true });
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 9: Preview & Adjust - Multiple Changes in Sequence', async ({ page }) => {
    // Generate initial image
    await page.fill('textarea[placeholder*="verse"]', 'Trust in the Lord with all your heart');
    await page.fill('input[placeholder*="John"]', 'Proverbs 3:5');
    const backgroundImages = page.locator('img[alt*="bg-"]');
    await backgroundImages.first().click();
    await page.locator('button:has-text("Generate")').click();
    await expect(page.locator('img[alt="Generated lock screen"]')).toBeVisible({ timeout: 15000 });

    const previewImage = page.locator('img[alt="Generated lock screen"]');
    let previousSrc = await previewImage.getAttribute('src');

    // Change 1: Font family
    const fontSelect = page.locator('select').nth(1);
    await fontSelect.selectOption('noto-serif');
    await page.waitForTimeout(2000);
    let newSrc = await previewImage.getAttribute('src');
    expect(newSrc).not.toBe(previousSrc);
    console.log('✓ Change 1: Font changed');
    previousSrc = newSrc;

    // Change 2: Increase size
    const plusButton = page.locator('button', { has: page.locator('svg.lucide-plus') });
    await plusButton.click();
    await page.waitForTimeout(2000);
    newSrc = await previewImage.getAttribute('src');
    expect(newSrc).not.toBe(previousSrc);
    console.log('✓ Change 2: Size increased');
    previousSrc = newSrc;

    // Change 3: Increase again
    await plusButton.click();
    await page.waitForTimeout(2000);
    newSrc = await previewImage.getAttribute('src');
    expect(newSrc).not.toBe(previousSrc);
    console.log('✓ Change 3: Size increased again');
    previousSrc = newSrc;

    // Change 4: Decrease once
    const minusButton = page.locator('button', { has: page.locator('svg.lucide-minus') });
    await minusButton.click();
    await page.waitForTimeout(2000);
    newSrc = await previewImage.getAttribute('src');
    expect(newSrc).not.toBe(previousSrc);
    console.log('✓ Change 4: Size decreased');

    await page.screenshot({ path: 'test-results/9-multiple-adjustments.png', fullPage: true });
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 10: Download Functionality', async ({ page }) => {
    // Generate image first
    await page.fill('textarea[placeholder*="verse"]', 'Rejoice in the Lord always');
    await page.fill('input[placeholder*="John"]', 'Philippians 4:4');
    const backgroundImages = page.locator('img[alt*="bg-"]');
    await backgroundImages.first().click();
    await page.locator('button:has-text("Generate")').click();
    await expect(page.locator('img[alt="Generated lock screen"]')).toBeVisible({ timeout: 15000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    const downloadButton = page.locator('button:has-text("Download")');
    await downloadButton.click();

    // Wait for download
    const download = await downloadPromise;
    const filename = download.suggestedFilename();

    expect(filename).toContain('sacred-lockscreen');
    expect(filename).toContain('.png');
    console.log('✓ Download initiated:', filename);

    await page.screenshot({ path: 'test-results/10-download-ready.png', fullPage: true });
    expect(consoleErrors).toHaveLength(0);
  });

  test('Test 11: Network Verification - All APIs work', async ({ page }) => {
    const apiCalls: Array<{ url: string; status: number; contentType: string }> = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('/backgrounds/')) {
        apiCalls.push({
          url,
          status: response.status(),
          contentType: response.headers()['content-type'] || ''
        });
      }
    });

    // Trigger all API calls
    await page.goto('https://whitepine-tech.com/sacredlockscreen/');
    await page.waitForLoadState('networkidle');

    // Fill and generate to trigger generate API
    await page.fill('textarea[placeholder*="verse"]', 'God is love');
    await page.fill('input[placeholder*="John"]', '1 John 4:8');
    const backgroundImages = page.locator('img[alt*="bg-"]');
    await backgroundImages.first().click();
    await page.locator('button:has-text("Generate")').click();
    await expect(page.locator('img[alt="Generated lock screen"]')).toBeVisible({ timeout: 15000 });

    // Verify all API calls succeeded
    console.log('\n=== API CALLS VERIFICATION ===');
    apiCalls.forEach(call => {
      console.log(`${call.status} - ${call.contentType} - ${call.url}`);

      // All should be 200
      expect(call.status).toBe(200);

      // No double prefix
      expect(call.url).not.toContain('/sacredlockscreen/sacredlockscreen/');
    });

    // Verify specific APIs were called
    const backgroundsAPI = apiCalls.find(c => c.url.includes('/api/backgrounds'));
    expect(backgroundsAPI).toBeDefined();
    expect(backgroundsAPI?.contentType).toContain('application/json');
    console.log('✓ Backgrounds API returned JSON');

    const presetsAPI = apiCalls.find(c => c.url.includes('/api/device-presets'));
    expect(presetsAPI).toBeDefined();
    expect(presetsAPI?.contentType).toContain('application/json');
    console.log('✓ Device Presets API returned JSON');

    const fontsAPI = apiCalls.find(c => c.url.includes('/api/fonts'));
    expect(fontsAPI).toBeDefined();
    expect(fontsAPI?.contentType).toContain('application/json');
    console.log('✓ Fonts API returned JSON');

    const generateAPI = apiCalls.find(c => c.url.includes('/api/generate'));
    expect(generateAPI).toBeDefined();
    expect(generateAPI?.contentType).toContain('application/json');
    console.log('✓ Generate API returned JSON');

    const bgImages = apiCalls.filter(c => c.url.includes('/backgrounds/bg-'));
    expect(bgImages.length).toBeGreaterThan(0);
    bgImages.forEach(bg => {
      expect(bg.contentType).toContain('image/');
    });
    console.log(`✓ ${bgImages.length} background images loaded with correct content-type`);

    expect(consoleErrors).toHaveLength(0);
    console.log('✓ No console errors throughout entire flow');
  });
});
