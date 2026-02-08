/**
 * 編成保存ロジックのテスト
 */

import {
  getSavedFormations,
  saveFormation,
  deleteSavedFormation,
  loadSavedFormation,
} from './savedFormations';
import type { Formation } from './types';

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

// crypto.randomUUID をモック
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${++uuidCounter}`,
  },
});

const testFormation: Formation = {
  unitA: { cost: 3000, health: 680 },
  unitB: { cost: 2500, health: 620 },
};

const testFormation2: Formation = {
  unitA: { cost: 2000, health: 580 },
  unitB: { cost: 1500, health: 450 },
};

describe('getSavedFormations', () => {
  beforeEach(() => {
    localStorage.clear();
    uuidCounter = 0;
  });

  test('保存データがない場合は空配列を返す', () => {
    expect(getSavedFormations()).toEqual([]);
  });

  test('保存された編成を取得できる', () => {
    saveFormation('テスト編成', testFormation);

    const result = getSavedFormations();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('テスト編成');
    expect(result[0].formation).toEqual(testFormation);
  });

  test('savedAt 降順で返される', () => {
    saveFormation('編成1', testFormation);
    saveFormation('編成2', testFormation2);

    const result = getSavedFormations();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('編成2');
    expect(result[1].name).toBe('編成1');
  });

  test('不正なJSONの場合は空配列を返す', () => {
    localStorage.setItem('exvs2-saved-formations', 'invalid json');
    expect(getSavedFormations()).toEqual([]);
  });
});

describe('saveFormation', () => {
  beforeEach(() => {
    localStorage.clear();
    uuidCounter = 0;
  });

  test('編成を保存し、SavedFormation を返す', () => {
    const saved = saveFormation('テスト編成', testFormation);

    expect(saved.id).toBe('test-uuid-1');
    expect(saved.name).toBe('テスト編成');
    expect(saved.formation).toEqual(testFormation);
    expect(typeof saved.savedAt).toBe('number');
  });

  test('保存後に getSavedFormations で取得できる', () => {
    saveFormation('テスト編成', testFormation);

    const result = getSavedFormations();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('テスト編成');
  });

  test('最大10件に制限される', () => {
    for (let i = 0; i < 12; i++) {
      saveFormation(`編成${i}`, testFormation);
    }

    const result = getSavedFormations();
    expect(result).toHaveLength(10);
  });

  test('最大件数を超えると最古の編成が削除される', () => {
    for (let i = 0; i < 10; i++) {
      saveFormation(`編成${i}`, testFormation);
    }
    saveFormation('新しい編成', testFormation2);

    const result = getSavedFormations();
    expect(result).toHaveLength(10);
    expect(result[0].name).toBe('新しい編成');
    expect(result.find((s) => s.name === '編成0')).toBeUndefined();
  });
});

describe('deleteSavedFormation', () => {
  beforeEach(() => {
    localStorage.clear();
    uuidCounter = 0;
  });

  test('指定IDの編成を削除できる', () => {
    const saved = saveFormation('テスト編成', testFormation);
    expect(getSavedFormations()).toHaveLength(1);

    deleteSavedFormation(saved.id);
    expect(getSavedFormations()).toEqual([]);
  });

  test('存在しないIDを指定してもエラーにならない', () => {
    saveFormation('テスト編成', testFormation);

    deleteSavedFormation('non-existent-id');
    expect(getSavedFormations()).toHaveLength(1);
  });

  test('複数の編成から特定の1件だけ削除できる', () => {
    saveFormation('編成1', testFormation);
    const saved2 = saveFormation('編成2', testFormation2);
    saveFormation('編成3', testFormation);

    deleteSavedFormation(saved2.id);

    const result = getSavedFormations();
    expect(result).toHaveLength(2);
    expect(result.find((s) => s.name === '編成2')).toBeUndefined();
  });
});

describe('loadSavedFormation', () => {
  beforeEach(() => {
    localStorage.clear();
    uuidCounter = 0;
  });

  test('指定IDの編成を取得できる', () => {
    const saved = saveFormation('テスト編成', testFormation);

    const loaded = loadSavedFormation(saved.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe('テスト編成');
    expect(loaded!.formation).toEqual(testFormation);
  });

  test('存在しないIDの場合は null を返す', () => {
    saveFormation('テスト編成', testFormation);

    const loaded = loadSavedFormation('non-existent-id');
    expect(loaded).toBeNull();
  });

  test('不正なJSONの場合は null を返す', () => {
    localStorage.setItem('exvs2-saved-formations', 'invalid json');

    const loaded = loadSavedFormation('some-id');
    expect(loaded).toBeNull();
  });
});
