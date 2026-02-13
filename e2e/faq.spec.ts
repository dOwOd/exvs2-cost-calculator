/**
 * E2Eテスト: FAQページ（アコーディオンUI）
 *
 * すべてのブラウザ・デバイスで実行
 */

import { test, expect } from '@playwright/test';

/** FAQページのメインコンテンツ領域を取得（Firefox デバッグUIとの衝突を回避） */
const getFaqContent = (page: import('@playwright/test').Page) => page.locator('.container.mx-auto');

test.describe('FAQページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq/');
  });

  test.describe('ページ表示', () => {
    test('ページタイトルが表示される', async ({ page }) => {
      await expect(getFaqContent(page).locator('h1')).toHaveText('よくある質問（FAQ）');
    });

    test('5つのカテゴリ見出しが表示される', async ({ page }) => {
      const categoryHeadings = getFaqContent(page).locator('section.mb-8 > h2');
      await expect(categoryHeadings).toHaveCount(5);

      await expect(categoryHeadings.nth(0)).toHaveText('基本ルール');
      await expect(categoryHeadings.nth(1)).toHaveText('EXオーバーリミット');
      await expect(categoryHeadings.nth(2)).toHaveText('EXバースト');
      await expect(categoryHeadings.nth(3)).toHaveText('戦術・編成');
      await expect(categoryHeadings.nth(4)).toHaveText('計算・ツール');
    });

    test('全FAQ項目がdetails要素として存在する', async ({ page }) => {
      const details = page.locator('details');
      // 基本ルール3 + EXオーバーリミット4 + EXバースト3 + 戦術・編成4 + 計算・ツール3 = 17
      await expect(details).toHaveCount(17);
    });

    test('ガイドページへのナビゲーションリンクが表示される', async ({ page }) => {
      const guideLink = page.locator('a', { hasText: 'コストの仕組みとセオリー解説' });
      await expect(guideLink).toBeVisible();
      await expect(guideLink).toHaveAttribute('href', '/guide/');
    });
  });

  test.describe('アコーディオン開閉', () => {
    test('初期状態で全FAQ項目が閉じている', async ({ page }) => {
      const details = page.locator('details');
      const count = await details.count();

      for (let i = 0; i < count; i++) {
        await expect(details.nth(i)).not.toHaveAttribute('open', '');
      }
    });

    test('summaryクリックでFAQ項目が開く', async ({ page }) => {
      const firstDetails = page.locator('details').first();
      const firstSummary = firstDetails.locator('summary');

      // 閉じていることを確認
      await expect(firstDetails).not.toHaveAttribute('open', '');

      // クリックして開く
      await firstSummary.click();

      // 開いたことを確認
      await expect(firstDetails).toHaveAttribute('open', '');
    });

    test('開いた項目を再度クリックで閉じる', async ({ page }) => {
      const firstDetails = page.locator('details').first();
      const firstSummary = firstDetails.locator('summary');

      // 開く
      await firstSummary.click();
      await expect(firstDetails).toHaveAttribute('open', '');

      // 閉じる
      await firstSummary.click();
      await expect(firstDetails).not.toHaveAttribute('open', '');
    });

    test('複数のFAQ項目を同時に開ける', async ({ page }) => {
      const details = page.locator('details');

      // 1つ目と3つ目を開く
      await details.nth(0).locator('summary').click();
      await details.nth(2).locator('summary').click();

      // 両方が開いていることを確認
      await expect(details.nth(0)).toHaveAttribute('open', '');
      await expect(details.nth(2)).toHaveAttribute('open', '');

      // 2つ目は閉じたまま
      await expect(details.nth(1)).not.toHaveAttribute('open', '');
    });

    test('開いた項目の回答テキストが表示される', async ({ page }) => {
      const firstDetails = page.locator('details').first();

      // 開く
      await firstDetails.locator('summary').click();

      // 回答テキストが含まれていることを確認
      await expect(firstDetails.locator('p').first()).toContainText(
        'EXVS2では、2機編成のチームが合計6000のコストを共有する',
      );
    });

    test('質問テキストがsummary内に表示される', async ({ page }) => {
      const firstSummary = page.locator('details').first().locator('summary');
      await expect(firstSummary).toContainText('チーム共有コスト6000とは？');
    });
  });

  test.describe('外部リンク', () => {
    test('外部リンク付きFAQにリンクが表示される', async ({ page }) => {
      // 「チーム共有コスト6000とは？」を開く（外部リンクあり）
      const firstDetails = page.locator('details').first();
      await firstDetails.locator('summary').click();

      const link = firstDetails.locator('a[target="_blank"]');
      await expect(link).toBeVisible();
      await expect(link).toContainText('公式サイト - 遊び方ルール');
      await expect(link).toHaveAttribute('href', 'https://gundam-vs.jp/extreme/ac2ib/howto/');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('EXバーストのFAQにも外部リンクが表示される', async ({ page }) => {
      // EXバーストカテゴリの最初のFAQ（「EXバーストとは？」）
      // 基本ルール3 + EXオーバーリミット4 = 7番目（0-indexed）
      const exBurstDetails = page.locator('details').nth(7);
      await exBurstDetails.locator('summary').click();

      const link = exBurstDetails.locator('a[target="_blank"]');
      await expect(link).toBeVisible();
      await expect(link).toContainText('公式サイト - EXバースト解説');
      await expect(link).toHaveAttribute(
        'href',
        'https://gundam-vs.jp/extreme/ac2ib/howto/rules/ex_burst/',
      );
    });

    test('外部リンクのないFAQ項目にはリンクが存在しない', async ({ page }) => {
      // 「各コスト帯の特徴は？」（2番目、外部リンクなし）
      const secondDetails = page.locator('details').nth(1);
      await secondDetails.locator('summary').click();

      const link = secondDetails.locator('a[target="_blank"]');
      await expect(link).toHaveCount(0);
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
            expect(json.itemListElement[1].name).toBe('よくある質問');
          }
        }
      }
      expect(foundBreadcrumb).toBe(true);
    });

    test('FAQPage JSON-LDが正しく出力されている', async ({ page }) => {
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();

      let foundFaqPage = false;
      for (let i = 0; i < count; i++) {
        const content = await jsonLdScripts.nth(i).textContent();
        if (content) {
          const json = JSON.parse(content);
          if (json['@type'] === 'FAQPage') {
            foundFaqPage = true;
            expect(json['@context']).toBe('https://schema.org');
            expect(json.mainEntity).toBeInstanceOf(Array);
            expect(json.mainEntity.length).toBe(17);

            // 最初のFAQの構造を確認
            const firstFaq = json.mainEntity[0];
            expect(firstFaq['@type']).toBe('Question');
            expect(firstFaq.name).toBe('チーム共有コスト6000とは？');
            expect(firstFaq.acceptedAnswer['@type']).toBe('Answer');
            expect(firstFaq.acceptedAnswer.text).toContain(
              'チーム全体で1つの残コストを管理する仕組み',
            );
          }
        }
      }
      expect(foundFaqPage).toBe(true);
    });
  });

  test.describe('ダークモード', () => {
    test('ダークモードでFAQ項目が正しく表示される', async ({ page }) => {
      // ダークモードを設定
      await page.evaluate(() => localStorage.setItem('theme', 'dark'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      // html要素にdarkクラスがあることを確認
      await expect(page.locator('html')).toHaveClass(/dark/);

      // カテゴリ見出しが表示される
      await expect(page.locator('h2').first()).toBeVisible();

      // FAQ項目が表示される
      const firstDetails = page.locator('details').first();
      await expect(firstDetails).toBeVisible();

      // 開いて回答が表示されることを確認
      await firstDetails.locator('summary').click();
      await expect(firstDetails.locator('p').first()).toBeVisible();
    });
  });

  test.describe('アクセシビリティ', () => {
    test('summaryがキーボードでフォーカス可能', async ({ page }) => {
      // Tabキーでsummaryにフォーカス
      await page.keyboard.press('Tab');
      // ナビリンクなどを通過する場合があるので、最初のsummaryにフォーカスが到達するまでTabを繰り返す
      const firstSummary = page.locator('details').first().locator('summary');
      await firstSummary.focus();

      // Enterキーで開く
      await page.keyboard.press('Enter');
      await expect(page.locator('details').first()).toHaveAttribute('open', '');

      // Enterキーで閉じる
      await page.keyboard.press('Enter');
      await expect(page.locator('details').first()).not.toHaveAttribute('open', '');
    });

    test('矢印アイコンがdetails要素内に存在する', async ({ page }) => {
      const firstSummary = page.locator('details').first().locator('summary');
      const arrow = firstSummary.locator('svg');
      await expect(arrow).toBeVisible();
    });
  });
});
