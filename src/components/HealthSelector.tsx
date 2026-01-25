/**
 * 耐久値選択ドロップダウン
 */

import type { CostType } from '../lib/types';
import { getHealthOptions } from '../data/healthData';

type HealthSelectorType = {
  cost: CostType;
  selectedHealth: number | null;
  onSelect: (health: number) => void;
}

export const HealthSelector = ({
  cost,
  selectedHealth,
  onSelect,
}: HealthSelectorType) => {
  const healthOptions = getHealthOptions(cost);

  return (
    <select
      value={selectedHealth ?? ''}
      onChange={(e) => onSelect(Number(e.target.value))}
      class="px-4 py-2 bg-slate-700 text-slate-200 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
    >
      <option value="">耐久値を選択</option>
      {healthOptions.map((health) => (
        <option key={health} value={health}>
          {health}
        </option>
      ))}
    </select>
  );
}
