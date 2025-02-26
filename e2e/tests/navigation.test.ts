import { test, expect } from '@playwright/test';

test('navigation flow', async ({ page }) => {
  try {
    // Start at home page 
    await page.goto('/', { timeout: 30000 });
    await expect(page).toHaveURL('/');
    
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

    // Navigate to boards
    await page.goto('/boards');
    await expect(page).toHaveURL('/boards');

    // Verify the boards page structure
    await expect(page.getByRole('heading', { name: 'My Boards' })).toBeVisible();

    // Check for either the empty state or board selector
    const hasBoards = await page.getByRole('combobox').isVisible();

    if (hasBoards) {
      // Board exists state
      await expect(page.getByRole('combobox')).toBeVisible(); 
      await expect(page.getByRole('button', { name: 'New Board' })).toBeVisible();
  } else {
      // Empty state
      await expect(page.getByText('No boards found')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create Board' })).toBeVisible();
  }

    // Check header elements
    await expect(page.getByRole('img', { name: 'Profile' })).toBeVisible();

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