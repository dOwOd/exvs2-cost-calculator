/**
 * フッターコンポーネント
 */

import { GitHubIcon } from './icons/GitHubIcon';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="mt-12 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-4">
      <div class="container mx-auto px-6">
        <div class="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          {/* バージョン情報 */}
          <div class="text-slate-700 dark:text-slate-300">v1.0</div>

          <span class="text-slate-400 dark:text-slate-600">·</span>

          {/* GitHubリンク */}
          <a
            href="https://github.com/dOwOd"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <GitHubIcon />
            Developer
          </a>

          <span class="text-slate-400 dark:text-slate-600">·</span>

          {/* EXVS2公式サイトリンク */}
          <a
            href="https://gundam-vs.jp/extreme/ac2ib/"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            EXVS2 公式サイト
          </a>

          <span class="text-slate-400 dark:text-slate-600">·</span>

          {/* 著作権表記 */}
          <div class="text-xs text-slate-500">© {currentYear}</div>
        </div>
      </div>
    </footer>
  );
};
