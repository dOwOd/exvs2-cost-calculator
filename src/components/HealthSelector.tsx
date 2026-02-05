/**
 * 耐久値選択ドロップダウン（カスタム実装）
 */

import { useState, useRef, useEffect } from 'preact/hooks';
import type { CostType, HealthType } from '../lib/types';
import { getAvailableHealthOptions } from '../data/mobileSuitsData';
import { HealthDropdownPopup } from './HealthDropdownPopup';

type HealthSelectorType = {
  cost: CostType;
  selectedHealth: HealthType | null;
  onSelect: (health: HealthType) => void;
  testIdPrefix?: string;
}

export const HealthSelector = ({
  cost,
  selectedHealth,
  onSelect,
  testIdPrefix = '',
}: HealthSelectorType) => {
  const healthOptions = getAvailableHealthOptions(cost);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredHealth, setHoveredHealth] = useState<HealthType | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 外部クリックで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen && buttonRef.current) {
      // ドロップダウンの表示方向を決定
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 240; // max-h-60 の推定高さ
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownDirection('up');
      } else {
        setDropdownDirection('down');
      }
      setFocusedIndex(-1);
    } else if (!newIsOpen) {
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (health: HealthType) => {
    onSelect(health);
    setIsOpen(false);
    setFocusedIndex(-1);
    setHoveredHealth(null);
  };

  const handleMouseEnter = (health: HealthType, event: MouseEvent) => {
    setHoveredHealth(health);

    // ポップアップの初期位置を設定（ドロップダウンの右側）
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const padding = 8;

    setPopupPosition({
      top: rect.top,
      left: rect.right + padding,
    });
  };

  const handleMouseLeave = () => {
    setHoveredHealth(null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < healthOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < healthOptions.length) {
          handleSelect(healthOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
    }
  };

  return (
    <div ref={dropdownRef} class="relative">
      <button
        ref={buttonRef}
        type="button"
        data-testid={testIdPrefix ? `health-selector-button-${testIdPrefix}` : 'health-selector-button'}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        class="min-h-[44px] px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none w-full text-left flex justify-between items-center"
      >
        <span>{selectedHealth ?? '耐久値を選択'}</span>
        <svg
          class={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          data-testid={testIdPrefix ? `health-selector-listbox-${testIdPrefix}` : 'health-selector-listbox'}
          class={`absolute z-40 w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-lg max-h-60 overflow-auto ${
            dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {healthOptions.map((health, index) => (
            <li
              key={health}
              role="option"
              data-testid={testIdPrefix ? `health-option-${testIdPrefix}-${health}` : `health-option-${health}`}
              aria-selected={health === selectedHealth}
              onClick={() => handleSelect(health)}
              onMouseEnter={(e) => handleMouseEnter(health, e as unknown as MouseEvent)}
              onMouseLeave={handleMouseLeave}
              class={`min-h-[44px] px-4 py-2 cursor-pointer flex items-center ${
                health === selectedHealth
                  ? 'bg-blue-600 text-white'
                  : index === focusedIndex
                  ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              {health}
            </li>
          ))}
        </ul>
      )}

      {/* ポップアップ */}
      {isOpen && hoveredHealth !== null && (
        <HealthDropdownPopup
          cost={cost}
          health={hoveredHealth}
          position={popupPosition}
        />
      )}
    </div>
  );
}
