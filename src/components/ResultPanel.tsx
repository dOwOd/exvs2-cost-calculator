/**
 * 結果パネル（タブ + パターンリスト）
 */

import { useState } from 'preact/hooks';
import type {
  EvaluatedPattern,
  EvaluationAxisType,
  Formation,
} from '../lib/types';
import TabNavigation from './TabNavigation';
import PatternList from './PatternList';
import { getTopPatterns } from '../lib/evaluators';

interface ResultPanelProps {
  patterns: EvaluatedPattern[];
  formation: Formation;
}

export default function ResultPanel({ patterns, formation }: ResultPanelProps) {
  const [activeAxis, setActiveAxis] =
    useState<EvaluationAxisType>('totalHealth');

  const topPatterns = getTopPatterns(patterns, activeAxis, formation, 5);

  return (
    <div class="bg-slate-900 rounded-lg overflow-hidden">
      <TabNavigation activeAxis={activeAxis} onAxisChange={setActiveAxis} />
      <div class="p-6">
        <PatternList patterns={topPatterns} />
      </div>
    </div>
  );
}
