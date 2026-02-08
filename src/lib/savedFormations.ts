/**
 * 編成の保存・読み込み管理
 * LocalStorageを使用して編成データを保存・取得する
 */

import type { Formation, SavedFormation } from './types';

/**
 * LocalStorageのキー
 */
const STORAGE_KEY = 'exvs2-saved-formations';

/**
 * 保存編成の最大件数
 */
const MAX_SAVED_FORMATIONS = 10;

/**
 * 全保存編成を取得（savedAt 降順）
 */
export const getSavedFormations = (): SavedFormation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const formations = JSON.parse(stored) as SavedFormation[];
    return formations.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
};

/**
 * 編成を保存（最大10件、超過時は最古を削除）
 */
export const saveFormation = (name: string, formation: Formation): SavedFormation => {
  const newEntry: SavedFormation = {
    id: crypto.randomUUID(),
    name,
    formation,
    savedAt: Date.now(),
  };

  const current = getSavedFormations();
  const updated = [newEntry, ...current].slice(0, MAX_SAVED_FORMATIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage容量不足等のエラーは無視
  }

  return newEntry;
};

/**
 * 指定IDの編成を削除
 */
export const deleteSavedFormation = (id: string): void => {
  const current = getSavedFormations();
  const filtered = current.filter((f) => f.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // エラーは無視
  }
};

/**
 * 指定IDの編成を取得
 */
export const loadSavedFormation = (id: string): SavedFormation | null => {
  const formations = getSavedFormations();
  return formations.find((f) => f.id === id) ?? null;
};
