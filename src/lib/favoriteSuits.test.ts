/**
 * お気に入り機体管理のテスト
 */

import { vi } from 'vitest';
import {
  getFavoriteSuits,
  addFavoriteSuit,
  removeFavoriteSuit,
  isFavoriteSuit,
  toggleFavoriteSuit,
} from './favoriteSuits';
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

// CustomEventモック
const dispatchEventSpy = vi.fn();
Object.defineProperty(global, 'window', {
  value: { dispatchEvent: dispatchEventSpy },
});

const suitA: MobileSuitInfo = {
  name: 'νガンダム',
  cost: 3000,
  health: 680,
  hasPartialRevival: false,
};
const suitB: MobileSuitInfo = {
  name: 'ゴッドガンダム',
  cost: 3000,
  health: 800,
  hasPartialRevival: false,
};
const suitC: MobileSuitInfo = {
  name: 'ガンダムMk-Ⅱ',
  cost: 2000,
  health: 580,
  hasPartialRevival: false,
};

describe('getFavoriteSuits', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('お気に入りがない場合は空配列を返す', () => {
    expect(getFavoriteSuits()).toEqual([]);
  });

  test('保存されたお気に入りを取得できる', () => {
    const suits: MobileSuitInfo[] = [suitA, suitB];
    localStorage.setItem('exvs2-favorite-suits', JSON.stringify(suits));

    const result = getFavoriteSuits();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('νガンダム');
    expect(result[1].name).toBe('ゴッドガンダム');
  });

  test('不正なJSONの場合は空配列を返す', () => {
    localStorage.setItem('exvs2-favorite-suits', 'invalid json');
    expect(getFavoriteSuits()).toEqual([]);
  });
});

describe('addFavoriteSuit', () => {
  beforeEach(() => {
    localStorage.clear();
    dispatchEventSpy.mockClear();
  });

  test('お気に入りに追加できる', () => {
    addFavoriteSuit(suitA);

    const favorites = getFavoriteSuits();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].name).toBe('νガンダム');
  });

  test('同じ機体を重複追加しない', () => {
    addFavoriteSuit(suitA);
    addFavoriteSuit(suitA);

    const favorites = getFavoriteSuits();
    expect(favorites).toHaveLength(1);
  });

  test('追加時にカスタムイベントが発火される', () => {
    addFavoriteSuit(suitA);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('favorite-suits-updated');
  });

  test('最大20件に制限される', () => {
    for (let i = 0; i < 25; i++) {
      addFavoriteSuit({
        name: `テスト機体${i}` as MobileSuitInfo['name'],
        cost: 3000,
        health: 680,
        hasPartialRevival: false,
      });
    }

    const favorites = getFavoriteSuits();
    expect(favorites).toHaveLength(20);
  });

  test('最大件数超過時は最後に追加された機体が保持される', () => {
    for (let i = 0; i < 25; i++) {
      addFavoriteSuit({
        name: `テスト機体${i}` as MobileSuitInfo['name'],
        cost: 3000,
        health: 680,
        hasPartialRevival: false,
      });
    }

    const favorites = getFavoriteSuits();
    // 最新20件（5〜24）が残る
    expect(favorites[0].name).toBe('テスト機体5');
    expect(favorites[19].name).toBe('テスト機体24');
  });
});

describe('removeFavoriteSuit', () => {
  beforeEach(() => {
    localStorage.clear();
    dispatchEventSpy.mockClear();
  });

  test('お気に入りから削除できる', () => {
    addFavoriteSuit(suitA);
    addFavoriteSuit(suitB);
    dispatchEventSpy.mockClear();

    removeFavoriteSuit(suitA);

    const favorites = getFavoriteSuits();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].name).toBe('ゴッドガンダム');
  });

  test('削除時にカスタムイベントが発火される', () => {
    addFavoriteSuit(suitA);
    dispatchEventSpy.mockClear();

    removeFavoriteSuit(suitA);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('favorite-suits-updated');
  });

  test('存在しない機体を削除しても問題ない', () => {
    addFavoriteSuit(suitA);
    dispatchEventSpy.mockClear();

    removeFavoriteSuit(suitB);

    const favorites = getFavoriteSuits();
    expect(favorites).toHaveLength(1);
  });
});

describe('isFavoriteSuit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('お気に入りに含まれる場合はtrueを返す', () => {
    addFavoriteSuit(suitA);
    expect(isFavoriteSuit(suitA)).toBe(true);
  });

  test('お気に入りに含まれない場合はfalseを返す', () => {
    expect(isFavoriteSuit(suitA)).toBe(false);
  });

  test('name, cost, healthの3項目で判定する', () => {
    addFavoriteSuit(suitA);

    // nameだけ異なる
    expect(
      isFavoriteSuit({ name: 'サザビー', cost: 3000, health: 680, hasPartialRevival: false }),
    ).toBe(false);

    // costだけ異なる
    expect(
      isFavoriteSuit({
        name: 'νガンダム',
        cost: 2500,
        health: 680,
        hasPartialRevival: false,
      } as MobileSuitInfo),
    ).toBe(false);

    // healthだけ異なる
    expect(
      isFavoriteSuit({
        name: 'νガンダム',
        cost: 3000,
        health: 700,
        hasPartialRevival: false,
      } as MobileSuitInfo),
    ).toBe(false);
  });
});

describe('toggleFavoriteSuit', () => {
  beforeEach(() => {
    localStorage.clear();
    dispatchEventSpy.mockClear();
  });

  test('お気に入りに含まれない場合は追加してtrueを返す', () => {
    const result = toggleFavoriteSuit(suitA);

    expect(result).toBe(true);
    expect(isFavoriteSuit(suitA)).toBe(true);
  });

  test('お気に入りに含まれる場合は削除してfalseを返す', () => {
    addFavoriteSuit(suitA);

    const result = toggleFavoriteSuit(suitA);

    expect(result).toBe(false);
    expect(isFavoriteSuit(suitA)).toBe(false);
  });

  test('トグルを繰り返しても正しく動作する', () => {
    expect(toggleFavoriteSuit(suitA)).toBe(true);
    expect(toggleFavoriteSuit(suitA)).toBe(false);
    expect(toggleFavoriteSuit(suitA)).toBe(true);
    expect(getFavoriteSuits()).toHaveLength(1);
  });
});

describe('LocalStorage例外ハンドリング', () => {
  test('setItem失敗時もエラーを投げない', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    expect(() => addFavoriteSuit(suitA)).not.toThrow();

    localStorage.setItem = originalSetItem;
  });

  test('getItem失敗時は空配列を返す', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error('SecurityError');
    };

    expect(getFavoriteSuits()).toEqual([]);

    localStorage.getItem = originalGetItem;
  });
});
