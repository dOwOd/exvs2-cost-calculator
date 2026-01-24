/**
 * ツールチップコンポーネント
 * ホバー時に詳細説明を表示
 */

import { useState } from 'preact/hooks';

interface TooltipProps {
  /** ツールチップの内容 */
  content: string;
  /** 子要素 */
  children: any;
  /** 表示位置 */
  align?: 'center' | 'left' | 'right';
}

export default function Tooltip({ content, children, align = 'center' }: TooltipProps) {
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

  return (
    <span class="relative inline-block">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        class="cursor-help"
      >
        {children}
      </span>
      {isVisible && (
        <span class={`absolute z-[100] top-full ${positionClasses[align]} mt-2 px-3 py-2 bg-slate-950 text-slate-200 text-sm rounded-lg shadow-lg border border-slate-700 whitespace-nowrap`}>
          {content}
          <span class={`absolute bottom-full ${arrowClasses[align]} mb-px border-4 border-transparent border-b-slate-950`} />
        </span>
      )}
    </span>
  );
}

interface InfoIconProps {
  /** ツールチップの内容 */
  tooltip: string;
  /** 表示位置 */
  align?: 'center' | 'left' | 'right';
}

/**
 * 情報アイコン（ⓘ）+ ツールチップ
 */
export function InfoIcon({ tooltip, align = 'center' }: InfoIconProps) {
  return (
    <Tooltip content={tooltip} align={align}>
      <span class="inline-flex items-center justify-center w-4 h-4 ml-1 text-xs text-slate-400 hover:text-blue-400 transition-colors">
        ⓘ
      </span>
    </Tooltip>
  );
}
