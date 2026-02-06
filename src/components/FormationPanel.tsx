/**
 * 編成パネル（機体A/B選択）
 */

import { useState } from 'preact/hooks';
import type { CostType, UnitConfig, HealthType } from '../lib/types';
import { CostSelector } from './CostSelector';
import { HealthSelector } from './HealthSelector';
import { MobileSuitSearch } from './MobileSuitSearch';
import type { MobileSuitInfo } from '../data/mobileSuitsData';
import { partialRevivalSuits, hasPartialRevivalForCostHealth } from '../data/mobileSuitsData';

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
  // 復活持ちがいるコスト/耐久かどうか（チェックボックス表示判定用）
  const [canReviveA, setCanReviveA] = useState(false);
  const [canReviveB, setCanReviveB] = useState(false);

  const handleCostASelect = (cost: CostType) => {
    if (unitA && unitA.cost !== cost) {
      onUnitAChange(null);
      setCanReviveA(false);
    }
    setCostA(cost);
  };

  const handleCostBSelect = (cost: CostType) => {
    if (unitB && unitB.cost !== cost) {
      onUnitBChange(null);
      setCanReviveB(false);
    }
    setCostB(cost);
  };

  const handleHealthASelect = (health: HealthType) => {
    if (costA) {
      const canRevive = hasPartialRevivalForCostHealth(costA, health);
      setCanReviveA(canRevive);
      onUnitAChange({ cost: costA, health, hasPartialRevival: canRevive });
    }
  };

  const handleHealthBSelect = (health: HealthType) => {
    if (costB) {
      const canRevive = hasPartialRevivalForCostHealth(costB, health);
      setCanReviveB(canRevive);
      onUnitBChange({ cost: costB, health, hasPartialRevival: canRevive });
    }
  };

  const handleRevivalAChange = (checked: boolean) => {
    if (unitA) {
      onUnitAChange({ ...unitA, hasPartialRevival: checked });
    }
  };

  const handleRevivalBChange = (checked: boolean) => {
    if (unitB) {
      onUnitBChange({ ...unitB, hasPartialRevival: checked });
    }
  };

  const handleSuitASelect = (suit: MobileSuitInfo) => {
    setCostA(suit.cost);
    const hasRevival = partialRevivalSuits.has(suit.name);
    setCanReviveA(hasPartialRevivalForCostHealth(suit.cost, suit.health));
    onUnitAChange({ cost: suit.cost, health: suit.health, hasPartialRevival: hasRevival });
  };

  const handleSuitBSelect = (suit: MobileSuitInfo) => {
    setCostB(suit.cost);
    const hasRevival = partialRevivalSuits.has(suit.name);
    setCanReviveB(hasPartialRevivalForCostHealth(suit.cost, suit.health));
    onUnitBChange({ cost: suit.cost, health: suit.health, hasPartialRevival: hasRevival });
  };

  return (
    <div class="space-y-4 md:space-y-6">
      {/* 機体A */}
      <div data-testid="formation-panel-a" class="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
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
          <div class="mt-3 space-y-2">
            <div class="text-sm text-slate-700 dark:text-slate-300">
              選択中: コスト {unitA.cost} / 耐久 {unitA.health}
            </div>
            {canReviveA && (
              <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="revival-checkbox-a"
                  checked={unitA.hasPartialRevival ?? false}
                  onChange={(e) => handleRevivalAChange((e.target as HTMLInputElement).checked)}
                  class="rounded border-slate-300 dark:border-slate-600"
                />
                復活あり
              </label>
            )}
          </div>
        )}
      </div>

      {/* 機体B */}
      <div data-testid="formation-panel-b" class="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
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
          <div class="mt-3 space-y-2">
            <div class="text-sm text-slate-700 dark:text-slate-300">
              選択中: コスト {unitB.cost} / 耐久 {unitB.health}
            </div>
            {canReviveB && (
              <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="revival-checkbox-b"
                  checked={unitB.hasPartialRevival ?? false}
                  onChange={(e) => handleRevivalBChange((e.target as HTMLInputElement).checked)}
                  class="rounded border-slate-300 dark:border-slate-600"
                />
                復活あり
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
