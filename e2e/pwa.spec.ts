/**
 * E2Eテスト: PWA動作確認
 *
 * Service Workerの登録、オフライン動作、キャッシュ戦略をテスト
 * 注意: Service Workerのテストは Chromium でのみ安定して動作する
 */

import { test, expect } from '@playwright/test';

test.describe('PWA機能', () => {
  // Service WorkerのテストはChromiumのみで実行
  test.skip(({ browserName }) => browserName !== 'chromium', 'Service Worker tests require Chromium');

  test('Service Workerが正常に登録される', async ({ page }) => {
    await page.goto('/');

    // Service Workerが登録されるまで待機
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      // 既存の登録を確認、なければ待機
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        // 登録完了を待機（最大5秒）
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 5000);
          navigator.serviceWorker.ready.then(() => {
            clearTimeout(timeout);
            resolve();
          });
        });
        registration = await navigator.serviceWorker.getRegistration();
      }

      return !!registration;
    });

    expect(swRegistered).toBe(true);
  });

  test('manifest.jsonが正しく読み込まれる', async ({ page }) => {
    // manifest.jsonを直接取得
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();

    // 必須フィールドの確認
    expect(manifest.name).toBe('EXVS2 コスト計算機');
    expect(manifest.short_name).toBe('EXVS2計算機');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0f172a');
    expect(manifest.icons).toHaveLength(3);
  });

  test('PWA用アイコンが存在する', async ({ page }) => {
    const iconPaths = [
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png',
      '/icons/icon-180x180.png',
      '/icons/maskable-icon-512x512.png',
    ];

    for (const path of iconPaths) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should exist`).toBe(200);
      expect(response?.headers()['content-type']).toContain('image/png');
    }
  });

  test('オフラインでもページが表示される', async ({ page, context }) => {
    // 1. オンラインでページにアクセス（キャッシュを作成）
    await page.goto('/');

    // ページが完全にロードされるまで待機
    await expect(page.locator('h1')).toContainText('EXVS2');

    // Service Workerがアクティブになるまで待機
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
      }
    });

    // キャッシュが作成されるのを少し待機
    await page.waitForTimeout(1000);

    // 2. オフラインモードに切り替え
    await context.setOffline(true);

    // 3. ページをリロード
    await page.reload();

    // 4. ページが表示されることを確認
    await expect(page.locator('h1')).toContainText('EXVS2');
    await expect(page.locator('body')).toContainText('コスト計算機');
  });

  test('オフラインでも機体選択が動作する', async ({ page, context }) => {
    // 1. オンラインでページにアクセス
    await page.goto('/');

    // Service Workerがアクティブになるまで待機
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
      }
    });

    // キャッシュが作成されるのを少し待機
    await page.waitForTimeout(1000);

    // 2. オフラインモードに切り替え
    await context.setOffline(true);

    // 3. ページをリロード
    await page.reload();

    // 4. 機体選択が動作することを確認
    await page.getByTestId('cost-button-a-3000').click();
    await expect(page.getByTestId('health-selector-button-a')).toBeVisible();

    await page.getByTestId('health-selector-button-a').click();
    await expect(page.getByTestId('health-selector-listbox-a')).toBeVisible();

    await page.getByTestId('health-option-a-680').click();

    // B機も選択
    await page.getByTestId('cost-button-b-2500').click();
    await expect(page.getByTestId('health-selector-button-b')).toBeVisible();

    await page.getByTestId('health-selector-button-b').click();
    await expect(page.getByTestId('health-selector-listbox-b')).toBeVisible();

    await page.getByTestId('health-option-b-640').click();

    // 結果が表示されることを確認
    await expect(page.getByTestId('pattern-card-1')).toBeVisible();
  });
});
