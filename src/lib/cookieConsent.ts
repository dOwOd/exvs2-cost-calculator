/**
 * Cookie同意状態の管理
 * LocalStorageを使用してCookieの同意状態を保存・取得する
 */

/**
 * 広告Cookie機能のフィーチャーフラグ
 * 広告導入時に true に変更するだけでCookie同意バナー・設定が有効になる
 */
export const ENABLE_AD_COOKIES = false;

/**
 * Google AdSense パブリッシャーID
 * AdSenseアカウント作成後に取得したIDを設定する（例: "ca-pub-1234567890123456"）
 */
export const AD_PUBLISHER_ID = '';

/** アナリティクス（GA4）のフィーチャーフラグ */
export const ENABLE_ANALYTICS = true;

/** GA4 Measurement ID */
export const GA4_MEASUREMENT_ID: string = 'G-8WSG8F8W3F';

/** Cloudflare Web Analytics トークン（デプロイ後にCFダッシュボードから取得して設定） */
export const CF_ANALYTICS_TOKEN: string = '9acec5d20aa942ae8cc18fd714a75bcb';

/**
 * Cookie同意バナーの表示が必要か
 * Cookie使用サービス（AdSense or GA4）が有効な場合に true
 * CF Web AnalyticsはCookie不要なので含まない
 */
export const ENABLE_COOKIE_CONSENT =
  ENABLE_AD_COOKIES || (ENABLE_ANALYTICS && GA4_MEASUREMENT_ID !== '');

/**
 * Cookie同意状態の型
 */
export type CookieConsentStatus = 'granted' | 'denied' | 'undecided';

/**
 * LocalStorageのキー
 */
const STORAGE_KEY = 'exvs2-cookie-consent';

/**
 * Cookie同意状態を取得
 */
export const getCookieConsent = (): CookieConsentStatus => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') {
      return stored;
    }
    return 'undecided';
  } catch {
    return 'undecided';
  }
};

/**
 * Cookie同意状態を保存
 */
export const setCookieConsent = (status: 'granted' | 'denied'): void => {
  try {
    localStorage.setItem(STORAGE_KEY, status);
  } catch {
    // LocalStorage容量不足等のエラーは無視
  }
};

/**
 * Cookie同意状態をリセット（undecidedに戻す）
 */
export const resetCookieConsent = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // エラーは無視
  }
};

/**
 * 広告Cookieが許可されているか
 */
export const isAdCookieAllowed = (): boolean => {
  return getCookieConsent() === 'granted';
};

/**
 * アナリティクスCookieが許可されているか
 */
export const isAnalyticsCookieAllowed = (): boolean => {
  return ENABLE_ANALYTICS && getCookieConsent() === 'granted';
};
