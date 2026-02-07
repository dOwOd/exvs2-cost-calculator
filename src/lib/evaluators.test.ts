/**
 * 評価関数のテスト
 */

import type { Formation } from './types';
import { checkEXActivation, evaluateAllPatterns, getTopPatterns } from './evaluators';
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

describe('getTopPatterns - 高コスト先落ちソート', () => {
  test('同じ総耐久値の場合、高コスト機が先に撃墜されるパターンを優先する', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2000, health: 680 },
    };

    const patterns = evaluateAllPatterns(formation);
    const sorted = getTopPatterns(patterns, formation);

    // 同じ総耐久値のグループが実際に存在することを確認
    const tiedGroups: { health: number; firstKills: string[] }[] = [];
    let i = 0;
    while (i < sorted.length) {
      let j = i + 1;
      while (j < sorted.length && sorted[j].totalHealth === sorted[i].totalHealth) {
        j++;
      }
      if (j - i > 1) {
        tiedGroups.push({
          health: sorted[i].totalHealth,
          firstKills: sorted.slice(i, j).map(p => p.transitions[0].killedUnit),
        });
      }
      i = j;
    }

    // 同じ総耐久値のグループが存在することを検証
    expect(tiedGroups.length).toBeGreaterThan(0);

    // 各グループ内で高コスト先落ち(A=3000)が低コスト先落ち(B)より前に来ることを確認
    for (const group of tiedGroups) {
      const lastAIndex = group.firstKills.lastIndexOf('A');
      const firstBIndex = group.firstKills.indexOf('B');
      if (lastAIndex !== -1 && firstBIndex !== -1) {
        expect(lastAIndex).toBeLessThan(firstBIndex);
      }
    }
  });

  test('B機が高コストの場合、B機先落ちパターンを優先する', () => {
    const formation: Formation = {
      unitA: { cost: 2000, health: 680 },
      unitB: { cost: 3000, health: 680 },
    };

    const patterns = evaluateAllPatterns(formation);
    const sorted = getTopPatterns(patterns, formation);

    // 同じ総耐久値のグループが実際に存在することを確認
    const tiedGroups: { health: number; firstKills: string[] }[] = [];
    let i = 0;
    while (i < sorted.length) {
      let j = i + 1;
      while (j < sorted.length && sorted[j].totalHealth === sorted[i].totalHealth) {
        j++;
      }
      if (j - i > 1) {
        tiedGroups.push({
          health: sorted[i].totalHealth,
          firstKills: sorted.slice(i, j).map(p => p.transitions[0].killedUnit),
        });
      }
      i = j;
    }

    // 同じ総耐久値のグループが存在することを検証
    expect(tiedGroups.length).toBeGreaterThan(0);

    // 各グループ内で高コスト先落ち(B=3000)が低コスト先落ち(A)より前に来ることを確認
    for (const group of tiedGroups) {
      const lastBIndex = group.firstKills.lastIndexOf('B');
      const firstAIndex = group.firstKills.indexOf('A');
      if (lastBIndex !== -1 && firstAIndex !== -1) {
        expect(lastBIndex).toBeLessThan(firstAIndex);
      }
    }
  });

  test('同コスト編成の場合、ソート順に影響しない', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 3000, health: 680 },
    };

    const patterns = evaluateAllPatterns(formation);
    const withFormation = getTopPatterns(patterns, formation);
    const withoutFormation = getTopPatterns(patterns);

    // 同コストなのでformationの有無でソート結果が変わらない
    expect(withFormation.map(p => p.totalHealth)).toEqual(
      withoutFormation.map(p => p.totalHealth)
    );
  });

  test('総耐久値が異なる場合、総耐久降順がプライマリソートのままである', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2000, health: 680 },
    };

    const patterns = evaluateAllPatterns(formation);
    const sorted = getTopPatterns(patterns, formation);

    // 総耐久値が降順であることを確認
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].totalHealth).toBeGreaterThanOrEqual(sorted[i + 1].totalHealth);
    }
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
