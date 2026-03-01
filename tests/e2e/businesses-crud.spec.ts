import { test, expect } from '@playwright/test'

/**
 * E2E Test: Business Directory Module CRUD Operations
 * Auth is handled by global-setup.ts (storageState reused per playwright.config.ts)
 */

test.describe('Businesses CRUD', () => {
  const ts = Date.now()
  const testName = `E2E Deli ${ts}`

  test('create business appears in listing', async ({ page }) => {
    await page.goto('/markets/admin/businesses/create')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText(/create|business/i)

    // Fill required fields (name triggers auto-slug generation)
    await page.fill('input[name="name"]', testName)
    // Slug auto-fills; wait a tick then verify it has a value
    await page.waitForTimeout(200)
    const slugValue = await page.inputValue('input[name="slug"]')
    expect(slugValue.length).toBeGreaterThan(0)

    // Optional fields
    await page.fill('textarea[name="description"]', `E2E test business ${ts}`)
    await page.fill('input[name="location_text"]', '42 Market Square')

    await page.click('button[type="submit"]')

    await page.waitForURL(/\/markets\/admin\/businesses$/, { timeout: 12000 })
    await expect(page.locator('body')).toContainText(testName)
  })

  test('business form blocks empty submission', async ({ page }) => {
    await page.goto('/markets/admin/businesses/create')
    await page.waitForLoadState('networkidle')

    await page.click('button[type="submit"]')

    // HTML5 required on name and slug — stays on create page
    await expect(page).toHaveURL(/create/)
  })
})
