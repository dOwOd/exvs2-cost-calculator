/**
 * パターンリスト（全パターン表示）
 */

import type { EvaluatedPattern, Formation } from '../lib/types';
import PatternCard from './PatternCard';

interface PatternListProps {
  patterns: EvaluatedPattern[];
  minimumDefeatHealth: number;
  formation: Formation;
}

export default function PatternList({
  patterns,
  minimumDefeatHealth,
  formation,
}: PatternListProps) {
  if (patterns.length === 0) {
    return (
      <div class="text-center py-12 text-slate-400">
        編成を選択してください
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {patterns.map((pattern, index) => (
        <PatternCard
          key={index}
          pattern={pattern}
          rank={index + 1}
          minimumDefeatHealth={minimumDefeatHealth}
          formation={formation}
        />
      ))}
    </div>
  );
}
