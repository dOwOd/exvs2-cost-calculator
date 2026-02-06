/**
 * パターンリスト（全パターン表示）
 */

import type { EvaluatedPattern, Formation, PatternStatistics } from '../lib/types';
import { PatternCard } from './PatternCard';
import { generatePatternComments } from '../lib/evaluators';

type PatternListType = {
  patterns: EvaluatedPattern[];
  minimumDefeatHealth: number;
  formation: Formation;
  statistics: PatternStatistics | null;
}

export const PatternList = ({
  patterns,
  minimumDefeatHealth,
  formation,
  statistics,
}: PatternListType) => {

  return (
    <div class="space-y-4">
      {patterns.map((pattern, index) => {
        const comments = statistics
          ? generatePatternComments(pattern, statistics)
          : [];

        return (
          <PatternCard
            key={index}
            pattern={pattern}
            rank={index + 1}
            minimumDefeatHealth={minimumDefeatHealth}
            formation={formation}
            showScrollHint={index === 0}
            comments={comments}
          />
        );
      })}
    </div>
  );
}
