/**
 * お気に入り機体の管理
 * LocalStorageを使用してお気に入り機体を保存・取得する
 */

import type { MobileSuitInfo } from '../data/mobileSuitsData';

const STORAGE_KEY = 'exvs2-favorite-suits';

const MAX_FAVORITES_SIZE = 20;

const EVENT_NAME = 'favorite-suits-updated';

/**
 * 同一機体かどうか判定（name, cost, healthの3項目一致）
 */
const isSameSuit = (a: MobileSuitInfo, b: MobileSuitInfo): boolean =>
  a.name === b.name && a.cost === b.cost && a.health === b.health;

/**
 * お気に入り一覧を取得
 * @returns お気に入り機体の配列
 */
export const getFavoriteSuits = (): MobileSuitInfo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as MobileSuitInfo[];
  } catch {
    return [];
  }
};

/**
 * お気に入りに追加（重複時は追加しない、最大件数超過時は古いものを削除）
 * @param suit - 追加する機体
 */
export const addFavoriteSuit = (suit: MobileSuitInfo): void => {
  const current = getFavoriteSuits();

  // 既に存在する場合は追加しない
  if (current.some((s) => isSameSuit(s, suit))) {
    return;
  }

  // 末尾に追加し、最大件数に制限（古いものから削除）
  const updated = [...current, suit].slice(-MAX_FAVORITES_SIZE);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // LocalStorage容量不足等のエラーは無視
  }
};

/**
 * お気に入りから削除
 * @param suit - 削除する機体
 */
export const removeFavoriteSuit = (suit: MobileSuitInfo): void => {
  const current = getFavoriteSuits();
  const updated = current.filter((s) => !isSameSuit(s, suit));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // エラーは無視
  }
};

/**
 * お気に入りかどうか判定
 * @param suit - 判定する機体
 * @returns お気に入りに含まれていればtrue
 */
export const isFavoriteSuit = (suit: MobileSuitInfo): boolean => {
  const current = getFavoriteSuits();
  return current.some((s) => isSameSuit(s, suit));
};

/**
 * お気に入りのトグル（追加/削除を自動判定）
 * @param suit - トグルする機体
 * @returns トグル後にお気に入りに含まれていればtrue
 */
export const toggleFavoriteSuit = (suit: MobileSuitInfo): boolean => {
  if (isFavoriteSuit(suit)) {
    removeFavoriteSuit(suit);
    return false;
  } else {
    addFavoriteSuit(suit);
    return true;
  }
};
