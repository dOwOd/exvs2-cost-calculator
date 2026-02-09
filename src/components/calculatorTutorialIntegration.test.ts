/**
 * Calculator チュートリアル統合テスト
 *
 * チュートリアル統合のロジックをテスト
 * - 初回表示時にチュートリアルが自動開始される
 * - ヘルプボタンクリックでチュートリアルが再開される
 */

import {
  isTutorialCompleted,
  setTutorialCompleted,
  resetTutorialCompleted,
  TUTORIAL_STORAGE_KEY,
  TUTORIAL_STEPS,
} from '../lib/useTutorial';

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

describe('Calculator チュートリアル統合', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('初回表示の判定', () => {
    it('localStorage にフラグがない場合、チュートリアルは未完了', () => {
      expect(isTutorialCompleted()).toBe(false);
    });

    it('localStorage にフラグがある場合、チュートリアルは完了済み', () => {
      setTutorialCompleted();
      expect(isTutorialCompleted()).toBe(true);
    });
  });

  describe('ヘルプボタンによる再開', () => {
    it('resetTutorialCompleted でフラグを削除してリセットできる', () => {
      setTutorialCompleted();
      expect(isTutorialCompleted()).toBe(true);

      resetTutorialCompleted();
      expect(isTutorialCompleted()).toBe(false);
    });
  });

  describe('ステップ定義の整合性', () => {
    it('チュートリアルは7ステップある', () => {
      expect(TUTORIAL_STEPS).toHaveLength(7);
    });

    it('各ステップに必要なフィールドがある', () => {
      for (const step of TUTORIAL_STEPS) {
        expect(step.targetSelector).toBeDefined();
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
      }
    });

    it('ステップ3と6はoptionalフラグを持つ', () => {
      // ステップ3（インデックス2）: 機体A耐久値
      expect(TUTORIAL_STEPS[2].optional).toBe(true);
      // ステップ6（インデックス5）: 機体B耐久値
      expect(TUTORIAL_STEPS[5].optional).toBe(true);
    });
  });
});
