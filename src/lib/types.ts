/**
 * EXVS2 コスト計算機 型定義
 */

/** コストタイプ */
export type CostType = 1500 | 2000 | 2500 | 3000;

/** 機体ID */
export type UnitId = 'A' | 'B';

/** 機体設定（コスト+耐久の組み合わせ） */
export interface UnitConfig {
  cost: CostType;
  health: number;
}

/** 編成（機体A, B） */
export interface Formation {
  unitA: UnitConfig | null;
  unitB: UnitConfig | null;
}

/** バトル状態（コスト推移の1ステップ） */
export interface BattleState {
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
}

/** 評価済みパターン */
export interface EvaluatedPattern {
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

