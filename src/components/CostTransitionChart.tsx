/**
 * コスト推移チャート（SVG折れ線グラフ）
 */

import type { BattleState } from '../lib/types';

type Props = {
  transitions: BattleState[];
  minCost: number; // EX発動可能ライン
};

// SVGの定数
const SVG_WIDTH = 400;
const SVG_HEIGHT = 200;
const PADDING = 20;
const CHART_WIDTH = SVG_WIDTH - PADDING * 2;
const CHART_HEIGHT = SVG_HEIGHT - PADDING * 2;
const MAX_COST = 6000;

// 色定義
const COLORS = {
  exArea: 'rgba(239, 68, 68, 0.15)', // red-500 15%
  cautionArea: 'rgba(249, 115, 22, 0.15)', // orange-500 15%
  exLine: '#ef4444', // red-500
  costLine: '#3b82f6', // blue-500
  markerDefault: '#3b82f6', // blue-500
  markerUnitA: '#3b82f6', // blue-500
  markerUnitB: '#22c55e', // green-500
  markerOverCost: '#eab308', // yellow-500
  markerDefeat: '#ef4444', // red-500
  gridLine: '#e2e8f0', // slate-200
  gridLineDark: '#475569', // slate-600
  text: '#64748b', // slate-500
  textDark: '#94a3b8', // slate-400
};

/**
 * コスト値をY座標に変換
 * Y軸は上が6000、下が0
 */
const costToY = (cost: number): number => {
  const normalizedCost = Math.max(0, Math.min(cost, MAX_COST));
  return PADDING + CHART_HEIGHT * (1 - normalizedCost / MAX_COST);
};

/**
 * インデックスをX座標に変換
 */
const indexToX = (index: number, total: number): number => {
  if (total <= 1) return PADDING + CHART_WIDTH / 2;
  return PADDING + (CHART_WIDTH * index) / (total - 1);
};

/**
 * データ点の情報
 */
type DataPoint = {
  x: number;
  y: number;
  cost: number;
  isOverCost: boolean;
  isDefeat: boolean;
  killedUnit: 'A' | 'B' | null;
};

/**
 * transitionsからデータ点を生成
 */
const createDataPoints = (transitions: BattleState[]): DataPoint[] => {
  const points: DataPoint[] = [];
  const total = transitions.length + 1;

  // 開始点（6000）
  points.push({
    x: indexToX(0, total),
    y: costToY(MAX_COST),
    cost: MAX_COST,
    isOverCost: false,
    isDefeat: false,
    killedUnit: null,
  });

  // 各transition
  transitions.forEach((trans, index) => {
    points.push({
      x: indexToX(index + 1, total),
      y: costToY(trans.remainingCost),
      cost: trans.remainingCost,
      isOverCost: trans.isOverCost,
      isDefeat: trans.isDefeat,
      killedUnit: trans.killedUnit,
    });
  });

  return points;
};

/**
 * マーカーの色を決定
 */
const getMarkerColor = (point: DataPoint): string => {
  if (point.isDefeat) return COLORS.markerDefeat;
  if (point.isOverCost) return COLORS.markerOverCost;
  if (point.killedUnit === 'A') return COLORS.markerUnitA;
  if (point.killedUnit === 'B') return COLORS.markerUnitB;
  return COLORS.markerDefault;
};

export const CostTransitionChart = ({ transitions, minCost }: Props) => {
  const dataPoints = createDataPoints(transitions);
  const exLineY = costToY(minCost);
  const cautionLineY = costToY(3000);

  // 折れ線のポイント文字列
  const polylinePoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      class="w-full h-auto"
      role="img"
      aria-label="コスト推移グラフ"
    >
      {/* 背景エリア */}
      {/* EX発動可能エリア（minCost以下） */}
      <rect
        data-testid="ex-activation-area"
        x={PADDING}
        y={exLineY}
        width={CHART_WIDTH}
        height={SVG_HEIGHT - PADDING - exLineY}
        fill={COLORS.exArea}
      />

      {/* 注意エリア（3000以下、minCostより上の部分） */}
      {minCost < 3000 && (
        <rect
          data-testid="caution-area"
          x={PADDING}
          y={cautionLineY}
          width={CHART_WIDTH}
          height={exLineY - cautionLineY}
          fill={COLORS.cautionArea}
        />
      )}

      {/* グリッド線（水平） */}
      {[0, 1500, 3000, 4500, 6000].map((cost) => (
        <line
          key={cost}
          x1={PADDING}
          y1={costToY(cost)}
          x2={SVG_WIDTH - PADDING}
          y2={costToY(cost)}
          stroke="currentColor"
          strokeWidth={0.5}
          class="text-slate-200 dark:text-slate-600"
        />
      ))}

      {/* Y軸ラベル */}
      {[0, 3000, 6000].map((cost) => (
        <text
          key={cost}
          x={PADDING - 4}
          y={costToY(cost) + 4}
          textAnchor="end"
          class="text-[10px] fill-slate-500 dark:fill-slate-400"
        >
          {cost}
        </text>
      ))}

      {/* EX発動ライン（赤点線） */}
      <line
        data-testid="ex-activation-line"
        x1={PADDING}
        y1={exLineY}
        x2={SVG_WIDTH - PADDING}
        y2={exLineY}
        stroke={COLORS.exLine}
        strokeWidth={2}
        strokeDasharray="6,4"
      />

      {/* EXラインラベル */}
      <text
        x={SVG_WIDTH - PADDING - 2}
        y={exLineY - 4}
        textAnchor="end"
        class="text-[9px] fill-red-500 dark:fill-red-400 font-semibold"
      >
        EX発動 ({minCost})
      </text>

      {/* 折れ線 */}
      <polyline
        data-testid="cost-line"
        points={polylinePoints}
        fill="none"
        stroke={COLORS.costLine}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* データ点マーカー */}
      {dataPoints.map((point, index) => (
        <g key={index}>
          <circle
            data-testid="data-marker"
            cx={point.x}
            cy={point.y}
            r={5}
            fill={getMarkerColor(point)}
            stroke="white"
            strokeWidth={2}
          />
          {/* コスト値ラベル（開始点と最終点以外） */}
          {index > 0 && index < dataPoints.length - 1 && (
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              class="text-[9px] fill-slate-600 dark:fill-slate-300 font-medium"
            >
              {point.cost}
            </text>
          )}
          {/* 開始点ラベル */}
          {index === 0 && (
            <text
              x={point.x + 8}
              y={point.y + 4}
              textAnchor="start"
              class="text-[9px] fill-slate-600 dark:fill-slate-300 font-medium"
            >
              {point.cost}
            </text>
          )}
          {/* 最終点ラベル */}
          {index === dataPoints.length - 1 && (
            <text
              x={point.x}
              y={point.y + 16}
              textAnchor="middle"
              class="text-[9px] fill-slate-600 dark:fill-slate-300 font-medium"
            >
              {point.cost}
            </text>
          )}
        </g>
      ))}

      {/* X軸ラベル */}
      {dataPoints.map((point, index) => (
        <text
          key={index}
          x={point.x}
          y={SVG_HEIGHT - 4}
          textAnchor="middle"
          class="text-[9px] fill-slate-500 dark:fill-slate-400"
        >
          {index === 0 ? '開始' : `${index}`}
        </text>
      ))}
    </svg>
  );
};
