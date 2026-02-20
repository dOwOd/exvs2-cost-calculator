/**
 * Cookie同意バナーコンポーネント
 * 広告Cookieの同意/拒否をユーザーに求める
 */

import { ENABLE_AD_COOKIES } from '../lib/cookieConsent';
import { useCookieConsent } from '../lib/useCookieConsent';

export const CookieConsentBanner = () => {
  const { status, grant, deny } = useCookieConsent();

  if (!ENABLE_AD_COOKIES || status !== 'undecided') {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie同意"
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
    >
      <div class="container mx-auto px-4 py-4 sm:px-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p class="text-sm text-slate-600 dark:text-slate-300">
            当サイトでは広告配信のためにCookieを使用します。詳細は
            <a
              href={`${import.meta.env.BASE_URL}privacy/`}
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              プライバシーポリシー
            </a>
            をご覧ください。
          </p>
          <div class="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={deny}
              class="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              拒否する
            </button>
            <button
              type="button"
              onClick={grant}
              class="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              同意する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
