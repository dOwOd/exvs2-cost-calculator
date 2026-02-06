/**
 * EXVS2 コスト計算機 型定義
 */

/** コストタイプ */
export type CostType = 1500 | 2000 | 2500 | 3000;

/** 機体名リテラル型（mobileSuitsDataから再エクスポート） */
export type { MobileSuitName } from '../data/mobileSuitsData';

/** 耐久値タイプ（overCostHealthTable.tsで使用されているすべての値） */
export type HealthType = 440 | 460 | 480 | 500 | 520 | 540 | 580 | 600 | 620 | 640 | 650 | 660 | 680 | 700 | 720 | 740 | 750 | 760 | 800;

/** HealthType の全値を配列として保持（ランタイム検証用） */
export const HEALTH_VALUES = [
  440, 460, 480, 500, 520, 540, 580, 600, 620, 640,
  650, 660, 680, 700, 720, 740, 750, 760, 800
] as const;

/** CostType の全値を配列として保持（ランタイム検証用） */
export const COST_VALUES = [1500, 2000, 2500, 3000] as const;

/** CostType の型ガード関数 */
export const isCostType = (value: number): value is CostType => {
  return COST_VALUES.some(v => v === value);
};

/** 型ガード関数（asを使わず some で比較） */
export const isHealthType = (value: number): value is HealthType => {
  return HEALTH_VALUES.some(v => v === value);
};

/** 機体ID */
export type UnitId = 'A' | 'B';

/** 機体設定（コスト+耐久の組み合わせ） */
export type UnitConfig = {
  cost: CostType;
  health: HealthType;
  hasPartialRevival?: boolean;
}

/** 編成（機体A, B） */
export type Formation = {
  unitA: UnitConfig | null;
  unitB: UnitConfig | null;
}

/** バトル状態（コスト推移の1ステップ） */
export type BattleState = {
  /** 何回目の撃墜か */
  killCount: number;
  /** 撃墜された機体 */
  killedUnit: UnitId;
  /** チーム残りコスト（6000からスタート、A/B共有） */
  remainingCost: number;
  /** コストオーバーしたか */
  isOverCost: boolean;
  /** リスポーン時の耐久値（撃墜された機体） */
  respawnHealth: number;
  /** 敗北条件を満たしたか（残コスト0以下） */
  isDefeat: boolean;
  /** 復活ありで復帰したか */
  isPartialRevival: boolean;
}

/** 評価済みパターン */
export type EvaluatedPattern = {
  /** 撃墜順パターン */
  pattern: UnitId[];
  /** 総耐久値（リスポーン耐久変動を考慮した真の総耐久） */
  totalHealth: number;
  /** コストオーバー回数 */
  overCostCount: number;
  /** EXオーバーリミット発動可能な編成か */
  canActivateEXOverLimit: boolean;
  /** EX発動不可パターンか（発動条件を満たさずに敗北） */
  isEXActivationFailure: boolean;
  /** コスト推移 */
  transitions: BattleState[];
}

