/**
 * E2Eテスト: レスポンシブデザイン（モバイル・タブレット）
 *
 * すべてのブラウザ・デバイスで実行
 */

import { test, expect } from '@playwright/test';

test.describe('レスポンシブデザイン - モバイル・タブレット', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('モバイル表示 (< 640px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('レイアウトが縦並びになる', async ({ page }) => {
      // メインコンテナが表示されていることを確認
      const mainLayout = page.locator('[data-testid="main-layout"]');
      await expect(mainLayout).toBeVisible();

      // A機とB機のパネルが縦に並んでいることを確認
      const panelA = page.getByTestId('formation-panel-a');
      const panelB = page.getByTestId('formation-panel-b');

      await expect(panelA).toBeVisible();
      await expect(panelB).toBeVisible();

      // A機のパネルがB機のパネルより上にあることを確認
      const boxA = await panelA.boundingBox();
      const boxB = await panelB.boundingBox();

      expect(boxA).not.toBeNull();
      expect(boxB).not.toBeNull();
      expect(boxA!.y).toBeLessThan(boxB!.y);
    });

    test('コストボタンのタップターゲットが44px以上', async ({ page }) => {
      const costButton = page.getByTestId('cost-button-a-3000');
      await expect(costButton).toBeVisible();

      const box = await costButton.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('パターンカードのテーブルが横スクロール可能', async ({ page }) => {
      // A機: コスト選択
      await page.getByTestId('cost-button-a-3000').click();
      await expect(page.getByTestId('health-selector-button-a')).toBeVisible();

      // A機: 耐久値選択（evaluate でポップアップオーバーレイを確実に回避）
      await page.getByTestId('health-selector-button-a').click();
      const listboxA = page.getByTestId('health-selector-listbox-a');
      await expect(listboxA).toBeVisible();
      await page.getByTestId('health-option-a-800').evaluate((el) => (el as HTMLElement).click());

      // A機の選択が反映されるのを待つ
      await expect(page.getByTestId('health-selector-button-a')).toContainText('800');

      // B機: コスト選択
      await page.getByTestId('cost-button-b-2500').click();
      await expect(page.getByTestId('health-selector-button-b')).toBeVisible();

      // B機: 耐久値選択（evaluate でポップアップオーバーレイを確実に回避）
      await page.getByTestId('health-selector-button-b').click();
      const listboxB = page.getByTestId('health-selector-listbox-b');
      await expect(listboxB).toBeVisible();
      await page.getByTestId('health-option-b-700').evaluate((el) => (el as HTMLElement).click());

      // B機の選択が反映されるのを待つ
      await expect(page.getByTestId('health-selector-button-b')).toContainText('700');

      // パターンカードが表示されるのを待つ
      const tableContainer = page.getByTestId('pattern-table-container-1');
      await expect(tableContainer).toBeVisible();

      // テーブルが存在することを確認
      const table = tableContainer.locator('table');
      await expect(table).toBeVisible();

      // テーブルの幅がコンテナの幅以上であることを確認（横スクロール可能な状態）
      const tableWidth = await table.evaluate((el) => el.scrollWidth);
      const containerWidth = await tableContainer.evaluate((el) => el.clientWidth);
      expect(tableWidth).toBeGreaterThanOrEqual(containerWidth);
    });

    test('耐久セレクターのタップターゲットが44px以上', async ({ page }) => {
      // コストを選択して耐久セレクターを表示（evaluate でクリック確実化）
      const costButton = page.getByTestId('cost-button-a-3000');
      await expect(costButton).toBeVisible();
      await costButton.evaluate((el) => (el as HTMLElement).click());
      await expect(page.getByTestId('health-selector-button-a')).toBeVisible({ timeout: 10000 });

      const healthButton = page.getByTestId('health-selector-button-a');
      const box = await healthButton.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('タブレット表示 (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('レイアウトが縦並びになる', async ({ page }) => {
      const panelA = page.getByTestId('formation-panel-a');
      const panelB = page.getByTestId('formation-panel-b');

      await expect(panelA).toBeVisible();
      await expect(panelB).toBeVisible();

      // A機のパネルがB機のパネルより上にあることを確認
      const boxA = await panelA.boundingBox();
      const boxB = await panelB.boundingBox();

      expect(boxA).not.toBeNull();
      expect(boxB).not.toBeNull();
      expect(boxA!.y).toBeLessThan(boxB!.y);
    });
  });
});
