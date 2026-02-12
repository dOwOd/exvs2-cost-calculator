/**
 * ShareButtons コンポーネントのテスト
 *
 * @vitest-environment jsdom
 */

import { vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { ShareButtons } from '../ShareButtons';

const defaultProps = {
  url: 'https://example.com/page',
  text: 'テスト共有テキスト',
};

describe('ShareButtons', () => {
  let windowOpenSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    // Web Share API はデフォルトで非対応
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
    cleanup();
  });

  describe('レンダリング', () => {
    test('Twitter/X ボタンが表示されること', () => {
      render(<ShareButtons {...defaultProps} />);
      expect(screen.getByLabelText('Xでシェア')).toBeDefined();
    });

    test('LINE ボタンが表示されること', () => {
      render(<ShareButtons {...defaultProps} />);
      expect(screen.getByLabelText('LINEでシェア')).toBeDefined();
    });

    test('Web Share API 非対応時は共有ボタンが非表示であること', () => {
      render(<ShareButtons {...defaultProps} />);
      expect(screen.queryByLabelText('シェアする')).toBeNull();
    });

    test('Web Share API 対応時は共有ボタンが表示されること', () => {
      Object.defineProperty(navigator, 'share', {
        value: vi.fn(),
        writable: true,
        configurable: true,
      });
      render(<ShareButtons {...defaultProps} />);
      expect(screen.getByLabelText('シェアする')).toBeDefined();
    });
  });

  describe('Twitter/X シェア', () => {
    test('正しい intent URL が生成されること', () => {
      render(<ShareButtons {...defaultProps} hashtags={['EXVS2IB', 'イニブ']} />);
      fireEvent.click(screen.getByLabelText('Xでシェア'));

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      const parsed = new URL(calledUrl);

      expect(parsed.origin + parsed.pathname).toBe('https://twitter.com/intent/tweet');
      expect(parsed.searchParams.get('text')).toBe('テスト共有テキスト');
      expect(parsed.searchParams.get('url')).toBe('https://example.com/page');
      expect(parsed.searchParams.get('hashtags')).toBe('EXVS2IB,イニブ');
    });

    test('ハッシュタグなしの場合は hashtags パラメータが含まれないこと', () => {
      render(<ShareButtons {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Xでシェア'));

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      const parsed = new URL(calledUrl);

      expect(parsed.searchParams.get('text')).toBe('テスト共有テキスト');
      expect(parsed.searchParams.get('url')).toBe('https://example.com/page');
      expect(parsed.searchParams.has('hashtags')).toBe(false);
    });

    test('新しいウィンドウで開かれること', () => {
      render(<ShareButtons {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Xでシェア'));

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.any(String),
        '_blank',
        'noopener,noreferrer,width=600,height=400'
      );
    });
  });

  describe('LINE シェア', () => {
    test('正しいシェア URL が生成されること', () => {
      render(<ShareButtons {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('LINEでシェア'));

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      const parsed = new URL(calledUrl);

      expect(parsed.origin + parsed.pathname).toBe('https://line.me/R/share');
      const shareText = parsed.searchParams.get('text');
      expect(shareText).toBe('テスト共有テキスト https://example.com/page');
    });

    test('新しいウィンドウで開かれること', () => {
      render(<ShareButtons {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('LINEでシェア'));

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.any(String),
        '_blank',
        'noopener,noreferrer,width=600,height=400'
      );
    });
  });

  describe('Web Share API', () => {
    test('navigator.share が正しい引数で呼ばれること', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        value: shareMock,
        writable: true,
        configurable: true,
      });

      render(<ShareButtons {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('シェアする'));

      expect(shareMock).toHaveBeenCalledWith({
        title: 'テスト共有テキスト',
        url: 'https://example.com/page',
      });
    });

    test('AbortError は無視されること', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const abortError = new DOMException('User cancelled', 'AbortError');
      const shareMock = vi.fn().mockRejectedValue(abortError);
      Object.defineProperty(navigator, 'share', {
        value: shareMock,
        writable: true,
        configurable: true,
      });

      render(<ShareButtons {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('シェアする'));

      // 非同期処理の完了を待つ
      await vi.waitFor(() => {
        expect(shareMock).toHaveBeenCalled();
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    test('AbortError 以外のエラーは console.error に出力されること', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const shareError = new Error('共有失敗');
      const shareMock = vi.fn().mockRejectedValue(shareError);
      Object.defineProperty(navigator, 'share', {
        value: shareMock,
        writable: true,
        configurable: true,
      });

      render(<ShareButtons {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('シェアする'));

      await vi.waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('共有に失敗しました:', shareError);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Props', () => {
    test('hashtags がオプショナルであること（未指定で正常動作）', () => {
      render(<ShareButtons url="https://example.com" text="テスト" />);
      expect(screen.getByLabelText('Xでシェア')).toBeDefined();
      expect(screen.getByLabelText('LINEでシェア')).toBeDefined();
    });

    test('空のhashtags配列でも正常動作すること', () => {
      render(<ShareButtons url="https://example.com" text="テスト" hashtags={[]} />);
      fireEvent.click(screen.getByLabelText('Xでシェア'));

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      const parsed = new URL(calledUrl);
      expect(parsed.searchParams.has('hashtags')).toBe(false);
    });
  });
});
