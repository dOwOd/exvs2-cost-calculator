/**
 * パターンカード画像エクスポートユーティリティ
 */

import type { Formation } from './types';

/**
 * 現在のテーマがダークモードかどうかを判定する
 */
export const isDarkMode = (): boolean => {
  return document.documentElement.classList.contains('dark');
};

/**
 * DOM要素からPNG画像のBlobを生成する
 * html-to-imageを動的importしてバンドルサイズを削減
 */
export const generatePatternCardImage = async (
  element: HTMLElement,
): Promise<Blob> => {
  const { toPng } = await import('html-to-image');

  const backgroundColor = isDarkMode() ? '#0f172a' : '#f1f5f9';

  // エクスポート用クラスを追加（data-export-only要素を表示）
  element.classList.add('exporting');

  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor,
      filter: (node: HTMLElement) => {
        // data-export-exclude属性を持つ要素を除外
        if (node.dataset?.exportExclude !== undefined) {
          return false;
        }
        return true;
      },
    });

    // dataURL → Blob変換
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return blob;
  } finally {
    // 必ずクラスを除去
    element.classList.remove('exporting');
  }
};

/**
 * Web Share APIでファイルを共有する
 * 非対応時はエラーをthrow
 */
export const shareImage = async (
  blob: Blob,
  filename: string,
  title: string,
): Promise<void> => {
  if (!canShareFiles()) {
    throw new Error('Web Share API with file sharing is not supported');
  }

  const file = new File([blob], filename, { type: 'image/png' });
  await navigator.share({
    title,
    files: [file],
  });
};

/**
 * Web Share API + ファイル共有のサポート判定
 */
export const canShareFiles = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.share) return false;
  if (!navigator.canShare) return false;

  try {
    const testFile = new File([''], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
};

/**
 * エクスポート用ファイル名を生成する
 */
export const generateFilename = (
  rank: number,
  formation: Formation,
): string => {
  const costA = formation.unitA?.cost ?? 0;
  const costB = formation.unitB?.cost ?? 0;
  return `exvs2-pattern-${rank}-${costA}+${costB}.png`;
};
