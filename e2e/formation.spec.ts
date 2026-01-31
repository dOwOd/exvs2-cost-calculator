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

    // A機: 耐久値を選択
    await page.getByTestId('health-selector-button-a').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();

    await page.getByTestId('health-option-a-650').click();

    // B機: コスト2500を選択
    await page.getByTestId('cost-button-b-2500').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();

    // B機: 耐久値を選択
    await page.getByTestId('health-selector-button-b').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();

    await page.getByTestId('health-option-b-600').click();

    // 結果パネルが表示されることを確認
    await expect(page.getByTestId('pattern-card-1')).toBeVisible();

    // ランク1のパターンカードが表示されることを確認
    await expect(page.getByTestId('pattern-rank-1')).toContainText('#1');

    // 総耐久値が表示されることを確認
    await expect(page.getByTestId('pattern-total-health-1')).toBeVisible();
  });

  test('機体名検索で機体を選択できる', async ({ page }) => {
    // A機: 機体名検索を使用
    await page.getByTestId('mobile-suit-search-a').fill('νガンダム');

    // 検索結果が表示されることを確認
    await expect(page.getByTestId('mobile-suit-search-results')).toBeVisible();

    // 検索結果から選択
    const firstResult = page.getByTestId('mobile-suit-search-results').locator('li').first();
    await firstResult.click();

    // コストと耐久値が自動的に選択されることを確認
    // （選択されたコストボタンが青くハイライトされる）
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

    await page.getByTestId('health-option-a-500').click();

    // B機: コスト1500を選択
    await page.getByTestId('cost-button-b-1500').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();

    await page.getByTestId('health-selector-button-b').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();

    await page.getByTestId('health-option-b-420').click();

    // 結果パネルが表示されることを確認
    await expect(page.getByTestId('pattern-card-1')).toBeVisible();
  });
});
