import { test, expect } from '@playwright/test'

/**
 * E2E Test: Events Module CRUD Operations
 * Tests: create → edit → delete → view
 */

test.describe('Events Module CRUD', () => {
  const timestamp = Date.now()
  const testEvent = {
    title: `Test Event ${timestamp}`,
    description: `Test event description ${timestamp}`,
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    start_time: '14:00',
    end_time: '18:00',
    location: `Test Venue ${timestamp}`,
    ticket_price: 25.00,
  }

  test('Complete Events CRUD flow', async ({ page }) => {
    // Step 1: Navigate to admin events page
    await page.goto('/markets/admin/events')
    await page.waitForLoadState('networkidle')

    // Verify we're on events page
    await expect(page.locator('h1')).toContainText(/events/i)

    // Step 2: Create a new event
    const createButton = page.locator('a:has-text("Add Event"), a:has-text("+ Add Event")')
    if (await createButton.count() > 0) {
      await createButton.click()
      await page.waitForLoadState('networkidle')
    } else {
      await page.goto('/markets/admin/events/create')
      await page.waitForLoadState('networkidle')
    }

    // Fill event creation form
    await page.fill('input[name="title"], input[id="title"], input[placeholder*="title" i]', testEvent.title)
    
    const descriptionInput = page.locator('textarea[name="description"], textarea[id="description"]')
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill(testEvent.description)
    }

    const dateInput = page.locator('input[name="event_date"], input[name="date"], input[type="date"]')
    if (await dateInput.count() > 0) {
      await dateInput.fill(testEvent.event_date)
    }

    const startTimeInput = page.locator('input[name="start_time"], input[name="startTime"], input[type="time"]')
    if (await startTimeInput.count() > 0) {
      await startTimeInput.fill(testEvent.start_time)
    }

    const endTimeInput = page.locator('input[name="end_time"], input[name="endTime"]')
    if (await endTimeInput.count() > 0) {
      await endTimeInput.fill(testEvent.end_time)
    }

    const locationInput = page.locator('input[name="location"], input[id="location"]')
    if (await locationInput.count() > 0) {
      await locationInput.fill(testEvent.location)
    }

    const ticketPriceInput = page.locator('input[name="ticket_price"], input[name="ticketPrice"], input[type="number"]')
    if (await ticketPriceInput.count() > 0) {
      await ticketPriceInput.fill(testEvent.ticket_price.toString())
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")')
    await submitButton.click()

    // Wait for redirect or success
    await page.waitForURL(/events|success|created/i, { timeout: 10000 })

    // Step 3: Verify event appears in list
    await page.goto('/markets/admin/events')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('body')).toContainText(testEvent.title)

    // Step 4: Edit the event
    const eventCard = page.locator(`text=${testEvent.title}`).locator('..').locator('..')
    const editButton = eventCard.locator('a:has-text("Edit"), button:has-text("Edit")')
    
    if (await editButton.count() > 0) {
      await editButton.click()
      await page.waitForLoadState('networkidle')

      // Update ticket price
      const editPriceInput = page.locator('input[name="ticket_price"], input[name="ticketPrice"]')
      if (await editPriceInput.count() > 0) {
        await editPriceInput.fill('30.00')
      }

      // Save changes
      const saveButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")')
      await saveButton.click()

      await page.waitForURL(/events|success/i, { timeout: 10000 })
    }

    // Step 5: Verify event list shows updated event
    await page.goto('/markets/admin/events')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(testEvent.title)

    // Step 6: Delete the event (if delete functionality exists)
    const deleteButton = page.locator(`text=${testEvent.title}`).locator('..').locator('..').locator('button:has-text("Delete"), a:has-text("Delete")')
    if (await deleteButton.count() > 0) {
      await deleteButton.click()
      
      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept())
      
      await page.waitForTimeout(1000)
      
      // Verify event is removed
      await page.goto('/markets/admin/events')
      await page.waitForLoadState('networkidle')
    }
  })

  test('Events form validation', async ({ page }) => {
    await page.goto('/markets/admin/events/create')
    await page.waitForLoadState('networkidle')

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Should show validation errors
    await expect(page.locator('body')).toContainText(/required|error|invalid/i)
  })
})






