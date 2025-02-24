import { test, expect } from '@playwright/test';

test('navigation flow', async ({ page }) => {
  try {
    // Start at home page 
    await page.goto('/', { timeout: 30000 });
    
    // Should redirect to login since we're not authenticated
    await page.waitForURL('/login');
    
    // Check for login page elements
    await expect(page.getByText('Welcome to Windy')).toBeVisible();
    await expect(page.getByText('Please log in to continue')).toBeVisible();

    // Mock Auth0 authentication
    await page.evaluate(() => {
      // Simulate an authenticated user session
      document.cookie = 'session=' + JSON.stringify({
        user: {
          sub: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User'
        }
      });
    });

    // Go to boards page
    await page.goto('/boards');

    // Wait for boards page to load with longer timeout
    await expect(page.getByRole('heading', { name: 'My Boards' })).toBeVisible({ 
      timeout: 10000 
    });

    // Verify the boards page structure
    await expect(page.getByRole('combobox')).toBeVisible(); // Board selector
    await expect(page.getByRole('button', { name: 'New Board' })).toBeVisible();

    // Wait for board content
    await expect(page.getByTestId('board-title')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('column-title')).toHaveCount(3, { timeout: 30000 });

    // Verify column titles
    const columnTitles = await page.getByTestId('column-title').allTextContents();
    expect(columnTitles).toContain('To Do');
    expect(columnTitles).toContain('In Progress');
    expect(columnTitles).toContain('Done');

  } catch (error) {
    console.log('Current URL:', page.url());
    console.log('Page content:', await page.innerHTML('body'));
    throw error;
  }
});