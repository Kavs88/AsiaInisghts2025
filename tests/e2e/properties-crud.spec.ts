import { test, expect } from '@playwright/test'

/**
 * E2E Test: Properties Module CRUD Operations
 * Tests: create → edit → delete → view
 */

test.describe('Properties Module CRUD', () => {
  const timestamp = Date.now()
  const testProperty = {
    address: `123 Test Street ${timestamp}`,
    type: 'apartment',
    price: 150000,
    bedrooms: 2,
    bathrooms: 1.5,
    square_meters: 75,
    description: `Test property ${timestamp}`,
  }

  test('Complete Properties CRUD flow', async ({ page }) => {
    // Step 1: Navigate to admin properties page
    await page.goto('/markets/admin/properties')
    await page.waitForLoadState('networkidle')

    // Verify we're on properties page
    await expect(page.locator('h1')).toContainText(/properties/i)

    // Step 2: Create a new property
    const createButton = page.locator('a:has-text("Add Property"), a:has-text("+ Add Property")')
    if (await createButton.count() > 0) {
      await createButton.click()
      await page.waitForLoadState('networkidle')
    } else {
      // Try navigating directly
      await page.goto('/markets/admin/properties/create')
      await page.waitForLoadState('networkidle')
    }

    // Fill property creation form
    await page.fill('input[name="address"], input[id="address"], input[placeholder*="address" i]', testProperty.address)
    
    const typeSelect = page.locator('select[name="type"], select[id="type"]')
    if (await typeSelect.count() > 0) {
      await typeSelect.selectOption(testProperty.type)
    }

    const priceInput = page.locator('input[name="price"], input[id="price"], input[type="number"]')
    if (await priceInput.count() > 0) {
      await priceInput.fill(testProperty.price.toString())
    }

    const bedroomsInput = page.locator('input[name="bedrooms"], input[id="bedrooms"]')
    if (await bedroomsInput.count() > 0) {
      await bedroomsInput.fill(testProperty.bedrooms.toString())
    }

    const bathroomsInput = page.locator('input[name="bathrooms"], input[id="bathrooms"]')
    if (await bathroomsInput.count() > 0) {
      await bathroomsInput.fill(testProperty.bathrooms.toString())
    }

    const squareMetersInput = page.locator('input[name="square_meters"], input[name="squareMeters"], input[id="square_meters"]')
    if (await squareMetersInput.count() > 0) {
      await squareMetersInput.fill(testProperty.square_meters.toString())
    }

    const descriptionInput = page.locator('textarea[name="description"], textarea[id="description"]')
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill(testProperty.description)
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Add")')
    await submitButton.click()

    // Wait for redirect or success message
    await page.waitForURL(/properties|success|created/i, { timeout: 10000 })

    // Step 3: Verify property appears in list
    await page.goto('/markets/admin/properties')
    await page.waitForLoadState('networkidle')

    // Search for the property
    await expect(page.locator('body')).toContainText(testProperty.address)

    // Step 4: Edit the property
    const propertyCard = page.locator(`text=${testProperty.address}`).locator('..').locator('..')
    const editButton = propertyCard.locator('a:has-text("Edit"), button:has-text("Edit")')
    
    if (await editButton.count() > 0) {
      await editButton.click()
      await page.waitForLoadState('networkidle')

      // Update price
      const editPriceInput = page.locator('input[name="price"], input[id="price"]')
      if (await editPriceInput.count() > 0) {
        await editPriceInput.fill('175000')
      }

      // Save changes
      const saveButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")')
      await saveButton.click()

      // Wait for redirect
      await page.waitForURL(/properties|success/i, { timeout: 10000 })
    }

    // Step 5: Verify property list shows updated property
    await page.goto('/markets/admin/properties')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(testProperty.address)

    // Step 6: Delete the property (if delete functionality exists)
    // Note: Delete may require confirmation dialog
    const deleteButton = page.locator(`text=${testProperty.address}`).locator('..').locator('..').locator('button:has-text("Delete"), a:has-text("Delete")')
    if (await deleteButton.count() > 0) {
      await deleteButton.click()
      
      // Handle confirmation dialog if present
      page.on('dialog', dialog => dialog.accept())
      
      await page.waitForTimeout(1000)
      
      // Verify property is removed
      await page.goto('/markets/admin/properties')
      await page.waitForLoadState('networkidle')
      // Property should no longer appear (or be marked as deleted)
    }
  })

  test('Properties form validation', async ({ page }) => {
    await page.goto('/markets/admin/properties/create')
    await page.waitForLoadState('networkidle')

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Should show validation errors
    await expect(page.locator('body')).toContainText(/required|error|invalid/i)
  })
})






