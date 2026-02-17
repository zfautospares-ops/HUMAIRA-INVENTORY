import { test, expect } from '@playwright/test';

test('react app functional test', async ({ page }) => {
    // Capture console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto('http://localhost:5173');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('MH TOWING');

    // Type start location
    const startInput = page.locator('#start-input');
    await startInput.fill('Durban');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Type end location
    const endInput = page.locator('#end-input');
    await endInput.fill('Pinetown');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Click Calculate
    const calcBtn = page.getByRole('button', { name: 'Generate Route' });
    await calcBtn.click();

    // Wait for results
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'diagnostic_check.png', fullPage: true });

    // Check if Total Cost is visible
    const totalCost = page.locator('h2').filter({ hasText: /R/ });
    const count = await totalCost.count();
    console.log(`Found ${count} h2 with R`);
});
