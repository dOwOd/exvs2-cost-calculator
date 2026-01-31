/**
 * E2Eテスト: 最近使用した機体の履歴
 */

import { test, expect } from '@playwright/test';

test.describe('最近使用した機体の履歴', () => {
  test.beforeEach(async ({ page, context }) => {
    // LocalStorageをクリア
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('機体選択後に履歴が表示される', async ({ page }) => {
    // 機体名検索を使用してガンダムを選択
    await page.getByTestId('mobile-suit-search-a').fill('ガンダム');
    await expect(page.getByTestId('mobile-suit-search-results')).toBeVisible({ timeout: 10000 });

    const firstResult = page.getByTestId('mobile-suit-search-results').locator('li').first();
    await firstResult.click();

    // 検索フィールドをクリアして履歴を確認
    await page.getByTestId('mobile-suit-search-a').clear();

    // 「最近使用」セクションが表示されることを確認（.first()で最初の要素のみ）
    await expect(page.locator('text=最近使用').first()).toBeVisible();

    // 履歴ボタンが表示されることを確認（ガンダムを含む）
    await expect(page.locator('[data-testid^="recent-suit-"]').first()).toBeVisible();
  });

  test('LocalStorageに履歴が保存される', async ({ page }) => {
    // ガンダムを選択
    await page.getByTestId('mobile-suit-search-a').fill('ガンダム');
    await expect(page.getByTestId('mobile-suit-search-results')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('mobile-suit-search-results').locator('li').first().click();

    // LocalStorageに保存されていることを確認
    const recentSuits = await page.evaluate(() => {
      return localStorage.getItem('recentSuits');
    });

    expect(recentSuits).toBeTruthy();
    // 「ガンダム」を含む機体名が保存されていることを確認
    expect(recentSuits).toMatch(/ガンダム/);
  });

  test('ページリロード後も履歴が保持される', async ({ page }) => {
    // ガンダムを選択
    await page.getByTestId('mobile-suit-search-a').fill('ガンダム');
    await expect(page.getByTestId('mobile-suit-search-results')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('mobile-suit-search-results').locator('li').first().click();
    await page.getByTestId('mobile-suit-search-a').clear();

    // ページをリロード
    await page.reload();

    // 履歴が保持されていることを確認（.first()で最初の要素のみ）
    await expect(page.locator('text=最近使用').first()).toBeVisible();
    await expect(page.locator('[data-testid^="recent-suit-"]').first()).toBeVisible();
  });
});
