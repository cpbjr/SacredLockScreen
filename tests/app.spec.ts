import { test, expect } from '@playwright/test';

test.describe('Sacred Lock Screens', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main page with header and form', async ({ page }) => {
    // Check header
    await expect(page.locator('h1')).toContainText('Sacred Lock Screens');

    // Check hero text
    await expect(page.locator('h2')).toContainText('Create Beautiful Scripture Lock Screens');

    // Check form sections exist
    await expect(page.getByText('Step 1: Enter Your Verse')).toBeVisible();
    await expect(page.getByText('Step 2: Choose Background')).toBeVisible();
    await expect(page.getByText('Step 3: Screen Size')).toBeVisible();
  });

  test('should load backgrounds from API', async ({ page }) => {
    // Wait for backgrounds to load
    await page.waitForSelector('button img', { timeout: 10000 });

    // Check that background thumbnails are displayed
    const backgrounds = page.locator('button img');
    const count = await backgrounds.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show character counter', async ({ page }) => {
    const textarea = page.getByPlaceholder('Enter your Bible verse here...');
    await textarea.fill('Test verse');

    // Check character counter updates
    await expect(page.getByText('10/500 characters')).toBeVisible();
  });

  test('should disable generate button when verse too short', async ({ page }) => {
    const textarea = page.getByPlaceholder('Enter your Bible verse here...');
    await textarea.fill('Short');

    const generateButton = page.getByRole('button', { name: 'Generate Image' });
    await expect(generateButton).toBeDisabled();
  });

  test('should enable generate button with valid verse', async ({ page }) => {
    const textarea = page.getByPlaceholder('Enter your Bible verse here...');
    await textarea.fill('For God so loved the world that he gave his one and only Son.');

    const generateButton = page.getByRole('button', { name: 'Generate Image' });
    await expect(generateButton).toBeEnabled();
  });

  test('should select a background', async ({ page }) => {
    // Wait for backgrounds to load
    await page.waitForSelector('button img', { timeout: 10000 });

    // Click on the second background
    const backgrounds = page.locator('button:has(img)');
    const secondBg = backgrounds.nth(1);
    await secondBg.click();

    // Check it has the selected styling (checkmark visible)
    await expect(secondBg.locator('div:has-text("✓")')).toBeVisible();
  });

  test('should generate an image successfully', async ({ page }) => {
    // Fill in verse
    const textarea = page.getByPlaceholder('Enter your Bible verse here...');
    await textarea.fill('For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.');

    // Fill in reference
    const referenceInput = page.getByPlaceholder('e.g., John 3:16');
    await referenceInput.fill('John 3:16');

    // Click generate
    const generateButton = page.getByRole('button', { name: 'Generate Image' });
    await generateButton.click();

    // Wait for loading to complete (may take a few seconds due to AI call)
    await expect(page.getByText('Generating...')).toBeVisible();

    // Wait for the preview section to appear
    await expect(page.getByText('Preview & Adjust')).toBeVisible({ timeout: 30000 });

    // Check that the generated image is displayed
    const previewImage = page.locator('img[alt="Generated lock screen"]');
    await expect(previewImage).toBeVisible();

    // Check that download and regenerate buttons appear
    await expect(page.getByRole('button', { name: /Download/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Regenerate/ })).toBeVisible();
  });

  test('should have font size adjustment controls after generation', async ({ page }) => {
    // Generate an image first
    const textarea = page.getByPlaceholder('Enter your Bible verse here...');
    await textarea.fill('The Lord is my shepherd; I shall not want.');

    const referenceInput = page.getByPlaceholder('e.g., John 3:16');
    await referenceInput.fill('Psalm 23:1');

    const generateButton = page.getByRole('button', { name: 'Generate Image' });
    await generateButton.click();

    // Wait for preview
    await expect(page.getByText('Preview & Adjust')).toBeVisible({ timeout: 30000 });

    // Check font size controls exist
    const minusButton = page.locator('button').filter({ has: page.locator('svg.lucide-minus') });
    const plusButton = page.locator('button').filter({ has: page.locator('svg.lucide-plus') });

    await expect(minusButton).toBeVisible();
    await expect(plusButton).toBeVisible();

    // Check initial adjustment is 0%
    await expect(page.getByText('+0%')).toBeVisible();
  });
});
