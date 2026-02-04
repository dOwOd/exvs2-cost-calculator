/**
 * パターンカード（個別パターン表示）
 */

import { useState } from 'preact/hooks';
import type { EvaluatedPattern, Formation } from '../lib/types';
import { InfoIcon } from './Tooltip';

type PatternCardType = {
  pattern: EvaluatedPattern;
  rank: number;
  minimumDefeatHealth: number;
  formation: Formation;
  showScrollHint?: boolean;
}

export const PatternCard = ({
  pattern,
  rank,
  minimumDefeatHealth,
  formation,
  showScrollHint = false,
}: PatternCardType) => {
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = () => {
    if (!hasScrolled) {
      setHasScrolled(true);
    }
  };
  // 実際に発生した撃墜のみを表示（敗北までの部分）
  const actualPattern = pattern.pattern.slice(0, pattern.transitions.length);

  // EX発動可能判定用のminCost計算
  const minCost =
    formation.unitA && formation.unitB
      ? Math.min(formation.unitA.cost, formation.unitB.cost)
      : 0;

  return (
    <div
      data-testid={`pattern-card-${rank}`}
      class={`bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg border-l-4 shadow-sm dark:shadow-none ${pattern.isEXActivationFailure ? 'border-red-500' : 'border-blue-500'
        }`}
    >
      {/* ランクとパターン */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div class="flex items-center gap-2 sm:gap-3">
          <span data-testid={`pattern-rank-${rank}`} class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">#{rank}</span>
          <div data-testid={`pattern-string-${rank}`} class="text-lg sm:text-2xl font-mono flex items-center gap-1 sm:gap-2">
            {actualPattern.map((unit, index) => (
              <>
                <span
                  class={unit === 'A' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}
                  key={`${index}-unit`}
                >
                  {unit}
                </span>
                {index < actualPattern.length - 1 && (
                  <span class="text-slate-400 dark:text-slate-500" key={`${index}-arrow`}>→</span>
                )}
              </>
            ))}
          </div>
        </div>
        <div class="flex gap-2">
          {pattern.canActivateEXOverLimit && !pattern.isEXActivationFailure && (
            <span class="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs sm:text-sm font-semibold">
              EXオーバーリミット発動可
            </span>
          )}
          {pattern.isEXActivationFailure && (
            <span class="px-2 sm:px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs sm:text-sm font-semibold">
              EXオーバーリミット不発
            </span>
          )}
        </div>
      </div>

      {/* 評価指標 */}
      <div class="mb-3">
        <div class="bg-slate-100 dark:bg-slate-700 p-2 sm:p-3 rounded">
          <div data-testid={`pattern-total-health-${rank}`} class="flex flex-wrap items-baseline justify-center gap-1 sm:gap-2">
            <span class="text-sm sm:text-base text-slate-600 dark:text-slate-400 flex items-center">
              総耐久
              <InfoIcon tooltip="リスポーン時の耐久変動を考慮した真の総耐久値。高いほど長く戦える。" />
            </span>
            <span class="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {pattern.totalHealth}
            </span>
            <span class="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              (最短: {minimumDefeatHealth})
            </span>
          </div>
        </div>
      </div>

      {/* コスト推移テーブル */}
      <div class="relative">
        {/* スクロールヒント（最初のカードのみ、スクロール前のみ表示） */}
        {showScrollHint && !hasScrolled && (
          <div class="lg:hidden flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>スワイプで全体表示</span>
          </div>
        )}
        <div
          data-testid={`pattern-table-container-${rank}`}
          class="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0"
          onScroll={handleScroll}
        >
          <table class="w-full text-sm sm:text-lg min-w-[500px]">
          <thead>
            <tr class="border-b border-slate-300 dark:border-slate-600">
              <th class="text-left py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">撃墜順</th>
              <th class="text-left py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400">対象</th>
              <th class="text-right py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400">
                <span class="flex items-center justify-end whitespace-nowrap">
                  <span class="lg:hidden">残コスト</span>
                  <span class="hidden lg:inline">チーム残コスト</span>
                  <InfoIcon tooltip="チーム全体の残りコスト（6000から開始、A/B共有）。0以下で敗北。" />
                </span>
              </th>
              <th class="text-right py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400">
                <span class="flex items-center justify-end whitespace-nowrap">
                  <span class="lg:hidden">耐久</span>
                  <span class="hidden lg:inline">リスポーン耐久</span>
                  <InfoIcon tooltip="撃墜後のリスポーン時の耐久値。" align="right" />
                </span>
              </th>
              <th class="text-center py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400">
                <span class="flex items-center justify-center">
                  状態
                  <InfoIcon tooltip="✓=通常 ⚠️=コストオーバー 💀=敗北" align="right" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pattern.transitions.map((trans) => (
              <tr
                key={trans.killCount}
                class={`border-b border-slate-200 dark:border-slate-700 ${trans.isDefeat
                  ? 'bg-red-100 dark:bg-red-900/40'
                  : trans.isOverCost
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : ''
                  }`}
              >
                <td class="py-2 px-1 sm:px-2 text-slate-700 dark:text-slate-300">{trans.killCount}</td>
                <td class="py-2 px-1 sm:px-2">
                  <span
                    class={`font-semibold ${trans.killedUnit === 'A' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                      }`}
                  >
                    {trans.killedUnit}
                  </span>
                </td>
                <td class="py-2 px-1 sm:px-2">
                  <div class="flex flex-col gap-1">
                    <div class="text-right font-mono text-slate-700 dark:text-slate-300">
                      {trans.remainingCost}
                    </div>
                    <div class="bg-slate-200 dark:bg-slate-700 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div
                        class={`h-full transition-all ${trans.remainingCost <= minCost && trans.remainingCost > 0
                          ? 'bg-red-500'
                          : trans.remainingCost <= 3000 && trans.remainingCost > 0
                            ? 'bg-orange-500'
                            : trans.isOverCost
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                        style={`width: ${Math.max(0, (trans.remainingCost / 6000) * 100)}%`}
                      />
                    </div>
                  </div>
                </td>
                <td class="py-2 px-1 sm:px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                  {trans.isDefeat ? (
                    <span class="text-red-600 dark:text-red-400">-</span>
                  ) : (
                    trans.respawnHealth
                  )}
                </td>
                <td class="py-2 px-1 sm:px-2 text-center whitespace-nowrap">
                  {trans.isDefeat ? (
                    <span class="text-red-600 dark:text-red-400 font-semibold">💀 <span class="hidden sm:inline">敗北</span></span>
                  ) : trans.isOverCost ? (
                    <span class="text-yellow-600 dark:text-yellow-400 font-semibold">⚠️ <span class="hidden sm:inline">コストオーバー</span></span>
                  ) : (
                    <span class="text-green-600 dark:text-green-400">✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
