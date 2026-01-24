/**
 * EXVS2 評価関数
 */

import type {
  Formation,
  EvaluatedPattern,
  EvaluationAxisType,
  UnitId,
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
 * つまり、残コスト < min(コストA, コストB) の状態になったか
 */
export function checkEXActivation(
  formation: Formation,
  transitions: BattleState[]
): boolean {
  if (!formation.unitA || !formation.unitB) {
    return false;
  }

  const minCost = Math.min(formation.unitA.cost, formation.unitB.cost);

  // 各transitionで、残コスト < minCostになったかチェック
  for (const transition of transitions) {
    // 敗北した場合はその前の状態でチェック済み
    if (transition.isDefeat) {
      break;
    }

    // 残コスト < minCost = どちらを撃墜しても敗北 = EX発動可能
    if (transition.remainingCost < minCost) {
      return true;
    }
  }

  return false;
}


/**
 * バランススコアを計算
 * コストオーバーの深さ（マイナス幅）の合計の逆数
 * 数値が大きいほどバランスが良い
 */
export function calculateBalancedScore(transitions: BattleState[]): number {
  let totalOverCostDepth = 0;

  for (const transition of transitions) {
    // 敗北時（残コスト0以下）のマイナス幅を加算
    if (transition.remainingCost < 0) {
      totalOverCostDepth += Math.abs(transition.remainingCost);
    }
  }

  // マイナスになっていない場合はスコア最大
  if (totalOverCostDepth === 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  // 深さの合計の逆数
  return 1 / totalOverCostDepth;
}

/**
 * 全パターンを評価
 */
export function evaluateAllPatterns(
  formation: Formation
): EvaluatedPattern[] {
  if (!formation.unitA || !formation.unitB) {
    return [];
  }

  const patterns = generatePatterns();

  const evaluated: EvaluatedPattern[] = patterns.map((pattern) => {
    const transitions = calculateCostTransitions(pattern, formation);
    const totalHealth = calculateTotalHealth(formation, transitions);
    const overCostCount = countOverCosts(transitions);
    const balancedScore = calculateBalancedScore(transitions);

    // このパターンでEXオーバーリミットが発動するか
    const canActivateEX = checkEXActivation(formation, transitions);
    // EX発動不可パターンかどうか（発動せずに敗北）
    const isEXFailure = !canActivateEX;

    return {
      pattern,
      totalHealth,
      overCostCount,
      balancedScore,
      canActivateEXOverLimit: canActivateEX,
      isEXActivationFailure: isEXFailure,
      transitions,
    };
  });

  return evaluated;
}

/**
 * セオリー準拠スコアを計算
 * 低コスト後落ち、EX発動可能を優先
 */
function calculateTheoryScore(
  pattern: EvaluatedPattern,
  formation: Formation
): number {
  let score = 0;

  // EX発動不可パターンは大幅減点
  if (pattern.isEXActivationFailure) {
    score -= 10000;
  }

  const unitA = formation.unitA!;
  const unitB = formation.unitB!;

  // 低コスト後落ち優先
  // 最後の撃墜が低コスト側かをチェック
  if (unitA.cost !== unitB.cost) {
    const lowCostUnit: UnitId = unitA.cost < unitB.cost ? 'A' : 'B';
    const lastKill = pattern.pattern[pattern.pattern.length - 1];

    // 最後が低コストなら加点
    if (lastKill === lowCostUnit) {
      score += 1000;
    }
  }

  // 総耐久も考慮
  score += pattern.totalHealth;

  return score;
}

/**
 * 評価軸に応じてパターンをソート
 */
export function sortByAxis(
  patterns: EvaluatedPattern[],
  axis: EvaluationAxisType,
  formation: Formation
): EvaluatedPattern[] {
  const sorted = [...patterns];

  switch (axis) {
    case 'totalHealth':
      // 総耐久の降順
      sorted.sort((a, b) => b.totalHealth - a.totalHealth);
      break;

    case 'exGuaranteed':
      // EX発動保証: EX発動不可パターンを除外し、総耐久降順
      sorted.sort((a, b) => {
        // EX発動不可パターンを最下位に
        if (a.isEXActivationFailure !== b.isEXActivationFailure) {
          return a.isEXActivationFailure ? 1 : -1;
        }
        // 総耐久の降順
        return b.totalHealth - a.totalHealth;
      });
      break;

    case 'theory':
      // セオリー準拠: 低コスト後落ち、EX発動可能を優先
      sorted.sort((a, b) => {
        const scoreA = calculateTheoryScore(a, formation);
        const scoreB = calculateTheoryScore(b, formation);
        return scoreB - scoreA;
      });
      break;

    case 'balanced':
      // バランススコアの降順
      sorted.sort((a, b) => b.balancedScore - a.balancedScore);
      break;
  }

  return sorted;
}

/**
 * TOP N パターンを取得（重複排除）
 */
export function getTopPatterns(
  patterns: EvaluatedPattern[],
  axis: EvaluationAxisType,
  formation: Formation,
  limit = 5
): EvaluatedPattern[] {
  const sorted = sortByAxis(patterns, axis, formation);

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
