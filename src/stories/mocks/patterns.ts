/**
 * EvaluatedPattern型のモックデータ
 */

import type { EvaluatedPattern } from '../../lib/types';
import { evaluateAllPatterns, getTopPatterns } from '../../lib/evaluators';
import { formation3000_3000, formation3000_2500, formation2500_2500 } from './formations';

/** 3000+3000の評価済みパターン（全パターン） */
export const patterns3000_3000 = evaluateAllPatterns(formation3000_3000);

/** 3000+3000のトップパターン（重複排除） */
export const topPatterns3000_3000 = getTopPatterns(patterns3000_3000, formation3000_3000);

/** 3000+2500の評価済みパターン（全パターン） */
export const patterns3000_2500 = evaluateAllPatterns(formation3000_2500);

/** 3000+2500のトップパターン（重複排除） */
export const topPatterns3000_2500 = getTopPatterns(patterns3000_2500, formation3000_2500);

/** 2500+2500の評価済みパターン（全パターン） */
export const patterns2500_2500 = evaluateAllPatterns(formation2500_2500);

/** 2500+2500のトップパターン（重複排除） */
export const topPatterns2500_2500 = getTopPatterns(patterns2500_2500, formation2500_2500);

/** EXオーバーリミット発動可能なパターン */
export const exAvailablePattern: EvaluatedPattern =
  topPatterns3000_3000.find((p) => p.canActivateEXOverLimit && !p.isEXActivationFailure) ||
  topPatterns3000_3000[0];

/** EXオーバーリミット不発パターン */
export const exFailurePattern: EvaluatedPattern =
  topPatterns3000_2500.find((p) => p.isEXActivationFailure) || topPatterns3000_2500[0];

/** コストオーバー状態を含むパターン */
export const overCostPattern: EvaluatedPattern =
  topPatterns2500_2500.find((p) => p.overCostCount > 0) || topPatterns2500_2500[0];
