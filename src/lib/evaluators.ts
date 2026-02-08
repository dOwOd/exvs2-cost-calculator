/**
 * EXVS2 評価関数
 */

import type {
  Formation,
  EvaluatedPattern,
  BattleState,
  UnitId,
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
 * EXオーバーリミット発動可能になった最初のステップのインデックスを返す
 * 発動条件を満たさない場合は -1 を返す
 */
export const findEXActivationStepIndex = (
  formation: Formation,
  transitions: BattleState[]
): number => {
  if (!formation.unitA || !formation.unitB) {
    return -1;
  }

  const minCost = Math.min(formation.unitA.cost, formation.unitB.cost);

  for (let i = 0; i < transitions.length; i++) {
    const transition = transitions[i];

    // 敗北した場合はその前の状態でチェック済み
    if (transition.isDefeat) {
      break;
    }

    // 残コスト <= minCost = どちらを撃墜しても敗北 = EX発動可能
    if (transition.remainingCost <= minCost) {
      return i;
    }
  }

  return -1;
};

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

    // EX発動ステップにフラグを付与
    const exStepIndex = findEXActivationStepIndex(formation, transitions);
    if (exStepIndex >= 0) {
      transitions[exStepIndex].isEXActivationStep = true;
    }

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
 * ソートされたパターンを取得（重複排除）
 * formation が渡された場合、高コスト先落ちパターンを優先し、同グループ内で総耐久降順
 */
export const getTopPatterns = (
  patterns: EvaluatedPattern[],
  formation?: Formation,
  limit = Infinity
): EvaluatedPattern[] => {
  // 高コスト側の機体IDを特定（同コストの場合はnull = 優先なし）
  const higherCostUnit: UnitId | null = (() => {
    if (!formation?.unitA || !formation?.unitB) return null;
    if (formation.unitA.cost > formation.unitB.cost) return 'A';
    if (formation.unitB.cost > formation.unitA.cost) return 'B';
    return null;
  })();

  // プライマリ: 高コスト先落ち優先、セカンダリ: 総耐久降順
  const sorted = [...patterns].sort((a, b) => {
    // プライマリ: 高コスト先落ちパターンを優先
    if (higherCostUnit && a.transitions.length > 0 && b.transitions.length > 0) {
      const aIsTheory = a.transitions[0].killedUnit === higherCostUnit ? 1 : 0;
      const bIsTheory = b.transitions[0].killedUnit === higherCostUnit ? 1 : 0;
      if (aIsTheory !== bIsTheory) {
        return bIsTheory - aIsTheory;
      }
    }

    // セカンダリ: 総耐久降順
    return b.totalHealth - a.totalHealth;
  });

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

/**
 * 編成が不完全な場合はパターンを空にするガード
 * useEffectによるパターンクリアはレンダー後のため、
 * 中間レンダーでformationがnullのままパターンが残る状態を防ぐ
 */
export const getEffectivePatterns = (
  patterns: EvaluatedPattern[],
  formation: Formation
): EvaluatedPattern[] => {
  if (!formation.unitA || !formation.unitB) {
    return [];
  }
  return patterns;
}
