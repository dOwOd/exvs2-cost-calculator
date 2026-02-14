/**
 * ツールチップコンポーネント
 * ホバー時またはフォーカス時に詳細説明を表示
 */

import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';

type TooltipType = {
  /** ツールチップの内容 */
  content: string;
  /** 子要素 */
  children: ComponentChildren;
  /** 表示位置 */
  align?: 'center' | 'left' | 'right';
  /** キーボードフォーカス可能にする */
  focusable?: boolean;
};

export const Tooltip = ({
  content,
  children,
  align = 'center',
  focusable = false,
}: TooltipType) => {
  const [isVisible, setIsVisible] = useState(false);

  // 位置に応じたスタイル
  const positionClasses = {
    center: 'left-1/2 transform -translate-x-1/2',
    left: 'left-0',
    right: 'right-0',
  };

  const arrowClasses = {
    center: 'left-1/2 transform -translate-x-1/2',
    left: 'left-4',
    right: 'right-4',
  };

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return (
    <span class="relative inline-block">
      <span
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={focusable ? show : undefined}
        onBlur={focusable ? hide : undefined}
        tabIndex={focusable ? 0 : undefined}
        class={`cursor-help${focusable ? ' rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500' : ''}`}
      >
        {children}
      </span>
      {isVisible && (
        <span
          role="tooltip"
          class={`absolute z-[100] top-full ${positionClasses[align]} mt-2 px-3 py-2 bg-slate-800 dark:bg-slate-950 text-slate-100 dark:text-slate-200 text-sm rounded-lg shadow-lg border border-slate-300 dark:border-slate-700 whitespace-nowrap`}
        >
          {content}
          <span
            class={`absolute bottom-full ${arrowClasses[align]} mb-px border-4 border-transparent border-b-slate-800 dark:border-b-slate-950`}
          />
        </span>
      )}
    </span>
  );
};

type InfoIconType = {
  /** ツールチップの内容 */
  tooltip: string;
  /** 表示位置 */
  align?: 'center' | 'left' | 'right';
};

/**
 * 情報アイコン（ⓘ）+ ツールチップ
 */
export const InfoIcon = ({ tooltip, align = 'center' }: InfoIconType) => {
  return (
    <Tooltip content={tooltip} align={align} focusable>
      <span
        role="img"
        aria-label="情報"
        class="inline-flex items-center justify-center w-4 h-4 ml-1 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        ⓘ
      </span>
    </Tooltip>
  );
};
