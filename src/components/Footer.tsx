/**
 * フッターコンポーネント
 */

import { GitHubIcon } from './icons/GitHubIcon';
import { ENABLE_COOKIE_CONSENT } from '../lib/cookieConsent';
import { useCookieConsent } from '../lib/useCookieConsent';

const base = import.meta.env.BASE_URL;

const siteLinks = [
  { href: base, label: 'コスト計算' },
  { href: `${base}guide/`, label: 'ガイド' },
  { href: `${base}faq/`, label: 'FAQ' },
  { href: `${base}privacy/`, label: 'プライバシーポリシー' },
];

const linkClass = 'hover:text-blue-600 dark:hover:text-blue-400 transition-colors';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { status, reset } = useCookieConsent();

  return (
    <footer class="mt-12 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-6">
      <div class="container mx-auto px-6">
        {/* 上段: サイトリンク＋説明 */}
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
              機動戦士ガンダム EXVS2の撃墜順コスト計算ツール
            </p>
            <nav aria-label="フッターナビゲーション">
              <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                {siteLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} class={linkClass}>
                      {item.label}
                    </a>
                  </li>
                ))}
                {ENABLE_COOKIE_CONSENT && status !== 'undecided' && (
                  <li>
                    <button type="button" onClick={reset} class={linkClass}>
                      Cookie設定
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>

        {/* 下段: 外部リンク＋著作権 */}
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700 pt-4 text-sm text-slate-500 dark:text-slate-400">
          <div class="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/dOwOd"
              target="_blank"
              rel="noopener noreferrer"
              class={`flex items-center gap-1.5 ${linkClass}`}
            >
              <GitHubIcon width={16} height={16} />
              GitHub
            </a>
            <span class="text-slate-300 dark:text-slate-600">|</span>
            <a
              href="https://gundam-vs.jp/extreme/ac2ib/"
              target="_blank"
              rel="noopener noreferrer"
              class={linkClass}
            >
              EXVS2 公式サイト
            </a>
          </div>
          <div class="text-xs text-slate-400 dark:text-slate-500">
            <a href={`${base}changelog/`} class={linkClass}>
              v{__APP_VERSION__}
            </a>
            <span class="mx-1">&middot;</span>© {currentYear} EXVS2 コスト計算機
          </div>
        </div>
      </div>
    </footer>
  );
};
