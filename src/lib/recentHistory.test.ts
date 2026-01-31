/**
 * 最近使用した機体の履歴管理のテスト
 */

import {
  getRecentSuits,
  addToRecentSuits,
  clearRecentSuits,
} from './recentHistory';

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
    const suits = [
      { name: 'νガンダム' as any, cost: 3000 as const, health: 680 as const },
      { name: 'ゴッドガンダム' as any, cost: 3000 as const, health: 800 as const },
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
    addToRecentSuits({ name: 'νガンダム' as any, cost: 3000, health: 680 });

    const recent = getRecentSuits();
    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('νガンダム');
    expect(recent[0].cost).toBe(3000);
    expect(recent[0].health).toBe(680);
  });

  test('重複する機体は先頭に移動する', () => {
    addToRecentSuits({ name: 'νガンダム' as any, cost: 3000, health: 680 });
    addToRecentSuits({ name: 'ゴッドガンダム' as any, cost: 3000, health: 800 });
    addToRecentSuits({ name: 'νガンダム' as any, cost: 3000, health: 680 });

    const recent = getRecentSuits();
    expect(recent).toHaveLength(2);
    expect(recent[0].name).toBe('νガンダム');
    expect(recent[1].name).toBe('ゴッドガンダム');
  });

  test('最大5件に制限される', () => {
    for (let i = 0; i < 10; i++) {
      addToRecentSuits({
        name: `機体${i}` as any,
        cost: 3000,
        health: 680,
      });
    }

    const recent = getRecentSuits();
    expect(recent).toHaveLength(5);
  });

  test('最新の機体が先頭に来る', () => {
    addToRecentSuits({ name: 'νガンダム' as any, cost: 3000, health: 680 });
    addToRecentSuits({ name: 'ゴッドガンダム' as any, cost: 3000, health: 800 });

    const recent = getRecentSuits();
    expect(recent[0].name).toBe('ゴッドガンダム');
    expect(recent[1].name).toBe('νガンダム');
  });

  test('最大件数を超えると最古の1件が削除される', () => {
    addToRecentSuits({ name: '機体1' as any, cost: 3000, health: 680 });
    addToRecentSuits({ name: '機体2' as any, cost: 3000, health: 680 });
    addToRecentSuits({ name: '機体3' as any, cost: 3000, health: 680 });
    addToRecentSuits({ name: '機体4' as any, cost: 3000, health: 680 });
    addToRecentSuits({ name: '機体5' as any, cost: 3000, health: 680 });
    addToRecentSuits({ name: '機体6' as any, cost: 3000, health: 680 });

    const recent = getRecentSuits();
    expect(recent).toHaveLength(5);
    expect(recent[0].name).toBe('機体6');
    expect(recent.find((s) => s.name === '機体1')).toBeUndefined();
  });
});

describe('clearRecentSuits', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('履歴をクリアできる', () => {
    addToRecentSuits({ name: 'νガンダム' as any, cost: 3000, health: 680 });
    expect(getRecentSuits()).toHaveLength(1);

    clearRecentSuits();
    expect(getRecentSuits()).toEqual([]);
  });
});
