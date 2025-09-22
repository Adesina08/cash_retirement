import { test, expect } from '@playwright/test';

test.describe('employee end-to-end flow', () => {
  test('employee requests and retires an advance', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'My Advances' })).toBeVisible();
    await page.getByRole('button', { name: 'New request' }).click();
    await page.getByLabel('Purpose').fill('E2E conference');
    await page.getByLabel('Project / Cost driver').fill('QA Summit');
    await page.getByLabel('Amount requested').fill('250');
    await page.getByLabel('Currency').fill('USD');
    await page.getByRole('button', { name: 'Submit for approval' }).click();
    await expect(page.getByText('Retire advance')).toBeVisible();
  });
});
