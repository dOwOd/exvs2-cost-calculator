/**
 * ComparisonResultPanel コンポーネントのテスト（棒グラフ表示）
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { calculateBarWidths } from '../ComparisonResultPanel';

describe('calculateBarWidths', () => {
  describe('highlightBest="max"（大きい方が良い）', () => {
    it('最大値を100%基準にして各値の割合を計算する', () => {
      const result = calculateBarWidths([2000, 3000, 1500], 'max');
      expect(result).toEqual([expect.closeTo(66.67, 1), 100, 50]);
    });

    it('全値が同じ場合は全て100%になる', () => {
      const result = calculateBarWidths([2000, 2000], 'max');
      expect(result).toEqual([100, 100]);
    });

    it('値が"-"の場合はnullを返す', () => {
      const result = calculateBarWidths([2000, '-', 1500], 'max');
      expect(result).toEqual([100, null, 75]);
    });

    it('全て"-"の場合は全てnullを返す', () => {
      const result = calculateBarWidths(['-', '-'], 'max');
      expect(result).toEqual([null, null]);
    });
  });

  describe('highlightBest="min"（小さい方が良い）', () => {
    it('最小値を100%基準にして反転した割合を計算する', () => {
      const result = calculateBarWidths([1500, 3000], 'min');
      expect(result).toEqual([100, 50]);
    });

    it('全値が同じ場合は全て100%になる', () => {
      const result = calculateBarWidths([2000, 2000], 'min');
      expect(result).toEqual([100, 100]);
    });

    it('値が"-"の場合はnullを返す', () => {
      const result = calculateBarWidths([1500, '-'], 'min');
      expect(result).toEqual([100, null]);
    });
  });

  describe('highlightBest なし（EX発動可能: 分数表示）', () => {
    it('"3/5"形式の分子を抽出して最大分子基準で割合を計算する', () => {
      const result = calculateBarWidths(['3/5', '5/5', '2/4']);
      expect(result).toEqual([60, 100, 40]);
    });

    it('分子が全て0の場合は全てnullを返す', () => {
      const result = calculateBarWidths(['0/5', '0/3']);
      expect(result).toEqual([null, null]);
    });

    it('値が"-"の場合はnullを返す', () => {
      const result = calculateBarWidths(['3/5', '-']);
      expect(result).toEqual([100, null]);
    });

    it('全て"-"の場合は全てnullを返す', () => {
      const result = calculateBarWidths(['-', '-']);
      expect(result).toEqual([null, null]);
    });
  });

  describe('エッジケース', () => {
    it('空配列の場合は空配列を返す', () => {
      const result = calculateBarWidths([], 'max');
      expect(result).toEqual([]);
    });

    it('単一値の場合は100%を返す', () => {
      const result = calculateBarWidths([2500], 'max');
      expect(result).toEqual([100]);
    });
  });
});
