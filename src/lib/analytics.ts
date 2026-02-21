/**
 * アナリティクスモジュール
 * GA4の動的ロード・consent監視・型付きイベント送信
 * CF Web AnalyticsはBaseLayout.astroのbeacon scriptで処理（JS API不要）
 */

import { GA4_MEASUREMENT_ID, ENABLE_ANALYTICS, isAnalyticsCookieAllowed } from './cookieConsent';

/** GA4に送信するイベント名 */
type AnalyticsEventName =
  | 'calculate'
  | 'image_export'
  | 'share_twitter'
  | 'share_line'
  | 'share_webshare'
  | 'share_image'
  | 'formation_save'
  | 'formation_load'
  | 'formation_delete'
  | 'filter_ex_toggle'
  | 'filter_first_kill'
  | 'mode_switch'
  | 'url_copy';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

/** gtag.jsスクリプトを動的にロードする */
const loadGtagScript = (): void => {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

/** gtagを初期化する（Google公式スニペットと同じ形式） */
const setupGtag = (): void => {
  window.dataLayer = window.dataLayer || [];
  // gtag.jsはdataLayer内のArgumentsオブジェクトをコマンドとして処理する
  // アロー関数ではargumentsが使えないため、function式を使用
  window.gtag = function (..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);
};

/**
 * GA4を初期化する
 * consent状態を確認し、許可されていればGA4を読み込む
 * consent変更イベントも監視して、後から許可された場合にも対応
 */
export const initAnalytics = (): void => {
  if (!ENABLE_ANALYTICS || GA4_MEASUREMENT_ID === '') return;

  // 現時点でconsent許可済みなら即初期化
  if (!initialized && isAnalyticsCookieAllowed()) {
    loadGtagScript();
    setupGtag();
    initialized = true;
  }

  // consent変更を監視（後から許可された場合に初期化）
  window.addEventListener('cookie-consent-change', () => {
    if (!initialized && isAnalyticsCookieAllowed()) {
      loadGtagScript();
      setupGtag();
      initialized = true;
    }
  });
};

/**
 * GA4にイベントを送信する
 * GA4未初期化時はno-op（コンポーネント側でconsent確認不要）
 */
export const trackEvent = (name: AnalyticsEventName, params?: Record<string, unknown>): void => {
  if (!initialized || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
};
