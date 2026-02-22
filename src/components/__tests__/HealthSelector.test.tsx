/**
 * HealthSelector コンポーネントのテスト
 *
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { HealthSelector } from '../HealthSelector';
import { formatMobileSuitNames } from '../../data/mobileSuitsData';
import type { CostType, HealthType } from '../../lib/types';

afterEach(cleanup);

const defaultProps = {
  cost: 3000 as CostType,
  selectedHealth: null as HealthType | null,
  onSelect: vi.fn(),
};

const openDropdown = () => {
  fireEvent.click(screen.getByTestId('health-selector-button'));
};

describe('HealthSelector', () => {
  describe('機体名インライン表示', () => {
    test('各耐久値オプションに機体名がインライン表示される', () => {
      render(<HealthSelector {...defaultProps} />);
      openDropdown();

      const option720 = screen.getByTestId('health-option-720');
      const expectedNames = formatMobileSuitNames(3000, 720);
      expect(option720.textContent).toContain('720');
      expect(option720.textContent).toContain(expectedNames);
    });

    test('残り機体数が「他X機」形式で表示される', () => {
      render(<HealthSelector {...defaultProps} />);
      openDropdown();

      // コスト3000の耐久値720は多数の機体が該当するため「他X機」が表示される
      const option720 = screen.getByTestId('health-option-720');
      expect(option720.textContent).toMatch(/他\d+機/);
    });

    test('少数機体の耐久値では「他」表示がない', () => {
      render(<HealthSelector {...defaultProps} />);
      openDropdown();

      // コスト3000の耐久値800はゴッドガンダム、マスターガンダムの2機のみ
      const option800 = screen.getByTestId('health-option-800');
      expect(option800.textContent).toContain('ゴッドガンダム');
      expect(option800.textContent).not.toMatch(/他\d+機/);
    });

    test('選択状態でも機体名が表示される', () => {
      render(<HealthSelector {...defaultProps} selectedHealth={720} />);
      openDropdown();

      const option720 = screen.getByTestId('health-option-720');
      expect(option720.textContent).toContain('720');
      const expectedNames = formatMobileSuitNames(3000, 720);
      expect(option720.textContent).toContain(expectedNames);
    });
  });

  describe('ドロップダウン動作', () => {
    test('ドロップダウンの開閉が正常に動作する', () => {
      render(<HealthSelector {...defaultProps} />);

      // 初期状態: 閉じている
      expect(screen.queryByRole('listbox')).toBeNull();

      // クリックで開く
      openDropdown();
      expect(screen.getByRole('listbox')).toBeTruthy();

      // 再クリックで閉じる
      openDropdown();
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    test('耐久値を選択するとonSelectが呼ばれドロップダウンが閉じる', () => {
      const onSelect = vi.fn();
      render(<HealthSelector {...defaultProps} onSelect={onSelect} />);
      openDropdown();

      fireEvent.click(screen.getByTestId('health-option-720'));
      expect(onSelect).toHaveBeenCalledWith(720);
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });
});
