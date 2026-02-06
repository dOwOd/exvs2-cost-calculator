/**
 * パターンリスト（全パターン表示）
 */

import { useState, useEffect } from 'preact/hooks';
import type { EvaluatedPattern, Formation } from '../lib/types';
import { PatternCard } from './PatternCard';

const DEFAULT_EXPANDED_COUNT = 3;

type PatternListType = {
  patterns: EvaluatedPattern[];
  minimumDefeatHealth: number;
  formation: Formation;
}

export const PatternList = ({
  patterns,
  minimumDefeatHealth,
  formation,
}: PatternListType) => {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    () => new Set([0, 1, 2])
  );

  // patterns変更時にTOP 3にリセット
  useEffect(() => {
    const initialExpanded = new Set<number>();
    for (let i = 0; i < Math.min(DEFAULT_EXPANDED_COUNT, patterns.length); i++) {
      initialExpanded.add(i);
    }
    setExpandedIndices(initialExpanded);
  }, [patterns]);

  const handleToggle = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const all = new Set<number>();
    for (let i = 0; i < patterns.length; i++) {
      all.add(i);
    }
    setExpandedIndices(all);
  };

  const handleCollapseAll = () => {
    setExpandedIndices(new Set());
  };

  const allExpanded = patterns.length > 0 && expandedIndices.size === patterns.length;

  return (
    <div class="space-y-4">
      {/* すべて展開/折りたたみボタン */}
      {patterns.length > DEFAULT_EXPANDED_COUNT && (
        <div class="flex justify-end">
          {allExpanded ? (
            <button
              data-testid="collapse-all-button"
              onClick={handleCollapseAll}
              class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              すべて折りたたみ
            </button>
          ) : (
            <button
              data-testid="expand-all-button"
              onClick={handleExpandAll}
              class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              すべて展開
            </button>
          )}
        </div>
      )}
      {patterns.map((pattern, index) => (
        <PatternCard
          key={index}
          pattern={pattern}
          rank={index + 1}
          minimumDefeatHealth={minimumDefeatHealth}
          formation={formation}
          showScrollHint={index === 0}
          isExpanded={expandedIndices.has(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
