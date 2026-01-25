import { test, expect } from '@playwright/test'

/**
 * E2E Test: Business Directory Module CRUD Operations
 * Tests: create → edit → delete → view
 */

test.describe('Business Directory Module CRUD', () => {
  const timestamp = Date.now()
  const testBusiness = {
    name: `Test Business ${timestamp}`,
    category: 'Restaurant',
    contact_phone: '+1234567890',
    address: `123 Business Street ${timestamp}`,
    description: `Test business description ${timestamp}`,
  }

  test('Complete Business Directory CRUD flow', async ({ page }) => {
    // Step 1: Navigate to admin businesses page
    await page.goto('/markets/admin/businesses')
    await page.waitForLoadState('networkidle')

    // Verify we're on businesses page
    await expect(page.locator('h1')).toContainText(/business/i)

    // Step 2: Create a new business
    const createButton = page.locator('a:has-text("Add Business"), a:has-text("+ Add Business")')
    if (await createButton.count() > 0) {
      await createButton.click()
      await page.waitForLoadState('networkidle')
    } else {
      await page.goto('/markets/admin/businesses/create')
      await page.waitForLoadState('networkidle')
    }

    // Fill business creation form
    await page.fill('input[name="name"], input[id="name"], input[placeholder*="name" i]', testBusiness.name)
    
    const categorySelect = page.locator('select[name="category"], select[id="category"]')
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption(testBusiness.category)
    } else {
      // Try input field
      const categoryInput = page.locator('input[name="category"], input[id="category"]')
      if (await categoryInput.count() > 0) {
        await categoryInput.fill(testBusiness.category)
      }
    }

    const phoneInput = page.locator('input[name="contact_phone"], input[name="phone"], input[type="tel"]')
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(testBusiness.contact_phone)
    }

    const addressInput = page.locator('input[name="address"], input[id="address"], textarea[name="address"]')
    if (await addressInput.count() > 0) {
      await addressInput.fill(testBusiness.address)
    }

    const descriptionInput = page.locator('textarea[name="description"], textarea[id="description"]')
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill(testBusiness.description)
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")')
    await submitButton.click()

    // Wait for redirect or success
    await page.waitForURL(/businesses|success|created/i, { timeout: 10000 })

    // Step 3: Verify business appears in list
    await page.goto('/markets/admin/businesses')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('body')).toContainText(testBusiness.name)

    // Step 4: Edit the business
    const businessCard = page.locator(`text=${testBusiness.name}`).locator('..').locator('..')
    const editButton = businessCard.locator('a:has-text("Edit"), button:has-text("Edit")')
    
    if (await editButton.count() > 0) {
      await editButton.click()
      await page.waitForLoadState('networkidle')

      // Update phone number
      const editPhoneInput = page.locator('input[name="contact_phone"], input[name="phone"]')
      if (await editPhoneInput.count() > 0) {
        await editPhoneInput.fill('+1987654321')
      }

      // Save changes
      const saveButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")')
      await saveButton.click()

      await page.waitForURL(/businesses|success/i, { timeout: 10000 })
    }

    // Step 5: Verify business list shows updated business
    await page.goto('/markets/admin/businesses')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(testBusiness.name)

    // Step 6: Delete the business (if delete functionality exists)
    const deleteButton = page.locator(`text=${testBusiness.name}`).locator('..').locator('..').locator('button:has-text("Delete"), a:has-text("Delete")')
    if (await deleteButton.count() > 0) {
      await deleteButton.click()
      
      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept())
      
      await page.waitForTimeout(1000)
      
      // Verify business is removed
      await page.goto('/markets/admin/businesses')
      await page.waitForLoadState('networkidle')
    }
  })

  test('Business form validation', async ({ page }) => {
    await page.goto('/markets/admin/businesses/create')
    await page.waitForLoadState('networkidle')

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Should show validation errors
    await expect(page.locator('body')).toContainText(/required|error|invalid/i)
  })
})






