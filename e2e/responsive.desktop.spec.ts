/**
 * E2Eテスト: レスポンシブデザイン（デスクトップ）
 *
 * デスクトップブラウザ（chromium, firefox, webkit）のみで実行
 */

import { test, expect } from '@playwright/test';

test.describe('レスポンシブデザイン - デスクトップ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('デスクトップ表示 (1024px+)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('2カラムレイアウトになる', async ({ page }) => {
      // 左カラム（aside）と右カラム（main）が横に並んでいることを確認
      const mainLayout = page.getByTestId('main-layout');
      await expect(mainLayout).toBeVisible();

      // 2カラムグリッドになっていることを確認
      const gridTemplateColumns = await mainLayout.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });

      // lg:grid-cols-[400px_1fr] が適用されているか確認
      // 期待値: "400px" + 残りスペース の2カラム
      expect(gridTemplateColumns).toMatch(/400px/);
    });
  });

  test.describe('ビューポート切り替え', () => {
    test('モバイルからデスクトップへの切り替えでレイアウトが変化する', async ({ page }) => {
      // モバイルサイズで開始
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      const mainLayout = page.getByTestId('main-layout');

      // モバイル: 1カラム確認
      let gridTemplateColumns = await mainLayout.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      // 1カラムの場合、gridTemplateColumnsは400pxを含まない
      expect(gridTemplateColumns).not.toMatch(/400px/);

      // デスクトップサイズに変更
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.reload();

      // デスクトップ: 2カラム確認
      gridTemplateColumns = await mainLayout.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(gridTemplateColumns).toMatch(/400px/);
    });
  });
});
