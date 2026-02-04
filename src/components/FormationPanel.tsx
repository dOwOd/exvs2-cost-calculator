/**
 * 編成パネル（機体A/B選択）
 */

import { useState } from 'preact/hooks';
import type { CostType, UnitConfig, HealthType } from '../lib/types';
import { CostSelector } from './CostSelector';
import { HealthSelector } from './HealthSelector';
import { MobileSuitSearch } from './MobileSuitSearch';
import type { MobileSuitInfo } from '../data/mobileSuitsData';

type FormationPanelType = {
  unitA: UnitConfig | null;
  unitB: UnitConfig | null;
  onUnitAChange: (unit: UnitConfig | null) => void;
  onUnitBChange: (unit: UnitConfig | null) => void;
}

export const FormationPanel = ({
  unitA,
  unitB,
  onUnitAChange,
  onUnitBChange,
}: FormationPanelType) => {
  const [costA, setCostA] = useState<CostType | null>(unitA?.cost ?? null);
  const [costB, setCostB] = useState<CostType | null>(unitB?.cost ?? null);

  const handleCostASelect = (cost: CostType) => {
    // コストが変更された場合、耐久値選択をリセット
    if (unitA && unitA.cost !== cost) {
      onUnitAChange(null);
    }
    setCostA(cost);
  };

  const handleCostBSelect = (cost: CostType) => {
    // コストが変更された場合、耐久値選択をリセット
    if (unitB && unitB.cost !== cost) {
      onUnitBChange(null);
    }
    setCostB(cost);
  };

  const handleHealthASelect = (health: HealthType) => {
    if (costA) {
      onUnitAChange({ cost: costA, health });
    }
  };

  const handleHealthBSelect = (health: HealthType) => {
    if (costB) {
      onUnitBChange({ cost: costB, health });
    }
  };

  const handleSuitASelect = (suit: MobileSuitInfo) => {
    setCostA(suit.cost);
    onUnitAChange({ cost: suit.cost, health: suit.health });
  };

  const handleSuitBSelect = (suit: MobileSuitInfo) => {
    setCostB(suit.cost);
    onUnitBChange({ cost: suit.cost, health: suit.health });
  };

  return (
    <div class="space-y-4 md:space-y-6">
      {/* 機体A */}
      <div data-testid="formation-panel-a" class="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
        <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">機体A</h3>
        <div class="space-y-3">
          <div>
            <MobileSuitSearch
              onSelect={handleSuitASelect}
              placeholder="機体A名で検索..."
              toggleTestId="search-toggle-a"
            />
          </div>
          <div>
            <label class="block text-sm text-slate-600 dark:text-slate-400 mb-2">コスト</label>
            <CostSelector selectedCost={costA} onSelect={handleCostASelect} testIdPrefix="a" />
          </div>
          {costA && (
            <div>
              <label class="block text-sm text-slate-600 dark:text-slate-400 mb-2">耐久値</label>
              <HealthSelector
                cost={costA}
                selectedHealth={unitA?.health ?? null}
                onSelect={handleHealthASelect}
                testIdPrefix="a"
              />
            </div>
          )}
        </div>
        {unitA && (
          <div class="mt-3 text-sm text-slate-700 dark:text-slate-300">
            選択中: コスト {unitA.cost} / 耐久 {unitA.health}
          </div>
        )}
      </div>

      {/* 機体B */}
      <div data-testid="formation-panel-b" class="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
        <h3 class="text-lg font-bold text-green-600 dark:text-green-400 mb-3">機体B</h3>
        <div class="space-y-3">
          <div>
            <MobileSuitSearch
              onSelect={handleSuitBSelect}
              placeholder="機体B名で検索..."
              toggleTestId="search-toggle-b"
            />
          </div>
          <div>
            <label class="block text-sm text-slate-600 dark:text-slate-400 mb-2">コスト</label>
            <CostSelector selectedCost={costB} onSelect={handleCostBSelect} testIdPrefix="b" />
          </div>
          {costB && (
            <div>
              <label class="block text-sm text-slate-600 dark:text-slate-400 mb-2">耐久値</label>
              <HealthSelector
                cost={costB}
                selectedHealth={unitB?.health ?? null}
                onSelect={handleHealthBSelect}
                testIdPrefix="b"
              />
            </div>
          )}
        </div>
        {unitB && (
          <div class="mt-3 text-sm text-slate-700 dark:text-slate-300">
            選択中: コスト {unitB.cost} / 耐久 {unitB.health}
          </div>
        )}
      </div>
    </div>
  );
}
