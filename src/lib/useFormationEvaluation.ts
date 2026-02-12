/**
 * 編成評価カスタムフック
 * Calculator.tsx の評価ロジックを再利用可能な形で抽出
 */

import { useState, useEffect } from 'preact/hooks';
import type { Formation, EvaluatedPattern } from './types';
import { evaluateAllPatterns } from './evaluators';
import { calculateMinimumDefeatHealth } from './calculator';

type FormationEvaluationResult = {
  evaluatedPatterns: EvaluatedPattern[];
  minimumDefeatHealth: number;
};

export const useFormationEvaluation = (
  formation: Formation
): FormationEvaluationResult => {
  const [evaluatedPatterns, setEvaluatedPatterns] = useState<
    EvaluatedPattern[]
  >([]);
  const [minimumDefeatHealth, setMinimumDefeatHealth] = useState<number>(0);

  useEffect(() => {
    if (formation.unitA && formation.unitB) {
      const patterns = evaluateAllPatterns(formation);
      setEvaluatedPatterns(patterns);
      const minHealth = calculateMinimumDefeatHealth(formation);
      setMinimumDefeatHealth(minHealth);
    } else {
      setEvaluatedPatterns([]);
      setMinimumDefeatHealth(0);
    }
  }, [formation]);

  return { evaluatedPatterns, minimumDefeatHealth };
};
