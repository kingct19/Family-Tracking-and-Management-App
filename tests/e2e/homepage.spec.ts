import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test('should load the homepage successfully', async ({ page }) => {
        await page.goto('/');

        // Check that the page loads without errors
        await expect(page).toHaveTitle(/FamilyTracker/);

        // Check main heading
        await expect(page.getByRole('heading', { name: /FamilyTracker/i })).toBeVisible();

        // Check that the page is not blank (white screen)
        const body = await page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should display all main features', async ({ page }) => {
        await page.goto('/');

        // Check for feature cards
        await expect(page.getByText('Real-time Location Tracking')).toBeVisible();
        await expect(page.getByText('Smart Task Management')).toBeVisible();
        await expect(page.getByText('Digital Vault')).toBeVisible();
        await expect(page.getByText('Family Messaging')).toBeVisible();
        await expect(page.getByText('Multiple Hubs')).toBeVisible();
        await expect(page.getByText('Legacy Planning')).toBeVisible();
    });

    test('should have working navigation links', async ({ page }) => {
        await page.goto('/');

        // Check header Sign In link
        const headerSignInLink = page.getByRole('banner').getByRole('link', { name: /sign in/i });
        await expect(headerSignInLink).toBeVisible();
        await expect(headerSignInLink).toHaveAttribute('href', '/login');

        // Check header Get Started link
        const headerGetStartedLink = page.getByRole('banner').getByRole('link', { name: /get started/i });
        await expect(headerGetStartedLink).toBeVisible();
        await expect(headerGetStartedLink).toHaveAttribute('href', '/register');
    });

    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');

        // Use the header Sign In link specifically
        await page.getByRole('banner').getByRole('link', { name: /sign in/i }).click();

        // Should navigate to login page
        await expect(page).toHaveURL(/.*\/login/);
    });

    test('should navigate to register page', async ({ page }) => {
        await page.goto('/');

        // Use the header Get Started link specifically
        await page.getByRole('banner').getByRole('link', { name: /get started/i }).click();

        // Should navigate to register page
        await expect(page).toHaveURL(/.*\/register/);
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Check that main content is still visible
        await expect(page.getByRole('heading', { name: /FamilyTracker/i })).toBeVisible();

        // Check that navigation links are still accessible (use header link specifically)
        await expect(page.getByRole('banner').getByRole('link', { name: /sign in/i })).toBeVisible();
    });

    test('should handle 404 page correctly', async ({ page }) => {
        const response = await page.goto('/nonexistent-page');

        // Should redirect to 404 page
        await expect(page.getByText(/not found/i)).toBeVisible();
    });
});
