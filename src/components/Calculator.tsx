/**
 * メイン計算機コンポーネント（状態管理）
 */

import { useState, useEffect } from 'preact/hooks';
import type { Formation, UnitConfig, EvaluatedPattern } from '../lib/types';
import { FormationPanel } from './FormationPanel';
import { ResultPanel } from './ResultPanel';
import { Footer } from './Footer';
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

  return (
    <div class="min-h-screen bg-slate-900 text-slate-100">
      <div class="container mx-auto p-6">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-blue-400 mb-2">
            EXVS2 コスト計算機
          </h1>
          <p class="text-slate-400">
            編成を選択して最適な撃墜順パターンを確認
          </p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* 左カラム: 編成選択 */}
          <aside>
            <FormationPanel
              unitA={formation.unitA}
              unitB={formation.unitB}
              onUnitAChange={handleUnitAChange}
              onUnitBChange={handleUnitBChange}
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

        {/* フッター */}
        <Footer />
      </div>
    </div>
  );
};
