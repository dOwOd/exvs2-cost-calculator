/**
 * EXVS2 評価関数
 */

import type {
  Formation,
  EvaluatedPattern,
  BattleState,
  PatternStatistics,
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

/**
 * パターン統計情報を計算（相対評価用）
 */
export const calculatePatternStatistics = (
  patterns: EvaluatedPattern[]
): PatternStatistics | null => {
  if (patterns.length === 0) return null;

  const totalHealthValues = patterns.map((p) => p.totalHealth);
  const overCostValues = patterns.map((p) => p.overCostCount);
  const killCountValues = patterns.map((p) => p.transitions.length);

  const exActivatablePatterns = patterns.filter(
    (p) => p.canActivateEXOverLimit && !p.isEXActivationFailure
  );

  const sum = totalHealthValues.reduce((a, b) => a + b, 0);

  return {
    totalHealth: {
      max: Math.max(...totalHealthValues),
      min: Math.min(...totalHealthValues),
      average: Math.round(sum / patterns.length),
    },
    overCostCount: {
      max: Math.max(...overCostValues),
      min: Math.min(...overCostValues),
    },
    killCount: {
      max: Math.max(...killCountValues),
      min: Math.min(...killCountValues),
    },
    exActivatableCount: exActivatablePatterns.length,
    totalPatterns: patterns.length,
    exActivatableMaxHealth:
      exActivatablePatterns.length > 0
        ? Math.max(...exActivatablePatterns.map((p) => p.totalHealth))
        : null,
  };
}

/**
 * パターンの相対評価コメントを生成
 */
export const generatePatternComments = (
  pattern: EvaluatedPattern,
  statistics: PatternStatistics
): string[] => {
  if (statistics.totalPatterns <= 1) return [];

  const comments: string[] = [];
  const { totalHealth, overCostCount, killCount } = statistics;

  // 1. 総耐久が最も高い
  if (pattern.totalHealth === totalHealth.max && totalHealth.max !== totalHealth.min) {
    comments.push('総耐久が最も高い');
  }

  // 2. 総耐久が最も低い
  if (pattern.totalHealth === totalHealth.min && totalHealth.max !== totalHealth.min) {
    comments.push('総耐久が最も低い');
  }

  // 3. コストオーバーが最も少ない
  if (pattern.overCostCount === overCostCount.min && overCostCount.max !== overCostCount.min) {
    comments.push('コストオーバーが最も少ない');
  }

  // 4. 最も長く戦える
  const patternKillCount = pattern.transitions.length;
  if (patternKillCount === killCount.max && killCount.max !== killCount.min) {
    comments.push('最も長く戦える');
  }

  // 5. EX発動可能な中で最高耐久
  const isEXActivatable = pattern.canActivateEXOverLimit && !pattern.isEXActivationFailure;
  if (
    isEXActivatable &&
    statistics.exActivatableCount > 1 &&
    statistics.exActivatableMaxHealth !== null &&
    pattern.totalHealth === statistics.exActivatableMaxHealth
  ) {
    comments.push('EX発動可能な中で最高耐久');
  }

  return comments;
}
