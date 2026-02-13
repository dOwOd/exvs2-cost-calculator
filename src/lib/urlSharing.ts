/**
 * URL共有ユーティリティ
 * 編成データをURLパラメータにエンコード/デコードする
 */

import type { CostType, Formation, UnitConfig } from './types';
import { isHealthType } from '../data/mobileSuitsData';
import type { HealthType } from '../data/mobileSuitsData';

/** CostType の有効な値セット（types.ts との循環依存を避けるためローカル定義） */
const VALID_COSTS = new Set<number>([1500, 2000, 2500, 3000]);

type EncodeOptions = {
  exOnly?: boolean;
  firstKillFilter?: string;
};

type DecodeResult = {
  formation: Formation;
  exOnly: boolean;
  firstKillFilter: string;
};

/**
 * UnitConfig を "cost-health" 形式の文字列にエンコードする
 */
const encodeUnit = (unit: UnitConfig): string => {
  return `${unit.cost}-${unit.health}`;
};

/**
 * "cost-health" 形式の文字列を UnitConfig にデコードする
 * 不正な値の場合は null を返す
 */
const decodeUnit = (value: string): UnitConfig | null => {
  const parts = value.split('-');
  if (parts.length !== 2) return null;

  const cost = Number(parts[0]);
  const health = Number(parts[1]);

  if (Number.isNaN(cost) || Number.isNaN(health)) return null;
  if (!VALID_COSTS.has(cost)) return null;
  if (!isHealthType(health)) return null;

  return { cost: cost as CostType, health: health as HealthType };
};

/**
 * Formation を URLSearchParams にエンコードする
 */
export const encodeFormationToParams = (
  formation: Formation,
  options?: EncodeOptions,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (formation.unitA) {
    params.set('a', encodeUnit(formation.unitA));
  }
  if (formation.unitB) {
    params.set('b', encodeUnit(formation.unitB));
  }
  if (options?.exOnly) {
    params.set('exOnly', 'true');
  }
  if (options?.firstKillFilter) {
    params.set('fk', options.firstKillFilter);
  }

  return params;
};

const VALID_FIRST_KILL_FILTERS = new Set(['A', 'B']);

/**
 * URLSearchParams から Formation を復元する
 */
export const decodeFormationFromParams = (params: URLSearchParams): DecodeResult => {
  const aParam = params.get('a');
  const bParam = params.get('b');
  const exOnlyParam = params.get('exOnly');
  const fkParam = params.get('fk');

  return {
    formation: {
      unitA: aParam ? decodeUnit(aParam) : null,
      unitB: bParam ? decodeUnit(bParam) : null,
    },
    exOnly: exOnlyParam === 'true',
    firstKillFilter: fkParam && VALID_FIRST_KILL_FILTERS.has(fkParam) ? fkParam : '',
  };
};
