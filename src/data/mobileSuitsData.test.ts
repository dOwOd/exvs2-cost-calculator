/**
 * 機体名データのテスト
 */

import {
  getMobileSuitNames,
  formatMobileSuitNames,
  getAllMobileSuitNames,
  getAvailableHealthOptions,
  hasMobileSuitsForHealth,
} from './mobileSuitsData';

describe('getMobileSuitNames', () => {
  test('最初の2つの機体名を返す', () => {
    const result = getMobileSuitNames(3000, 800);
    expect(result.names).toHaveLength(2);
    expect(result.names).toEqual(['ゴッドガンダム', 'マスターガンダム']);
  });

  test('2機以下の場合は全て返す', () => {
    const result = getMobileSuitNames(3000, 750);
    expect(result.names).toHaveLength(1);
    expect(result.names).toEqual(['ペーネロペー']);
  });

  test('残り機体数を正しく計算する', () => {
    const result = getMobileSuitNames(3000, 720);
    expect(result.remaining).toBeGreaterThan(0);
  });

  test('データが存在しない場合は空配列を返す', () => {
    const result = getMobileSuitNames(3000, 999 as any);
    expect(result.names).toEqual([]);
    expect(result.remaining).toBe(0);
  });
});

describe('formatMobileSuitNames', () => {
  test('機体名を正しく整形する', () => {
    const result = formatMobileSuitNames(3000, 800);
    expect(result).toBe('ゴッドガンダム、マスターガンダム');
  });

  test('残り機体がある場合は表示する', () => {
    const result = formatMobileSuitNames(3000, 720);
    expect(result).toMatch(/他\d+機$/);
  });

  test('データが存在しない場合は空文字を返す', () => {
    const result = formatMobileSuitNames(3000, 999 as any);
    expect(result).toBe('');
  });
});

describe('getAllMobileSuitNames', () => {
  test('すべての機体名を返す', () => {
    const result = getAllMobileSuitNames(3000, 720);
    expect(result.length).toBeGreaterThan(2);
  });

  test('データが存在しない場合は空配列を返す', () => {
    const result = getAllMobileSuitNames(3000, 999 as any);
    expect(result).toEqual([]);
  });
});

describe('getAvailableHealthOptions', () => {
  test('3000コストで740を含まない', () => {
    const options = getAvailableHealthOptions(3000);
    expect(options).not.toContain(740);
  });

  test('3000コストで650を含まない', () => {
    const options = getAvailableHealthOptions(3000);
    expect(options).not.toContain(650);
  });

  test('3000コストで実際に存在する耐久値のみを返す', () => {
    const options = getAvailableHealthOptions(3000);
    expect(options).toEqual([800, 760, 750, 720, 700, 680, 660, 640]);
  });

  test('1500コストで540を含む', () => {
    const options = getAvailableHealthOptions(1500);
    expect(options).toContain(540);
  });

  test('1500コストで460を含まない', () => {
    const options = getAvailableHealthOptions(1500);
    expect(options).not.toContain(460);
  });

  test('1500コストで実際に存在する耐久値のみを返す', () => {
    const options = getAvailableHealthOptions(1500);
    expect(options).toEqual([540, 520, 500, 480, 440]);
  });

  test('降順でソートされている', () => {
    const options = getAvailableHealthOptions(3000);
    expect(options).toEqual([...options].sort((a, b) => b - a));
  });

  test('2500コストで正しい値を返す', () => {
    const options = getAvailableHealthOptions(2500);
    expect(options).toEqual([700, 680, 660, 650, 640, 620, 600]);
  });

  test('2000コストで正しい値を返す', () => {
    const options = getAvailableHealthOptions(2000);
    expect(options).toEqual([680, 660, 650, 640, 620, 600, 580]);
  });
});

describe('hasMobileSuitsForHealth', () => {
  test('存在する組み合わせでtrueを返す', () => {
    expect(hasMobileSuitsForHealth(3000, 800)).toBe(true);
    expect(hasMobileSuitsForHealth(1500, 540)).toBe(true);
  });

  test('存在しない組み合わせでfalseを返す', () => {
    expect(hasMobileSuitsForHealth(3000, 740)).toBe(false);
    expect(hasMobileSuitsForHealth(3000, 650)).toBe(false);
    expect(hasMobileSuitsForHealth(1500, 460)).toBe(false);
  });

  test('無効なコストでfalseを返す', () => {
    expect(hasMobileSuitsForHealth(9999 as any, 800)).toBe(false);
  });
});

describe('normalizeString', () => {
  test('ひらがなをカタカナに変換', () => {
    const { normalizeString } = require('./mobileSuitsData');
    expect(normalizeString('ごっどがんだむ')).toBe('ゴッドガンダム');
  });

  test('全角英数字を半角に変換', () => {
    const { normalizeString } = require('./mobileSuitsData');
    expect(normalizeString('ＡＢＣ１２３')).toBe('abc123');
  });

  test('大文字を小文字に変換', () => {
    const { normalizeString } = require('./mobileSuitsData');
    expect(normalizeString('ABC')).toBe('abc');
  });

  test('複合的な変換', () => {
    const { normalizeString } = require('./mobileSuitsData');
    expect(normalizeString('がんだむえっくす')).toBe('ガンダムエックス');
  });
});

describe('searchMobileSuits', () => {
  test('カタカナで検索できる', () => {
    const { searchMobileSuits } = require('./mobileSuitsData');
    const results = searchMobileSuits('ゴッド');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.name === 'ゴッドガンダム')).toBe(true);
  });

  test('ひらがなで検索できる', () => {
    const { searchMobileSuits } = require('./mobileSuitsData');
    const results = searchMobileSuits('ごっど');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.name === 'ゴッドガンダム')).toBe(true);
  });

  test('部分一致で検索できる', () => {
    const { searchMobileSuits } = require('./mobileSuitsData');
    const results = searchMobileSuits('ガンダム');
    expect(results.length).toBeGreaterThanOrEqual(10);
  });

  test('最大10件まで返す', () => {
    const { searchMobileSuits } = require('./mobileSuitsData');
    const results = searchMobileSuits('ガンダム');
    expect(results.length).toBeLessThanOrEqual(10);
  });

  test('空文字列で空配列を返す', () => {
    const { searchMobileSuits } = require('./mobileSuitsData');
    const results = searchMobileSuits('');
    expect(results).toEqual([]);
  });

  test('該当なしで空配列を返す', () => {
    const { searchMobileSuits } = require('./mobileSuitsData');
    const results = searchMobileSuits('存在しない機体名xyz');
    expect(results).toEqual([]);
  });

  test('検索結果にコストと耐久値が含まれる', () => {
    const { searchMobileSuits } = require('./mobileSuitsData');
    const results = searchMobileSuits('ゴッドガンダム');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('name');
    expect(results[0]).toHaveProperty('cost');
    expect(results[0]).toHaveProperty('health');
    expect(results[0].name).toBe('ゴッドガンダム');
    expect(results[0].cost).toBe(3000);
    expect(results[0].health).toBe(800);
  });
});
