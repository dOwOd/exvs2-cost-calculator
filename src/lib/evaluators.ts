/**
 * EXVS2 評価関数
 */

import type {
  Formation,
  EvaluatedPattern,
  BattleState,
} from './types';
import {
  generatePatterns,
  calculateCostTransitions,
  calculateTotalHealth,
  countOverCosts,
} from './calculator';

/**
 * EXオーバーリミット発動条件をチェック（パターンごと）
 * 条件: 自機と僚機のいずれもが撃墜されたら敗北する状況
 * つまり、残コスト <= min(コストA, コストB) の状態になったか
 */
export const checkEXActivation = (
  formation: Formation,
  transitions: BattleState[]
): boolean => {
  if (!formation.unitA || !formation.unitB) {
    return false;
  }

  const minCost = Math.min(formation.unitA.cost, formation.unitB.cost);

  // 各transitionで、残コスト <= minCostになったかチェック
  for (const transition of transitions) {
    // 敗北した場合はその前の状態でチェック済み
    if (transition.isDefeat) {
      break;
    }

    // 残コスト <= minCost = どちらを撃墜しても敗北 = EX発動可能
    if (transition.remainingCost <= minCost) {
      return true;
    }
  }

  return false;
}


/**
 * 全パターンを評価
 */
export const evaluateAllPatterns = (
  formation: Formation
): EvaluatedPattern[] => {
  if (!formation.unitA || !formation.unitB) {
    return [];
  }

  const revivalCount = (formation.unitA.hasPartialRevival ? 1 : 0) + (formation.unitB.hasPartialRevival ? 1 : 0);
  const maxKills = 4 + revivalCount;
  const patterns = generatePatterns(maxKills);

  const evaluated: EvaluatedPattern[] = patterns.map((pattern) => {
    const transitions = calculateCostTransitions(pattern, formation);
    const totalHealth = calculateTotalHealth(formation, transitions);
    const overCostCount = countOverCosts(transitions);

    // このパターンでEXオーバーリミットが発動するか
    const canActivateEX = checkEXActivation(formation, transitions);
    // EX発動不可パターンかどうか（発動せずに敗北）
    const isEXFailure = !canActivateEX;

    return {
      pattern,
      totalHealth,
      overCostCount,
      canActivateEXOverLimit: canActivateEX,
      isEXActivationFailure: isEXFailure,
      transitions,
    };
  });

  return evaluated;
}

/**
 * 総耐久降順でソートされたパターンを取得（重複排除）
 */
export const getTopPatterns = (
  patterns: EvaluatedPattern[],
  limit = Infinity
): EvaluatedPattern[] => {
  // 総耐久の降順でソート
  const sorted = [...patterns].sort((a, b) => b.totalHealth - a.totalHealth);

  // 実際に発生した撃墜順で重複を排除
  const seen = new Set<string>();
  const unique: EvaluatedPattern[] = [];

  for (const pattern of sorted) {
    // 実際の撃墜順（敗北までの部分）を文字列化
    const actualPattern = pattern.transitions
      .map((t) => t.killedUnit)
      .join('');

    // 未出現のパターンのみ追加
    if (!seen.has(actualPattern)) {
      seen.add(actualPattern);
      unique.push(pattern);

      // 必要な数が集まったら終了
      if (unique.length >= limit) {
        break;
      }
    }
  }

  return unique;
}
