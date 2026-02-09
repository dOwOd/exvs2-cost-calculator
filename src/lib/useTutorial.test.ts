/**
 * useTutorial テスト
 * チュートリアル状態管理のロジックを検証
 */

import {
  TUTORIAL_STEPS,
  TUTORIAL_STORAGE_KEY,
  isTutorialCompleted,
  setTutorialCompleted,
  resetTutorialCompleted,
} from './useTutorial';

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

describe('TUTORIAL_STEPS', () => {
  test('7ステップが定義されている', () => {
    expect(TUTORIAL_STEPS).toHaveLength(7);
  });

  test('各ステップにtargetSelector, title, descriptionが存在する', () => {
    for (const step of TUTORIAL_STEPS) {
      expect(step.targetSelector).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }
  });

  test('ステップ1は機体A検索', () => {
    expect(TUTORIAL_STEPS[0].targetSelector).toBe('[data-testid="search-toggle-a"]');
  });

  test('ステップ2は機体Aコスト選択', () => {
    expect(TUTORIAL_STEPS[1].targetSelector).toContain('cost');
    expect(TUTORIAL_STEPS[1].targetSelector).toContain('a');
  });

  test('ステップ3は機体A耐久値選択', () => {
    expect(TUTORIAL_STEPS[2].targetSelector).toContain('health');
    expect(TUTORIAL_STEPS[2].targetSelector).toContain('a');
  });

  test('ステップ4は機体B検索', () => {
    expect(TUTORIAL_STEPS[3].targetSelector).toBe('[data-testid="search-toggle-b"]');
  });

  test('ステップ5は機体Bコスト選択', () => {
    expect(TUTORIAL_STEPS[4].targetSelector).toContain('cost');
    expect(TUTORIAL_STEPS[4].targetSelector).toContain('b');
  });

  test('ステップ6は機体B耐久値選択', () => {
    expect(TUTORIAL_STEPS[5].targetSelector).toContain('health');
    expect(TUTORIAL_STEPS[5].targetSelector).toContain('b');
  });

  test('ステップ7は結果パネル', () => {
    expect(TUTORIAL_STEPS[6].targetSelector).toContain('formation-guidance');
  });

  test('ステップ3と6はoptionalフラグを持つ', () => {
    expect(TUTORIAL_STEPS[2].optional).toBe(true);
    expect(TUTORIAL_STEPS[5].optional).toBe(true);
  });
});

describe('isTutorialCompleted', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('localStorageに値がない場合はfalseを返す', () => {
    expect(isTutorialCompleted()).toBe(false);
  });

  test('localStorageにtrueが保存されている場合はtrueを返す', () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    expect(isTutorialCompleted()).toBe(true);
  });

  test('localStorageに不正な値がある場合はfalseを返す', () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'invalid');
    expect(isTutorialCompleted()).toBe(false);
  });
});

describe('setTutorialCompleted', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('localStorageにtrueを保存する', () => {
    setTutorialCompleted();
    expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('true');
  });
});

describe('resetTutorialCompleted', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('localStorageからフラグを削除する', () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    expect(isTutorialCompleted()).toBe(true);

    resetTutorialCompleted();
    expect(isTutorialCompleted()).toBe(false);
  });

  test('フラグが存在しない場合でもエラーにならない', () => {
    expect(() => resetTutorialCompleted()).not.toThrow();
  });
});
