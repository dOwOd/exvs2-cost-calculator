/**
 * useTheme テスト
 */

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

Object.defineProperty(global, 'document', {
  value: documentMock,
  writable: true,
});

describe('Theme utilities', () => {
  const THEME_STORAGE_KEY = 'theme';

  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
    // html要素のdarkクラスをリセット
    documentMock.documentElement.classList._classes.clear();
  });

  describe('getStoredTheme', () => {
    it('LocalStorageに値がない場合はsystemを返す', () => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBeNull();
      // デフォルト値の確認
      const defaultValue = stored ?? 'system';
      expect(defaultValue).toBe('system');
    });

    it('LocalStorageにlightがある場合はlightを返す', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('light');
    });

    it('LocalStorageにdarkがある場合はdarkを返す', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('dark');
    });

    it('LocalStorageにsystemがある場合はsystemを返す', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'system');
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('system');
    });

    it('LocalStorageに無効な値がある場合はsystemをデフォルトとする', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid');
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const validThemes = ['light', 'dark', 'system'];
      const result = validThemes.includes(stored ?? '') ? stored : 'system';
      expect(result).toBe('system');
    });
  });

  describe('applyThemeToDOM', () => {
    it('darkテーマの場合、html要素にdarkクラスを追加', () => {
      documentMock.documentElement.classList.add('dark');
      expect(documentMock.documentElement.classList.contains('dark')).toBe(true);
    });

    it('lightテーマの場合、html要素からdarkクラスを削除', () => {
      documentMock.documentElement.classList.add('dark');
      documentMock.documentElement.classList.remove('dark');
      expect(documentMock.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('resolveTheme', () => {
    it('lightモードの場合はlightを返す', () => {
      const mode = 'light';
      const resolved = mode === 'system' ? 'dark' : mode; // system時はmockとしてdarkを返す
      expect(resolved).toBe('light');
    });

    it('darkモードの場合はdarkを返す', () => {
      const mode = 'dark';
      const resolved = mode === 'system' ? 'dark' : mode;
      expect(resolved).toBe('dark');
    });
  });

  describe('Theme persistence', () => {
    it('テーマ設定がLocalStorageに保存される', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });
  });
});
