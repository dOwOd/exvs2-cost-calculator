/**
 * ResultPanel コンポーネントのテスト（先落ちフィルター）
 *
 * @vitest-environment jsdom
 */

import { vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import type { EvaluatedPattern, Formation, BattleState } from '../../lib/types';
import { evaluateAllPatterns } from '../../lib/evaluators';

// PatternCard を軽量モックに置き換え（描画コストを抑える）
vi.mock('../PatternCard', () => ({
  PatternCard: ({ pattern }: { pattern: EvaluatedPattern }) => (
    <div data-testid="pattern-card">{pattern.transitions.map((t) => t.killedUnit).join('')}</div>
  ),
}));

// テスト対象のインポートはモック定義の後
import { ResultPanel } from '../ResultPanel';

// --- テスト用ヘルパー ---

/** 異なるコストの編成（A: 3000/680, B: 2000/620） */
const differentCostFormation: Formation = {
  unitA: { cost: 3000, health: 680 },
  unitB: { cost: 2000, health: 620 },
};

/** 同コストの編成（A: 2500/680, B: 2500/620） */
const sameCostFormation: Formation = {
  unitA: { cost: 2500, health: 680 },
  unitB: { cost: 2500, health: 620 },
};

/** 不完全な編成 */
const incompleteFormation: Formation = {
  unitA: { cost: 3000, health: 680 },
  unitB: null,
};

/** evaluateAllPatterns で実際のパターンを生成 */
const differentCostPatterns = evaluateAllPatterns(differentCostFormation);
const sameCostPatterns = evaluateAllPatterns(sameCostFormation);

/** パターンカードに表示される撃墜順テキストを取得 */
const getPatternTexts = (): string[] => {
  return screen.getAllByTestId('pattern-card').map((el) => el.textContent ?? '');
};

/** パターンカードの数を取得 */
const getPatternCount = (): number => {
  return screen.queryAllByTestId('pattern-card').length;
};

describe('ResultPanel 先落ちフィルター', () => {
  afterEach(() => {
    cleanup();
  });

  describe('フィルター表示条件', () => {
    test('異なるコスト編成では先撃墜フィルターが表示されること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      expect(screen.getByTestId('first-kill-filter')).toBeDefined();
      expect(screen.getByText('先撃墜フィルター')).toBeDefined();
    });

    test('同コスト編成では先撃墜フィルターが非表示であること', () => {
      render(
        <ResultPanel
          patterns={sameCostPatterns}
          formation={sameCostFormation}
          minimumDefeatHealth={1240}
        />,
      );

      expect(screen.queryByTestId('first-kill-filter')).toBeNull();
    });

    test('編成が不完全な場合はフィルターが非表示であること', () => {
      render(<ResultPanel patterns={[]} formation={incompleteFormation} minimumDefeatHealth={0} />);

      expect(screen.queryByTestId('first-kill-filter')).toBeNull();
      expect(screen.queryByTestId('ex-filter-checkbox')).toBeNull();
    });
  });

  describe('セグメントコントロールのボタン', () => {
    test('3つのフィルターボタンが表示されること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      expect(screen.getByTestId('first-kill-filter-all')).toBeDefined();
      expect(screen.getByTestId('first-kill-filter-a')).toBeDefined();
      expect(screen.getByTestId('first-kill-filter-b')).toBeDefined();
    });

    test('ボタンのラベルが正しいこと', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      expect(screen.getByTestId('first-kill-filter-all').textContent).toBe('すべて');
      expect(screen.getByTestId('first-kill-filter-a').textContent).toBe('A先撃墜');
      expect(screen.getByTestId('first-kill-filter-b').textContent).toBe('B先撃墜');
    });

    test('初期状態で「すべて」が選択されていること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      // 選択状態のボタンはbg-whiteクラスを持つ
      const allButton = screen.getByTestId('first-kill-filter-all');
      expect(allButton.className).toContain('bg-white');
    });
  });

  describe('フィルタリング動作', () => {
    test('「すべて」選択時は全パターンが表示されること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      const totalCount = getPatternCount();
      expect(totalCount).toBeGreaterThan(0);
    });

    test('「A先撃墜」選択時はA先撃墜パターンのみ表示されること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      const totalBefore = getPatternCount();
      fireEvent.click(screen.getByTestId('first-kill-filter-a'));

      const patternTexts = getPatternTexts();
      expect(patternTexts.length).toBeGreaterThan(0);
      expect(patternTexts.length).toBeLessThan(totalBefore);
      // すべてのパターンがAで始まること
      for (const text of patternTexts) {
        expect(text[0]).toBe('A');
      }
    });

    test('「B先撃墜」選択時はB先撃墜パターンのみ表示されること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      const totalBefore = getPatternCount();
      fireEvent.click(screen.getByTestId('first-kill-filter-b'));

      const patternTexts = getPatternTexts();
      expect(patternTexts.length).toBeGreaterThan(0);
      expect(patternTexts.length).toBeLessThan(totalBefore);
      // すべてのパターンがBで始まること
      for (const text of patternTexts) {
        expect(text[0]).toBe('B');
      }
    });

    test('「すべて」に戻すと全パターンが再表示されること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      const totalBefore = getPatternCount();

      // A先撃墜でフィルタ
      fireEvent.click(screen.getByTestId('first-kill-filter-a'));
      expect(getPatternCount()).toBeLessThan(totalBefore);

      // すべてに戻す
      fireEvent.click(screen.getByTestId('first-kill-filter-all'));
      expect(getPatternCount()).toBe(totalBefore);
    });

    test('A先撃墜とB先撃墜の合計が全パターン数と一致すること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      const totalCount = getPatternCount();

      fireEvent.click(screen.getByTestId('first-kill-filter-a'));
      const aCount = getPatternCount();

      fireEvent.click(screen.getByTestId('first-kill-filter-b'));
      const bCount = getPatternCount();

      expect(aCount + bCount).toBe(totalCount);
    });
  });

  describe('EXフィルターとの併用', () => {
    test('EXフィルターと先落ちフィルターを同時に適用できること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      const totalCount = getPatternCount();

      // EXフィルターON
      fireEvent.click(screen.getByTestId('ex-filter-checkbox'));
      const exFilteredCount = getPatternCount();

      // さらにA先撃墜フィルター
      fireEvent.click(screen.getByTestId('first-kill-filter-a'));
      const bothFilteredCount = getPatternCount();

      // 両フィルター適用で最も少なくなる
      expect(bothFilteredCount).toBeLessThanOrEqual(exFilteredCount);
      expect(bothFilteredCount).toBeLessThanOrEqual(totalCount);
    });

    test('EXフィルターON + B先撃墜でも正しくフィルタリングされること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      // EXフィルターON + B先撃墜
      fireEvent.click(screen.getByTestId('ex-filter-checkbox'));
      fireEvent.click(screen.getByTestId('first-kill-filter-b'));

      const patternTexts = getPatternTexts();
      // 表示されるパターンはすべてBで始まる
      for (const text of patternTexts) {
        expect(text[0]).toBe('B');
      }
    });

    test('先落ちフィルターを変更してもEXフィルターの状態が維持されること', () => {
      render(
        <ResultPanel
          patterns={differentCostPatterns}
          formation={differentCostFormation}
          minimumDefeatHealth={1360}
        />,
      );

      // EXフィルターON
      fireEvent.click(screen.getByTestId('ex-filter-checkbox'));
      const exFilteredCount = getPatternCount();

      // A先撃墜 → B先撃墜 → すべて と切り替え
      fireEvent.click(screen.getByTestId('first-kill-filter-a'));
      fireEvent.click(screen.getByTestId('first-kill-filter-b'));
      fireEvent.click(screen.getByTestId('first-kill-filter-all'));

      // EXフィルターは維持されている（すべてに戻してもEXフィルター後の数）
      expect(getPatternCount()).toBe(exFilteredCount);
    });
  });
});
