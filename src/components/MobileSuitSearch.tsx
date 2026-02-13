/**
 * 機体名検索コンポーネント
 */

import { useState, useRef, useEffect } from 'preact/hooks';
import { searchMobileSuits, type MobileSuitInfo } from '../data/mobileSuitsData';
import { getRecentSuits, addToRecentSuits } from '../lib/recentHistory';

type MobileSuitSearchProps = {
  onSelect: (suit: MobileSuitInfo) => void;
  placeholder?: string;
  toggleTestId?: string;
};

export const MobileSuitSearch = ({
  onSelect,
  placeholder = '機体名で検索...',
  toggleTestId,
}: MobileSuitSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MobileSuitInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [recentSuits, setRecentSuits] = useState<MobileSuitInfo[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // マウント時に履歴を読み込み
  useEffect(() => {
    setRecentSuits(getRecentSuits());
  }, []);

  // 履歴更新イベントをリッスン（他のコンポーネントインスタンスとの同期）
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setRecentSuits(getRecentSuits());
    };

    window.addEventListener('recent-suits-updated', handleHistoryUpdate);
    return () => {
      window.removeEventListener('recent-suits-updated', handleHistoryUpdate);
    };
  }, []);

  // 検索実行
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults = searchMobileSuits(query);
    setResults(searchResults);
    setIsOpen(searchResults.length > 0);
    setFocusedIndex(-1);
  }, [query]);

  // 外部クリックで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (suit: MobileSuitInfo) => {
    // 履歴に追加
    addToRecentSuits(suit);
    setRecentSuits(getRecentSuits());

    // 親コンポーネントに通知
    onSelect(suit);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < results.length) {
          handleSelect(results[focusedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const searchTestId = placeholder.includes('A') ? 'mobile-suit-search-a' : 'mobile-suit-search-b';

  return (
    <div ref={containerRef} class="relative">
      {/* 折りたたみヘッダー */}
      <button
        type="button"
        data-testid={toggleTestId}
        onClick={() => setIsCollapsed(!isCollapsed)}
        class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-2 transition-colors"
      >
        <span class="text-xs">{isCollapsed ? '▶' : '▼'}</span>
        <span>機体名から選択...</span>
      </button>

      {/* 検索UI（展開時のみ表示） */}
      {!isCollapsed && (
        <>
          <input
            ref={inputRef}
            type="text"
            data-testid={searchTestId}
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none w-full"
          />

          {isOpen && results.length > 0 && (
            <ul
              role="listbox"
              data-testid="mobile-suit-search-results"
              class="absolute z-40 w-full mt-1 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-lg max-h-60 overflow-auto"
            >
              {results.map((suit, index) => (
                <li
                  key={`${suit.name}-${suit.cost}-${suit.health}`}
                  role="option"
                  data-testid={`mobile-suit-option-${suit.name}-${suit.cost}`}
                  onClick={() => handleSelect(suit)}
                  class={`px-4 py-2 cursor-pointer ${
                    index === focusedIndex
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  <div class="flex justify-between items-center">
                    <span>{suit.name}</span>
                    <span class="text-sm text-slate-500 dark:text-slate-400">
                      {suit.cost}/{suit.health}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isOpen && recentSuits.length > 0 && (
            <div class="mt-2">
              <div class="text-xs text-slate-500 mb-1">最近使用</div>
              <div class="flex flex-wrap gap-1">
                {recentSuits.map((suit) => (
                  <button
                    key={`${suit.name}-${suit.cost}-${suit.health}`}
                    type="button"
                    data-testid={`recent-suit-${suit.name}-${suit.cost}`}
                    onClick={() => handleSelect(suit)}
                    class="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600"
                  >
                    {suit.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
