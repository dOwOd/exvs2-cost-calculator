/**
 * ErrorBoundary コンポーネントのテスト
 *
 * @vitest-environment jsdom
 */

import { vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { ErrorBoundary } from '../ErrorBoundary';

// エラーを意図的にスローする子コンポーネント
const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

// 正常にレンダリングされる子コンポーネント
const NormalChild = () => <div>正常なコンテンツ</div>;

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // console.error をスパイ（Preact/testing-library のエラー出力を抑制）
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    cleanup();
  });

  test('正常時: children がそのままレンダリングされること', () => {
    render(
      <ErrorBoundary>
        <NormalChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('正常なコンテンツ')).toBeDefined();
  });

  test('エラー時: フォールバックUIが表示されること', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="テストエラー" />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('エラーが発生しました')).toBeDefined();
    expect(screen.getByText('ページを再読み込み')).toBeDefined();
  });

  test('エラー時: カスタムフォールバックメッセージが表示されること', () => {
    render(
      <ErrorBoundary fallbackMessage="カスタムエラーメッセージ">
        <ThrowError message="テストエラー" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('カスタムエラーメッセージ')).toBeDefined();
  });

  test('エラー時: console.error にエラー情報が出力されること', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="テストエラー" />
      </ErrorBoundary>,
    );

    const boundaryLog = consoleErrorSpy.mock.calls.find(
      (call: unknown[]) => call[0] === '[ErrorBoundary]',
    );
    expect(boundaryLog).toBeDefined();
    expect(boundaryLog![1]).toBeInstanceOf(Error);
    expect((boundaryLog![1] as Error).message).toBe('テストエラー');
  });

  test('リロードボタン: クリックで location.reload() が呼ばれること', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError message="テストエラー" />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByText('ページを再読み込み'));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
