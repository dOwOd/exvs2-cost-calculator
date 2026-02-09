/**
 * TutorialOverlay のテスト可能なユーティリティ関数
 */

/** ハイライトのパディング */
const HIGHLIGHT_PADDING = 8;

/** ツールチップと対象要素の間隔 */
const TOOLTIP_GAP = 8;

/** 対象要素の矩形情報 */
export type ElementRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom?: number;
};

/** ツールチップ配置結果 */
export type TooltipPosition = {
  /** 上端位置（px） */
  top: number;
  /** 配置方向 */
  placement: 'top' | 'bottom' | 'center';
};

/** ステップラベルを「n/total」形式で返す */
export const getStepLabel = (currentStep: number, totalSteps: number): string =>
  `${currentStep + 1}/${totalSteps}`;

/** 対象要素の矩形からハイライトスタイルを計算する */
export const calculateHighlightStyle = (
  rect: ElementRect | null,
): Record<string, string> => {
  if (!rect) {
    return { display: 'none' };
  }

  return {
    top: `${rect.top - HIGHLIGHT_PADDING}px`,
    left: `${rect.left - HIGHLIGHT_PADDING}px`,
    width: `${rect.width + HIGHLIGHT_PADDING * 2}px`,
    height: `${rect.height + HIGHLIGHT_PADDING * 2}px`,
  };
};

/** ツールチップの配置位置を計算する */
export const calculateTooltipPosition = (
  rect: ElementRect | null,
  tooltipHeight: number,
  viewportHeight: number,
  viewportWidth: number,
): TooltipPosition => {
  if (!rect) {
    return {
      top: Math.round((viewportHeight - tooltipHeight) / 2),
      placement: 'center',
    };
  }

  const bottom = rect.bottom ?? rect.top + rect.height;
  const spaceBelow = viewportHeight - bottom;

  // 下にツールチップを表示するスペースがあるか
  if (spaceBelow >= tooltipHeight + TOOLTIP_GAP) {
    return {
      top: bottom + TOOLTIP_GAP,
      placement: 'bottom',
    };
  }

  // 上に配置
  return {
    top: rect.top - tooltipHeight - TOOLTIP_GAP,
    placement: 'top',
  };
};
