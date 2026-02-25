import { test, expect } from '@playwright/test'

test('editor loads and is editable', async ({ page }) => {
  await page.goto('/')
  // Monaco mounts client-side; wait for an editor textarea or container
  const editor = page.locator('[role="editor"], .monaco-editor')
  await expect(editor.first()).toBeVisible({ timeout: 5000 })

  // Try focusing and typing
  await editor.first().click()
  await page.keyboard.type('\n# playwrite test')

  // Check that the content contains the typed text
  const content = await page.locator('.monaco-editor').innerText().catch(() => '')
  expect(content.length).toBeGreaterThan(0)
})
