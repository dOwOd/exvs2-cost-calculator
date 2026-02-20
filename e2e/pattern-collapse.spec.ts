/**
 * E2Eテスト: パターンの折りたたみ・展開機能
 */

import { test, expect } from '@playwright/test';
import { BASE } from './helpers';

test.describe('パターンの折りたたみ・展開機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`);

    // 編成を選択（3000+3000）- パターン数が多い編成
    await page.getByTestId('cost-button-a-3000').click();
    await expect(page.getByTestId('health-selector-button-a')).toBeVisible();
    await page.getByTestId('health-selector-button-a').click();
    await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();
    await page.getByTestId('health-option-a-680').click();

    await page.getByTestId('cost-button-b-3000').click();
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();
    await page.getByTestId('health-selector-button-b').click();
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();
    await page.getByTestId('health-option-b-680').click();

    // パターンカードが表示されるまで待機
    await expect(page.locator('[data-testid^="pattern-card-"]').first()).toBeVisible();
  });

  test('デフォルトでTOP 3のみ展開される', async ({ page }) => {
    // TOP 3のテーブルが表示されている
    for (let i = 1; i <= 3; i++) {
      await expect(page.getByTestId(`pattern-table-container-${i}`)).toBeVisible();
    }

    // 4番目以降のテーブルは非表示
    const totalCards = await page.locator('[data-testid^="pattern-card-"]').count();
    for (let i = 4; i <= totalCards; i++) {
      await expect(page.getByTestId(`pattern-table-container-${i}`)).not.toBeVisible();
    }
  });

  test('折りたたまれたパターンをクリックで展開できる', async ({ page }) => {
    // 4番目のパターンが折りたたまれていることを確認
    await expect(page.getByTestId('pattern-table-container-4')).not.toBeVisible();

    // ヘッダーをクリックして展開
    await page.getByTestId('pattern-header-4').click();

    // テーブルが表示される
    await expect(page.getByTestId('pattern-table-container-4')).toBeVisible();
  });

  test('展開されたパターンをクリックで折りたためる', async ({ page }) => {
    // 1番目のパターンが展開されていることを確認
    await expect(page.getByTestId('pattern-table-container-1')).toBeVisible();

    // ヘッダーをクリックして折りたたみ
    await page.getByTestId('pattern-header-1').click();

    // テーブルが非表示になる
    await expect(page.getByTestId('pattern-table-container-1')).not.toBeVisible();
  });

  test('折りたたみ時にサマリーが表示される', async ({ page }) => {
    // 4番目のパターンが折りたたまれた状態でサマリーを確認
    const card4 = page.getByTestId('pattern-card-4');

    // ランクが表示されている
    await expect(card4.getByTestId('pattern-rank-4')).toBeVisible();

    // パターン文字列が表示されている
    await expect(card4.getByTestId('pattern-string-4')).toBeVisible();

    // 折りたたみ時の総耐久サマリーが表示されている
    await expect(card4.getByTestId('pattern-summary-health-4')).toBeVisible();
  });

  test('「すべて展開」ボタンで全パターンが展開される', async ({ page }) => {
    // 「すべて展開」ボタンをクリック
    await page.getByTestId('expand-all-button').click();

    // すべてのテーブルが表示される
    const totalCards = await page.locator('[data-testid^="pattern-card-"]').count();
    for (let i = 1; i <= totalCards; i++) {
      await expect(page.getByTestId(`pattern-table-container-${i}`)).toBeVisible();
    }
  });

  test('「すべて折りたたみ」ボタンで全パターンが折りたたまれる', async ({ page }) => {
    // まず「すべて展開」してから「すべて折りたたみ」
    await page.getByTestId('expand-all-button').click();
    await page.getByTestId('collapse-all-button').click();

    // すべてのテーブルが非表示になる
    const totalCards = await page.locator('[data-testid^="pattern-card-"]').count();
    for (let i = 1; i <= totalCards; i++) {
      await expect(page.getByTestId(`pattern-table-container-${i}`)).not.toBeVisible();
    }
  });

  test('キーボード操作（Enter）で展開/折りたたみできる', async ({ page }) => {
    // 4番目のヘッダーにフォーカスしてEnterキー
    await page.getByTestId('pattern-header-4').focus();
    await page.keyboard.press('Enter');

    // 展開される
    await expect(page.getByTestId('pattern-table-container-4')).toBeVisible();

    // 再度Enterで折りたたみ
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('pattern-table-container-4')).not.toBeVisible();
  });

  test('キーボード操作（Space）で展開/折りたたみできる', async ({ page }) => {
    // 4番目のヘッダーにフォーカスしてSpaceキー
    await page.getByTestId('pattern-header-4').focus();
    await page.keyboard.press('Space');

    // 展開される
    await expect(page.getByTestId('pattern-table-container-4')).toBeVisible();

    // 再度Spaceで折りたたみ
    await page.keyboard.press('Space');
    await expect(page.getByTestId('pattern-table-container-4')).not.toBeVisible();
  });
});
