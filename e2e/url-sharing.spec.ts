/**
 * E2Eテスト: URL共有機能
 */

import { test, expect } from '@playwright/test';
import { BASE } from './helpers';

test.describe('URL共有: クエリパラメータからの編成復元', () => {
  test('両機体がURLパラメータから復元される', async ({ page }) => {
    await page.goto(`${BASE}/?a=3000-680&b=2500-620`);

    // 編成情報が表示されることを確認
    await expect(page.getByTestId('formation-status-a')).toContainText('コスト3000 / 耐久680');
    await expect(page.getByTestId('formation-status-b')).toContainText('コスト2500 / 耐久620');

    // パターンカードが表示されることを確認
    await expect(page.locator('[data-testid^="pattern-card-"]').first()).toBeVisible();
  });

  test('フィルター状態がURLパラメータから復元される', async ({ page }) => {
    await page.goto(`${BASE}/?a=3000-680&b=2500-620&exOnly=true&fk=A`);

    // EXフィルターがONになっていることを確認
    await expect(page.getByTestId('ex-filter-checkbox')).toBeChecked();

    // 先撃墜フィルターがAになっていることを確認
    const filterA = page.getByTestId('first-kill-filter-a');
    await expect(filterA).toHaveClass(/bg-white|text-slate-900/);
  });

  test('URLパラメータ復元時のレイアウトが手動選択時と一致する', async ({ page }) => {
    // 1. 手動選択でのレイアウトを取得
    await page.goto(`${BASE}/`);
    await page.getByTestId('cost-button-a-3000').click();
    await page.getByTestId('health-selector-button-a').click();
    await page.getByTestId('health-option-a-680').click();
    await page.getByTestId('cost-button-b-2500').click();
    await page.getByTestId('health-selector-button-b').click();
    await page.getByTestId('health-option-b-620').click();
    await expect(page.getByTestId('copy-url-button')).toBeVisible();

    const manualButtonBox = await page.getByTestId('copy-url-button').boundingBox();

    // 2. URLパラメータからのアクセスでのレイアウトを取得
    await page.goto(`${BASE}/?a=3000-680&b=2500-620`);
    await expect(page.getByTestId('copy-url-button')).toBeVisible();

    const urlButtonBox = await page.getByTestId('copy-url-button').boundingBox();

    // 3. ボタンのX座標が一致することを確認（右寄せが維持されている）
    expect(manualButtonBox).not.toBeNull();
    expect(urlButtonBox).not.toBeNull();
    expect(urlButtonBox!.x).toBeCloseTo(manualButtonBox!.x, -1);
  });

  test('不正なURLパラメータでクラッシュしない', async ({ page }) => {
    await page.goto(`${BASE}/?a=invalid&b=9999-999`);

    // ページが正常に表示されることを確認
    await expect(page.getByTestId('formation-status-a')).toContainText('未選択');
    await expect(page.getByTestId('formation-status-b')).toContainText('未選択');
  });

  test('片方のみのURLパラメータが復元される', async ({ page }) => {
    await page.goto(`${BASE}/?a=3000-680`);

    await expect(page.getByTestId('formation-status-a')).toContainText('コスト3000 / 耐久680');
    await expect(page.getByTestId('formation-status-b')).toContainText('未選択');
  });
});

test.describe('URL共有: 編成変更時のURL更新', () => {
  test('機体選択時にURLが更新される', async ({ page }) => {
    await page.goto(`${BASE}/`);

    // A機を選択
    await page.getByTestId('cost-button-a-3000').click();
    await page.getByTestId('health-selector-button-a').click();
    await page.getByTestId('health-option-a-680').click();

    // URLにaパラメータが含まれることを確認
    await expect(page).toHaveURL(/[?&]a=3000-680/);

    // B機を選択
    await page.getByTestId('cost-button-b-2500').click();
    await page.getByTestId('health-selector-button-b').click();
    await page.getByTestId('health-option-b-620').click();

    // URLにbパラメータも含まれることを確認
    await expect(page).toHaveURL(/[?&]b=2500-620/);
  });
});

test.describe('URL共有: URLコピーボタン', () => {
  test('編成完了時にURLコピーボタンが表示される', async ({ page }) => {
    await page.goto(`${BASE}/?a=3000-680&b=2500-620`);

    await expect(page.getByTestId('copy-url-button')).toBeVisible();
  });

  test('編成未完了時にURLコピーボタンが表示されない', async ({ page }) => {
    await page.goto(`${BASE}/?a=3000-680`);

    await expect(page.getByTestId('copy-url-button')).not.toBeVisible();
  });
});
