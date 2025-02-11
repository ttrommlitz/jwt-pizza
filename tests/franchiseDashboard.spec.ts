import { test, expect } from 'playwright-test-coverage';

test('franchise dashboard', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'f@jwt.com', password: 'franchisee' };
    const loginRes = { user: { id: 3, name: 'pizza franchisee', email: 'f@jwt.com', roles: [{ role: 'diner' }, { objectId: 1, role: 'franchisee' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/franchise/*', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: [{
      "id": 1,
      "name": "Test Franchise",
      "admins": [
        {
          "id": 3,
          "name": "pizza franchisee",
          "email": "f@jwt.com"
        }
      ],
      "stores": []
    }] });
  })

  await page.route('*/**/api/franchise/*/store', async (route) => {
    expect(route.request().method()).toBe('POST');
    const createStoreReq = {
      "name": "Test Store"
    }
    const createStoreRes = {
      id: 1, 
      name: "Test Store",
      totalRevenue: 0
    }
    expect(route.request().postDataJSON()).toMatchObject(createStoreReq);
    await route.fulfill({ json: createStoreRes });
  })

  await page.goto('/');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await page.getByRole('link', { name: 'login', exact: true }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('#navbar-dark')).toContainText('Logout');
  await expect(page.getByRole('list')).toContainText('franchise-dashboard');
  await expect(page.getByRole('heading')).toContainText('Test Franchise');
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();

  await page.getByRole('button', { name: 'Create store' }).click();
  await expect(page.getByRole('heading')).toContainText('Create store');
  await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('Test Store');

  await page.unroute('*/**/api/franchise/*');
  await page.route('*/**/api/franchise/*', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: [{
      "id": 1,
      "name": "Test Franchise",
      "admins": [
        {
          "id": 3,
          "name": "pizza franchisee",
          "email": "f@jwt.com"
        }
      ],
      "stores": [{
        id: 1, 
        name: "Test Store",
        totalRevenue: 0
      }]
    }] });
  })

  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('Test Store');
  
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
});