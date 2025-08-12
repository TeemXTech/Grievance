import { test, expect } from '@playwright/test';

test.describe('Grievance Management', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up test user and login
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
  });

  test('should be able to create a new grievance', async ({ page }) => {
    await page.goto('/dashboard/grievances');
    await page.getByRole('button', { name: /New Grievance/i }).click();
    
    // Fill grievance form
    await page.getByLabel('Title').fill('Test Grievance');
    await page.getByLabel('Description').fill('This is a test grievance');
    await page.getByLabel('Category').selectOption('INFRASTRUCTURE');
    
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Verify grievance was created
    await expect(page.getByText('Grievance created successfully')).toBeVisible();
  });

  test('should display grievance details', async ({ page }) => {
    await page.goto('/dashboard/grievances');
    await page.getByRole('link', { name: /Test Grievance/i }).first().click();
    
    await expect(page.getByText('Test Grievance')).toBeVisible();
    await expect(page.getByText('This is a test grievance')).toBeVisible();
  });

  test('should be able to update grievance status', async ({ page }) => {
    await page.goto('/dashboard/grievances');
    await page.getByRole('link', { name: /Test Grievance/i }).first().click();
    
    await page.getByRole('button', { name: /Update Status/i }).click();
    await page.getByRole('option', { name: /In Progress/i }).click();
    
    await expect(page.getByText('Status updated successfully')).toBeVisible();
  });
});
