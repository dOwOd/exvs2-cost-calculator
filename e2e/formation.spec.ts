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

    await page.getByTestId('health-option-a-680').click();

    // B機: コスト2500を選択
    await page.getByTestId('cost-button-b-2500').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();

    // B機: 耐久値を選択（640は存在する）
    await page.getByTestId('health-selector-button-b').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();

    await page.getByTestId('health-option-b-640').click();

    // 結果パネルが表示されることを確認
    await expect(page.getByTestId('pattern-card-1')).toBeVisible();

    // ランク1のパターンカードが表示されることを確認
    await expect(page.getByTestId('pattern-rank-1')).toContainText('#1');

    // 総耐久値が表示されることを確認
    await expect(page.getByTestId('pattern-total-health-1')).toBeVisible();
  });

  test('機体名検索で機体を選択できる', async ({ page }) => {
    // A機: 機体名検索を使用
    await page.getByTestId('mobile-suit-search-a').fill('ガンダム');

    // 検索結果が表示されることを確認（タイムアウトを延長）
    await expect(page.getByTestId('mobile-suit-search-results')).toBeVisible({ timeout: 10000 });

    // 検索結果から選択
    const firstResult = page.getByTestId('mobile-suit-search-results').locator('li').first();
    await firstResult.click();

    // コストボタンが選択されることを確認（任意のコスト）
    await page.waitForTimeout(500);  // UI更新を待つ
    const selectedButton = page.locator('[data-testid^="cost-button-a-"].bg-blue-600');
    await expect(selectedButton).toBeVisible();
  });

  test('異なるコストの組み合わせで結果が表示される', async ({ page }) => {
    // A機: コスト2000を選択
    await page.getByTestId('cost-button-a-2000').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-a')).toBeVisible();

    await page.getByTestId('health-selector-button-a').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();

    await page.getByTestId('health-option-a-660').click();

    // B機: コスト1500を選択
    await page.getByTestId('cost-button-b-1500').click();

    // 耐久値セレクターが表示されるまで待機
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();

    await page.getByTestId('health-selector-button-b').click();

    // リストボックスが表示されるまで待機
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();

    await page.getByTestId('health-option-b-500').click();

    // 結果パネルが表示されることを確認
    await expect(page.getByTestId('pattern-card-1')).toBeVisible();
  });
});
