/**
 * 耐久値ドロップダウンのポップアップ
 * ホバー中の耐久値に対応する機体名リストを表示
 */

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
  if (health === null) return null;

  const mobileSuits = getAllMobileSuitNames(cost, health);

  if (mobileSuits.length === 0) {
    return null;
  }

  return (
    <div
      class="fixed bg-slate-800 border border-slate-600 rounded shadow-lg p-3 z-50 min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div class="text-sm text-slate-400 mb-1">機体名</div>
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
