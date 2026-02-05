/**
 * テーマ管理フック
 * ダーク/ライトモードの切り替えを管理
 */

import { useState, useEffect, useCallback } from 'preact/hooks';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

/**
 * システムのカラースキーム設定を取得
 */
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * LocalStorageからテーマ設定を取得
 */
const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

/**
 * テーマモードから実際のテーマを解決
 */
const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

/**
 * DOMにテーマを適用
 */
const applyThemeToDOM = (theme: ResolvedTheme) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

/**
 * テーマ管理フック
 */
export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // 初期化
  useEffect(() => {
    const storedMode = getStoredTheme();
    setMode(storedMode);
    const resolved = resolveTheme(storedMode);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);
  }, []);

  // システムテーマの変更を監視
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = resolveTheme('system');
      setResolvedTheme(resolved);
      applyThemeToDOM(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // テーマモードを設定
  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
    const resolved = resolveTheme(newMode);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);
  }, []);

  // テーマをトグル（light ↔ dark）
  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newMode);
  }, [resolvedTheme, setTheme]);

  return {
    mode,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };
};
