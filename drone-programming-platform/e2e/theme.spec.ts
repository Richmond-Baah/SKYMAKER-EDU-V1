import { test, expect } from '@playwright/test'

test('theme toggle switches between dark and light', async ({ page }) => {
  await page.goto('/')
  // wait for the theme button to mount
  const btn = page.locator('button[title="Toggle theme"]')
  await expect(btn).toBeVisible()

  // get initial html class
  const initialClass = await page.evaluate(() => document.documentElement.className)

  // click the toggle
  await btn.click()
  await page.waitForTimeout(300)

  const afterClass = await page.evaluate(() => document.documentElement.className)
  expect(afterClass).not.toBe(initialClass)
})
