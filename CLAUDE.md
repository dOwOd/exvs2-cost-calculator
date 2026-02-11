# EXVS2 Cost Calculator

機動戦士ガンダム EXVS2 のコスト計算ツール

## Gitワークフロー

- Issue/機能ごとに必ず `main` から新しいブランチを作成する。`main` に直接コミットしない
- ブランチ命名: `feature/issue-{番号}-{説明}` または `fix/issue-{番号}-{説明}`
- 作業開始前に `git branch --show-current` で正しいブランチにいることを確認する
- PR作成時、変更がfeatureブランチ上にあることを確認する（`main` ではなく）

## 実装アプローチ

- ユーザーがソート順、フィルター、表示変更を要求した場合、記述通りに正確に実装する。既存のコードパターンやドキュメントに基づいて要求を再解釈しない
- ゲームメカニクスや評価ロジックを実装する際は、必ず game-tactics.md と specifications.md を事前に参照する
- ユーザーが要求していないUI要素（トグル、チェックボックス、追加オプション等）を勝手に追加しない

## ドキュメント管理

- 新機能追加や動作変更時は、必ず以下を更新する: specifications.md、CLAUDE.mdのファイル構造マップ、関連する docs/ ファイル

## TypeScript規約

- `as` による型アサーションよりも適切な型ガードを優先する
- 型エラー修正時、ユーザーの明示的な承認なしに型アサーションを使用しない

## トークン効率

- コードベース探索時は、広範な glob/read 操作の前にまずこのドキュメントのファイル構造マップを参照する
- ディレクトリ全体のスキャンよりも、対象を絞ったファイル読み込みを優先する
- Task エージェントで探索する際は、スコープを狭く絞る

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
- **SavedFormationsPanel.tsx** - 保存編成パネル（保存・読込・削除、確認モーダル）
- **ResultPanel.tsx** - 結果パネル（EXフィルター + パターンリスト表示）
  - PatternList.tsx - パターン一覧（全パターンをPatternCardで描画）
    - PatternCard.tsx - 個別パターンカード（ランク・撃墜順・コスト推移テーブル・画像エクスポート）
- CookieConsentBanner.tsx - Cookie同意バナー（広告Cookie同意/拒否）
- ThemeToggle.tsx - ダーク/ライトモード切替
- Tooltip.tsx - ツールチップ
- Footer.tsx - フッター（Cookie設定リセットボタン含む）

### ロジック（src/lib/）
- **calculator.ts** - コスト計算（パターン生成、コスト推移計算、総耐久計算）
- **evaluators.ts** - パターン評価（全パターン評価、統計計算、コメント生成）
- **types.ts** - 型定義（CostType, Formation, EvaluatedPattern, SavedFormation 等）
- useTheme.ts - テーマ管理フック
- useCookieConsent.ts - Cookie同意フック（カスタムイベントでコンポーネント間同期）
- cookieConsent.ts - Cookie同意状態管理（LocalStorage CRUD）
- recentHistory.ts - 最近の編成履歴管理
- savedFormations.ts - 保存編成管理（LocalStorage CRUD、最大10件）
- imageExport.ts - 画像エクスポート（html-to-image によるPNG生成、Web Share共有）

### データ（src/data/）
- **overCostHealthTable.ts** - コストオーバー時の復帰耐久値テーブル
- mobileSuitsData.ts - 機体データ（名前・コスト・耐久値）

### ページ（src/pages/）
- **index.astro** - トップページ（Calculator + 静的SEOコンテンツ + Footer）
- **privacy.astro** - プライバシーポリシーページ

### 設定・静的ファイル
- **astro.config.mjs** - Astro設定（site, integrations: preact + sitemap）
- **public/robots.txt** - クローラー指示（Sitemap URL含む）

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

## エージェントチーム

`.claude/agents/` にカスタムエージェント定義を配置。プロジェクト単位でチームを構成する。

- **lead.md** - チームリーダー（タスク分割・割当、統合・レビュー、Git/PR管理）
- **logic.md** - ゲームロジック＆テスト担当（`src/lib/`, `src/data/`, テストファイル）
- **ui.md** - UIコンポーネント担当（`src/components/`）
- **refactor.md** - DRYリファクタリング担当（重複検出、共通関数切り出し、コンポーネント化）
- **qa.md** - 品質保証担当（テスト網羅性、仕様整合性検証、境界値テスト）

### チーム運用

- チーム名: `exvs2`（プロジェクト固定、Issueごとに作り直さない）
- Issueはタスクとして管理し、同じチーム内で処理する
- セッション開始時に `TeamCreate(team_name: "exvs2")` で起動

## スキル

- `/team` - エージェントチームを起動してIssueに取り組む（例: `/team #42`）
- `/commit` - コミット規約に従ったコミット作成
- `/docs` - セッション中の変更に基づいてドキュメントを更新

## チェックリスト

- [ ] テスト追加/更新 (`pnpm test`)
- [ ] コミット規約に従う
- [ ] PR作成（`Closes #番号`でIssue紐づけ）

## セッション終了時

ドキュメント更新が必要かどうか確認すること（詳細: `.claude/rules/session-update.md`）
