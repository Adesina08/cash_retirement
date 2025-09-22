import { test, expect } from '@playwright/test';

test('manager views awaiting approvals', async ({ page }) => {
  await page.goto('/advances');
  await page.getByRole('button', { name: 'Switch role' }).click();
  await expect(page.getByText('Awaiting My Action')).toBeVisible();
});
