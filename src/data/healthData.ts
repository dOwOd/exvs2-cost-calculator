/**
 * EXVS2 コスト別耐久値データ
 */

import type { CostType, HealthType } from '../lib/types';

/** コスト別耐久値マップ */
export const healthDataByCost: Record<CostType, HealthType[]> = {
  3000: [800, 760, 750, 740, 720, 700, 680, 660, 650, 640],
  2500: [700, 680, 660, 650, 640, 620, 600],
  2000: [680, 660, 650, 640, 620, 600, 580],
  1500: [520, 500, 480, 460, 440],
};

/**
 * 指定したコストの耐久値リストを取得
 */
export function getHealthOptions(cost: CostType): HealthType[] {
  return healthDataByCost[cost];
}

/**
 * コストと耐久値の組み合わせが有効かチェック
 */
export function isValidHealthForCost(cost: CostType, health: HealthType): boolean {
  return healthDataByCost[cost].includes(health);
}
