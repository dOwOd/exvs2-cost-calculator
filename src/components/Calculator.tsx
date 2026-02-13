/**
 * メイン計算機コンポーネント（状態管理）
 */

import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import type { Formation, UnitConfig } from '../lib/types';
import { ErrorBoundary } from './ErrorBoundary';
import { FormationPanel } from './FormationPanel';
import { SavedFormationsPanel } from './SavedFormationsPanel';
import { ResultPanel } from './ResultPanel';
import { ComparisonResultPanel } from './ComparisonResultPanel';
import { useFormationEvaluation } from '../lib/useFormationEvaluation';
import { encodeFormationToParams, decodeFormationFromParams } from '../lib/urlSharing';

type CalculatorMode = 'normal' | 'comparison';

const EMPTY_FORMATION: Formation = { unitA: null, unitB: null };
const MIN_COMPARISON_FORMATIONS = 2;
const MAX_COMPARISON_FORMATIONS = 3;

export const Calculator = () => {
  // --- モード管理 ---
  const [mode, setMode] = useState<CalculatorMode>('normal');

  // --- 通常モード用 ---
  const [formation, setFormation] = useState<Formation>(EMPTY_FORMATION);

  // --- URLフィルター状態（useEffectで復元） ---
  const [urlFilterState, setUrlFilterState] = useState({ exOnly: false, firstKillFilter: '' });

  // --- 比較モード用（固定3スロット） ---
  const [compFormations, setCompFormations] = useState<[Formation, Formation, Formation]>([
    EMPTY_FORMATION,
    EMPTY_FORMATION,
    EMPTY_FORMATION,
  ]);
  const [compCount, setCompCount] = useState(MIN_COMPARISON_FORMATIONS);

  // --- マウント時にURLパラメータから編成を復元 ---
  const [urlRestored, setUrlRestored] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
      const decoded = decodeFormationFromParams(params);
      setFormation(decoded.formation);
      setUrlFilterState({ exOnly: decoded.exOnly, firstKillFilter: decoded.firstKillFilter });
    }
    setUrlRestored(true);
  }, []);

  // --- URL同期（通常モードのみ、URL復元完了後） ---
  const updateUrl = useCallback((f: Formation) => {
    if (typeof window === 'undefined') return;
    const params = encodeFormationToParams(f);
    const search = params.toString();
    const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, []);

  useEffect(() => {
    if (urlRestored && mode === 'normal') {
      updateUrl(formation);
    }
  }, [formation, mode, updateUrl, urlRestored]);

  // --- 評価: 通常モード ---
  const normalEval = useFormationEvaluation(formation);

  // --- 評価: 比較モード（フックルールのため固定3回呼び出し） ---
  const compEval0 = useFormationEvaluation(compFormations[0]);
  const compEval1 = useFormationEvaluation(compFormations[1]);
  const compEval2 = useFormationEvaluation(compFormations[2]);
  const compEvals = useMemo(
    () => [compEval0, compEval1, compEval2],
    [compEval0, compEval1, compEval2],
  );

  // --- 通常モードのハンドラ ---
  const handleUnitAChange = (unit: UnitConfig | null) => {
    setFormation((prev) => ({ ...prev, unitA: unit }));
  };

  const handleUnitBChange = (unit: UnitConfig | null) => {
    setFormation((prev) => ({ ...prev, unitB: unit }));
  };

  const handleLoadFormation = (loaded: Formation) => {
    setFormation(loaded);
  };

  // --- 比較モードのハンドラ ---
  const handleCompUnitChange = (index: number, unitId: 'A' | 'B', unit: UnitConfig | null) => {
    setCompFormations((prev) => {
      const next = [...prev] as [Formation, Formation, Formation];
      next[index] =
        unitId === 'A' ? { ...next[index], unitA: unit } : { ...next[index], unitB: unit };
      return next;
    });
  };

  const handleAddFormation = () => {
    if (compCount < MAX_COMPARISON_FORMATIONS) {
      setCompCount(compCount + 1);
    }
  };

  const handleRemoveFormation = (index: number) => {
    if (compCount <= MIN_COMPARISON_FORMATIONS) return;

    setCompFormations((prev) => {
      const next = [...prev] as [Formation, Formation, Formation];
      for (let i = index; i < MAX_COMPARISON_FORMATIONS - 1; i++) {
        next[i] = next[i + 1];
      }
      next[MAX_COMPARISON_FORMATIONS - 1] = EMPTY_FORMATION;
      return next;
    });
    setCompCount(compCount - 1);
  };

  return (
    <ErrorBoundary>
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

          {/* モード切替 */}
          <div class="mb-4 md:mb-6 flex gap-2" data-testid="mode-toggle">
            <button
              type="button"
              data-testid="mode-normal"
              onClick={() => setMode('normal')}
              class={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                mode === 'normal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              通常モード
            </button>
            <button
              type="button"
              data-testid="mode-comparison"
              onClick={() => setMode('comparison')}
              class={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                mode === 'comparison'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              比較モード
            </button>
          </div>

          {/* 通常モード */}
          {mode === 'normal' && (
            <div
              data-testid="main-layout"
              class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 md:gap-6"
            >
              {/* 左カラム: 編成選択 + 保存編成 */}
              <aside class="space-y-4 md:space-y-6">
                <FormationPanel
                  unitA={formation.unitA}
                  unitB={formation.unitB}
                  onUnitAChange={handleUnitAChange}
                  onUnitBChange={handleUnitBChange}
                />
                <ErrorBoundary fallbackMessage="保存編成の読み込み中にエラーが発生しました">
                  <SavedFormationsPanel formation={formation} onLoad={handleLoadFormation} />
                </ErrorBoundary>
              </aside>

              {/* 右カラム: 結果表示 */}
              <main>
                <ResultPanel
                  patterns={normalEval.evaluatedPatterns}
                  formation={formation}
                  minimumDefeatHealth={normalEval.minimumDefeatHealth}
                  initialExOnly={urlFilterState.exOnly}
                  initialFirstKillFilter={urlFilterState.firstKillFilter}
                />
              </main>
            </div>
          )}

          {/* 比較モード */}
          {mode === 'comparison' && (
            <div data-testid="comparison-layout">
              {/* 編成パネル群 */}
              <div class="mb-4 md:mb-6">
                <div class="flex items-center justify-between mb-3">
                  <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    編成を選択（{compCount}つ）
                  </h2>
                  {compCount < MAX_COMPARISON_FORMATIONS && (
                    <button
                      type="button"
                      data-testid="add-formation-button"
                      onClick={handleAddFormation}
                      class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      編成を追加
                    </button>
                  )}
                </div>

                <div
                  class={`grid gap-4 ${
                    compCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
                  }`}
                >
                  {Array.from({ length: compCount }, (_, i) => (
                    <div
                      key={i}
                      data-testid={`comparison-formation-${i}`}
                      class="relative bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                    >
                      {/* 編成ラベルと削除ボタン */}
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          編成 {i + 1}
                        </span>
                        {compCount > MIN_COMPARISON_FORMATIONS && (
                          <button
                            type="button"
                            data-testid={`remove-formation-${i}`}
                            onClick={() => handleRemoveFormation(i)}
                            class="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="この編成を削除"
                          >
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <FormationPanel
                        unitA={compFormations[i].unitA}
                        unitB={compFormations[i].unitB}
                        onUnitAChange={(unit) => handleCompUnitChange(i, 'A', unit)}
                        onUnitBChange={(unit) => handleCompUnitChange(i, 'B', unit)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 比較結果 */}
              <ComparisonResultPanel
                formations={compFormations.slice(0, compCount)}
                evals={compEvals.slice(0, compCount)}
              />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
