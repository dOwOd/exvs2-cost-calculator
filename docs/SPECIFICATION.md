# EXVS2 コスト計算機 技術仕様書

## 概要

機動戦士ガンダム EXTREME VS. 2 インフィニットブーストの2機編成における撃墜順パターンを評価するアプリケーションの詳細仕様。

---

## 1. ゲームルール

### 1.1 チーム構成

- **2機編成**: 機体A、機体B（同じチーム）
- **初期コスト**: 6000（チーム共有、A/B別管理ではない）
- **コストタイプ**: 3000 / 2500 / 2000 / 1500
- **耐久値**: コストごとに複数のバリエーション

### 1.2 撃墜とコスト

- 機体が撃墜されると、その機体コスト分をチーム共有の残コストから減算
- **残コスト > 0**: リスポーン可能
- **残コスト <= 0**: 敗北（試合終了）

### 1.3 リスポーン耐久値

撃墜された機体がリスポーンする際の耐久値は以下のルールで決定:

- **残コスト >= 機体コスト**: 初期耐久値で復活
- **0 < 残コスト < 機体コスト**: コストオーバー状態、ゲーム内固定テーブルから耐久値を決定
- **残コスト <= 0**: 復活なし（敗北）

**重要**: リスポーン耐久値は計算式ではなく、**ゲーム内固定テーブル**から取得する。

詳細は `src/data/overCostHealthTable.ts` を参照。

---

## 2. EXオーバーリミット

### 2.1 発動条件

```
残コスト <= min(コストA, コストB)
```

**意味**: 「自機と僚機のいずれもが撃墜されたら敗北する状況」

### 2.2 発動単位

- **チーム単位**で発動
- 条件を満たすと、A・B両方の機体が同時に発動可能状態となる
- 1試合中に条件を満たすのは1回のみ（「EXオーバー回数」という概念はない）

### 2.3 具体例

| 編成 | 撃墜順 | 残コスト推移 | EX発動タイミング |
|:-----|:-------|:-------------|:----------------|
| 3000+3000 | A撃墜 | 6000 → 3000 | ✅ 3000 <= 3000 |
| 3000+2500 | A撃墜 | 6000 → 3000 | ❌ 3000 > 2500 |
| 3000+2500 | A→B撃墜 | 6000 → 3000 → 500 | ✅ 500 <= 2500 |
| 2500+2500 | A→A撃墜 | 6000 → 3500 → 1000 | ✅ 1000 <= 2500 |
| 1500+1500 | A→A→A撃墜 | 6000 → 4500 → 3000 → 1500 | ✅ 1500 <= 1500 |

### 2.4 実装上の注意

- **境界値**: `<=` を使用（`<` ではない）
- 残コスト == minCost のケースでもEX発動する
- 敗北した後のステップはチェック不要（既に発動済みか、発動せずに敗北）

---

## 3. コスト計算アルゴリズム

### 3.1 コスト推移計算

```typescript
function calculateCostTransitions(
  pattern: UnitId[],
  formation: Formation
): BattleState[]
```

**処理フロー**:

1. 初期コスト6000から開始
2. パターン（撃墜順）を順番に処理:
   - 撃墜された機体のコストを残コストから減算
   - 残コスト <= 0 なら敗北 → 処理終了
   - 残コスト > 0 ならリスポーン耐久値を取得
3. 各ステップの状態を`BattleState`として記録

**BattleState**:

```typescript
interface BattleState {
  killCount: number;          // 累計撃墜数
  killedUnit: UnitId;         // 撃墜された機体（'A' | 'B'）
  remainingCost: number;      // チーム共有の残コスト
  isOverCost: boolean;        // コストオーバー状態か
  respawnHealth: number;      // リスポーン時の耐久値
  isDefeat: boolean;          // 敗北したか
}
```

### 3.2 総耐久値計算

```typescript
function calculateTotalHealth(
  formation: Formation,
  transitions: BattleState[]
): number
```

**計算式**:

```
総耐久 = 初期耐久A + 初期耐久B + Σ(リスポーン耐久)
```

**重要**: 初期耐久値を含める（リスポーン耐久のみではない）

**処理フロー**:

1. `total = formation.unitA.health + formation.unitB.health` で初期化
2. 各 transition について:
   - `isDefeat = true` なら加算しない（復活しないため）
   - `isDefeat = false` なら `respawnHealth` を加算
3. 合計を返す

---

## 4. ソートとフィルタリング

### 4.1 ソート

全パターンを**総耐久降順**でソート。

- **指標**: `totalHealth`（降順）
- **理由**: リスポーン耐久変動を考慮した真の総耐久値が最も重要な指標

### 4.2 フィルタリング

チェックボックスによる絞り込み機能。

#### EXオーバーリミット発動可能フィルター

- `isEXActivationFailure = false` のパターンのみ表示
- チェック時：EX発動できないパターンを除外
- チェック解除時：全パターン表示

**実装:**
```typescript
const filteredPatterns = showOnlyEXAvailable
  ? sortedPatterns.filter((p) => !p.isEXActivationFailure)
  : sortedPatterns;
```

---

## 5. パターン生成と重複排除

### 5.1 パターン生成

全16通りの撃墜順を生成:

```
['A', 'A', 'A', 'A']
['A', 'A', 'A', 'B']
['A', 'A', 'B', 'A']
...
['B', 'B', 'B', 'B']
```

### 5.2 実際の撃墜順

パターンは4回分の撃墜を想定しているが、実際には敗北時点で終了する。

**例**: 3000+3000編成で`['A', 'A', 'A', 'A']`を評価
- 1回目: A撃墜（残3000）
- 2回目: A撃墜（残0、敗北）
- **実際の撃墜順**: `['A', 'A']`（2回のみ）

### 5.3 重複排除

パターン表示時、**実際の撃墜順**が同じパターンは重複として除外。

**実装**:

```typescript
const actualPattern = pattern.transitions.map((t) => t.killedUnit).join('');
if (!seen.has(actualPattern)) {
  seen.add(actualPattern);
  unique.push(pattern);
}
```

**例**:
- `['A', 'A', 'A', 'A']` → 実際: `"AA"` → 採用
- `['A', 'A', 'B', 'B']` → 実際: `"AA"` → 重複（除外）

---

## 6. データ構造

### 6.1 型定義（src/lib/types.ts）

```typescript
/** コストタイプ */
export type CostType = 1500 | 2000 | 2500 | 3000;

/** 機体ID */
export type UnitId = 'A' | 'B';

/** 機体設定（コスト + 耐久の組み合わせ） */
export interface UnitConfig {
  cost: CostType;
  health: number;
}

/** 編成（2機） */
export interface Formation {
  unitA: UnitConfig;
  unitB: UnitConfig;
}

/** 戦闘状態（各撃墜ステップ） */
export interface BattleState {
  killCount: number;
  killedUnit: UnitId;
  remainingCost: number;      // チーム共有
  isOverCost: boolean;
  respawnHealth: number;
  isDefeat: boolean;
}

/** 評価済みパターン */
export interface EvaluatedPattern {
  pattern: UnitId[];              // 想定撃墜順（4回分）
  totalHealth: number;
  overCostCount: number;
  canActivateEXOverLimit: boolean;
  isEXActivationFailure: boolean;
  transitions: BattleState[];     // 実際の撃墜履歴
}

/** 評価軸 */
export type EvaluationAxisType =
  | 'totalHealth'
  | 'exGuaranteed'
  | 'theory';
```

### 6.2 コストオーバー耐久テーブル（src/data/overCostHealthTable.ts）

```typescript
export const overCostHealthTable: OverCostHealthTable = {
  3000: {
    800: { 500: 140, 1000: 270, 1500: 400, 2000: 540, 2500: 670 },
    760: { 500: 130, 1000: 260, 1500: 380, 2000: 510, 2500: 640 },
    // ... 他の耐久値
  },
  2500: {
    700: { 500: 140, 1000: 280, 1500: 420, 2000: 560 },
    // ... 他の耐久値
  },
  // ... 他のコスト
};

export function getRespawnHealth(
  cost: CostType,
  initialHealth: number,
  remainingCost: number
): number {
  if (remainingCost <= 0) return 0;
  if (remainingCost >= cost) return initialHealth;
  return overCostHealthTable[cost][initialHealth][remainingCost];
}
```

---

## 7. UI仕様

### 7.1 レイアウト

- **2カラム**: 左400px（編成選択）、右可変（結果表示）
- **テーマ**: ダークモード（bg-slate-900）

### 7.2 編成選択

1. **コスト選択**: ボタン（1500 / 2000 / 2500 / 3000）
2. **耐久値選択**: ドロップダウン（そのコストで利用可能な耐久値一覧）

### 7.3 結果表示

- **フィルター**: チェックボックス「EXオーバーリミット発動可能のみ表示」
- **全パターン表示**: カード形式で表示（総耐久降順、重複排除後）
- **EX発動可否**: ✅緑 / ❌赤背景
- **コスト推移テーブル**: 各撃墜ステップの詳細

---

## 8. テスト戦略

### 8.1 テスト対象

- `getRespawnHealth`: リスポーン耐久値取得
- `calculateCostTransitions`: コスト推移計算
- `calculateTotalHealth`: 総耐久値計算
- `checkEXActivation`: EX発動判定

### 8.2 重要テストケース

#### getRespawnHealth

- 残コスト >= 機体コスト → 初期耐久
- 残コスト <= 0 → 0
- コストオーバー → テーブル値

#### calculateCostTransitions

- 各編成での撃墜数（2回、3回、4回）
- 残コストの正確性
- 敗北判定

#### calculateTotalHealth

- 初期耐久を含むか
- リスポーン耐久の合計が正しいか

#### checkEXActivation

- 境界値（残コスト == minCost）
- 各編成での発動タイミング
- 発動前敗北のケース

---

## 9. 既知の制約・v1.0スコープ外

- ❌ バースト機能
- ❌ コスト推移グラフ（数値テーブルのみ）
- ❌ スマートフォン対応
- ❌ 機体名管理（コスト+耐久の組み合わせのみ）

---

## 10. 参考資料

- [EXVS2 公式サイト](https://gs.bandainamco-ol.co.jp/exvs2/)
- [EXVS2XB攻略wiki - コストのセオリー](https://wikiwiki.jp/exvs2xb/%E3%82%B3%E3%82%B9%E3%83%88%E3%81%AE%E3%82%BB%E3%82%AA%E3%83%AA%E3%83%BC)
