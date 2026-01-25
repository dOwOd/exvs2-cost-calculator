/**
 * パターンリスト（全パターン表示）
 */

import type { EvaluatedPattern, Formation } from '../lib/types';
import { PatternCard } from './PatternCard';

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
