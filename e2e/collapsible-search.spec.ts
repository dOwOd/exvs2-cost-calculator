/**
 * E2Eテスト: 機体名検索の折りたたみ機能
 */

import { test, expect } from '@playwright/test';

test.describe('機体名検索の折りたたみ機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('初期状態では検索ボックスが折りたたまれている', async ({ page }) => {
    // A機の検索ボックスが非表示
    await expect(page.getByTestId('mobile-suit-search-a')).not.toBeVisible();

    // B機の検索ボックスが非表示
    await expect(page.getByTestId('mobile-suit-search-b')).not.toBeVisible();

    // 折りたたみヘッダーが表示されている
    await expect(page.getByTestId('search-toggle-a')).toBeVisible();
    await expect(page.getByTestId('search-toggle-b')).toBeVisible();
  });

  test('トグルをクリックすると検索ボックスが展開される', async ({ page }) => {
    // A機のトグルをクリック
    await page.getByTestId('search-toggle-a').click();

    // A機の検索ボックスが表示される
    await expect(page.getByTestId('mobile-suit-search-a')).toBeVisible();

    // B機は折りたたまれたまま
    await expect(page.getByTestId('mobile-suit-search-b')).not.toBeVisible();
  });

  test('展開後、再度クリックすると折りたたまれる', async ({ page }) => {
    // 展開
    await page.getByTestId('search-toggle-a').click();
    await expect(page.getByTestId('mobile-suit-search-a')).toBeVisible();

    // 折りたたみ
    await page.getByTestId('search-toggle-a').click();
    await expect(page.getByTestId('mobile-suit-search-a')).not.toBeVisible();
  });

  test('展開状態で機体検索が正常に動作する', async ({ page }) => {
    // A機のトグルをクリックして展開
    await page.getByTestId('search-toggle-a').click();

    // 検索ボックスが表示されるまで待機
    const searchInput = page.getByTestId('mobile-suit-search-a');
    await expect(searchInput).toBeVisible();

    // 検索ボックスに入力
    await searchInput.fill('νガンダム');

    // 検索結果が表示される
    const searchResults = page.getByTestId('mobile-suit-search-results');
    await expect(searchResults).toBeVisible({ timeout: 10000 });

    // 検索結果から選択
    const firstResult = searchResults.locator('li').first();
    await firstResult.click();

    // コスト3000が選択される
    await expect(page.getByTestId('cost-button-a-3000')).toHaveClass(/bg-blue-600/);
  });

  test('折りたたみ状態でもコスト選択が可能', async ({ page }) => {
    // 検索ボックスは折りたたまれたまま
    await expect(page.getByTestId('mobile-suit-search-a')).not.toBeVisible();

    // コスト選択は可能
    await page.getByTestId('cost-button-a-3000').click();
    await expect(page.getByTestId('cost-button-a-3000')).toHaveClass(/bg-blue-600/);

    // 耐久値選択も可能
    await expect(page.getByTestId('health-selector-button-a')).toBeVisible();
  });
});
