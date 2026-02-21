import { describe, test, expect } from 'vitest';
import { contactSchema, CONTACT_CATEGORIES } from './contactSchema';

describe('contactSchema', () => {
  const validData = {
    name: 'テスト太郎',
    email: 'test@example.com',
    category: 'bug' as const,
    message: '不具合の報告です。',
  };

  test('有効なデータでパースが成功する', () => {
    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('emailが空文字の場合はundefinedに変換される', () => {
    const result = contactSchema.safeParse({ ...validData, email: '' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
    }
  });

  test('emailが省略されている場合も成功する', () => {
    const { email: _, ...dataWithoutEmail } = validData;
    const result = contactSchema.safeParse(dataWithoutEmail);
    expect(result.success).toBe(true);
  });

  describe('name バリデーション', () => {
    test('空文字はエラー', () => {
      const result = contactSchema.safeParse({ ...validData, name: '' });
      expect(result.success).toBe(false);
    });

    test('100文字ちょうどは成功', () => {
      const result = contactSchema.safeParse({ ...validData, name: 'a'.repeat(100) });
      expect(result.success).toBe(true);
    });

    test('101文字はエラー', () => {
      const result = contactSchema.safeParse({ ...validData, name: 'a'.repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe('email バリデーション', () => {
    test('不正なメールアドレスはエラー', () => {
      const result = contactSchema.safeParse({ ...validData, email: 'invalid' });
      expect(result.success).toBe(false);
    });

    test('有効なメールアドレスは成功', () => {
      const result = contactSchema.safeParse({ ...validData, email: 'user@example.com' });
      expect(result.success).toBe(true);
    });
  });

  describe('category バリデーション', () => {
    test.each(CONTACT_CATEGORIES.map((c) => c.value))('"%s" は有効なカテゴリ', (category) => {
      const result = contactSchema.safeParse({ ...validData, category });
      expect(result.success).toBe(true);
    });

    test('無効なカテゴリはエラー', () => {
      const result = contactSchema.safeParse({ ...validData, category: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('message バリデーション', () => {
    test('空文字はエラー', () => {
      const result = contactSchema.safeParse({ ...validData, message: '' });
      expect(result.success).toBe(false);
    });

    test('2000文字ちょうどは成功', () => {
      const result = contactSchema.safeParse({ ...validData, message: 'a'.repeat(2000) });
      expect(result.success).toBe(true);
    });

    test('2001文字はエラー', () => {
      const result = contactSchema.safeParse({ ...validData, message: 'a'.repeat(2001) });
      expect(result.success).toBe(false);
    });
  });
});
