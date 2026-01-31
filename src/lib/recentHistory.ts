/**
 * 最近使用した機体の履歴管理
 * LocalStorageを使用して機体選択履歴を保存・取得する
 */

import type { MobileSuitInfo } from '../data/mobileSuitsData';

/**
 * 履歴に保存するデータ型
 */
export type RecentMobileSuit = MobileSuitInfo;

/**
 * LocalStorageのキー
 */
const STORAGE_KEY = 'exvs2-recent-suits';

/**
 * 履歴の最大件数
 */
const MAX_HISTORY_SIZE = 5;

/**
 * 履歴を取得
 * @returns 最近使用した機体の配列（最新が先頭）
 */
export const getRecentSuits = (): RecentMobileSuit[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as RecentMobileSuit[];
  } catch {
    // LocalStorageへのアクセス失敗、または不正なJSONの場合
    return [];
  }
};

/**
 * 履歴に機体を追加（重複する場合は先頭に移動）
 * @param suit - 追加する機体
 */
export const addToRecentSuits = (suit: MobileSuitInfo): void => {
  const current = getRecentSuits();

  // 同じ機体（name, cost, healthが一致）を除外
  const filtered = current.filter(
    (s) =>
      !(s.name === suit.name && s.cost === suit.cost && s.health === suit.health)
  );

  // 先頭に追加し、最大件数に制限
  const updated = [suit, ...filtered].slice(0, MAX_HISTORY_SIZE);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // 他のコンポーネントインスタンスに履歴更新を通知
    window.dispatchEvent(new CustomEvent('recent-suits-updated'));
  } catch {
    // LocalStorage容量不足等のエラーは無視（履歴は必須機能ではない）
  }
};

/**
 * 履歴をクリア
 */
export const clearRecentSuits = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // エラーは無視
  }
};
