import { chromium, FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

const SUPABASE_URL = 'https://hkssuvamxdnqptyprsom.supabase.co'
const ANON_KEY = 'sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk'
const PROJECT_REF = 'hkssuvamxdnqptyprsom'

const TEST_EMAIL = 'playwright-admin@sundaymarket.test'
const TEST_PASSWORD = 'E2E_Admin_Test!99'

function httpsPost(url: string, headers: Record<string, string>, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body)
    const u = new URL(url)
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(JSON.parse(data)))
      }
    )
    req.on('error', reject)
    req.write(bodyStr)
    req.end()
  })
}

/**
 * Playwright global setup: authenticates as test admin via the Supabase REST API,
 * then injects the session cookie into a browser context and saves storage state.
 * This avoids depending on the login page UI flow.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3001'
  const authFile = 'tests/e2e/.auth/admin.json'
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  // 1. Get session tokens from Supabase Auth API
  const session = await httpsPost(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    { apikey: ANON_KEY },
    { email: TEST_EMAIL, password: TEST_PASSWORD }
  )

  if (!session.access_token) {
    throw new Error(`Login failed: ${JSON.stringify(session)}`)
  }

  console.log('[global-setup] Got Supabase session for', TEST_EMAIL)

  // 2. Build the session cookie value in @supabase/ssr v0.8.0 format:
  //    "base64-" + base64(JSON.stringify(session))
  const sessionJson = JSON.stringify(session)
  const cookieValue = 'base64-' + Buffer.from(sessionJson).toString('base64')

  const cookieName = `sb-${PROJECT_REF}-auth-token`
  const domain = new URL(baseURL).hostname

  // 3. Write Playwright storage state with the auth cookie
  const storageState = {
    cookies: [
      { name: cookieName, value: cookieValue, domain, path: '/', httpOnly: false, secure: false, sameSite: 'Lax' as const },
    ],
    origins: [],
  }
  fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2))

  // 4. Verify the session cookie works by navigating to an admin page
  const browser = await chromium.launch()
  const context = await browser.newContext({ storageState: authFile })
  const page = await context.newPage()

  await page.goto(`${baseURL}/markets/admin`)
  await page.waitForLoadState('networkidle')

  const finalUrl = page.url()
  console.log('[global-setup] Final URL after loading /markets/admin:', finalUrl)

  if (finalUrl.includes('/auth/login')) {
    // Cookie injection didn't work — fall back to UI login
    console.log('[global-setup] Cookie injection failed, falling back to UI login...')
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    // Wait for toast: "Login successful! Redirecting..."
    await page.waitForSelector('text=Login successful', { timeout: 12000 })
    await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await context.storageState({ path: authFile })
  }

  await browser.close()
  console.log('[global-setup] Auth state saved to', authFile)
}

export default globalSetup
