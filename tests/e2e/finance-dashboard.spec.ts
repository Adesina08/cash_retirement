import { test, expect } from '@playwright/test';

test('finance dashboard shows aging cards', async ({ page }) => {
  await page.goto('/finance');
  await expect(page.getByText('Outstanding advances')).toBeVisible();
  await expect(page.getByText('Aging buckets')).toBeVisible();
});
