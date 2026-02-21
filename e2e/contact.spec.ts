/**
 * E2Eテスト: お問い合わせページ
 *
 * ENABLE_CONTACT = false の状態でのテスト。
 * フォーム送信のE2Eテストは Phase 1（Worker API）完了後に追加する。
 */

import { test, expect } from '@playwright/test';
import { BASE } from './helpers';

test.describe('お問い合わせページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/contact/`);
  });

  test.describe('ページ表示', () => {
    test('ページタイトルが表示される', async ({ page }) => {
      await expect(page.locator('h1')).toHaveText('お問い合わせ');
    });

    test('準備中メッセージが表示される（ENABLE_CONTACT = false）', async ({ page }) => {
      await expect(page.locator('[data-testid="contact-disabled"]')).toBeVisible();
      await expect(page.getByText('問い合わせ機能は現在準備中です。')).toBeVisible();
    });

    test('フォームは表示されない（ENABLE_CONTACT = false）', async ({ page }) => {
      await expect(page.locator('[data-testid="contact-form"]')).toHaveCount(0);
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

  test.describe('ダークモード', () => {
    test('ダークモードで準備中メッセージが表示される', async ({ page }) => {
      await page.evaluate(() => localStorage.setItem('theme', 'dark'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page.locator('html')).toHaveClass(/dark/);
      await expect(page.locator('[data-testid="contact-disabled"]')).toBeVisible();
    });
  });
});
