/**
 * E2Eテスト: 機体選択時のフィードバック表示
 * Issue #24: 片方選択時も状態を表示
 */

import { test, expect } from '@playwright/test';
import { BASE } from './helpers';

test.describe('機体選択時のフィードバック表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`);
  });

  test('初期状態でガイダンスが表示される', async ({ page }) => {
    // 初期状態でガイダンスメッセージが表示される
    await expect(page.getByTestId('formation-guidance')).toBeVisible();
    await expect(page.getByTestId('formation-guidance')).toContainText(
      '編成を入力すると計算結果が表示されます',
    );
  });

  test('初期状態で両方の機体が未選択と表示される', async ({ page }) => {
    // A機が未選択と表示される
    await expect(page.getByTestId('formation-status-a')).toBeVisible();
    await expect(page.getByTestId('formation-status-a')).toContainText('未選択');

    // B機が未選択と表示される
    await expect(page.getByTestId('formation-status-b')).toBeVisible();
    await expect(page.getByTestId('formation-status-b')).toContainText('未選択');
  });

  test('機体Aのみ選択時に状態が表示される', async ({ page }) => {
    // A機: コスト3000を選択
    await page.getByTestId('cost-button-a-3000').click();
    await expect(page.getByTestId('health-selector-button-a')).toBeVisible();
    await page.getByTestId('health-selector-button-a').click();
    await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();
    await page.getByTestId('health-option-a-680').click();

    // A機の情報が表示される
    await expect(page.getByTestId('formation-status-a')).toContainText('コスト3000');
    await expect(page.getByTestId('formation-status-a')).toContainText('耐久680');

    // B機は未選択と表示される
    await expect(page.getByTestId('formation-status-b')).toContainText('未選択');

    // ガイダンスが機体Bの選択を促す
    await expect(page.getByTestId('formation-guidance')).toContainText('機体B');
  });

  test('機体Bのみ選択時に状態が表示される', async ({ page }) => {
    // B機: コスト2500を選択
    await page.getByTestId('cost-button-b-2500').click();
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();
    await page.getByTestId('health-selector-button-b').click();
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();
    await page.getByTestId('health-option-b-640').click();

    // A機は未選択と表示される
    await expect(page.getByTestId('formation-status-a')).toContainText('未選択');

    // B機の情報が表示される
    await expect(page.getByTestId('formation-status-b')).toContainText('コスト2500');
    await expect(page.getByTestId('formation-status-b')).toContainText('耐久640');

    // ガイダンスが機体Aの選択を促す
    await expect(page.getByTestId('formation-guidance')).toContainText('機体A');
  });

  test('両方選択時にガイダンスが非表示になる', async ({ page }) => {
    // A機を選択
    await page.getByTestId('cost-button-a-3000').click();
    await expect(page.getByTestId('health-selector-button-a')).toBeVisible();
    await page.getByTestId('health-selector-button-a').click();
    await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();
    await page.getByTestId('health-option-a-680').click();

    // B機を選択
    await page.getByTestId('cost-button-b-2500').click();
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();
    await page.getByTestId('health-selector-button-b').click();
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();
    await page.getByTestId('health-option-b-640').click();

    // ガイダンスが非表示になる
    await expect(page.getByTestId('formation-guidance')).not.toBeVisible();

    // 結果パネルが表示される
    await expect(page.getByTestId('pattern-card-1')).toBeVisible();
  });
});
