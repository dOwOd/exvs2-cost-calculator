/**
 * HealthSelector コンポーネントのテスト
 *
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { HealthSelector } from '../HealthSelector';
import { getAllMobileSuitNames } from '../../data/mobileSuitsData';
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
    test('各耐久値オプションに全機体名がインライン表示される', () => {
      render(<HealthSelector {...defaultProps} />);
      openDropdown();

      const option720 = screen.getByTestId('health-option-720');
      const allNames = getAllMobileSuitNames(3000, 720);
      expect(option720.textContent).toContain('720');
      // 全機体名が含まれている（「他X機」ではなく実際の名前）
      for (const name of allNames) {
        expect(option720.textContent).toContain(name);
      }
    });

    test('全機体名が「、」区切りで表示される', () => {
      render(<HealthSelector {...defaultProps} />);
      openDropdown();

      const option800 = screen.getByTestId('health-option-800');
      // コスト3000の耐久値800はゴッドガンダム、マスターガンダムの2機
      expect(option800.textContent).toContain('ゴッドガンダム、マスターガンダム');
    });

    test('選択状態でも機体名が表示される', () => {
      render(<HealthSelector {...defaultProps} selectedHealth={720} />);
      openDropdown();

      const option720 = screen.getByTestId('health-option-720');
      expect(option720.textContent).toContain('720');
      const allNames = getAllMobileSuitNames(3000, 720);
      for (const name of allNames) {
        expect(option720.textContent).toContain(name);
      }
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
