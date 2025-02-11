import { test, expect } from 'playwright-test-coverage';

test('about page', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('main')).toContainText('The secret sauce');
  await expect(page.getByRole('main').getByRole('img').first()).toBeVisible();
});

test('history page', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('main').getByRole('img')).toBeVisible();
});

test('404 page', async ({ page }) => {
  await page.goto('http://localhost:5173/badpage');
  await expect(page.getByRole('heading')).toContainText('Oops');
  await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor. Please try another page.');
});

test('docs page', async ({ page }) => {
  await page.goto('http://localhost:5173/docs');
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');
});