/**
 * コストオーバー残耐久テーブルのテスト
 */

import { getRespawnHealth } from './overCostHealthTable';

describe('getRespawnHealth', () => {
  describe('残コストが機体コスト以上の場合', () => {
    test('3000コスト、残6000 → 初期耐久800で復活', () => {
      expect(getRespawnHealth(3000, 800, 6000)).toBe(800);
    });

    test('2500コスト、残3000 → 初期耐久700で復活', () => {
      expect(getRespawnHealth(2500, 700, 3000)).toBe(700);
    });

    test('1500コスト、残3000 → 初期耐久520で復活', () => {
      expect(getRespawnHealth(1500, 520, 3000)).toBe(520);
    });
  });

  describe('残コスト0以下の場合（敗北）', () => {
    test('残コスト0 → 0', () => {
      expect(getRespawnHealth(3000, 800, 0)).toBe(0);
    });

    test('残コスト-1000 → 0', () => {
      expect(getRespawnHealth(3000, 800, -1000)).toBe(0);
    });
  });

  describe('コストオーバー時（残コスト < 機体コスト）', () => {
    describe('3000コスト・耐久800', () => {
      test('残500 → 140', () => {
        expect(getRespawnHealth(3000, 800, 500)).toBe(140);
      });

      test('残1000 → 270', () => {
        expect(getRespawnHealth(3000, 800, 1000)).toBe(270);
      });

      test('残1500 → 400', () => {
        expect(getRespawnHealth(3000, 800, 1500)).toBe(400);
      });
    });

    describe('2500コスト・耐久700', () => {
      test('残500 → 140', () => {
        expect(getRespawnHealth(2500, 700, 500)).toBe(140);
      });

      test('残1000 → 280', () => {
        expect(getRespawnHealth(2500, 700, 1000)).toBe(280);
      });

      test('残1500 → 420', () => {
        expect(getRespawnHealth(2500, 700, 1500)).toBe(420);
      });

      test('残2000 → 560', () => {
        expect(getRespawnHealth(2500, 700, 2000)).toBe(560);
      });
    });

    describe('2000コスト・耐久680', () => {
      test('残500 → 170', () => {
        expect(getRespawnHealth(2000, 680, 500)).toBe(170);
      });

      test('残1000 → 340', () => {
        expect(getRespawnHealth(2000, 680, 1000)).toBe(340);
      });

      test('残1500 → 510', () => {
        expect(getRespawnHealth(2000, 680, 1500)).toBe(510);
      });
    });

    describe('1500コスト・耐久520', () => {
      test('残500 → 180', () => {
        expect(getRespawnHealth(1500, 520, 500)).toBe(180);
      });

      test('残1000 → 350', () => {
        expect(getRespawnHealth(1500, 520, 1000)).toBe(350);
      });
    });
  });
});
