/**
 * CookieConsentBanner コンポーネントのテスト
 *
 * @vitest-environment jsdom
 */

import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/preact';

// cookieConsent モジュールのモック
const mockConfig = vi.hoisted(() => ({
  ENABLE_COOKIE_CONSENT: true,
  ENABLE_AD_COOKIES: true,
  ENABLE_ANALYTICS: true,
  GA4_MEASUREMENT_ID: 'G-TEST',
}));

vi.mock('../../lib/cookieConsent', () => ({
  get ENABLE_COOKIE_CONSENT() {
    return mockConfig.ENABLE_COOKIE_CONSENT;
  },
  get ENABLE_AD_COOKIES() {
    return mockConfig.ENABLE_AD_COOKIES;
  },
  get ENABLE_ANALYTICS() {
    return mockConfig.ENABLE_ANALYTICS;
  },
  get GA4_MEASUREMENT_ID() {
    return mockConfig.GA4_MEASUREMENT_ID;
  },
}));

// useCookieConsent フックのモック
const mockUseCookieConsent = vi.hoisted(() =>
  vi.fn(() => ({
    status: 'undecided' as const,
    ready: false,
    grant: vi.fn(),
    deny: vi.fn(),
    reset: vi.fn(),
  })),
);

vi.mock('../../lib/useCookieConsent', () => ({
  useCookieConsent: mockUseCookieConsent,
}));

import { CookieConsentBanner } from '../CookieConsentBanner';

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.ENABLE_COOKIE_CONSENT = true;
  });

  afterEach(() => {
    cleanup();
  });

  test('初期化完了前はバナーを表示しない（SSGちらつき防止）', () => {
    mockUseCookieConsent.mockReturnValue({
      status: 'undecided',
      ready: false,
      grant: vi.fn(),
      deny: vi.fn(),
      reset: vi.fn(),
    });
    render(<CookieConsentBanner />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('初期化後、未決定の場合はバナーを表示する', () => {
    mockUseCookieConsent.mockReturnValue({
      status: 'undecided',
      ready: true,
      grant: vi.fn(),
      deny: vi.fn(),
      reset: vi.fn(),
    });
    render(<CookieConsentBanner />);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('同意する')).toBeTruthy();
    expect(screen.getByText('拒否する')).toBeTruthy();
  });

  test('同意済みの場合はバナーを表示しない', () => {
    mockUseCookieConsent.mockReturnValue({
      status: 'granted',
      ready: true,
      grant: vi.fn(),
      deny: vi.fn(),
      reset: vi.fn(),
    });
    render(<CookieConsentBanner />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('拒否済みの場合はバナーを表示しない', () => {
    mockUseCookieConsent.mockReturnValue({
      status: 'denied',
      ready: true,
      grant: vi.fn(),
      deny: vi.fn(),
      reset: vi.fn(),
    });
    render(<CookieConsentBanner />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('ENABLE_COOKIE_CONSENT が false の場合はバナーを表示しない', () => {
    mockConfig.ENABLE_COOKIE_CONSENT = false;
    mockUseCookieConsent.mockReturnValue({
      status: 'undecided',
      ready: true,
      grant: vi.fn(),
      deny: vi.fn(),
      reset: vi.fn(),
    });
    render(<CookieConsentBanner />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
