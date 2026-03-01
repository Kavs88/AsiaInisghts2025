import { test, expect } from '@playwright/test'

/**
 * E2E Test: Events Module CRUD Operations
 * Auth is handled by global-setup.ts (storageState reused per playwright.config.ts)
 */

test.describe('Events CRUD', () => {
  const ts = Date.now()
  const testTitle = `E2E Market Night ${ts}`
  // datetime-local format: YYYY-MM-DDTHH:mm
  const startAt = '2026-06-15T14:00'
  const endAt   = '2026-06-15T20:00'

  test('create event appears in listing', async ({ page }) => {
    await page.goto('/markets/admin/events/create')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText(/create|event/i)

    // Fill required fields
    await page.fill('input[name="title"]', testTitle)
    await page.selectOption('select[name="event_type"]', 'market')
    await page.selectOption('select[name="status"]', 'draft')

    // datetime-local inputs need fill() with the local format
    await page.fill('input[name="start_at"]', startAt)
    await page.fill('input[name="end_at"]', endAt)

    // Optional
    await page.fill('textarea[name="description"]', `E2E test event ${ts}`)
    await page.fill('input[name="location"]', 'Test Market Grounds')

    await page.click('button[type="submit"]')

    await page.waitForURL(/\/markets\/admin\/events$/, { timeout: 12000 })
    await expect(page.locator('body')).toContainText(testTitle)
  })

  test('event form blocks empty submission', async ({ page }) => {
    await page.goto('/markets/admin/events/create')
    await page.waitForLoadState('networkidle')

    await page.click('button[type="submit"]')

    // HTML5 required validation on title fires — stays on create page
    await expect(page).toHaveURL(/create/)
  })
})
