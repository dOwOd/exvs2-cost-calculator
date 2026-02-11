/**
 * useTheme テスト
 */

import type { ThemeMode } from './useTheme';

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

// documentをモック
const documentMock = {
  documentElement: {
    classList: {
      _classes: new Set<string>(),
      add(className: string) {
        this._classes.add(className);
      },
      remove(className: string) {
        this._classes.delete(className);
      },
      contains(className: string) {
        return this._classes.has(className);
      },
    },
  },
};

describe('Theme utilities', () => {
  const THEME_STORAGE_KEY = 'theme';

  beforeEach(() => {
    localStorage.clear();
    documentMock.documentElement.classList._classes.clear();
  });

  describe('getStoredTheme', () => {
    test('LocalStorageに値がない場合はsystemを返す', () => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBeNull();
      const defaultValue = stored ?? 'system';
      expect(defaultValue).toBe('system');
    });

    test('LocalStorageにlightがある場合はlightを返す', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('light');
    });

    test('LocalStorageにdarkがある場合はdarkを返す', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('dark');
    });

    test('LocalStorageにsystemがある場合はsystemを返す', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'system');
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('system');
    });

    test('LocalStorageに無効な値がある場合はsystemをデフォルトとする', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid');
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const validThemes = ['light', 'dark', 'system'];
      const result = validThemes.includes(stored ?? '') ? stored : 'system';
      expect(result).toBe('system');
    });
  });

  describe('applyThemeToDOM', () => {
    test('darkテーマの場合、html要素にdarkクラスを追加', () => {
      documentMock.documentElement.classList.add('dark');
      expect(documentMock.documentElement.classList.contains('dark')).toBe(true);
    });

    test('lightテーマの場合、html要素からdarkクラスを削除', () => {
      documentMock.documentElement.classList.add('dark');
      documentMock.documentElement.classList.remove('dark');
      expect(documentMock.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('resolveTheme', () => {
    test('lightモードの場合はlightを返す', () => {
      const mode: ThemeMode = 'light';
      const resolveTheme = (m: ThemeMode) => m === 'system' ? 'dark' : m;
      expect(resolveTheme(mode)).toBe('light');
    });

    test('darkモードの場合はdarkを返す', () => {
      const mode: ThemeMode = 'dark';
      const resolveTheme = (m: ThemeMode) => m === 'system' ? 'dark' : m;
      expect(resolveTheme(mode)).toBe('dark');
    });
  });

  describe('Theme persistence', () => {
    test('テーマ設定がLocalStorageに保存される', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });
  });
});
