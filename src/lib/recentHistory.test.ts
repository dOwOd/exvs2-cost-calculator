/**
 * 最近使用した機体の履歴管理のテスト
 */

import { getRecentSuits, addToRecentSuits, clearRecentSuits } from './recentHistory';
import type { MobileSuitInfo } from '../data/mobileSuitsData';

// LocalStorageをモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('getRecentSuits', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('履歴がない場合は空配列を返す', () => {
    expect(getRecentSuits()).toEqual([]);
  });

  test('保存された履歴を取得できる', () => {
    const suits: MobileSuitInfo[] = [
      { name: 'νガンダム', cost: 3000, health: 680, hasPartialRevival: false },
      { name: 'ゴッドガンダム', cost: 3000, health: 800, hasPartialRevival: false },
    ];
    localStorage.setItem('exvs2-recent-suits', JSON.stringify(suits));

    const result = getRecentSuits();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('νガンダム');
    expect(result[1].name).toBe('ゴッドガンダム');
  });

  test('不正なJSONの場合は空配列を返す', () => {
    localStorage.setItem('exvs2-recent-suits', 'invalid json');
    expect(getRecentSuits()).toEqual([]);
  });
});

describe('addToRecentSuits', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('新しい機体を追加できる', () => {
    addToRecentSuits({ name: 'νガンダム', cost: 3000, health: 680, hasPartialRevival: false });

    const recent = getRecentSuits();
    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('νガンダム');
    expect(recent[0].cost).toBe(3000);
    expect(recent[0].health).toBe(680);
  });

  test('重複する機体は先頭に移動する', () => {
    addToRecentSuits({ name: 'νガンダム', cost: 3000, health: 680, hasPartialRevival: false });
    addToRecentSuits({ name: 'ゴッドガンダム', cost: 3000, health: 800, hasPartialRevival: false });
    addToRecentSuits({ name: 'νガンダム', cost: 3000, health: 680, hasPartialRevival: false });

    const recent = getRecentSuits();
    expect(recent).toHaveLength(2);
    expect(recent[0].name).toBe('νガンダム');
    expect(recent[1].name).toBe('ゴッドガンダム');
  });

  test('最大5件に制限される', () => {
    const testSuits: MobileSuitInfo[] = [
      { name: 'νガンダム', cost: 3000, health: 680, hasPartialRevival: false },
      { name: 'サザビー', cost: 3000, health: 680, hasPartialRevival: false },
      { name: 'ユニコーンガンダム', cost: 3000, health: 680, hasPartialRevival: false },
      { name: 'Hi-νガンダム', cost: 3000, health: 680, hasPartialRevival: false },
      { name: 'ウイングガンダムゼロ', cost: 3000, health: 680, hasPartialRevival: false },
      { name: 'V2ガンダム', cost: 3000, health: 680, hasPartialRevival: false },
      { name: 'ゴッドガンダム', cost: 3000, health: 800, hasPartialRevival: false },
      { name: 'マスターガンダム', cost: 3000, health: 800, hasPartialRevival: false },
      { name: 'ペーネロペー', cost: 3000, health: 750, hasPartialRevival: false },
      { name: 'ナイチンゲール', cost: 3000, health: 700, hasPartialRevival: false },
    ];
    for (const suit of testSuits) {
      addToRecentSuits(suit);
    }

    const recent = getRecentSuits();
    expect(recent).toHaveLength(5);
  });

  test('最新の機体が先頭に来る', () => {
    addToRecentSuits({ name: 'νガンダム', cost: 3000, health: 680, hasPartialRevival: false });
    addToRecentSuits({ name: 'ゴッドガンダム', cost: 3000, health: 800, hasPartialRevival: false });

    const recent = getRecentSuits();
    expect(recent[0].name).toBe('ゴッドガンダム');
    expect(recent[1].name).toBe('νガンダム');
  });

  test('最大件数を超えると最古の1件が削除される', () => {
    addToRecentSuits({ name: 'νガンダム', cost: 3000, health: 680, hasPartialRevival: false });
    addToRecentSuits({ name: 'サザビー', cost: 3000, health: 680, hasPartialRevival: false });
    addToRecentSuits({
      name: 'ユニコーンガンダム',
      cost: 3000,
      health: 680,
      hasPartialRevival: false,
    });
    addToRecentSuits({ name: 'Hi-νガンダム', cost: 3000, health: 680, hasPartialRevival: false });
    addToRecentSuits({ name: 'V2ガンダム', cost: 3000, health: 680, hasPartialRevival: false });
    addToRecentSuits({ name: 'ゴッドガンダム', cost: 3000, health: 800, hasPartialRevival: false });

    const recent = getRecentSuits();
    expect(recent).toHaveLength(5);
    expect(recent[0].name).toBe('ゴッドガンダム');
    expect(recent.find((s) => s.name === 'νガンダム')).toBeUndefined();
  });
});

describe('clearRecentSuits', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('履歴をクリアできる', () => {
    addToRecentSuits({ name: 'νガンダム', cost: 3000, health: 680, hasPartialRevival: false });
    expect(getRecentSuits()).toHaveLength(1);

    clearRecentSuits();
    expect(getRecentSuits()).toEqual([]);
  });
});
