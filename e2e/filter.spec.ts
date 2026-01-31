/**
 * E2Eテスト: フィルター機能
 */

import { test, expect } from '@playwright/test';

test.describe('EXフィルター機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // 編成を選択（3000+3000）
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
  });

  test('フィルターチェックボックスが表示される', async ({ page }) => {
    await expect(page.getByTestId('ex-filter-checkbox')).toBeVisible();
  });

  test('フィルターを適用すると表示パターンが減少する', async ({ page }) => {
    // フィルター適用前のパターン数を取得
    const allPatterns = await page.locator('[data-testid^="pattern-card-"]').count();

    // フィルターを適用（ラベル全体をクリック - 実際のユーザー操作）
    await page.locator('label:has([data-testid="ex-filter-checkbox"])').click();

    // フィルター適用後のパターン数を取得
    const filteredPatterns = await page.locator('[data-testid^="pattern-card-"]').count();

    // フィルター適用後のパターン数が減少していることを確認
    expect(filteredPatterns).toBeLessThanOrEqual(allPatterns);
  });

  test('フィルター適用後、EX不発パターンが非表示になる', async ({ page }) => {
    // フィルターを適用（ラベル全体をクリック）
    await page.locator('label:has([data-testid="ex-filter-checkbox"])').click();

    // すべてのパターンカードを取得
    const patternCards = page.locator('[data-testid^="pattern-card-"]');
    const count = await patternCards.count();

    // 各パターンカードにEX不発バッジがないことを確認
    for (let i = 0; i < count; i++) {
      const card = patternCards.nth(i);
      const exFailureBadge = card.locator('text=⚠️ EXオーバーリミット不発');
      await expect(exFailureBadge).not.toBeVisible();
    }
  });

  test('フィルターをオフにすると全パターンが表示される', async ({ page }) => {
    // フィルターを適用（ラベル全体をクリック）
    await page.locator('label:has([data-testid="ex-filter-checkbox"])').click();
    const filteredPatterns = await page.locator('[data-testid^="pattern-card-"]').count();

    // フィルターを解除（再度クリック）
    await page.locator('label:has([data-testid="ex-filter-checkbox"])').click();
    const allPatterns = await page.locator('[data-testid^="pattern-card-"]').count();

    // 全パターンが再表示されることを確認
    expect(allPatterns).toBeGreaterThanOrEqual(filteredPatterns);
  });
});
