/**
 * E2Eテスト: ヘッダーナビゲーション
 *
 * すべてのブラウザ・デバイスで実行
 */

import { test, expect, type Page } from '@playwright/test';
import { BASE } from './helpers';

/** サイトヘッダーを取得（Firefox デバッグUIの header 要素との衝突を回避） */
const getSiteHeader = (page: Page) => page.locator('body > header');

test.describe('ヘッダーナビゲーション', () => {
  test.describe('ヘッダー表示', () => {
    const pages = [
      { path: `${BASE}/`, name: 'トップページ' },
      { path: `${BASE}/guide/`, name: 'ガイドページ' },
      { path: `${BASE}/faq/`, name: 'FAQページ' },
    ];

    for (const { path, name } of pages) {
      test(`${name}（${path}）でヘッダーが表示される`, async ({ page }) => {
        await page.goto(path);

        const header = getSiteHeader(page);
        await expect(header).toBeVisible();

        // サイト名リンクが表示される
        await expect(header.locator('a', { hasText: 'EXVS2 コスト計算機' })).toBeVisible();

        // メインナビゲーションが表示される
        const nav = header.locator('nav[aria-label="メインナビゲーション"]');
        await expect(nav).toBeVisible();

        // ナビリンクが表示される
        await expect(nav.locator('a', { hasText: 'コスト計算' })).toBeVisible();
        await expect(nav.locator('a', { hasText: 'ガイド' })).toBeVisible();
        await expect(nav.locator('a', { hasText: 'FAQ' })).toBeVisible();

        // ThemeToggle が表示される
        await expect(header.getByTestId('theme-toggle')).toBeVisible();
      });
    }
  });

  test.describe('ナビリンク遷移', () => {
    test('計算機リンクでトップページに遷移する', async ({ page }) => {
      await page.goto(`${BASE}/guide/`);

      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      await nav.locator('a', { hasText: 'コスト計算' }).click();

      await expect(page).toHaveURL(`${BASE}/`);
    });

    test('ガイドリンクでガイドページに遷移する', async ({ page }) => {
      await page.goto(`${BASE}/`);

      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      await nav.locator('a', { hasText: 'ガイド' }).click();

      await expect(page).toHaveURL(`${BASE}/guide/`);
    });

    test('FAQリンクでFAQページに遷移する', async ({ page }) => {
      await page.goto(`${BASE}/`);

      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      await nav.locator('a', { hasText: 'FAQ' }).click();

      await expect(page).toHaveURL(`${BASE}/faq/`);
    });
  });

  test.describe('aria-current ハイライト', () => {
    test('トップページで計算機リンクがハイライトされる', async ({ page }) => {
      await page.goto(`${BASE}/`);

      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      const calculatorLink = nav.locator('a', { hasText: 'コスト計算' });
      const guideLink = nav.locator('a', { hasText: 'ガイド' });
      const faqLink = nav.locator('a', { hasText: 'FAQ' });

      await expect(calculatorLink).toHaveAttribute('aria-current', 'page');
      await expect(guideLink).not.toHaveAttribute('aria-current', 'page');
      await expect(faqLink).not.toHaveAttribute('aria-current', 'page');
    });

    test('ガイドページでガイドリンクがハイライトされる', async ({ page }) => {
      await page.goto(`${BASE}/guide/`);

      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      const calculatorLink = nav.locator('a', { hasText: 'コスト計算' });
      const guideLink = nav.locator('a', { hasText: 'ガイド' });
      const faqLink = nav.locator('a', { hasText: 'FAQ' });

      await expect(calculatorLink).not.toHaveAttribute('aria-current', 'page');
      await expect(guideLink).toHaveAttribute('aria-current', 'page');
      await expect(faqLink).not.toHaveAttribute('aria-current', 'page');
    });

    test('FAQページでFAQリンクがハイライトされる', async ({ page }) => {
      await page.goto(`${BASE}/faq/`);

      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      const calculatorLink = nav.locator('a', { hasText: 'コスト計算' });
      const guideLink = nav.locator('a', { hasText: 'ガイド' });
      const faqLink = nav.locator('a', { hasText: 'FAQ' });

      await expect(calculatorLink).not.toHaveAttribute('aria-current', 'page');
      await expect(guideLink).not.toHaveAttribute('aria-current', 'page');
      await expect(faqLink).toHaveAttribute('aria-current', 'page');
    });

    test('ページ遷移後にハイライトが更新される', async ({ page }) => {
      await page.goto(`${BASE}/`);

      const nav = page.locator('nav[aria-label="メインナビゲーション"]');

      // トップページ: 計算機がハイライト
      await expect(nav.locator('a', { hasText: 'コスト計算' })).toHaveAttribute(
        'aria-current',
        'page',
      );

      // ガイドページに遷移
      await nav.locator('a', { hasText: 'ガイド' }).click();
      await expect(page).toHaveURL(`${BASE}/guide/`);

      // ガイドがハイライトに変わる
      await expect(nav.locator('a', { hasText: 'ガイド' })).toHaveAttribute('aria-current', 'page');
      await expect(nav.locator('a', { hasText: 'コスト計算' })).not.toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });

  test.describe('サイト名リンク', () => {
    test('ガイドページからサイト名クリックでトップに遷移する', async ({ page }) => {
      await page.goto(`${BASE}/guide/`);

      const header = getSiteHeader(page);
      await header.locator('a', { hasText: 'EXVS2 コスト計算機' }).click();

      await expect(page).toHaveURL(`${BASE}/`);
    });

    test('FAQページからサイト名クリックでトップに遷移する', async ({ page }) => {
      await page.goto(`${BASE}/faq/`);

      const header = getSiteHeader(page);
      await header.locator('a', { hasText: 'EXVS2 コスト計算機' }).click();

      await expect(page).toHaveURL(`${BASE}/`);
    });
  });

  test.describe('ThemeToggle', () => {
    test('ヘッダー内のThemeToggleでテーマが切り替わる', async ({ page }) => {
      await page.goto('/');

      const header = getSiteHeader(page);
      const themeToggle = header.getByTestId('theme-toggle');

      // 初期状態を確認（デフォルトはシステム設定依存なのでクラスで確認）
      const htmlElement = page.locator('html');
      const initialHasDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));

      // テーマを切り替え
      await themeToggle.click();

      // クラスが変わったことを確認
      const afterToggleHasDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));
      expect(afterToggleHasDark).toBe(!initialHasDark);

      // もう一度切り替えて元に戻る
      await themeToggle.click();
      const afterSecondToggleHasDark = await htmlElement.evaluate((el) =>
        el.classList.contains('dark'),
      );
      expect(afterSecondToggleHasDark).toBe(initialHasDark);
    });

    test('テーマ切り替え後もページ遷移で維持される', async ({ page }) => {
      // ライトモードを明示的に設定してからページを開く
      await page.goto('/');
      await page.evaluate(() => localStorage.setItem('theme', 'light'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      // ライトモード確認
      await expect(page.locator('html')).not.toHaveClass(/dark/);

      // ThemeToggle がハイドレーション済みであることを確認するため表示を待つ
      const themeToggle = getSiteHeader(page).getByTestId('theme-toggle');
      await expect(themeToggle).toBeVisible();

      // ダークモードに切り替え
      await themeToggle.click();
      await expect(page.locator('html')).toHaveClass(/dark/);

      // ガイドページに遷移
      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      await nav.locator('a', { hasText: 'ガイド' }).click();
      await expect(page).toHaveURL('/guide/');

      // ダークモードが維持されている
      await expect(page.locator('html')).toHaveClass(/dark/);
    });
  });

  test.describe('モバイル表示', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('モバイルでヘッダーが表示される', async ({ page }) => {
      await page.goto('/');

      const header = getSiteHeader(page);
      await expect(header).toBeVisible();

      // サイト名が表示される
      await expect(header.locator('a', { hasText: 'EXVS2 コスト計算機' })).toBeVisible();

      // ナビリンクが表示される
      const nav = header.locator('nav[aria-label="メインナビゲーション"]');
      await expect(nav.locator('a', { hasText: 'コスト計算' })).toBeVisible();
      await expect(nav.locator('a', { hasText: 'ガイド' })).toBeVisible();
      await expect(nav.locator('a', { hasText: 'FAQ' })).toBeVisible();
    });

    test('モバイルでナビリンクが遷移できる', async ({ page }) => {
      await page.goto('/');

      const nav = page.locator('nav[aria-label="メインナビゲーション"]');

      // ガイドに遷移
      await nav.locator('a', { hasText: 'ガイド' }).click();
      await expect(page).toHaveURL('/guide/');

      // FAQに遷移
      await nav.locator('a', { hasText: 'FAQ' }).click();
      await expect(page).toHaveURL('/faq/');

      // トップに遷移
      await nav.locator('a', { hasText: 'コスト計算' }).click();
      await expect(page).toHaveURL('/');
    });

    test('モバイルでThemeToggleが使える', async ({ page }) => {
      await page.goto('/');

      const themeToggle = getSiteHeader(page).getByTestId('theme-toggle');
      await expect(themeToggle).toBeVisible();

      // タップターゲットサイズの確認
      const box = await themeToggle.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(36);
      expect(box!.height).toBeGreaterThanOrEqual(36);

      // クリックでテーマが切り替わる
      const initialHasDark = await page
        .locator('html')
        .evaluate((el) => el.classList.contains('dark'));
      await themeToggle.click();
      const afterToggleHasDark = await page
        .locator('html')
        .evaluate((el) => el.classList.contains('dark'));
      expect(afterToggleHasDark).toBe(!initialHasDark);
    });
  });
});
