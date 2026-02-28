import { expect, test } from '@playwright/test';
import { loginAsDemoUser, registerApiMocks } from './support/mockApi';

test.beforeEach(async ({ page }) => {
  await registerApiMocks(page);
  await loginAsDemoUser(page);
});

test('navigates between metrics, services topology, and logs', async ({ page }) => {
  await page.getByRole('menuitem', { name: 'Metrics' }).click();
  await expect(page).toHaveURL(/\/metrics$/);
  await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible();
  await expect(page.getByText('12,500')).toBeVisible();

  await page.getByRole('menuitem', { name: 'Services' }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
  await page.getByRole('tab', { name: /Topology/i }).click();
  await expect(page).toHaveURL(/\/services\?tab=topology$/);
  await expect(page.getByText('Critical Service Risks')).toBeVisible();
  await expect(page.getByRole('button', { name: /payments Risk/i })).toBeVisible();
  await expect(page.getByText('Dependency Contracts')).toBeVisible();

  const commandPaletteInput = page.getByTestId('command-palette-input');

  await page.evaluate(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  });
  await expect(commandPaletteInput).toBeVisible();
  await commandPaletteInput.fill('logs');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/logs$/);
  await expect(page.getByRole('heading', { name: 'Logs' })).toBeVisible();
  await expect(page.getByText('Log Explorer')).toBeVisible();
  await expect(page.getByText('payment timeout while charging card')).toBeVisible();
});
