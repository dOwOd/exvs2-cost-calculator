/**
 * TutorialOverlay コンポーネントテスト
 *
 * DOM操作とイベントハンドリングをテスト
 * Preactフックを直接使わず、ロジック部分をテスト可能な関数として抽出しテスト
 */

import type { TutorialStep } from '../lib/useTutorial';
import {
  calculateTooltipPosition,
  calculateHighlightStyle,
  getStepLabel,
} from './tutorialOverlayUtils';

describe('TutorialOverlay', () => {
  describe('getStepLabel', () => {
    it('ステップ番号を「n/total」形式で返す', () => {
      expect(getStepLabel(0, 7)).toBe('1/7');
      expect(getStepLabel(3, 7)).toBe('4/7');
      expect(getStepLabel(6, 7)).toBe('7/7');
    });
  });

  describe('calculateHighlightStyle', () => {
    it('対象要素の位置とサイズからハイライトスタイルを計算する', () => {
      const rect = { top: 100, left: 50, width: 200, height: 40 };
      const style = calculateHighlightStyle(rect);

      expect(style.top).toBe('92px');
      expect(style.left).toBe('42px');
      expect(style.width).toBe('216px');
      expect(style.height).toBe('56px');
    });

    it('null の場合は非表示スタイルを返す', () => {
      const style = calculateHighlightStyle(null);

      expect(style.display).toBe('none');
    });
  });

  describe('calculateTooltipPosition', () => {
    const viewportHeight = 800;
    const viewportWidth = 400;

    it('対象要素の下にツールチップを配置する（十分なスペースがある場合）', () => {
      const rect = { top: 100, left: 50, width: 200, height: 40, bottom: 140 };
      const tooltipHeight = 120;

      const position = calculateTooltipPosition(
        rect,
        tooltipHeight,
        viewportHeight,
        viewportWidth,
      );

      expect(position.placement).toBe('bottom');
      // bottom: rect.bottom + padding
      expect(position.top).toBe(148);
    });

    it('対象要素の上にツールチップを配置する（下にスペースがない場合）', () => {
      const rect = { top: 700, left: 50, width: 200, height: 40, bottom: 740 };
      const tooltipHeight = 120;

      const position = calculateTooltipPosition(
        rect,
        tooltipHeight,
        viewportHeight,
        viewportWidth,
      );

      expect(position.placement).toBe('top');
      // top: rect.top - tooltipHeight - padding
      expect(position.top).toBe(572);
    });

    it('対象要素がない場合は中央に配置する', () => {
      const tooltipHeight = 120;

      const position = calculateTooltipPosition(
        null,
        tooltipHeight,
        viewportHeight,
        viewportWidth,
      );

      expect(position.placement).toBe('center');
    });
  });
});
