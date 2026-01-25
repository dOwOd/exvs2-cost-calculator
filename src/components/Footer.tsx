/**
 * フッターコンポーネント
 */

export const Footer = () => {
  return (
    <footer class="mt-12 border-t border-slate-700 bg-slate-800 py-6">
      <div class="container mx-auto px-6">
        <div class="flex flex-col items-center gap-4 text-sm text-slate-400">
          {/* バージョン情報 */}
          <div class="text-slate-300">v1.0</div>

          {/* リンク */}
          <div class="flex gap-6">
            <a
              href="https://github.com/dOwOd"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://gundam-vs.jp/extreme/ac2ib/"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-blue-400 transition-colors"
            >
              EXVS2 公式サイト
            </a>
          </div>

          {/* ライセンス */}
          <div class="text-xs text-slate-500">© 2026 MIT License</div>
        </div>
      </div>
    </footer>
  );
};
