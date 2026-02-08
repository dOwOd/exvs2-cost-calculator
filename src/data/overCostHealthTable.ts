/**
 * EXVS2 コストオーバー時のリスポーン耐久値計算
 *
 * 計算式: Math.ceil(health * remainingCost / cost / 10) * 10
 * ゲーム内実測で計算式と異なる値が確認されている2件は例外として保持
 */

import type { CostType } from '../lib/types';
import type { HealthType } from './mobileSuitsData';

// ゲーム内実測で計算式と異なる値が確認されている2件の例外
// TODO: 実測で計算式の値（360, 330）と一致した場合はこの例外を削除する
const OVERCOST_EXCEPTIONS: Readonly<Record<string, number>> = {
  '3000-720-1500': 350,
  '2000-660-1000': 340,
};

const calculateOverCostHealth = (
  cost: number,
  health: number,
  remainingCost: number
): number => {
  const key = `${cost}-${health}-${remainingCost}`;
  const exception = OVERCOST_EXCEPTIONS[key];
  if (exception !== undefined) return exception;
  return Math.ceil((health * remainingCost) / cost / 10) * 10;
};

/**
 * リスポーン時の耐久値を取得
 * @param cost 機体コスト
 * @param initialHealth 初期耐久値
 * @param remainingCost 残コスト
 * @returns リスポーン時の耐久値（残コストが十分な場合は初期耐久、敗北条件の場合は0）
 */
export const getRespawnHealth = (
  cost: CostType,
  initialHealth: HealthType,
  remainingCost: number
): number => {
  if (remainingCost <= 0) return 0;
  if (remainingCost >= cost) return initialHealth;
  return calculateOverCostHealth(cost, initialHealth, remainingCost);
};
