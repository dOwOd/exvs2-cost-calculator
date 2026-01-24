/**
 * タブナビゲーション（評価軸切り替え）
 */

import type { EvaluationAxisType } from '../lib/types';

interface TabNavigationProps {
  activeAxis: EvaluationAxisType;
  onAxisChange: (axis: EvaluationAxisType) => void;
}

const TABS: { axis: EvaluationAxisType; label: string; description: string }[] =
  [
    {
      axis: 'totalHealth',
      label: '総耐久最大',
      description: 'リスポーン耐久を考慮した真の総耐久値が最も高いパターン',
    },
    {
      axis: 'exGuaranteed',
      label: 'EX発動保証',
      description: 'EXオーバーリミットが確実に発動できるパターン',
    },
    {
      axis: 'theory',
      label: 'セオリー準拠',
      description: '低コスト後落ち、EX発動可能など定石に従ったパターン',
    },
    {
      axis: 'balanced',
      label: 'バランス重視',
      description: 'コストオーバーの深さを最小化し、バランスを重視',
    },
  ];

export default function TabNavigation({
  activeAxis,
  onAxisChange,
}: TabNavigationProps) {
  return (
    <div class="border-b border-slate-700">
      <div class="flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.axis}
            onClick={() => onAxisChange(tab.axis)}
            class={`px-4 py-3 font-semibold transition-colors border-b-2 ${
              activeAxis === tab.axis
                ? 'border-blue-500 text-blue-400 bg-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
            title={tab.description}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
