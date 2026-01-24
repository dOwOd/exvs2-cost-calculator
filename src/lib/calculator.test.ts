/**
 * コスト計算ロジックのテスト
 */

import type { Formation } from './types';
import {
  calculateCostTransitions,
  calculateTotalHealth,
  calculateMinimumDefeatHealth,
} from './calculator';

describe('calculateCostTransitions', () => {
  describe('3000+3000の場合', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 800 },
      unitB: { cost: 3000, health: 800 },
    };

    test('A→A: 2回撃墜で敗北', () => {
      const transitions = calculateCostTransitions(['A', 'A'], formation);

      expect(transitions).toHaveLength(2);

      // 1回目: A撃墜
      expect(transitions[0]).toMatchObject({
        killCount: 1,
        killedUnit: 'A',
        remainingCost: 3000,
        isOverCost: false,
        isDefeat: false,
        respawnHealth: 800, // 残3000 >= 3000なので初期耐久
      });

      // 2回目: A撃墜 → 敗北
      expect(transitions[1]).toMatchObject({
        killCount: 2,
        killedUnit: 'A',
        remainingCost: 0,
        isOverCost: false,
        isDefeat: true,
        respawnHealth: 0,
      });
    });

    test('A→B: 2回撃墜で敗北', () => {
      const transitions = calculateCostTransitions(['A', 'B'], formation);

      expect(transitions).toHaveLength(2);
      expect(transitions[1].remainingCost).toBe(0);
      expect(transitions[1].isDefeat).toBe(true);
    });
  });

  describe('3000+2500の場合', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 800 },
      unitB: { cost: 2500, health: 700 },
    };

    test('A→B: 2回撃墜、残500でコストオーバー', () => {
      const transitions = calculateCostTransitions(['A', 'B'], formation);

      expect(transitions).toHaveLength(2);

      // 1回目: A(3000)撃墜
      expect(transitions[0]).toMatchObject({
        killCount: 1,
        killedUnit: 'A',
        remainingCost: 3000,
        isOverCost: false,
        isDefeat: false,
        respawnHealth: 800,
      });

      // 2回目: B(2500)撃墜 → 残500（コストオーバー）
      expect(transitions[1]).toMatchObject({
        killCount: 2,
        killedUnit: 'B',
        remainingCost: 500,
        isOverCost: true, // 500 < 2500
        isDefeat: false,
        respawnHealth: 140, // 2500コスト・耐久700・残500
      });
    });

    test('A→B→A: 3回撃墜で敗北', () => {
      const transitions = calculateCostTransitions(['A', 'B', 'A'], formation);

      expect(transitions).toHaveLength(3);

      // 1回目: A(3000)撃墜 → 残3000
      expect(transitions[0]).toMatchObject({
        remainingCost: 3000,
        isDefeat: false,
      });

      // 2回目: B(2500)撃墜 → 残500（コストオーバー）
      expect(transitions[1]).toMatchObject({
        remainingCost: 500,
        isOverCost: true,
        isDefeat: false,
      });

      // 3回目: A(3000)撃墜 → 残-2500（敗北）
      expect(transitions[2]).toMatchObject({
        killCount: 3,
        killedUnit: 'A',
        remainingCost: -2500,
        isOverCost: false,
        isDefeat: true,
        respawnHealth: 0,
      });
    });
  });

  describe('2500+2500の場合', () => {
    const formation: Formation = {
      unitA: { cost: 2500, health: 700 },
      unitB: { cost: 2500, health: 700 },
    };

    test('A→A→A: 3回撃墜、残1000でコストオーバー', () => {
      const transitions = calculateCostTransitions(['A', 'A', 'A'], formation);

      expect(transitions).toHaveLength(3);

      // 1回目: 残3500
      expect(transitions[0]).toMatchObject({
        remainingCost: 3500,
        isOverCost: false,
        respawnHealth: 700,
      });

      // 2回目: 残1000（コストオーバー）
      expect(transitions[1]).toMatchObject({
        remainingCost: 1000,
        isOverCost: true, // 1000 < 2500
        respawnHealth: 280, // 2500コスト・耐久700・残1000
      });

      // 3回目: 残-1500（敗北）
      expect(transitions[2]).toMatchObject({
        remainingCost: -1500,
        isDefeat: true,
        respawnHealth: 0,
      });
    });
  });

  describe('1500+1500の場合', () => {
    const formation: Formation = {
      unitA: { cost: 1500, health: 520 },
      unitB: { cost: 1500, health: 520 },
    };

    test('A→A→A→A: 4回撃墜可能', () => {
      const transitions = calculateCostTransitions(
        ['A', 'A', 'A', 'A'],
        formation
      );

      expect(transitions).toHaveLength(4);

      // 各ステップの残コスト確認
      expect(transitions[0].remainingCost).toBe(4500);
      expect(transitions[1].remainingCost).toBe(3000);
      expect(transitions[2].remainingCost).toBe(1500);
      expect(transitions[3].remainingCost).toBe(0);

      // 最後は敗北
      expect(transitions[3].isDefeat).toBe(true);
    });
  });
});

describe('calculateTotalHealth', () => {
  test('3000+3000（耐久800）: 初期耐久1600 + リスポーン耐久', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 800 },
      unitB: { cost: 3000, health: 800 },
    };

    const transitions = calculateCostTransitions(['A', 'A'], formation);
    const totalHealth = calculateTotalHealth(formation, transitions);

    // 初期耐久: 800 + 800 = 1600
    // 1回目リスポーン: 800（残3000 >= 3000）
    // 2回目: 敗北（加算しない）
    // 合計: 1600 + 800 = 2400
    expect(totalHealth).toBe(2400);
  });

  test('3000+2500: 初期耐久 + リスポーン耐久の合計', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 800 },
      unitB: { cost: 2500, health: 700 },
    };

    const transitions = calculateCostTransitions(['A', 'B'], formation);
    const totalHealth = calculateTotalHealth(formation, transitions);

    // 初期耐久: 800 + 700 = 1500
    // 1回目リスポーン(A): 800（残3000 >= 3000）
    // 2回目リスポーン(B): 140（残500、コストオーバー）
    // 合計: 1500 + 800 + 140 = 2440
    expect(totalHealth).toBe(2440);
  });

  test('1500+1500: 4回撃墜の総耐久', () => {
    const formation: Formation = {
      unitA: { cost: 1500, health: 520 },
      unitB: { cost: 1500, health: 520 },
    };

    const transitions = calculateCostTransitions(
      ['A', 'A', 'A', 'A'],
      formation
    );
    const totalHealth = calculateTotalHealth(formation, transitions);

    // 初期耐久: 520 + 520 = 1040
    // 1回目: 520（残4500 >= 1500）
    // 2回目: 520（残3000 >= 1500）
    // 3回目: 520（残1500 >= 1500）
    // 4回目: 敗北（加算しない）
    // 合計: 1040 + 520 + 520 + 520 = 2600
    expect(totalHealth).toBe(2600);
  });
});

describe('calculateMinimumDefeatHealth', () => {
  test('3000(750) + 2500(680): Aだけ狙われる方が早い（1500）', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 750 },
      unitB: { cost: 2500, health: 680 },
    };

    // Aだけ: ceil(6000/3000) × 750 = 2 × 750 = 1500
    // Bだけ: ceil(6000/2500) × 680 = 3 × 680 = 2040
    // 最短: 1500
    expect(calculateMinimumDefeatHealth(formation)).toBe(1500);
  });

  test('3000(800) + 3000(800): どちらも同じ（1600）', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 800 },
      unitB: { cost: 3000, health: 800 },
    };

    // Aだけ: ceil(6000/3000) × 800 = 2 × 800 = 1600
    // Bだけ: ceil(6000/3000) × 800 = 2 × 800 = 1600
    // 最短: 1600
    expect(calculateMinimumDefeatHealth(formation)).toBe(1600);
  });

  test('2500(700) + 2500(700): どちらも同じ（2100）', () => {
    const formation: Formation = {
      unitA: { cost: 2500, health: 700 },
      unitB: { cost: 2500, health: 700 },
    };

    // Aだけ: ceil(6000/2500) × 700 = 3 × 700 = 2100
    // Bだけ: ceil(6000/2500) × 700 = 3 × 700 = 2100
    // 最短: 2100
    expect(calculateMinimumDefeatHealth(formation)).toBe(2100);
  });

  test('1500(520) + 1500(520): どちらも同じ（2080）', () => {
    const formation: Formation = {
      unitA: { cost: 1500, health: 520 },
      unitB: { cost: 1500, health: 520 },
    };

    // Aだけ: ceil(6000/1500) × 520 = 4 × 520 = 2080
    // Bだけ: ceil(6000/1500) × 520 = 4 × 520 = 2080
    // 最短: 2080
    expect(calculateMinimumDefeatHealth(formation)).toBe(2080);
  });

  test('3000(800) + 2000(680): Bだけ狙われる方が早い（2040）', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 800 },
      unitB: { cost: 2000, health: 680 },
    };

    // Aだけ: ceil(6000/3000) × 800 = 2 × 800 = 1600
    // Bだけ: ceil(6000/2000) × 680 = 3 × 680 = 2040
    // 最短: 1600
    expect(calculateMinimumDefeatHealth(formation)).toBe(1600);
  });

  test('2500(700) + 1500(520): Bだけ狙われる方が早い（2080）', () => {
    const formation: Formation = {
      unitA: { cost: 2500, health: 700 },
      unitB: { cost: 1500, health: 520 },
    };

    // Aだけ: ceil(6000/2500) × 700 = 3 × 700 = 2100
    // Bだけ: ceil(6000/1500) × 520 = 4 × 520 = 2080
    // 最短: 2080
    expect(calculateMinimumDefeatHealth(formation)).toBe(2080);
  });
});
