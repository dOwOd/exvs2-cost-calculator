/**
 * アナリティクスモジュールのテスト
 *
 * @vitest-environment jsdom
 */

import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// モジュールのモック（各テストで動的に変更するため vi.hoisted + vi.mock）
const mockValues = vi.hoisted(() => ({
  ENABLE_ANALYTICS: true,
  GA4_MEASUREMENT_ID: 'G-TEST123',
  isAnalyticsCookieAllowed: vi.fn(() => false),
}));

vi.mock('./cookieConsent', () => ({
  get ENABLE_ANALYTICS() {
    return mockValues.ENABLE_ANALYTICS;
  },
  get GA4_MEASUREMENT_ID() {
    return mockValues.GA4_MEASUREMENT_ID;
  },
  isAnalyticsCookieAllowed: mockValues.isAnalyticsCookieAllowed,
}));

// document.head.appendChild のスパイ
let appendChildSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  delete (window as any).dataLayer;
  delete (window as any).gtag;
});

describe('initAnalytics', () => {
  test('ENABLE_ANALYTICS が false の場合は何もしない', async () => {
    mockValues.ENABLE_ANALYTICS = false;
    mockValues.GA4_MEASUREMENT_ID = 'G-TEST123';

    const { initAnalytics } = await import('./analytics');
    initAnalytics();

    expect(appendChildSpy).not.toHaveBeenCalled();
    expect(window.dataLayer).toBeUndefined();
  });

  test('GA4_MEASUREMENT_ID が空の場合は何もしない', async () => {
    mockValues.ENABLE_ANALYTICS = true;
    mockValues.GA4_MEASUREMENT_ID = '';

    const { initAnalytics } = await import('./analytics');
    initAnalytics();

    expect(appendChildSpy).not.toHaveBeenCalled();
  });

  test('consent未許可の場合はスクリプトをロードしない', async () => {
    mockValues.ENABLE_ANALYTICS = true;
    mockValues.GA4_MEASUREMENT_ID = 'G-TEST123';
    mockValues.isAnalyticsCookieAllowed.mockReturnValue(false);

    const addEventSpy = vi.spyOn(window, 'addEventListener');

    const { initAnalytics } = await import('./analytics');
    initAnalytics();

    expect(appendChildSpy).not.toHaveBeenCalled();
    // consent変更イベントのリスナーは登録する
    expect(addEventSpy).toHaveBeenCalledWith('cookie-consent-change', expect.any(Function));
  });

  test('consent許可済みの場合はGA4を初期化する', async () => {
    mockValues.ENABLE_ANALYTICS = true;
    mockValues.GA4_MEASUREMENT_ID = 'G-TEST123';
    mockValues.isAnalyticsCookieAllowed.mockReturnValue(true);

    const { initAnalytics } = await import('./analytics');
    initAnalytics();

    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    const script = appendChildSpy.mock.calls[0][0] as HTMLScriptElement;
    expect(script.src).toContain('G-TEST123');
    expect(window.dataLayer).toBeDefined();
    expect(typeof window.gtag).toBe('function');
  });

  test('二重初期化を防止する', async () => {
    mockValues.ENABLE_ANALYTICS = true;
    mockValues.GA4_MEASUREMENT_ID = 'G-TEST123';
    mockValues.isAnalyticsCookieAllowed.mockReturnValue(true);

    const { initAnalytics } = await import('./analytics');
    initAnalytics();
    initAnalytics();

    // スクリプトは1回だけロードされる
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
  });
});

describe('trackEvent', () => {
  test('GA4未初期化時はno-op', async () => {
    mockValues.ENABLE_ANALYTICS = true;
    mockValues.GA4_MEASUREMENT_ID = 'G-TEST123';
    mockValues.isAnalyticsCookieAllowed.mockReturnValue(false);

    const { initAnalytics, trackEvent } = await import('./analytics');
    initAnalytics();

    // エラーが発生しないことを確認
    expect(() => trackEvent('calculate')).not.toThrow();
  });

  test('GA4初期化済みの場合はgtagにイベントを送信する', async () => {
    mockValues.ENABLE_ANALYTICS = true;
    mockValues.GA4_MEASUREMENT_ID = 'G-TEST123';
    mockValues.isAnalyticsCookieAllowed.mockReturnValue(true);

    const { initAnalytics, trackEvent } = await import('./analytics');
    initAnalytics();

    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;

    trackEvent('calculate', { cost_a: 3000, cost_b: 2500 });

    expect(gtagSpy).toHaveBeenCalledWith('event', 'calculate', { cost_a: 3000, cost_b: 2500 });
  });

  test('パラメータなしでイベントを送信できる', async () => {
    mockValues.ENABLE_ANALYTICS = true;
    mockValues.GA4_MEASUREMENT_ID = 'G-TEST123';
    mockValues.isAnalyticsCookieAllowed.mockReturnValue(true);

    const { initAnalytics, trackEvent } = await import('./analytics');
    initAnalytics();

    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;

    trackEvent('mode_switch');

    expect(gtagSpy).toHaveBeenCalledWith('event', 'mode_switch', undefined);
  });
});
