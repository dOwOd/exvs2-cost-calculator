/**
 * 機体名検索コンポーネント
 */

import { useState, useRef, useEffect } from 'preact/hooks';
import { searchMobileSuits, type MobileSuitInfo } from '../data/mobileSuitsData';

type MobileSuitSearchProps = {
  onSelect: (suit: MobileSuitInfo) => void;
  placeholder?: string;
};

export const MobileSuitSearch = ({
  onSelect,
  placeholder = '機体名で検索...',
}: MobileSuitSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MobileSuitInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        setFocusedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
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

  return (
    <div ref={containerRef} class="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        class="px-4 py-2 bg-slate-700 text-slate-200 rounded border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
      />

      {isOpen && results.length > 0 && (
        <ul
          role="listbox"
          class="absolute z-40 w-full mt-1 bg-slate-700 border border-slate-600 rounded shadow-lg max-h-60 overflow-auto"
        >
          {results.map((suit, index) => (
            <li
              key={`${suit.name}-${suit.cost}-${suit.health}`}
              role="option"
              onClick={() => handleSelect(suit)}
              class={`px-4 py-2 cursor-pointer ${
                index === focusedIndex
                  ? 'bg-slate-600 text-slate-200'
                  : 'text-slate-200 hover:bg-slate-600'
              }`}
            >
              <div class="flex justify-between items-center">
                <span>{suit.name}</span>
                <span class="text-sm text-slate-400">
                  {suit.cost}/{suit.health}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
