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
    // 機体名検索を使用してνガンダムを選択
    const searchInput = page.getByTestId('mobile-suit-search-a');
    await searchInput.click();
    await searchInput.fill('νガンダム');

    // 検索結果が表示されるまで待機
    const searchResults = page.getByTestId('mobile-suit-search-results');
    await expect(searchResults).toBeVisible({ timeout: 10000 });

    const firstResult = searchResults.locator('li').first();
    await firstResult.click();

    // 検索フィールドをクリアして履歴を確認
    await searchInput.clear();

    // 「最近使用」セクションが表示されることを確認（.first()で最初の要素のみ）
    await expect(page.locator('text=最近使用').first()).toBeVisible();

    // νガンダムの履歴ボタンが表示されることを確認
    const recentButton = page.locator('[data-testid^="recent-suit-"]').first();
    await expect(recentButton).toBeVisible();
    await expect(recentButton).toContainText('ガンダム');
  });

  test('LocalStorageに履歴が保存される', async ({ page }) => {
    // νガンダムを選択
    const searchInput = page.getByTestId('mobile-suit-search-a');
    await searchInput.click();
    await searchInput.fill('νガンダム');

    const searchResults = page.getByTestId('mobile-suit-search-results');
    await expect(searchResults).toBeVisible({ timeout: 10000 });
    await searchResults.locator('li').first().click();

    // 検索フィールドをクリアして履歴が表示されるまで待機
    await searchInput.clear();
    await expect(page.locator('[data-testid^="recent-suit-"]').first()).toBeVisible();

    // LocalStorageに保存されていることを確認
    const recentSuits = await page.evaluate(() => {
      return localStorage.getItem('exvs2-recent-suits');
    });

    expect(recentSuits).toBeTruthy();
    // νガンダムまたはガンダムを含む機体名が保存されていることを確認
    expect(recentSuits).toMatch(/ガンダム/);
  });

  test('ページリロード後も履歴が保持される', async ({ page }) => {
    // νガンダムを選択
    const searchInput = page.getByTestId('mobile-suit-search-a');
    await searchInput.click();
    await searchInput.fill('νガンダム');

    const searchResults = page.getByTestId('mobile-suit-search-results');
    await expect(searchResults).toBeVisible({ timeout: 10000 });
    await searchResults.locator('li').first().click();
    await searchInput.clear();

    // ページをリロード
    await page.reload();

    // 履歴が保持されていることを確認（.first()で最初の要素のみ）
    await expect(page.locator('text=最近使用').first()).toBeVisible();
    const recentButton = page.locator('[data-testid^="recent-suit-"]').first();
    await expect(recentButton).toBeVisible();
    await expect(recentButton).toContainText('ガンダム');
  });
});
