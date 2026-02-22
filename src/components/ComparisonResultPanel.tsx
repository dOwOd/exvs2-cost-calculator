/**
 * 比較結果パネル（複数編成の比較表示）
 */

import { useState, useMemo } from 'preact/hooks';
import type { Formation, EvaluatedPattern } from '../lib/types';
import {
  getTopPatterns,
  getEffectivePatterns,
  calculateComparisonMetrics,
} from '../lib/evaluators';
import { PatternCard } from './PatternCard';

const TOP_PATTERN_COUNT = 3;

type FormationEvalResult = {
  evaluatedPatterns: EvaluatedPattern[];
  minimumDefeatHealth: number;
};

type ComparisonResultPanelType = {
  formations: Formation[];
  evals: FormationEvalResult[];
};

/** バーの幅（%）を計算する */
export const calculateBarWidths = (
  values: (string | number)[],
  highlightBest?: 'max' | 'min',
): (number | null)[] => {
  if (!highlightBest) {
    // EX発動可能: "3/5" 形式 → 分子を抽出して比較
    const numerators = values.map((v) => {
      if (typeof v === 'string' && v.includes('/')) {
        const parsed = parseInt(v, 10);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    });
    const validNumerators = numerators.filter((n): n is number => n !== null);
    if (validNumerators.length === 0) return values.map(() => null);
    const maxNumerator = Math.max(...validNumerators);
    if (maxNumerator === 0) return values.map(() => null);
    return numerators.map((n) => (n !== null ? (n / maxNumerator) * 100 : null));
  }

  const numericValues = values.map((v) => (typeof v === 'number' ? v : null));
  const validValues = numericValues.filter((n): n is number => n !== null && n > 0);
  if (validValues.length === 0) return values.map(() => null);

  if (highlightBest === 'max') {
    const maxVal = Math.max(...validValues);
    return numericValues.map((v) => (v !== null && v > 0 ? (v / maxVal) * 100 : null));
  }

  // highlightBest === 'min': 小さい方が良い → 反転
  const minVal = Math.min(...validValues);
  return numericValues.map((v) => (v !== null && v > 0 ? (minVal / v) * 100 : null));
};

/** 比較指標の行ラベルと値を生成 */
const MetricRow = ({
  label,
  values,
  highlightBest,
}: {
  label: string;
  values: (string | number)[];
  highlightBest?: 'max' | 'min';
}) => {
  const numericValues = values.map((v) => (typeof v === 'number' ? v : NaN));
  const bestValue =
    highlightBest === 'max'
      ? Math.max(...numericValues.filter((n) => !isNaN(n)))
      : highlightBest === 'min'
        ? Math.min(...numericValues.filter((n) => !isNaN(n) && n > 0))
        : null;

  const barWidths = calculateBarWidths(values, highlightBest);

  return (
    <tr class="border-b border-slate-200 dark:border-slate-700">
      <td class="py-2 px-2 sm:px-3 text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
        {label}
      </td>
      {values.map((val, i) => {
        const isBest =
          bestValue !== null &&
          typeof val === 'number' &&
          val === bestValue &&
          numericValues.filter((n) => n === bestValue).length === 1;
        const barWidth = barWidths[i];
        // highlightBest がある場合はテキストの isBest と統一、ない場合（EX発動可能）は100%バーを最良扱い
        const isBestBar = highlightBest ? isBest : barWidth !== null && barWidth >= 100;
        return (
          <td
            key={i}
            class={`py-2 px-2 sm:px-3 text-sm font-mono text-right ${
              isBest
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {val}
            {barWidth !== null && (
              <div class="bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  class={`h-full rounded-full transition-all ${
                    isBestBar ? 'bg-blue-500 dark:bg-blue-400' : 'bg-slate-400 dark:bg-slate-500'
                  }`}
                  style={`width: ${Math.round(barWidth)}%`}
                />
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
};

export const ComparisonResultPanel = ({ formations, evals }: ComparisonResultPanelType) => {
  const [exFilters, setExFilters] = useState<boolean[]>(() => formations.map(() => false));

  // 各編成×パターンの展開状態（key: `${formationIndex}-${rank}`）
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (let i = 0; i < formations.length; i++) {
      initial.add(`${i}-0`); // 各編成のTOP 1を初期展開
    }
    return initial;
  });

  const toggleCard = (formationIndex: number, rank: number) => {
    const key = `${formationIndex}-${rank}`;
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // フィルター配列をフォーメーション数に同期
  const activeExFilters = useMemo(() => {
    const filters = [...exFilters];
    while (filters.length < formations.length) filters.push(false);
    return filters.slice(0, formations.length);
  }, [exFilters, formations.length]);

  const handleExFilterChange = (index: number, checked: boolean) => {
    setExFilters((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push(false);
      next[index] = checked;
      return next;
    });
  };

  // 各編成のソート・フィルタ済みパターンと指標を計算
  const processedData = useMemo(() => {
    return formations.map((formation, i) => {
      const eval_ = evals[i];
      const effectivePatterns = getEffectivePatterns(eval_.evaluatedPatterns, formation);
      const sortedPatterns = getTopPatterns(effectivePatterns, formation);
      const filteredPatterns = activeExFilters[i]
        ? sortedPatterns.filter((p) => !p.isEXActivationFailure)
        : sortedPatterns;
      const topPatterns = filteredPatterns.slice(0, TOP_PATTERN_COUNT);
      const metrics = calculateComparisonMetrics(sortedPatterns, eval_.minimumDefeatHealth);
      const maxTotalHealth =
        sortedPatterns.length > 0 ? Math.max(...sortedPatterns.map((p) => p.totalHealth)) : 0;

      return {
        formation,
        sortedPatterns,
        filteredPatterns,
        topPatterns,
        metrics,
        maxTotalHealth,
        isComplete: formation.unitA !== null && formation.unitB !== null,
      };
    });
  }, [formations, evals, activeExFilters]);

  const allMetrics = processedData.map((d) => d.metrics);
  const hasAnyComplete = processedData.some((d) => d.isComplete);

  return (
    <div data-testid="comparison-result-panel" class="bg-slate-100 dark:bg-slate-900 rounded-lg">
      {/* 比較指標サマリー */}
      {hasAnyComplete && (
        <div class="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">比較指標</h3>
          <div class="overflow-x-auto">
            <table data-testid="comparison-metrics-table" class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-300 dark:border-slate-600">
                  <th class="py-2 px-2 sm:px-3 text-left text-slate-600 dark:text-slate-400"></th>
                  {formations.map((f, i) => (
                    <th
                      key={i}
                      class="py-2 px-2 sm:px-3 text-right text-slate-600 dark:text-slate-400 font-medium"
                    >
                      <div class="flex flex-col items-end gap-0.5">
                        <span>編成 {i + 1}</span>
                        {f.unitA && f.unitB && (
                          <span class="text-xs font-normal text-slate-500 dark:text-slate-500">
                            {f.unitA.cost}+{f.unitB.cost}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <MetricRow
                  label="総耐久（最大）"
                  values={allMetrics.map((m) =>
                    m.totalPatternCount > 0 ? m.totalHealthRange.max : '-',
                  )}
                  highlightBest="max"
                />
                <MetricRow
                  label="総耐久（最小）"
                  values={allMetrics.map((m) =>
                    m.totalPatternCount > 0 ? m.totalHealthRange.min : '-',
                  )}
                  highlightBest="max"
                />
                <MetricRow
                  label="最短敗北耐久"
                  values={allMetrics.map((m) =>
                    m.minimumDefeatHealth > 0 ? m.minimumDefeatHealth : '-',
                  )}
                  highlightBest="min"
                />
                <MetricRow
                  label="EX発動可能"
                  values={allMetrics.map((m) =>
                    m.totalPatternCount > 0 ? `${m.exAvailableCount}/${m.totalPatternCount}` : '-',
                  )}
                />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOP パターン比較 */}
      <div class="p-3 sm:p-4">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          TOP {TOP_PATTERN_COUNT} パターン比較
        </h3>

        {/* EX フィルター */}
        <div class="flex flex-wrap gap-3 mb-4">
          {formations.map((_, i) => (
            <label
              key={i}
              class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              <input
                type="checkbox"
                data-testid={`comparison-ex-filter-${i}`}
                checked={activeExFilters[i]}
                onChange={(e) => handleExFilterChange(i, e.currentTarget.checked)}
                class="rounded border-slate-300 dark:border-slate-600"
              />
              編成{i + 1}: EX発動可能のみ
            </label>
          ))}
        </div>

        {/* パターンカード表示（グリッド） */}
        <div
          class={`grid gap-4 ${
            formations.length === 3 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {processedData.map((data, i) => (
            <div key={i} data-testid={`comparison-pattern-column-${i}`}>
              <div class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                編成 {i + 1}
                {data.formation.unitA && data.formation.unitB && (
                  <span class="ml-1 font-normal text-xs">
                    ({data.formation.unitA.cost}+{data.formation.unitB.cost})
                  </span>
                )}
              </div>
              {!data.isComplete ? (
                <div class="text-sm text-slate-500 dark:text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-800 rounded">
                  機体を選択してください
                </div>
              ) : data.topPatterns.length === 0 ? (
                <div class="text-sm text-slate-500 dark:text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-800 rounded">
                  該当パターンなし
                </div>
              ) : (
                <div class="space-y-3">
                  {data.topPatterns.map((pattern, rank) => (
                    <PatternCard
                      key={rank}
                      pattern={pattern}
                      rank={rank + 1}
                      maxTotalHealth={data.maxTotalHealth}
                      formation={data.formation}
                      isExpanded={expandedCards.has(`${i}-${rank}`)}
                      onToggle={() => toggleCard(i, rank)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
