/**
 * Cookie同意ロジックのテスト
 */

import {
  ENABLE_AD_COOKIES,
  ENABLE_ANALYTICS,
  GA4_MEASUREMENT_ID,
  CF_ANALYTICS_TOKEN,
  ENABLE_COOKIE_CONSENT,
  getCookieConsent,
  setCookieConsent,
  resetCookieConsent,
  isAdCookieAllowed,
  isAnalyticsCookieAllowed,
} from './cookieConsent';

// LocalStorageをモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('フィーチャーフラグ', () => {
  test('ENABLE_AD_COOKIES が false であること（広告未導入）', () => {
    expect(ENABLE_AD_COOKIES).toBe(false);
  });

  test('ENABLE_ANALYTICS が true であること', () => {
    expect(ENABLE_ANALYTICS).toBe(true);
  });

  test('GA4_MEASUREMENT_ID が設定されていること', () => {
    expect(GA4_MEASUREMENT_ID).toBe('G-8WSG8F8W3F');
  });

  test('CF_ANALYTICS_TOKEN が空文字であること（デプロイ前）', () => {
    expect(CF_ANALYTICS_TOKEN).toBe('');
  });

  test('ENABLE_COOKIE_CONSENT はCookie使用サービスが有効な場合に true', () => {
    // ENABLE_ANALYTICS=true, GA4_MEASUREMENT_ID が設定済みなので true
    expect(ENABLE_COOKIE_CONSENT).toBe(true);
  });
});

describe('getCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('保存データがない場合は undecided を返す', () => {
    expect(getCookieConsent()).toBe('undecided');
  });

  test('granted が保存されている場合は granted を返す', () => {
    localStorage.setItem('exvs2-cookie-consent', 'granted');
    expect(getCookieConsent()).toBe('granted');
  });

  test('denied が保存されている場合は denied を返す', () => {
    localStorage.setItem('exvs2-cookie-consent', 'denied');
    expect(getCookieConsent()).toBe('denied');
  });

  test('不正な値が保存されている場合は undecided を返す', () => {
    localStorage.setItem('exvs2-cookie-consent', 'invalid');
    expect(getCookieConsent()).toBe('undecided');
  });
});

describe('setCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('granted を保存できる', () => {
    setCookieConsent('granted');
    expect(getCookieConsent()).toBe('granted');
  });

  test('denied を保存できる', () => {
    setCookieConsent('denied');
    expect(getCookieConsent()).toBe('denied');
  });

  test('上書き保存できる', () => {
    setCookieConsent('granted');
    expect(getCookieConsent()).toBe('granted');

    setCookieConsent('denied');
    expect(getCookieConsent()).toBe('denied');
  });
});

describe('resetCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('同意状態をリセットすると undecided に戻る', () => {
    setCookieConsent('granted');
    expect(getCookieConsent()).toBe('granted');

    resetCookieConsent();
    expect(getCookieConsent()).toBe('undecided');
  });

  test('保存データがない状態でリセットしてもエラーにならない', () => {
    resetCookieConsent();
    expect(getCookieConsent()).toBe('undecided');
  });
});

describe('isAdCookieAllowed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('granted の場合は true を返す', () => {
    setCookieConsent('granted');
    expect(isAdCookieAllowed()).toBe(true);
  });

  test('denied の場合は false を返す', () => {
    setCookieConsent('denied');
    expect(isAdCookieAllowed()).toBe(false);
  });

  test('undecided の場合は false を返す', () => {
    expect(isAdCookieAllowed()).toBe(false);
  });
});

describe('isAnalyticsCookieAllowed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('ENABLE_ANALYTICS=true かつ granted の場合は true を返す', () => {
    setCookieConsent('granted');
    // ENABLE_ANALYTICS は true なので granted なら true
    expect(isAnalyticsCookieAllowed()).toBe(true);
  });

  test('denied の場合は false を返す', () => {
    setCookieConsent('denied');
    expect(isAnalyticsCookieAllowed()).toBe(false);
  });

  test('undecided の場合は false を返す', () => {
    expect(isAnalyticsCookieAllowed()).toBe(false);
  });
});
