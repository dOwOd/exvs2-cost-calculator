/**
 * 機体名データ
 * コスト×耐久値ごとの代表的な機体名
 */

import type { CostType, HealthType } from '../lib/types';

/**
 * 機体名マッピング
 *
 * 使い方:
 * mobileSuitsData[3000][800] // => ['νガンダム', 'Hi-νガンダム']
 */
export const mobileSuitsData: Record<CostType, Partial<Record<HealthType, string[]>>> = {
  3000: {
    // サンプルデータ（動作確認用）
    // TODO: 実際の機体名に置き換えてください
    800: ['ゴッドガンダム', 'マスターガンダム'],
    // 以下、実際のデータを追加してください
  } as Partial<Record<HealthType, string[]>>,
  2500: {
    // サンプルデータ（動作確認用）
    // TODO: 実際の機体名に置き換えてください
    700: ['サンプル機体D'],
    // 以下、実際のデータを追加してください
  } as Partial<Record<HealthType, string[]>>,
  2000: {} as Partial<Record<HealthType, string[]>>,
  1500: {} as Partial<Record<HealthType, string[]>>,
};

/**
 * 機体名を取得
 * @param cost - コスト
 * @param health - 耐久値
 * @returns 機体名の配列（最大2つまで）+ 残り機体数
 */
export function getMobileSuitNames(
  cost: CostType,
  health: HealthType
): { names: string[]; remaining: number } {
  const suits = mobileSuitsData[cost]?.[health] || [];

  // 最初の2つまで取得
  const names = suits.slice(0, 2);
  const remaining = Math.max(0, suits.length - 2);

  return { names, remaining };
}

/**
 * 機体名を表示用文字列に整形
 * @param cost - コスト
 * @param health - 耐久値
 * @returns 「νガンダム、Hi-νガンダム 他1機」のような文字列
 */
export function formatMobileSuitNames(cost: CostType, health: HealthType): string {
  const { names, remaining } = getMobileSuitNames(cost, health);

  if (names.length === 0) {
    return '';
  }

  const namesPart = names.join('、');
  const remainingPart = remaining > 0 ? ` 他${remaining}機` : '';

  return `${namesPart}${remainingPart}`;
}

/**
 * すべての機体名を取得（制限なし）
 * @param cost - コスト
 * @param health - 耐久値
 * @returns すべての機体名の配列
 */
export function getAllMobileSuitNames(cost: CostType, health: HealthType): string[] {
  return mobileSuitsData[cost]?.[health] || [];
}
