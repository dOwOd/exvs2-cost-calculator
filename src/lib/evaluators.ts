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
 * EXオーバーリミット発動条件をチェック
 * 条件: コストの合計が5000以上
 */
export function canActivateEXOverLimit(formation: Formation): boolean {
  if (!formation.unitA || !formation.unitB) {
    return false;
  }
  const totalCost = formation.unitA.cost + formation.unitB.cost;
  return totalCost >= 5000;
}

/**
 * EX発動不可パターンかどうかを判定
 * （発動条件を満たさずに敗北するパターン）
 */
export function isEXActivationFailure(
  pattern: UnitId[],
  formation: Formation
): boolean {
  if (!formation.unitA || !formation.unitB) {
    return false;
  }

  const costA = formation.unitA.cost;
  const costB = formation.unitB.cost;

  // EXオーバーリミットが発動できない編成はfalse
  if (!canActivateEXOverLimit(formation)) {
    return false;
  }

  // 撃墜回数をカウント
  const killCounts = { A: 0, B: 0 };
  for (const unit of pattern) {
    killCounts[unit]++;
  }

  // 3000+2500 または 3000+2000
  if (
    (costA === 3000 && (costB === 2500 || costB === 2000)) ||
    (costB === 3000 && (costA === 2500 || costA === 2000))
  ) {
    const unit3000: UnitId = costA === 3000 ? 'A' : 'B';
    const unitLow: UnitId = unit3000 === 'A' ? 'B' : 'A';

    // 低コストが0落ち、3000が2落ち → EX発動不可
    if (killCounts[unitLow] === 0 && killCounts[unit3000] === 2) {
      return true;
    }
  }

  // 3000+1500
  if (
    (costA === 3000 && costB === 1500) ||
    (costB === 3000 && costA === 1500)
  ) {
    const unit3000: UnitId = costA === 3000 ? 'A' : 'B';
    const unit1500: UnitId = unit3000 === 'A' ? 'B' : 'A';

    // ①1500が0落ち、3000が2落ち → EX発動不可
    if (killCounts[unit1500] === 0 && killCounts[unit3000] === 2) {
      return true;
    }

    // ②1500が2落ち後、3000が初落ち → EX発動不可
    // パターン: [1500, 1500, 3000, ...]
    if (
      pattern[0] === unit1500 &&
      pattern[1] === unit1500 &&
      pattern[2] === unit3000
    ) {
      return true;
    }
  }

  // 2500+1500
  if (
    (costA === 2500 && costB === 1500) ||
    (costB === 2500 && costA === 1500)
  ) {
    const unit2500: UnitId = costA === 2500 ? 'A' : 'B';
    const unit1500: UnitId = unit2500 === 'A' ? 'B' : 'A';

    // 互いに1落ち後、2500が2落ち目 → EX発動不可
    // 例: [2500, 1500, 2500, ...] または [1500, 2500, 2500, ...]
    let count2500 = 0;
    let count1500 = 0;

    for (let i = 0; i < pattern.length; i++) {
      const unit = pattern[i];

      if (unit === unit2500) count2500++;
      else count1500++;

      // 互いに1落ち後の状態で、次が2500の2落ち目
      if (
        count2500 === 1 &&
        count1500 === 1 &&
        i + 1 < pattern.length &&
        pattern[i + 1] === unit2500
      ) {
        return true;
      }
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
  const exOverLimitPossible = canActivateEXOverLimit(formation);

  const evaluated: EvaluatedPattern[] = patterns.map((pattern) => {
    const transitions = calculateCostTransitions(pattern, formation);
    const totalHealth = calculateTotalHealth(formation, transitions);
    const overCostCount = countOverCosts(transitions);
    const balancedScore = calculateBalancedScore(transitions);
    const isEXFailure = isEXActivationFailure(pattern, formation);

    return {
      pattern,
      totalHealth,
      overCostCount,
      balancedScore,
      canActivateEXOverLimit: exOverLimitPossible,
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
 * TOP N パターンを取得
 */
export function getTopPatterns(
  patterns: EvaluatedPattern[],
  axis: EvaluationAxisType,
  formation: Formation,
  limit = 5
): EvaluatedPattern[] {
  const sorted = sortByAxis(patterns, axis, formation);
  return sorted.slice(0, limit);
}
