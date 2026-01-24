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
    <div class="bg-slate-900 rounded-lg overflow-hidden">
      {/* フィルター */}
      <div class="border-b border-slate-700 p-4">
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
