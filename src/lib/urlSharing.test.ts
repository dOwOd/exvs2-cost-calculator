/**
 * URL共有ユーティリティのテスト
 */

import { describe, it, expect } from 'vitest';
import { encodeFormationToParams, decodeFormationFromParams } from './urlSharing';
import type { Formation } from './types';

describe('encodeFormationToParams', () => {
  it('両機体をエンコードできる', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const params = encodeFormationToParams(formation);
    expect(params.get('a')).toBe('3000-680');
    expect(params.get('b')).toBe('2500-620');
    expect(params.has('exOnly')).toBe(false);
  });

  it('unitAのみの場合、unitBパラメータを省略する', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: null,
    };
    const params = encodeFormationToParams(formation);
    expect(params.get('a')).toBe('3000-680');
    expect(params.has('b')).toBe(false);
  });

  it('unitBのみの場合、unitAパラメータを省略する', () => {
    const formation: Formation = {
      unitA: null,
      unitB: { cost: 2000, health: 580 },
    };
    const params = encodeFormationToParams(formation);
    expect(params.has('a')).toBe(false);
    expect(params.get('b')).toBe('2000-580');
  });

  it('両方nullの場合、パラメータなし', () => {
    const formation: Formation = {
      unitA: null,
      unitB: null,
    };
    const params = encodeFormationToParams(formation);
    expect(params.toString()).toBe('');
  });

  it('exOnlyオプションがtrueのとき、パラメータに含まれる', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const params = encodeFormationToParams(formation, { exOnly: true });
    expect(params.get('exOnly')).toBe('true');
  });

  it('exOnlyオプションがfalseのとき、パラメータを省略する', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const params = encodeFormationToParams(formation, { exOnly: false });
    expect(params.has('exOnly')).toBe(false);
  });

  it('firstKillFilterオプションがあるとき、パラメータに含まれる', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const params = encodeFormationToParams(formation, { firstKillFilter: 'A' });
    expect(params.get('fk')).toBe('A');
  });

  it('firstKillFilterが空文字列のとき、パラメータを省略する', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const params = encodeFormationToParams(formation, { firstKillFilter: '' });
    expect(params.has('fk')).toBe(false);
  });

  it('全オプションを指定してエンコードできる', () => {
    const formation: Formation = {
      unitA: { cost: 1500, health: 440 },
      unitB: { cost: 2000, health: 580 },
    };
    const params = encodeFormationToParams(formation, { exOnly: true, firstKillFilter: 'B' });
    expect(params.get('a')).toBe('1500-440');
    expect(params.get('b')).toBe('2000-580');
    expect(params.get('exOnly')).toBe('true');
    expect(params.get('fk')).toBe('B');
  });
});

describe('decodeFormationFromParams', () => {
  it('両機体をデコードできる', () => {
    const params = new URLSearchParams('a=3000-680&b=2500-620');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toEqual({ cost: 3000, health: 680 });
    expect(result.formation.unitB).toEqual({ cost: 2500, health: 620 });
    expect(result.exOnly).toBe(false);
    expect(result.firstKillFilter).toBe('');
  });

  it('unitAのみのデコード', () => {
    const params = new URLSearchParams('a=2000-580');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toEqual({ cost: 2000, health: 580 });
    expect(result.formation.unitB).toBeNull();
  });

  it('unitBのみのデコード', () => {
    const params = new URLSearchParams('b=1500-440');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toBeNull();
    expect(result.formation.unitB).toEqual({ cost: 1500, health: 440 });
  });

  it('exOnlyパラメータを復元できる', () => {
    const params = new URLSearchParams('a=3000-680&b=2500-620&exOnly=true');
    const result = decodeFormationFromParams(params);
    expect(result.exOnly).toBe(true);
  });

  it('exOnlyが"true"以外のとき、falseになる', () => {
    const params = new URLSearchParams('a=3000-680&b=2500-620&exOnly=false');
    const result = decodeFormationFromParams(params);
    expect(result.exOnly).toBe(false);
  });

  it('firstKillFilterパラメータを復元できる', () => {
    const params = new URLSearchParams('a=3000-680&b=2500-620&fk=A');
    const result = decodeFormationFromParams(params);
    expect(result.firstKillFilter).toBe('A');
  });

  it('空パラメータの場合、両方null', () => {
    const params = new URLSearchParams('');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toBeNull();
    expect(result.formation.unitB).toBeNull();
    expect(result.exOnly).toBe(false);
    expect(result.firstKillFilter).toBe('');
  });

  it('無効なコスト値の場合、nullにフォールバック', () => {
    const params = new URLSearchParams('a=9999-680');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toBeNull();
  });

  it('無効な耐久値の場合、nullにフォールバック', () => {
    const params = new URLSearchParams('a=3000-999');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toBeNull();
  });

  it('フォーマット不正の場合、nullにフォールバック', () => {
    const params = new URLSearchParams('a=invalid');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toBeNull();
  });

  it('ハイフンが複数ある場合、nullにフォールバック', () => {
    const params = new URLSearchParams('a=3000-680-extra');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toBeNull();
  });

  it('数値でない値の場合、nullにフォールバック', () => {
    const params = new URLSearchParams('a=abc-def');
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toBeNull();
  });

  it('firstKillFilterが無効な値の場合、空文字にフォールバック', () => {
    const params = new URLSearchParams('a=3000-680&b=2500-620&fk=C');
    const result = decodeFormationFromParams(params);
    expect(result.firstKillFilter).toBe('');
  });
});

describe('エンコード/デコード ラウンドトリップ', () => {
  it('両機体の編成がラウンドトリップで一致する', () => {
    const formation: Formation = {
      unitA: { cost: 3000, health: 680 },
      unitB: { cost: 2500, health: 620 },
    };
    const params = encodeFormationToParams(formation, { exOnly: true, firstKillFilter: 'A' });
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toEqual({ cost: 3000, health: 680 });
    expect(result.formation.unitB).toEqual({ cost: 2500, health: 620 });
    expect(result.exOnly).toBe(true);
    expect(result.firstKillFilter).toBe('A');
  });

  it('片方nullの編成がラウンドトリップで一致する', () => {
    const formation: Formation = {
      unitA: { cost: 2000, health: 580 },
      unitB: null,
    };
    const params = encodeFormationToParams(formation);
    const result = decodeFormationFromParams(params);
    expect(result.formation.unitA).toEqual({ cost: 2000, health: 580 });
    expect(result.formation.unitB).toBeNull();
  });

  it('全コストタイプでラウンドトリップが一致する', () => {
    const costs = [1500, 2000, 2500, 3000] as const;
    const healths = [440, 580, 620, 680] as const;

    for (const cost of costs) {
      for (const health of healths) {
        const formation: Formation = {
          unitA: { cost, health },
          unitB: null,
        };
        const params = encodeFormationToParams(formation);
        const result = decodeFormationFromParams(params);
        expect(result.formation.unitA).toEqual({ cost, health });
      }
    }
  });
});
