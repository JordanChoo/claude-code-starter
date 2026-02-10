import { test, expect } from '@playwright/test'
import { clearAllEmulators } from '../setup/firebase-emulator'

const TEST_USER = {
  email: `testuser-${Date.now()}@example.com`,
  password: 'TestPassword123!'
}

test.describe('Authentication Flow', () => {
  test.beforeEach(async () => {
    await clearAllEmulators()
  })

  test.afterAll(async () => {
    await clearAllEmulators()
  })

  test('full auth lifecycle: register -> dashboard -> logout -> login', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login')
    await expect(page.getByText('Sign in to your account')).toBeVisible()

    // 2. Switch to register mode
    await page.getByText("Don't have an account? Sign up").click()
    await expect(page.getByText('Create a new account')).toBeVisible()

    // 3. Register a new user
    await page.getByLabel('Email address').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Sign up' }).click()

    // 4. Should redirect to home after registration
    await expect(page).toHaveURL('/')

    // 5. Navigate to dashboard (should be accessible now that we're authenticated)
    await page.goto('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText(TEST_USER.email)).toBeVisible()

    // 6. Logout via nav bar
    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL('/')

    // 7. Verify dashboard is protected after logout
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)

    // 8. Login with the registered user
    await page.getByLabel('Email address').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // 9. Should redirect back to dashboard (redirect query param from step 7)
    await expect(page).toHaveURL(/\/(dashboard)?/)

    // 10. Confirm dashboard access
    await page.goto('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText(TEST_USER.email)).toBeVisible()
  })

  test('shows error for invalid login', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email address').fill('nonexistent@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Should show an error message from Firebase emulator
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 })
  })

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to login with redirect query param
    await expect(page).toHaveURL(/\/login\?redirect=/)
  })
})
