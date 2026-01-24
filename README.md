# EXVS2 コスト管理計算ツール

機動戦士ガンダム エクストリームバーサス2 インフィニットブーストにおける、最適なコスト管理を支援するWebアプリケーション。

## 📋 概要

編成ごとの効率的な撃墜順を可視化し、プレイヤーの戦略立案をサポートします。

### 主な機能

- ✅ 編成選択（2機のコスト組み合わせ）
- ✅ 撃墜順パターンの自動計算
- ✅ 4つの評価軸での最適パターン表示
  - EXオーバーリミット発動保証
  - 総耐久値最大化
  - コストオーバー回避
  - バランス型
- ✅ コスト推移の可視化

## 🚀 技術スタック

- **フレームワーク**: [Astro](https://astro.build) v5
- **UIライブラリ**: [Preact](https://preactjs.com)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com) v4
- **デプロイ**: Cloudflare Pages（予定）
- **開発環境**: Docker

## 🐳 Docker での起動

### 前提条件

- Docker
- Docker Compose

### 開発環境の起動

```bash
# 開発サーバーを起動（ホットリロード有効）
docker-compose up dev

# バックグラウンドで起動
docker-compose up -d dev
```

アプリケーションは http://localhost:4321 で起動します。

### 本番ビルドの起動

```bash
# イメージをビルドして起動
docker-compose up --build app

# バックグラウンドで起動
docker-compose up -d --build app
```

### コンテナの停止

```bash
# 停止
docker-compose down

# ボリュームも削除して完全にクリーンアップ
docker-compose down -v
```

## 💻 ローカル開発（Docker なし）

### 前提条件

- Node.js 20.x 以上
- npm

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### コマンド一覧

| コマンド              | 説明                                      |
| :-------------------- | :---------------------------------------- |
| `npm install`         | 依存関係をインストール                    |
| `npm run dev`         | 開発サーバーを起動 (`localhost:4321`)     |
| `npm run build`       | 本番用にビルド (`./dist/`)                |
| `npm run preview`     | ビルドしたサイトをプレビュー              |
| `npm run astro ...`   | Astro CLI コマンドを実行                  |

## 📁 プロジェクト構造

```
/
├── public/              # 静的ファイル
├── src/
│   ├── components/      # Preactコンポーネント
│   ├── layouts/         # レイアウトコンポーネント
│   ├── pages/           # ページ（ルーティング）
│   ├── styles/          # グローバルスタイル
│   └── utils/           # ユーティリティ関数
├── Dockerfile           # 本番用Dockerイメージ
├── docker-compose.yml   # Docker Compose設定
└── package.json
```

## 🎨 開発ガイドライン

### コンポーネント作成

Preactコンポーネントは `src/components/` に配置します。

```tsx
// src/components/Button.tsx
interface Props {
  label: string;
  onClick?: () => void;
}

export default function Button({ label, onClick }: Props) {
  return (
    <button onClick={onClick} class="px-4 py-2 bg-blue-600 text-white rounded">
      {label}
    </button>
  );
}
```

### スタイリング

Tailwind CSS v4を使用しています。

```tsx
<div class="flex items-center justify-center min-h-screen bg-gray-900">
  <h1 class="text-4xl font-bold text-white">EXVS2 Calculator</h1>
</div>
```

## 📝 設計ドキュメント

詳細な設計ドキュメントは[構想リポジトリ](https://github.com/[username]/ideas/tree/main/active/exvs2-cost-calculator)を参照してください。

- [コスト計算ロジック設計](https://github.com/[username]/ideas/blob/main/active/exvs2-cost-calculator/design/cost-calculation-logic.md)
- [UIワイヤーフレーム](https://github.com/[username]/ideas/blob/main/active/exvs2-cost-calculator/design/ui-wireframe.md)
- [技術選定記録](https://github.com/[username]/ideas/blob/main/active/exvs2-cost-calculator/decisions/ADR-001-frontend-framework.md)

## 🤝 コントリビューション

このプロジェクトは現在個人開発中です。

## 📄 ライセンス

MIT

## 🔗 関連リンク

- [EXVS2 公式サイト](https://www.bandainamco-am.co.jp/am/vg/EXVS2/)
- [Astro ドキュメント](https://docs.astro.build)
- [Preact ドキュメント](https://preactjs.com)
- [Tailwind CSS ドキュメント](https://tailwindcss.com)
