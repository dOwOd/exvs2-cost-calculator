/**
 * 耐久値ドロップダウンのポップアップ
 * ホバー中の耐久値に対応する機体名リストを表示
 */

import { useRef, useEffect, useState } from 'preact/hooks';
import type { CostType, HealthType } from '../lib/types';
import { getAllMobileSuitNames } from '../data/mobileSuitsData';

type HealthDropdownPopupProps = {
  cost: CostType;
  health: HealthType | null;
  position: { top: number; left: number };
};

export const HealthDropdownPopup = ({
  cost,
  health,
  position,
}: HealthDropdownPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [maxHeight, setMaxHeight] = useState<number>(400);

  useEffect(() => {
    if (!popupRef.current) return;

    const popup = popupRef.current;
    const rect = popup.getBoundingClientRect();
    const padding = 8;

    let { top, left } = position;

    // 利用可能な高さを計算（画面下端までの高さ - padding）
    const availableHeight = window.innerHeight - top - padding;
    setMaxHeight(Math.max(150, availableHeight)); // 最低150px確保

    // 右側にはみ出す場合は左に調整
    if (left + rect.width > window.innerWidth) {
      left = Math.max(padding, window.innerWidth - rect.width - padding);
    }

    // 下側にはみ出す場合は上に調整
    if (top + rect.height > window.innerHeight) {
      top = Math.max(padding, window.innerHeight - rect.height - padding);
    }

    // 左側にはみ出す場合は右に調整
    if (left < 0) {
      left = padding;
    }

    // 上側にはみ出す場合は下に調整
    if (top < 0) {
      top = padding;
    }

    setAdjustedPosition({ top, left });
  }, [position, health]);

  if (health === null) return null;

  const mobileSuits = getAllMobileSuitNames(cost, health);

  if (mobileSuits.length === 0) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      class="fixed bg-slate-800 border border-slate-600 rounded shadow-lg p-3 z-50 min-w-[200px] max-w-[300px] overflow-auto"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        maxHeight: `${maxHeight}px`,
      }}
    >
      <div class="text-sm text-slate-400 mb-1">該当機体</div>
      <ul class="text-slate-200 space-y-1">
        {mobileSuits.map((suit) => (
          <li key={suit} class="text-sm">
            {suit}
          </li>
        ))}
      </ul>
    </div>
  );
};
