import { test, expect } from 'playwright-test-coverage';

test('admin dashboard shows up for admin', async ({ page }) => {
  // mock admin login endpoint
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'a@jwt.com', password: 'admin' };
    const loginRes = { user: { id: 1, name: 'Admin User', email: 'a@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Admin');
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Ricci\'s kitchen');
  await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
});

test('admin dashboard functionality', async ({ page }) => {
  // mock admin login endpoint
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'a@jwt.com', password: 'admin' };
    const loginRes = { user: { id: 1, name: 'Admin User', email: 'a@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  // mock initial get franchises endpoint
  await page.route('*/**/api/franchise', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: [] });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('button', { name: 'Add Franchise' }).click();

  // mock create franchise endpoint
  await page.unroute('*/**/api/franchise');
  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'POST') {
      expect(route.request().method()).toBe('POST');
      const createFranchiseReq = {
        "stores": [],
        "id": "",
        "name": "Test Franchise",
        "admins": [
          {
            "email": "f@jwt.com"
          }
        ]
      }

      expect(route.request().postDataJSON()).toMatchObject(createFranchiseReq);
      await route.fulfill({ json: { name: 'Test Franchise', admins: [{ email: 'f@jwt.com', id: 4, name: 'pizza franchisee' }], id: 1 }});
    }

    if (route.request().method() === 'GET') {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: [{ id: 1, name: 'Test Franchise', admins: [{ id: 4, name: 'pizza franchisee', email: 'f@jwt.com' }], stores: [{id: 1, name: "SLC", totalRevenue: 0}] }] });
    }
  });

  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('Test Franchise');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');

  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('table')).toContainText('Test Franchise');

  // mock close store endpoint
  await page.route('*/**/api/franchise/*/store/*', async (route) => {
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: { message: "store deleted" } });
  });
 
  // mock get franchises with no store
  await page.unroute('*/**/api/franchise');
  await page.route('*/**/api/franchise', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: [{ id: 1, name: 'Test Franchise', admins: [{ id: 4, name: 'pizza franchisee', email: 'f@jwt.com' }], stores: [] }] });
  });

  await page.getByRole('row', { name: 'SLC 0 ₿ Close' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('table')).toContainText('Test Franchise');
  await page.getByRole('row', { name: 'Test Franchise pizza' }).getByRole('button').click();

  await page.unroute('*/**/api/franchise');
  await page.route('*/**/api/franchise', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: [] });
  });

  // mock close franchise endpoint
  await page.route('*/**/api/franchise/*', async (route) => {
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: { message: "franchise deleted" } });
  });

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('table')).not.toContainText('Test Franchise');

});