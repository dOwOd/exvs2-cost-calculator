/**
 * 結果パネル（フィルター + パターンリスト）
 */

import { useState } from 'preact/hooks';
import type { EvaluatedPattern, Formation } from '../lib/types';
import PatternList from './PatternList';
import { getTopPatterns } from '../lib/evaluators';

interface ResultPanelProps {
  patterns: EvaluatedPattern[];
  formation: Formation;
  minimumDefeatHealth: number;
}

export default function ResultPanel({
  patterns,
  formation,
  minimumDefeatHealth,
}: ResultPanelProps) {
  const [showOnlyEXAvailable, setShowOnlyEXAvailable] = useState(false);

  // 総耐久最大でソート
  const sortedPatterns = getTopPatterns(patterns);

  // フィルタリング
  const filteredPatterns = showOnlyEXAvailable
    ? sortedPatterns.filter((p) => !p.isEXActivationFailure)
    : sortedPatterns;

  return (
    <div class="bg-slate-900 rounded-lg">
      {/* 編成情報 + フィルター */}
      <div class="border-b border-slate-700 p-4 sticky top-0 bg-slate-900 z-10">
        {/* 編成情報 */}
        {formation.unitA && formation.unitB && (
          <div class="mb-3 pb-3 border-b border-slate-700">
            <div class="text-lg text-slate-400 font-mono">
              <span class="text-blue-400 font-semibold">A</span>: {formation.unitA.cost}コスト / {formation.unitA.health}耐久
              <span class="mx-3 text-slate-600">|</span>
              <span class="text-green-400 font-semibold">B</span>: {formation.unitB.cost}コスト / {formation.unitB.health}耐久
            </div>
          </div>
        )}

        {/* フィルター */}
        <label class="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyEXAvailable}
            onChange={(e) => setShowOnlyEXAvailable(e.currentTarget.checked)}
            class="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span class="text-sm">EXオーバーリミット発動可能のみ表示</span>
        </label>
      </div>

      {/* パターンリスト */}
      <div class="p-6">
        <PatternList
          patterns={filteredPatterns}
          minimumDefeatHealth={minimumDefeatHealth}
          formation={formation}
        />
      </div>
    </div>
  );
}
