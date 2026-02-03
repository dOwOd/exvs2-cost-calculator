/**
 * E2Eテスト: 編成選択 → 結果表示
 */

import { test, expect } from '@playwright/test';

test.describe('編成選択と結果表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('コスト選択ボタンが表示される', async ({ page }) => {
    // 各コストボタンが表示されていることを確認（A機）
    await expect(page.getByTestId('cost-button-a-1500')).toBeVisible();
    await expect(page.getByTestId('cost-button-a-2000')).toBeVisible();
    await expect(page.getByTestId('cost-button-a-2500')).toBeVisible();
    await expect(page.getByTestId('cost-button-a-3000')).toBeVisible();

    // B機も確認
    await expect(page.getByTestId('cost-button-b-1500')).toBeVisible();
    await expect(page.getByTestId('cost-button-b-2000')).toBeVisible();
    await expect(page.getByTestId('cost-button-b-2500')).toBeVisible();
    await expect(page.getByTestId('cost-button-b-3000')).toBeVisible();
  });

  test('A機とB機を選択して結果が表示される', async ({ page }) => {
    // A機: コスト3000を選択
    await page.getByTestId('cost-button-a-3000').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-a')).toBeVisible();

    // A機: 耐久値を選択（680は存在する）
    await page.getByTestId('health-selector-button-a').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();

    // evaluate でポップアップオーバーレイを確実に回避
    await page.getByTestId('health-option-a-680').evaluate((el) => (el as HTMLElement).click());

    // B機: コスト2500を選択
    await page.getByTestId('cost-button-b-2500').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();

    // B機: 耐久値を選択（640は存在する）
    await page.getByTestId('health-selector-button-b').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();

    // evaluate でポップアップオーバーレイを確実に回避
    await page.getByTestId('health-option-b-640').evaluate((el) => (el as HTMLElement).click());

    // 結果パネルが表示されることを確認
    await expect(page.getByTestId('pattern-card-1')).toBeVisible();

    // ランク1のパターンカードが表示されることを確認
    await expect(page.getByTestId('pattern-rank-1')).toContainText('#1');

    // 総耐久値が表示されることを確認
    await expect(page.getByTestId('pattern-total-health-1')).toBeVisible();
  });

  test('機体名検索で機体を選択できる', async ({ page }) => {
    // A機: 検索パネルを展開
    await page.getByTestId('search-toggle-a').click();

    // A機: 機体名検索を使用（νガンダムで検索）
    const searchInput = page.getByTestId('mobile-suit-search-a');
    await searchInput.click();
    await searchInput.fill('νガンダム');

    // 検索結果が表示されるまで待機
    const searchResults = page.getByTestId('mobile-suit-search-results');
    await expect(searchResults).toBeVisible({ timeout: 10000 });

    // 検索結果にνガンダムが含まれることを確認
    const firstResult = searchResults.locator('li').first();
    await expect(firstResult).toContainText('ガンダム');

    // 検索結果から選択
    await firstResult.click();

    // コスト3000が選択されることを確認（νガンダムはコスト3000）
    await expect(page.getByTestId('cost-button-a-3000')).toHaveClass(/bg-blue-600/);
  });

  test('異なるコストの組み合わせで結果が表示される', async ({ page }) => {
    // A機: コスト2000を選択
    await page.getByTestId('cost-button-a-2000').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-a')).toBeVisible();

    await page.getByTestId('health-selector-button-a').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();

    // evaluate でポップアップオーバーレイを確実に回避
    await page.getByTestId('health-option-a-660').evaluate((el) => (el as HTMLElement).click());

    // B機: コスト1500を選択
    await page.getByTestId('cost-button-b-1500').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();

    await page.getByTestId('health-selector-button-b').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();

    // evaluate でポップアップオーバーレイを確実に回避
    await page.getByTestId('health-option-b-500').evaluate((el) => (el as HTMLElement).click());

    // 結果パネルが表示されることを確認
    await expect(page.getByTestId('pattern-card-1')).toBeVisible();
  });
});
