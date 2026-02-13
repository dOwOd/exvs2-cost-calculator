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
pnpm lint                  # ESLint実行
pnpm lint:fix              # ESLint自動修正
pnpm format                # Prettierフォーマット適用
pnpm format:check          # フォーマット差分チェック
pnpm test                  # ユニットテスト実行（Vitest）←コミット前に必須
pnpm build && pnpm test:e2e # E2Eテスト実行（Playwright）
pnpm build                 # 本番ビルド
pnpm storybook             # Storybook起動
```

### git worktreeで並行開発

複数のIssueを並行して開発する場合に利用。詳細は `.claude/rules/git-workflow.md` を参照。

```bash
git worktree add ../exvs2-worktree "$(git branch --show-current)"
# メイン側で別ブランチに切り替えて次の開発...
git worktree remove ../exvs2-worktree  # 後片付け
```

## ファイル構造

### コンポーネント（src/components/）

- **Header.astro** - サイト共通ヘッダー（ロゴ、ナビリンク、ThemeToggle統合、現在ページハイライト）
- **ErrorBoundary.tsx** - エラーバウンダリ（Preact class component、フォールバックUI表示）
- **Calculator.tsx** - メインコンポーネント（状態管理、通常/比較モード切替、編成→計算→結果の統括、ErrorBoundaryでラップ）
- **FormationPanel.tsx** - 編成パネル（A機/B機のコスト・耐久選択）
  - CostSelector.tsx - コスト選択（1500/2000/2500/3000）
  - HealthSelector.tsx - 耐久値選択
  - HealthDropdownPopup.tsx - 耐久値ドロップダウン
  - MobileSuitSearch.tsx - 機体名検索
- **SavedFormationsPanel.tsx** - 保存編成パネル（保存・読込・削除、確認モーダル）
- **ComparisonResultPanel.tsx** - 編成比較結果パネル（最大3編成の横並び比較、比較指標テーブル）
- **ResultPanel.tsx** - 結果パネル（EXフィルター + パターンリスト表示）
  - PatternList.tsx - パターン一覧（全パターンをPatternCardで描画）
    - PatternCard.tsx - 個別パターンカード（ランク・撃墜順・コスト推移テーブル・画像エクスポート・SNSシェア）
- **ShareButtons.tsx** - SNSシェアボタン（Twitter/X・LINE・Web Share API）
- CookieConsentBanner.tsx - Cookie同意バナー（広告Cookie同意/拒否）
- ThemeToggle.tsx - ダーク/ライトモード切替
- Tooltip.tsx - ツールチップ
- Footer.tsx - フッター（Cookie設定リセットボタン含む）

### ロジック（src/lib/）

- **calculator.ts** - コスト計算（パターン生成、コスト推移計算、総耐久計算）
- **evaluators.ts** - パターン評価（全パターン評価、統計計算、コメント生成、比較指標計算）
- **types.ts** - 型定義（CostType, Formation, EvaluatedPattern, ComparisonMetrics, SavedFormation 等）
- useFormationEvaluation.ts - 編成評価フック（編成→評価パターン・最短敗北耐久を算出）
- useTheme.ts - テーマ管理フック
- useCookieConsent.ts - Cookie同意フック（カスタムイベントでコンポーネント間同期）
- cookieConsent.ts - Cookie同意状態管理（LocalStorage CRUD）
- recentHistory.ts - 最近の編成履歴管理
- savedFormations.ts - 保存編成管理（LocalStorage CRUD、最大10件）
- imageExport.ts - 画像エクスポート（html-to-image によるPNG生成、Web Share共有）

### データ（src/data/）

- **overCostHealthTable.ts** - コストオーバー時の復帰耐久値テーブル
- mobileSuitsData.ts - 機体データ（名前・コスト・耐久値）
- faqs.ts - FAQデータ（カテゴリ別グルーピング、型定義、ヘルパー関数）

### レイアウト（src/layouts/）

- **BaseLayout.astro** - 共通レイアウト（head共通要素、OGP、テーマ初期化、named slot `head` で拡張可能）

### ページ（src/pages/）

- **index.astro** - トップページ（Calculator + 静的SEOコンテンツ + Footer + WebApplication JSON-LD）
- **guide.astro** - コスト管理ガイドページ（BreadcrumbList JSON-LD）
- **faq.astro** - よくある質問ページ（FAQPage + BreadcrumbList JSON-LD）
- **privacy.astro** - プライバシーポリシーページ（BreadcrumbList JSON-LD）

> **注意**: 新しいページを追加した場合は、BaseLayout を使用し、JSON-LD 構造化データの追加・更新も検討すること

### スクリプト（scripts/）

- **generate-ogp.mjs** - OGP画像生成（satori + @resvg/resvg-js、`node scripts/generate-ogp.mjs` で実行）

### 設定・静的ファイル

- **astro.config.mjs** - Astro設定（site, integrations: preact + sitemap）
- **eslint.config.js** - ESLint設定（flat config、TypeScript + Astro + Prettier連携）
- **.prettierrc** - Prettier設定（セミコロン、シングルクォート、100文字幅）
- **.husky/pre-commit** - pre-commitフック（lint-staged実行）
- **.node-version** - Node.js バージョン一元管理（CI・Docker・ローカル共通）
- **public/robots.txt** - クローラー指示（Sitemap URL含む）
- **public/ogp.png** - OGP画像（1200x630px、generate-ogp.mjsで生成）

### CI/CD（.github/workflows/）

- **ci.yml** - ユニットテスト（Vitest）・型チェック・ビルド検証（Node: `.node-version` 参照）
- **e2e.yml** - E2Eテスト（Playwright、非WebKit統合+WebKit個別の4並列、ブラウザキャッシュ付き、Node: `.node-version` 参照）
- **storybook.yml** - Storybookビルド（Node: `.node-version` 参照）

> **注意**: Node.js バージョンは `.node-version` で一元管理。ワークフローでは `node-version-file: '.node-version'` を使用すること

### Docker

- **Dockerfile** - マルチステージビルド（Node: ARG NODE_MAJOR、非rootユーザー）
- **docker-compose.yml** - app（本番）/ dev（開発）の2サービス構成

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

- **開発**: development.md（src/\*_/_ 編集時）
- **ゲーム仕様**: specifications.md（src/lib/\*_/_.ts 編集時）
- **UI実装**: ui-patterns.md（src/components/\*_/_.tsx 編集時）
- **よくある間違い**: common-mistakes.md
- **Git操作**: git-workflow.md（Git コマンド実行時）
- **ゲーム戦術**: game-tactics.md（パターン評価・コメント生成時）

詳細仕様: `docs/SPECIFICATION.md`
戦術知識: `docs/GAME_KNOWLEDGE.md`

## エージェントチーム

`.claude/agents/` にカスタムエージェント定義を配置。プロジェクト単位でチームを構成する。

- **lead.md** - チームリーダー（タスク分割・割当、統合・レビュー、Git/PR管理、CI/CD設定）
- **logic.md** - ゲームロジック＆テスト担当（`src/lib/`, `src/data/`, テストファイル）
- **ui.md** - UIコンポーネント担当（`src/components/`）
- **pages.md** - ページ＆SEO担当（`src/pages/`, `src/layouts/`, JSON-LD, OGP, 内部リンク, コンテンツ執筆）
- **refactor.md** - DRYリファクタリング担当（重複検出、共通関数切り出し、コンポーネント化）
- **qa.md** - 品質保証担当（ユニットテスト、E2Eテスト、Lighthouse、仕様整合性検証）

### チーム運用

- チーム名: `exvs2`（プロジェクト固定、Issueごとに作り直さない）
- Issueはタスクとして管理し、同じチーム内で処理する
- セッション開始時に `TeamCreate(team_name: "exvs2")` で起動

## スキル

- `/team` - エージェントチームを起動してIssueに取り組む（例: `/team #42`）
- `/commit` - コミット規約に従ったコミット作成
- `/docs` - セッション中の変更に基づいてドキュメントを更新

## チェックリスト

- [ ] ESLintエラーなし (`pnpm lint`)←コミット前
- [ ] ユニットテスト追加/更新 (`pnpm test`)←コミット前
- [ ] コミット規約に従う
- [ ] PR作成（`Closes #番号`でIssue紐づけ）

## CI/CD・自動化ロードマップ

持続的な品質維持のため、以下の自動化を段階的に導入予定:

```
#90 CIパイプライン強化（ユニットテスト・型チェック・ビルド検証）
 ↓
#89 Renovate導入 + Claude Codeによる依存関係PRレビュー自動化
 ↓
#94 Pre-commitフック（Husky + lint-staged + ESLint + Prettier）
 ↓
#91 Lighthouse CI（定期品質監査: SEO・パフォーマンス・アクセシビリティ）
 ↓
#92 Claude Code開発体験の改善（ルール・メモリ・エージェント最適化）
 ↓
#93 Issueテンプレート・ラベル自動化
 ↓
#95 機体データ鮮度チェック（定期リマインダー）
```

### 現状

- **CI**: ユニットテスト（Vitest）、型チェック（tsc）、ビルド検証、E2Eテスト（Playwright、PRはnon-webkitのみ）、Storybookビルド（PRのみ）
- **ローカル品質ゲート**: ESLint + Prettier（Husky + lint-staged でpre-commitフック実行）
- **最適化**: concurrency（連続プッシュ時の自動キャンセル）、paths-ignore
- **未導入**: 依存関係自動更新、Lighthouse

## ドキュメント更新確認

以下のタイミングでドキュメント更新が必要かどうか確認すること（詳細: `.claude/rules/session-update.md`）:

- **セッション終了時**
- **PR作成時**
