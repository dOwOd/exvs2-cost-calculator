/**
 * メイン計算機コンポーネント（状態管理）
 */

import { useState, useEffect } from 'preact/hooks';
import type { Formation, UnitConfig, EvaluatedPattern } from '../lib/types';
import { FormationPanel } from './FormationPanel';
import { SavedFormationsPanel } from './SavedFormationsPanel';
import { ResultPanel } from './ResultPanel';
import { evaluateAllPatterns } from '../lib/evaluators';
import { calculateMinimumDefeatHealth } from '../lib/calculator';

export const Calculator = () => {
  const [formation, setFormation] = useState<Formation>({
    unitA: null,
    unitB: null,
  });

  const [evaluatedPatterns, setEvaluatedPatterns] = useState<
    EvaluatedPattern[]
  >([]);

  const [minimumDefeatHealth, setMinimumDefeatHealth] = useState<number>(0);

  // 編成変更時に自動計算
  useEffect(() => {
    if (formation.unitA && formation.unitB) {
      const patterns = evaluateAllPatterns(formation);
      setEvaluatedPatterns(patterns);
      const minHealth = calculateMinimumDefeatHealth(formation);
      setMinimumDefeatHealth(minHealth);
    } else {
      setEvaluatedPatterns([]);
      setMinimumDefeatHealth(0);
    }
  }, [formation]);

  const handleUnitAChange = (unit: UnitConfig | null) => {
    setFormation((prev) => ({ ...prev, unitA: unit }));
  };

  const handleUnitBChange = (unit: UnitConfig | null) => {
    setFormation((prev) => ({ ...prev, unitB: unit }));
  };

  const handleLoadFormation = (loaded: Formation) => {
    setFormation(loaded);
  };

  return (
    <div class="min-h-screen">
      <div class="container mx-auto p-3 sm:p-4 md:p-6">
        <div class="mb-4 md:mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            EXVS2 コスト計算機
          </h1>
          <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            編成を選択して最適な撃墜順パターンを確認
          </p>
        </div>

        <div data-testid="main-layout" class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 md:gap-6">
          {/* 左カラム: 編成選択 + 保存編成 */}
          <aside class="space-y-4 md:space-y-6">
            <FormationPanel
              unitA={formation.unitA}
              unitB={formation.unitB}
              onUnitAChange={handleUnitAChange}
              onUnitBChange={handleUnitBChange}
            />
            <SavedFormationsPanel
              formation={formation}
              onLoad={handleLoadFormation}
            />
          </aside>

          {/* 右カラム: 結果表示 */}
          <main>
            <ResultPanel
              patterns={evaluatedPatterns}
              formation={formation}
              minimumDefeatHealth={minimumDefeatHealth}
            />
          </main>
        </div>
      </div>
    </div>
  );
};
