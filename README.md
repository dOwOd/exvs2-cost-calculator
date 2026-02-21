# EXVS2 コスト計算機

機動戦士ガンダム EXVS2 の最適な撃墜順パターンを計算するWebアプリケーション。

## 📋 概要

2機編成（コスト + 耐久値）を選択すると、撃墜順パターンを自動生成・評価し、総耐久最大順でソートして表示します。

### 主な機能

- 編成選択（コスト: 3000/2500/2000/1500、耐久値: 機体名検索で選択）
- 撃墜順パターン自動生成・評価（敗北までの全パターン、重複排除）
- 総耐久最大順でソート（リスポーン耐久変動を考慮した真の総耐久値）
- 最短での敗北時の耐久値表示（片方の機体のみ狙われた場合の最小ダメージ）
- EXオーバーリミット発動可能フィルター
- コスト推移の視覚的表現（コストバー: 赤/オレンジ/黄/青で色分け）
- 編成の保存・読み込み・比較（最大3編成の横並び比較）
- 機体名検索・お気に入り機能
- URL共有・SNSシェア（Twitter/X、LINE、Web Share API）
- 画像エクスポート（パターンカードのPNG出力）
- ダークモード対応
- レスポンシブ対応
- PWA対応（オフライン動作可能、ホーム画面に追加可能）

### コンテンツページ

- [コスト管理ガイド](/guide) - 撃墜順・コストオーバーの基本解説
- [よくある質問](/faq) - FAQ（JSON-LD対応）
- [プライバシーポリシー](/privacy)

## 🚀 技術スタック

- **フレームワーク**: [Astro](https://astro.build) v5
- **UIライブラリ**: [Preact](https://preactjs.com)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com) v4
- **言語**: TypeScript
- **テスト**: [Vitest](https://vitest.dev)（ユニットテスト）、[Playwright](https://playwright.dev)（E2Eテスト）
- **UIカタログ**: [Storybook](https://storybook.js.org)
- **コード品質**: ESLint + Prettier（Husky + lint-staged でpre-commit実行）
- **パッケージマネージャー**: [pnpm](https://pnpm.io)

## 💻 開発

### 前提条件

- Node.js（バージョンは `.node-version` を参照）
- pnpm 9.x 以上

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

### コマンド一覧

| コマンド               | 説明                                      |
| :--------------------- | :---------------------------------------- |
| `pnpm dev`             | 開発サーバーを起動 (`localhost:4321`)     |
| `pnpm build`           | 本番用にビルド (`./dist/`)                |
| `pnpm preview`         | ビルドしたサイトをプレビュー              |
| `pnpm test`            | ユニットテスト実行（Vitest）              |
| `pnpm test:watch`      | ユニットテスト（ウォッチモード）          |
| `pnpm test:coverage`   | カバレッジ計測                            |
| `pnpm test:e2e`        | E2Eテスト実行（Playwright）               |
| `pnpm test:e2e:ui`     | E2EテストUIモードで実行                   |
| `pnpm test:e2e:headed` | E2Eテストヘッドモードで実行（デバッグ用） |
| `pnpm lint`            | ESLint実行                                |
| `pnpm lint:fix`        | ESLint自動修正                            |
| `pnpm format`          | Prettierフォーマット適用                  |
| `pnpm format:check`    | フォーマット差分チェック                  |
| `pnpm storybook`       | Storybookを起動 (`localhost:6006`)        |
| `pnpm build-storybook` | Storybookをビルド                         |

## 📁 プロジェクト構造

```
src/
├── components/
│   ├── Calculator.tsx          # メイン（状態管理、通常/比較モード切替）
│   ├── FormationPanel.tsx      # 編成パネル（A機/B機のコスト・耐久選択）
│   ├── CostSelector.tsx        # コスト選択（1500/2000/2500/3000）
│   ├── HealthSelector.tsx      # 耐久値選択
│   ├── HealthDropdownPopup.tsx # 耐久値ドロップダウン
│   ├── MobileSuitSearch.tsx    # 機体名検索（お気に入り機能付き）
│   ├── SavedFormationsPanel.tsx # 保存編成パネル
│   ├── ComparisonResultPanel.tsx # 編成比較結果パネル
│   ├── ResultPanel.tsx         # 結果パネル（フィルター + パターンリスト）
│   ├── PatternList.tsx         # パターン一覧
│   ├── PatternCard.tsx         # 個別パターンカード
│   ├── ShareButtons.tsx        # SNSシェアボタン
│   ├── ErrorBoundary.tsx       # エラーバウンダリ
│   ├── Header.astro            # サイト共通ヘッダー
│   ├── Footer.tsx              # フッター
│   ├── ThemeToggle.tsx         # ダーク/ライトモード切替
│   ├── Tooltip.tsx             # ツールチップ
│   └── CookieConsentBanner.tsx # Cookie同意バナー
├── lib/
│   ├── types.ts                # 型定義
│   ├── calculator.ts           # パターン生成・コスト計算
│   ├── evaluators.ts           # 評価関数・EX発動判定
│   ├── useFormationEvaluation.ts # 編成評価フック
│   ├── useTheme.ts             # テーマ管理フック
│   ├── useCookieConsent.ts     # Cookie同意フック
│   ├── urlSharing.ts           # URL共有
│   ├── imageExport.ts          # 画像エクスポート
│   ├── savedFormations.ts      # 保存編成管理
│   ├── favoriteSuits.ts        # お気に入り機体管理
│   ├── recentHistory.ts        # 最近の編成履歴管理
│   └── cookieConsent.ts        # Cookie同意状態管理
├── data/
│   ├── mobileSuitsData.ts      # 機体データ（名前・コスト・耐久値）
│   ├── faqs.ts                 # FAQデータ
│   └── overCostHealthTable.ts  # コストオーバー残耐久テーブル
├── pages/
│   ├── index.astro             # トップページ
│   ├── guide.astro             # コスト管理ガイド
│   ├── faq.astro               # よくある質問
│   └── privacy.astro           # プライバシーポリシー
├── layouts/
│   └── BaseLayout.astro        # 共通レイアウト
└── styles/
    └── global.css              # グローバルスタイル
```

## 🎯 重要な仕様

### EXオーバーリミット発動条件

```
残コスト <= min(コストA, コストB)
```

**「自機と僚機のいずれもが撃墜されたら敗北する状況」**になると、チームとして発動可能。

**例:**

- **3000+3000**: 1回撃墜後（残3000 <= 3000）→ EX発動可
- **3000+2500**: 2回撃墜後（残500 <= 2500）→ EX発動可
- **1500+1500**: 3回撃墜後（残1500 <= 1500）→ EX発動可

### コスト管理

- **初期コスト**: 6000（チーム共有、A/B別管理ではない）
- **撃墜時**: 残りコストから機体コストを減算
- **残コスト <= 0**: 敗北（試合終了）
- **コストオーバー**（残コスト < 機体コスト）: リスポーン耐久値が低下

### リスポーン耐久値

残コストに応じて変動（ゲーム内固定テーブル）:

- **残コスト >= 機体コスト**: 初期耐久で復活
- **残コスト < 機体コスト**: テーブル値で復活（コストオーバー）
- **残コスト <= 0**: 敗北（復活なし）

詳細: `src/data/overCostHealthTable.ts`

### 総耐久計算

```
総耐久 = 初期耐久A + 初期耐久B + リスポーン耐久の合計
```

リスポーン時の耐久変動を考慮した**真の総耐久値**を計算。

## 📝 開発ルール

開発時のルールは [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

- コミット規約
- テスト駆動開発（TDD）
- コードレビュー基準

詳細仕様は [docs/SPECIFICATION.md](./docs/SPECIFICATION.md) を参照。

## 📄 ライセンス

MIT

## 🔗 関連リンク

- [リポジトリ](https://github.com/dOwOd/exvs2-cost-calculator)
- [機動戦士ガンダム エクストリームバーサス２ インフィニットブースト 公式サイト【アーケード】](https://gundam-vs.jp/extreme/ac2ib/)
- [Astro ドキュメント](https://docs.astro.build)
- [Preact ドキュメント](https://preactjs.com)
- [Tailwind CSS ドキュメント](https://tailwindcss.com)
