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
  beforeEach(() => {
    // Web Share API はデフォルトで非対応
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('レンダリング', () => {
    test('Twitter/X リンクが表示されること', () => {
      render(<ShareButtons {...defaultProps} />);
      expect(screen.getByLabelText('Xでシェア')).toBeDefined();
    });

    test('LINE リンクが表示されること', () => {
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
      const link = screen.getByLabelText('Xでシェア') as HTMLAnchorElement;
      const parsed = new URL(link.href);

      expect(parsed.origin + parsed.pathname).toBe('https://twitter.com/intent/tweet');
      expect(parsed.searchParams.get('text')).toBe('テスト共有テキスト');
      expect(parsed.searchParams.get('url')).toBe('https://example.com/page');
      expect(parsed.searchParams.get('hashtags')).toBe('EXVS2IB,イニブ');
    });

    test('ハッシュタグなしの場合は hashtags パラメータが含まれないこと', () => {
      render(<ShareButtons {...defaultProps} />);
      const link = screen.getByLabelText('Xでシェア') as HTMLAnchorElement;
      const parsed = new URL(link.href);

      expect(parsed.searchParams.get('text')).toBe('テスト共有テキスト');
      expect(parsed.searchParams.get('url')).toBe('https://example.com/page');
      expect(parsed.searchParams.has('hashtags')).toBe(false);
    });

    test('新しいタブで開かれる属性が設定されていること', () => {
      render(<ShareButtons {...defaultProps} />);
      const link = screen.getByLabelText('Xでシェア') as HTMLAnchorElement;

      expect(link.target).toBe('_blank');
      expect(link.rel).toBe('noreferrer');
    });
  });

  describe('LINE シェア', () => {
    test('正しいシェア URL が生成されること', () => {
      render(<ShareButtons {...defaultProps} />);
      const link = screen.getByLabelText('LINEでシェア') as HTMLAnchorElement;
      const parsed = new URL(link.href);

      expect(parsed.origin + parsed.pathname).toBe('https://line.me/R/share');
      const shareText = parsed.searchParams.get('text');
      expect(shareText).toBe('テスト共有テキスト https://example.com/page');
    });

    test('新しいタブで開かれる属性が設定されていること', () => {
      render(<ShareButtons {...defaultProps} />);
      const link = screen.getByLabelText('LINEでシェア') as HTMLAnchorElement;

      expect(link.target).toBe('_blank');
      expect(link.rel).toBe('noreferrer');
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
      const link = screen.getByLabelText('Xでシェア') as HTMLAnchorElement;
      const parsed = new URL(link.href);
      expect(parsed.searchParams.has('hashtags')).toBe(false);
    });
  });
});
