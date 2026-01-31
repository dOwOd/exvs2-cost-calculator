/**
 * コスト選択ボタン
 */

import type { CostType } from '../lib/types';

type CostSelectorType = {
  selectedCost: CostType | null;
  onSelect: (cost: CostType) => void;
  testIdPrefix?: string;
}

const COSTS: CostType[] = [1500, 2000, 2500, 3000];

export const CostSelector = ({
  selectedCost,
  onSelect,
  testIdPrefix = '',
}: CostSelectorType) => {
  return (
    <div class="flex gap-2">
      {COSTS.map((cost) => (
        <button
          key={cost}
          data-testid={testIdPrefix ? `cost-button-${testIdPrefix}-${cost}` : `cost-button-${cost}`}
          onClick={() => onSelect(cost)}
          class={`px-4 py-2 rounded font-semibold transition-colors ${selectedCost === cost
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
        >
          {cost}
        </button>
      ))}
    </div>
  );
}
