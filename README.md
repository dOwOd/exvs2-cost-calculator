# EXVS2 コスト計算機 v1.0

機動戦士ガンダム EXTREME VS. 2 インフィニットブーストの最適な撃墜順パターンを計算するWebアプリケーション。

## 📋 概要

2機編成（コスト + 耐久値）を選択すると、全16通りの撃墜順パターンを評価し、総耐久最大順でソートして表示します。

### 主な機能

- ✅ 編成選択（コスト: 3000/2500/2000/1500、耐久値: コスト別リスト）
- ✅ 撃墜順パターン自動生成・評価（16通り → 重複排除 → 全パターン表示）
- ✅ 総耐久最大順でソート（リスポーン耐久変動を考慮した真の総耐久値）
- ✅ 最短での敗北時の耐久値表示（片方の機体のみ狙われた場合の最小ダメージ）
- ✅ EXオーバーリミット発動可能フィルター（チェックボックスで絞り込み）
- ✅ コスト推移の視覚的表現
  - **コストバー**: 残コストを横長バーで表示（青/オレンジ/黄/赤で色分け）
  - **EX発動可能状態**: オレンジ色でピンチを警告
  - **状態表示**: 通常/コストオーバー/敗北を視覚的に表現
- ✅ リスポーン時の耐久値変動を考慮した真の総耐久計算
- ✅ EXオーバーリミット発動判定

### v1.0 スコープ外

- バースト機能
- コスト推移グラフ（数値テーブルのみ実装）
- スマートフォン対応

## 🚀 技術スタック

- **フレームワーク**: [Astro](https://astro.build) v5
- **UIライブラリ**: [Preact](https://preactjs.com)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com) v4
- **言語**: TypeScript
- **テスト**: Jest + ts-jest
- **パッケージマネージャー**: [pnpm](https://pnpm.io)
- **開発環境**: Docker

## 🐳 Docker での起動

### 前提条件

- Docker
- Docker Compose

### 開発環境の起動

```bash
# 開発サーバーを起動
docker compose up dev
```

→ http://localhost:4321 でアクセス

### Docker環境でのコマンド実行

```bash
# 依存関係のインストール
docker compose exec dev pnpm install

# テスト実行
docker compose exec dev pnpm test

# シェルに入る
docker compose exec dev sh
```

### コンテナの停止

```bash
docker compose down
```

## 💻 ローカル開発（Docker なし）

### 前提条件

- Node.js 24.x 以上
- pnpm 9.x 以上

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

### コマンド一覧

| コマンド              | 説明                                      |
| :-------------------- | :---------------------------------------- |
| `pnpm install`        | 依存関係をインストール                    |
| `pnpm dev`            | 開発サーバーを起動 (`localhost:4321`)     |
| `pnpm build`          | 本番用にビルド (`./dist/`)                |
| `pnpm preview`        | ビルドしたサイトをプレビュー              |
| `pnpm test`           | テスト実行                                |
| `pnpm test:watch`     | テスト（ウォッチモード）                  |
| `pnpm test:coverage`  | カバレッジ計測                            |

## 📁 プロジェクト構造

```
src/
├── lib/
│   ├── types.ts          # 型定義
│   ├── calculator.ts     # パターン生成・コスト計算
│   └── evaluators.ts     # 評価関数・EX発動判定
├── data/
│   ├── healthData.ts     # コスト別耐久値データ
│   └── overCostHealthTable.ts  # コストオーバー残耐久テーブル
├── components/
│   ├── Calculator.tsx    # メイン（状態管理）
│   ├── FormationPanel.tsx  # 編成選択
│   ├── ResultPanel.tsx   # 結果表示
│   ├── PatternCard.tsx   # パターン詳細
│   └── ...
├── pages/
│   └── index.astro       # トップページ
└── styles/
    └── global.css        # グローバルスタイル
```

## 🎯 重要な仕様

### EXオーバーリミット発動条件

```
残コスト <= min(コストA, コストB)
```

**「自機と僚機のいずれもが撃墜されたら敗北する状況」**になると、チームとして発動可能。

**例:**
- **3000+3000**: 1回撃墜後（残3000 <= 3000）→ ✅ EX発動可
- **3000+2500**: 2回撃墜後（残500 <= 2500）→ ✅ EX発動可
- **1500+1500**: 3回撃墜後（残1500 <= 1500）→ ✅ EX発動可

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
- [EXVS2 公式サイト](https://gs.bandainamco-ol.co.jp/exvs2/)
- [Astro ドキュメント](https://docs.astro.build)
- [Preact ドキュメント](https://preactjs.com)
- [Tailwind CSS ドキュメント](https://tailwindcss.com)
