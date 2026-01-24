/**
 * パターンリスト（TOP 5表示）
 */

import type { EvaluatedPattern } from '../lib/types';
import PatternCard from './PatternCard';

interface PatternListProps {
  patterns: EvaluatedPattern[];
}

export default function PatternList({ patterns }: PatternListProps) {
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
        <PatternCard key={index} pattern={pattern} rank={index + 1} />
      ))}
    </div>
  );
}
