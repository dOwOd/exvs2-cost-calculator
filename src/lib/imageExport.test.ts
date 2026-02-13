/**
 * 画像エクスポートユーティリティのテスト
 */

import { vi } from 'vitest';
import type { Formation } from './types';
import { canShareFiles, generateFilename, generatePatternCardImage } from './imageExport';

// html-to-imageをモック
const mockToPng = vi.fn();
vi.mock('html-to-image', () => ({
  toPng: (...args: unknown[]) => mockToPng(...args),
}));

describe('canShareFiles', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  test('navigator.shareが未定義の場合はfalse', () => {
    Object.defineProperty(global, 'navigator', {
      value: { ...originalNavigator, share: undefined, canShare: undefined },
      configurable: true,
    });
    expect(canShareFiles()).toBe(false);
  });

  test('navigator.canShareが未定義の場合はfalse', () => {
    Object.defineProperty(global, 'navigator', {
      value: { ...originalNavigator, share: vi.fn(), canShare: undefined },
      configurable: true,
    });
    expect(canShareFiles()).toBe(false);
  });

  test('canShareがfalseを返す場合はfalse', () => {
    Object.defineProperty(global, 'navigator', {
      value: { ...originalNavigator, share: vi.fn(), canShare: () => false },
      configurable: true,
    });
    expect(canShareFiles()).toBe(false);
  });

  test('canShareがtrueを返す場合はtrue', () => {
    Object.defineProperty(global, 'navigator', {
      value: { ...originalNavigator, share: vi.fn(), canShare: () => true },
      configurable: true,
    });
    expect(canShareFiles()).toBe(true);
  });

  test('canShareがエラーを投げる場合はfalse', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        share: vi.fn(),
        canShare: () => {
          throw new Error('not supported');
        },
      },
      configurable: true,
    });
    expect(canShareFiles()).toBe(false);
  });
});

describe('generateFilename', () => {
  test('通常の編成でファイル名を生成', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    expect(generateFilename(1, formation)).toBe('exvs2-pattern-1-3000+2500.png');
  });

  test('同コスト編成でファイル名を生成', () => {
    const formation: Formation = {
      unitA: { cost: 2000, health: 600 },
      unitB: { cost: 2000, health: 580 },
    };
    expect(generateFilename(3, formation)).toBe('exvs2-pattern-3-2000+2000.png');
  });

  test('片方がnullの場合コスト0で生成', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: null,
    };
    expect(generateFilename(1, formation)).toBe('exvs2-pattern-1-3000+0.png');
  });

  test('ランク番号が反映される', () => {
    const formation: Formation = {
      unitA: { cost: 1500, health: 500 },
      unitB: { cost: 1500, health: 500 },
    };
    expect(generateFilename(10, formation)).toBe('exvs2-pattern-10-1500+1500.png');
  });
});

describe('generatePatternCardImage', () => {
  const mockBlob = new Blob(['test'], { type: 'image/png' });
  let mockClassList: {
    contains: ReturnType<typeof vi.fn>;
    add: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockToPng.mockReset();
    // fetchをモック（dataURL → Blob変換）
    global.fetch = vi.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(mockBlob),
      }),
    ) as unknown as typeof fetch;

    // document.documentElementをモック（isDarkModeで使用）
    mockClassList = { contains: vi.fn().mockReturnValue(false), add: vi.fn(), remove: vi.fn() };
    if (typeof globalThis.document === 'undefined') {
      Object.defineProperty(globalThis, 'document', {
        value: { documentElement: { classList: mockClassList } },
        configurable: true,
      });
    } else {
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        configurable: true,
      });
    }
  });

  test('toPngを呼び出し、exportingクラスを管理する', async () => {
    const mockDataUrl = 'data:image/png;base64,AAAA';
    mockToPng.mockResolvedValue(mockDataUrl);

    const mockElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      dataset: {},
    } as unknown as HTMLElement;

    const result = await generatePatternCardImage(mockElement);

    expect(mockElement.classList.add).toHaveBeenCalledWith('exporting');
    expect(mockToPng).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        pixelRatio: 2,
        cacheBust: true,
      }),
    );
    expect(mockElement.classList.remove).toHaveBeenCalledWith('exporting');
    expect(result).toBe(mockBlob);
  });

  test('ライトモード時にbackgroundColorとしてslate-100を渡す', async () => {
    const mockDataUrl = 'data:image/png;base64,AAAA';
    mockToPng.mockResolvedValue(mockDataUrl);

    // ライトモード: darkクラスなし
    mockClassList.contains.mockReturnValue(false);

    const mockElement = {
      classList: { add: vi.fn(), remove: vi.fn() },
      dataset: {},
    } as unknown as HTMLElement;

    await generatePatternCardImage(mockElement);

    expect(mockToPng).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        backgroundColor: '#f1f5f9',
      }),
    );
  });

  test('ダークモード時にbackgroundColorとしてslate-900を渡す', async () => {
    const mockDataUrl = 'data:image/png;base64,AAAA';
    mockToPng.mockResolvedValue(mockDataUrl);

    // ダークモード: darkクラスあり
    mockClassList.contains.mockReturnValue(true);

    const mockElement = {
      classList: { add: vi.fn(), remove: vi.fn() },
      dataset: {},
    } as unknown as HTMLElement;

    await generatePatternCardImage(mockElement);

    expect(mockToPng).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        backgroundColor: '#0f172a',
      }),
    );
  });

  test('filter関数がdata-export-exclude要素を除外する', async () => {
    const mockDataUrl = 'data:image/png;base64,AAAA';
    mockToPng.mockResolvedValue(mockDataUrl);

    const mockElement = {
      classList: { add: vi.fn(), remove: vi.fn() },
      dataset: {},
    } as unknown as HTMLElement;

    await generatePatternCardImage(mockElement);

    // toPngに渡されたfilter関数を取得して検証
    const filterFn = mockToPng.mock.calls[0][1].filter;

    // data-export-exclude属性がない要素は含まれる
    expect(filterFn({ dataset: {} } as HTMLElement)).toBe(true);
    // data-export-exclude属性がある要素は除外される
    expect(filterFn({ dataset: { exportExclude: '' } } as unknown as HTMLElement)).toBe(false);
  });

  test('エラー発生時もexportingクラスを除去する', async () => {
    mockToPng.mockRejectedValue(new Error('render failed'));

    const mockElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      dataset: {},
    } as unknown as HTMLElement;

    await expect(generatePatternCardImage(mockElement)).rejects.toThrow('render failed');
    expect(mockElement.classList.add).toHaveBeenCalledWith('exporting');
    expect(mockElement.classList.remove).toHaveBeenCalledWith('exporting');
  });
});
