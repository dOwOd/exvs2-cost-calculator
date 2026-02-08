/**
 * コスト計算ロジックのテスト
 */

import type { Formation } from './types';
import {
  generatePatterns,
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
        isEXActivationStep: false,
      });

      // 2回目: A撃墜 → 敗北
      expect(transitions[1]).toMatchObject({
        killCount: 2,
        killedUnit: 'A',
        remainingCost: 0,
        isOverCost: false,
        isDefeat: true,
        respawnHealth: 0,
        isEXActivationStep: false,
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
        isEXActivationStep: false,
      });

      // 2回目: B(2500)撃墜 → 残500（コストオーバー）
      expect(transitions[1]).toMatchObject({
        killCount: 2,
        killedUnit: 'B',
        remainingCost: 500,
        isOverCost: true, // 500 < 2500
        isDefeat: false,
        respawnHealth: 140, // 2500コスト・耐久700・残500
        isEXActivationStep: false,
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
        isEXActivationStep: false,
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

  test('3000(680,復活) + 3000(680): A復活で+100', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680, hasPartialRevival: true },
      unitB: { cost: 3000, health: 680 },
    };

    // Aだけ: ceil(6000/3000) × 680 + 100 = 2 × 680 + 100 = 1460
    // Bだけ: ceil(6000/3000) × 680 = 2 × 680 = 1360
    // 最短: 1360
    expect(calculateMinimumDefeatHealth(formation)).toBe(1360);
  });

  test('3000(680,復活) + 3000(680,復活): 両方復活で各+100', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680, hasPartialRevival: true },
      unitB: { cost: 3000, health: 680, hasPartialRevival: true },
    };

    // Aだけ: ceil(6000/3000) × 680 + 100 = 1460
    // Bだけ: ceil(6000/3000) × 680 + 100 = 1460
    // 最短: 1460
    expect(calculateMinimumDefeatHealth(formation)).toBe(1460);
  });
});

describe('generatePatterns', () => {
  test('デフォルトで16パターン生成（2^4）', () => {
    const patterns = generatePatterns();
    expect(patterns).toHaveLength(16);
  });

  test('maxKills=5で32パターン生成（2^5）', () => {
    const patterns = generatePatterns(5);
    expect(patterns).toHaveLength(32);
  });

  test('maxKills=6で64パターン生成（2^6）', () => {
    const patterns = generatePatterns(6);
    expect(patterns).toHaveLength(64);
  });
});

describe('calculateCostTransitions - 復活あり', () => {
  describe('3000(復活)+3000の場合', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680, hasPartialRevival: true },
      unitB: { cost: 3000, health: 680 },
    };

    test('A→A: 1回目で残0→復活(耐久100)、2回目で敗北', () => {
      const transitions = calculateCostTransitions(
        ['A', 'A', 'A'],
        formation
      );

      expect(transitions).toHaveLength(3);

      // 1回目: A撃墜 → 残3000
      expect(transitions[0]).toMatchObject({
        killCount: 1,
        killedUnit: 'A',
        remainingCost: 3000,
        isDefeat: false,
        isPartialRevival: false,
        respawnHealth: 680,
        isEXActivationStep: false,
      });

      // 2回目: A撃墜 → 残0 → 復活あり
      expect(transitions[1]).toMatchObject({
        killCount: 2,
        killedUnit: 'A',
        remainingCost: 0,
        isDefeat: false,
        isPartialRevival: true,
        respawnHealth: 100,
        isEXActivationStep: false,
      });

      // 3回目: A撃墜 → 残-3000 → 敗北（復活済み）
      expect(transitions[2]).toMatchObject({
        killCount: 3,
        killedUnit: 'A',
        remainingCost: -3000,
        isDefeat: true,
        isPartialRevival: false,
        respawnHealth: 0,
        isEXActivationStep: false,
      });
    });

    test('A→B: 残0でBは復活なし → 敗北', () => {
      const transitions = calculateCostTransitions(['A', 'B'], formation);

      expect(transitions).toHaveLength(2);

      // 2回目: B撃墜 → 残0 → Bは復活なし → 敗北
      expect(transitions[1]).toMatchObject({
        killCount: 2,
        killedUnit: 'B',
        remainingCost: 0,
        isDefeat: true,
        isPartialRevival: false,
        respawnHealth: 0,
        isEXActivationStep: false,
      });
    });
  });

  describe('2500(復活)+2500(復活)の場合', () => {
    const formation: Formation = {
      unitA: { cost: 2500, health: 660, hasPartialRevival: true },
      unitB: { cost: 2500, health: 660, hasPartialRevival: true },
    };

    test('A→B→A→B: 3回目でA復活、4回目でB復活、5回目で敗北', () => {
      const transitions = calculateCostTransitions(
        ['A', 'B', 'A', 'B', 'A'],
        formation
      );

      // 1回目: A撃墜 → 残3500
      expect(transitions[0]).toMatchObject({
        remainingCost: 3500,
        isDefeat: false,
        isPartialRevival: false,
      });

      // 2回目: B撃墜 → 残1000
      expect(transitions[1]).toMatchObject({
        remainingCost: 1000,
        isDefeat: false,
        isPartialRevival: false,
        isOverCost: true,
      });

      // 3回目: A撃墜 → 残-1500 → A復活
      expect(transitions[2]).toMatchObject({
        remainingCost: -1500,
        isDefeat: false,
        isPartialRevival: true,
        respawnHealth: 100,
      });

      // 4回目: B撃墜 → 残-4000 → B復活
      expect(transitions[3]).toMatchObject({
        remainingCost: -4000,
        isDefeat: false,
        isPartialRevival: true,
        respawnHealth: 100,
      });

      // 5回目: A撃墜 → 残-6500 → 復活済み → 敗北
      expect(transitions[4]).toMatchObject({
        remainingCost: -6500,
        isDefeat: true,
        isPartialRevival: false,
        respawnHealth: 0,
      });
    });
  });

  describe('復活なし編成は既存動作と完全一致', () => {
    test('3000+3000（復活なし）: 従来と同じ結果', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 3000, health: 800 },
      };

      const transitions = calculateCostTransitions(['A', 'A'], formation);

      expect(transitions).toHaveLength(2);
      expect(transitions[0]).toMatchObject({
        isPartialRevival: false,
      });
      expect(transitions[1]).toMatchObject({
        isDefeat: true,
        isPartialRevival: false,
      });
    });
  });
});

describe('calculateTotalHealth - 復活あり', () => {
  test('3000(復活)+3000: 復活行の100が総耐久に加算される', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680, hasPartialRevival: true },
      unitB: { cost: 3000, health: 680 },
    };

    const transitions = calculateCostTransitions(
      ['A', 'A', 'A'],
      formation
    );
    const totalHealth = calculateTotalHealth(formation, transitions);

    // 初期耐久: 680 + 680 = 1360
    // 1回目リスポーン(A): 680
    // 2回目復活(A): 100
    // 3回目: 敗北（加算しない）
    // 合計: 1360 + 680 + 100 = 2140
    expect(totalHealth).toBe(2140);
  });
});
