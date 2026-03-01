import { test, expect } from '@playwright/test'

/**
 * E2E Test: Properties Module CRUD Operations
 * Auth is handled by global-setup.ts (storageState reused per playwright.config.ts)
 */

const ADMIN_UUID = '3fdae2f4-0c1d-49ee-8384-da2fb0238d98' // playwright-admin@sundaymarket.test

test.describe('Properties CRUD', () => {
  const ts = Date.now()
  const testAddress = `99 Test Lane ${ts}`

  test('create property appears in listing', async ({ page }) => {
    await page.goto('/markets/admin/properties/create')
    await page.waitForLoadState('networkidle')

    // Verify form loaded (not redirected to login)
    await expect(page.locator('h1')).toContainText(/create|property/i)

    // Fill required fields
    await page.fill('input[name="address"]', testAddress)
    await page.selectOption('select[name="type"]', 'commercial')
    await page.fill('input[name="price"]', '250000')
    await page.fill('input[name="owner_id"]', ADMIN_UUID)

    // Optional fields
    await page.fill('input[name="square_meters"]', '120')
    await page.fill('textarea[name="description"]', `E2E test property ${ts}`)

    // Submit
    await page.click('button[type="submit"]')

    // Should redirect to listing
    await page.waitForURL(/\/markets\/admin\/properties$/, { timeout: 12000 })

    // New property appears in list
    await expect(page.locator('body')).toContainText(testAddress)
  })

  test('property form blocks empty submission', async ({ page }) => {
    await page.goto('/markets/admin/properties/create')
    await page.waitForLoadState('networkidle')

    // Click submit without filling anything
    await page.click('button[type="submit"]')

    // HTML5 required validation fires — page does NOT navigate away
    await expect(page).toHaveURL(/create/)
  })
})
