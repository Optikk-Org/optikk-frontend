import { expect, test } from '@playwright/test';
import { loginAsDemoUser, registerApiMocks } from './support/mockApi';

test.beforeEach(async ({ page }) => {
  await registerApiMocks(page);
  await loginAsDemoUser(page);
});

test('updates profile, toggles theme, and logs out', async ({ page }) => {
  await page.getByTestId('sidebar-settings').click();

  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  await page.getByPlaceholder('Your name').fill('Aditi Platform');
  await page.getByTestId('settings-save-profile').click();
  await expect(page.getByText('Profile updated successfully')).toBeVisible();
  await expect(page.getByText('Aditi Platform')).toBeVisible();

  await page.getByRole('tab', { name: /Preferences/i }).click();
  await page.getByTestId('settings-theme-switch').click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('optikk_theme')))
    .toBe('light');

  await page.getByTestId('sidebar-logout').click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('optikk_auth_token')))
    .toBeNull();
});
