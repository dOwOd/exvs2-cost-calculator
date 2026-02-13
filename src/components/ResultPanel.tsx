/**
 * 結果パネル（フィルター + パターンリスト）
 */

import { useState } from 'preact/hooks';
import type { EvaluatedPattern, Formation } from '../lib/types';
import { PatternList } from './PatternList';
import { getTopPatterns, getEffectivePatterns } from '../lib/evaluators';

type ResultPanelType = {
  patterns: EvaluatedPattern[];
  formation: Formation;
  minimumDefeatHealth: number;
};

export const ResultPanel = ({ patterns, formation, minimumDefeatHealth }: ResultPanelType) => {
  const [showOnlyEXAvailable, setShowOnlyEXAvailable] = useState(false);

  // 両方選択済みかどうか
  const isFormationComplete = formation.unitA && formation.unitB;

  // 編成が不完全な場合はパターンを空にするガード
  const effectivePatterns = getEffectivePatterns(patterns, formation);

  // 総耐久最大でソート（同じ総耐久値内で高コスト先落ち優先）
  const sortedPatterns = getTopPatterns(effectivePatterns, formation);

  // フィルタリング
  const filteredPatterns = showOnlyEXAvailable
    ? sortedPatterns.filter((p) => !p.isEXActivationFailure)
    : sortedPatterns;

  // ガイダンスメッセージを生成
  const getGuidanceMessage = () => {
    if (!formation.unitA && !formation.unitB) {
      return '編成を入力すると計算結果が表示されます';
    }
    if (!formation.unitA) {
      return '機体Aを選択すると計算結果が表示されます';
    }
    if (!formation.unitB) {
      return '機体Bを選択すると計算結果が表示されます';
    }
    return null;
  };

  const guidanceMessage = getGuidanceMessage();

  return (
    <div class="bg-slate-100 dark:bg-slate-900 rounded-lg">
      {/* 編成情報 + フィルター */}
      <div class="border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4 sticky top-0 bg-slate-100 dark:bg-slate-900 z-10">
        {/* ガイダンスメッセージ */}
        {guidanceMessage && (
          <div
            data-testid="formation-guidance"
            class="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700 text-center"
          >
            <p class="text-slate-700 dark:text-slate-300 text-lg">{guidanceMessage}</p>
          </div>
        )}

        {/* 編成情報（常時表示） */}
        <div class="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="text-sm sm:text-lg text-slate-600 dark:text-slate-400 font-mono flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
            <span data-testid="formation-status-a">
              <span class="text-blue-600 dark:text-blue-400 font-semibold">A</span>:{' '}
              {formation.unitA
                ? `コスト${formation.unitA.cost} / 耐久${formation.unitA.health}`
                : '未選択'}
            </span>
            <span class="hidden sm:inline mx-3 text-slate-400 dark:text-slate-600">|</span>
            <span data-testid="formation-status-b">
              <span class="text-green-600 dark:text-green-400 font-semibold">B</span>:{' '}
              {formation.unitB
                ? `コスト${formation.unitB.cost} / 耐久${formation.unitB.health}`
                : '未選択'}
            </span>
          </div>
        </div>

        {/* フィルター（両方選択済みの場合のみ表示） */}
        {isFormationComplete && (
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative">
                <input
                  type="checkbox"
                  data-testid="ex-filter-checkbox"
                  checked={showOnlyEXAvailable}
                  onChange={(e) => setShowOnlyEXAvailable(e.currentTarget.checked)}
                  class="sr-only peer"
                />
                <div class="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 group-hover:border-slate-400 dark:group-hover:border-slate-500">
                  <svg
                    class={`w-full h-full text-white transition-all duration-200 ${showOnlyEXAvailable ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <span class="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
                    clipRule="evenodd"
                  />
                </svg>
                EXオーバーリミット発動可能のみ表示
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 編成サマリー */}
      {isFormationComplete &&
        sortedPatterns.length > 0 &&
        (() => {
          const healthValues = sortedPatterns.map((p) => p.totalHealth);
          const maxHealth = Math.max(...healthValues);
          const minHealth = Math.min(...healthValues);
          return (
            <div class="mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-4 md:mt-6 bg-slate-200 dark:bg-slate-800 p-3 sm:p-4 rounded">
              <div class="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                <div>
                  <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    総耐久の範囲
                  </div>
                  <div class="text-base sm:text-xl font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    {minHealth}〜{maxHealth}
                  </div>
                </div>
                <div>
                  <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    最短敗北耐久
                  </div>
                  <div class="text-base sm:text-xl font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    {minimumDefeatHealth}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* パターンリスト */}
      <div class="p-3 sm:p-4 md:p-6">
        <PatternList
          patterns={filteredPatterns}
          maxTotalHealth={
            sortedPatterns.length > 0 ? Math.max(...sortedPatterns.map((p) => p.totalHealth)) : 0
          }
          formation={formation}
        />
      </div>
    </div>
  );
};
