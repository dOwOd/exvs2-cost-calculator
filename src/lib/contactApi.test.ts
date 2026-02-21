/**
 * お問い合わせAPIクライアントのテスト
 *
 * @vitest-environment jsdom
 */

import { vi, describe, test, expect, beforeEach } from 'vitest';
import { submitContact, getErrorMessage } from './contactApi';
import type { ContactErrorCode } from './contactApi';

vi.mock('./contactConfig', () => ({
  CONTACT_API_URL: 'https://api.example.com/contact',
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

const validPayload = {
  name: 'テスト太郎',
  email: 'test@example.com',
  category: 'bug' as const,
  message: '不具合の報告です。',
  turnstileToken: 'test-token',
};

describe('submitContact', () => {
  test('成功レスポンスを返す', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    const result = await submitContact(validPayload);
    expect(result).toEqual({ success: true });
  });

  test('正しいURLとヘッダーでfetchを呼ぶ', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    await submitContact(validPayload);

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });
  });

  test('エラーレスポンスを返す', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: 'RATE_LIMITED' }),
    });

    const result = await submitContact(validPayload);
    expect(result).toEqual({ success: false, error: 'RATE_LIMITED' });
  });

  test('fetchが失敗した場合は例外がスローされる', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(submitContact(validPayload)).rejects.toThrow('Network error');
  });
});

describe('getErrorMessage', () => {
  const errorCodes: ContactErrorCode[] = [
    'VALIDATION_ERROR',
    'RATE_LIMITED',
    'TURNSTILE_FAILED',
    'UNKNOWN_ORIGIN',
  ];

  test.each(errorCodes)('"%s" に対して日本語メッセージを返す', (code) => {
    const message = getErrorMessage(code);
    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(0);
  });

  test('RATE_LIMITED のメッセージが適切', () => {
    expect(getErrorMessage('RATE_LIMITED')).toContain('送信回数の上限');
  });

  test('TURNSTILE_FAILED のメッセージが適切', () => {
    expect(getErrorMessage('TURNSTILE_FAILED')).toContain('セキュリティ検証');
  });
});
