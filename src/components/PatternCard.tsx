/**
 * パターンカード（個別パターン表示）
 */

import type { EvaluatedPattern } from '../lib/types';
import { InfoIcon } from './Tooltip';

interface PatternCardProps {
  pattern: EvaluatedPattern;
  rank: number;
}

export default function PatternCard({ pattern, rank }: PatternCardProps) {
  const patternString = pattern.pattern.join(' → ');

  return (
    <div
      class={`bg-slate-800 p-4 rounded-lg border-l-4 ${
        pattern.isEXActivationFailure ? 'border-red-500' : 'border-blue-500'
      }`}
    >
      {/* ランクとパターン */}
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <span class="text-2xl font-bold text-blue-400">#{rank}</span>
          <span class="text-lg font-mono text-slate-200">{patternString}</span>
        </div>
        <div class="flex gap-2">
          {pattern.canActivateEXOverLimit && !pattern.isEXActivationFailure && (
            <span class="px-3 py-1 bg-green-900 text-green-300 rounded text-sm font-semibold">
              ✅ EX発動可
            </span>
          )}
          {pattern.isEXActivationFailure && (
            <span class="px-3 py-1 bg-red-900 text-red-300 rounded text-sm font-semibold">
              ⚠️ EX不発
            </span>
          )}
        </div>
      </div>

      {/* 評価指標 */}
      <div class="grid grid-cols-3 gap-4 mb-3">
        <div class="bg-slate-700 p-2 rounded">
          <div class="text-xs text-slate-400 flex items-center">
            総耐久
            <InfoIcon tooltip="リスポーン時の耐久変動を考慮した真の総耐久値。高いほど長く戦える。" />
          </div>
          <div class="text-lg font-semibold text-slate-100">
            {pattern.totalHealth}
          </div>
        </div>
        <div class="bg-slate-700 p-2 rounded">
          <div class="text-xs text-slate-400 flex items-center">
            オーバー回数
            <InfoIcon tooltip="コストオーバー（残コスト < 機体コスト）が発生する回数。多いほどリスポーン耐久が低下。" />
          </div>
          <div class="text-lg font-semibold text-slate-100">
            {pattern.overCostCount}
          </div>
        </div>
        <div class="bg-slate-700 p-2 rounded">
          <div class="text-xs text-slate-400 flex items-center">
            バランス
            <InfoIcon tooltip="コストオーバーの深さ（マイナス幅）の逆数。大きいほどバランスが良い。∞は一度もオーバーしない。" />
          </div>
          <div class="text-lg font-semibold text-slate-100">
            {pattern.balancedScore === Number.MAX_SAFE_INTEGER
              ? '∞'
              : pattern.balancedScore.toFixed(4)}
          </div>
        </div>
      </div>

      {/* コスト推移テーブル */}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-600">
              <th class="text-left py-2 px-2 text-slate-400">撃墜</th>
              <th class="text-left py-2 px-2 text-slate-400">対象</th>
              <th class="text-right py-2 px-2 text-slate-400">
                <span class="flex items-center justify-end">
                  チーム残コスト
                  <InfoIcon tooltip="チーム全体の残りコスト（6000から開始、A/B共有）。0以下で敗北。" />
                </span>
              </th>
              <th class="text-right py-2 px-2 text-slate-400">
                <span class="flex items-center justify-end">
                  リスポーン耐久
                  <InfoIcon tooltip="撃墜後のリスポーン時の耐久値。残コストが少ないほど低下。" />
                </span>
              </th>
              <th class="text-center py-2 px-2 text-slate-400">
                <span class="flex items-center justify-center">
                  状態
                  <InfoIcon tooltip="✓=通常 ⚠️=コストオーバー 💀=敗北" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pattern.transitions.map((trans) => (
              <tr
                key={trans.killCount}
                class={`border-b border-slate-700 ${
                  trans.isDefeat
                    ? 'bg-red-900/40'
                    : trans.isOverCost
                    ? 'bg-yellow-900/20'
                    : ''
                }`}
              >
                <td class="py-2 px-2 text-slate-300">{trans.killCount}</td>
                <td class="py-2 px-2">
                  <span
                    class={`font-semibold ${
                      trans.killedUnit === 'A' ? 'text-blue-400' : 'text-red-400'
                    }`}
                  >
                    {trans.killedUnit}
                  </span>
                </td>
                <td class="py-2 px-2 text-right font-mono text-slate-300">
                  {trans.remainingCost}
                </td>
                <td class="py-2 px-2 text-right font-mono text-slate-300">
                  {trans.isDefeat ? (
                    <span class="text-red-400">-</span>
                  ) : (
                    trans.respawnHealth
                  )}
                </td>
                <td class="py-2 px-2 text-center">
                  {trans.isDefeat ? (
                    <span class="text-red-400 font-semibold">💀 敗北</span>
                  ) : trans.isOverCost ? (
                    <span class="text-yellow-400 font-semibold">⚠️ オーバー</span>
                  ) : (
                    <span class="text-green-400">✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
