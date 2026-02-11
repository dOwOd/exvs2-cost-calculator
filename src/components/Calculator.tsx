/**
 * メイン計算機コンポーネント（状態管理）
 */

import { useState, useEffect } from 'preact/hooks';
import type { Formation, UnitConfig, EvaluatedPattern } from '../lib/types';
import { FormationPanel } from './FormationPanel';
import { SavedFormationsPanel } from './SavedFormationsPanel';
import { ResultPanel } from './ResultPanel';
import { Footer } from './Footer';
import { CookieConsentBanner } from './CookieConsentBanner';
import { ThemeToggle } from './ThemeToggle';
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
    <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div class="container mx-auto p-3 sm:p-4 md:p-6">
        <header class="mb-4 md:mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                EXVS2 コスト計算機
              </h1>
              <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                編成を選択して最適な撃墜順パターンを確認
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

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

        {/* SEO向け静的コンテンツ */}
        <section class="mt-8 md:mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div class="space-y-8">
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                主な機能
              </h2>
              <ul class="space-y-2 text-slate-600 dark:text-slate-400">
                <li>チーム共有コスト6000の配分に基づく撃墜順パターンの網羅的な算出</li>
                <li>各パターンの総耐久値と最短敗北時の耐久値を自動計算</li>
                <li>EXオーバーリミット発動可能パターンのフィルタリング</li>
                <li>コストオーバー時の復帰耐久値と減少率の表示</li>
                <li>1500/2000/2500/3000コストの全機体に対応</li>
                <li>編成の保存・読込機能とパターン画像のエクスポート</li>
              </ul>
            </div>

            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                使い方
              </h2>
              <ol class="space-y-2 text-slate-600 dark:text-slate-400 list-decimal list-inside">
                <li>A機・B機それぞれのコスト（1500/2000/2500/3000）と耐久値を選択</li>
                <li>計算は自動で実行され、全撃墜順パターンが一覧表示されます</li>
                <li>EXオーバーリミット発動可能パターンのみに絞り込むことも可能</li>
                <li>各パターンのコスト推移テーブルで、撃墜ごとの残コストと復帰耐久を確認</li>
              </ol>
            </div>

            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                EXオーバーリミットについて
              </h2>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                EXオーバーリミットは、チームの残コストが編成内の最低コスト以下になった時に発動可能になるシステムです。発動中は攻撃力・機動力が上昇し、100ダメージ分のバリアと与ダメージ30%の耐久回復効果を得られます。撃墜順によって発動タイミングが変わるため、編成に応じた最適なパターンを事前に把握することが重要です。
              </p>
            </div>
          </div>
        </section>

        {/* フッター */}
        <Footer />
      </div>

      {/* Cookie同意バナー */}
      <CookieConsentBanner />
    </div>
  );
};
