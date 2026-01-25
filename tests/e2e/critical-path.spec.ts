import { test, expect } from '@playwright/test'

/**
 * Critical Path Test: Vendor signup → create product → view on market listing
 * 
 * This test verifies the complete vendor onboarding and product creation flow:
 * 1. Vendor signs up for an account
 * 2. Vendor creates a product
 * 3. Product appears on market listing
 */

test.describe('Critical Path: Vendor Signup → Product Creation → Market Listing', () => {
  // Generate unique test data
  const timestamp = Date.now()
  const testEmail = `test-vendor-${timestamp}@example.com`
  const testPassword = 'TestPassword123!'
  const vendorName = `Test Vendor ${timestamp}`
  const productName = `Test Product ${timestamp}`

  test('Complete vendor onboarding and product creation flow', async ({ page }) => {
    // Step 1: Navigate to vendor signup page
    await page.goto('/vendor/apply')
    
    // Wait for page to load
    await expect(page.locator('h1, h2')).toContainText(/vendor|apply|application/i)

    // Step 2: Fill vendor application form
    // Note: This assumes the user is already logged in or the form handles auth
    // In a real scenario, you might need to sign up/login first
    
    // Fill business information
    await page.fill('input[name="name"], input[id="name"]', vendorName)
    
    // Generate slug from name (should auto-generate)
    const slugInput = page.locator('input[name="slug"], input[id="slug"]')
    await expect(slugInput).toHaveValue(new RegExp(vendorName.toLowerCase().replace(/\s+/g, '-')))
    
    // Fill optional fields
    await page.fill('input[name="tagline"], input[id="tagline"]', 'Test tagline')
    await page.fill('textarea[name="bio"], textarea[id="bio"]', 'Test bio description')
    
    // Select category if available
    const categorySelect = page.locator('select[name="category"], select[id="category"]')
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption({ index: 1 }) // Select first non-empty option
    }

    // Fill contact information
    await page.fill('input[name="contactEmail"], input[id="contactEmail"]', testEmail)
    await page.fill('input[name="contactPhone"], input[id="contactPhone"]', '+1234567890')

    // Enable delivery options
    const pickupCheckbox = page.locator('input[type="checkbox"][name*="pickup"], input[type="checkbox"][id*="pickup"]')
    if (await pickupCheckbox.count() > 0) {
      await pickupCheckbox.check()
    }

    // Step 3: Submit vendor application
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for success message or redirect
    await page.waitForURL(/dashboard|success|application/i, { timeout: 10000 })
    
    // Verify application was submitted
    await expect(page.locator('body')).toContainText(/success|submitted|application/i)

    // Step 4: Navigate to vendor dashboard (if not already there)
    if (!page.url().includes('dashboard')) {
      await page.goto('/vendor/dashboard')
    }

    // Step 5: Navigate to product creation
    // Look for "Add Product" or "Create Product" button/link
    const addProductButton = page.locator('a[href*="product"], button:has-text("Add"), button:has-text("Create"), a:has-text("Product")')
    if (await addProductButton.count() > 0) {
      await addProductButton.first().click()
    } else {
      // Try navigating directly
      await page.goto('/vendor/products/create')
    }

    // Step 6: Fill product creation form
    await page.waitForLoadState('networkidle')
    
    // Fill product name
    const productNameInput = page.locator('input[name="name"], input[id="name"], input[placeholder*="name" i]')
    await productNameInput.fill(productName)

    // Fill product description
    const descriptionInput = page.locator('textarea[name="description"], textarea[id="description"], textarea[placeholder*="description" i]')
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill('Test product description')
    }

    // Fill price
    const priceInput = page.locator('input[name="price"], input[id="price"], input[type="number"]')
    if (await priceInput.count() > 0) {
      await priceInput.fill('19.99')
    }

    // Fill stock quantity
    const stockInput = page.locator('input[name="stock"], input[name="stock_quantity"], input[name="quantity"]')
    if (await stockInput.count() > 0) {
      await stockInput.fill('10')
    }

    // Submit product
    const submitProductButton = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Add")')
    await submitProductButton.click()

    // Wait for product to be created
    await page.waitForURL(/products|dashboard|success/i, { timeout: 10000 })

    // Step 7: Navigate to market/sellers listing page
    await page.goto('/markets/sellers')
    await page.waitForLoadState('networkidle')

    // Step 8: Verify vendor appears in listing
    await expect(page.locator('body')).toContainText(vendorName)

    // Step 9: Click on vendor to view profile
    const vendorLink = page.locator(`a:has-text("${vendorName}"), [href*="${vendorName.toLowerCase().replace(/\s+/g, '-')}"]`)
    if (await vendorLink.count() > 0) {
      await vendorLink.first().click()
      await page.waitForLoadState('networkidle')

      // Step 10: Verify product appears on vendor profile
      await expect(page.locator('body')).toContainText(productName)
    } else {
      // If vendor link not found, try searching
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
      if (await searchInput.count() > 0) {
        await searchInput.fill(vendorName)
        await page.waitForTimeout(1000) // Wait for search results
        await expect(page.locator('body')).toContainText(vendorName)
      }
    }
  })

  test('Vendor signup form validation', async ({ page }) => {
    await page.goto('/vendor/apply')
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Should show validation errors
    await expect(page.locator('body')).toContainText(/required|error|invalid/i)
  })
})






