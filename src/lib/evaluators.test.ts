/**
 * 評価関数のテスト
 */

import type { Formation } from './types';
import { checkEXActivation } from './evaluators';
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
