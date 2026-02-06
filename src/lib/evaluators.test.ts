/**
 * 評価関数のテスト
 */

import type { Formation, EvaluatedPattern, PatternStatistics } from './types';
import { checkEXActivation, evaluateAllPatterns, getTopPatterns, calculatePatternStatistics, generatePatternComments } from './evaluators';
import { calculateCostTransitions } from './calculator';

describe('checkEXActivation', () => {
  describe('同コスト編成のEX発動判定', () => {
    test('3000+3000: 1回撃墜後にEX発動（残3000 <= min(3000,3000)）', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 3000, health: 800 },
      };

      const transitions = calculateCostTransitions(['A'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(true);
      expect(transitions[0].remainingCost).toBe(3000);
    });

    test('2500+2500: 2回撃墜後にEX発動（残1000 <= min(2500,2500)）', () => {
      const formation: Formation = {
        unitA: { cost: 2500, health: 700 },
        unitB: { cost: 2500, health: 700 },
      };

      const transitions = calculateCostTransitions(['A', 'A'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(true);
      expect(transitions[1].remainingCost).toBe(1000);
    });

    test('2000+2000: 2回撃墜後にEX発動（残2000 <= min(2000,2000)）', () => {
      const formation: Formation = {
        unitA: { cost: 2000, health: 680 },
        unitB: { cost: 2000, health: 680 },
      };

      const transitions = calculateCostTransitions(['A', 'A'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(true);
      expect(transitions[1].remainingCost).toBe(2000);
    });

    test('1500+1500: 3回撃墜後にEX発動（残1500 <= min(1500,1500)）', () => {
      const formation: Formation = {
        unitA: { cost: 1500, health: 520 },
        unitB: { cost: 1500, health: 520 },
      };

      const transitions = calculateCostTransitions(['A', 'A', 'A'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(true);
      expect(transitions[2].remainingCost).toBe(1500);
    });
  });

  describe('異なるコスト編成のEX発動判定', () => {
    test('3000+2500: A(3000)撃墜後はEX未発動（残3000 > min(2500)）', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 2500, health: 700 },
      };

      const transitions = calculateCostTransitions(['A'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(false);
      expect(transitions[0].remainingCost).toBe(3000);
    });

    test('3000+2500: A→B撃墜後にEX発動（残500 <= min(2500)）', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 2500, health: 700 },
      };

      const transitions = calculateCostTransitions(['A', 'B'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(true);
      expect(transitions[1].remainingCost).toBe(500);
    });

    test('3000+2000: B(2000)撃墜後はEX未発動（残4000 > min(2000)）', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 2000, health: 680 },
      };

      const transitions = calculateCostTransitions(['B'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(false);
      expect(transitions[0].remainingCost).toBe(4000);
    });

    test('3000+2000: B→A撃墜後にEX発動（残1000 <= min(2000)）', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 2000, health: 680 },
      };

      const transitions = calculateCostTransitions(['B', 'A'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(true);
      expect(transitions[1].remainingCost).toBe(1000);
    });

    test('3000+1500: A(3000)撃墜後はEX未発動（残3000 > min(1500)）', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 1500, health: 520 },
      };

      const transitions = calculateCostTransitions(['A'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(false);
      expect(transitions[0].remainingCost).toBe(3000);
    });

    test('3000+1500: A→B撃墜後にEX発動（残1500 <= min(1500)）', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 1500, health: 520 },
      };

      const transitions = calculateCostTransitions(['A', 'B'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(true);
      expect(transitions[1].remainingCost).toBe(1500);
    });

    test('2500+2000: A→B撃墜後にEX発動（残1500 <= min(2000)）', () => {
      const formation: Formation = {
        unitA: { cost: 2500, health: 700 },
        unitB: { cost: 2000, health: 680 },
      };

      const transitions = calculateCostTransitions(['A', 'B'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(canActivate).toBe(true);
      expect(transitions[1].remainingCost).toBe(1500);
    });
  });

  describe('EX発動前に敗北するケース', () => {
    test('3000+3000: A→A（2回で敗北）でも1回目でEX発動済み', () => {
      const formation: Formation = {
        unitA: { cost: 3000, health: 800 },
        unitB: { cost: 3000, health: 800 },
      };

      const transitions = calculateCostTransitions(['A', 'A'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      // 1回目で残3000、EX発動条件を満たす
      expect(canActivate).toBe(true);
      expect(transitions[0].remainingCost).toBe(3000);
      expect(transitions[1].isDefeat).toBe(true);
    });
  });

  describe('境界値テスト', () => {
    test('残コスト = minCost のときEX発動（等号）', () => {
      const formation: Formation = {
        unitA: { cost: 2500, health: 700 },
        unitB: { cost: 2000, health: 680 },
      };

      // 2回撃墜で残2000（= min(2500, 2000)）
      const transitions = calculateCostTransitions(['B', 'B'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(transitions[1].remainingCost).toBe(2000);
      expect(canActivate).toBe(true);
    });

    test('残コスト < minCost のときEX発動', () => {
      const formation: Formation = {
        unitA: { cost: 2500, health: 700 },
        unitB: { cost: 2000, health: 680 },
      };

      // 2回撃墜で残1500（< min(2500, 2000)）
      const transitions = calculateCostTransitions(['A', 'B'], formation);
      const canActivate = checkEXActivation(formation, transitions);

      expect(transitions[1].remainingCost).toBe(1500);
      expect(canActivate).toBe(true);
    });
  });
});

describe('calculatePatternStatistics', () => {
  /** テスト用ヘルパー: EvaluatedPatternを簡易作成 */
  const makePattern = (
    overrides: Partial<EvaluatedPattern> & { totalHealth: number }
  ): EvaluatedPattern => ({
    pattern: ['A'],
    overCostCount: 0,
    canActivateEXOverLimit: false,
    isEXActivationFailure: true,
    transitions: [{ killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false }],
    ...overrides,
  });

  test('空配列 → null', () => {
    expect(calculatePatternStatistics([])).toBeNull();
  });

  test('1パターンの統計を正しく計算', () => {
    const patterns = [
      makePattern({
        totalHealth: 2000,
        overCostCount: 1,
        canActivateEXOverLimit: true,
        isEXActivationFailure: false,
        transitions: [
          { killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false },
          { killCount: 2, killedUnit: 'B', remainingCost: 500, isOverCost: true, respawnHealth: 300, isDefeat: false, isPartialRevival: false },
        ],
      }),
    ];

    const stats = calculatePatternStatistics(patterns);
    expect(stats).not.toBeNull();
    expect(stats!.totalHealth).toEqual({ max: 2000, min: 2000, average: 2000 });
    expect(stats!.overCostCount).toEqual({ max: 1, min: 1 });
    expect(stats!.killCount).toEqual({ max: 2, min: 2 });
    expect(stats!.exActivatableCount).toBe(1);
    expect(stats!.totalPatterns).toBe(1);
    expect(stats!.exActivatableMaxHealth).toBe(2000);
  });

  test('複数パターンの統計を正しく計算', () => {
    const patterns = [
      makePattern({ totalHealth: 3000, overCostCount: 0, canActivateEXOverLimit: true, isEXActivationFailure: false, transitions: [
        { killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false },
        { killCount: 2, killedUnit: 'B', remainingCost: 500, isOverCost: false, respawnHealth: 700, isDefeat: false, isPartialRevival: false },
        { killCount: 3, killedUnit: 'A', remainingCost: 0, isOverCost: false, respawnHealth: 0, isDefeat: true, isPartialRevival: false },
      ]}),
      makePattern({ totalHealth: 2000, overCostCount: 2, canActivateEXOverLimit: false, isEXActivationFailure: true, transitions: [
        { killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false },
      ]}),
      makePattern({ totalHealth: 2500, overCostCount: 1, canActivateEXOverLimit: true, isEXActivationFailure: false, transitions: [
        { killCount: 1, killedUnit: 'B', remainingCost: 4000, isOverCost: false, respawnHealth: 700, isDefeat: false, isPartialRevival: false },
        { killCount: 2, killedUnit: 'A', remainingCost: 1000, isOverCost: true, respawnHealth: 500, isDefeat: false, isPartialRevival: false },
      ]}),
    ];

    const stats = calculatePatternStatistics(patterns);
    expect(stats).not.toBeNull();
    expect(stats!.totalHealth).toEqual({ max: 3000, min: 2000, average: 2500 });
    expect(stats!.overCostCount).toEqual({ max: 2, min: 0 });
    expect(stats!.killCount).toEqual({ max: 3, min: 1 });
    expect(stats!.exActivatableCount).toBe(2);
    expect(stats!.totalPatterns).toBe(3);
    expect(stats!.exActivatableMaxHealth).toBe(3000);
  });

  test('EX発動可能パターンがない場合 exActivatableMaxHealth は null', () => {
    const patterns = [
      makePattern({ totalHealth: 1500 }),
      makePattern({ totalHealth: 2000 }),
    ];

    const stats = calculatePatternStatistics(patterns);
    expect(stats!.exActivatableMaxHealth).toBeNull();
  });

  test('killCount は transitions.length で計算される', () => {
    const patterns = [
      makePattern({
        totalHealth: 2000,
        transitions: [
          { killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false },
          { killCount: 2, killedUnit: 'B', remainingCost: 500, isOverCost: true, respawnHealth: 300, isDefeat: false, isPartialRevival: false },
          { killCount: 3, killedUnit: 'A', remainingCost: 0, isOverCost: false, respawnHealth: 0, isDefeat: true, isPartialRevival: false },
        ],
      }),
    ];

    const stats = calculatePatternStatistics(patterns);
    expect(stats!.killCount).toEqual({ max: 3, min: 3 });
  });

  test('average は Math.round で丸められる', () => {
    const patterns = [
      makePattern({ totalHealth: 100 }),
      makePattern({ totalHealth: 200 }),
      makePattern({ totalHealth: 200 }),
    ];

    const stats = calculatePatternStatistics(patterns);
    // (100 + 200 + 200) / 3 = 166.666... → 167
    expect(stats!.totalHealth.average).toBe(167);
  });
});

describe('generatePatternComments', () => {
  const makePattern = (
    overrides: Partial<EvaluatedPattern> & { totalHealth: number }
  ): EvaluatedPattern => ({
    pattern: ['A'],
    overCostCount: 0,
    canActivateEXOverLimit: false,
    isEXActivationFailure: true,
    transitions: [{ killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false }],
    ...overrides,
  });

  const makeStats = (overrides: Partial<PatternStatistics> = {}): PatternStatistics => ({
    totalHealth: { max: 3000, min: 1500, average: 2250 },
    overCostCount: { max: 3, min: 0 },
    killCount: { max: 4, min: 2 },
    exActivatableCount: 2,
    totalPatterns: 5,
    exActivatableMaxHealth: 3000,
    ...overrides,
  });

  test('totalPatterns <= 1 → 空配列', () => {
    const pattern = makePattern({ totalHealth: 3000 });
    const stats = makeStats({ totalPatterns: 1 });

    expect(generatePatternComments(pattern, stats)).toEqual([]);
  });

  test('総耐久が最も高い', () => {
    const pattern = makePattern({ totalHealth: 3000 });
    const stats = makeStats();

    const comments = generatePatternComments(pattern, stats);
    expect(comments).toContain('総耐久が最も高い');
  });

  test('総耐久が最も低い', () => {
    const pattern = makePattern({ totalHealth: 1500 });
    const stats = makeStats();

    const comments = generatePatternComments(pattern, stats);
    expect(comments).toContain('総耐久が最も低い');
  });

  test('全パターン同じ総耐久 → 最高/最低コメントなし', () => {
    const pattern = makePattern({ totalHealth: 2000 });
    const stats = makeStats({ totalHealth: { max: 2000, min: 2000, average: 2000 } });

    const comments = generatePatternComments(pattern, stats);
    expect(comments).not.toContain('総耐久が最も高い');
    expect(comments).not.toContain('総耐久が最も低い');
  });

  test('コストオーバーが最も少ない', () => {
    const pattern = makePattern({ totalHealth: 2500, overCostCount: 0 });
    const stats = makeStats();

    const comments = generatePatternComments(pattern, stats);
    expect(comments).toContain('コストオーバーが最も少ない');
  });

  test('全パターン同じコストオーバー数 → コメントなし', () => {
    const pattern = makePattern({ totalHealth: 2500, overCostCount: 1 });
    const stats = makeStats({ overCostCount: { max: 1, min: 1 } });

    const comments = generatePatternComments(pattern, stats);
    expect(comments).not.toContain('コストオーバーが最も少ない');
  });

  test('最も長く戦える（killCount が最大）', () => {
    const pattern = makePattern({
      totalHealth: 2500,
      transitions: [
        { killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false },
        { killCount: 2, killedUnit: 'B', remainingCost: 1000, isOverCost: false, respawnHealth: 700, isDefeat: false, isPartialRevival: false },
        { killCount: 3, killedUnit: 'A', remainingCost: 500, isOverCost: true, respawnHealth: 300, isDefeat: false, isPartialRevival: false },
        { killCount: 4, killedUnit: 'B', remainingCost: 0, isOverCost: false, respawnHealth: 0, isDefeat: true, isPartialRevival: false },
      ],
    });
    const stats = makeStats();

    const comments = generatePatternComments(pattern, stats);
    expect(comments).toContain('最も長く戦える');
  });

  test('全パターン同じ killCount → コメントなし', () => {
    const pattern = makePattern({
      totalHealth: 2500,
      transitions: [
        { killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false },
        { killCount: 2, killedUnit: 'B', remainingCost: 0, isOverCost: false, respawnHealth: 0, isDefeat: true, isPartialRevival: false },
      ],
    });
    const stats = makeStats({ killCount: { max: 2, min: 2 } });

    const comments = generatePatternComments(pattern, stats);
    expect(comments).not.toContain('最も長く戦える');
  });

  test('EX発動可能な中で最高耐久', () => {
    const pattern = makePattern({
      totalHealth: 3000,
      canActivateEXOverLimit: true,
      isEXActivationFailure: false,
    });
    const stats = makeStats({ exActivatableCount: 2, exActivatableMaxHealth: 3000 });

    const comments = generatePatternComments(pattern, stats);
    expect(comments).toContain('EX発動可能な中で最高耐久');
  });

  test('EX発動可能が1パターンのみ → EX最高耐久コメントなし', () => {
    const pattern = makePattern({
      totalHealth: 3000,
      canActivateEXOverLimit: true,
      isEXActivationFailure: false,
    });
    const stats = makeStats({ exActivatableCount: 1, exActivatableMaxHealth: 3000 });

    const comments = generatePatternComments(pattern, stats);
    expect(comments).not.toContain('EX発動可能な中で最高耐久');
  });

  test('EX発動不可パターンには EX最高耐久コメントが付かない', () => {
    const pattern = makePattern({
      totalHealth: 3000,
      canActivateEXOverLimit: false,
      isEXActivationFailure: true,
    });
    const stats = makeStats({ exActivatableCount: 2, exActivatableMaxHealth: 3000 });

    const comments = generatePatternComments(pattern, stats);
    expect(comments).not.toContain('EX発動可能な中で最高耐久');
  });

  test('複数コメントが同時に付く', () => {
    const pattern = makePattern({
      totalHealth: 3000,
      overCostCount: 0,
      canActivateEXOverLimit: true,
      isEXActivationFailure: false,
      transitions: [
        { killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false },
        { killCount: 2, killedUnit: 'B', remainingCost: 500, isOverCost: false, respawnHealth: 700, isDefeat: false, isPartialRevival: false },
        { killCount: 3, killedUnit: 'A', remainingCost: 0, isOverCost: false, respawnHealth: 0, isDefeat: true, isPartialRevival: false },
        { killCount: 4, killedUnit: 'B', remainingCost: 0, isOverCost: false, respawnHealth: 0, isDefeat: true, isPartialRevival: false },
      ],
    });
    const stats = makeStats({ exActivatableCount: 3, exActivatableMaxHealth: 3000 });

    const comments = generatePatternComments(pattern, stats);
    expect(comments).toContain('総耐久が最も高い');
    expect(comments).toContain('コストオーバーが最も少ない');
    expect(comments).toContain('最も長く戦える');
    expect(comments).toContain('EX発動可能な中で最高耐久');
  });

  test('該当しないパターンには空配列', () => {
    const pattern = makePattern({
      totalHealth: 2250,
      overCostCount: 1,
      transitions: [
        { killCount: 1, killedUnit: 'A', remainingCost: 3000, isOverCost: false, respawnHealth: 800, isDefeat: false, isPartialRevival: false },
        { killCount: 2, killedUnit: 'B', remainingCost: 500, isOverCost: true, respawnHealth: 300, isDefeat: false, isPartialRevival: false },
        { killCount: 3, killedUnit: 'A', remainingCost: 0, isOverCost: false, respawnHealth: 0, isDefeat: true, isPartialRevival: false },
      ],
    });
    const stats = makeStats();

    const comments = generatePatternComments(pattern, stats);
    expect(comments).toEqual([]);
  });
});

describe('evaluateAllPatterns - 復活あり', () => {
  test('復活1機で32パターン生成', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680, hasPartialRevival: true },
      unitB: { cost: 3000, health: 680 },
    };

    const patterns = evaluateAllPatterns(formation);
    expect(patterns).toHaveLength(32); // 2^5
  });

  test('復活2機で64パターン生成', () => {
    const formation: Formation = {
      unitA: { cost: 2500, health: 660, hasPartialRevival: true },
      unitB: { cost: 2500, health: 660, hasPartialRevival: true },
    };

    const patterns = evaluateAllPatterns(formation);
    expect(patterns).toHaveLength(64); // 2^6
  });

  test('復活なし編成は従来通り16パターン', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 800 },
      unitB: { cost: 3000, health: 800 },
    };

    const patterns = evaluateAllPatterns(formation);
    expect(patterns).toHaveLength(16);
  });

  test('復活ありパターンの重複排除が正常に動作する', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680, hasPartialRevival: true },
      unitB: { cost: 3000, health: 680 },
    };

    const patterns = evaluateAllPatterns(formation);
    const top = getTopPatterns(patterns);

    // 重複排除後は元の数以下
    expect(top.length).toBeLessThanOrEqual(patterns.length);
    // 少なくとも1つはある
    expect(top.length).toBeGreaterThan(0);

    // 復活ありパターンが含まれることを確認
    const hasRevivalPattern = top.some(
      (p) => p.transitions.some((t) => t.isPartialRevival)
    );
    expect(hasRevivalPattern).toBe(true);
  });
});
