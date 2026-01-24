/**
 * EXVS2 コストオーバー残耐久早見表
 *
 * ゲーム内で機体が撃墜され、残コストが機体コスト未満の状態で
 * リスポーンする際の残耐久値を定義したテーブル
 *
 * 使用例：
 * overCostHealthTable[3000][800][500] = 140
 * → 3000コスト・初期耐久800の機体が残コスト500でリスポーン時、残耐久140
 */

import type { CostType } from '../lib/types';

/** 残コストの種類 */
export type RemainingCostType = 500 | 1000 | 1500 | 2000;

/** コストオーバー時の残耐久テーブル */
type OverCostHealthTable = Record<
  CostType,
  Record<number, Partial<Record<RemainingCostType, number>>>
>;

export const overCostHealthTable: OverCostHealthTable = {
  3000: {
    800: { 500: 140, 1000: 270, 1500: 400 },
    760: { 500: 130, 1000: 260, 1500: 380 },
    750: { 500: 130, 1000: 250, 1500: 380 },
    740: { 500: 130, 1000: 250, 1500: 370 },
    720: { 500: 120, 1000: 240, 1500: 350 },
    700: { 500: 120, 1000: 240, 1500: 350 },
    680: { 500: 120, 1000: 230, 1500: 340 },
    660: { 500: 110, 1000: 220, 1500: 330 },
    650: { 500: 110, 1000: 220, 1500: 330 },
    640: { 500: 110, 1000: 220, 1500: 320 },
  },
  2500: {
    700: { 500: 140, 1000: 280, 1500: 420, 2000: 560 },
    680: { 500: 140, 1000: 280, 1500: 410, 2000: 550 },
    660: { 500: 140, 1000: 270, 1500: 400, 2000: 530 },
    650: { 500: 130, 1000: 260, 1500: 390, 2000: 520 },
    640: { 500: 130, 1000: 260, 1500: 390, 2000: 520 },
    620: { 500: 130, 1000: 250, 1500: 380, 2000: 500 },
    600: { 500: 120, 1000: 240, 1500: 360, 2000: 480 },
  },
  2000: {
    680: { 500: 170, 1000: 340, 1500: 510 },
    660: { 500: 170, 1000: 340, 1500: 500 },
    650: { 500: 170, 1000: 330, 1500: 490 },
    640: { 500: 160, 1000: 320, 1500: 480 },
    620: { 500: 160, 1000: 310, 1500: 470 },
    600: { 500: 150, 1000: 300, 1500: 450 },
    580: { 500: 150, 1000: 290, 1500: 440 },
  },
  1500: {
    520: { 500: 180, 1000: 350 },
    500: { 500: 170, 1000: 340 },
    480: { 500: 160, 1000: 320 },
    460: { 500: 160, 1000: 310 },
    440: { 500: 150, 1000: 300 },
    420: { 500: 140, 1000: 280 },
  },
};

/**
 * リスポーン時の耐久値を取得
 * @param cost 機体コスト
 * @param initialHealth 初期耐久値
 * @param remainingCost 残コスト
 * @returns リスポーン時の耐久値（残コストが十分な場合は初期耐久、敗北条件の場合は0）
 */
export function getRespawnHealth(
  cost: CostType,
  initialHealth: number,
  remainingCost: number
): number {
  // 残コストが0以下 → 敗北
  if (remainingCost <= 0) {
    return 0;
  }

  // 残コストが機体コスト以上 → 初期耐久でリスポーン
  if (remainingCost >= cost) {
    return initialHealth;
  }

  // コストオーバー時の残耐久をテーブルから取得
  const costTable = overCostHealthTable[cost];
  const healthTable = costTable?.[initialHealth];

  if (!healthTable) {
    console.warn(
      `警告: コスト${cost}、耐久${initialHealth}の組み合わせがテーブルに存在しません`
    );
    return initialHealth;
  }

  // 残コストを最も近いテーブルの値にマッピング
  // ゲーム上は必ず500/1000/1500/2000のいずれかになる
  const mappedRemainingCost = remainingCost as RemainingCostType;
  const respawnHealth = healthTable[mappedRemainingCost];

  if (respawnHealth === undefined) {
    console.warn(
      `警告: 残コスト${remainingCost}の値がテーブルに存在しません`
    );
    return initialHealth;
  }

  return respawnHealth;
}
