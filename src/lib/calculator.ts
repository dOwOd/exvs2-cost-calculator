/**
 * EXVS2 コスト計算ロジック
 */

import type { Formation, UnitId, BattleState } from './types';
import { getRespawnHealth } from '../data/overCostHealthTable';

/** 初期コスト */
const INITIAL_COST = 6000;

/**
 * 撃墜順パターンを生成
 * @param maxKills 最大撃墜数（デフォルト4、復活ユニット数に応じて増加）
 * 例: ['A', 'A', 'B', 'B'], ['A', 'B', 'A', 'B'], ...
 */
export const generatePatterns = (maxKills = 4): UnitId[][] => {
  const patterns: UnitId[][] = [];
  const units: UnitId[] = ['A', 'B'];
  const total = 2 ** maxKills;

  for (let i = 0; i < total; i++) {
    const pattern: UnitId[] = [];
    for (let j = 0; j < maxKills; j++) {
      const bit = (i >> j) & 1;
      pattern.push(units[bit]);
    }
    patterns.push(pattern);
  }

  return patterns;
}

/** 復活あり時の耐久値 */
const PARTIAL_REVIVAL_HEALTH = 100;

/**
 * コスト推移を計算
 * @param pattern 撃墜順パターン
 * @param formation 編成
 * @returns コスト推移の配列
 */
export const calculateCostTransitions = (
  pattern: UnitId[],
  formation: Formation
): BattleState[] => {
  if (!formation.unitA || !formation.unitB) {
    return [];
  }

  const transitions: BattleState[] = [];
  let remainingCost = INITIAL_COST; // チーム共有の残りコスト
  const revivalUsed = { A: false, B: false }; // 復活ありの使用状況

  for (let i = 0; i < pattern.length; i++) {
    const killedUnit = pattern[i];
    const killCount = i + 1;

    // 撃墜された機体の情報
    const killedUnitConfig = killedUnit === 'A' ? formation.unitA : formation.unitB;

    // チームの残りコストから撃墜された機体のコストを減算
    remainingCost -= killedUnitConfig.cost;

    // 敗北判定（残コスト0以下）
    const wouldDefeat = remainingCost <= 0;

    // 復活ありチェック
    const canRevive = wouldDefeat
      && killedUnitConfig.hasPartialRevival
      && !revivalUsed[killedUnit];

    if (canRevive) {
      // 復活あり発動
      revivalUsed[killedUnit] = true;

      transitions.push({
        killCount,
        killedUnit,
        remainingCost,
        isOverCost: false,
        respawnHealth: PARTIAL_REVIVAL_HEALTH,
        isDefeat: false,
        isPartialRevival: true,
      });

      continue;
    }

    if (wouldDefeat) {
      // 敗北
      transitions.push({
        killCount,
        killedUnit,
        remainingCost,
        isOverCost: false,
        respawnHealth: 0,
        isDefeat: true,
        isPartialRevival: false,
      });
      break;
    }

    // 通常のリスポーン
    const isOverCost = remainingCost < killedUnitConfig.cost;
    const respawnHealth = getRespawnHealth(
      killedUnitConfig.cost,
      killedUnitConfig.health,
      remainingCost
    );

    transitions.push({
      killCount,
      killedUnit,
      remainingCost,
      isOverCost,
      respawnHealth,
      isDefeat: false,
      isPartialRevival: false,
    });
  }

  return transitions;
}

/**
 * 総耐久値を計算（リスポーン耐久変動を考慮）
 * @param formation 編成
 * @param transitions コスト推移
 * @returns 総耐久値（初期耐久 + リスポーン耐久の合計）
 */
export const calculateTotalHealth = (
  formation: Formation,
  transitions: BattleState[]
): number => {
  if (!formation.unitA || !formation.unitB || transitions.length === 0) {
    return 0;
  }

  // 初期耐久（1回目の出撃）を加算
  let total = formation.unitA.health + formation.unitB.health;

  // リスポーン耐久を加算
  for (const transition of transitions) {
    // 敗北した場合、それ以降の耐久は加算しない
    if (transition.isDefeat) {
      break;
    }

    // リスポーン耐久を加算
    total += transition.respawnHealth;
  }

  return total;
}

/**
 * コストオーバー回数をカウント
 */
export const countOverCosts = (transitions: BattleState[]): number => {
  return transitions.filter((t) => t.isOverCost).length;
}

/**
 * 最短での敗北時の耐久値を計算
 * 片方の機体だけが狙われ続けた場合の最小ダメージ
 * @param formation 編成
 * @returns 最短での敗北耐久値
 */
export const calculateMinimumDefeatHealth = (formation: Formation): number => {
  if (!formation.unitA || !formation.unitB) {
    return 0;
  }

  // Aだけが狙われ続けた場合
  const killsA = Math.ceil(INITIAL_COST / formation.unitA.cost);
  const damageA = killsA * formation.unitA.health + (formation.unitA.hasPartialRevival ? PARTIAL_REVIVAL_HEALTH : 0);

  // Bだけが狙われ続けた場合
  const killsB = Math.ceil(INITIAL_COST / formation.unitB.cost);
  const damageB = killsB * formation.unitB.health + (formation.unitB.hasPartialRevival ? PARTIAL_REVIVAL_HEALTH : 0);

  // 最短（最小ダメージで敗北）
  return Math.min(damageA, damageB);
}
