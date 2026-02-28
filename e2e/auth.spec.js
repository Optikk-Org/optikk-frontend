import { expect, test } from '@playwright/test';
import { loginAsDemoUser, registerApiMocks } from './support/mockApi';

test.beforeEach(async ({ page }) => {
  await registerApiMocks(page);
});

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/metrics');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Welcome back')).toBeVisible();
});

test('logs in and loads the overview workspace shell', async ({ page }) => {
  await loginAsDemoUser(page);

  await expect(page).toHaveURL(/\/overview$/);
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  await expect(page.locator('.sidebar-context-team')).toHaveText('Platform Core');
  await expect(page.getByText('Total Requests')).toBeVisible();
  await expect(page.getByText('12.5K')).toBeVisible();
  await expect(page.getByText('Payments error budget burn')).toBeVisible();

  const authToken = await page.evaluate(() => localStorage.getItem('optikk_auth_token'));
  const teamId = await page.evaluate(() => localStorage.getItem('optikk_team_id'));
  expect(authToken).toBe('demo-token');
  expect(teamId).toBe('101');
});
