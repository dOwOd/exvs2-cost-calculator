/**
 * useFormationEvaluation フックのテスト
 *
 * @vitest-environment jsdom
 */

import { renderHook, act } from '@testing-library/preact';
import { useFormationEvaluation } from './useFormationEvaluation';
import type { Formation } from './types';

describe('useFormationEvaluation', () => {
  const validFormation: Formation = {
    unitA: { cost: 3000, health: 680 },
    unitB: { cost: 2500, health: 620 },
  };

  test('完全な編成が渡された場合、評価結果を返す', () => {
    const { result } = renderHook(() => useFormationEvaluation(validFormation));

    expect(result.current.evaluatedPatterns.length).toBeGreaterThan(0);
    expect(result.current.minimumDefeatHealth).toBeGreaterThan(0);
  });

  test('unitA が null の場合、空の結果を返す', () => {
    const formation: Formation = { unitA: null, unitB: { cost: 2500, health: 620 } };
    const { result } = renderHook(() => useFormationEvaluation(formation));

    expect(result.current.evaluatedPatterns).toEqual([]);
    expect(result.current.minimumDefeatHealth).toBe(0);
  });

  test('unitB が null の場合、空の結果を返す', () => {
    const formation: Formation = { unitA: { cost: 3000, health: 680 }, unitB: null };
    const { result } = renderHook(() => useFormationEvaluation(formation));

    expect(result.current.evaluatedPatterns).toEqual([]);
    expect(result.current.minimumDefeatHealth).toBe(0);
  });

  test('両方 null の場合、空の結果を返す', () => {
    const formation: Formation = { unitA: null, unitB: null };
    const { result } = renderHook(() => useFormationEvaluation(formation));

    expect(result.current.evaluatedPatterns).toEqual([]);
    expect(result.current.minimumDefeatHealth).toBe(0);
  });

  test('編成変更時に再評価される', () => {
    const formation1: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const formation2: Formation = {
      unitA: { cost: 2000, health: 580 },
      unitB: { cost: 1500, health: 450 },
    };

    const { result, rerender } = renderHook(
      ({ formation }) => useFormationEvaluation(formation),
      { initialProps: { formation: formation1 } }
    );

    const firstPatterns = result.current.evaluatedPatterns;
    const firstMinHealth = result.current.minimumDefeatHealth;

    rerender({ formation: formation2 });

    expect(result.current.evaluatedPatterns).not.toEqual(firstPatterns);
    expect(result.current.minimumDefeatHealth).not.toBe(firstMinHealth);
  });

  test('評価パターンが canActivateEXOverLimit プロパティを持つ', () => {
    const { result } = renderHook(() => useFormationEvaluation(validFormation));

    for (const pattern of result.current.evaluatedPatterns) {
      expect(typeof pattern.canActivateEXOverLimit).toBe('boolean');
    }
  });

  test('評価パターンが totalHealth プロパティを持つ', () => {
    const { result } = renderHook(() => useFormationEvaluation(validFormation));

    for (const pattern of result.current.evaluatedPatterns) {
      expect(typeof pattern.totalHealth).toBe('number');
      expect(pattern.totalHealth).toBeGreaterThan(0);
    }
  });

  test('同コスト編成でも正しく評価される', () => {
    const sameCostFormation: Formation = {
      unitA: { cost: 2000, health: 580 },
      unitB: { cost: 2000, health: 560 },
    };

    const { result } = renderHook(() => useFormationEvaluation(sameCostFormation));

    expect(result.current.evaluatedPatterns.length).toBeGreaterThan(0);
    expect(result.current.minimumDefeatHealth).toBeGreaterThan(0);
  });
});

describe('useFormationEvaluation - 複数インスタンスの独立性', () => {
  test('異なる編成を持つ複数インスタンスが独立して評価される', () => {
    const formation1: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const formation2: Formation = {
      unitA: { cost: 2000, health: 580 },
      unitB: { cost: 1500, health: 450 },
    };

    const { result: result1 } = renderHook(() => useFormationEvaluation(formation1));
    const { result: result2 } = renderHook(() => useFormationEvaluation(formation2));

    // それぞれ独立した結果を持つ
    expect(result1.current.evaluatedPatterns.length).toBeGreaterThan(0);
    expect(result2.current.evaluatedPatterns.length).toBeGreaterThan(0);

    // 異なる編成なので最短敗北耐久値が異なる
    expect(result1.current.minimumDefeatHealth).not.toBe(
      result2.current.minimumDefeatHealth
    );

    // 総耐久値のリストが異なる（パターン数は同じでも内容が異なる）
    const totalHealths1 = result1.current.evaluatedPatterns.map(p => p.totalHealth).sort();
    const totalHealths2 = result2.current.evaluatedPatterns.map(p => p.totalHealth).sort();
    expect(totalHealths1).not.toEqual(totalHealths2);
  });

  test('一方のインスタンスが空編成でも他方に影響しない', () => {
    const validFormation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const emptyFormation: Formation = { unitA: null, unitB: null };

    const { result: validResult } = renderHook(() => useFormationEvaluation(validFormation));
    const { result: emptyResult } = renderHook(() => useFormationEvaluation(emptyFormation));

    // 有効な編成は正常に評価される
    expect(validResult.current.evaluatedPatterns.length).toBeGreaterThan(0);
    expect(validResult.current.minimumDefeatHealth).toBeGreaterThan(0);

    // 空の編成は空の結果を返す
    expect(emptyResult.current.evaluatedPatterns).toEqual([]);
    expect(emptyResult.current.minimumDefeatHealth).toBe(0);
  });

  test('3つのインスタンスが同時に独立して動作する', () => {
    // 最短敗北耐久が全て異なる編成を選ぶ:
    // 3000+3000(680): min(2*680, 2*680) = 1360
    // 2500+2500(620): min(3*620, 3*620) = 1860
    // 2000+1500(580/450): min(3*580, 4*450) = min(1740, 1800) = 1740
    const formation1: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 3000, health: 680 },
    };
    const formation2: Formation = {
      unitA: { cost: 2500, health: 620 },
      unitB: { cost: 2500, health: 620 },
    };
    const formation3: Formation = {
      unitA: { cost: 2000, health: 580 },
      unitB: { cost: 1500, health: 450 },
    };

    const { result: result1 } = renderHook(() => useFormationEvaluation(formation1));
    const { result: result2 } = renderHook(() => useFormationEvaluation(formation2));
    const { result: result3 } = renderHook(() => useFormationEvaluation(formation3));

    // 全て有効な結果を持つ
    expect(result1.current.evaluatedPatterns.length).toBeGreaterThan(0);
    expect(result2.current.evaluatedPatterns.length).toBeGreaterThan(0);
    expect(result3.current.evaluatedPatterns.length).toBeGreaterThan(0);

    // 3つとも異なる最短敗北耐久値を持つ
    const minHealths = [
      result1.current.minimumDefeatHealth,
      result2.current.minimumDefeatHealth,
      result3.current.minimumDefeatHealth,
    ];
    const uniqueMinHealths = new Set(minHealths);
    expect(uniqueMinHealths.size).toBe(3);
  });

  test('一方のインスタンスの再評価が他方に影響しない', () => {
    const formation1: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const formation2: Formation = {
      unitA: { cost: 2000, health: 580 },
      unitB: { cost: 2000, health: 560 },
    };
    const updatedFormation1: Formation = {
      unitA: { cost: 3000, health: 800 },
      unitB: { cost: 2500, health: 700 },
    };

    const { result: result1, rerender: rerender1 } = renderHook(
      ({ formation }) => useFormationEvaluation(formation),
      { initialProps: { formation: formation1 } }
    );
    const { result: result2 } = renderHook(() => useFormationEvaluation(formation2));

    // result2 の初期値を記録
    const result2InitialPatterns = result2.current.evaluatedPatterns;
    const result2InitialMinHealth = result2.current.minimumDefeatHealth;

    // result1 の編成を変更
    rerender1({ formation: updatedFormation1 });

    // result1 は更新されている
    expect(result1.current.minimumDefeatHealth).not.toBe(
      result2.current.minimumDefeatHealth
    );

    // result2 は変化していない
    expect(result2.current.evaluatedPatterns).toBe(result2InitialPatterns);
    expect(result2.current.minimumDefeatHealth).toBe(result2InitialMinHealth);
  });
});
