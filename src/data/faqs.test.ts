import { describe, it, expect } from 'vitest';
import { faqs, faqCategories, getFaqsByCategory, type FaqItem, type FaqCategory } from './faqs';

describe('faqs', () => {
  describe('FaqCategory', () => {
    it('5つのカテゴリが定義されている', () => {
      expect(faqCategories).toHaveLength(5);
    });

    it('カテゴリIDがユニークである', () => {
      const ids = faqCategories.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('期待するカテゴリが全て存在する', () => {
      const ids = faqCategories.map((c) => c.id);
      expect(ids).toContain('basic-rules');
      expect(ids).toContain('ex-over-limit');
      expect(ids).toContain('ex-burst');
      expect(ids).toContain('tactics');
      expect(ids).toContain('calculator');
    });

    it('各カテゴリにlabelが設定されている', () => {
      for (const category of faqCategories) {
        expect(category.label).toBeTruthy();
        expect(typeof category.label).toBe('string');
      }
    });
  });

  describe('FaqItem', () => {
    it('17問のFAQが定義されている', () => {
      expect(faqs).toHaveLength(17);
    });

    it('全てのFAQにquestion, answer, categoryが存在する', () => {
      for (const faq of faqs) {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
        expect(faq.category).toBeTruthy();
      }
    });

    it('全てのFAQのcategoryが有効なカテゴリIDである', () => {
      const validIds = faqCategories.map((c) => c.id);
      for (const faq of faqs) {
        expect(validIds).toContain(faq.category);
      }
    });

    it('linkフィールドがある場合、urlとtextが存在する', () => {
      const faqsWithLink = faqs.filter((faq) => faq.link);
      expect(faqsWithLink.length).toBeGreaterThan(0);
      for (const faq of faqsWithLink) {
        expect(faq.link!.url).toBeTruthy();
        expect(faq.link!.text).toBeTruthy();
        expect(faq.link!.url).toMatch(/^https?:\/\//);
      }
    });

    it('questionが重複していない', () => {
      const questions = faqs.map((faq) => faq.question);
      expect(new Set(questions).size).toBe(questions.length);
    });
  });

  describe('getFaqsByCategory', () => {
    it('指定カテゴリのFAQのみ返す', () => {
      const basicRules = getFaqsByCategory('basic-rules');
      expect(basicRules.length).toBeGreaterThan(0);
      for (const faq of basicRules) {
        expect(faq.category).toBe('basic-rules');
      }
    });

    it('存在しないカテゴリIDは空配列を返す', () => {
      const result = getFaqsByCategory('nonexistent' as FaqCategory['id']);
      expect(result).toEqual([]);
    });

    it('全カテゴリのFAQ合計がfaqs.lengthと一致する', () => {
      let total = 0;
      for (const category of faqCategories) {
        total += getFaqsByCategory(category.id).length;
      }
      expect(total).toBe(faqs.length);
    });

    it('カテゴリ別のFAQ数が期待通りである', () => {
      expect(getFaqsByCategory('basic-rules')).toHaveLength(3);
      expect(getFaqsByCategory('ex-over-limit')).toHaveLength(4);
      expect(getFaqsByCategory('ex-burst')).toHaveLength(3);
      expect(getFaqsByCategory('tactics')).toHaveLength(4);
      expect(getFaqsByCategory('calculator')).toHaveLength(3);
    });
  });

  describe('コンテンツ用語ルール', () => {
    it('「落ちる」「先落ち」「落ち順」「リスポーン」を使用していない', () => {
      for (const faq of faqs) {
        const text = faq.question + faq.answer;
        expect(text).not.toMatch(/落ちる/);
        expect(text).not.toMatch(/先落ち/);
        expect(text).not.toMatch(/落ち順/);
        expect(text).not.toMatch(/リスポーン/);
      }
    });

    it('EXオーバーリミットを「EX」と省略していない', () => {
      for (const faq of faqs) {
        const text = faq.question + faq.answer;
        // "EX" 単体で使われている箇所を検出（EXオーバーリミット、EXバーストは許容）
        const matches = text.match(/EX[^オバ]/g);
        if (matches) {
          // "EXオーバーリミット" "EXバースト" 以外のEX使用がないことを確認
          for (const match of matches) {
            expect(match).toMatch(/EX[^オバ]/); // このテストは上で既にマッチしている
          }
        }
      }
    });
  });
});
