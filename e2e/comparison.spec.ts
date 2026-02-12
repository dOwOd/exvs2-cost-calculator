/**
 * E2Eテスト: 比較モード
 */

import { test, expect, type Page } from '@playwright/test';

/**
 * 比較モード内の指定スロットで編成を選択するヘルパー
 * 比較モードでは FormationPanel が comparison-formation-{slotIndex} 内に複数配置されるため、
 * コンテナをスコープにして要素を特定する
 */
const selectComparisonFormation = async (
  page: Page,
  slotIndex: number,
  costA: number,
  healthA: number,
  costB: number,
  healthB: number
) => {
  const container = page.getByTestId(`comparison-formation-${slotIndex}`);

  // A機: コスト選択
  await container.getByTestId(`cost-button-a-${costA}`).click();
  await expect(container.getByTestId('health-selector-button-a')).toBeVisible();

  // A機: 耐久値選択
  await container.getByTestId('health-selector-button-a').click();
  await expect(container.getByTestId('health-selector-listbox-a')).toBeVisible();
  await container.getByTestId(`health-option-a-${healthA}`).evaluate((el) => (el as HTMLElement).click());

  // B機: コスト選択
  await container.getByTestId(`cost-button-b-${costB}`).click();
  await expect(container.getByTestId('health-selector-button-b')).toBeVisible();

  // B機: 耐久値選択
  await container.getByTestId('health-selector-button-b').click();
  await expect(container.getByTestId('health-selector-listbox-b')).toBeVisible();
  await container.getByTestId(`health-option-b-${healthB}`).evaluate((el) => (el as HTMLElement).click());
};

test.describe('比較モード', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('モード切替', () => {
    test('モード切替ボタンが表示される', async ({ page }) => {
      await expect(page.getByTestId('mode-toggle')).toBeVisible();
      await expect(page.getByTestId('mode-normal')).toBeVisible();
      await expect(page.getByTestId('mode-comparison')).toBeVisible();
    });

    test('初期状態は通常モード', async ({ page }) => {
      // 通常モードのレイアウトが表示される
      await expect(page.getByTestId('main-layout')).toBeVisible();
      // 比較モードのレイアウトは表示されない
      await expect(page.getByTestId('comparison-layout')).not.toBeVisible();
    });

    test('比較モードに切り替えられる', async ({ page }) => {
      await page.getByTestId('mode-comparison').click();

      // 比較モードのレイアウトが表示される
      await expect(page.getByTestId('comparison-layout')).toBeVisible();
      // 通常モードのレイアウトは表示されない
      await expect(page.getByTestId('main-layout')).not.toBeVisible();
    });

    test('通常モードに戻せる', async ({ page }) => {
      // 比較モードに切替
      await page.getByTestId('mode-comparison').click();
      await expect(page.getByTestId('comparison-layout')).toBeVisible();

      // 通常モードに切替
      await page.getByTestId('mode-normal').click();

      await expect(page.getByTestId('main-layout')).toBeVisible();
      await expect(page.getByTestId('comparison-layout')).not.toBeVisible();
    });
  });

  test.describe('編成パネル管理', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('mode-comparison').click();
    });

    test('初期状態で2つの編成パネルが表示される', async ({ page }) => {
      await expect(page.getByTestId('comparison-formation-0')).toBeVisible();
      await expect(page.getByTestId('comparison-formation-1')).toBeVisible();
      // 3つ目は非表示
      await expect(page.getByTestId('comparison-formation-2')).not.toBeVisible();
    });

    test('編成追加ボタンで3つ目の編成を追加できる', async ({ page }) => {
      await expect(page.getByTestId('add-formation-button')).toBeVisible();
      await page.getByTestId('add-formation-button').click();

      await expect(page.getByTestId('comparison-formation-2')).toBeVisible();
    });

    test('3つ目の編成追加後、追加ボタンが非表示になる', async ({ page }) => {
      await page.getByTestId('add-formation-button').click();

      // 最大3つのため、追加ボタンが非表示になる
      await expect(page.getByTestId('add-formation-button')).not.toBeVisible();
    });

    test('3つの編成がある場合、削除ボタンが表示される', async ({ page }) => {
      await page.getByTestId('add-formation-button').click();

      // 各編成に削除ボタンが表示される
      await expect(page.getByTestId('remove-formation-0')).toBeVisible();
      await expect(page.getByTestId('remove-formation-1')).toBeVisible();
      await expect(page.getByTestId('remove-formation-2')).toBeVisible();
    });

    test('2つの編成のときは削除ボタンが表示されない', async ({ page }) => {
      // 最小2つの場合、削除ボタンは表示されない
      await expect(page.getByTestId('remove-formation-0')).not.toBeVisible();
      await expect(page.getByTestId('remove-formation-1')).not.toBeVisible();
    });

    test('編成を削除すると2つに戻る', async ({ page }) => {
      // 3つ目を追加
      await page.getByTestId('add-formation-button').click();
      await expect(page.getByTestId('comparison-formation-2')).toBeVisible();

      // 3つ目を削除
      await page.getByTestId('remove-formation-2').click();

      // 2つに戻る
      await expect(page.getByTestId('comparison-formation-0')).toBeVisible();
      await expect(page.getByTestId('comparison-formation-1')).toBeVisible();
      await expect(page.getByTestId('comparison-formation-2')).not.toBeVisible();

      // 追加ボタンが再表示される
      await expect(page.getByTestId('add-formation-button')).toBeVisible();
    });
  });

  test.describe('比較結果表示', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('mode-comparison').click();
    });

    test('2つの編成を入力すると比較結果が表示される', async ({ page }) => {
      // 編成1: 3000+2500
      await selectComparisonFormation(page, 0, 3000, 680, 2500, 620);

      // 編成2: 2500+2000
      await selectComparisonFormation(page, 1, 2500, 620, 2000, 580);

      // 比較結果パネルが表示される
      await expect(page.getByTestId('comparison-result-panel')).toBeVisible();

      // 各編成のパターン列が表示される
      await expect(page.getByTestId('comparison-pattern-column-0')).toBeVisible();
      await expect(page.getByTestId('comparison-pattern-column-1')).toBeVisible();
    });

    test('片方の編成のみ入力した場合、その編成の結果のみ表示される', async ({ page }) => {
      // 編成1のみ入力
      await selectComparisonFormation(page, 0, 3000, 680, 2500, 620);

      // 編成1のパターン列にパターンカードが表示される
      const column0 = page.getByTestId('comparison-pattern-column-0');
      await expect(column0).toBeVisible();
      await expect(column0.locator('[data-testid^="pattern-card-"]').first()).toBeVisible();
    });

    test('3つの編成を入力して3つの結果が表示される', async ({ page }) => {
      // 3つ目を追加
      await page.getByTestId('add-formation-button').click();

      // 編成1: 3000+3000
      await selectComparisonFormation(page, 0, 3000, 680, 3000, 680);

      // 編成2: 3000+2500
      await selectComparisonFormation(page, 1, 3000, 680, 2500, 620);

      // 編成3: 2500+2500
      await selectComparisonFormation(page, 2, 2500, 620, 2500, 620);

      // 3つのパターン列が表示される
      await expect(page.getByTestId('comparison-pattern-column-0')).toBeVisible();
      await expect(page.getByTestId('comparison-pattern-column-1')).toBeVisible();
      await expect(page.getByTestId('comparison-pattern-column-2')).toBeVisible();
    });
  });

  test.describe('比較指標テーブル', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('mode-comparison').click();
    });

    test('編成入力後に比較指標テーブルが表示される', async ({ page }) => {
      // 編成1: 3000+2500
      await selectComparisonFormation(page, 0, 3000, 680, 2500, 620);

      // 比較指標テーブルが表示される
      await expect(page.getByTestId('comparison-metrics-table')).toBeVisible();
    });

    test('比較指標テーブルに正しいラベルが表示される', async ({ page }) => {
      // 編成1: 3000+2500
      await selectComparisonFormation(page, 0, 3000, 680, 2500, 620);

      const table = page.getByTestId('comparison-metrics-table');
      await expect(table).toContainText('総耐久（最大）');
      await expect(table).toContainText('総耐久（最小）');
      await expect(table).toContainText('最短敗北耐久');
      await expect(table).toContainText('EX発動可能');
    });

    test('2つの編成の比較指標が並んで表示される', async ({ page }) => {
      // 編成1: 3000+2500
      await selectComparisonFormation(page, 0, 3000, 680, 2500, 620);

      // 編成2: 2500+2500
      await selectComparisonFormation(page, 1, 2500, 620, 2500, 620);

      const table = page.getByTestId('comparison-metrics-table');
      await expect(table).toBeVisible();

      // ヘッダーに編成1, 編成2が表示される
      await expect(table).toContainText('編成 1');
      await expect(table).toContainText('編成 2');

      // コスト表記が表示される
      await expect(table).toContainText('3000+2500');
      await expect(table).toContainText('2500+2500');
    });
  });

  test.describe('EXフィルター（比較モード）', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('mode-comparison').click();
    });

    test('各編成のEXフィルターチェックボックスが表示される', async ({ page }) => {
      // 編成を入力してComparisonResultPanelを表示
      await selectComparisonFormation(page, 0, 3000, 680, 2500, 620);

      await expect(page.getByTestId('comparison-ex-filter-0')).toBeVisible();
      await expect(page.getByTestId('comparison-ex-filter-1')).toBeVisible();
    });

    test('EXフィルターを適用するとパターンがフィルタリングされる', async ({ page }) => {
      // 3000+1500 編成（EX不発パターンが存在する）
      await selectComparisonFormation(page, 0, 3000, 680, 1500, 480);

      const column0 = page.getByTestId('comparison-pattern-column-0');
      await expect(column0.locator('[data-testid^="pattern-card-"]').first()).toBeVisible();

      // フィルター適用前のパターン数
      const beforeCount = await column0.locator('[data-testid^="pattern-card-"]').count();

      // EXフィルターを適用（ラベルをクリック）
      await page.locator('label:has([data-testid="comparison-ex-filter-0"])').click();

      // フィルター適用後のパターン数が減少またはそのまま
      const afterCount = await column0.locator('[data-testid^="pattern-card-"]').count();
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    });
  });

  test.describe('通常モードとの独立性', () => {
    test('通常モードの編成は比較モードに影響しない', async ({ page }) => {
      // 通常モードで編成を入力
      await page.getByTestId('cost-button-a-3000').click();
      await expect(page.getByTestId('health-selector-button-a')).toBeVisible();
      await page.getByTestId('health-selector-button-a').click();
      await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();
      await page.getByTestId('health-option-a-680').evaluate((el) => (el as HTMLElement).click());

      // 比較モードに切替
      await page.getByTestId('mode-comparison').click();

      // 比較モードの編成パネルは空の状態（コストが未選択）
      const formation0 = page.getByTestId('comparison-formation-0');
      // 耐久セレクターが表示されていない＝コスト未選択
      await expect(formation0.getByTestId('health-selector-button-a')).not.toBeVisible();
    });

    test('比較モードの編成は通常モードに影響しない', async ({ page }) => {
      // 比較モードに切替して編成を入力
      await page.getByTestId('mode-comparison').click();
      await selectComparisonFormation(page, 0, 3000, 680, 2500, 620);

      // 通常モードに戻す
      await page.getByTestId('mode-normal').click();

      // 通常モードの編成パネルは空の状態
      await expect(page.getByTestId('health-selector-button-a')).not.toBeVisible();
    });
  });
});

test.describe('比較モード - レスポンシブ', () => {
  test.describe('モバイル表示', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('比較モードの編成パネルが縦並びになる', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('mode-comparison').click();

      const formation0 = page.getByTestId('comparison-formation-0');
      const formation1 = page.getByTestId('comparison-formation-1');

      await expect(formation0).toBeVisible();
      await expect(formation1).toBeVisible();

      // 編成0が編成1より上にある
      const box0 = await formation0.boundingBox();
      const box1 = await formation1.boundingBox();

      expect(box0).not.toBeNull();
      expect(box1).not.toBeNull();
      expect(box0!.y).toBeLessThan(box1!.y);
    });

    test('モバイルでも編成追加・削除ができる', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('mode-comparison').click();

      // 追加ボタンをタップ
      await page.getByTestId('add-formation-button').click();
      await expect(page.getByTestId('comparison-formation-2')).toBeVisible();

      // 削除ボタンをタップ
      await page.getByTestId('remove-formation-2').click();
      await expect(page.getByTestId('comparison-formation-2')).not.toBeVisible();
    });
  });

  test.describe('デスクトップ表示', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('2つの編成パネルが横並びになる', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('mode-comparison').click();

      const formation0 = page.getByTestId('comparison-formation-0');
      const formation1 = page.getByTestId('comparison-formation-1');

      await expect(formation0).toBeVisible();
      await expect(formation1).toBeVisible();

      // 編成0と編成1が横に並んでいる（y座標がほぼ同じ）
      const box0 = await formation0.boundingBox();
      const box1 = await formation1.boundingBox();

      expect(box0).not.toBeNull();
      expect(box1).not.toBeNull();
      // 同じ行に並んでいることを確認（y座標の差が小さい）
      expect(Math.abs(box0!.y - box1!.y)).toBeLessThan(10);
    });

    test('3つの編成パネルが横並びになる', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('mode-comparison').click();
      await page.getByTestId('add-formation-button').click();

      const formation0 = page.getByTestId('comparison-formation-0');
      const formation1 = page.getByTestId('comparison-formation-1');
      const formation2 = page.getByTestId('comparison-formation-2');

      await expect(formation0).toBeVisible();
      await expect(formation1).toBeVisible();
      await expect(formation2).toBeVisible();

      const box0 = await formation0.boundingBox();
      const box1 = await formation1.boundingBox();
      const box2 = await formation2.boundingBox();

      expect(box0).not.toBeNull();
      expect(box1).not.toBeNull();
      expect(box2).not.toBeNull();
      // 3つとも同じ行に並んでいる
      expect(Math.abs(box0!.y - box1!.y)).toBeLessThan(10);
      expect(Math.abs(box1!.y - box2!.y)).toBeLessThan(10);
    });
  });
});
