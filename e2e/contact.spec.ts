/**
 * E2Eテスト: お問い合わせページ
 *
 * ENABLE_CONTACT = true の状態でのテスト。
 * Turnstile は PUBLIC_ENABLE_TURNSTILE=false でビルド時に無効化。
 * フォーム送信（API連携）のテストは Phase 3 結合テストで本番環境にて実施。
 */

import { test, expect } from '@playwright/test';
import { BASE } from './helpers';

test.describe('お問い合わせページ', () => {
  test.beforeEach(async ({ page }) => {
    // API リクエストをブロック（E2E では API 連携をテストしない）
    await page.route(/dowo-api/, (route) => route.abort());
    // 外部スクリプト（AdSense, CF Analytics）の読み込み完了を待たない
    await page.goto(`${BASE}/contact/`, { waitUntil: 'domcontentloaded' });
  });

  test.describe('ページ表示', () => {
    test('ページタイトルが表示される', async ({ page }) => {
      await expect(page.locator('h1')).toHaveText('お問い合わせ');
    });

    test('フォームが表示される', async ({ page }) => {
      await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
    });

    test('全フィールドが表示される', async ({ page }) => {
      await expect(page.locator('label', { hasText: 'お名前' })).toBeVisible();
      await expect(page.locator('label', { hasText: 'メールアドレス' })).toBeVisible();
      await expect(page.locator('label', { hasText: 'カテゴリ' })).toBeVisible();
      await expect(page.locator('label', { hasText: 'お問い合わせ内容' })).toBeVisible();
    });

    test('送信ボタンが表示される', async ({ page }) => {
      await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-button"]')).toHaveText('送信する');
    });

    test('カテゴリの選択肢が4つ表示される', async ({ page }) => {
      const select = page.locator('#contact-category');
      const options = select.locator('option');
      // placeholder + 4 categories
      await expect(options).toHaveCount(5);
    });

    test('文字数カウンターが表示される', async ({ page }) => {
      await expect(page.getByText('0/2000')).toBeVisible();
    });
  });

  test.describe('バリデーション', () => {
    test('空のフォームを送信するとエラーが表示される', async ({ page }) => {
      await page.locator('[data-testid="submit-button"]').click();

      await expect(page.getByText('お名前を入力してください')).toBeVisible();
      await expect(page.getByText('カテゴリを選択してください')).toBeVisible();
      await expect(page.getByText('お問い合わせ内容を入力してください')).toBeVisible();
    });

    test('不正なメールアドレスでエラーが表示される', async ({ page }) => {
      await page.locator('#contact-name').fill('テスト');
      await page.locator('#contact-email').fill('invalid');
      await page.locator('#contact-category').selectOption('bug');
      await page.locator('#contact-message').fill('テスト内容');

      await page.locator('[data-testid="submit-button"]').click();

      await expect(page.getByText('メールアドレスの形式が正しくありません')).toBeVisible();
    });

    test('フィールド入力時にエラーがクリアされる', async ({ page }) => {
      // エラーを発生させる
      await page.locator('[data-testid="submit-button"]').click();
      await expect(page.getByText('お名前を入力してください')).toBeVisible();

      // 名前を入力するとエラーがクリアされる
      await page.locator('#contact-name').fill('テスト');
      await expect(page.getByText('お名前を入力してください')).not.toBeVisible();
    });

    test('メッセージ入力で文字数カウンターが更新される', async ({ page }) => {
      await page.locator('#contact-message').fill('テスト');
      await expect(page.getByText('3/2000')).toBeVisible();
    });
  });

  test.describe('JSON-LD構造化データ', () => {
    test('BreadcrumbList JSON-LDが正しく出力されている', async ({ page }) => {
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();

      let foundBreadcrumb = false;
      for (let i = 0; i < count; i++) {
        const content = await jsonLdScripts.nth(i).textContent();
        if (content) {
          const json = JSON.parse(content);
          if (json['@type'] === 'BreadcrumbList') {
            foundBreadcrumb = true;
            expect(json['@context']).toBe('https://schema.org');
            expect(json.itemListElement).toHaveLength(2);
            expect(json.itemListElement[0].name).toBe('トップ');
            expect(json.itemListElement[1].name).toBe('お問い合わせ');
          }
        }
      }
      expect(foundBreadcrumb).toBe(true);
    });
  });

  test.describe('ヘッダーナビゲーション', () => {
    test('ヘッダーにお問い合わせリンクが表示される', async ({ page }) => {
      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      await expect(nav.locator('a', { hasText: 'お問い合わせ' })).toBeVisible();
    });

    test('お問い合わせページでナビリンクがハイライトされる', async ({ page }) => {
      const nav = page.locator('nav[aria-label="メインナビゲーション"]');
      const contactLink = nav.locator('a', { hasText: 'お問い合わせ' });
      await expect(contactLink).toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('ダークモード', () => {
    test('ダークモードでフォームが正しく表示される', async ({ page }) => {
      await page.evaluate(() => localStorage.setItem('theme', 'dark'));
      await page.reload({ waitUntil: 'domcontentloaded' });

      await expect(page.locator('html')).toHaveClass(/dark/);
      await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
    });
  });

  test.describe('アクセシビリティ', () => {
    test('必須フィールドにaria-invalid属性が設定される', async ({ page }) => {
      // 送信してエラーを発生させる
      await page.locator('[data-testid="submit-button"]').click();

      await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#contact-category')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#contact-message')).toHaveAttribute('aria-invalid', 'true');
    });

    test('エラーメッセージにrole="alert"が設定される', async ({ page }) => {
      await page.locator('[data-testid="submit-button"]').click();

      const alerts = page.locator('[role="alert"]');
      const count = await alerts.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });
});
