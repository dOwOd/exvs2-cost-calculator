/**
 * パターンカード（個別パターン表示）
 */

import type { EvaluatedPattern, Formation } from '../lib/types';
import { InfoIcon } from './Tooltip';

type PatternCardType = {
  pattern: EvaluatedPattern;
  rank: number;
  minimumDefeatHealth: number;
  formation: Formation;
}

export const PatternCard = ({
  pattern,
  rank,
  minimumDefeatHealth,
  formation,
}: PatternCardType) => {
  // 実際に発生した撃墜のみを表示（敗北までの部分）
  const actualPattern = pattern.pattern.slice(0, pattern.transitions.length);

  // EX発動可能判定用のminCost計算
  const minCost =
    formation.unitA && formation.unitB
      ? Math.min(formation.unitA.cost, formation.unitB.cost)
      : 0;

  return (
    <div
      class={`bg-slate-800 p-4 rounded-lg border-l-4 ${pattern.isEXActivationFailure ? 'border-red-500' : 'border-blue-500'
        }`}
    >
      {/* ランクとパターン */}
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl font-bold text-blue-400">#{rank}</span>
          <div class="text-2xl font-mono flex items-center gap-2">
            {actualPattern.map((unit, index) => (
              <>
                <span
                  class={unit === 'A' ? 'text-blue-400' : 'text-green-400'}
                  key={`${index}-unit`}
                >
                  {unit}
                </span>
                {index < actualPattern.length - 1 && (
                  <span class="text-slate-500" key={`${index}-arrow`}>→</span>
                )}
              </>
            ))}
          </div>
        </div>
        <div class="flex gap-2">
          {pattern.canActivateEXOverLimit && !pattern.isEXActivationFailure && (
            <span class="px-3 py-1 bg-green-900 text-green-300 rounded text-sm font-semibold">
              ✅ EXオーバーリミット発動可
            </span>
          )}
          {pattern.isEXActivationFailure && (
            <span class="px-3 py-1 bg-red-900 text-red-300 rounded text-sm font-semibold">
              ⚠️ EXオーバーリミット不発
            </span>
          )}
        </div>
      </div>

      {/* 評価指標 */}
      <div class="mb-3">
        <div class="bg-slate-700 p-3 rounded">
          <div class="text-base text-slate-400 flex items-center">
            総耐久
            <InfoIcon tooltip="リスポーン時の耐久変動を考慮した真の総耐久値。高いほど長く戦える。" />
          </div>
          <div class="text-3xl font-semibold text-slate-100">
            {pattern.totalHealth}{' '}
            <span class="text-base text-slate-400 font-normal">
              (最短: {minimumDefeatHealth})
            </span>
          </div>
        </div>
      </div>

      {/* コスト推移テーブル */}
      <div class="overflow-x-auto">
        <table class="w-full text-lg table-fixed">
          <colgroup>
            <col class="w-20" />  {/* 撃墜順 */}
            <col class="w-16" />  {/* 対象 */}
            <col class="w-auto" /> {/* チーム残コスト（可変・メイン） */}
            <col class="w-50" />  {/* リスポーン耐久 */}
            <col class="w-60" />  {/* 状態 */}
          </colgroup>
          <thead>
            <tr class="border-b border-slate-600">
              <th class="text-left py-2 px-2 text-slate-400">撃墜順</th>
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
                  <InfoIcon tooltip="撃墜後のリスポーン時の耐久値。" align="right" />
                </span>
              </th>
              <th class="text-center py-2 px-2 text-slate-400">
                <span class="flex items-center justify-center">
                  状態
                  <InfoIcon tooltip="✓=通常 ⚠️=コストオーバー 💀=敗北" align="right" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pattern.transitions.map((trans) => (
              <tr
                key={trans.killCount}
                class={`border-b border-slate-700 ${trans.isDefeat
                  ? 'bg-red-900/40'
                  : trans.isOverCost
                    ? 'bg-yellow-900/20'
                    : ''
                  }`}
              >
                <td class="py-2 px-2 text-slate-300">{trans.killCount}</td>
                <td class="py-2 px-2">
                  <span
                    class={`font-semibold ${trans.killedUnit === 'A' ? 'text-blue-400' : 'text-green-400'
                      }`}
                  >
                    {trans.killedUnit}
                  </span>
                </td>
                <td class="py-2 px-2">
                  <div class="flex flex-col gap-1">
                    <div class="text-right font-mono text-slate-300">
                      {trans.remainingCost}
                    </div>
                    <div class="bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        class={`h-full transition-all ${trans.remainingCost <= minCost && trans.remainingCost > 0
                          ? 'bg-red-500'
                          : trans.remainingCost <= 3000 && trans.remainingCost > 0
                            ? 'bg-orange-500'
                            : trans.isOverCost
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                        style={`width: ${Math.max(0, (trans.remainingCost / 6000) * 100)}%`}
                      />
                    </div>
                  </div>
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
                    <span class="text-yellow-400 font-semibold">⚠️ コストオーバー</span>
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
