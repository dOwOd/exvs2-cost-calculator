# EXVS2 Cost Calculator

機動戦士ガンダム EXVS2 XB のコスト計算ツール

## 開発コマンド

```bash
pnpm install && pnpm dev   # 開発開始
pnpm test                  # テスト実行
```

## ファイル構造

### コンポーネント（src/components/）
- **Calculator.tsx** - メインコンポーネント（状態管理、編成→計算→結果の統括）
- **FormationPanel.tsx** - 編成パネル（A機/B機のコスト・耐久選択）
  - CostSelector.tsx - コスト選択（1500/2000/2500/3000）
  - HealthSelector.tsx - 耐久値選択
  - HealthDropdownPopup.tsx - 耐久値ドロップダウン
  - MobileSuitSearch.tsx - 機体名検索
- **ResultPanel.tsx** - 結果パネル（EXフィルター + パターンリスト表示）
  - PatternList.tsx - パターン一覧（全パターンをPatternCardで描画）
    - PatternCard.tsx - 個別パターンカード（ランク・撃墜順・コスト推移テーブル）
- ThemeToggle.tsx - ダーク/ライトモード切替
- Tooltip.tsx - ツールチップ
- Footer.tsx - フッター

### ロジック（src/lib/）
- **calculator.ts** - コスト計算（パターン生成、コスト推移計算、総耐久計算）
- **evaluators.ts** - パターン評価（全パターン評価、統計計算、コメント生成）
- **types.ts** - 型定義（CostType, Formation, EvaluatedPattern 等）
- useTheme.ts - テーマ管理フック
- recentHistory.ts - 最近の編成履歴管理

### データ（src/data/）
- **overCostHealthTable.ts** - コストオーバー時の復帰耐久値テーブル
- mobileSuitsData.ts - 機体データ（名前・コスト・耐久値）

## データフロー

```
FormationPanel（編成入力）
  ↓ Formation { unitA, unitB }
Calculator（状態管理）
  ↓ evaluateAllPatterns(formation) → EvaluatedPattern[]
ResultPanel（フィルター）
  ↓ フィルタリング済み EvaluatedPattern[]
PatternList → PatternCard（各パターン表示）
```

## ルール

詳細は `.claude/rules/` を参照（対象ファイル編集時に自動読み込み）

- **開発**: development.md（src/**/* 編集時）
- **ゲーム仕様**: specifications.md（src/lib/**/*.ts 編集時）
- **UI実装**: ui-patterns.md（src/components/**/*.tsx 編集時）
- **よくある間違い**: common-mistakes.md
- **Git操作**: git-workflow.md（Git コマンド実行時）
- **ゲーム戦術**: game-tactics.md（パターン評価・コメント生成時）

詳細仕様: `docs/SPECIFICATION.md`
戦術知識: `docs/GAME_KNOWLEDGE.md`

## スキル

- `/commit` - コミット規約に従ったコミット作成

## チェックリスト

- [ ] テスト追加/更新 (`pnpm test`)
- [ ] コミット規約に従う
- [ ] PR作成（`Closes #番号`でIssue紐づけ）

## セッション終了時

ドキュメント更新が必要かどうか確認すること（詳細: `.claude/rules/session-update.md`）
